import React from 'react';

const steps = [
  {
    num: '01',
    title: 'Upload Screenshot',
    desc: 'Snap a photo of any suspicious SMS, WhatsApp message, or transaction alert and upload it to FraudShield AI. You can also paste message text or enter a phone number. Our system accepts screenshots, PDFs, and plain text \u2014 making it easy for anyone to get started in seconds.',
    icon: 'fa-upload',
  },
  {
    num: '02',
    title: 'AI Analysis',
    desc: 'Our AI engine extracts and examines every detail \u2014 sender info, message tone, embedded links, phone numbers, and requested actions. Trained on thousands of real Ghanaian scam cases, it cross-references known fraud patterns, phishing keywords, and blacklisted numbers in real time.',
    icon: 'fa-microchip',
  },
  {
    num: '03',
    title: 'Detect Fraud',
    desc: 'The system flags common scam indicators: urgent payment demands, fake bank alerts, lottery winnings, impersonation attempts, and phishing URLs. It also checks against our community fraud database to see if others have reported similar content. Every red flag is cataloged with evidence.',
    icon: 'fa-magnifying-glass',
  },
  {
    num: '04',
    title: 'Fraud Score',
    desc: 'You receive a clear risk score from 1\u2013100 explaining why the message is risky. The score factors in urgency level, link legitimacy, sender reputation, and similarity to known scams. A detailed breakdown accompanies every score so you understand the threat, not just a number.',
    icon: 'fa-gauge-high',
  },
  {
    num: '05',
    title: 'Recommendation',
    desc: 'Get a clear next step \u2014 report the number to your mobile network provider, block the sender, ignore the message, or escalate to the Ghana Cyber Crime Unit. We provide direct reporting links and emergency contacts so you can act immediately.',
    icon: 'fa-circle-check',
  },
];

export const HowItWorks: React.FC = () => (
  <section className="how-section section-padding" id="how-it-works" aria-label="How it works">
    <div className="container">
      <div className="text-center">
        <span className="section-label">How It Works</span>
        <h2 className="section-title">From Suspicious Message to <span className="highlight">Clear Action</span></h2>
        <p className="section-subtitle mx-auto">No technical skills needed. Upload any suspicious SMS, WhatsApp message, or transaction alert and let our AI walk you through what it really means, how risky it is, and exactly what to do next. Built for Ghana\u2019s mobile money users, trained on local scam patterns.</p>
      </div>
      <div className="how-layout">
        <div className="how-workflow">
          <div className="how-track">
            {steps.map((step, i) => (
              <div className="how-step fade-up" key={i} style={{ transitionDelay: `${i * 0.12}s` }}>
                <div className="how-step-dot">
                  <span>{step.num}</span>
                </div>
                {i < steps.length - 1 && <div className="how-step-connector" />}
              </div>
            ))}
          </div>
          <div className="how-cards">
            {steps.map((step, i) => (
              <div className="how-card fade-up" key={i} style={{ transitionDelay: `${i * 0.12}s` }}>
                <div className="how-card-icon">
                  <i className={`fas ${step.icon}`} />
                </div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="how-visual">
          <div className="how-phone-frame">
            <div className="how-phone-notch" />
            <div className="how-phone-screen">
              <div className="how-phone-header">
                <span className="how-phone-signal" />
                <span className="how-phone-time">12:30</span>
                <span className="how-phone-battery" />
              </div>
              <div className="how-phone-msg incoming">
                <p>Urgent: Your account has been compromised. Verify now to avoid suspension.</p>
                <span className="how-msg-time">12:30 PM</span>
              </div>
              <div className="how-phone-analysis">
                <div className="how-analysis-bar" />
                <div className="how-analysis-bar slow" />
                <div className="how-analysis-bar fast" />
              </div>
              <div className="how-phone-msg alert">
                <div className="how-alert-icon">!</div>
                <div>
                  <strong>Fraud Alert</strong>
                  <p>Risk Score: 78/100</p>
                </div>
              </div>
              <div className="how-phone-msg safe">
                <div className="how-safe-icon">&#10003;</div>
                <div>
                  <strong>Recommendation</strong>
                  <p>Ignore &amp; block sender</p>
                </div>
              </div>
            </div>
            <div className="how-phone-home" />
          </div>
          <div className="how-scan-line" />
          <div className="how-orb how-orb-1" />
          <div className="how-orb how-orb-2" />
          <div className="how-orb how-orb-3" />
        </div>
      </div>
    </div>
  </section>
);
