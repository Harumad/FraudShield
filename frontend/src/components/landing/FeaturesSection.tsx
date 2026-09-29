import React from 'react';

const features = [
  { icon: 'fa-comment-dots', title: 'AI Fraud Chatbot', desc: 'Chat with our intelligent assistant to analyze suspicious messages and get instant fraud advice.', color: '#F57C00' },
  { icon: 'fa-shield', title: 'Fraud Detection', desc: 'Advanced AI algorithms detect fraudulent patterns in messages, calls, and transactions.', color: '#EF4444' },
  { icon: 'fa-check-double', title: 'Message Verification', desc: 'Upload screenshots or paste text to verify if a message is legitimate or a scam.', color: '#22C55E' },
  { icon: 'fa-phone', title: 'Phone Number Checker', desc: 'Check if a phone number has been reported for fraud or suspicious activity.', color: '#3B82F6' },
  { icon: 'fa-book-open', title: 'Scam Education', desc: 'Learn about the latest scams and how to protect yourself and your loved ones.', color: '#8B5CF6' },
  { icon: 'fa-phone-volume', title: 'Emergency Help', desc: 'Immediate access to emergency contacts and reporting channels for fraud incidents.', color: '#F59E0B' },
  { icon: 'fa-chart-line', title: 'Fraud Trends', desc: 'Real-time insights into emerging fraud patterns and high-risk areas in Ghana.', color: '#06B6D4' },
  { icon: 'fa-flag', title: 'Secure Reporting', desc: 'Report fraud incidents securely and help protect others from the same scams.', color: '#EC4899' },
  { icon: 'fa-bullhorn', title: 'Community Alerts', desc: 'Receive real-time alerts about fraud in your area from the community.', color: '#F97316' },
  { icon: 'fa-eye', title: 'Dark Web Monitoring', desc: 'Coming soon: Monitor if your personal information appears on the dark web.', color: '#6366F1' },
  { icon: 'fa-arrows-spin', title: 'Transaction Pattern Analysis', desc: 'Analyze transaction patterns to identify unusual behaviour that may indicate fraud.', color: '#14B8A6' },
  { icon: 'fa-gauge-high', title: 'AI Risk Score', desc: 'Get a clear fraud risk score from 1\u2013100, with detailed reasoning behind the assessment.', color: '#E11D48' },
];

const FeatureIllustration: React.FC<{ color: string; icon: string; index: number }> = ({ color, icon, index }) => {
  const hues = ['0', '45', '90', '180', '225', '270', '315'];
  const hue = hues[index % hues.length];
  return (
    <div className="feature-illustration" style={{ '--feat-color': color } as React.CSSProperties}>
      <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="feat-svg">
        <circle cx="60" cy="40" r="36" fill={color} opacity="0.06" />
        <circle cx="60" cy="40" r="24" fill={color} opacity="0.04" />
        <rect x="20" y="52" width="80" height="3" rx="1.5" fill={color} opacity="0.1" />
        <rect x="30" y="58" width="60" height="2" rx="1" fill={color} opacity="0.06" />
        <g opacity="0.08">
          {[...Array(5)].map((_, j) => (
            <circle key={j} cx={20 + j * 20} cy="12" r="2" fill={color}>
              <animate attributeName="opacity" values="0.3;1;0.3" dur={`${2 + j * 0.3}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>
      </svg>
    </div>
  );
};

interface FeaturesSectionProps {
  onNavigateChat: () => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onNavigateChat }) => (
  <section className="features-section section-padding" id="features" aria-label="Features">
    <div className="container">
      <div className="text-center">
        <span className="section-label">Features</span>
        <h2 className="section-title">Powerful AI Tools for <span className="highlight">Safer Mobile Money</span></h2>
        <p className="section-subtitle mx-auto">Comprehensive AI-powered fraud detection, prevention, reporting, and education designed to protect mobile money users across Ghana.</p>
      </div>
      <div className="features-grid">
        {features.map((f, i) => (
          <div className="feature-card fade-up glass-card" key={i} style={{ transitionDelay: `${i * 0.05}s` }}>
            <FeatureIllustration color={f.color} icon={f.icon} index={i} />
            <div className="feat-icon"><i className={`fas ${f.icon}`}></i></div>
            <h4>{f.title}</h4>
            <p>{f.desc}</p>
            <button className="btn btn-primary btn-sm feature-cta" onClick={onNavigateChat}>Try Now <i className="fas fa-arrow-right"></i></button>
          </div>
        ))}
      </div>
    </div>
  </section>
);
