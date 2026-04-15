import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Users, ArrowRight, Home, RefreshCcw } from 'lucide-react';
import { Button } from '../components/Button';
import { MatchResult, Screen } from '../types';
import { cn } from '../lib/utils';

interface ResultsScreenProps {
  results: MatchResult[];
  setScreen: (screen: Screen) => void;
  onPlayAgain: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ results, setScreen, onPlayAgain }) => {
  const winner = results[0];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[max(calc(100vh-8rem), 700px)]">
      <motion.div 
        initial={{ opacity: 0, y: -20, scale: 1.1 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-8 backdrop-blur-md">
          <Trophy size={14} className="text-primary accent-glow" />
          <span className="text-[10px] font-black font-headline text-primary uppercase tracking-[0.2em]">Mission Analysis Complete</span>
        </div>
        <h2 className="text-7xl font-black font-headline uppercase tracking-tighter mb-4 leading-none">
          SYSTEM <span className="text-secondary italic pink-glow">SETTLED</span>
        </h2>
        <p className="text-white/40 font-medium max-w-lg mx-auto">The synchronization has concluded. Unit status updated in global registries.</p>
      </motion.div>

      {/* Podium for top 3 */}
      <div className="flex justify-center items-end gap-6 md:gap-12 mb-20 h-72">
        {results.length > 1 && (
          <Podium rank={2} result={results[1]} height="h-44" color="bg-secondary/10 border-secondary/30" text="text-secondary" glow="rgba(255,45,85,0.2)" />
        )}
        {results.length > 0 && (
          <Podium rank={1} result={results[0]} height="h-64" color="bg-primary/20 border-primary/40" text="text-primary" featured glow="rgba(232,255,156,0.3)" />
        )}
        {results.length > 2 && (
          <Podium rank={3} result={results[2]} height="h-32" color="bg-white/5 border-white/20" text="text-white" glow="rgba(255,255,255,0.1)" />
        )}
      </div>

      {/* Full Results List */}
      <div className="w-full max-w-3xl glass-panel rounded-[2.5rem] overflow-hidden mb-12 neon-border">
        <div className="bg-white/[0.02] border-b border-white/5 px-8 py-4 flex items-center justify-between">
          <span className="text-[10px] font-black font-headline text-white/20 uppercase tracking-[0.3em]">Full Deployment Standings</span>
          <span className="text-[10px] font-black font-headline text-white/20 uppercase tracking-[0.3em]">{results.length} UNITS</span>
        </div>
        <div className="divide-y divide-white/5">
          {results.map((result, i) => (
            <div key={result.userId} className={cn(
              "flex items-center gap-6 p-6 transition-all group",
              i === 0 ? "bg-primary/[0.03]" : "hover:bg-white/[0.02]"
            )}>
              <div className={cn("w-10 text-center font-black font-headline tracking-tighter text-xl", i === 0 ? "text-primary accent-glow" : "text-white/20")}>
                #{result.rank}
              </div>
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-primary transition-colors border border-white/5">
                <Users size={20} />
              </div>
              <div className="flex-1">
                <p className="font-black uppercase tracking-tight text-white group-hover:text-primary transition-colors">{result.name}</p>
                <div className="flex items-center gap-4 text-[10px] font-black font-headline mt-1">
                  <span className="text-white/20">SCORE <span className="text-white/60 ml-1">{result.score.toLocaleString()}</span></span>
                  <span className="text-white/20">MAX_TILE <span className="text-secondary ml-1 pink-glow">{result.highestTile}</span></span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black font-headline text-white/20 uppercase tracking-widest mb-1">RATING_DELTA</p>
                <p className={cn("text-xl font-black font-mono tracking-tighter", result.eloDelta >= 0 ? "text-primary accent-glow" : "text-secondary pink-glow")}>
                  {result.eloDelta > 0 ? "+" : ""}{result.eloDelta}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
        <Button size="xl" className="flex-1 group" onClick={onPlayAgain}>
          <RefreshCcw className="mr-3 transition-transform group-hover:rotate-180 duration-500" size={22} />
          RE-ENGAGE MODULE
        </Button>
        <button 
          onClick={() => setScreen('home')}
          className="flex-1 py-4 px-8 rounded-full border border-white/10 text-white font-black font-headline uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          <Home size={20} className="text-white/40" />
          TERMINAL_HOME
        </button>
      </div>
    </div>
  );
};

const Podium = ({ rank, result, height, color, text, glow, featured = false }: { rank: number; result: MatchResult; height: string; color: string; text: string; glow: string; featured?: boolean }) => (
  <motion.div 
    initial={{ opacity: 0, y: 100 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: rank * 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
    className="flex flex-col items-center w-28 md:w-36 group"
  >
    <div className="mb-8 text-center px-2">
      <div className="relative mb-4">
        <div className={cn("w-20 h-20 rounded-[1.5rem] bg-white/5 border-2 flex items-center justify-center text-white/20 mx-auto transition-all duration-500 group-hover:scale-110", featured ? "border-primary shadow-[0_0_30px_rgba(232,255,156,0.3)] text-primary bg-primary/10" : "border-white/10")}>
          <Users size={32} />
        </div>
        {featured && <Trophy size={16} className="absolute -top-2 -right-2 text-primary accent-glow animate-bounce" />}
      </div>
      <p className="font-black font-headline uppercase tracking-tighter truncate w-full text-lg mb-1">{result.name}</p>
      <p className={cn("text-[10px] font-black font-headline tracking-[0.2em]", text)}>{result.score.toLocaleString()} PTS</p>
    </div>
    <div 
      className={cn("w-full rounded-t-[2.5rem] flex flex-col items-center justify-start pt-6 border-x border-t transition-all duration-700 relative overflow-hidden", height, color)}
    >
      <div 
        className="absolute inset-0 blur-[40px] opacity-20 transition-opacity duration-700 pointer-events-none"
        style={{ backgroundColor: glow }}
      />
      <span className={cn("text-4xl font-black font-headline relative z-10", text)}>{rank}</span>
      <div className={cn("absolute bottom-0 left-0 w-full h-1 bg-current opacity-30", text === 'text-primary' ? 'bg-primary' : text === 'text-secondary' ? 'bg-secondary' : 'bg-white')} />
    </div>
  </motion.div>
);
