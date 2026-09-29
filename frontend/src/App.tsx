import React, { useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { ChatPanel } from './components/ChatPanel';

function App() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <LandingPage onNavigateChat={() => setChatOpen(true)} />
      <ChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}

export default App;
