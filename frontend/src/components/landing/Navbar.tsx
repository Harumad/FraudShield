import React, { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';

interface NavbarProps {
  onNavigateChat: () => void;
  activeSection?: string;
}

const sections = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'fraud-types', label: 'Fraud Types' },
  { id: 'contact', label: 'Contact' },
];

export const Navbar: React.FC<NavbarProps> = ({ onNavigateChat, activeSection }) => {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header className={`navbar${scrolled ? ' scrolled' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="container">
          <a href="#home" className="logo" onClick={(e) => { e.preventDefault(); scrollTo('home'); }} aria-label="FraudShield AI Home">
            <i className="fas fa-shield-halved"></i>
            Fraud<span>Shield</span>
          </a>

          <ul className="nav-links" role="menubar">
            {sections.map(s => (
              <li key={s.id} role="none">
                <a
                  href={`#${s.id}`}
                  role="menuitem"
                  className={activeSection === s.id ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); scrollTo(s.id); }}
                >
                  {s.label}
                </a>
              </li>
            ))}
            <li role="none">
              <a
                href="#chatbot"
                role="menuitem"
                className="btn btn-primary btn-sm"
                style={{ padding: '6px 18px', fontSize: '0.8rem' }}
                onClick={(e) => { e.preventDefault(); onNavigateChat(); }}
              >
                <i className="fas fa-robot"></i> Chatbot
              </a>
            </li>
          </ul>

          <div className="nav-actions">
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
              <i className={`fas fa-${theme === 'dark' ? 'sun' : 'moon'}`}></i>
            </button>
            <a href="#contact" className="btn btn-primary btn-sm" onClick={(e) => { e.preventDefault(); scrollTo('contact'); }}>Get Started</a>
            <button
              className={`hamburger${mobileOpen ? ' active' : ''}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </header>

      <div className={`nav-overlay${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(false)} />
      <nav className={`mobile-nav${mobileOpen ? ' open' : ''}`} role="navigation" aria-label="Mobile navigation">
        <button className="close-btn" onClick={() => setMobileOpen(false)} aria-label="Close menu">
          <i className="fas fa-times"></i>
        </button>
        {sections.map(s => (
          <a key={s.id} href={`#${s.id}`} onClick={(e) => { e.preventDefault(); scrollTo(s.id); }}>
            <i className={`fas fa-${s.id === 'home' ? 'home' : s.id === 'about' ? 'info-circle' : s.id === 'features' ? 'cogs' : s.id === 'how-it-works' ? 'road' : s.id === 'fraud-types' ? 'bug' : 'envelope'}`}></i>
            {s.label}
          </a>
        ))}
        <a href="#chatbot" className="btn btn-primary" onClick={(e) => { e.preventDefault(); onNavigateChat(); }}>
          <i className="fas fa-robot"></i> Open Chatbot
        </a>
        <a href="#contact" className="btn btn-outline" onClick={(e) => { e.preventDefault(); scrollTo('contact'); }}>Get Started</a>
      </nav>
    </>
  );
};
