import React from 'react';
import { Swords, Trophy, Briefcase, History, LayoutGrid, Users, ShoppingCart, User as UserIcon, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { Screen } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;
  user?: any;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentScreen, setScreen, user }) => {
  const handleSignOut = async () => {
    const { supabase } = await import('../lib/supabase');
    await supabase.auth.signOut();
  };
  return (
    <div className="min-h-screen bg-background text-white font-body overflow-x-hidden selection:bg-primary selection:text-black">
      {/* Top Navigation HUD */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-20 bg-background/60 backdrop-blur-2xl border-b border-white/5">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setScreen('home')}>
          <img src="/logo.webp" alt="Shift.io Logo" className="h-10 object-contain" />
        </div>
        
        <div className="hidden md:flex items-center space-x-10 font-headline uppercase tracking-[0.2em] text-[10px] font-black">
          <button 
            onClick={() => setScreen('game')}
            className={cn("pb-1 transition-all", currentScreen === 'game' ? "text-primary border-b-2 border-primary accent-glow" : "text-white/40 hover:text-white")}
          >
            Arena
          </button>
          <button 
            onClick={() => setScreen('leaderboard')}
            className={cn("pb-1 transition-all", currentScreen === 'leaderboard' ? "text-primary border-b-2 border-primary accent-glow" : "text-white/40 hover:text-white")}
          >
            Rankings
          </button>
          <button 
            onClick={() => setScreen('profile')}
            className={cn("pb-1 transition-all", currentScreen === 'profile' ? "text-primary border-b-2 border-primary accent-glow" : "text-white/40 hover:text-white")}
          >
            Profile
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 pl-6 border-l border-white/10">
            <div className="text-right hidden sm:block cursor-pointer" onClick={() => setScreen('profile')}>
              <p className="text-[10px] font-bold text-white tracking-widest leading-tight uppercase">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'NEO_ACE'}
              </p>
              <p className="text-[8px] font-black text-primary leading-tight uppercase tracking-tighter">ELITE DIVISION</p>
            </div>
            {user?.user_metadata?.avatar_url ? (
               <div className="relative group">
                 <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-primary/20 cursor-pointer transition-all group-hover:border-primary group-hover:shadow-[0_0_15px_rgba(232,255,156,0.4)]" onClick={() => setScreen('profile')} />
               </div>
            ) : (
               <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary cursor-pointer border border-white/5" onClick={() => setScreen('profile')}>
                 <UserIcon size={20} />
               </div>
            )}
            <button onClick={handleSignOut} className="ml-2 text-white/20 hover:text-secondary transition-colors" title="Sign Out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Side HUD (Desktop Only) */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full z-40 w-24 bg-surface-container-low/80 backdrop-blur-xl border-r border-white/5 pt-24">
        <nav className="flex flex-col items-center gap-10 py-10 h-full">
          <NavItem 
            icon={<Swords size={22} />} 
            label="BATTLE" 
            active={currentScreen === 'game' || currentScreen === 'lobby'} 
            onClick={() => setScreen('lobby')} 
          />
          <NavItem 
            icon={<Trophy size={22} />} 
            label="RANKINGS" 
            active={currentScreen === 'leaderboard'} 
            onClick={() => setScreen('leaderboard')} 
          />
          <NavItem 
            icon={<Briefcase size={22} />} 
            label="ARSENAL" 
            active={currentScreen === 'profile'} 
            onClick={() => setScreen('profile')} 
          />
          <div className="mt-auto pb-8">
            <NavItem 
              icon={<History size={22} />} 
              label="HISTORY" 
              active={false} 
              onClick={() => {}} 
            />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={cn("relative min-h-screen pt-20", currentScreen !== 'home' && "lg:pl-24")}>
        {children}
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <footer className="fixed bottom-0 w-full z-50 bg-background/80 backdrop-blur-2xl border-t border-white/5 h-20 lg:hidden">
        <div className="flex justify-around items-center h-full">
          <MobileNavItem 
            icon={<LayoutGrid size={24} />} 
            label="Arena" 
            active={currentScreen === 'game' || currentScreen === 'lobby'} 
            onClick={() => setScreen('lobby')} 
          />
          <MobileNavItem 
            icon={<Users size={24} />} 
            label="Social" 
            active={false} 
            onClick={() => {}} 
          />
          <MobileNavItem 
            icon={<ShoppingCart size={24} />} 
            label="Store" 
            active={false} 
            onClick={() => {}} 
          />
          <MobileNavItem 
            icon={<UserIcon size={24} />} 
            label="Profile" 
            active={currentScreen === 'profile'} 
            onClick={() => setScreen('profile')} 
          />
        </div>
      </footer>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <div className="group relative">
    <button 
      onClick={onClick}
      className={cn(
        "w-12 h-12 flex items-center justify-center rounded-2xl transition-all active:scale-95",
        active ? "bg-primary text-black shadow-[0_0_20px_rgba(232,255,156,0.3)]" : "text-white/20 hover:text-white hover:bg-white/5"
      )}
    >
      {icon}
    </button>
    <span className="absolute left-20 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-surface-container-highest text-[10px] font-black tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 whitespace-nowrap z-50 rounded-lg border border-white/10 shadow-2xl">
      {label}
    </span>
  </div>
);

const MobileNavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center transition-all px-4 py-2 rounded-2xl",
      active ? "text-primary accent-glow" : "text-white/30"
    )}
  >
    {icon}
    <span className="font-headline text-[9px] font-black uppercase mt-1 tracking-widest">{label}</span>
  </button>
);
