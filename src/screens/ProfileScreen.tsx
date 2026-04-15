import React from 'react';
import { motion } from 'motion/react';
import { User, Shield, Zap, Target, Trophy, Briefcase, Settings, Star, Award, ChevronRight } from 'lucide-react';
import { Button } from '../components/Button';
import { cn } from '../lib/utils';
import { User as AuthUser } from '@supabase/supabase-js';

export const ProfileScreen: React.FC<{ user: AuthUser }> = ({ user }) => {
  const [profileData, setProfileData] = React.useState<any>(null);
  
  React.useEffect(() => {
    fetch('/api/me', {
      headers: { Authorization: `Bearer ${user.id}` }
    })
    .then(res => res.json())
    .then(data => setProfileData(data))
    .catch(console.error);
  }, [user.id]);

  const name = profileData?.fullName || user.user_metadata?.full_name || user.email?.split('@')[0] || 'NEO_ACE';
  const avatar = profileData?.avatarUrl || user.user_metadata?.avatar_url;
  const elo = profileData?.elo || 1000;
  const winRate = profileData?.matchesPlayed ? Math.round((profileData.matchesWon / profileData.matchesPlayed) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Left: User Profile Card */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-10 rounded-[2.5rem] relative overflow-hidden neon-border">
            <div className="absolute top-0 right-0 p-8">
              <Settings className="text-white/20 hover:text-primary cursor-pointer transition-colors" size={20} />
            </div>
            
            <div className="flex flex-col items-center text-center mb-10">
              <div className="relative mb-8">
                {avatar ? (
                  <img src={avatar} alt={name} className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-white/5 shadow-2xl" />
                ) : (
                  <div className="w-32 h-32 rounded-[2.5rem] bg-white/5 flex items-center justify-center text-primary border-2 border-white/5 shadow-2xl">
                    <User size={64} />
                  </div>
                )}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-secondary text-white px-5 py-2 rounded-2xl text-[10px] font-black font-headline uppercase tracking-[0.2em] shadow-[0_4px_20px_rgba(255,45,85,0.4)] pink-glow border border-white/10">
                  {elo} ELO
                </div>
              </div>
              <h2 className="text-2xl font-black font-headline uppercase tracking-tighter mb-2">{name}</h2>
              <p className="text-[10px] font-black font-headline text-secondary uppercase tracking-[0.2em] pink-glow">
                {elo > 1500 ? 'Elite Series Pilot' : elo > 1200 ? 'Veteran Operative' : 'Junior Recruit'}
              </p>
            </div>

            <div className="space-y-4 mb-10">
              <div className="bg-white/5 p-5 rounded-[1.5rem] border border-white/5">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-[9px] font-black font-headline text-white/20 uppercase tracking-widest">Global Ranking</span>
                  <span className="text-[10px] font-black font-mono text-primary uppercase accent-glow">TOP 2%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary accent-glow w-[98%] transition-all duration-1000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-5 rounded-[1.5rem] border border-white/5 text-center transition-all hover:bg-white/10">
                  <p className="text-[8px] font-black font-headline text-white/20 uppercase tracking-widest mb-1 leading-none">CyberBits</p>
                  <p className="text-xl font-black font-headline text-primary accent-glow">{profileData?.cyberBits || 0}</p>
                </div>
                <div className="bg-white/5 p-5 rounded-[1.5rem] border border-white/5 text-center transition-all hover:bg-white/10">
                  <p className="text-[8px] font-black font-headline text-white/20 uppercase tracking-widest mb-1 leading-none">Win Ratio</p>
                  <p className="text-xl font-black font-headline text-secondary pink-glow">{winRate}%</p>
                </div>
              </div>
            </div>

            <Button variant="secondary" className="w-full py-4 rounded-2xl text-[10px]">
              Configure Profile
            </Button>
          </div>
        </div>

        {/* Right: Arsenal & Stats */}
        <div className="lg:col-span-3 space-y-16">
          {/* Arsenal Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-black font-headline uppercase tracking-tighter flex items-center gap-4">
                <Briefcase className="text-primary accent-glow" />
                COMBAT <span className="text-primary italic accent-glow">ARSENAL</span>
              </h3>
              <button className="text-[10px] font-black font-headline text-white/20 uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors">
                Marketplace <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ArsenalItem 
                icon={<Zap size={24} />} 
                title="EMP PULSE" 
                desc="Instantly scrambled enemy inputs for 5s cycle." 
                rarity="Experimental" 
                color="primary"
              />
              <ArsenalItem 
                icon={<Shield size={24} />} 
                title="REACTIVE ARMOR" 
                desc="Neutralizes incoming sabotage attempts." 
                rarity="Standard" 
                color="secondary"
              />
              <ArsenalItem 
                icon={<Star size={24} />} 
                title="QUANTUM TILE" 
                desc="Forces a merge event on highest value tile." 
                rarity="Legendary" 
                color="white"
              />
            </div>
          </section>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <section>
              <h3 className="text-2xl font-black font-headline uppercase tracking-tighter flex items-center gap-4 mb-8">
                <Award className="text-secondary pink-glow" />
                SERVICE <span className="text-secondary italic pink-glow">MEDALS</span>
              </h3>
              <div className="glass-panel p-10 rounded-[2.5rem] grid grid-cols-2 gap-10 neon-border">
                <Badge icon={<Trophy />} label="Iron Will" date="OPERATIONAL" unlocked />
                <Badge icon={<Zap />} label="Overclock" date="OPERATIONAL" unlocked />
                <Badge icon={<Target />} label="Cold Blood" date="OPERATIONAL" unlocked />
                <Badge icon={<Shield />} label="Guardian" date="LOCKED" />
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-black font-headline uppercase tracking-tighter flex items-center gap-4 mb-8">
                <Target className="text-white/40" />
                MISSION <span className="text-white/20 italic">REPORTS</span>
              </h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
                {profileData?.matchPlayers?.length > 0 ? (
                  profileData.matchPlayers.map((mp: any) => (
                    <ActivityRow 
                      key={mp.id}
                      result={mp.rank === 1 ? 'VICTORY' : `POSITION_${mp.rank}`} 
                      arena={`${mp.match.mode.toUpperCase()} Arena`} 
                      score={mp.score.toString()} 
                      date={new Date(mp.match.endedAt).toLocaleDateString()} 
                      win={mp.rank === 1} 
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 bg-white/5 rounded-[2rem] border border-white/5 text-center">
                    <p className="text-[10px] font-black font-headline text-white/20 uppercase tracking-[0.4em]">No Sorties Recorded</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

const ArsenalItem = ({ icon, title, desc, rarity, color }: { icon: React.ReactNode, title: string, desc: string, rarity: string, color: string }) => (
  <div className={cn("glass-panel p-8 rounded-[2rem] border border-white/5 group relative overflow-hidden transition-all hover:bg-white/[0.03] hover:border-white/10 cursor-pointer")}>
    <div className={cn("mb-6 p-4 rounded-2xl w-fit transition-all duration-500", color === 'primary' ? "bg-primary/10 text-primary accent-glow" : color === 'secondary' ? "bg-secondary/10 text-secondary pink-glow" : "bg-white/10 text-white")}>
      {icon}
    </div>
    <h4 className="text-sm font-black font-headline uppercase tracking-tight mb-2 text-white">{title}</h4>
    <p className="text-[11px] text-white/40 font-medium mb-6 leading-relaxed">{desc}</p>
    <span className={cn("text-[8px] font-black font-headline px-3 py-1 rounded-full uppercase border tracking-widest", color === 'primary' ? "border-primary/20 text-primary" : color === 'secondary' ? "border-secondary/20 text-secondary" : "border-white/20 text-white")}>
      {rarity}
    </span>
  </div>
);

const Badge = ({ icon, label, date, unlocked = false }: { icon: React.ReactNode, label: string, date: string, unlocked?: boolean }) => (
  <div className={cn("flex flex-col items-center text-center group", !unlocked && "opacity-10 grayscale")}>
    <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all duration-700", unlocked ? "bg-white/5 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-black group-hover:shadow-[0_0_20px_rgba(232,255,156,0.3)]" : "bg-white/20 text-white")}>
      {React.cloneElement(icon as React.ReactElement, { size: 32 })}
    </div>
    <p className="text-[10px] font-black font-headline uppercase tracking-[0.1em] mb-1">{label}</p>
    <p className="text-[8px] font-black font-headline text-white/20 uppercase tracking-[0.2em]">{date}</p>
  </div>
);

const ActivityRow = ({ result, arena, score, date, win = false }: { result: string, arena: string, score: string, date: string, win?: boolean }) => (
  <div className="glass-panel p-6 rounded-[1.5rem] flex items-center justify-between group hover:bg-white/[0.03] border border-white/5 transition-all">
    <div className="flex items-center gap-6">
      <div className={cn("w-1 h-10 rounded-full", win ? "bg-primary accent-glow" : "bg-secondary pink-glow")}></div>
      <div>
        <p className={cn("text-xs font-black font-headline uppercase tracking-widest mb-1", win ? "text-primary accent-glow" : "text-secondary pink-glow")}>{result}</p>
        <p className="text-[9px] font-black font-headline text-white/20 uppercase tracking-[0.2em]">{arena}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-base font-black font-mono tracking-tighter mb-1 leading-none">{score}</p>
      <p className="text-[9px] font-black font-headline text-white/20 uppercase tracking-widest">{date}</p>
    </div>
  </div>
);
