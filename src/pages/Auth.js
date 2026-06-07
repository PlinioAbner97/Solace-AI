import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import { globalCss } from '../utils/styles';

export default function Auth({ onLogin }) {
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') === 'signup' ? 'signup' : 'signin');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError('');
    if (!form.email || !form.password) return setError('Please fill in all fields.');
    if (tab === 'signup' && !form.name) return setError('Please enter your name.');
    if (tab === 'signup' && form.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      let data;
      if (tab === 'signup') {
        data = await api.signup(form.name, form.email, form.password);
      } else {
        data = await api.signin(form.email, form.password);
      }
      localStorage.setItem('solace_token', data.token);
      onLogin(data.user);
      // New users go to companion picker; returning users go to app
      if (tab === 'signup' || !data.user.companionName) {
        navigate('/pick-companion');
      } else {
        navigate('/app');
      }
    } catch (e) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => { if (e.key === 'Enter') submit(); };

  return (
    <>
      <style>{globalCss}</style>
      <div className="auth-page">

        {/* LEFT — branding */}
        <div className="auth-left">
          <Link to="/" className="auth-back">← Back to home</Link>
          <div className="auth-brand">Solace <span>AI</span></div>
          <p className="auth-tagline">
            The companion who remembers your name, your stories, your goals —
            and shows up for you every single day.
          </p>
          <div className="auth-testimonial">
            <p className="auth-quote">
              "It remembered that I always feel worse on Monday mornings.
              Without me saying anything, it just checked in. That's when I started crying."
            </p>
            <div className="auth-quote-author">— M.C., Graphic Designer</div>
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="auth-right">
          <div className="auth-form">
            <div className="auth-form-title">
              {tab === 'signin' ? <>Welcome <em>back</em></> : <>Begin your <em>journey</em></>}
            </div>
            <p className="auth-form-sub">
              {tab === 'signin'
                ? 'Sign in to reconnect with your companion.'
                : 'Create your account — it only takes a moment.'}
            </p>

            <div className="auth-tabs">
              <button className={`auth-tab${tab === 'signin' ? ' active' : ''}`}
                onClick={() => { setTab('signin'); setError(''); }}>Sign In</button>
              <button className={`auth-tab${tab === 'signup' ? ' active' : ''}`}
                onClick={() => { setTab('signup'); setError(''); }}>Create Account</button>
            </div>

            {tab === 'signup' && (
              <div className="field-group">
                <label className="field-label">Your Name</label>
                <input className="field-input" placeholder="e.g. Jordan" value={form.name}
                  onChange={set('name')} onKeyDown={onKey} autoFocus />
              </div>
            )}

            <div className="field-group">
              <label className="field-label">Email</label>
              <input className="field-input" type="email" placeholder="you@example.com"
                value={form.email} onChange={set('email')} onKeyDown={onKey} />
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <input className="field-input" type="password" placeholder="••••••••"
                value={form.password} onChange={set('password')} onKeyDown={onKey} />
            </div>

            <button className="auth-submit" onClick={submit} disabled={loading}>
              {loading ? 'Just a moment…' : tab === 'signin' ? 'Sign In to Solace' : 'Create My Account'}
            </button>

            {error && <p className="auth-error">{error}</p>}

            <p className="auth-switch">
              {tab === 'signin'
                ? <>Don't have an account? <a onClick={() => { setTab('signup'); setError(''); }}>Create one →</a></>
                : <>Already have an account? <a onClick={() => { setTab('signin'); setError(''); }}>Sign in →</a></>
              }
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
