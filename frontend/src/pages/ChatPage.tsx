import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getApiUrl } from '../api';
import {
  Send, Sparkles, Plus, Trash2, AlertCircle, ThumbsUp, ThumbsDown,
  Copy, Check, Menu, Coins, TrendingUp,
  Terminal, ShieldCheck, ChevronRight, ArrowLeft
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

interface SuggestionChip {
  id: string;
  title: string;
  desc: string;
  prompt: string;
  icon: React.ReactNode;
}

/* Inline Markdown & Table Parser */
const MarkdownText: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let currentTable: { headers: string[]; rows: string[][] } | null = null;
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  const flushList = (key: number) => {
    if (!currentList) return null;
    const ListTag = currentList.type;
    const element = (
      <ListTag key={`list-${key}`} className={ListTag}>
        {currentList.items.map((item, idx) => <li key={idx}>{parseInlineFormatting(item)}</li>)}
      </ListTag>
    );
    currentList = null;
    return element;
  };

  const flushTable = (key: number) => {
    if (!currentTable) return null;
    const element = (
      <div key={`table-wrapper-${key}`} className="table-wrapper">
        <table>
          <thead><tr>{currentTable.headers.map((h, idx) => <th key={idx}>{parseInlineFormatting(h)}</th>)}</tr></thead>
          <tbody>{currentTable.rows.map((row, rowIdx) => <tr key={rowIdx}>{row.map((cell, cellIdx) => <td key={cellIdx}>{parseInlineFormatting(cell)}</td>)}</tr>)}</tbody>
        </table>
      </div>
    );
    currentTable = null;
    return element;
  };

  const flushCodeBlock = (key: number) => {
    if (codeBlockLines.length === 0) return null;
    const text = codeBlockLines.join('\n');
    codeBlockLines = [];
    return <pre key={`code-${key}`}><code>{text}</code></pre>;
  };

  const parseInlineFormatting = (text: string): React.ReactNode[] => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={idx}>{part.slice(2, -2)}</strong>;
      const codeParts = part.split(/(`[^`]+`)/g);
      return codeParts.map((cPart, cIdx) => {
        if (cPart.startsWith('`') && cPart.endsWith('`')) return <code key={`${idx}-${cIdx}`}>{cPart.slice(1, -1)}</code>;
        return cPart;
      });
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        const el = flushCodeBlock(i);
        if (el) renderedElements.push(el);
      } else {
        const listEl = flushList(i);
        if (listEl) renderedElements.push(listEl);
        const tableEl = flushTable(i);
        if (tableEl) renderedElements.push(tableEl);
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) { codeBlockLines.push(line); continue; }

    if (trimmed.startsWith('#')) {
      const listEl = flushList(i); if (listEl) renderedElements.push(listEl);
      const tableEl = flushTable(i); if (tableEl) renderedElements.push(tableEl);
      const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2];
        const HeaderTag = `h${Math.min(6, level + 2)}` as keyof JSX.IntrinsicElements;
        renderedElements.push(<HeaderTag key={i} className="markdown-header">{parseInlineFormatting(text)}</HeaderTag>);
      }
      continue;
    }

    if (trimmed.startsWith('|')) {
      const listEl = flushList(i); if (listEl) renderedElements.push(listEl);
      const cells = trimmed.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
      const isSeparator = cells.every(c => /^:-*-*:?$/.test(c) || /^-+$/.test(c));
      if (isSeparator) continue;
      if (!currentTable) { currentTable = { headers: cells, rows: [] }; }
      else { currentTable.rows.push(cells); }
      continue;
    } else {
      if (currentTable) { const el = flushTable(i); if (el) renderedElements.push(el); }
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const tableEl = flushTable(i); if (tableEl) renderedElements.push(tableEl);
      const text = trimmed.substring(2);
      if (!currentList) { currentList = { type: 'ul', items: [text] }; }
      else { currentList.items.push(text); }
      continue;
    } else if (/^\d+\.\s+/.test(trimmed)) {
      const tableEl = flushTable(i); if (tableEl) renderedElements.push(tableEl);
      const text = trimmed.replace(/^\d+\.\s+/, '');
      if (!currentList) { currentList = { type: 'ol', items: [text] }; }
      else { currentList.items.push(text); }
      continue;
    } else {
      if (currentList) { const el = flushList(i); if (el) renderedElements.push(el); }
    }

    if (!trimmed) { renderedElements.push(<div key={i} className="blank-spacer" style={{ height: '8px' }} />); continue; }

    renderedElements.push(<p key={i}>{parseInlineFormatting(line)}</p>);
  }

  const listEl = flushList(lines.length); if (listEl) renderedElements.push(listEl);
  const tableEl = flushTable(lines.length); if (tableEl) renderedElements.push(tableEl);
  const codeEl = flushCodeBlock(lines.length); if (codeEl) renderedElements.push(codeEl);

  return <>{renderedElements}</>;
};

/* Chat Page */
interface ChatPageProps {
  onNavigateHome: () => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({ onNavigateHome }) => {
  const STORAGE_KEY_SESSIONS = 'finbot_chat_sessions';
  const STORAGE_KEY_ACTIVE = 'finbot_active_session_id';

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [input, setInput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestions: SuggestionChip[] = [
    { id: 'detect', title: 'Detect Fraud', desc: 'Analyze a suspicious message or SMS', prompt: 'I received a message saying I won a prize and need to send money to claim it. Is this a scam? Can you help me analyze if this is fraud?', icon: <ShieldCheck size={20} /> },
    { id: 'phishing', title: 'Spot Phishing', desc: 'Learn to identify fake SMS and emails', prompt: 'What are the most common signs of a phishing SMS or email? How can I tell if a message from my bank is real or fake?', icon: <AlertCircle size={20} /> },
    { id: 'safety', title: 'Safety Tips', desc: 'Best practices for mobile money security', prompt: 'What are the top 10 safety tips for protecting my mobile money account from fraud and scams?', icon: <Coins size={20} /> },
    { id: 'scam', title: 'Common Scams', desc: 'Learn about prevalent fraud schemes in Ghana', prompt: 'What are the most common mobile money scams in Ghana right now and how can I protect myself from them?', icon: <TrendingUp size={20} /> },
  ];

  useEffect(() => {
    const savedSessions = localStorage.getItem(STORAGE_KEY_SESSIONS);
    const savedActiveId = localStorage.getItem(STORAGE_KEY_ACTIVE);

    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions) as ChatSession[];
        setSessions(parsed);
        if (savedActiveId && parsed.some(s => s.id === savedActiveId)) {
          setActiveSessionId(savedActiveId);
        } else if (parsed.length > 0) {
          setActiveSessionId(parsed[0].id);
        }
      } catch (e) {
        console.error('Failed to parse chat sessions', e);
        createNewSession();
      }
    } else {
      createNewSession();
    }

    checkBackendHealth();
  }, []);

  useEffect(() => {
    if (sessions.length > 0) localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (activeSessionId) localStorage.setItem(STORAGE_KEY_ACTIVE, activeSessionId);
  }, [activeSessionId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [sessions, activeSessionId, isGenerating]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(200, textareaRef.current.scrollHeight)}px`;
    }
  }, [input]);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch(getApiUrl('/api/health'));
      if (response.ok) setApiStatus('online');
      else setApiStatus('offline');
    } catch (e) { setApiStatus('offline'); }
  };

  const createNewSession = useCallback(() => {
    const newId = `session_${Date.now()}`;
    const newSession: ChatSession = { id: newId, title: 'New Chat Session', messages: [], createdAt: Date.now() };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setInput('');
  }, []);

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = sessions.filter(s => s.id !== id);
    setSessions(remaining);
    if (activeSessionId === id) {
      if (remaining.length > 0) setActiveSessionId(remaining[0].id);
      else createNewSession();
    }
  };

  const clearAllSessions = () => {
    const fallbackId = `session_${Date.now()}`;
    const fallbackSession: ChatSession = { id: fallbackId, title: 'New Chat Session', messages: [], createdAt: Date.now() };
    setSessions([fallbackSession]);
    setActiveSessionId(fallbackId);
    localStorage.removeItem(STORAGE_KEY_SESSIONS);
    localStorage.removeItem(STORAGE_KEY_ACTIVE);
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || isGenerating || !activeSession) return;

    if (!customPrompt) setInput('');

    const userMsg: Message = { role: 'user', content: textToSend };
    const updatedMessages = [...activeSession.messages, userMsg];

    let sessionTitle = activeSession.title;
    if (activeSession.messages.length === 0) {
      sessionTitle = textToSend.length > 25 ? `${textToSend.substring(0, 25)}...` : textToSend;
    }

    setSessions(prev => prev.map(s => {
      if (s.id === activeSession.id) return { ...s, title: sessionTitle, messages: updatedMessages };
      return s;
    }));

    setIsGenerating(true);
    setSessions(prev => prev.map(s => {
      if (s.id === activeSession.id) {
        return { ...s, messages: [...updatedMessages, { role: 'assistant', content: '' }] };
      }
      return s;
    }));

    try {
      const response = await fetch(getApiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        let errorMessage = 'The assistant service is currently unavailable.';
        try {
          const errorPayload = await response.json();
          errorMessage = errorPayload.detail || errorPayload.message || errorPayload.error || errorMessage;
        } catch {
          try {
            errorMessage = await response.text();
          } catch {}
        }
        throw new Error(errorMessage);
      }

      if (!response.body) throw new Error('No readable body in stream response');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const cleanLine = line.trim();
          if (!cleanLine) continue;

          if (cleanLine.startsWith('data: ')) {
            const dataStr = cleanLine.substring(6);
            if (dataStr === '[DONE]') break;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                accumulatedContent = parsed.content || parsed.error;
                setSessions(prev => prev.map(s => {
                  if (s.id === activeSession.id) {
                    const freshMsgs = [...s.messages];
                    freshMsgs[freshMsgs.length - 1] = { role: 'assistant', content: accumulatedContent };
                    return { ...s, messages: freshMsgs };
                  }
                  return s;
                }));
                break;
              }
              if (parsed.content) {
                accumulatedContent += parsed.content;
                setSessions(prev => prev.map(s => {
                  if (s.id === activeSession.id) {
                    const freshMsgs = [...s.messages];
                    freshMsgs[freshMsgs.length - 1] = { role: 'assistant', content: accumulatedContent };
                    return { ...s, messages: freshMsgs };
                  }
                  return s;
                }));
              }
            } catch (e) { console.error('SSE JSON error', e); }
          }
        }
      }
    } catch (err: any) {
      console.error('Stream failure', err);
      setSessions(prev => prev.map(s => {
        if (s.id === activeSession.id) {
          const freshMsgs = [...s.messages];
          freshMsgs[freshMsgs.length - 1] = {
            role: 'assistant',
            content: `**Assistant unavailable**: ${err.message || 'The assistant service is currently unavailable.'}`
          };
          return { ...s, messages: freshMsgs };
        }
        return s;
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const copyToClipboard = (text: string, msgIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(`${activeSessionId}_${msgIndex}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="app-container">
      <div className={`sidebar-overlay ${mobileSidebarOpen ? 'open' : ''}`} onClick={() => setMobileSidebarOpen(false)} />

      <aside className={`sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button onClick={onNavigateHome} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', color: 'inherit', padding: 0, width: '100%' }}>
            <div className="sidebar-logo-container"><Sparkles size={22} color="#ffffff" /></div>
            <div className="sidebar-title-box">
              <span className="sidebar-brand-name">FraudShield AI</span>
              {apiStatus === 'online' && <span className="sidebar-brand-sub" style={{ color: 'var(--color-success)' }}>Connected</span>}
              {apiStatus === 'offline' && <span className="sidebar-brand-sub" style={{ color: 'var(--color-danger)' }}>Offline</span>}
              {apiStatus === 'checking' && <span className="sidebar-brand-sub">Checking...</span>}
            </div>
          </button>
        </div>

        <button className="new-chat-button" onClick={createNewSession}><Plus size={16} /> New Chat</button>
        <div className="history-section-title">Conversations</div>

        <div className="history-container">
          {sessions.map(s => (
            <button key={s.id} className={`history-item ${activeSessionId === s.id ? 'active' : ''}`} onClick={() => { setActiveSessionId(s.id); setMobileSidebarOpen(false); }}>
              <Terminal size={14} style={{ opacity: 0.6 }} />
              <span className="history-item-text">{s.messages.length === 0 ? 'Empty Conversation' : s.title}</span>
              <button className="history-delete-btn" onClick={(e) => deleteSession(s.id, e)} title="Delete Session"><Trash2 size={12} /></button>
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="api-status">
            <span className={`status-dot ${apiStatus === 'online' ? 'active-glow' : apiStatus === 'offline' ? 'error' : ''}`} />
            <span>Backend: {apiStatus === 'online' ? 'Connected' : apiStatus === 'offline' ? 'Disconnected' : 'Checking...'}</span>
          </div>
          <button className="clear-all-btn" onClick={clearAllSessions}><Trash2 size={13} /> Clear All History</button>
          <button className="clear-all-btn" onClick={onNavigateHome} style={{ borderTop: '1px solid var(--border-color)', paddingTop: 8, marginTop: 4 }}>
            <ArrowLeft size={13} style={{ marginRight: 6 }} /> Back to Home
          </button>
        </div>
      </aside>

      <main className="chat-container">
        <header className="chat-header glass-panel">
          <div className="chat-header-info">
            <button className="mobile-menu-btn" onClick={() => setMobileSidebarOpen(true)} aria-label="Open Sidebar Menu"><Menu size={20} /></button>
            <h1 className="chat-header-title">FraudShield AI Chatbot</h1>
            <span className="chat-header-model-badge">AI Fraud Detection</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={16} color="var(--color-success)" />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Fraud Detection & Prevention</span>
          </div>
        </header>

        <div className="messages-scroller">
          {activeSession && activeSession.messages.length === 0 ? (
            <div className="welcome-panel">
              <div className="welcome-bot-badge"><Coins size={32} color="#ffffff" /></div>
              <h2 className="welcome-title">FraudShield AI Assistant</h2>
              <p className="welcome-subtitle">
                Welcome to FraudShield AI. Chat with our intelligent assistant to analyze suspicious messages,
                detect scams, verify phone numbers, and get fraud prevention advice.
              </p>
              <div className="chips-grid">
                {suggestions.map(s => (
                  <div key={s.id} className="chip-card glass-panel glass-panel-hover" onClick={() => handleSend(s.prompt)}>
                    <div className="chip-icon">{s.icon}</div>
                    <div className="chip-title">{s.title}</div>
                    <div className="chip-desc">{s.desc}</div>
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', color: 'var(--color-primary)', fontSize: 11, fontWeight: 600 }}>
                      Try Prompt <ChevronRight size={12} style={{ marginLeft: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            activeSession?.messages.map((msg, idx) => (
              <div key={idx} className={`message-wrapper ${msg.role}`}>
                <div className="message-bubble">
                  <div className="message-bubble-header">{msg.role === 'user' ? 'You' : 'FraudShield AI'}</div>
                  <div className="message-text">
                    <MarkdownText content={msg.content} />
                    {isGenerating && idx === activeSession.messages.length - 1 && msg.role === 'assistant' && msg.content === '' && (
                      <div className="typing-skeleton"><div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" /></div>
                    )}
                    {isGenerating && idx === activeSession.messages.length - 1 && msg.role === 'assistant' && msg.content !== '' && (
                      <span className="streaming-cursor" />
                    )}
                  </div>
                  {msg.content !== '' && (
                    <div className="message-footer">
                      <button className="msg-action-btn" onClick={() => copyToClipboard(msg.content, idx)} title="Copy message text">
                        {copiedId === `${activeSessionId}_${idx}` ? <><Check size={12} color="var(--color-success)" /> Copied</> : <><Copy size={12} /> Copy</>}
                      </button>
                      {msg.role === 'assistant' && (
                        <>
                          <button className="msg-action-btn" title="Like response"><ThumbsUp size={12} /></button>
                          <button className="msg-action-btn" title="Dislike response"><ThumbsDown size={12} /></button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-panel">
          <div className="input-container glass-panel">
            <textarea
              ref={textareaRef} rows={1} className="textarea-box"
              placeholder="Ask about fraud detection, messages, phone numbers..."
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown} disabled={isGenerating}
            />
            <div className="input-controls">
              <span className="input-info-text">Press Enter to send, Shift+Enter for new line</span>
              <button className="send-button" onClick={() => handleSend()} disabled={isGenerating || !input.trim()} aria-label="Send message">
                <Send size={16} />
              </button>
            </div>
          </div>
          <footer className="general-notice">
            <AlertCircle size={12} style={{ flexShrink: 0 }} />
            <span> FraudShield AI provides fraud detection guidance only. For emergencies, contact local authorities.</span>
          </footer>
        </div>
      </main>
    </div>
  );
};
