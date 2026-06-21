import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { globalCss } from '../utils/styles';
import { buildSystemPrompt, todayStr, nowTime, initials } from '../utils/companions';
import { useLanguage } from '../utils/LanguageContext';

export default function AppShell({ user, companion, memory: initMemory, messages: initMessages, onSignOut, onChangeCompanion }) {
  const [view, setView] = useState('chat');
  const [mode, setMode] = useState('friend');
  const [messages, setMessages] = useState(initMessages || []);
  const [memory, setMemory] = useState(initMemory || { profile: {}, facts: [], moodHistory: [], timeline: [] });
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [profileForm, setProfileForm] = useState(initMemory?.profile || {});
  const [saveOk, setSaveOk] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkinMsg, setCheckinMsg] = useState(null);
  const [checkinVisible, setCheckinVisible] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { t, lang, setLang } = useLanguage();

  // Reload messages and memory whenever companion changes
  useEffect(() => {
    if (!companion?.name) return;
    (async () => {
      try {
        const mem  = await api.getMemory(companion.name);
        const { messages: msgs } = await api.getMessages(companion.name);
        setMemory(mem);
        setMessages(msgs);
        setProfileForm(mem.profile || {});
      } catch (e) {
        console.warn('Failed to reload companion data:', e.message);
      }
    })();
  }, [companion?.name]);

  // Fetch today's proactive check-in — once per companion per day, cached server-side
  useEffect(() => {
    if (!companion?.name) return;
    setCheckinMsg(null);
    setCheckinVisible(false);
    (async () => {
      try {
        const { message } = await api.getCheckin(companion.name, companion.name, companion.trait, lang);
        if (message) {
          setCheckinMsg(message);
          // small delay so it feels like it's arriving, not just slapped on screen
          setTimeout(() => setCheckinVisible(true), 400);
        }
      } catch (e) {
        console.warn('Checkin fetch failed:', e.message);
      }
    })();
  }, [companion?.name, lang]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, sending]);

  const accent = companion?.accent || 'var(--amber)';

  const sendMessage = useCallback(async () => {
    if (!input.trim() || sending) return;
    const userMsg = { role: 'user', content: input.trim(), time: nowTime() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setSending(true);

    try {
      api.saveMessage('user', userMsg.content, companion?.name).catch(e => console.warn('Save user msg failed:', e.message));

      const apiHistory = next.slice(-24).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      // Pass the current language so the companion replies in the right one
      const systemPrompt = buildSystemPrompt(user, memory, companion, mode, lang);
      const { reply } = await api.chat(apiHistory, systemPrompt);

      const aiMsg = { role: 'assistant', content: reply, time: nowTime() };
      const final = [...next, aiMsg];
      setMessages(final);

      api.saveMessage('assistant', reply, companion?.name).catch(e => console.warn('Save ai msg failed:', e.message));

      extractAndSaveMemory(userMsg.content);
    } catch (e) {
      console.error('Chat error:', e.message);
      const errText = e.message?.includes('GROQ') || e.message?.includes('AI')
        ? `${t('chat_errorGoneWrong')}: ${e.message}`
        : e.message?.includes('Network') || e.message?.includes('reach')
        ? t('chat_errorNetwork')
        : `${t('chat_errorGoneWrong')}: ${e.message}`;
      setMessages(prev => [...prev, { role: 'assistant', content: errText, time: nowTime() }]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [input, sending, messages, user, memory, companion, mode, lang]);

  const extractAndSaveMemory = async (userText) => {
    try {
      const extracted = await api.extractMemory(userText, memory.facts || []);
      const updated = {
        profile:     memory.profile     || {},
        facts:       [...(memory.facts       || [])],
        moodHistory: [...(memory.moodHistory || [])],
        timeline:    [...(memory.timeline    || [])],
      };
      if (extracted.newFacts?.length) {
        updated.facts = [...updated.facts, ...extracted.newFacts].slice(-50);
      }
      if (extracted.mood) {
        updated.moodHistory = [...updated.moodHistory, { mood: extracted.mood, date: todayStr() }].slice(-40);
      }
      if (extracted.milestone) {
        updated.timeline = [...updated.timeline, { date: todayStr(), content: extracted.milestone }].slice(-60);
      }
      setMemory(updated);
      await api.saveMemory(updated, companion?.name);
    } catch (e) {
      console.warn('Memory save failed:', e.message);
    }
  };

  const saveProfile = async () => {
    try {
      await api.saveProfile(profileForm, companion?.name);
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

  const handleChangeCompanion = () => navigate('/pick-companion');

  const acceptCheckin = () => {
    if (!checkinMsg) return;
    const aiMsg = { role: 'assistant', content: checkinMsg, time: nowTime() };
    setMessages(prev => [...prev, aiMsg]);
    api.saveMessage('assistant', checkinMsg, companion?.name).catch(() => {});
    setCheckinVisible(false);
    setTimeout(() => setCheckinMsg(null), 400);
  };

  const dismissCheckin = () => {
    setCheckinVisible(false);
    setTimeout(() => setCheckinMsg(null), 400);
  };

  const modes = [
    { id: 'friend',  emoji: '💬', label: t('mode_friend') },
    { id: 'coach',   emoji: '🎯', label: t('mode_coach') },
    { id: 'deep',    emoji: '🌙', label: t('mode_deep') },
    { id: 'support', emoji: '🍃', label: t('mode_support') },
  ];

  const compName = companion?.name || 'Solace';

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
                <div className="sb-since">{t('sb_since')} {user?.createdAt}</div>
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
                  {t('sb_alwaysHere')}
                </div>
              </div>
            </div>
          )}

          <div className="sb-nav">
            <div className="sb-section">{t('sb_companion')}</div>
            <button className={`sb-item${view === 'chat' ? ' active' : ''}`} onClick={() => setView('chat')}>
              <span className="sb-icon">✦</span> {t('sb_chatWith')} {compName}
            </button>

            <div className="sb-section">{t('sb_yourStory')}</div>
            <button className={`sb-item${view === 'memory' ? ' active' : ''}`} onClick={() => setView('memory')}>
              <span className="sb-icon">🧠</span> {t('sb_memoryFacts')}
            </button>
            <button className={`sb-item${view === 'journal' ? ' active' : ''}`} onClick={() => setView('journal')}>
              <span className="sb-icon">📖</span> {t('sb_lifeJournal')}
            </button>

            <div className="sb-section">{t('sb_you')}</div>
            <button className={`sb-item${view === 'profile' ? ' active' : ''}`} onClick={() => setView('profile')}>
              <span className="sb-icon">🌱</span> {t('sb_yourProfile')}
            </button>

            <div className="sb-stats">
              <div className="sb-stats-label">{t('sb_memoryStats')}</div>
              <div className="sb-stats-row">
                <div>💡 {memory?.facts?.length || 0} {t('sb_factsLearned')}</div>
                <div>📝 {memory?.timeline?.length || 0} {t('sb_milestones')}</div>
                <div>💬 {messages.length} {t('sb_messages')}</div>
              </div>
              <div className="prog-bar" style={{ marginTop: 10 }}>
                <div className="prog-fill" style={{ width: `${Math.min(100, ((memory?.facts?.length || 0) / 20) * 100)}%` }} />
              </div>
            </div>

            <div className="lang-switch-sidebar">
              <button className={`lang-btn${lang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')}>EN</button>
              <button className={`lang-btn${lang === 'es' ? ' active' : ''}`} onClick={() => setLang('es')}>ES</button>
            </div>
          </div>

          <div className="sb-bottom sb-bottom-desktop">
            <button className="sb-change-comp" onClick={handleChangeCompanion}>
              <span className="sb-change-comp-emoji">🔄</span>
              <span>{t('sb_changeCompanion').replace('🔄 ', '')}</span>
            </button>
            <button className="sb-signout" onClick={handleSignOut}>
              <span className="sb-signout-emoji">↩</span>
              <span>{t('sb_signOut').replace('↩ ', '')}</span>
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
                    <div className="chat-comp-name">{compName}</div>
                    <div className="chat-comp-status">
                      <div className="status-dot" style={{ background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
                      <span style={{ color: 'var(--green)' }}>{t('chat_alwaysHereForYou')}</span>
                    </div>
                  </div>
                </div>
                <button className="menu-trigger" onClick={() => setMenuOpen(true)} aria-label="Menu">⋯</button>
                <div className="mode-btns">
                  {modes.map(m => (
                    <button key={m.id} className={`mode-btn${mode === m.id ? ' active' : ''}`}
                      style={mode === m.id ? { borderColor: `${accent}66`, background: `${accent}14`, color: accent } : {}}
                      onClick={() => setMode(m.id)}>
                      {m.emoji} <span className="mode-label-text">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {checkinMsg && (
                <div className={`checkin-card${checkinVisible ? ' checkin-visible' : ''}`}>
                  <div className="checkin-icon">{companion?.emoji || '✦'}</div>
                  <div className="checkin-body">
                    <div className="checkin-label">
                      {lang === 'es' ? `${compName} pensó en ti` : `${compName} was thinking of you`}
                    </div>
                    <div className="checkin-text">{checkinMsg}</div>
                    <div className="checkin-actions">
                      <button className="checkin-reply" onClick={acceptCheckin}>
                        {lang === 'es' ? 'Responder' : 'Reply'}
                      </button>
                      <button className="checkin-dismiss" onClick={dismissCheckin}>
                        {lang === 'es' ? 'Ahora no' : 'Not now'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="msgs-area">
                {messages.length === 0 && (
                  <div className="welcome-box">
                    <div className="welcome-icon">{companion?.emoji || '✦'}</div>
                    <div className="welcome-title">{t('chat_welcomeHello')} <em>{user?.name}</em></div>
                    <p className="welcome-body">{t('chat_welcomeBody')}</p>

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
                    placeholder={`${t('chat_talkTo')} ${compName}…`}
                    value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={onKeyDown} rows={1} />
                  <button className="send-btn" onClick={sendMessage} disabled={sending || !input.trim()}>
                    ↑
                  </button>
                </div>
                <div className="input-hint">{t('chat_inputHint')}</div>
              </div>
            </div>
          )}

          {/* ── MEMORY ── */}
          {view === 'memory' && (
            <div className="inner-view">
              <div className="view-title">{t('memory_title_1')} <em>{compName}</em> {t('memory_title_em')}</div>
              <p className="view-sub">{t('memory_sub')}</p>
              <div className="mem-grid">
                {(!memory?.facts || memory.facts.length === 0) ? (
                  <div className="empty-box span2">
                    <div className="empty-icon">🌱</div>
                    <div className="empty-title">{t('memory_emptyTitle')}</div>
                    <div className="empty-hint">{t('memory_emptyHint', { name: compName })}</div>
                  </div>
                ) : (
                  <>
                    <div className="mem-card span2">
                      <div className="mc-icon">💡</div>
                      <div className="mc-title">{t('memory_knowsTitle', { name: compName })}</div>
                      <div style={{ marginTop: 8 }}>
                        {memory.facts.map((f, i) => (
                          <span key={i} className={`mtag ${i % 3 === 0 ? 'ta' : i % 3 === 1 ? 'tr' : 'tl'}`}>{f}</span>
                        ))}
                      </div>
                    </div>
                    {memory.moodHistory?.length > 0 && (
                      <div className="mem-card">
                        <div className="mc-icon">🌊</div>
                        <div className="mc-title">{t('memory_recentMoods')}</div>
                        <div style={{ marginTop: 8 }}>
                          {memory.moodHistory.slice(-10).map((m, i) => (
                            <span key={i} className="mtag tr">{m.mood}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mem-card">
                      <div className="mc-icon">📊</div>
                      <div className="mc-title">{t('memory_connectionDepth')}</div>
                      <div className="mc-body">
                        {memory.facts.length < 5  ? t('memory_depth_low') :
                         memory.facts.length < 15 ? t('memory_depth_mid') :
                                                    t('memory_depth_high', { name: compName })}
                        <div className="prog-bar" style={{ marginTop: 12 }}>
                          <div className="prog-fill" style={{ width: `${Math.min(100, (memory.facts.length / 20) * 100)}%` }} />
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{memory.facts.length} / 20+ {t('memory_factsCount')}</div>
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
              <div className="view-title">{t('journal_title_1')} <em>{t('journal_title_em')}</em></div>
              <p className="view-sub">{t('journal_sub')}</p>
              {(!memory?.timeline || memory.timeline.length === 0) ? (
                <div className="empty-box">
                  <div className="empty-icon">📖</div>
                  <div className="empty-title">{t('journal_emptyTitle')}</div>
                  <div className="empty-hint">{t('journal_emptyHint', { name: compName })}</div>
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
              <div className="view-title">{t('profile_title_1')} <em>{compName}</em> {t('profile_title_em')}</div>
              <p className="view-sub">{t('profile_sub')}</p>
              <div className="pf-form">
                {[
                  { key: 'age',        label: t('profile_age'),        placeholder: t('profile_agePlaceholder') },
                  { key: 'occupation', label: t('profile_occupation'), placeholder: t('profile_occupationPlaceholder') },
                  { key: 'location',   label: t('profile_location'),   placeholder: t('profile_locationPlaceholder') },
                ].map(f => (
                  <div key={f.key} className="pf-field">
                    <label className="pf-label">{f.label}</label>
                    <input className="pf-input" placeholder={f.placeholder}
                      value={profileForm[f.key] || ''}
                      onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
                <div className="pf-field">
                  <label className="pf-label">{t('profile_aboutLabel', { name: compName })}</label>
                  <textarea className="pf-input" rows={4}
                    placeholder={t('profile_aboutPlaceholder')}
                    value={profileForm.about || ''}
                    onChange={e => setProfileForm(p => ({ ...p, about: e.target.value }))}
                    style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button className="save-btn" onClick={saveProfile}>{t('profile_save')}</button>
                  {saveOk && <span className="save-ok">{t('profile_saved')}</span>}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── MOBILE MENU (bottom sheet) ── */}
      {menuOpen && (
        <>
          <div className="menu-overlay" onClick={() => setMenuOpen(false)} />
          <div className="menu-sheet">
            <div className="menu-sheet-handle" />

            <div className="menu-sheet-user">
              <div className="sb-avatar" style={{ background: `linear-gradient(135deg, ${accent}88, ${accent})` }}>
                {initials(user?.name)}
              </div>
              <div>
                <div className="sb-uname">{user?.name}</div>
                <div className="sb-since">{t('sb_since')} {user?.createdAt}</div>
              </div>
            </div>

            <div className="menu-sheet-stats">
              <div className="sb-stats-label">{t('sb_memoryStats')}</div>
              <div className="sb-stats-row">
                <div>💡 {memory?.facts?.length || 0} {t('sb_factsLearned')}</div>
                <div>📝 {memory?.timeline?.length || 0} {t('sb_milestones')}</div>
                <div>💬 {messages.length} {t('sb_messages')}</div>
              </div>
              <div className="prog-bar" style={{ marginTop: 10 }}>
                <div className="prog-fill" style={{ width: `${Math.min(100, ((memory?.facts?.length || 0) / 20) * 100)}%` }} />
              </div>
            </div>

            <div className="menu-sheet-lang">
              <span className="menu-sheet-lang-label">{lang === 'es' ? 'Idioma' : 'Language'}</span>
              <div className="lang-switch">
                <button className={`lang-btn${lang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')}>EN</button>
                <button className={`lang-btn${lang === 'es' ? ' active' : ''}`} onClick={() => setLang('es')}>ES</button>
              </div>
            </div>

            <button className="menu-sheet-item" onClick={() => { setMenuOpen(false); handleChangeCompanion(); }}>
              <span>🔄</span> {t('sb_changeCompanion').replace('🔄 ', '')}
            </button>
            <button className="menu-sheet-item menu-sheet-danger" onClick={() => { setMenuOpen(false); handleSignOut(); }}>
              <span>↩</span> {t('sb_signOut').replace('↩ ', '')}
            </button>

            <button className="menu-sheet-close" onClick={() => setMenuOpen(false)}>
              {lang === 'es' ? 'Cerrar' : 'Close'}
            </button>
          </div>
        </>
      )}
    </>
  );
}
