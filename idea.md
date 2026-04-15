# Competitive 2048 — Full Game Idea

## Overview

A real-time competitive web app built around the classic 2048 puzzle game. Players don't just race against themselves — they compete live against others, sabotage each other's boards, and climb ranked ladders across multiple game modes. The core tension: 2048 is a deeply strategic solo game, but here every move you make is watched, every milestone you hit becomes a weapon, and every board around you is trying to outlast yours.

---

## Game Modes

### 1. Race Mode
- All players start simultaneously with the same empty board
- First player to reach the target tile (2048, 4096, or 8192 — chosen at lobby creation) wins
- Lobby host selects tile target before the match
- Players eliminated as they get stuck (board fills up with no valid moves)
- Leaderboard: tracks fastest race completions by tile target

### 2. Score Attack
- Fixed 3-minute timer, all players play simultaneously
- Highest cumulative score when time expires wins
- No elimination during the round — everyone plays the full duration
- Best beginner-friendly mode due to no knockout pressure
- Leaderboard: tracks highest scores by time bracket (daily, weekly, all-time)

### 3. Survival
- No timer — last board alive wins
- When a player's board has no valid moves left, they are eliminated in real time
- Spectators can watch live as players drop out
- Remaining players see a "Players left: X" counter updating live
- Eliminated players become spectators of the ongoing match
- Leaderboard: tracks longest survival streaks and most wins

### 4. Daily Ranked
- One match per day per player
- All players get the exact same procedurally seeded board (same RNG seed daily)
- Removes all RNG variance — pure skill test
- Results feed into a seasonal ELO ladder
- Score, tile reached, and move count all recorded
- Results revealed at midnight so no player can copy strategy
- Leaderboard: daily results + all-time ELO ranking per player

---

## Sabotage System

Sabotages are earned by hitting milestone tiles during a match. They are targeted at a specific opponent (player's choice). Receiving a sabotage does not pause the game — it lands on your board immediately and you must adapt.

| Sabotage | Earned At | Effect |
|---|---|---|
| Tile bomb | 128 tile | Plants a "2" tile in the opponent's worst-possible corner on their next move |
| Junk row | 256 tile | Pushes a row of low-value random tiles into the bottom of the opponent's board |
| Board shuffle | 512 tile | Randomly scrambles all tile positions on the opponent's board |
| Freeze | 1024 tile | Locks the opponent's keyboard input for 3 seconds |
| Blind | 2048 tile | Covers the top half of the opponent's board for 5 seconds |
| Absorb (passive) | Special drop | Intercepts the next sabotage sent to you and redirects it to an opponent of your choice |

### Design Principles
- Power scales with skill: the best players earn the worst sabotages
- Sending a sabotage is a choice — you pick the target
- Multiple sabotages can queue but are delivered sequentially
- Absorb creates a psychological layer (players must decide whether to fire at a suspected Absorb holder)
- Sabotage animations are visible to all spectators

---

## Ranking & Progression

### Per-Mode ELO
- Each of the four modes has its own independent ELO rating
- Prevents generalists from stomping specialists
- Displayed as a numeric ELO and a visible tier

### Tiers
Bronze → Silver → Gold → Platinum → Diamond (each with I / II / III subdivisions)

### Seasons
- Monthly soft reset (ELO regresses toward the median, not zeroed)
- Historical peak tier is always saved and displayed on profile
- Season-end cosmetic rewards for players in top % of each mode

### Placement Matches
- New players play 5 placement matches per mode before receiving an ELO
- Initial ELO seeded from performance in those 5 matches

---

## Social & Spectator Features

### MVP (Launch)
- Live mini-board previews of all opponents during a match
- Real-time score ticker showing all players' scores
- Friends list with online status
- Private lobbies with invite codes
- Global and friends leaderboards per mode

### V2
- Emoji/sticker reactions during a match (appears on your own board, visible to all)
- Match replay viewer (full move-by-move replay)
- In-game chat in lobbies (pre-match only)
- Achievement badges (e.g. "First 4096", "Win without using a sabotage", "Survive 10 minutes")

### Later
- Streamer layout mode (large board + opponent strip optimized for OBS)
- Tile skin cosmetic unlocks (seasonal themes, animated tiles)
- Team mode (2v2, partners share one board with alternating turns)
- Tournament brackets (organizer creates a bracket, players are seeded by ELO)

---

## Technical Architecture

### Frontend
- React + Vite
- Component: GameBoard (renders 4x4 grid, handles swipe and keyboard)
- Component: OpponentStrip (mini live boards of all opponents)
- Component: SabotagePanel (shows earned sabotages, target selector)
- Component: Leaderboard (filterable by mode, time period, friends)
- CSS animations for tile merges, sabotage hits, and eliminations

### Realtime
- WebSocket via Socket.io or Supabase Realtime
- Events: move, tile-earned, sabotage-sent, sabotage-received, player-eliminated, game-end
- Server is authoritative: client sends direction input, server validates and responds with new board state (prevents cheating)
- Game state sync every 500ms as a fallback heartbeat

### Backend
- Node.js + Express
- Game logic runs server-side (not client-side) for integrity
- Match rooms managed in Redis (fast ephemeral state)
- Persistent data (scores, ELO, history) in PostgreSQL

### Auth & Accounts
- Supabase Auth (Google OAuth + email/password)
- Guest mode for unranked casual matches
- Persistent profile with stats, match history, and cosmetics

### Deployment
- Railway or Fly.io (supports WebSocket servers)
- Separate services: API server, WebSocket server, PostgreSQL, Redis

---

## MVP Build Order

1. Solo 2048 game engine (pure logic, no UI)
2. React board component with keyboard + swipe input
3. WebSocket lobby system (create room, join room, player list)
4. Score Attack mode (simplest: timer + score, no elimination state machine)
5. Live opponent mini-boards (spectator strip)
6. First sabotage: Junk Row (tests the server-side board mutation pipeline)
7. Auth + player profiles
8. Global leaderboard for Score Attack
9. Race mode + Survival mode
10. Daily Ranked + ELO system
11. Full sabotage system (all 6 types)
12. Friends, private lobbies, achievements

---

## Key Design Decisions

- Server is authoritative over all game state — clients are display-only. This prevents any client-side cheating on tile values or scores.
- Daily ranked uses a fixed daily seed verified server-side — clients cannot generate or manipulate the seed.
- Sabotage targeting is player's choice (not auto-aim at the leader). This creates interesting political dynamics in multiplayer.
- Spectators see everything including sabotage animations — good for streamers and community watching.
- ELO is per-mode so a Survival specialist doesn't get punished in Score Attack rankings.
