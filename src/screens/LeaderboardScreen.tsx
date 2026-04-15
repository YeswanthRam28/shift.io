import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, TrendingUp, Users, Target, Zap } from 'lucide-react';
import { Player } from '../types';
import { cn } from '../lib/utils';

interface LeaderboardScreenProps {
  players: Player[];
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = () => {
  const [leaderboardPlayers, setLeaderboardPlayers] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('/api/leaderboard')
      .then(async res => {
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch (e) {
          console.error("Failed to parse JSON. Response text:", text);
          throw new Error("Invalid response from server");
        }
      })
      .then(data => {
        const mapped = data.map((p: any, i: number) => ({
          id: p.id,
          name: p.fullName || 'UNKNOWN_PILOT',
          avatar: p.avatarUrl || '',
          elo: p.elo,
          matchesWon: p.matchesWon,
          rank: i + 1,
          tier: p.elo > 1500 ? 'DIAMOND' : p.elo > 1200 ? 'GOLD' : 'STEEL'
        }));
        setLeaderboardPlayers(mapped);
      })
      .catch(console.error);
  }, []);

  if (leaderboardPlayers.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6" />
        <p className="text-sm font-black font-headline uppercase tracking-[0.3em] text-white/20">Establishing connection to Hall of Legends...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col lg:flex-row items-end justify-between mb-16 gap-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6 backdrop-blur-md">
            <Trophy size={14} className="text-primary accent-glow" />
            <span className="text-[10px] font-black font-headline text-primary uppercase tracking-[0.2em]">Global Combat Rankings</span>
          </div>
          <h2 className="text-6xl md:text-7xl font-black font-headline uppercase tracking-tighter leading-none">
            HALL OF <span className="text-secondary italic pink-glow">LEGENDS</span>
          </h2>
        </div>
        <div className="flex gap-6 w-full lg:w-auto">
          <StatBox icon={<Users size={18} />} label="Total Pilots" value="12,402" color="primary" />
          <StatBox icon={<Zap size={18} />} label="Active Now" value="842" color="secondary" />
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-end">
        <div className="order-2 md:order-1">
          {leaderboardPlayers[1] && <PodiumCard player={leaderboardPlayers[1]} position={2} color="text-secondary" glow="rgba(255,45,85,0.2)" />}
        </div>
        <div className="order-1 md:order-2">
          {leaderboardPlayers[0] && <PodiumCard player={leaderboardPlayers[0]} position={1} color="text-primary" featured glow="rgba(232,255,156,0.3)" />}
        </div>
        <div className="order-3">
          {leaderboardPlayers[2] && <PodiumCard player={leaderboardPlayers[2]} position={3} color="text-white" glow="rgba(255,255,255,0.1)" />}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="glass-panel rounded-[2.5rem] overflow-hidden neon-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-8 py-6 text-[10px] font-black font-headline text-white/20 uppercase tracking-[0.3em]">Position</th>
                <th className="px-8 py-6 text-[10px] font-black font-headline text-white/20 uppercase tracking-[0.3em]">Combatant</th>
                <th className="px-8 py-6 text-[10px] font-black font-headline text-white/20 uppercase tracking-[0.3em]">Division</th>
                <th className="px-8 py-6 text-[10px] font-black font-headline text-white/20 uppercase tracking-[0.3em] text-right">Rating</th>
                <th className="px-8 py-6 text-[10px] font-black font-headline text-white/20 uppercase tracking-[0.3em] text-right">Victories</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leaderboardPlayers.slice(3).map((player) => (
                <tr key={player.id} className="hover:bg-white/[0.02] transition-all group">
                  <td className="px-8 py-6">
                    <span className="text-sm font-black font-mono text-white/20 group-hover:text-white transition-colors">#{player.rank.toString().padStart(2, '0')}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      {player.avatar ? (
                        <img src={player.avatar} alt="" className="w-10 h-10 rounded-xl border border-white/10 group-hover:border-primary/50 transition-all object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-primary group-hover:bg-primary/10 transition-all border border-white/5">
                          <Users size={18} />
                        </div>
                      )}
                      <span className="text-sm font-black uppercase tracking-tight group-hover:text-white transition-colors">{player.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[9px] font-black font-headline text-secondary border border-secondary/20 bg-secondary/5 px-3 py-1 rounded-full uppercase tracking-widest pink-glow">
                      {player.tier}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-sm font-black font-mono text-primary accent-glow">{player.elo}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-sm font-black font-mono text-white/60">{player.matchesWon}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) => (
  <div className="glass-panel flex-1 px-8 py-5 rounded-[2rem] flex items-center gap-5 border border-white/5 hover:border-white/10 transition-all">
    <div className={cn("p-3 rounded-xl bg-white/5", color === 'primary' ? "text-primary accent-glow" : "text-secondary pink-glow")}>
      {icon}
    </div>
    <div>
      <p className="text-[9px] font-black font-headline text-white/20 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black font-headline leading-none">{value}</p>
    </div>
  </div>
);

const PodiumCard = ({ player, position, color, glow, featured = false }: { player: any, position: number, color: string, glow: string, featured?: boolean }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: position * 0.1, duration: 0.8 }}
    className={cn(
      "glass-panel p-10 rounded-[3rem] flex flex-col items-center text-center relative overflow-hidden neon-border",
      featured ? "bg-white/[0.03] scale-110 z-10 py-14" : "bg-transparent scale-100"
    )}
  >
    <div 
      className="absolute -top-20 w-40 h-40 blur-[80px] rounded-full pointer-events-none opacity-40 transition-all duration-700"
      style={{ backgroundColor: glow }}
    />
    
    <div className={cn("mb-8 relative", color)}>
      {player.avatar ? (
        <img src={player.avatar} alt="avatar" className={cn("w-24 h-24 rounded-[2rem] border-2 object-cover relative z-10", featured ? "border-primary accent-glow shadow-[0_0_30px_rgba(232,255,156,0.3)]" : "border-current")} />
      ) : (
        <div className={cn("w-24 h-24 rounded-[2rem] flex items-center justify-center border-2 relative z-10", featured ? "border-primary bg-primary/10 text-primary" : "border-current")}>
          <Users size={48} />
        </div>
      )}
      <div className={cn("absolute -bottom-4 left-1/2 -translate-x-1/2 bg-background border-2 px-4 py-1.5 rounded-2xl z-20 shadow-2xl transition-colors", color, featured ? "border-primary" : "border-current")}>
        <span className="text-sm font-black font-headline tracking-tighter">POS_{position.toString().padStart(2, '0')}</span>
      </div>
    </div>

    <h3 className="text-2xl font-black font-headline uppercase tracking-tight mb-2 truncate w-full">{player.name}</h3>
    <p className={cn("text-[10px] font-black font-headline uppercase tracking-[0.2em] mb-8 px-4 py-1 rounded-full border border-current/20 bg-current/5", color)}>{player.tier}</p>
    
    <div className="grid grid-cols-2 gap-8 w-full border-t border-white/5 pt-8">
      <div className="text-left border-r border-white/5 pr-4">
        <p className="text-[9px] font-black font-headline text-white/20 uppercase tracking-widest mb-2">Rating</p>
        <p className="text-lg font-black font-mono tracking-tight">{player.elo}</p>
      </div>
      <div className="text-right pl-4">
        <p className="text-[9px] font-black font-headline text-white/20 uppercase tracking-widest mb-2">Wins</p>
        <p className={cn("text-lg font-black font-mono tracking-tight", featured ? "text-primary accent-glow" : color)}>{player.matchesWon}</p>
      </div>
    </div>
  </motion.div>
);
