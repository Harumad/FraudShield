import React from 'react';

interface ChatbotCTAProps {
  onNavigateChat: () => void;
}

export const ChatbotCTA: React.FC<ChatbotCTAProps> = ({ onNavigateChat }) => (
  <section className="chatbot-cta" id="chatbot-cta" aria-label="Chatbot CTA">
    <div className="container">
      <div className="content">
        <span className="section-label" style={{ color: 'var(--primary-light)', background: 'rgba(245,124,0,0.12)' }}>AI Assistant</span>
        <h2>Need Help? <br /><span style={{ color: 'var(--primary-light)' }}>Chat With Our AI</span></h2>
        <p>
          Our intelligent AI assistant is available 24/7 to help with personal finance,
          business planning, savings, mobile money, and fraud detection.
        </p>
        <button className="btn btn-primary btn-lg ripple" onClick={onNavigateChat}>
          <i className="fas fa-robot"></i> Open AI Chatbot
        </button>
      </div>
      <div className="illustration">
        <div className="bubble" style={{ top: '5%', right: 0 }}>💬 "Is this a scam?"</div>
        <div className="bubble" style={{ bottom: '10%', left: 0 }}>🔍 "Analyzing..."</div>
        <span className="bot-icon"><i className="fas fa-robot"></i></span>
      </div>
    </div>
  </section>
);
