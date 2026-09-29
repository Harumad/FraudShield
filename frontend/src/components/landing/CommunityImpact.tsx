import React from 'react';

const impacts = [
  { icon: 'fa-users', count: '15,000+', label: 'Community Members' },
  { icon: 'fa-school', count: '120+', label: 'Awareness Workshops' },
  { icon: 'fa-handshake', count: '45+', label: 'Partner Organizations' },
  { icon: 'fa-map-pin', count: '12', label: 'Regions Reached' },
];

const stories = [
  { name: 'Adwoa M.', role: 'Market Trader, Makola', text: 'After attending a FraudShield workshop, I spotted a fake MoMo agent at my stall. I reported it immediately and saved my savings.', badge: 'Story' },
  { name: 'Nana K.', role: 'Student, Legon', text: 'The chatbot helped me verify a "job offer" SMS. It was a scam. I would have lost my tuition fees if not for this platform.', badge: 'Story' },
  { name: 'Abena S.', role: 'Small Business Owner', text: 'I now check every suspicious message with FraudShield before acting. It has become my daily security habit.', badge: 'Story' },
];

export const CommunityImpact: React.FC = () => (
  <section className="impact-section section-padding" id="impact" aria-label="Community impact">
    <div className="container">
      <div className="text-center">
        <span className="section-label">Community Impact</span>
        <h2 className="section-title">Making a Difference <span className="highlight">Together</span></h2>
        <p className="section-subtitle mx-auto">Our growing community of users, partners, and advocates working to stop fraud in Ghana.</p>
      </div>

      <div className="impact-grid">
        {impacts.map((im, i) => (
          <div className="impact-stat fade-up" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
            <div className="icon"><i className={`fas ${im.icon}`}></i></div>
            <div className="count">{im.count}</div>
            <div className="label">{im.label}</div>
          </div>
        ))}
      </div>

      <div className="impact-stories">
        <h3 className="stories-title">Real Stories from Our Community</h3>
        <div className="stories-grid">
          {stories.map((st, i) => (
            <div className="story-card fade-up" key={i} style={{ transitionDelay: `${i * 0.12}s` }}>
              <span className="badge">{st.badge}</span>
              <blockquote>"{st.text}"</blockquote>
              <div className="author">
                <div className="avatar">{st.name.charAt(0)}</div>
                <div>
                  <strong>{st.name}</strong>
                  <span>{st.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ci-partners">
        <span className="ci-partners-label">Trusted by leading mobile networks</span>
        <div className="ci-partners-logos">
          <div className="ci-partner-logo"><i className="fas fa-building"></i> MTN Ghana</div>
          <div className="ci-partner-logo"><i className="fas fa-broadcast-tower"></i> Telecel</div>
          <div className="ci-partner-logo"><i className="fas fa-satellite-dish"></i> AirtelTigo</div>
          <div className="ci-partner-logo"><i className="fas fa-bank"></i> Bank of Ghana</div>
          <div className="ci-partner-logo"><i className="fas fa-shield"></i> Ghana Police</div>
        </div>
      </div>
    </div>
  </section>
);
