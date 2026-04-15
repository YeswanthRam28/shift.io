import React from 'react';
import { motion } from 'motion/react';
import { Swords, Trophy, Zap, Shield, Target } from 'lucide-react';
import { Button } from '../components/Button';
import { Screen } from '../types';

interface HomeScreenProps {
  setScreen: (screen: Screen) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ setScreen }) => {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pixel-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-surface-container-high/50 border border-white/5 mb-10 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
            </span>
            <span className="text-[10px] font-black font-headline text-secondary uppercase tracking-[0.3em]">Season 4: Neon Reckoning</span>
          </div>

          <div className="flex justify-center mb-6">
            <img src="/logo.webp" alt="Shift.io Logo" className="h-24 md:h-32 object-contain animate-fade-in" />
          </div>

          <h1 className="text-5xl md:text-8xl font-black font-headline uppercase tracking-tighter leading-[0.9] mb-8">
            <span className="block text-white">THE NEXT GEN</span>
            <span className="block text-primary accent-glow italic">MULTIPLAYER ARENA</span>
          </h1>

          <p className="text-base md:text-xl text-white/40 max-w-2xl mx-auto mb-14 font-medium leading-relaxed">
            Merge tiles, build combos, and sabotage your opponents in high-stakes neon-lit arenas. 
            The ultimate test of strategy and speed is here.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button 
              size="xl" 
              className="w-full sm:w-auto min-w-[260px] group"
              onClick={() => setScreen('lobby')}
            >
              <Swords className="mr-3 transition-transform group-hover:rotate-12" size={24} />
              Begin Journey
            </Button>
            <Button 
              variant="secondary" 
              size="xl" 
              className="w-full sm:w-auto min-w-[260px]"
              onClick={() => setScreen('leaderboard')}
            >
              <Trophy className="mr-3" size={24} />
              Leaderboards
            </Button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-24"
        >
          <FeatureCard 
            icon={<Zap className="text-primary" />} 
            title="Fast Paced" 
            desc="Real-time merges" 
          />
          <FeatureCard 
            icon={<Shield className="text-secondary" />} 
            title="Sabotage" 
            desc="Freeze opponents" 
          />
          <FeatureCard 
            icon={<Target className="text-tertiary" />} 
            title="Ranked" 
            desc="Climb the tiers" 
          />
          <FeatureCard 
            icon={<Trophy className="text-primary" />} 
            title="Rewards" 
            desc="Earn CyberBits" 
          />
        </motion.div>
      </div>

      {/* Ticker Tape */}
      <div className="absolute bottom-0 left-0 w-full h-12 bg-surface-container-low border-t border-outline-variant/20 flex items-center overflow-hidden whitespace-nowrap">
        <div className="ticker-move">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="mx-8 text-[10px] font-mono text-outline uppercase tracking-widest">
              <span className="text-primary mr-2">●</span> 
              Player <span className="text-white">Neon_Ghost</span> just hit <span className="text-secondary">2048</span> in Arena 7
              <span className="mx-4 text-outline-variant">|</span>
              <span className="text-tertiary mr-2">●</span> 
              New Sabotage: <span className="text-white">EMP BOMB</span> added to Arsenal
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center group hover:border-primary/50 transition-all">
    <div className="mb-4 p-3 rounded-xl bg-surface-container-highest group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xs font-headline font-black uppercase tracking-widest mb-1">{title}</h3>
    <p className="text-[10px] text-outline font-mono uppercase">{desc}</p>
  </div>
);
