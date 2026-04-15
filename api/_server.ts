import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { Board, RNG, createEmptyGrid, isGameOver, moveBoard, spawnTile } from '../src/lib/engine.js';
import { GameMode, SabotageType } from '../src/types.js';
import { PrismaClient } from '@prisma/client';
import "dotenv/config";
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

let prisma: PrismaClient;

function getPrisma() {
  if (!prisma) {
    const pool = new pg.Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -- Setup --
const app = express();
export { app }; 

app.use(express.json());
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const PORT = Number(process.env.PORT) || 3000;

// -- State Management --
interface PlayerState {
  socketId: string;
  userId: string; // From database
  name: string;
  avatar: string;
  board: Board;
  score: number;
  highestTile: number;
  milestonesSeen: Set<number>;
  sabotages: SabotageType[];
  isEliminated: boolean;
  isReady: boolean;
  elo: number;
}

interface RoomState {
  id: string;
  mode: GameMode;
  targetTile?: number; // for race mode
  players: Map<string, PlayerState>;
  status: 'lobby' | 'countdown' | 'active' | 'ended';
  startedAt?: number;
  endsAt?: number;
  seed?: number;
  timeout?: NodeJS.Timeout;
}

const rooms = new Map<string, RoomState>();
const playerToRoom = new Map<string, string>(); // socketId -> roomId

const SABOTAGE_MILESTONES: Record<number, SabotageType> = {
  128: 'tile_bomb',
  256: 'junk_row',
  512: 'board_shuffle',
  1024: 'freeze',
  2048: 'blind'
};

// ELO logic stub
function calculateElo(playerElo: number, opponentElos: number[], rank: number, totalPlayers: number) {
  if (totalPlayers <= 1) return { newElo: playerElo, delta: 0 };
  const K = 32;
  // Fallback if no opponents (shouldn't happen with totalPlayers > 1)
  const avgOpponentElo = opponentElos.length ? opponentElos.reduce((a, b) => a + b, 0) / opponentElos.length : playerElo;
  const expected = 1 / (1 + Math.pow(10, (avgOpponentElo - playerElo) / 400));
  const actual = 1 - (rank - 1) / (totalPlayers - 1);
  const delta = Math.round(K * (actual - expected));
  return { newElo: playerElo + delta, delta };
}

// Utilities
function emitLobbyUpdate(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;
  const playersList = Array.from(room.players.values()).map(p => ({
    id: p.socketId,
    name: p.name,
    avatar: p.avatar,
    status: p.isReady ? 'ready' : (room.status === 'lobby' ? 'searching' : (p.isEliminated ? 'finished' : 'playing')),
    score: p.score,
    highestTile: p.highestTile,
    elo: p.elo
  }));
  io.to(roomId).emit('lobby_update', playersList);
}

function broadcastOpponentUpdate(roomId: string, socketId: string) {
  const room = rooms.get(roomId);
  const p = room?.players.get(socketId);
  if (!room || !p) return;
  io.to(roomId).emit('opponent_update', {
    userId: p.socketId,
    board: p.board,
    score: p.score,
    highestTile: p.highestTile
  });
}

async function endGame(roomId: string) {
  const room = rooms.get(roomId);
  if (!room || room.status === 'ended') return;

  room.status = 'ended';
  if (room.timeout) clearTimeout(room.timeout);

  // Rank players
  let playersList = Array.from(room.players.values());

  if (room.mode === 'race') {
    playersList.sort((a, b) => {
      const target = room.targetTile || 2048;
      const aWon = a.highestTile >= target;
      const bWon = b.highestTile >= target;
      if (aWon && !bWon) return -1;
      if (bWon && !aWon) return 1;
      if (a.highestTile !== b.highestTile) return b.highestTile - a.highestTile;
      return b.score - a.score;
    });
  } else {
    playersList.sort((a, b) => b.score - a.score);
  }

  const results = playersList.map((p, i) => {
    const oppElos = playersList.filter(op => op.socketId !== p.socketId).map(op => op.elo);
    const eloInfo = calculateElo(p.elo, oppElos, i + 1, playersList.length);

    return {
      userId: p.userId, // Real DB ID
      socketId: p.socketId,
      name: p.name,
      rank: i + 1,
      score: p.score,
      highestTile: p.highestTile,
      eloDelta: eloInfo.delta,
      newElo: eloInfo.newElo
    };
  });

  io.to(roomId).emit('match_end', { results: results.map(r => ({ ...r, userId: r.socketId })) });

  // --- Prisma DB Update ---
  try {
    await getPrisma().$transaction(async (tx) => {
      const match = await tx.match.create({
        data: {
          mode: room.mode,
          startedAt: new Date(room.startedAt || Date.now()),
          endedAt: new Date(),
          winnerId: results.length > 0 ? results[0].userId : null
        }
      });

      for (const res of results) {
        // Create match player record
        await tx.matchPlayer.create({
          data: {
            matchId: match.id,
            userId: res.userId,
            score: res.score,
            highestTile: res.highestTile,
            rank: res.rank,
            eloDelta: res.eloDelta
          }
        });

        // Update user stats
        await tx.user.update({
          where: { id: res.userId },
          data: {
            elo: res.newElo,
            totalScore: { increment: res.score },
            matchesPlayed: { increment: 1 },
            matchesWon: { increment: res.rank === 1 ? 1 : 0 },
            cyberBits: { increment: Math.floor(res.score / 100) }
          }
        });
      }
    });
    console.log(`Match ${roomId} saved to DB.`);
  } catch (error) {
    console.error("Failed to save match to DB:", error);
  }
}

// -- Sabotage implementations --
function applyJunkRow(board: Board): Board {
  const newBoard = board.slice(1);
  const junkRow = [0, 0, 0, 0];
  const slots = [0, 1, 2, 3].sort(() => 0.5 - Math.random()).slice(0, 2);
  slots.forEach(s => junkRow[s] = Math.random() > 0.5 ? 4 : 2);
  newBoard.push(junkRow);
  return newBoard;
}

function applyBoardShuffle(board: Board): Board {
  const newBoard = createEmptyGrid();
  const tiles = board.flat().filter(v => v > 0);
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  let i = 0;
  const allPos = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) allPos.push([r, c]);
  allPos.sort(() => 0.5 - Math.random());

  for (const t of tiles) {
    const [r, c] = allPos[i++];
    newBoard[r][c] = t;
  }
  return newBoard;
}

function applyTileBomb(board: Board): Board {
  const newBoard = board.map(row => [...row]);
  const corners = [[0, 0], [0, 3], [3, 0], [3, 3]];
  const emptyCorners = corners.filter(([r, c]) => newBoard[r][c] === 0);
  if (emptyCorners.length > 0) {
    const [r, c] = emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
    newBoard[r][c] = 2; // worst corner
  } else {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (newBoard[r][c] === 0) emptyCells.push([r, c]);
    if (emptyCells.length > 0) {
      const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      newBoard[r][c] = 2;
    }
  }
  return newBoard;
}


io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_lobby', async ({ mode, name, avatar, userId, isPrivate, roomCode, targetTile }) => {
    // --- Sync User to DB ---
    let dbUser;
    try {
      dbUser = await getPrisma().user.upsert({
        where: { id: userId },
        update: { fullName: name, avatarUrl: avatar },
        create: { id: userId, fullName: name, avatarUrl: avatar, elo: 1000 }
      });
    } catch (e) {
      console.error(e);
      return;
    }

    let roomId = roomCode;

    if (!roomId) {
      const openRooms = Array.from(rooms.values()).filter(r => r.mode === mode && r.status === 'lobby' && !isPrivate);
      if (openRooms.length > 0) roomId = openRooms[0].id;
      else roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        mode: mode || 'score_attack',
        targetTile: targetTile,
        players: new Map(),
        status: 'lobby'
      });
    }

    const room = rooms.get(roomId)!;

    room.players.set(socket.id, {
      socketId: socket.id,
      userId: dbUser.id,
      name: dbUser.fullName || name || `PLAYER_${socket.id.slice(0, 4)}`,
      avatar: dbUser.avatarUrl || avatar || '',
      board: createEmptyGrid(),
      score: 0,
      highestTile: 0,
      milestonesSeen: new Set(),
      sabotages: [],
      isEliminated: false,
      isReady: false,
      elo: dbUser.elo
    });

    playerToRoom.set(socket.id, roomId);
    socket.join(roomId);

    emitLobbyUpdate(roomId);
    socket.emit('joined_room', { roomId, mode: room.mode });
  });

  socket.on('player_ready', () => {
    const roomId = playerToRoom.get(socket.id);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room) return;
    const player = room.players.get(socket.id);
    if (player) player.isReady = true;

    emitLobbyUpdate(roomId);

    // check if all ready and >= 1 player (or 2 for real play)
    const allReady = Array.from(room.players.values()).every(p => p.isReady);
    if (allReady && room.players.size > 0) {
      room.status = 'countdown';

      let countdown = 3;
      io.to(roomId).emit('countdown', { secondsLeft: countdown });

      const interval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          io.to(roomId).emit('countdown', { secondsLeft: countdown });
        } else {
          clearInterval(interval);
          startMatch(roomId);
        }
      }, 1000);
    }
  });

  function startMatch(roomId: string) {
    const room = rooms.get(roomId);
    if (!room) return;
    room.status = 'active';
    room.startedAt = Date.now();

    const seed = room.mode === 'daily' ? Math.floor(Date.now() / 86400000) : undefined;
    room.seed = seed;

    const rng = seed ? new RNG(seed) : undefined;

    for (const player of room.players.values()) {
      let b = createEmptyGrid();
      b = spawnTile(spawnTile(b, rng), rng);
      player.board = b;
    }

    if (room.mode === 'score_attack' || room.mode === 'daily') {
      room.endsAt = Date.now() + 3 * 60 * 1000;
      room.timeout = setTimeout(() => endGame(roomId), 3 * 60 * 1000);
    } else {
      room.timeout = setTimeout(() => endGame(roomId), 10 * 60 * 1000);
    }

    io.to(roomId).emit('match_start', {
      roomId, mode: room.mode, seed: room.seed,
      endsAt: room.endsAt, targetTile: room.targetTile
    });

    for (const [sId, p] of room.players.entries()) {
      io.sockets.sockets.get(sId)?.emit('move_result', { board: p.board, score: p.score, newTile: null, moved: true });
      broadcastOpponentUpdate(roomId, sId);
    }
    emitLobbyUpdate(roomId);
  }

  socket.on('move', ({ direction }) => {
    const roomId = playerToRoom.get(socket.id);
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || room.status !== 'active') return;
    const player = room.players.get(socket.id);
    if (!player || player.isEliminated) return;

    try {
      const rng = room.seed ? new RNG(room.seed + player.score) : undefined;
      const result = moveBoard(player.board, direction);

      if (!result.merged) {
        socket.emit('move_result', { board: player.board, score: player.score, newTile: null, moved: false });
        return;
      }

      player.score += result.score;
      player.board = spawnTile(result.grid, rng);

      let max = 0;
      player.board.forEach(r => r.forEach(c => { if (c > max) max = c; }));
      player.highestTile = max;

      socket.emit('move_result', { board: player.board, score: player.score, newTile: null, moved: true });
      broadcastOpponentUpdate(roomId, socket.id);

      for (const [milestone, saboType] of Object.entries(SABOTAGE_MILESTONES)) {
        const m = parseInt(milestone);
        if (player.highestTile >= m && !player.milestonesSeen.has(m)) {
          player.milestonesSeen.add(m);
          player.sabotages.push(saboType);
          socket.emit('sabotage_earned', { sabotageType: saboType });
        }
      }

      if (room.mode === 'race' && room.targetTile && player.highestTile >= room.targetTile) {
        endGame(roomId);
      } else if (isGameOver(player.board)) {
        player.isEliminated = true;
        io.to(roomId).emit('player_eliminated', { userId: socket.id });

        if (room.mode === 'survival') {
          const activeCount = Array.from(room.players.values()).filter(p => !p.isEliminated).length;
          if (activeCount <= 1) {
            endGame(roomId);
          }
        } else if (room.mode === 'race') {
          const activeCount = Array.from(room.players.values()).filter(p => !p.isEliminated).length;
          if (activeCount === 0) endGame(roomId);
        }
      }

    } catch (e) {
      console.error(e);
    }
  });

  socket.on('use_sabotage', ({ sabotageType, targetUserId }) => {
    const roomId = playerToRoom.get(socket.id);
    if (!roomId) return;
    const room = rooms.get(roomId);
    const attacker = room?.players.get(socket.id);
    const target = room?.players.get(targetUserId);

    if (!room || !attacker || !target || room.status !== 'active') return;

    const idx = attacker.sabotages.indexOf(sabotageType);
    if (idx > -1) {
      attacker.sabotages.splice(idx, 1);
    }

    try {
      io.to(targetUserId).emit('sabotage_incoming', { sabotageType, fromUserId: socket.id });
      io.to(roomId).emit('arena_log', {
        from: attacker.name,
        target: target.name,
        type: sabotageType,
        timestamp: Date.now()
      });

      if (sabotageType === 'freeze') {
        const duration = 3000;
        io.to(targetUserId).emit('freeze_start', { duration });
      } else if (sabotageType === 'blind') {
        const duration = 5000;
        io.to(targetUserId).emit('blind_start', { duration });
      } else {
        if (sabotageType === 'junk_row') target.board = applyJunkRow(target.board);
        else if (sabotageType === 'board_shuffle') target.board = applyBoardShuffle(target.board);
        else if (sabotageType === 'tile_bomb') target.board = applyTileBomb(target.board);

        io.to(targetUserId).emit('board_mutated', { board: target.board });
        broadcastOpponentUpdate(roomId, targetUserId);
      }
    } catch (e) { console.error(e); }
  });

  socket.on('leave_room', () => {
    const roomId = playerToRoom.get(socket.id);
    if (roomId) {
      const room = rooms.get(roomId);
      room?.players.delete(socket.id);
      emitLobbyUpdate(roomId);

      if (room?.players.size === 0) rooms.delete(roomId);
      else if (room?.status === 'active' && room.mode === 'survival') {
        const activeCount = Array.from(room.players.values()).filter(p => !p.isEliminated).length;
        if (activeCount <= 1) endGame(roomId);
      }

      playerToRoom.delete(socket.id);
    }
  });

  socket.on('disconnect', () => {
    const roomId = playerToRoom.get(socket.id);
    if (roomId) {
      const room = rooms.get(roomId);
      room?.players.delete(socket.id);
      emitLobbyUpdate(roomId);
      if (room?.players.size === 0) rooms.delete(roomId);
    }
    playerToRoom.delete(socket.id);
    console.log('User disconnected:', socket.id);
  });
});

// --- API Endpoints ---
app.get('/api/me', async (req, res) => {
  const userId = req.headers['authorization']?.replace('Bearer ', '');
  if (!userId) return res.status(401).json({ error: 'Auth required' });

  try {
    const user = await getPrisma().user.findUnique({
      where: { id: userId },
      include: {
        matchPlayers: {
          take: 5,
          orderBy: { match: { endedAt: 'desc' } },
          include: { match: true }
        }
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: 'Internal error' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  console.log("Fetching leaderboard data...");
  try {
    const users = await getPrisma().user.findMany({
      orderBy: { elo: 'desc' },
      take: 50,
      select: { id: true, fullName: true, avatarUrl: true, elo: true, matchesWon: true }
    });
    console.log(`Successfully fetched ${users.length} users.`);
    res.json(users);
  } catch (e: any) {
    console.error("Leaderboard fetch error:", e.message);
    res.status(500).json({ error: 'Internal error', message: e.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  startServer();
}

export default app;
