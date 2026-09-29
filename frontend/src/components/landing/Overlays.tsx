import React, { useEffect, useState } from 'react';

/* Scroll Progress Bar */
export const ScrollProgress: React.FC = () => {
  useEffect(() => {
    const handleScroll = () => {
      const bar = document.getElementById('scrollProgress');
      if (!bar) return;
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      bar.style.width = progress + '%';
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return <div className="scroll-progress" id="scrollProgress" role="progressbar" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100}></div>;
};

/* Back to Top / Floating Chatbot / WhatsApp */
interface FloatingButtonsProps {
  onNavigateChat: () => void;
}

export const FloatingButtons: React.FC<FloatingButtonsProps> = ({ onNavigateChat }) => {
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBack(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="floating-buttons">
      <button className="floating-btn chatbot-float" onClick={onNavigateChat} aria-label="Open Chatbot">
        <i className="fas fa-robot"></i>
      </button>
      <a href="https://wa.me/233551234567" target="_blank" rel="noopener noreferrer" className="floating-btn whatsapp" aria-label="Chat on WhatsApp">
        <i className="fab fa-whatsapp"></i>
      </a>
      <button className={`floating-btn back-top${showBack ? ' visible' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
        <i className="fas fa-chevron-up"></i>
      </button>
    </div>
  );
};

/* Toast Notifications */
interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

let toastId = 0;
const listeners: ((toasts: Toast[]) => void)[] = [];
let toastsState: Toast[] = [];

export function showGlobalToast(type: Toast['type'], message: string) {
  const id = ++toastId;
  toastsState = [...toastsState, { id, type, message }];
  listeners.forEach(fn => fn(toastsState));
  setTimeout(() => {
    toastsState = toastsState.filter(t => t.id !== id);
    listeners.forEach(fn => fn(toastsState));
  }, 4500);
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      const idx = listeners.indexOf(setToasts);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }, []);

  const icons: Record<string, string> = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };

  return (
    <div className="toast-container" role="alert" aria-live="polite">
      {toasts.map(t => (
        <div className={`toast ${t.type}`} key={t.id}>
          <span className="icon"><i className={`fas ${icons[t.type]}`}></i></span>
          <span>{t.message}</span>
          <button className="close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} aria-label="Dismiss notification">
            <i className="fas fa-times"></i>
          </button>
        </div>
      ))}
    </div>
  );
};

/* Cookie Consent */
export const CookieConsent: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('fraudshield-cookies')) setShow(true);
  }, []);

  const accept = () => {
    localStorage.setItem('fraudshield-cookies', 'accepted');
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem('fraudshield-cookies', 'declined');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="cookie-consent show" role="dialog" aria-modal="true" aria-label="Cookie consent">
      <div className="container">
        <p>
          <i className="fas fa-cookie-bite" style={{ marginRight: 8 }}></i>
          We use cookies to enhance your experience. By continuing, you agree to our
          <a href="#" style={{ color: 'var(--primary)' }}> Privacy Policy</a>.
        </p>
        <div className="actions">
          <button className="btn btn-outline btn-sm" onClick={decline}>Decline</button>
          <button className="btn btn-primary btn-sm" onClick={accept}>Accept All</button>
        </div>
      </div>
    </div>
  );
};

/* Emergency Banner */
export const EmergencyBanner: React.FC = () => {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!show || dismissed) return null;

  return (
    <div className="emergency-banner" id="emergencyBanner">
      <i className="fas fa-triangle-exclamation" style={{ marginRight: 8 }} aria-hidden="true"></i>
      Urgent: New SIM swap scam reported in Accra. Verify all calls before sharing OTP.
      <a href="#learn-more" style={{ marginLeft: 4 }}>Learn more</a>
      <button style={{ background: 'none', border: 'none', color: '#fff', marginLeft: 12, cursor: 'pointer' }} onClick={() => setDismissed(true)} aria-label="Dismiss alert">
        <i className="fas fa-times" aria-hidden="true"></i>
      </button>
    </div>
  );
};

/* Fraud Ticker */
export const FraudTicker: React.FC = () => (
  <div className="fraud-ticker">
    <div className="ticker-content">
      <span> New Alert: <span className="highlight">Fake MTN promotion</span> targeting MoMo users in Kumasi</span>
      <span> Warning: <span className="highlight">Romance scam</span> on WhatsApp — be cautious of strangers asking for money</span>
      <span> Critical: <span className="highlight">SIM swap fraud</span> on the rise — protect your mobile money</span>
      <span> Update: <span className="highlight">New phishing SMS</span> impersonating Bank of Ghana</span>
      <span> New Alert: <span className="highlight">Fake MTN promotion</span> targeting MoMo users in Kumasi</span>
      <span> Warning: <span className="highlight">Romance scam</span> on WhatsApp — be cautious of strangers asking for money</span>
      <span> Critical: <span className="highlight">SIM swap fraud</span> on the rise — protect your mobile money</span>
      <span> Update: <span className="highlight">New phishing SMS</span> impersonating Bank of Ghana</span>
    </div>
  </div>
);
