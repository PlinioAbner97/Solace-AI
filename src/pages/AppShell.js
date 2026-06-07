import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { globalCss } from '../utils/styles';
import { buildSystemPrompt, todayStr, nowTime, initials } from '../utils/companions';

export default function AppShell({ user, companion, memory: initMemory, messages: initMessages, onSignOut, onChangeCompanion }) {
  const [view, setView] = useState('chat');
  const [mode, setMode] = useState('friend');
  const [messages, setMessages] = useState(initMessages || []);
  const [memory, setMemory] = useState(initMemory || { profile: {}, facts: [], moodHistory: [], timeline: [] });
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [profileForm, setProfileForm] = useState(initMemory?.profile || {});
  const [saveOk, setSaveOk] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, sending]);

  // accent color from companion
  const accent = companion?.accent || 'var(--amber)';

  const sendMessage = useCallback(async () => {
    if (!input.trim() || sending) return;
    const userMsg = { role: 'user', content: input.trim(), time: nowTime() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setSending(true);

    try {
      await api.saveMessage('user', userMsg.content);

      const apiHistory = next.slice(-24).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      const systemPrompt = buildSystemPrompt(user, memory, companion, mode);
      const { reply } = await api.chat(apiHistory, systemPrompt);

      const aiMsg = { role: 'assistant', content: reply, time: nowTime() };
      const final = [...next, aiMsg];
      setMessages(final);
      await api.saveMessage('assistant', reply);

      // background memory extraction
      extractAndSaveMemory(userMsg.content);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm here — something went wrong on my end. Try again?", time: nowTime() }]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [input, sending, messages, user, memory, companion, mode]);

  const extractAndSaveMemory = async (userText) => {
    try {
      const extracted = await api.extractMemory(userText, memory.facts || []);
      const updated = { ...memory };
      if (extracted.newFacts?.length) {
        updated.facts = [...(memory.facts || []), ...extracted.newFacts].slice(-50);
      }
      if (extracted.mood) {
        updated.moodHistory = [...(memory.moodHistory || []), { mood: extracted.mood, date: todayStr() }].slice(-40);
      }
      if (extracted.milestone) {
        updated.timeline = [...(memory.timeline || []), { date: todayStr(), content: extracted.milestone }].slice(-60);
      }
      setMemory(updated);
      await api.saveMemory(updated);
    } catch { /* silent */ }
  };

  const saveProfile = async () => {
    try {
      await api.saveProfile(profileForm);
      setMemory(prev => ({ ...prev, profile: { ...prev.profile, ...profileForm } }));
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 2500);
    } catch { /* silent */ }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleSignOut = () => {
    localStorage.removeItem('solace_token');
    onSignOut();
    navigate('/');
  };

  const handleChangeCompanion = () => {
    navigate('/pick-companion');
  };

  const modes = [
    { id: 'friend', label: '💬 Friend' },
    { id: 'coach', label: '🎯 Coach' },
    { id: 'deep', label: '🌙 Deep' },
    { id: 'support', label: '🍃 Support' },
  ];

  return (
    <>
      <style>{globalCss}</style>
      <div className="app-shell">

        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sb-top">
            <div className="sb-logo">Solace <span>AI</span></div>
            <div className="sb-user">
              <div className="sb-avatar" style={{ background: `linear-gradient(135deg, ${accent}88, ${accent})` }}>
                {initials(user?.name)}
              </div>
              <div>
                <div className="sb-uname">{user?.name}</div>
                <div className="sb-since">Since {user?.createdAt}</div>
              </div>
            </div>
          </div>

          {companion && (
            <div className="sb-companion" style={{ borderColor: `${accent}33` }}>
              <div className="sb-comp-emoji">{companion.emoji}</div>
              <div>
                <div className="sb-comp-name">{companion.name}</div>
                <div className="sb-comp-online">
                  <div className="sb-comp-dot" style={{ background: 'var(--green)', boxShadow: '0 0 5px var(--green)' }} />
                  Always here
                </div>
              </div>
            </div>
          )}

          <div className="sb-nav">
            <div className="sb-section">Companion</div>
            <button className={`sb-item${view === 'chat' ? ' active' : ''}`} onClick={() => setView('chat')}>
              <span className="sb-icon">✦</span> Chat with {companion?.name || 'Solace'}
            </button>

            <div className="sb-section">Your Story</div>
            <button className={`sb-item${view === 'memory' ? ' active' : ''}`} onClick={() => setView('memory')}>
              <span className="sb-icon">🧠</span> Memory & Facts
            </button>
            <button className={`sb-item${view === 'journal' ? ' active' : ''}`} onClick={() => setView('journal')}>
              <span className="sb-icon">📖</span> Life Journal
            </button>

            <div className="sb-section">You</div>
            <button className={`sb-item${view === 'profile' ? ' active' : ''}`} onClick={() => setView('profile')}>
              <span className="sb-icon">🌱</span> Your Profile
            </button>

            <div className="sb-stats">
              <div className="sb-stats-label">Memory Stats</div>
              <div className="sb-stats-row">
                <div>💡 {memory?.facts?.length || 0} facts learned</div>
                <div>📝 {memory?.timeline?.length || 0} milestones</div>
                <div>💬 {messages.length} messages</div>
              </div>
              <div className="prog-bar" style={{ marginTop: 10 }}>
                <div className="prog-fill" style={{ width: `${Math.min(100, ((memory?.facts?.length || 0) / 20) * 100)}%` }} />
              </div>
            </div>
          </div>

          <div className="sb-bottom">
            <button className="sb-change-comp" onClick={handleChangeCompanion}>
              🔄 Change Companion
            </button>
            <button className="sb-signout" onClick={handleSignOut}>
              ↩ Sign Out
            </button>
          </div>
        </div>

        {/* MAIN */}
        <div className="main-area">

          {/* ── CHAT ── */}
          {view === 'chat' && (
            <div className="chat-view">
              <div className="chat-top">
                <div className="chat-comp-info">
                  <div className="chat-comp-av" style={{ background: `linear-gradient(135deg, ${accent}66, ${accent})`, boxShadow: `0 0 20px ${accent}44` }}>
                    {companion?.emoji || '✦'}
                  </div>
                  <div>
                    <div className="chat-comp-name">{companion?.name || 'Solace'}</div>
                    <div className="chat-comp-status">
                      <div className="status-dot" style={{ background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
                      <span style={{ color: 'var(--green)' }}>Always here for you</span>
                    </div>
                  </div>
                </div>
                <div className="mode-btns">
                  {modes.map(m => (
                    <button key={m.id} className={`mode-btn${mode === m.id ? ' active' : ''}`}
                      style={mode === m.id ? { borderColor: `${accent}66`, background: `${accent}14`, color: accent } : {}}
                      onClick={() => setMode(m.id)}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="msgs-area">
                {messages.length === 0 && (
                  <div className="welcome-box">
                    <div className="welcome-icon">{companion?.emoji || '✦'}</div>
                    <div className="welcome-title">Hello, <em>{user?.name}</em></div>
                    <p className="welcome-body">
                      I'm {companion?.name || 'Solace'} — your companion. I'm here to listen,
                      remember, and grow alongside you. What's on your mind today?
                    </p>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`msg-row ${msg.role === 'user' ? 'user' : 'ai'}`}>
                    <div>
                      <div className="msg-bubble"
                        style={msg.role === 'assistant' ? { borderColor: `${accent}22`, background: `${accent}0d` } : {}}>
                        {msg.content}
                      </div>
                      <div className="msg-time">{msg.time}</div>
                    </div>
                  </div>
                ))}

                {sending && (
                  <div className="msg-row ai">
                    <div className="typing-ind">
                      <div className="t-dot" /><div className="t-dot" /><div className="t-dot" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="input-area">
                <div className="input-row">
                  <textarea ref={inputRef} className="msg-input"
                    placeholder={`Talk to ${companion?.name || 'Solace'}…`}
                    value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={onKeyDown} rows={1} />
                  <button className="send-btn" onClick={sendMessage} disabled={sending || !input.trim()}
                    style={{ background: `linear-gradient(135deg, ${accent}, #c46e3a)` }}>
                    ↑
                  </button>
                </div>
                <div className="input-hint">Enter to send · Shift+Enter for new line</div>
              </div>
            </div>
          )}

          {/* ── MEMORY ── */}
          {view === 'memory' && (
            <div className="inner-view">
              <div className="view-title">What <em>{companion?.name || 'Solace'}</em> remembers</div>
              <p className="view-sub">Facts and patterns learned about you from your conversations.</p>
              <div className="mem-grid">
                {(!memory?.facts || memory.facts.length === 0) ? (
                  <div className="empty-box span2">
                    <div className="empty-icon">🌱</div>
                    <div className="empty-title">Your memory is just beginning to grow</div>
                    <div className="empty-hint">Start a conversation and {companion?.name} will start to know you.</div>
                  </div>
                ) : (
                  <>
                    <div className="mem-card span2">
                      <div className="mc-icon">💡</div>
                      <div className="mc-title">Things {companion?.name} knows about you</div>
                      <div style={{ marginTop: 8 }}>
                        {memory.facts.map((f, i) => (
                          <span key={i} className={`mtag ${i % 3 === 0 ? 'ta' : i % 3 === 1 ? 'tr' : 'tl'}`}>{f}</span>
                        ))}
                      </div>
                    </div>
                    {memory.moodHistory?.length > 0 && (
                      <div className="mem-card">
                        <div className="mc-icon">🌊</div>
                        <div className="mc-title">Recent Moods</div>
                        <div style={{ marginTop: 8 }}>
                          {memory.moodHistory.slice(-10).map((m, i) => (
                            <span key={i} className="mtag tr">{m.mood}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mem-card">
                      <div className="mc-icon">📊</div>
                      <div className="mc-title">Connection Depth</div>
                      <div className="mc-body">
                        {memory.facts.length < 5  ? 'Just getting to know you — keep talking!' :
                         memory.facts.length < 15 ? 'Building a real picture of who you are.' :
                                                    `${companion?.name} knows you deeply. Your story is rich and detailed.`}
                        <div className="prog-bar" style={{ marginTop: 12 }}>
                          <div className="prog-fill" style={{ width: `${Math.min(100, (memory.facts.length / 20) * 100)}%` }} />
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{memory.facts.length} / 20+ facts</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── JOURNAL ── */}
          {view === 'journal' && (
            <div className="inner-view">
              <div className="view-title">Your <em>Life Journal</em></div>
              <p className="view-sub">Milestones and meaningful moments witnessed in your journey together.</p>
              {(!memory?.timeline || memory.timeline.length === 0) ? (
                <div className="empty-box">
                  <div className="empty-icon">📖</div>
                  <div className="empty-title">Your story is just beginning</div>
                  <div className="empty-hint">Milestones appear here as {companion?.name} gets to know you.</div>
                </div>
              ) : (
                <div className="tl-wrap">
                  {[...memory.timeline].reverse().map((entry, i) => (
                    <div key={i} className="tl-item">
                      <div className="tl-dot" />
                      <div className="tl-date">{entry.date}</div>
                      <div className="tl-content">{entry.content}</div>
                      {entry.detail && <div className="tl-detail">{entry.detail}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE ── */}
          {view === 'profile' && (
            <div className="inner-view">
              <div className="view-title">Tell <em>{companion?.name || 'Solace'}</em> about you</div>
              <p className="view-sub">This context shapes every conversation — help your companion know you better right from the start.</p>
              <div className="pf-form">
                {[
                  { key: 'age',        label: 'Age',             placeholder: 'e.g. 28' },
                  { key: 'occupation', label: 'What do you do?', placeholder: 'e.g. Teacher, designer, student…' },
                  { key: 'location',   label: 'Where are you based?', placeholder: 'e.g. Brooklyn, NY' },
                ].map(f => (
                  <div key={f.key} className="pf-field">
                    <label className="pf-label">{f.label}</label>
                    <input className="pf-input" placeholder={f.placeholder}
                      value={profileForm[f.key] || ''}
                      onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
                <div className="pf-field">
                  <label className="pf-label">Anything you want {companion?.name} to know about you?</label>
                  <textarea className="pf-input" rows={4}
                    placeholder="Your goals, struggles, what matters to you…"
                    value={profileForm.about || ''}
                    onChange={e => setProfileForm(p => ({ ...p, about: e.target.value }))}
                    style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button className="save-btn" onClick={saveProfile}>Save Profile</button>
                  {saveOk && <span className="save-ok">✓ Saved</span>}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
