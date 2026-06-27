import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { globalCss } from '../utils/styles';
import { buildSystemPrompt, todayStr, nowTime, initials } from '../utils/companions';
import { useLanguage } from '../utils/LanguageContext';

export default function AppShell({ user, companion, memory: initMemory, messages: initMessages, onSignOut, onChangeCompanion }) {
  const [view, setView] = useState('today');
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
  const [insight, setInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [moodModal, setMoodModal] = useState(false);
  const [todayMood, setTodayMood] = useState(null);
  const [moodStreak, setMoodStreak] = useState(0);
  const [moodHistory, setMoodHistory] = useState([]);
  const [moodCalendar, setMoodCalendar] = useState(null);
  const [moodCalLoading, setMoodCalLoading] = useState(false);
  const [weekRecap, setWeekRecap] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [shareCard, setShareCard] = useState(false);
  const canvasRef = useRef(null);
  const [mission, setMission] = useState(null);
  const [missionDone, setMissionDone] = useState(false);
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

  // Fetch weekly insight when user opens the Memory tab
  useEffect(() => {
    if (view !== 'memory' || !companion?.name || insight) return;
    setInsightLoading(true);
    api.getInsight(companion.name, companion.name, lang)
      .then(({ insight: data }) => {
        if (data) setInsight(data);
      })
      .catch(e => console.warn('Insight fetch failed:', e.message))
      .finally(() => setInsightLoading(false));
  }, [view, companion?.name]);

  // Fetch mood calendar when wellbeing view opens
  useEffect(() => {
    if (view !== 'wellbeing' || moodCalendar) return;
    setMoodCalLoading(true);
    api.getMoodHistory(lang)
      .then(data => setMoodCalendar(data))
      .catch(e => console.warn('Mood history failed:', e.message))
      .finally(() => setMoodCalLoading(false));
  }, [view]);

  // Reset insight when companion changes so it reloads fresh
  useEffect(() => { setInsight(null); setWeekRecap(null); }, [companion?.name]);

  // Fetch weekly recap once per companion (background, non-blocking)
  useEffect(() => {
    if (!companion?.name) return;
    api.getRecap(companion.name, companion.name, lang)
      .then(({ recap }) => { if (recap) setWeekRecap(recap); })
      .catch(() => {});
  }, [companion?.name]);

  // Fetch today's daily mission per companion
  useEffect(() => {
    if (!companion?.name) return;
    setMission(null);
    setMissionDone(false);
    api.getMission(companion.name, companion.name, lang)
      .then(({ mission: m, completed }) => {
        if (m) { setMission(m); setMissionDone(!!completed); }
      })
      .catch(() => {});
  }, [companion?.name]);

  // Fetch mood streak on mount; show daily mood modal if not yet logged today
  useEffect(() => {
    api.getMoodStreak().then(({ streak, todayMood: tm, history }) => {
      setMoodStreak(streak);
      setMoodHistory(history || []);
      if (tm) {
        setTodayMood(tm);
      } else {
        // Small delay so the app feels settled before the modal appears
        setTimeout(() => setMoodModal(true), 1200);
      }
    }).catch(() => {});
  }, []);

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
      const systemPrompt = buildSystemPrompt(user, memory, companion, mode, lang, todayMood);
      const { reply } = await api.chat(apiHistory, systemPrompt);

      const aiMsg = { role: 'assistant', content: reply, time: nowTime() };
      const final = [...next, aiMsg];
      setMessages(final);

      api.saveMessage('assistant', reply, companion?.name).catch(e => console.warn('Save ai msg failed:', e.message));

      // Generate smart reply suggestions in background
      setSuggestions([]);
      setSuggestionsLoading(true);
      api.getSuggestions(reply, final.slice(-8), companion?.name, lang, mode)
        .then(({ suggestions: s }) => setSuggestions(s || []))
        .catch(() => setSuggestions([]))
        .finally(() => setSuggestionsLoading(false));

      extractAndSaveMemory(userMsg.content);

      // Log first message with this companion to journal
      if (messages.length === 1) { // was empty before this message
        api.addJournalEntry(
          companion?.name,
          lang === 'es'
            ? `Primera conversación con ${compName}`
            : `First conversation with ${compName}`,
          lang === 'es'
            ? `El comienzo de una nueva amistad`
            : `The beginning of a new friendship`,
          companion?.emoji || '✦'
        ).then(({ ok, entry }) => {
          if (ok && entry) setMemory(prev => ({
            ...prev,
            timeline: [...(prev.timeline || []), entry].slice(-60)
          }));
        }).catch(() => {});
      }

      // Mark today's mission complete on first message sent
      if (mission && !missionDone) {
        setMissionDone(true);
        api.completeMission(companion?.name).catch(() => {});
        // Log mission completion to journal
        api.addJournalEntry(
          companion?.name,
          lang === 'es' ? `Completó la misión del día con ${companion?.name}` : `Completed today's mission with ${companion?.name}`,
          mission,
          '◎'
        ).then(({ ok, entry }) => {
          if (ok && entry) setMemory(prev => ({
            ...prev,
            timeline: [...(prev.timeline || []), entry].slice(-60)
          }));
        }).catch(() => {});
      }
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

  const submitMood = async (mood, score) => {
    setTodayMood({ mood, score });
    setMoodModal(false);
    try {
      await api.logMood(mood, score, null);
      const { streak, history } = await api.getMoodStreak();
      setMoodStreak(streak);
      setMoodHistory(history || []);

      // Log streak milestones to journal
      const milestones = { 3: '3-day', 7: '1-week', 14: '2-week', 30: '1-month', 60: '2-month', 100: '100-day' };
      if (milestones[streak]) {
        const label = milestones[streak];
        api.addJournalEntry(
          companion?.name,
          lang === 'es'
            ? `Alcanzó una racha de ${label === '3-day' ? '3 días' : label === '1-week' ? '1 semana' : label === '2-week' ? '2 semanas' : label === '1-month' ? '1 mes' : label === '2-month' ? '2 meses' : '100 días'} registrando su ánimo`
            : `Reached a ${label} mood logging streak`,
          lang === 'es' ? `${streak} días seguidos cuidando su bienestar emocional` : `${streak} consecutive days of emotional self-care`,
          '🔥'
        ).then(({ ok, entry }) => {
          if (ok && entry) setMemory(prev => ({
            ...prev,
            timeline: [...(prev.timeline || []), entry].slice(-60)
          }));
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Mood log failed:', e.message);
    }
  };

  // Wrap setView so leaving the chat triggers a background session summary
  // ── GENERATE RELATIONSHIP CARD ON CANVAS ──────────────────────────────────
  const generateCard = (canvas) => {
    if (!canvas) return;
    const W = 900, H = 520;
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Background — deep espresso gradient
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0,   '#0e0b08');
    bg.addColorStop(0.5, '#120e0a');
    bg.addColorStop(1,   '#0a0908');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Warm ambient glow top-left
    const glow1 = ctx.createRadialGradient(160, 140, 0, 160, 140, 360);
    glow1.addColorStop(0,   'rgba(232,199,154,0.11)');
    glow1.addColorStop(1,   'rgba(232,199,154,0)');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, W, H);

    // Glow bottom-right
    const glow2 = ctx.createRadialGradient(W - 120, H - 80, 0, W - 120, H - 80, 280);
    glow2.addColorStop(0,   'rgba(200,180,232,0.07)');
    glow2.addColorStop(1,   'rgba(200,180,232,0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, W, H);

    // Outer border
    ctx.strokeStyle = 'rgba(255,240,220,0.12)';
    ctx.lineWidth = 1;
    roundRect(ctx, 1, 1, W-2, H-2, 28);
    ctx.stroke();

    // Inner card panel (left side)
    ctx.fillStyle = 'rgba(255,248,238,0.04)';
    roundRect(ctx, 32, 32, 340, H-64, 20);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,240,220,0.1)';
    ctx.lineWidth = 1;
    roundRect(ctx, 32, 32, 340, H-64, 20);
    ctx.stroke();

    // ── Companion emoji (large) ──
    ctx.font = '80px serif';
    ctx.textAlign = 'center';
    ctx.fillText(companion?.emoji || '✦', 202, 190);

    // Breathing ring around emoji
    ctx.strokeStyle = 'rgba(232,199,154,0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(202, 160, 68, 0, Math.PI * 2);
    ctx.stroke();

    // Companion name
    ctx.fillStyle = '#f5efe4';
    ctx.font = '500 32px serif';
    ctx.textAlign = 'center';
    ctx.fillText(companion?.name || 'Solace', 202, 238);

    // Trait
    ctx.fillStyle = 'rgba(232,199,154,0.65)';
    ctx.font = '300 14px sans-serif';
    ctx.fillText(companion?.trait || '', 202, 264);

    // "Always here" line
    ctx.fillStyle = 'rgba(143,208,160,0.8)';
    ctx.font = '300 12px sans-serif';
    ctx.fillText('● Always here', 202, 290);

    // ── Right panel: stats + facts ──
    const rx = 408, ry = 48;

    // User name
    ctx.fillStyle = '#f5efe4';
    ctx.font = '300 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(lang === 'es' ? 'La historia de' : 'The story of', rx, ry + 18);
    ctx.font = '400 34px serif';
    ctx.fillText(user?.name || 'You', rx, ry + 58);

    // Thin separator line
    ctx.strokeStyle = 'rgba(255,240,220,0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rx, ry + 72);
    ctx.lineTo(W - 40, ry + 72);
    ctx.stroke();

    // Stats row
    const daysLabel = user?.createdAt
      ? Math.max(1, Math.round((Date.now() - new Date(user.createdAt).getTime()) / 86400000))
      : 1;
    const relScore = Math.min(100,
      Math.min(40, (memory?.facts?.length||0)*2) +
      Math.min(20, (memory?.sessionSummaries?.length||0)*4) +
      Math.min(20, moodStreak*2) +
      Math.min(20, Math.floor(messages.length/5))
    );
    const relLevel = relScore < 20 ? (lang==='es'?'Apenas comenzando':'Just Getting Started')
      : relScore < 40 ? (lang==='es'?'Construyendo conexión':'Building Connection')
      : relScore < 60 ? (lang==='es'?'Familiarizándonos':'Getting Close')
      : relScore < 80 ? (lang==='es'?'Amigos de verdad':'Real Friends')
      : (lang==='es'?'Vínculo profundo':'Deep Bond');

    const stats = [
      { val: `${daysLabel}`, lbl: lang==='es'?'días':'days' },
      { val: `${memory?.facts?.length||0}`, lbl: lang==='es'?'datos':'known' },
      { val: `${relScore}`, lbl: '/ 100' },
      { val: moodStreak > 0 ? `${moodStreak}🔥` : '—', lbl: lang==='es'?'racha':'streak' },
    ];
    stats.forEach((s, i) => {
      const sx = rx + i * 116;
      ctx.fillStyle = '#f5efe4';
      ctx.font = '400 26px serif';
      ctx.textAlign = 'left';
      ctx.fillText(s.val, sx, ry + 110);
      ctx.fillStyle = 'rgba(168,160,150,0.8)';
      ctx.font = '300 11px sans-serif';
      ctx.fillText(s.lbl, sx, ry + 128);
    });

    // Relationship level badge
    ctx.fillStyle = 'rgba(232,199,154,0.12)';
    roundRect(ctx, rx, ry + 140, 200, 28, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(232,199,154,0.3)';
    ctx.lineWidth = 1;
    roundRect(ctx, rx, ry + 140, 200, 28, 14);
    ctx.stroke();
    ctx.fillStyle = 'rgba(232,199,154,0.9)';
    ctx.font = '400 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(relLevel, rx + 14, ry + 159);

    // Facts
    const facts = (memory?.facts || []).slice(0, 4);
    if (facts.length) {
      ctx.fillStyle = 'rgba(168,160,150,0.7)';
      ctx.font = '300 11px sans-serif';
      ctx.fillText(lang==='es'?'Lo que sabe de ti:':'Things they know about you:', rx, ry + 200);

      facts.forEach((f, i) => {
        const fy = ry + 224 + i * 36;
        // pill background
        const tw = Math.min(ctx.measureText(`💡 ${f}`).width + 24, W - rx - 50);
        ctx.fillStyle = 'rgba(255,248,238,0.05)';
        roundRect(ctx, rx, fy - 16, tw, 28, 14);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,240,220,0.1)';
        ctx.lineWidth = 1;
        roundRect(ctx, rx, fy - 16, tw, 28, 14);
        ctx.stroke();
        ctx.fillStyle = 'rgba(245,239,228,0.85)';
        ctx.font = '300 12px sans-serif';
        ctx.textAlign = 'left';
        const label = `💡 ${f.length > 42 ? f.slice(0,42)+'…' : f}`;
        ctx.fillText(label, rx + 12, fy);
      });
    }

    // Branding watermark bottom
    ctx.fillStyle = 'rgba(168,160,150,0.4)';
    ctx.font = '300 13px serif';
    ctx.textAlign = 'right';
    ctx.fillText('Solace AI', W - 40, H - 32);
    ctx.font = '300 11px sans-serif';
    ctx.fillStyle = 'rgba(168,160,150,0.25)';
    ctx.fillText('solace-ai-1-atkq.onrender.com', W - 40, H - 16);
  };

  // helper: rounded rect path
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  const downloadCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `solace-${companion?.name?.toLowerCase() || 'card'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const openShareCard = () => {
    setShareCard(true);
    setTimeout(() => generateCard(canvasRef.current), 100);
  };

  const changeView = (newView) => {
    if (view === 'chat' && newView !== 'chat' && messages.length >= 4) {
      api.summarizeSession(companion?.name, companion?.name, lang, messages)
        .catch(() => {});
    }
    setView(newView);
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
            <button className={`sb-item${view === 'today' ? ' active' : ''}`} onClick={() => changeView('today')}>
              <span className="sb-icon">🌅</span> {lang === 'es' ? 'Hoy' : 'Today'}
            </button>

            <div className="sb-section">{t('sb_companion')}</div>
            <button className={`sb-item${view === 'chat' ? ' active' : ''}`} onClick={() => changeView('chat')}>
              <span className="sb-icon">✦</span> {t('sb_chatWith')} {compName}
            </button>

            <div className="sb-section">{t('sb_yourStory')}</div>
            <button className={`sb-item${view === 'memory' ? ' active' : ''}`} onClick={() => changeView('memory')}>
              <span className="sb-icon">🧠</span> {t('sb_memoryFacts')}
            </button>
            <button className={`sb-item${view === 'journal' ? ' active' : ''}`} onClick={() => changeView('journal')}>
              <span className="sb-icon">📖</span> {t('sb_lifeJournal')}
            </button>

            <div className="sb-section">{t('sb_you')}</div>
            <button className={`sb-item${view === 'profile' ? ' active' : ''}`} onClick={() => changeView('profile')}>
              <span className="sb-icon">🌱</span> {t('sb_yourProfile')}
            </button>
            <button className={`sb-item${view === 'wellbeing' ? ' active' : ''}`} onClick={() => changeView('wellbeing')}>
              <span className="sb-icon">💜</span> {lang === 'es' ? 'Bienestar' : 'Wellbeing'}
            </button>

            <div className="sb-stats">
              <div className="sb-stats-label">{t('sb_memoryStats')}</div>
              <div className="sb-stats-row">
                <div>💡 {memory?.facts?.length || 0} {t('sb_factsLearned')}</div>
                <div>📝 {memory?.timeline?.length || 0} {t('sb_milestones')}</div>
                <div>💬 {messages.length} {t('sb_messages')}</div>
              </div>
              {moodStreak > 0 && (
                <div className="sb-streak">
                  <span className="sb-streak-fire">🔥</span>
                  <span>{moodStreak} {lang === 'es' ? 'días seguidos' : 'day streak'}</span>
                  {todayMood && <span className="sb-streak-today">{todayMood.mood}</span>}
                </div>
              )}
              {!moodStreak && todayMood && (
                <div className="sb-streak">
                  <span className="sb-streak-fire">✨</span>
                  <span>{lang === 'es' ? 'Hoy:' : 'Today:'} {todayMood.mood}</span>
                </div>
              )}
              {mission && (
                <div className="sb-streak" style={{ marginTop: 4 }}>
                  <span className="sb-streak-fire">{missionDone ? '✓' : '◎'}</span>
                  <span style={{ color: missionDone ? 'var(--green)' : 'var(--muted2)' }}>
                    {missionDone
                      ? (lang === 'es' ? 'Misión cumplida' : 'Mission done')
                      : (lang === 'es' ? 'Misión pendiente' : 'Mission pending')}
                  </span>
                </div>
              )}
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

          {/* ── TODAY ── */}
          {view === 'today' && (() => {
            const hour = new Date().getHours();
            const greeting = lang === 'es'
              ? (hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches')
              : (hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening');
            const daysLabel = user?.createdAt
              ? Math.max(1, Math.round((Date.now() - new Date(user.createdAt).getTime()) / 86400000))
              : 1;
            const relScore = Math.min(100,
              Math.min(40,(memory?.facts?.length||0)*2) +
              Math.min(20,(memory?.sessionSummaries?.length||0)*4) +
              Math.min(20,moodStreak*2) +
              Math.min(20,Math.floor(messages.length/5))
            );
            return (
              <div className="today-view">
                <div className="today-header">
                  <div className="today-greeting">{greeting},</div>
                  <div className="today-name">{user?.name}</div>
                  <div className="today-date">
                    {new Date().toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { weekday:'long', month:'long', day:'numeric' })}
                  </div>
                </div>

                <button className="today-comp-card" onClick={() => changeView('chat')}>
                  <div className="today-comp-av">{companion?.emoji || '✦'}</div>
                  <div className="today-comp-info">
                    <div className="today-comp-name">{compName}</div>
                    <div className="today-comp-status">
                      <span className="today-comp-dot" />
                      {lang === 'es' ? 'Siempre aquí para ti' : 'Always here for you'}
                    </div>
                    {checkinMsg && (
                      <div className="today-comp-preview">
                        "{checkinMsg.slice(0,90)}{checkinMsg.length > 90 ? '…' : ''}"
                      </div>
                    )}
                  </div>
                  <div className="today-comp-arrow">→</div>
                </button>

                <div className="today-stats">
                  {[
                    { val: daysLabel, lbl: lang==='es'?'días':'days' },
                    { val: relScore,  lbl: lang==='es'?'conexión':'bond' },
                    { val: moodStreak > 0 ? `${moodStreak}🔥` : '—', lbl: lang==='es'?'racha':'streak' },
                    { val: todayMood ? todayMood.mood : '+', lbl: lang==='es'?'ánimo':'mood', onClick: () => !todayMood && setMoodModal(true) },
                  ].map((s,i) => (
                    <div key={i} className="today-stat" onClick={s.onClick} style={s.onClick ? {cursor:'pointer'} : {}}>
                      <div className="today-stat-val">{s.val}</div>
                      <div className="today-stat-lbl">{s.lbl}</div>
                    </div>
                  ))}
                </div>

                {mission && (
                  <button className={`today-mission${missionDone?' today-mission-done':''}`}
                    onClick={() => changeView('chat')}>
                    <div className="today-mission-top">
                      <span className="today-mission-icon">{missionDone ? '✓' : '◎'}</span>
                      <span className="today-mission-label">{lang==='es'?'Misión del día':"Today's mission"}</span>
                      {missionDone
                        ? <span className="today-mission-badge">{lang==='es'?'Completada':'Done'} 🔥</span>
                        : <span className="today-mission-tap">{lang==='es'?'Toca para empezar →':'Tap to start →'}</span>
                      }
                    </div>
                    <div className="today-mission-text">"{mission}"</div>
                  </button>
                )}

                {moodHistory.length > 2 && (() => {
                  const pts = moodHistory.slice(-7);
                  const W = 200, H = 32;
                  const path = pts.map((p,i) => {
                    const x=(i/(pts.length-1))*W, y=H-((p.score/5)*H*0.8+H*0.1);
                    return `${i===0?'M':'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                  }).join(' ');
                  return (
                    <div className="today-mood-card" onClick={() => changeView('memory')} style={{cursor:'pointer'}}>
                      <div className="today-mood-label">
                        {lang==='es'?'🌊 Tu semana emocional':'🌊 Your emotional week'}
                        <span className="today-mood-tap">{lang==='es'?' · Ver más →':' · See more →'}</span>
                      </div>
                      <svg width="100%" height="40" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{marginTop:8}}>
                        <defs>
                          <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--warm)" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="var(--warm)" stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        <path d={`${path} L ${W} ${H} L 0 ${H} Z`} fill="url(#tGrad)"/>
                        <path d={path} fill="none" stroke="var(--warm)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        {pts.map((p,i)=>{
                          const x=(i/(pts.length-1))*W,y=H-((p.score/5)*H*0.8+H*0.1);
                          return <circle key={i} cx={x} cy={y} r="2.5" fill="var(--warm)" opacity="0.85"/>;
                        })}
                      </svg>
                      <div className="today-mood-emojis"><span>😔</span><span>😐</span><span>😊</span></div>
                    </div>
                  );
                })()}

                {/* Weekly recap card */}
                {weekRecap && (
                  <div className="today-recap-card">
                    <div className="today-recap-header">
                      <div className="today-recap-icon">✦</div>
                      <div>
                        <div className="today-recap-label">{lang === 'es' ? 'Recap de la semana' : 'This week'}</div>
                        <div className="today-recap-headline">"{weekRecap.headline}"</div>
                      </div>
                    </div>
                    <div className="today-recap-body">{weekRecap.body}</div>
                    {weekRecap.stats && (
                      <div className="today-recap-stats">
                        {weekRecap.stats.weekMsgs > 0 && (
                          <span>💬 {weekRecap.stats.weekMsgs} {lang === 'es' ? 'mensajes' : 'messages'}</span>
                        )}
                        {weekRecap.stats.avgMood && (
                          <span>🌊 {weekRecap.stats.avgMood}/5</span>
                        )}
                        {weekRecap.stats.missionsCompleted > 0 && (
                          <span>◎ {weekRecap.stats.missionsCompleted} {lang === 'es' ? 'misiones' : 'missions'}</span>
                        )}
                      </div>
                    )}
                    {weekRecap.highlight && (
                      <div className="today-recap-highlight">
                        <span className="today-recap-highlight-label">
                          {lang === 'es' ? '💡 Lo que destacó' : '💡 What stood out'}
                        </span>
                        <span>{weekRecap.highlight}</span>
                      </div>
                    )}
                    {weekRecap.nextWeek && (
                      <div className="today-recap-next">
                        <span className="today-recap-next-label">
                          {lang === 'es' ? '→ Para la próxima semana' : '→ Next week'}
                        </span>
                        <span>{weekRecap.nextWeek}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="today-quicknav">
                  {[
                    { view:'chat',    icon:'✦', label:lang==='es'?'Chat':'Chat' },
                    { view:'memory',  icon:'🧠', label:lang==='es'?'Memoria':'Memory' },
                    { view:'journal', icon:'📖', label:lang==='es'?'Diario':'Journal' },
                    { view:'profile', icon:'🌱', label:lang==='es'?'Perfil':'Profile' },
                  ].map(n => (
                    <button key={n.view} className="today-quicknav-btn" onClick={() => changeView(n.view)}>
                      <span className="today-quicknav-icon">{n.icon}</span>
                      <span className="today-quicknav-label">{n.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

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

              {/* ── DAILY MISSION CARD ── */}
              {mission && (
                <div className={`mission-card${missionDone ? ' mission-done' : ''}`}>
                  <div className="mission-header">
                    <div className="mission-icon">{missionDone ? '✓' : '◎'}</div>
                    <div className="mission-label">
                      {lang === 'es' ? 'Misión del día' : "Today's mission"}
                    </div>
                    {missionDone && (
                      <div className="mission-badge">
                        {lang === 'es' ? '¡Completada! 🔥' : 'Done! 🔥'}
                      </div>
                    )}
                  </div>
                  <div className="mission-text">"{mission}"</div>
                  {!missionDone && (
                    <div className="mission-hint">
                      {lang === 'es'
                        ? `Respóndele a ${compName} para completarla`
                        : `Reply to ${compName} to complete it`}
                    </div>
                  )}
                </div>
              )}

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

              {/* Smart reply suggestions */}
              {(suggestions.length > 0 || suggestionsLoading) && !input && (
                <div className="suggestions-bar">
                  {suggestionsLoading && !suggestions.length ? (
                    <div className="suggestions-loading">
                      <div className="t-dot"/><div className="t-dot"/><div className="t-dot"/>
                    </div>
                  ) : (
                    suggestions.map((s, i) => (
                      <button key={i} className="suggestion-chip"
                        style={{ animationDelay: `${i * 0.06}s` }}
                        onClick={() => {
                          setInput(s);
                          setSuggestions([]);
                          setTimeout(() => inputRef.current?.focus(), 50);
                        }}>
                        {s}
                      </button>
                    ))
                  )}
                </div>
              )}

              <div className="input-area">
                <div className="input-row">
                  <textarea ref={inputRef} className="msg-input"
                    placeholder={`${t('chat_talkTo')} ${compName}…`}
                    value={input} onChange={e => { setInput(e.target.value); if (e.target.value) setSuggestions([]); }}
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
          {view === 'memory' && (() => {
            // ── Relationship score calculation ──
            const factScore    = Math.min(40, (memory?.facts?.length || 0) * 2);
            const sessionScore = Math.min(20, (memory?.sessionSummaries?.length || 0) * 4);
            const streakScore  = Math.min(20, moodStreak * 2);
            const msgScore     = Math.min(20, Math.floor(messages.length / 5));
            const relScore     = factScore + sessionScore + streakScore + msgScore;
            const relLevel     = relScore < 20
              ? (lang === 'es' ? 'Apenas comenzando' : 'Just Getting Started')
              : relScore < 40
              ? (lang === 'es' ? 'Construyendo conexión' : 'Building Connection')
              : relScore < 60
              ? (lang === 'es' ? 'Familiarizándonos' : 'Getting Close')
              : relScore < 80
              ? (lang === 'es' ? 'Amigos de verdad' : 'Real Friends')
              : (lang === 'es' ? 'Vínculo profundo' : 'Deep Bond');

            // ── Days together ──
            const daysLabel = user?.createdAt
              ? Math.max(1, Math.round((Date.now() - new Date(user.createdAt).getTime()) / 86400000))
              : 1;

            // ── SVG mood sparkline ──
            const moodPoints = moodHistory.slice(-14);
            const sparkW = 160, sparkH = 36;
            const sparkPath = moodPoints.length > 1
              ? moodPoints.map((p, i) => {
                  const x = (i / (moodPoints.length - 1)) * sparkW;
                  const y = sparkH - ((p.score / 5) * sparkH * 0.8 + sparkH * 0.1);
                  return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                }).join(' ')
              : null;

            // ── Ring circumference ──
            const R = 44, circ = 2 * Math.PI * R;
            const dash = circ - (Math.min(relScore, 100) / 100) * circ;

            return (
              <div className="dashboard">
                {/* ── HEADER: companion + score ring + days ── */}
                <div className="dash-header">
                  <div className="dash-companion">
                    <div className="dash-comp-av" style={{ background: `linear-gradient(135deg, ${accent}44, ${accent}22)`, borderColor: `${accent}44` }}>
                      {companion?.emoji || '✦'}
                    </div>
                    <div>
                      <div className="dash-comp-name">{compName}</div>
                      <div className="dash-comp-trait">{companion?.trait}</div>
                    </div>
                  </div>

                  <div className="dash-ring-wrap">
                    <svg width="112" height="112" viewBox="0 0 112 112">
                      <circle cx="56" cy="56" r={R} fill="none" stroke="var(--border)" strokeWidth="6" />
                      <circle cx="56" cy="56" r={R} fill="none"
                        stroke="var(--warm)" strokeWidth="6"
                        strokeDasharray={circ} strokeDashoffset={dash}
                        strokeLinecap="round"
                        transform="rotate(-90 56 56)"
                        style={{ transition: 'stroke-dashoffset 1.2s var(--ease-slow)' }}
                      />
                      <text x="56" y="52" textAnchor="middle" fill="var(--cream)" fontSize="18" fontWeight="400" fontFamily="Cormorant Garamond, serif">{relScore}</text>
                      <text x="56" y="68" textAnchor="middle" fill="var(--muted2)" fontSize="8.5" fontFamily="Inter, sans-serif" letterSpacing="0.05em">/ 100</text>
                    </svg>
                    <div className="dash-ring-label">{relLevel}</div>
                    <button className="dash-share-btn" onClick={openShareCard}>
                      {lang === 'es' ? '✦ Compartir' : '✦ Share'}
                    </button>
                  </div>
                </div>

                {/* ── STATS ROW ── */}
                <div className="dash-stats">
                  <div className="dash-stat">
                    <div className="dash-stat-val">{daysLabel}</div>
                    <div className="dash-stat-lbl">{lang === 'es' ? 'días juntos' : 'days together'}</div>
                  </div>
                  <div className="dash-stat">
                    <div className="dash-stat-val">{memory?.facts?.length || 0}</div>
                    <div className="dash-stat-lbl">{lang === 'es' ? 'datos sobre ti' : 'things known'}</div>
                  </div>
                  <div className="dash-stat">
                    <div className="dash-stat-val">{memory?.sessionSummaries?.length || 0}</div>
                    <div className="dash-stat-lbl">{lang === 'es' ? 'sesiones' : 'sessions'}</div>
                  </div>
                  <div className="dash-stat">
                    <div className="dash-stat-val">{moodStreak > 0 ? `${moodStreak}🔥` : '—'}</div>
                    <div className="dash-stat-lbl">{lang === 'es' ? 'racha' : 'streak'}</div>
                  </div>
                </div>

                {/* ── MOOD SPARKLINE ── */}
                {moodPoints.length > 1 && (
                  <div className="dash-card">
                    <div className="dash-card-header">
                      <span className="dash-card-title">{lang === 'es' ? '🌊 Tendencia de ánimo' : '🌊 Mood trend'}</span>
                      <span className="dash-card-sub">{lang === 'es' ? `últimos ${moodPoints.length} días` : `last ${moodPoints.length} days`}</span>
                    </div>
                    <div className="dash-sparkline-wrap">
                      <svg width="100%" height="48" viewBox={`0 0 ${sparkW} ${sparkH}`} preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--warm)" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="var(--warm)" stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        {sparkPath && (
                          <>
                            <path d={`${sparkPath} L ${sparkW} ${sparkH} L 0 ${sparkH} Z`} fill="url(#sparkGrad)" />
                            <path d={sparkPath} fill="none" stroke="var(--warm)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </>
                        )}
                        {moodPoints.map((p, i) => {
                          const x = (i / (moodPoints.length - 1)) * sparkW;
                          const y = sparkH - ((p.score / 5) * sparkH * 0.8 + sparkH * 0.1);
                          return <circle key={i} cx={x} cy={y} r="2.5" fill="var(--warm)" opacity="0.8" />;
                        })}
                      </svg>
                      <div className="dash-sparkline-labels">
                        <span>😔</span><span>😐</span><span>😊</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── WEEKLY INSIGHT ── */}
                {insightLoading && (
                  <div className="insight-loading">
                    <div className="insight-loading-dots">
                      <div className="t-dot" /><div className="t-dot" /><div className="t-dot" />
                    </div>
                    <span>{lang === 'es' ? `${compName} está reflexionando sobre tu semana…` : `${compName} is reflecting on your week…`}</span>
                  </div>
                )}
                {insight && !insightLoading && (
                  <div className="insight-card">
                    <div className="insight-header">
                      <div className="insight-icon">✦</div>
                      <div>
                        <div className="insight-title">{lang === 'es' ? 'Reflexión Semanal' : 'Weekly Reflection'}</div>
                        <div className="insight-week">{lang === 'es' ? 'Esta semana con' : 'This week with'} {compName}</div>
                      </div>
                    </div>
                    <div className="insight-themes">
                      {insight.themes?.map((theme, i) => <span key={i} className="insight-theme">{theme}</span>)}
                    </div>
                    <div className="insight-row">
                      <div className="insight-label">{lang === 'es' ? '🌊 Patrón emocional' : '🌊 Emotional pattern'}</div>
                      <div className="insight-value">{insight.moodPattern}</div>
                    </div>
                    <div className="insight-row">
                      <div className="insight-label">{lang === 'es' ? '💡 Lo que noté' : '💡 What I noticed'}</div>
                      <div className="insight-value">{insight.observation}</div>
                    </div>
                    <div className="insight-question">
                      <div className="insight-q-label">{lang === 'es' ? 'Para reflexionar' : 'For reflection'}</div>
                      <div className="insight-q-text">"{insight.question}"</div>
                      <button className="insight-reply-btn" onClick={() => {
                        setView('chat');
                        setTimeout(() => { setInput(insight.question); inputRef.current?.focus(); }, 200);
                      }}>
                        {lang === 'es' ? 'Responder a esto →' : 'Respond to this →'}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── FACTS ── */}
                {memory?.facts?.length > 0 && (
                  <div className="dash-card">
                    <div className="dash-card-header">
                      <span className="dash-card-title">{lang === 'es' ? `💡 Lo que ${compName} sabe sobre ti` : `💡 What ${compName} knows about you`}</span>
                    </div>
                    <div className="dash-facts">
                      {memory.facts.map((f, i) => (
                        <span key={i} className="dash-fact-tag">{f}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── SESSION SUMMARIES ── */}
                {memory?.sessionSummaries?.length > 0 && (
                  <div className="dash-card">
                    <div className="dash-card-header">
                      <span className="dash-card-title">{lang === 'es' ? '💬 Conversaciones recientes' : '💬 Recent conversations'}</span>
                    </div>
                    {[...memory.sessionSummaries].reverse().map((s, i) => (
                      <div key={i} className="session-summary-item">
                        <div className="session-summary-date">{s.date}</div>
                        <div className="session-summary-text">{s.summary}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── EMPTY STATE ── */}
                {!memory?.facts?.length && !memory?.sessionSummaries?.length && (
                  <div className="empty-box">
                    <div className="empty-icon">{companion?.emoji || '🌱'}</div>
                    <div className="empty-title">{lang === 'es' ? 'Tu historia apenas comienza' : 'Your story is just beginning'}</div>
                    <div className="empty-hint">{lang === 'es' ? `Empieza a chatear y ${compName} irá conociéndote` : `Start chatting and ${compName} will get to know you`}</div>
                  </div>
                )}
              </div>
            );
          })()}

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
                      <div className="tl-dot">{entry.icon || ''}</div>
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

          {/* ── WELLBEING ── */}
          {view === 'wellbeing' && (() => {
            const SCORE_COLOR = (s) => {
              if (!s) return 'var(--border)';
              if (s <= 1.5) return 'rgba(217,154,154,0.7)';
              if (s <= 2.5) return 'rgba(217,185,154,0.65)';
              if (s <= 3.5) return 'rgba(200,200,180,0.55)';
              if (s <= 4.2) return 'rgba(154,200,180,0.7)';
              return 'rgba(143,208,160,0.8)';
            };
            const SCORE_EMOJI = (s) => {
              if (!s) return null;
              if (s <= 1.5) return '😔';
              if (s <= 2.5) return '😕';
              if (s <= 3.5) return '😐';
              if (s <= 4.2) return '🙂';
              return '😊';
            };

            return (
              <div className="inner-view wellbeing-view">
                <div className="view-title">
                  {lang === 'es' ? <>Tu <em>Bienestar</em></> : <>Your <em>Wellbeing</em></>}
                </div>
                <p className="view-sub">
                  {lang === 'es'
                    ? 'Tu historial emocional de los últimos 30 días.'
                    : 'Your emotional history over the last 30 days.'}
                </p>

                {/* Log today prompt if not logged */}
                {!todayMood && (
                  <button className="wb-log-prompt" onClick={() => setMoodModal(true)}>
                    <span>🌊</span>
                    <div>
                      <div className="wb-log-title">{lang === 'es' ? '¿Cómo estás hoy?' : 'How are you today?'}</div>
                      <div className="wb-log-sub">{lang === 'es' ? 'Toca para registrar tu ánimo' : 'Tap to log your mood'}</div>
                    </div>
                    <span className="wb-log-arrow">→</span>
                  </button>
                )}

                {/* Streak + today */}
                <div className="wb-streak-row">
                  <div className="wb-streak-card">
                    <div className="wb-streak-val">{moodStreak > 0 ? moodStreak : 0}</div>
                    <div className="wb-streak-lbl">🔥 {lang === 'es' ? 'días seguidos' : 'day streak'}</div>
                  </div>
                  <div className="wb-streak-card">
                    <div className="wb-streak-val">{todayMood ? SCORE_EMOJI(todayMood.score) : '—'}</div>
                    <div className="wb-streak-lbl">{lang === 'es' ? 'hoy' : 'today'}</div>
                  </div>
                  <div className="wb-streak-card">
                    <div className="wb-streak-val">
                      {moodCalendar?.days?.filter(d => d.score !== null).length || 0}
                    </div>
                    <div className="wb-streak-lbl">{lang === 'es' ? 'días registrados' : 'days logged'}</div>
                  </div>
                </div>

                {/* AI monthly summary */}
                {moodCalLoading && (
                  <div className="insight-loading">
                    <div className="insight-loading-dots">
                      <div className="t-dot"/><div className="t-dot"/><div className="t-dot"/>
                    </div>
                    <span>{lang === 'es' ? 'Analizando tu mes…' : 'Analyzing your month…'}</span>
                  </div>
                )}
                {moodCalendar?.monthlySummary && !moodCalLoading && (
                  <div className="wb-summary-card">
                    <div className="wb-summary-icon">✦</div>
                    <div>
                      <div className="wb-summary-label">{lang === 'es' ? 'Tu mes en resumen' : 'Your month in summary'}</div>
                      <div className="wb-summary-text">{moodCalendar.monthlySummary}</div>
                    </div>
                  </div>
                )}

                {/* 30-day calendar grid */}
                {moodCalendar?.days?.length > 0 && (
                  <div className="wb-cal-wrap">
                    <div className="wb-cal-title">
                      {lang === 'es' ? '📅 Últimos 30 días' : '📅 Last 30 days'}
                    </div>
                    <div className="wb-cal-grid">
                      {moodCalendar.days.map((d, i) => (
                        <div key={i} className="wb-cal-cell"
                          style={{ background: d.score ? SCORE_COLOR(d.score) : 'var(--glass)' }}
                          title={d.score ? `${d.date}: ${d.mood} (${d.score}/5)` : d.date}>
                          <span className="wb-cal-day">{d.day}</span>
                          {d.score && <span className="wb-cal-emoji">{SCORE_EMOJI(d.score)}</span>}
                        </div>
                      ))}
                    </div>
                    <div className="wb-cal-legend">
                      <span>😔 {lang === 'es' ? 'Difícil' : 'Rough'}</span>
                      <span>😐 {lang === 'es' ? 'Neutro' : 'Okay'}</span>
                      <span>😊 {lang === 'es' ? 'Bien' : 'Great'}</span>
                    </div>
                  </div>
                )}

                {/* Weekly averages */}
                {moodCalendar?.weeklyAvgs?.some(w => w.avg) && (
                  <div className="wb-weeks-wrap">
                    <div className="wb-cal-title">
                      {lang === 'es' ? '📊 Promedio por semana' : '📊 Weekly average'}
                    </div>
                    <div className="wb-weeks">
                      {moodCalendar.weeklyAvgs.map((w, i) => (
                        <div key={i} className="wb-week">
                          <div className="wb-week-label">
                            {w.weekStart
                              ? new Date(w.weekStart + 'T12:00:00').toLocaleDateString(
                                  lang === 'es' ? 'es-ES' : 'en-US',
                                  { month:'short', day:'numeric' })
                              : `W${i+1}`}
                          </div>
                          <div className="wb-week-bar-wrap">
                            <div className="wb-week-bar"
                              style={{
                                height: w.avg ? `${(w.avg/5)*100}%` : '4px',
                                background: w.avg ? SCORE_COLOR(w.avg) : 'var(--border)',
                                minHeight: 4,
                              }}
                            />
                          </div>
                          <div className="wb-week-val">{w.avg ? w.avg.toFixed(1) : '—'}</div>
                          <div className="wb-week-logged">{w.logged}d</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {!moodCalLoading && (!moodCalendar?.days?.length || !moodCalendar?.days?.some(d => d.score)) && (
                  <div className="empty-box">
                    <div className="empty-icon">🌱</div>
                    <div className="empty-title">
                      {lang === 'es' ? 'Tu historial emocional está comenzando' : 'Your emotional history is just starting'}
                    </div>
                    <div className="empty-hint">
                      {lang === 'es'
                        ? 'Registra tu ánimo cada día y verás patrones aquí'
                        : 'Log your mood each day and patterns will appear here'}
                    </div>
                    <button className="insight-reply-btn" style={{marginTop:20}} onClick={() => setMoodModal(true)}>
                      {lang === 'es' ? 'Registrar ánimo de hoy →' : 'Log today\'s mood →'}
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

        </div>
      </div>

      {/* ── SHARE RELATIONSHIP CARD MODAL ── */}
      {shareCard && (
        <>
          <div className="mood-overlay" onClick={() => setShareCard(false)} />
          <div className="share-card-modal">
            <div className="share-card-header">
              <div className="share-card-title">
                {lang === 'es' ? '✦ Tu tarjeta de relación' : '✦ Your relationship card'}
              </div>
              <button className="share-card-close" onClick={() => setShareCard(false)}>×</button>
            </div>
            <div className="share-card-canvas-wrap">
              <canvas ref={canvasRef} className="share-card-canvas" />
            </div>
            <div className="share-card-actions">
              <button className="share-card-download" onClick={downloadCard}>
                ↓ {lang === 'es' ? 'Descargar imagen' : 'Download image'}
              </button>
              <p className="share-card-hint">
                {lang === 'es'
                  ? 'Guarda y comparte en tus redes — muéstrale al mundo tu conexión con ' + compName
                  : 'Save and share on social — show the world your connection with ' + compName}
              </p>
            </div>
          </div>
        </>
      )}

      {/* ── DAILY MOOD CHECK-IN MODAL ── */}
      {moodModal && (
        <>
          <div className="mood-overlay" onClick={() => setMoodModal(false)} />
          <div className="mood-modal">
            <div className="mood-modal-handle" />
            <div className="mood-modal-title">
              {lang === 'es' ? `¿Cómo te sientes hoy,` : `How are you feeling today,`} <em>{user?.name}</em>?
            </div>
            <div className="mood-modal-sub">
              {lang === 'es'
                ? `${compName} quiere saber antes de empezar`
                : `${compName} wants to know before you start`}
            </div>
            <div className="mood-options">
              {[
                { emoji: '😔', label: lang === 'es' ? 'Mal'        : 'Rough',    score: 1 },
                { emoji: '😕', label: lang === 'es' ? 'Regular'    : 'Low',      score: 2 },
                { emoji: '😐', label: lang === 'es' ? 'Neutro'     : 'Okay',     score: 3 },
                { emoji: '🙂', label: lang === 'es' ? 'Bien'       : 'Good',     score: 4 },
                { emoji: '😊', label: lang === 'es' ? 'Muy bien'   : 'Great',    score: 5 },
              ].map(m => (
                <button key={m.score} className="mood-option" onClick={() => submitMood(m.label, m.score)}>
                  <span className="mood-option-emoji">{m.emoji}</span>
                  <span className="mood-option-label">{m.label}</span>
                </button>
              ))}
            </div>
            <button className="mood-skip" onClick={() => setMoodModal(false)}>
              {lang === 'es' ? 'Saltar por hoy' : 'Skip for today'}
            </button>
          </div>
        </>
      )}

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
              {(moodStreak > 0 || todayMood) && (
                <div className="sb-streak" style={{ marginTop: 8 }}>
                  <span className="sb-streak-fire">{moodStreak > 0 ? '🔥' : '✨'}</span>
                  <span>{moodStreak > 0
                    ? `${moodStreak} ${lang === 'es' ? 'días seguidos' : 'day streak'}`
                    : `${lang === 'es' ? 'Hoy:' : 'Today:'} ${todayMood?.mood}`}
                  </span>
                </div>
              )}
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
