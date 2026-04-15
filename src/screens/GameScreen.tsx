import React, { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Shield, Bomb, Snowflake, Shuffle, Ghost, AlertTriangle, Swords, Clock, Target, Skull } from 'lucide-react';
import { Player, SabotageType, ArenaLog, GameMode, Board } from '../types';
import { cn } from '../lib/utils';
import { MiniBoard } from '../components/MiniBoard';

interface GameScreenProps {
  players: Player[];
  socketId: string | undefined;
  board: Board | null;
  score: number;
  highestTile: number;
  sabotages: SabotageType[];
  opponentsMap: Record<string, { board: Board; score: number; highestTile: number }>;
  isFrozen: boolean;
  isBlinded: boolean;
  timeLeft: number | null;
  mode: GameMode | null;
  onMove: (direction: 'up'|'down'|'left'|'right') => void;
  onSabotage: (targetId: string, type: SabotageType) => void;
  arenaLogs: ArenaLog[];
}

export const GameScreen: React.FC<GameScreenProps> = ({ 
  players, socketId, board, score, highestTile, sabotages, opponentsMap, 
  isFrozen, isBlinded, timeLeft, mode, onMove, onSabotage, arenaLogs 
}) => {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isFrozen) return;

    let direction: 'up' | 'down' | 'left' | 'right' | null = null;
    if (e.key === 'ArrowUp' || e.key === 'w') direction = 'up';
    if (e.key === 'ArrowDown' || e.key === 's') direction = 'down';
    if (e.key === 'ArrowLeft' || e.key === 'a') direction = 'left';
    if (e.key === 'ArrowRight' || e.key === 'd') direction = 'right';

    if (direction) {
      e.preventDefault(); // prevent scrolling
      onMove(direction);
    }
  }, [isFrozen, onMove]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSabotageClick = (type: SabotageType) => {
    if (!selectedTarget) {
      // Pick random if none selected
      const others = players.filter(p => !p.isEliminated);
      if (others.length > 0) {
        onSabotage(others[Math.floor(Math.random() * others.length)].id, type);
      }
    } else {
      onSabotage(selectedTarget, type);
      setSelectedTarget(null);
    }
  };

  const getSabotageIcon = (type: SabotageType) => {
    switch (type) {
      case 'tile_bomb': return <Bomb size={20} />;
      case 'junk_row': return <AlertTriangle size={20} />;
      case 'board_shuffle': return <Shuffle size={20} />;
      case 'freeze': return <Snowflake size={20} />;
      case 'blind': return <Ghost size={20} />;
      default: return <Zap size={20} />;
    }
  };

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-4rem)]">
      {/* Left: Arena Logs */}
      <div className="w-full lg:w-64 order-2 lg:order-1 flex flex-col gap-4">
        {mode === 'score_attack' || mode === 'daily' ? (
          <div className="glass-panel rounded-2xl p-6 text-center shadow-[0_0_20px_rgba(255,255,255,0.05)] border-primary/30">
            <h3 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2 flex justify-center items-center gap-2"><Clock size={12} /> Time Remaining</h3>
            <p className={cn("text-5xl font-black font-headline tracking-tighter tabular-nums", timeLeft && timeLeft <= 30 ? "text-tertiary animate-pulse" : "text-white")}>
              {formatTime(timeLeft)}
            </p>
          </div>
        ) : mode === 'survival' ? (
          <div className="glass-panel rounded-2xl p-6 text-center border-secondary/30">
             <h3 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2 flex justify-center items-center gap-2"><Target size={12} /> Survivors</h3>
             <p className="text-5xl font-black font-headline tracking-tighter tabular-nums text-secondary">
               {players.filter(p => !p.isEliminated).length + 1}
             </p>
          </div>
        ) : null}

        <div className="glass-panel rounded-2xl overflow-hidden flex-1 flex flex-col max-h-[400px]">
          <div className="p-4 border-b border-outline-variant/30 bg-surface-container-high/50">
            <h3 className="text-[10px] font-headline font-black uppercase tracking-widest flex items-center gap-2">
              <Zap size={12} className="text-primary" />
              Arena Feed
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar flex flex-col justify-end">
            {arenaLogs.slice().reverse().map((log, i) => (
              <div key={i} className="text-[10px] font-mono leading-relaxed border-l-2 border-primary/30 pl-2 bg-surface-container-low/30 rounded-r p-1">
                <span className="text-primary font-bold">{log.from}</span>
                <span className="text-outline"> used </span>
                <span className="text-white uppercase font-bold">{log.type.replace('_', ' ')}</span>
                {log.target && (
                  <>
                    <span className="text-outline"> on </span>
                    <span className="text-secondary font-bold">{log.target}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center: Game Board */}
      <div className="flex-1 flex flex-col items-center order-1 lg:order-2">
        <div className="w-full max-w-[500px] mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-xs font-mono text-outline uppercase tracking-widest mb-1">Score</h2>
            <p className="text-4xl font-black font-headline text-primary arcade-glow tabular-nums">{score.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xs font-mono text-outline uppercase tracking-widest mb-1">Highest Tile</h2>
            <p className="text-2xl font-black font-headline text-secondary secondary-glow tabular-nums">{highestTile}</p>
          </div>
        </div>

        <div className="relative group">
          {/* Grid Background */}
          <div className="bg-[#BBADA0] p-4 rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.5)] border-4 border-white/5 relative">
            <div className="grid grid-cols-4 gap-3">
              {(board || Array(4).fill(Array(4).fill(0))).map((row, r) => 
                row.map((cell: number, c: number) => (
                  <div key={`${r}-${c}`} className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl bg-[#CCC0B3] flex items-center justify-center relative overflow-hidden shadow-inner">
                    <AnimatePresence mode="popLayout">
                      {cell > 0 && (
                        <motion.div
                          key={`${r}-${c}-${cell}`}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 1.1, opacity: 0 }}
                          className={cn(
                            "absolute inset-0 flex items-center justify-center text-2xl sm:text-4xl font-black font-headline rounded-xl transition-all",
                            getTileStyles(cell)
                          )}
                        >
                          {cell}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
            
            {/* Blind Overlay (covers top half) */}
            {isBlinded && (
              <div className="absolute top-0 left-0 w-full h-[55%] bg-background/95 backdrop-blur-xl z-20 rounded-t-xl border-b border-primary/20 flex items-center justify-center">
                <Ghost size={48} className="text-outline animate-pulse" />
              </div>
            )}
          </div>

          {/* Freeze Overlay (full cover) */}
          {isFrozen && (
            <div className="absolute inset-0 bg-secondary/20 backdrop-blur-md rounded-2xl flex items-center justify-center z-30 border-4 border-secondary animate-pulse shadow-[0_0_30px_rgba(111,247,246,0.3)]">
              <div className="text-center">
                <Snowflake size={64} className="text-secondary mx-auto mb-4" />
                <p className="text-xl font-headline font-black text-secondary uppercase tracking-widest drop-shadow-[0_0_10px_rgba(0,0,0,1)]">FROZEN</p>
              </div>
            </div>
          )}
          
          {/* Eliminated Overlay */}
          {players.find(p => p.id === socketId)?.isEliminated && (
             <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-40 border-4 border-tertiary">
               <div className="text-center">
                 <Skull size={64} className="text-tertiary mx-auto mb-4" />
                 <p className="text-xl font-headline font-black text-tertiary uppercase tracking-widest">ELIMINATED</p>
                 <p className="text-[10px] font-mono text-outline mt-2 uppercase">Spectating Match</p>
               </div>
             </div>
          )}
        </div>

        {/* Action HUD / Sabotages */}
        {sabotages.length > 0 && (
          <div className="w-full max-w-[500px] mt-8 bg-surface-container-high/50 p-4 rounded-3xl border border-outline-variant/30 flex justify-center gap-4 flex-wrap">
            <div className="w-full text-center text-[10px] font-mono text-primary uppercase tracking-widest mb-2 font-bold select-none">
              <span className="bg-primary/20 px-2 py-0.5 rounded">Availble Sabotages</span>
            </div>
            {sabotages.map((sabo, i) => (
              <button 
                key={i}
                onClick={() => handleSabotageClick(sabo)}
                className="bg-surface-container-highest p-3 rounded-2xl flex flex-col items-center gap-2 hover:border-primary/50 transition-all border border-transparent group active:scale-95"
              >
                <div className="text-white group-hover:text-primary transition-colors">
                  {getSabotageIcon(sabo)}
                </div>
                <span className="text-[8px] font-headline font-black uppercase tracking-widest text-outline group-hover:text-white transition-colors">{sabo.replace('_', ' ')}</span>
              </button>
            ))}
            {selectedTarget && (
               <div className="w-full text-center text-[10px] font-mono text-secondary uppercase mt-2">
                 Target Locked: {players.find(p => p.id === selectedTarget)?.name}
               </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Opponent HUDs */}
      <div className="w-full lg:w-72 order-3">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-headline font-black uppercase tracking-widest flex items-center gap-2">
              <Swords size={12} className="text-secondary" />
              Opponents
            </h3>
            {selectedTarget && (
              <button onClick={() => setSelectedTarget(null)} className="text-[8px] font-mono bg-tertiary/20 text-tertiary px-2 py-0.5 rounded">CLEAR TARGET</button>
            )}
          </div>
          
          <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto custom-scrollbar pr-2 pb-10">
            {players.map((player) => {
              const oppState = opponentsMap[player.id];
              const isSelected = selectedTarget === player.id;
              
              return (
                <div 
                  key={player.id} 
                  onClick={() => !player.isEliminated && setSelectedTarget(player.id)}
                  className={cn(
                    "glass-panel p-4 rounded-2xl relative overflow-hidden transition-all cursor-pointer",
                    isSelected ? "border-secondary/50 shadow-[0_0_15px_rgba(111,247,246,0.15)] scale-[1.02]" : "border-outline-variant/30 hover:border-outline-variant",
                    player.isEliminated && "opacity-50 grayscale cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary border border-outline-variant/30 relative">
                      {player.isEliminated ? <Skull size={20} className="text-outline" /> : <Swords size={20} />}
                      {isSelected && <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full animate-ping" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-bold truncate uppercase tracking-wider", isSelected && "text-secondary")}>{player.name}</p>
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-[10px] font-mono text-outline whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]">
                          {oppState?.score || 0}
                        </span>
                        {player.isEliminated && <span className="text-[8px] bg-tertiary text-on-tertiary px-1 rounded font-bold uppercase ml-auto">K.O.</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-mono text-outline uppercase leading-none">Best</p>
                      <p className="text-sm font-bold font-mono text-primary leading-none">{oppState?.highestTile || 0}</p>
                    </div>
                  </div>
                  
                  {/* Mini Board component renders the actual tile layouts */}
                  <MiniBoard board={oppState?.board} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const getTileStyles = (value: number) => {
  switch (value) {
    case 2: return "bg-[#EEE4DA] text-[#776E65] border-transparent shadow-none";
    case 4: return "bg-[#EDE0C8] text-[#776E65] border-transparent shadow-none";
    case 8: return "bg-[#F2B179] text-[#F9F6F2] border-transparent shadow-none";
    case 16: return "bg-[#F59563] text-[#F9F6F2] border-transparent shadow-none";
    case 32: return "bg-[#F67C5F] text-[#F9F6F2] border-transparent shadow-none";
    case 64: return "bg-[#F65E3B] text-[#F9F6F2] border-transparent shadow-none";
    case 128: return "bg-[#EDCF72] text-[#F9F6F2] border-transparent shadow-none text-2xl sm:text-3xl";
    case 256: return "bg-[#EDCC61] text-[#F9F6F2] border-transparent shadow-none text-2xl sm:text-3xl";
    case 512: return "bg-[#EDC850] text-[#F9F6F2] border-transparent shadow-[0_0_15px_#EDC850] text-2xl sm:text-3xl";
    case 1024: return "bg-[#EDC53F] text-[#F9F6F2] border-transparent shadow-[0_0_20px_#EDC53F] text-xl sm:text-2xl";
    case 2048: return "bg-[#EDC22E] text-[#F9F6F2] border-transparent shadow-[0_0_30px_#EDC22E] text-xl sm:text-2xl";
    default: return "bg-[#3C3A32] text-[#F9F6F2] border-transparent shadow-none text-lg sm:text-xl";
  }
};
