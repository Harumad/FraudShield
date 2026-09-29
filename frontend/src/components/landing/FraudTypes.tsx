import React, { useState } from 'react';

const frauds = [
  { icon: 'fa-gift', title: 'Fake Promotions', desc: 'Scammers offer fake prizes or discounts to trick you into sending money.', risk: 'High Risk', riskClass: 'fraud-types__level--high', gradient: 'linear-gradient(135deg, #FEF2F2, #FFF7ED)', detail: 'Fake promotions trick victims with offers of prizes, discounts, or rewards. The scammer asks you to pay a "processing fee" or share your MoMo PIN to "claim" the prize. Never pay to receive a prize.' },
  { icon: 'fa-sms', title: 'Fake MTN Messages', desc: 'Impersonating MTN to steal your MoMo PIN or personal information.', risk: 'High Risk', riskClass: 'fraud-types__level--high', gradient: 'linear-gradient(135deg, #FFF7ED, #FEF2F2)', detail: 'Scammers send SMS messages that look like they are from MTN, claiming your account needs verification or you have won a reward. The message contains a link to a fake MTN portal designed to steal your credentials.' },
  { icon: 'fa-sim-card', title: 'SIM Swap', desc: 'Fraudsters take over your phone number to access your mobile money.', risk: 'Critical', riskClass: 'fraud-types__level--critical', gradient: 'linear-gradient(135deg, #FEF2F2, #FFE4E6)', detail: 'Fraudsters convince your mobile network to transfer your number to a new SIM card they control. Once they have your number, they can reset passwords and access your mobile money. Contact your network immediately if you lose service.' },
  { icon: 'fa-user-tie', title: 'Fake Agents', desc: 'Impersonating MoMo agents to collect money or personal details.', risk: 'High Risk', riskClass: 'fraud-types__level--high', gradient: 'linear-gradient(135deg, #F8FAFC, #FFF7ED)', detail: 'Scammers pose as official MoMo agents, often wearing fake uniforms or ID cards. They may offer to help with transactions but instead steal your money or details. Only use registered MoMo agents at official booths.' },
  { icon: 'fa-chart-pie', title: 'Investment Scam', desc: 'Promising high returns to lure you into sending money.', risk: 'Medium Risk', riskClass: 'fraud-types__level--medium', gradient: 'linear-gradient(135deg, #FFFBEB, #FEF9EF)', detail: 'Scammers promise unusually high returns on investments, often using pressure tactics to make you "act now." Legitimate investments never guarantee returns. Always verify investment schemes with the Securities and Exchange Commission.' },
  { icon: 'fa-whatsapp', title: 'WhatsApp Scam', desc: 'Fake WhatsApp messages from "friends" or "family" asking for money.', risk: 'High Risk', riskClass: 'fraud-types__level--high', gradient: 'linear-gradient(135deg, #F0FDF4, #FFF7ED)', detail: 'Scammers hack or spoof WhatsApp accounts and message contacts asking for money. They may claim to be in an emergency. Always verify through a phone call before sending money to anyone on WhatsApp.' },
  { icon: 'fa-heart', title: 'Romance Scam', desc: 'Building fake romantic relationships to request money.', risk: 'Medium Risk', riskClass: 'fraud-types__level--medium', gradient: 'linear-gradient(135deg, #FFF1F2, #FEF9EF)', detail: 'Fraudsters create fake profiles on dating sites or social media to build romantic relationships. Once trust is established, they request money for medical emergencies, travel, or business ventures.' },
  { icon: 'fa-briefcase', title: 'Job Scam', desc: 'Fake job offers requiring payment for application or training.', risk: 'Medium Risk', riskClass: 'fraud-types__level--medium', gradient: 'linear-gradient(135deg, #F8FAFC, #F1F5F9)', detail: 'Scammers advertise attractive job offers that require upfront payment for application fees, training materials, or work permits. Legitimate employers never ask for money as a condition of employment.' },
  { icon: 'fa-hand-holding-dollar', title: 'Loan Scam', desc: 'Offering loans with fraudulent upfront fees or fake approval.', risk: 'High Risk', riskClass: 'fraud-types__level--high', gradient: 'linear-gradient(135deg, #FFF7ED, #FEF2F2)', detail: 'Fraudsters offer quick loans with no credit check, requiring an upfront "processing fee" before disbursement. Once you pay the fee, they disappear. Only borrow from licensed financial institutions.' },
  { icon: 'fa-qrcode', title: 'QR Code Scam', desc: 'Fake QR codes that redirect to fraudulent payment pages.', risk: 'Medium Risk', riskClass: 'fraud-types__level--medium', gradient: 'linear-gradient(135deg, #F0FDF4, #F8FAFC)', detail: 'Scammers replace legitimate QR codes with fake ones that redirect to fraudulent payment pages. Always verify the QR code source before scanning and check the URL before entering payment details.' },
  { icon: 'fa-fish', title: 'Phishing', desc: 'Fake emails or SMS designed to steal your login credentials.', risk: 'High Risk', riskClass: 'fraud-types__level--high', gradient: 'linear-gradient(135deg, #FEF2F2, #FFE4E6)', detail: 'Phishing attacks use fake emails, SMS, or websites that mimic legitimate companies. They aim to steal your usernames, passwords, and MoMo PIN. Never click links in unsolicited messages.' },
  { icon: 'fa-user-secret', title: 'Social Engineering', desc: 'Manipulating people into revealing confidential information.', risk: 'High Risk', riskClass: 'fraud-types__level--high', gradient: 'linear-gradient(135deg, #F1F5F9, #E2E8F0)', detail: 'Social engineering scams manipulate victims through psychological tactics like urgency, authority, or sympathy. Scammers pose as bank officials, police, or family members to extract sensitive information.' },
];

export const FraudTypes: React.FC = () => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const toggleExpand = (i: number) => {
    setExpandedIdx(expandedIdx === i ? null : i);
  };

  return (
    <section className="fraud-section section-padding" id="fraud-types" aria-label="Fraud types">
      <div className="container">
        <div className="text-center">
          <span className="section-label">Fraud Types</span>
          <h2 className="section-title">Know the <span className="highlight">Scams</span></h2>
          <p className="section-subtitle mx-auto">Stay informed about the most common mobile money fraud schemes in Ghana.</p>
        </div>
        <div className="fraud-grid">
          {frauds.map((f, i) => (
            <div className={`fraud-card fraud-card--gradient fade-up${expandedIdx === i ? ' expanded' : ''}`} key={i} style={{ transitionDelay: `${i * 0.04}s`, '--card-gradient': f.gradient } as React.CSSProperties}>
              <div className="fraud-card-bg" style={{ background: f.gradient }}></div>
              <span className="icon"><i className={`fas ${f.icon}`}></i></span>
              <h5>{f.title}</h5>
              <p>{f.desc}</p>
              <span className={`warning ${f.riskClass}`}>{f.risk}</span>
              {expandedIdx === i && (
                <div className="fraud-detail">
                  <p>{f.detail}</p>
                </div>
              )}
              <button className="btn btn-outline btn-sm fraud-cta" onClick={() => toggleExpand(i)} aria-expanded={expandedIdx === i}>
                {expandedIdx === i ? 'Show Less' : 'Learn More'} <i className={`fas fa-arrow-${expandedIdx === i ? 'up' : 'right'}`}></i>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
