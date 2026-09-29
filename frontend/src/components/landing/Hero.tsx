import React, { useEffect } from 'react';
import fraudBg from '../../fraud.jpeg';

interface HeroProps {
  onNavigateChat: () => void;
}

const stats = [
  { icon: 'fa-users', count: 25000, suffix: '+', label: 'Users Protected' },
  { icon: 'fa-file-invoice', count: 1250, suffix: '+', label: 'Fraud Reports' },
  { icon: 'fa-chart-line', count: 96, suffix: '%', label: 'Detection Accuracy' },
  { icon: 'fa-coins', count: 5000000, suffix: '+', label: 'Money Saved (GHS)' },
];

export const Hero: React.FC<HeroProps> = ({ onNavigateChat }) => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          const counter = entry.target.querySelector('.counter') as HTMLElement;
          if (counter) {
            const card = entry.target.closest('.stat-card') as HTMLElement;
            const target = parseInt(card?.dataset.count || '0', 10);
            if (!isNaN(target)) {
              let current = 0;
              const increment = Math.ceil(target / 80);
              const timer = setInterval(() => {
                current += increment;
                if (current >= target) { current = target; clearInterval(timer); }
                counter.textContent = current.toLocaleString();
              }, 20);
            }
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    const cards = document.querySelectorAll('.landing-page .stat-card');
    cards.forEach(c => observer.observe(c));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="hero" id="home" aria-label="Hero">
      <div className="hero-bg" role="presentation" style={{
        background: `url(${fraudBg}) center/cover no-repeat`,
      }}></div>
      <div className="hero-overlay" role="presentation"></div>
      <div className="container">
        <div className="hero-content">
          <h1>
            Your AI Assistant for<br />
            <span className="highlight">Finance, Fraud &amp; Mobile Money</span>
          </h1>
          <p>
            Get instant help with personal finance, business planning, savings tips, mobile money
            transactions, and fraud detection — all powered by AI.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary btn-lg ripple" onClick={onNavigateChat}>
              <i className="fas fa-robot"></i> Try AI Chatbot
            </button>
            <a href="#contact" className="btn btn-light btn-lg ripple" onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById('contact');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}>
              <i className="fas fa-envelope"></i> Get Help
            </a>
          </div>

          <div className="hero-stats">
            {stats.map((s, i) => (
              <div className="stat-card" key={i} data-count={s.count}>
                <span className="icon"><i className={`fas ${s.icon}`}></i></span>
                <span className="number"><span className="counter">0</span><span className="suffix">{s.suffix}</span></span>
                <span className="label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
