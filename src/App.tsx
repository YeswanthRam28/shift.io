import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Layout } from './components/Layout';
import { HomeScreen } from './screens/HomeScreen';
import { LobbyScreen } from './screens/LobbyScreen';
import { GameScreen } from './screens/GameScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { AuthScreen } from './screens/AuthScreen';
import { LandingScreen } from './screens/LandingScreen';
import { Screen, Player, ArenaLog, SabotageType, MatchResult, GameMode, Board } from './types';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('landing');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  
  // Lobby/Match State
  const [players, setPlayers] = useState<Player[]>([]);
  const [arenaLogs, setArenaLogs] = useState<ArenaLog[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<GameMode | null>(null);
  const [matchResults, setMatchResults] = useState<MatchResult[] | null>(null);
  
  // Game State (from server)
  const [board, setBoard] = useState<Board | null>(null);
  const [score, setScore] = useState(0);
  const [highestTile, setHighestTile] = useState(0);
  const [sabotages, setSabotages] = useState<SabotageType[]>([]);
  const [opponentsMap, setOpponentsMap] = useState<Record<string, { board: Board, score: number, highestTile: number }>>({});
  
  // Overlays
  const [isFrozen, setIsFrozen] = useState(false);
  const [isBlinded, setIsBlinded] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  // Server-driven endsAt
  const [matchEndsAt, setMatchEndsAt] = useState<number | null>(null);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingConfig(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('joined_room', ({ roomId, mode }) => {
      setActiveRoomId(roomId);
      setActiveMode(mode);
      setScreen('lobby');
    });

    newSocket.on('lobby_update', (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
    });

    newSocket.on('countdown', ({ secondsLeft }) => {
      setCountdown(secondsLeft);
    });

    newSocket.on('match_start', ({ roomId, mode, seed, endsAt, targetTile }) => {
      setScreen('game');
      setCountdown(null);
      setMatchEndsAt(endsAt || null);
      setPlayers(prev => prev.map(p => ({ ...p, status: 'playing' })));
    });

    newSocket.on('move_result', ({ board, score, moved }) => {
      if (moved || !board) setBoard(board);
      setScore(score);
      let max = 0;
      board.forEach((r: number[]) => r.forEach((c: number) => { if(c > max) max = c; }));
      setHighestTile(max);
    });

    newSocket.on('opponent_update', ({ userId, board, score, highestTile }) => {
      setOpponentsMap(prev => ({
        ...prev,
        [userId]: { board, score, highestTile }
      }));
    });

    newSocket.on('board_mutated', ({ board }) => {
      setBoard(board);
    });

    newSocket.on('arena_log', (log: ArenaLog) => {
      setArenaLogs(prev => [log, ...prev].slice(0, 20));
    });

    newSocket.on('sabotage_earned', ({ sabotageType }) => {
      setSabotages(prev => [...prev, sabotageType]);
    });

    newSocket.on('sabotage_incoming', ({ sabotageType, fromUserId }) => {
      // Visual feedback via arena log, but handled explicitly
    });

    newSocket.on('freeze_start', ({ duration }) => {
      setIsFrozen(true);
      setTimeout(() => setIsFrozen(false), duration);
    });

    newSocket.on('blind_start', ({ duration }) => {
      setIsBlinded(true);
      setTimeout(() => setIsBlinded(false), duration);
    });

    newSocket.on('player_eliminated', ({ userId }) => {
      setPlayers(prev => prev.map(p => p.id === userId ? { ...p, isEliminated: true, status: 'finished' } : p));
    });

    newSocket.on('match_end', ({ results }) => {
      setMatchResults(results);
      setScreen('results');
      setActiveRoomId(null);
      setMatchEndsAt(null);
    });

    return () => {
      newSocket.close();
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!matchEndsAt || screen !== 'game') return;
    const i = setInterval(() => {
      const remaining = Math.max(0, Math.floor((matchEndsAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(i);
    }, 1000);
    return () => clearInterval(i);
  }, [matchEndsAt, screen]);

  const handleJoinLobby = (mode: GameMode, isPrivate = false, roomCode?: string, targetTile?: number) => {
    if (socket && user) {
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'CYBER_ACE';
      const avatar = user.user_metadata?.avatar_url || '';
      socket.emit('join_lobby', { mode, name, avatar, userId: user.id, isPrivate, roomCode, targetTile });
    }
  };

  const handleReady = () => {
    if (socket) socket.emit('player_ready');
  };

  const handleMove = (direction: 'up'|'down'|'left'|'right') => {
    if (socket && !isFrozen) socket.emit('move', { direction });
  };

  const handleSabotage = (targetId: string, type: SabotageType) => {
    if (socket) {
      socket.emit('use_sabotage', { sabotageType: type, targetUserId: targetId });
      setSabotages(prev => {
        const idx = prev.findIndex(t => t === type);
        if (idx !== -1) {
          const np = [...prev];
          np.splice(idx, 1);
          return np;
        }
        return prev;
      });
    }
  };

  const handleLeaveLobby = () => {
    if (socket) socket.emit('leave_room');
    setScreen('home');
    setActiveRoomId(null);
  };

  const renderScreen = () => {
    switch (screen) {
      case 'landing':
        return <LandingScreen onStart={() => setScreen('home')} />;
      case 'home':
        return <HomeScreen setScreen={(s) => s === 'lobby' ? handleJoinLobby('score_attack') : setScreen(s)} />;
      case 'lobby':
        return (
          <LobbyScreen 
            players={players} 
            setScreen={setScreen}
            onJoin={handleJoinLobby}
            onReady={handleReady}
            onLeave={handleLeaveLobby}
            roomId={activeRoomId}
            mode={activeMode}
            socketId={socket?.id}
            countdown={countdown}
          />
        );
      case 'game':
        return (
          <GameScreen 
            players={players.filter(p => p.id !== socket?.id)} 
            socketId={socket?.id}
            board={board}
            score={score}
            highestTile={highestTile}
            sabotages={sabotages}
            opponentsMap={opponentsMap}
            isFrozen={isFrozen}
            isBlinded={isBlinded}
            timeLeft={timeLeft}
            mode={activeMode}
            onMove={handleMove}
            onSabotage={handleSabotage}
            arenaLogs={arenaLogs}
          />
        );
      case 'results':
        return <ResultsScreen results={matchResults || []} setScreen={setScreen} onPlayAgain={() => setScreen('home')} />;
      case 'leaderboard':
        return <LeaderboardScreen players={players} />;
      case 'profile':
        return <ProfileScreen user={user} />;
      default:
        return <HomeScreen setScreen={setScreen} />;
    }
  };

  if (loadingConfig) return null;

  if (screen === 'landing') {
    return renderScreen();
  }

  if (!user) return <AuthScreen />;

  return (
    <Layout currentScreen={screen} setScreen={setScreen} user={user}>
      {renderScreen()}
    </Layout>
  );
};

export default App;
