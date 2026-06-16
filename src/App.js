import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { api } from './utils/api';
import { globalCss } from './utils/styles';
import Home from './pages/Home';
import Auth from './pages/Auth';
import PickCompanion from './pages/PickCompanion';
import AppShell from './pages/AppShell';

export default function App() {
  const [status, setStatus] = useState('loading'); // loading | guest | auth
  const [user, setUser] = useState(null);
  const [companion, setCompanion] = useState(null);
  const [memory, setMemory] = useState(null);
  const [messages, setMessages] = useState([]);
  const [profileForm, setProfileForm] = useState({});

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('solace_token');
      if (!token) { setStatus('guest'); return; }
      try {
        const { user: u } = await api.me();
        const mem = await api.getMemory();
        const { messages: msgs } = await api.getMessages();

        setUser(u);
        setMemory(mem);
        setMessages(msgs);

        // Restore companion from saved profile
        if (mem?.profile?.companionName) {
          setCompanion({
            name:   mem.profile.companionName,
            gender: mem.profile.companionGender,
            emoji:  mem.profile.companionEmoji,
            trait:  mem.profile.companionTrait,
            accent: mem.profile.companionAccent,
          });
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
      const mem = await api.getMemory();
      const { messages: msgs } = await api.getMessages();
      setMemory(mem);
      setMessages(msgs);
      setProfileForm(mem.profile || {});
      if (mem?.profile?.companionName) {
        setCompanion({
          name:   mem.profile.companionName,
          gender: mem.profile.companionGender,
          emoji:  mem.profile.companionEmoji,
          trait:  mem.profile.companionTrait,
          accent: mem.profile.companionAccent,
        });
      }
    } catch(e) {
      console.warn('Failed to load user data after login:', e.message);
    }
  };

  const handleCompanionPicked = async (comp, gender) => {
    setCompanion({ ...comp, gender });
    // Reload memory to get the saved companion profile
    try {
      const mem = await api.getMemory();
      setMemory(mem);
    } catch { /* silent */ }
  };

  const handleSignOut = () => {
    setUser(null); setCompanion(null); setMemory(null); setMessages([]);
    setStatus('guest');
  };

  const handleChangeCompanion = () => {
    setCompanion(null);
  };

  if (status === 'loading') {
    return (
      <>
        <style>{globalCss}</style>
        <div className="loading-screen">
          <div className="loading-logo">Solace <span>AI</span></div>
          <div className="loading-sub">Loading your companion…</div>
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
