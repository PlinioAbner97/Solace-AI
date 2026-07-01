import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { api } from './utils/api';
import { globalCss } from './utils/styles';
import { useLanguage } from './utils/LanguageContext';
import { FEMALE_COMPANIONS, MALE_COMPANIONS } from './utils/companions';
import Home from './pages/Home';
import Auth from './pages/Auth';
import PickCompanion from './pages/PickCompanion';
import AppShell from './pages/AppShell';
import Onboarding from './pages/Onboarding';

export default function App() {
  const [status, setStatus] = useState('loading'); // loading | guest | auth
  const [user, setUser] = useState(null);
  const [companion, setCompanion] = useState(null);
  const [memory, setMemory] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profileForm, setProfileForm] = useState({});

  useEffect(() => {
    // Wake the server immediately on page load (Render free tier sleeps after inactivity)
    fetch('https://solace-ai-xyrq.onrender.com/api/health').catch(() => {});
    (async () => {
      const token = localStorage.getItem('solace_token');
      if (!token) { setStatus('guest'); return; }
      try {
        const { user: u } = await api.me();
        const mem = await api.getMemory('default');
        const compName = mem?.profile?.companionName || 'default';
        const memFinal = compName !== 'default' ? await api.getMemory(compName) : mem;
        const { messages: msgs } = await api.getMessages(compName);

        setUser(u);
        setMemory(memFinal);
        setMessages(msgs);

        // Restore companion from saved profile
        if (mem?.profile?.companionName) {
          setCompanion(withVibe({
            name:   mem.profile.companionName,
            gender: mem.profile.companionGender,
            emoji:  mem.profile.companionEmoji,
            trait:  mem.profile.companionTrait,
            accent: mem.profile.companionAccent,
          }));
        }

        setStatus('auth');
      } catch {
        localStorage.removeItem('solace_token');
        setStatus('guest');
      }
    })();
  }, []);

  const handleLogin = async (u) => {
    setUser(u);
    setStatus('auth');
    // Load memory and messages after login
    try {
      const memDefault = await api.getMemory('default');
      const compName = memDefault?.profile?.companionName || 'default';
      const mem = compName !== 'default' ? await api.getMemory(compName) : memDefault;
      const { messages: msgs } = await api.getMessages(compName);
      setMemory(mem);
      setMessages(msgs);
      setProfileForm(mem.profile || {});
      if (mem?.profile?.companionName) {
        setCompanion(withVibe({
          name:   mem.profile.companionName,
          gender: mem.profile.companionGender,
          emoji:  mem.profile.companionEmoji,
          trait:  mem.profile.companionTrait,
          accent: mem.profile.companionAccent,
        }));
      }
    } catch(e) {
      console.warn('Failed to load user data after login:', e.message);
    }
  };

  const handleCompanionPicked = async (comp, gender) => {
    setCompanion(withVibe({ ...comp, gender }));
    // Load THIS companion's own isolated memory and messages
    try {
      const mem  = await api.getMemory(comp.name);
      const { messages: msgs } = await api.getMessages(comp.name);
      setMemory(mem);
      setMessages(msgs);
    } catch (e) {
      console.warn('Failed to load companion data:', e.message);
    }
    // Show onboarding only if this user+companion pair hasn't done it yet
    const onbKey = `solace_onb_${comp.name}`;
    if (!localStorage.getItem(onbKey)) {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = async () => {
    // Mark this companion as onboarded for this user
    if (companion?.name) {
      localStorage.setItem(`solace_onb_${companion.name}`, '1');
    }
    setShowOnboarding(false);
    // Reload memory to pick up anything saved during onboarding
    try {
      const mem = await api.getMemory(companion?.name);
      setMemory(mem);
    } catch {}
  };

  const handleSignOut = () => {
    setUser(null); setCompanion(null); setMemory(null); setMessages([]);
    setStatus('guest');
  };

  const handleChangeCompanion = () => {
    setCompanion(null);
  };

  // Enrich companion object with vibe from master list (vibe isn't stored in DB)
  const withVibe = (comp) => {
    if (!comp) return comp;
    const all = [...FEMALE_COMPANIONS, ...MALE_COMPANIONS];
    const master = all.find(c => c.name === comp.name);
    return master ? { ...comp, vibe: master.vibe } : comp;
  };

  const { lang } = useLanguage();

  if (status === 'loading') {
    return (
      <>
        <style>{globalCss}</style>
        <div className="loading-screen">
          <div className="loading-logo">Solace <span>AI</span></div>
          <div className="loading-sub">{lang === 'es' ? 'Cargando tu compañero…' : 'Loading your companion…'}</div>
        </div>
      </>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/auth" element={
        status === 'auth' && companion
          ? <Navigate to="/app" replace />
          : <Auth onLogin={handleLogin} />
      } />

      <Route path="/pick-companion" element={
        status !== 'auth'
          ? <Navigate to="/auth" replace />
          : <PickCompanion onCompanionPicked={handleCompanionPicked} />
      } />

      <Route path="/app" element={
        status !== 'auth'
          ? <Navigate to="/auth" replace />
          : !companion
            ? <Navigate to="/pick-companion" replace />
            : showOnboarding
              ? <Onboarding
                  user={user}
                  companion={companion}
                  onComplete={handleOnboardingComplete}
                />
              : <AppShell
                user={user}
                companion={companion}
                memory={memory}
                messages={messages}
                onSignOut={handleSignOut}
                onChangeCompanion={handleChangeCompanion}
              />
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
