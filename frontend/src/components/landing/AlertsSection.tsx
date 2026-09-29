import React from 'react';

const alerts = [
  { title: 'Fake MTN Promotion', risk: 'High', location: 'Accra', time: '2 hours ago', status: 'Active', desc: 'Scammers sending fake MTN rewards messages requesting MoMo PIN.', riskColor: 'var(--primary)' },
  { title: 'SIM Swap Attempt', risk: 'Critical', location: 'Kumasi', time: '5 hours ago', status: 'Active', desc: 'Multiple reports of SIM swap attempts targeting mobile money users.', riskColor: 'var(--error)' },
  { title: 'WhatsApp Romance Scam', risk: 'Medium', location: 'Tema', time: '1 day ago', status: 'Investigating', desc: 'Fake profiles on WhatsApp asking for money after building trust.', riskColor: 'var(--primary-light)' },
  { title: 'Fake Agent Alert', risk: 'High', location: 'Takoradi', time: '2 days ago', status: 'Resolved', desc: 'Individual impersonating MoMo agent to collect cash from customers.', riskColor: 'var(--primary)' },
];

const GhanaMap: React.FC = () => (
  <div className="alerts-map" role="img" aria-label="Map of Ghana showing active fraud alert locations">
    <svg viewBox="0 0 300 340" fill="none" xmlns="http://www.w3.org/2000/svg" className="alerts-map-svg">
      <defs>
        <radialGradient id="pinGlow">
          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
        </radialGradient>
      </defs>

      <path d="M150 50 L180 65 L195 90 L200 120 L190 150 L210 170 L230 180 L250 200 L240 220 L220 240 L200 250 L170 260 L150 270 L130 260 L110 250 L90 240 L70 220 L60 200 L65 180 L80 160 L95 140 L100 120 L105 100 L120 75 L135 60Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2" />
      <path d="M150 50 L180 65 L195 90 L200 120 L190 150 L210 170 L230 180 L250 200 L240 220 L220 240 L200 250 L170 260 L150 270 L130 260 L110 250 L90 240 L70 220 L60 200 L65 180 L80 160 L95 140 L100 120 L105 100 L120 75 L135 60Z" fill="#1E293B" opacity="0.05" />

      <g>
        <circle cx="195" cy="185" r="12" fill="url(#pinGlow)" className="alerts-pin-pulse">
          <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="195" cy="185" r="5" fill="#EF4444" stroke="#fff" strokeWidth="2" />
        <circle cx="195" cy="185" r="1.5" fill="#fff" />
      </g>

      <g>
        <circle cx="160" cy="200" r="12" fill="url(#pinGlow)" className="alerts-pin-pulse">
          <animate attributeName="r" values="8;16;8" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="160" cy="200" r="5" fill="#EF4444" stroke="#fff" strokeWidth="2" />
        <circle cx="160" cy="200" r="1.5" fill="#fff" />
      </g>

      <g>
        <circle cx="130" cy="160" r="10" fill="url(#pinGlow)" className="alerts-pin-pulse">
          <animate attributeName="r" values="6;14;6" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="130" cy="160" r="4" fill="#F59E0B" stroke="#fff" strokeWidth="2" />
        <circle cx="130" cy="160" r="1" fill="#fff" />
      </g>

      <g>
        <circle cx="100" cy="225" r="10" fill="url(#pinGlow)" className="alerts-pin-pulse">
          <animate attributeName="r" values="6;14;6" dur="3.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="100" cy="225" r="4" fill="#10B981" stroke="#fff" strokeWidth="2" />
        <circle cx="100" cy="225" r="1" fill="#fff" />
      </g>

      <text x="195" y="178" fontSize="6" fill="#fff" fontWeight="700" textAnchor="middle">Accra</text>
      <text x="160" y="193" fontSize="6" fill="#fff" fontWeight="700" textAnchor="middle">Kumasi</text>
      <text x="130" y="153" fontSize="6" fill="#fff" fontWeight="700" textAnchor="middle">Tema</text>
      <text x="100" y="218" fontSize="6" fill="#fff" fontWeight="700" textAnchor="middle">Takoradi</text>
    </svg>
  </div>
);

export const AlertsSection: React.FC = () => (
  <section className="alerts-section section-padding" id="alerts" aria-label="Live fraud alerts">
    <div className="container">
      <div className="text-center">
        <span className="section-label">Live Alerts</span>
        <h2 className="section-title">Real-Time <span className="highlight">Fraud Alerts</span></h2>
        <p className="section-subtitle mx-auto">Stay updated with the latest fraud incidents reported across Ghana.</p>
      </div>
      <div className="alerts-layout">
        <div className="alerts-list">
          {alerts.map((a, i) => (
            <div className="alert-card fade-up" key={i} style={{ borderLeftColor: a.riskColor }}>
              <div className="top">
                <h4>{a.title}</h4>
                <span className="badge">{a.risk}</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--gray)', marginBottom: 8 }}>{a.desc}</p>
              <div className="meta">
                <span><i className="fas fa-location-dot"></i> {a.location}</span>
                <span><i className="fas fa-clock"></i> {a.time}</span>
              </div>
              <div className="status">
                <span className={a.status === 'Active' ? 'dot' : a.status === 'Investigating' ? 'dot safe' : 'dot resolved'}></span>
                {a.status}
              </div>
            </div>
          ))}
        </div>
        <GhanaMap />
      </div>
    </div>
  </section>
);