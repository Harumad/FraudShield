import React, { useEffect } from 'react';
import {
  Navbar, Hero, AboutSection, FeaturesSection, HowItWorks,
  FraudTypes, AlertsSection, CommunityImpact, ChatbotCTA,
  ContactFooter, ScrollProgress, FloatingButtons, ToastContainer,
  CookieConsent, EmergencyBanner, FraudTicker, showGlobalToast,
} from '../components/landing';
import '../styles/landing.css';

interface LandingPageProps {
  onNavigateChat: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateChat }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      showGlobalToast('info', ' Welcome to FraudShield AI — Stay safe!');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    const els = document.querySelectorAll('.fade-up, .fade-left, .fade-right, .zoom-in');
    els.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page">
      <Navbar onNavigateChat={onNavigateChat} />
      <EmergencyBanner />
      <FraudTicker />
      <ScrollProgress />
      <main id="main-content">
        <Hero onNavigateChat={onNavigateChat} />
        <AboutSection />
        <div className="section-bg-alt"><FeaturesSection onNavigateChat={onNavigateChat} /></div>
        <HowItWorks />
        <div className="section-bg-alt"><FraudTypes /></div>
        <AlertsSection />
        <CommunityImpact />
        <ChatbotCTA onNavigateChat={onNavigateChat} />
      </main>
      <ContactFooter />
      <FloatingButtons onNavigateChat={onNavigateChat} />
      <ToastContainer />
      <CookieConsent />
    </div>
  );
};
