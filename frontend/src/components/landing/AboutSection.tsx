import React from 'react';

const items = [
  { icon: 'fa-robot', text: 'AI-Powered Detection' },
  { icon: 'fa-message', text: 'Message Verification' },
  { icon: 'fa-phone', text: 'Phone Number Check' },
  { icon: 'fa-graduation-cap', text: 'Fraud Education' },
];

export const AboutSection: React.FC = () => (
  <section className="about-section section-padding" id="about" aria-label="About mobile money fraud">
    <div className="container">
      <div className="about-grid">
        <div className="about-content">
          <span className="section-label">About</span>
          <h2 className="section-title">
            What is <span className="highlight">Mobile Money Fraud</span>?
          </h2>
          <p>
            Mobile Money fraud is a growing threat in Ghana, costing millions of cedis
            annually. Scammers use fake messages, SIM swaps, and social engineering to
            trick users into sending money or sharing sensitive information.
          </p>
          <p style={{ marginTop: 12 }}>
            FraudShield AI uses artificial intelligence to detect suspicious patterns,
            verify messages, and protect you from falling victim to these schemes.
          </p>
          <div className="about-icon-list">
            {items.map((item, i) => (
              <div className="about-icon-item" key={i}>
                <i className={`fas ${item.icon}`}></i>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="about-image">
          <span className="floating-icons" style={{ top: '20%', left: '15%' }}>
            <i className="fas fa-mobile-screen-button"></i>
          </span>
          <span className="floating-icons" style={{ bottom: '25%', right: '15%', animationDelay: '2s' }}>
            <i className="fas fa-shield"></i>
          </span>
          <span className="floating-icons" style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '6rem', opacity: 0.15 }}>
            <i className="fas fa-robot"></i>
          </span>
          <span style={{ position: 'relative', zIndex: 2, textAlign: 'center', fontWeight: 700, fontSize: '1.4rem', maxWidth: 260, lineHeight: 1.4 }}>
            AI Fraud Prevention<br />
            <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>for Ghana</span>
          </span>
        </div>
      </div>
    </div>
  </section>
);
