import React from 'react';
import { motion } from 'motion/react';
import { LogIn, Diamond, Gamepad2, AlertTriangle } from 'lucide-react';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';

export const AuthScreen: React.FC = () => {
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) {
        console.error("Auth error:", error.message);
        alert("Authentication failed: " + error.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== "YOUR_SUPABASE_PROJECT_URL";

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0 pixel-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/5 blur-[150px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 1.1, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel p-10 md:p-14 rounded-[2.5rem] w-full max-w-[480px] relative z-10 flex flex-col items-center text-center overflow-hidden neon-border"
      >
        <div className="mb-10 animate-fade-in">
          <img src="/logo.webp" alt="Shift.io Logo" className="h-16 object-contain" />
        </div>
        
        <h2 className="text-4xl font-black font-headline uppercase tracking-tighter mb-4 leading-none">
          SECURE <span className="text-primary italic">UPLINK</span>
        </h2>
        <p className="text-white/40 font-medium mb-12 text-sm leading-relaxed px-4">
          Establish a secure connection to the Shift.io network to sync your ELO, rank, and arsenal.
        </p>

        {!isConfigured && (
          <div className="mb-8 w-full bg-secondary/10 border-l-4 border-secondary p-5 rounded-2xl text-left backdrop-blur-md">
            <h4 className="flex items-center gap-2 text-secondary font-black text-[10px] uppercase tracking-[0.2em] mb-2">
              <AlertTriangle size={14} /> Systems Offline
            </h4>
            <p className="text-[10px] text-white/60 font-mono leading-relaxed">
              Environment variables <span className="text-secondary">VITE_SUPABASE_URL</span> are missing. Authentication is restricted.
            </p>
          </div>
        )}

        <Button 
          size="xl" 
          className="w-full flex items-center justify-center relative group" 
          onClick={handleGoogleLogin}
          disabled={!isConfigured}
        >
          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 pointer-events-none" />
          <svg className="w-5 h-5 mr-4 relative z-10" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" fillOpacity="0.8"/>
          </svg>
          <span className="relative z-10">Sign in with Google</span>
        </Button>

        <div className="mt-12 w-full pt-8 border-t border-white/5">
          <p className="text-[9px] font-black font-headline text-white/20 uppercase tracking-[0.5em]">
            Authorized Access Only
          </p>
        </div>
      </motion.div>
    </div>
  );
};
