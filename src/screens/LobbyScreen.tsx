import React, { useState } from 'react';
import { Users, Search, Zap, Target, Shield, Skull, CalendarDays, LogOut } from 'lucide-react';
import { Button } from '../components/Button';
import { Player, Screen, GameMode } from '../types';
import { cn } from '../lib/utils';

// Using props from App.tsx rewrite
interface LobbyScreenProps {
  players: Player[];
  setScreen: (screen: Screen) => void;
  onJoin: (mode: GameMode, isPrivate?: boolean, roomCode?: string, targetTile?: number) => void;
  onReady: () => void;
  onLeave: () => void;
  roomId: string | null;
  mode: GameMode | null;
  socketId: string | undefined;
  countdown: number | null;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({ 
  players, setScreen, onJoin, onReady, onLeave, roomId, mode, socketId, countdown
}) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('score_attack');
  const [targetTile, setTargetTile] = useState<number>(2048);

  const me = players.find(p => p.id === socketId);
  const isReady = me?.status === 'ready';

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Side: Matchmaking / Room Status */}
        <div className="flex-1">
          <div className="mb-14">
            <h2 className="text-5xl font-black font-headline uppercase tracking-tighter mb-4">
              ARENA <span className="text-primary italic">GATEWAY</span>
            </h2>
            <p className="text-white/40 font-medium max-w-xl">Initialize your connection to the combat grid. Select your parameters and synchronize for engagement.</p>
          </div>

          {!roomId ? (
            // Room Selection
            <div className="space-y-10 mb-12">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black font-headline uppercase tracking-[0.3em] text-white/20">Operational Modules</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ModeCard 
                  id="score_attack"
                  title="Score Attack" 
                  desc="Precision sequence. 180 seconds to maximize score density."
                  icon={<Zap size={22} />}
                  selected={selectedMode === 'score_attack'}
                  onClick={() => setSelectedMode('score_attack')}
                  color="text-primary"
                  glow="rgba(232,255,156,0.2)"
                />
                <ModeCard 
                  id="race"
                  title="Race" 
                  desc="Velocity test. Accelerated progression to target value."
                  icon={<Target size={22} />}
                  selected={selectedMode === 'race'}
                  onClick={() => setSelectedMode('race')}
                  color="text-secondary"
                  glow="rgba(255,45,85,0.2)"
                />
                <ModeCard 
                  id="survival"
                  title="Survival" 
                  desc="Endurance trial. Maintain data integrity against enemy sabotage."
                  icon={<Skull size={22} />}
                  selected={selectedMode === 'survival'}
                  onClick={() => setSelectedMode('survival')}
                  color="text-white"
                  glow="rgba(255,255,255,0.2)"
                />
                <ModeCard 
                  id="daily"
                  title="Daily Ranked" 
                  desc="Network-wide seed. Single validation attempt per cycle."
                  icon={<CalendarDays size={22} />}
                  selected={selectedMode === 'daily'}
                  onClick={() => setSelectedMode('daily')}
                  color="text-primary"
                  glow="rgba(232,255,156,0.2)"
                />
              </div>

              {selectedMode === 'race' && (
                <div className="glass-panel p-8 rounded-[2rem] flex flex-col sm:flex-row items-center gap-6 neon-border">
                  <span className="text-xs font-black font-headline uppercase tracking-[0.2em] text-white/40">Target Protocol:</span>
                  <div className="flex gap-4">
                    {[2048, 4096, 8192].map(t => (
                      <button 
                        key={t}
                        onClick={() => setTargetTile(t)}
                        className={cn(
                          "px-6 py-3 font-black text-xs rounded-2xl border transition-all tracking-widest",
                          targetTile === t 
                            ? "bg-secondary text-white border-transparent shadow-[0_0_20px_rgba(255,45,85,0.3)] pink-glow" 
                            : "bg-white/5 border-white/5 text-white/20 hover:text-white hover:bg-white/10"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button size="xl" className="w-full mt-6 py-6 group" onClick={() => onJoin(selectedMode, false, undefined, selectedMode === 'race' ? targetTile : undefined)}>
                <Search className="mr-3 transition-transform group-hover:scale-110" size={22} />
                Initialize Matchmaking
              </Button>
            </div>
          ) : (
            // Inside Room
            <div className="glass-panel p-10 md:p-16 rounded-[3rem] relative overflow-hidden transition-all text-center flex flex-col items-center min-h-[450px] justify-center text-white neon-border">
              <div className="absolute inset-0 pixel-grid opacity-10 pointer-events-none" />
              {countdown !== null ? (
                // Countdown state
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative z-10"
                >
                  <h3 className="text-sm font-black font-headline text-primary uppercase tracking-[0.5em] mb-6 accent-glow">Engagement Starts In</h3>
                  <div className="text-[12rem] font-black font-headline tracking-tighter leading-none text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.3)] animate-pulse">{countdown}</div>
                </motion.div>
              ) : (
                // Waiting state
                <div className="relative z-10 w-full max-w-sm">
                  <div className="mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-[10px] font-black font-headline uppercase tracking-[0.3em] mb-8 pink-glow border border-secondary/20">
                      {mode?.replace('_', ' ')} ARENA
                    </div>
                    <h3 className="text-4xl font-black font-headline uppercase tracking-tighter mt-4">UPLINK: <span className="text-primary italic accent-glow">{roomId}</span></h3>
                    <p className="text-sm text-white/40 mt-4 leading-relaxed font-medium">Synchronizing pilots. All units must signal readiness to initiate engagement sequence.</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <Button 
                      size="xl" 
                      variant={isReady ? 'secondary' : 'primary'}
                      className={cn("flex-1 py-5 shadow-xl transition-all", isReady && "opacity-50 grayscale cursor-not-allowed")} 
                      onClick={onReady}
                      disabled={isReady}
                    >
                      {isReady ? 'WAITING FOR GRID' : 'SIGNAL READINESS'}
                    </Button>
                    <button 
                      onClick={onLeave}
                      className="p-5 rounded-full bg-white/5 text-white/20 hover:text-secondary hover:bg-secondary/10 transition-all active:scale-95 border border-white/5"
                    >
                      <LogOut size={24} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Active Players List */}
        <div className="w-full lg:w-96">
          <div className="glass-panel rounded-[2.5rem] overflow-hidden flex flex-col h-[650px] neon-border">
            <div className="p-8 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center justify-between">
                <h3 className="font-headline font-black uppercase tracking-[0.2em] text-[10px] text-white/40">Network Node: Pilots</h3>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black font-headline accent-glow border border-primary/20">{players.length} ACTIVE</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
              {players.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-10">
                  <Users size={64} className="mb-4" />
                  <p className="text-[10px] font-black font-headline uppercase tracking-[0.3em]">Module Inactive</p>
                </div>
              ) : (
                players.map((player) => (
                  <div key={player.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary border border-white/5 relative z-10">
                        <Users size={20} />
                      </div>
                      <div className={cn("absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-[#0a0a0a] z-20", player.status === 'ready' ? "bg-primary accent-glow" : "bg-white/20")}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-black uppercase tracking-tight truncate">
                          {player.name}
                        </p>
                        {player.id === socketId && <span className="text-[8px] font-black bg-primary text-black px-1.5 py-0.5 rounded tracking-tighter">YOU</span>}
                      </div>
                      <p className={cn("text-[9px] font-black font-headline uppercase tracking-[0.1em]", player.status === 'ready' ? "text-primary" : "text-white/20")}>
                        {player.status === 'ready' ? 'SECURED / READY' : 'ESTABLISHING...'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black font-mono text-primary font-bold">{player.elo}</p>
                      <p className="text-[8px] font-black font-headline text-white/20 uppercase tracking-tighter">RATING</p>
                    </div>
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ModeCard = ({ title, desc, icon, selected, color, glow, onClick }: any) => (
  <button 
    onClick={onClick}
    className={cn(
      "text-left p-8 rounded-[2rem] border transition-all relative overflow-hidden group flex flex-col items-start gap-6 h-full",
      selected 
        ? `bg-white/[0.05] border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.6)]` 
        : "bg-transparent border-white/5 hover:bg-white/[0.02] hover:border-white/10 text-white/20"
    )}
  >
    {selected && (
      <div 
        className="absolute -right-10 -top-10 w-40 h-40 blur-[60px] rounded-full pointer-events-none opacity-30 transition-all duration-700"
        style={{ backgroundColor: glow }}
      />
    )}
    <div className={cn("p-4 rounded-xl transition-all duration-500", selected ? `bg-white/10 ${color} scale-110 shadow-lg` : `bg-white/5 text-white/10 group-hover:text-white`)}>
      {icon}
    </div>
    <div>
      <h4 className={cn("text-xl font-black font-headline uppercase tracking-tight mb-2", selected ? "text-white" : "group-hover:text-white")}>{title}</h4>
      <p className={cn("text-[11px] leading-relaxed font-medium transition-colors", selected ? "text-white/40" : "text-white/10 group-hover:text-white/20")}>{desc}</p>
    </div>
    {selected && <div className="absolute bottom-0 left-0 h-1 bg-current animate-pulse w-full opacity-50" style={{ backgroundColor: glow }} />}
  </button>
);
