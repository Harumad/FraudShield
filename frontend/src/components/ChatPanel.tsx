import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getApiUrl, getFallbackApiUrls } from '../api';
import {
  Send, Sparkles, Plus, Trash2, AlertCircle, ThumbsUp, ThumbsDown,
  Copy, Check, Menu, Coins, TrendingUp,
  ShieldCheck, ChevronRight, X, Bot, User, MessageSquare, Zap
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

/* Chat Panel */
interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose }) => {
  const STORAGE_KEY = 'chatbox_panel_session';

  const [session, setSession] = useState<ChatSession>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch { }
    }
    return { id: `session_${Date.now()}`, title: 'New Chat Session', messages: [], createdAt: Date.now() };
  });
  const [input, setInput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
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
    checkBackendHealth();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session, isGenerating, isOpen]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(200, textareaRef.current.scrollHeight)}px`;
    }
  }, [input]);

  const checkBackendHealth = async () => {
    const candidates = [getApiUrl('/api/health'), ...getFallbackApiUrls('/api/health')];

    for (const url of candidates) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          setApiStatus('online');
          return;
        }
      } catch {
        // Try the next candidate.
      }
    }

    setApiStatus('offline');
  };

  const newSession = useCallback(() => {
    const newS: ChatSession = { id: `session_${Date.now()}`, title: 'New Chat Session', messages: [], createdAt: Date.now() };
    setSession(newS);
    setInput('');
  }, []);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || isGenerating) return;

    if (!customPrompt) setInput('');

    const userMsg: Message = { role: 'user', content: textToSend };

    let sessionTitle = session.title;
    if (session.messages.length === 0) {
      sessionTitle = textToSend.length > 25 ? `${textToSend.substring(0, 25)}...` : textToSend;
    }

    const updatedMessages = [...session.messages, userMsg];
    setSession(prev => ({ ...prev, title: sessionTitle, messages: updatedMessages }));

    setIsGenerating(true);
    setSession(prev => ({ ...prev, messages: [...updatedMessages, { role: 'assistant', content: '' }] }));

    try {
      const candidates = [getApiUrl('/api/chat'), ...getFallbackApiUrls('/api/chat')];
      let response: Response | null = null;

      for (const url of candidates) {
        try {
          response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: updatedMessages }),
          });
          if (response.ok) break;
        } catch {
          response = null;
        }
      }

      if (!response || !response.ok) {
        let errorMessage = 'The assistant service is currently unavailable.';
        try {
          const errorPayload = await response?.json();
          errorMessage = errorPayload?.detail || errorPayload?.message || errorPayload?.error || errorMessage;
        } catch {
          try {
            errorMessage = await response?.text() || errorMessage;
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
                setSession(prev => {
                  const msgs = [...prev.messages];
                  msgs[msgs.length - 1] = { role: 'assistant', content: accumulatedContent };
                  return { ...prev, messages: msgs };
                });
                break;
              }
              if (parsed.content) {
                accumulatedContent += parsed.content;
                setSession(prev => {
                  const msgs = [...prev.messages];
                  msgs[msgs.length - 1] = { role: 'assistant', content: accumulatedContent };
                  return { ...prev, messages: msgs };
                });
              }
            } catch { }
          }
        }
      }
    } catch (err: any) {
      setSession(prev => {
        const msgs = [...prev.messages];
        msgs[msgs.length - 1] = {
          role: 'assistant',
          content: `**Assistant unavailable**: ${err.message || 'The assistant service is currently unavailable.'}`
        };
        return { ...prev, messages: msgs };
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const copyToClipboard = (text: string, msgIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(`${session.id}_${msgIndex}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      <div className={`chat-panel-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`chat-panel ${isOpen ? 'open' : ''}`}>
        <div className="chat-panel-header">
          <div className="chat-panel-header-left">
            <div className="chat-panel-brand-icon">
              <Sparkles size={18} color="#ffffff" />
            </div>
            <div className="chat-panel-brand-text">
              <div className="chat-panel-brand-name">FraudShield AI</div>
              <div className="chat-panel-brand-status">
                <span className={`cp-status-dot ${apiStatus === 'online' ? 'online' : apiStatus === 'offline' ? 'offline' : ''}`} />
                <span className="cp-status-label">
                  {apiStatus === 'online' ? 'Online' : apiStatus === 'offline' ? 'Offline' : 'Connecting...'}
                </span>
              </div>
            </div>
          </div>
          <div className="chat-panel-header-actions">
            <button className="cp-header-btn" onClick={newSession} title="New conversation">
              <Plus size={16} />
            </button>
            <button className="cp-header-btn cp-close-btn" onClick={onClose} title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="chat-panel-body">
          {session.messages.length === 0 ? (
            <div className="cp-welcome">
              <div className="cp-welcome-badge">
                <Bot size={32} />
              </div>
              <h2 className="cp-welcome-title">FraudShield AI</h2>
              <p className="cp-welcome-sub">
                Your intelligent fraud detection assistant. Analyze messages, detect scams, and get safety tips.
              </p>
              <div className="cp-welcome-chips">
                {suggestions.map(s => (
                  <button key={s.id} className="cp-chip" onClick={() => handleSend(s.prompt)}>
                    <span className="cp-chip-icon">{s.icon}</span>
                    <span className="cp-chip-info">
                      <span className="cp-chip-title">{s.title}</span>
                      <span className="cp-chip-desc">{s.desc}</span>
                    </span>
                    <ChevronRight size={14} className="cp-chip-arrow" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="cp-messages">
              {session.messages.map((msg, idx) => (
                <div key={idx} className={`cp-msg ${msg.role}`}>
                  {msg.role === 'assistant' && (
                    <div className="cp-msg-avatar">
                      <Bot size={14} />
                    </div>
                  )}
                  <div className="cp-msg-bubble">
                    <div className="cp-msg-role">
                      {msg.role === 'user' ? 'You' : 'FraudShield AI'}
                    </div>
                    <div className="cp-msg-content">
                      <MarkdownText content={msg.content} />
                      {isGenerating && idx === session.messages.length - 1 && msg.role === 'assistant' && msg.content === '' && (
                        <div className="cp-typing">
                          <span className="cp-typing-dot" />
                          <span className="cp-typing-dot" />
                          <span className="cp-typing-dot" />
                        </div>
                      )}
                      {isGenerating && idx === session.messages.length - 1 && msg.role === 'assistant' && msg.content !== '' && (
                        <span className="cp-stream-cursor" />
                      )}
                    </div>
                    {msg.content !== '' && (
                      <div className="cp-msg-actions">
                        <button className="cp-action-btn" onClick={() => copyToClipboard(msg.content, idx)} title="Copy">
                          {copiedId === `${session.id}_${idx}` ? <><Check size={11} color="var(--color-success)" /> Copied</> : <><Copy size={11} /> Copy</>}
                        </button>
                        {msg.role === 'assistant' && (
                          <>
                            <button className="cp-action-btn" title="Helpful"><ThumbsUp size={11} /></button>
                            <button className="cp-action-btn" title="Not helpful"><ThumbsDown size={11} /></button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="chat-panel-input">
          <div className="cp-input-area">
            <textarea
              ref={textareaRef} rows={1}
              placeholder="Ask about fraud detection, messages, phone numbers..."
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown} disabled={isGenerating}
            />
            <div className="cp-input-bar">
              <span className="cp-input-hint">Enter to send · Shift+Enter for new line</span>
              <button className="cp-send-btn" onClick={() => handleSend()} disabled={isGenerating || !input.trim()} aria-label="Send">
                <Send size={15} />
              </button>
            </div>
          </div>
          <div className="cp-disclaimer">
            <AlertCircle size={10} />
            <span> FraudShield AI provides fraud detection guidance only. For emergencies, contact local authorities.</span>
          </div>
        </div>
      </div>
    </>
  );
};
