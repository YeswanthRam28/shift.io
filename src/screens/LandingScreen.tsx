import React, { useEffect, useState } from 'react';
import { Logo } from '../components/Logo';
import heroBg from '../assets/hero-bg.png';

interface LandingScreenProps {
  onStart: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onStart }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-content">
          <div className="nav-logo">
            <Logo size={32} color="#D5FF45" />
            <span className="logo-text">shift.io</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#gameplay">Gameplay</a>
            <a href="#leaderboard">Leaderboard</a>
          </div>
          <button className="nav-cta" onClick={onStart}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-bg">
          <img src={heroBg} alt="Hero Background" />
          <div className="hero-overlay"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Nex-Gen Competitive 2048
          </div>
          <h1 className="hero-title">
            Where <span className="highlight">strategy</span> <br />
            meets <span className="highlight-alt">velocity.</span>
          </h1>
          <p className="hero-subtitle">
            Experience the world's first real-time multiplayer 2048 arena. 
            Battle opponents, use sabotages, and climb the global ranks.
          </p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={onStart}>
              Enter the Arena
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button className="secondary-btn">
              How it works
            </button>
          </div>
        </div>

        <div className="hero-scroll">
          <span className="scroll-text">Scroll to explore</span>
          <div className="scroll-icon">
            <div className="scroll-dot"></div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <span className="section-tag">Features</span>
          <h2 className="section-title">Harness the power of speed</h2>
          <p className="section-desc">Shift.io redefines the classic puzzle with aggressive multiplayer mechanics.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Real-time PvP</h3>
            <p>Battle against 4+ players simultaneously in a high-stakes arena.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💀</div>
            <h3>Sabotage System</h3>
            <p>Freeze opponent boards, shuffle their tiles, or drop junk rows to win.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Ranked Tiers</h3>
            <p>Climb from Bronze to Cyber-Ace and claim your spot on the leaderboard.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <Logo size={24} color="#D5FF45" />
            <span>shift.io</span>
          </div>
          <div className="footer-links">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Discord</a>
          </div>
          <p className="copyright">&copy; 2026 Shift.io. Build for the future.</p>
        </div>
      </footer>
    </div>
  );
};
