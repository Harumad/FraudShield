import React, { useState } from 'react';

const infoCards = [
  { icon: 'fa-phone', title: 'Emergency Hotline', text: '+233 55 123 4567 (24/7)' },
  { icon: 'fa-envelope', title: 'Email Us', text: 'support@fraudshield.ai' },
  { icon: 'fa-location-dot', title: 'Our Office', text: 'Accra, Ghana' },
];

const socialLinks = ['facebook-f', 'twitter', 'linkedin-in', 'youtube', 'instagram'];

export const ContactFooter: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    if (!form.email.includes('@') || !form.email.includes('.')) return;
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ name: '', email: '', phone: '', message: '' });
      }
    } catch {
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Contact */}
      <section className="contact-section section-padding" id="contact" aria-label="Contact us">
        <div className="container">
          <div className="text-center">
            <span className="section-label">Contact</span>
            <h2 className="section-title">Get in <span className="highlight">Touch</span></h2>
            <p className="section-subtitle mx-auto">Have questions or want to report fraud? Reach out to us anytime.</p>
          </div>

          <div className="contact-grid">
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="contactName">Full Name</label>
                <input id="contactName" type="text" placeholder="Your full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="contactEmail">Email Address</label>
                <input id="contactEmail" type="email" placeholder="you@example.com" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="contactPhone">Phone Number</label>
                <input id="contactPhone" type="tel" placeholder="024 123 4567" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="contactMessage">Message</label>
                <textarea id="contactMessage" placeholder="Tell us how we can help..." required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}></textarea>
              </div>
              <button className="btn btn-primary btn-lg" type="submit" disabled={sending}>
                <i className={`fas ${sending ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i> {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>

            <div className="contact-info">
              {infoCards.map((card, i) => (
                <div className="info-card" key={i}>
                  <div className="icon"><i className={`fas ${card.icon}`}></i></div>
                  <div className="text">
                    <h5>{card.title}</h5>
                    <p>{card.text}</p>
                  </div>
                </div>
              ))}
              <div className="map-placeholder">
                <span><i className="fas fa-map" style={{ marginRight: 8 }}></i> Google Maps &mdash; Accra, Ghana</span>
              </div>
              <div>
                <h5 style={{ marginBottom: 8 }}>Follow Us</h5>
                <div className="social-links">
                  {socialLinks.map((link, i) => (
                    <a key={i} href="#" aria-label={link.replace(/-/g, ' ')}><i className={`fab fa-${link}`}></i></a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" role="contentinfo">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <h4>Fraud<span>Shield</span></h4>
              <p>AI-powered Mobile Money fraud detection platform for Ghana. Protecting communities, one message at a time.</p>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                {['facebook-f', 'twitter', 'linkedin-in', 'youtube'].map((link, i) => (
                  <a key={i} href="#" style={{ color: 'rgba(255,255,255,0.4)' }} aria-label={link}><i className={`fab fa-${link}`}></i></a>
                ))}
              </div>
            </div>
            {[
              { title: 'Quick Links', links: ['Home', 'About', 'Features', 'Fraud Types'] },
              { title: 'Resources', links: ['Safety Tips', 'Testimonials', 'AI Chatbot'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Use', 'Cookie Policy'] },
              { title: 'Emergency', links: ['+233 55 123 4567', 'Report Fraud', 'Contact Us'] },
            ].map((col, i) => (
              <div className="footer-col" key={i}>
                <h5>{col.title}</h5>
                {col.links.map((link, j) => (
                  <a key={j} href="#contact" onClick={(e) => {
                    e.preventDefault();
                    const id = link.toLowerCase().replace(/\s+/g, '-');
                    const el = document.getElementById(id === 'ai-chatbot' ? 'chatbot-cta' : id === '+233-55-123-4567' ? 'contact' : id === 'report-fraud' ? 'contact' : id === 'contact-us' ? 'contact' : id === 'safety-tips' ? 'resources' : id === 'testimonials' ? 'testimonials' : id === 'fraud-types' ? 'fraud-types' : id);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}>{link}</a>
                ))}
              </div>
            ))}
          </div>

          <div className="footer-bottom">
            <span>&copy; 2026 FraudShield AI. All rights reserved.</span>
            <div className="footer-newsletter">
              <input type="email" placeholder="Subscribe to alerts" aria-label="Email for newsletter" />
              <button className="btn btn-primary btn-sm">Subscribe</button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
