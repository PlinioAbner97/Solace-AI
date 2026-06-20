import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import { globalCss } from '../utils/styles';
import { useLanguage } from '../utils/LanguageContext';

function LangSwitch() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="lang-switch" style={{ marginBottom: 24 }}>
      <button className={`lang-btn${lang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')}>EN</button>
      <button className={`lang-btn${lang === 'es' ? ' active' : ''}`} onClick={() => setLang('es')}>ES</button>
    </div>
  );
}

export default function Auth({ onLogin }) {
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') === 'signup' ? 'signup' : 'signin');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError('');
    if (!form.email || !form.password) return setError(t('auth_err_allFields'));
    if (tab === 'signup' && !form.name) return setError(t('auth_err_enterName'));
    if (tab === 'signup' && form.password.length < 6) return setError(t('auth_err_passwordLength'));
    setLoading(true);
    setError('');

    try {
      await fetch('https://solace-ai-xyrq.onrender.com/api/health');
    } catch { /* ignore — just waking up */ }

    let lastError = '';
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        let data;
        if (tab === 'signup') {
          data = await api.signup(form.name, form.email, form.password);
        } else {
          data = await api.signin(form.email, form.password);
        }
        localStorage.setItem('solace_token', data.token);
        onLogin(data.user);
        if (tab === 'signup' || !data.user.companionName) {
          navigate('/pick-companion');
        } else {
          navigate('/app');
        }
        return;
      } catch (e) {
        lastError = e.message || 'Something went wrong.';
        if (attempt < 3 && (lastError.includes('Network') || lastError.includes('fetch') || lastError.includes('reach'))) {
          await new Promise(r => setTimeout(r, 3000));
          continue;
        }
        break;
      }
    }
    setError(lastError);
    setLoading(false);
  };

  const onKey = (e) => { if (e.key === 'Enter') submit(); };

  return (
    <>
      <style>{globalCss}</style>
      <div className="auth-page">

        {/* LEFT — branding */}
        <div className="auth-left">
          <Link to="/" className="auth-back">{t('auth_back')}</Link>
          <LangSwitch />
          <div className="auth-brand">Solace <span>AI</span></div>
          <p className="auth-tagline">{t('auth_tagline')}</p>
          <div className="auth-testimonial">
            <p className="auth-quote">{t('auth_testimonial')}</p>
            <div className="auth-quote-author">{t('auth_testimonial_author')}</div>
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="auth-right">
          <div className="auth-form">
            <div className="auth-form-title">
              {tab === 'signin'
                ? <>{t('auth_welcomeBack_1')} <em>{t('auth_welcomeBack_em')}</em></>
                : <>{t('auth_beginJourney_1')} <em>{t('auth_beginJourney_em')}</em></>}
            </div>
            <p className="auth-form-sub">
              {tab === 'signin' ? t('auth_subSignIn') : t('auth_subSignUp')}
            </p>

            <div className="auth-tabs">
              <button className={`auth-tab${tab === 'signin' ? ' active' : ''}`}
                onClick={() => { setTab('signin'); setError(''); }}>{t('auth_tab_signIn')}</button>
              <button className={`auth-tab${tab === 'signup' ? ' active' : ''}`}
                onClick={() => { setTab('signup'); setError(''); }}>{t('auth_tab_signUp')}</button>
            </div>

            {tab === 'signup' && (
              <div className="field-group">
                <label className="field-label">{t('auth_yourName')}</label>
                <input className="field-input" placeholder={t('auth_namePlaceholder')} value={form.name}
                  onChange={set('name')} onKeyDown={onKey} autoFocus />
              </div>
            )}

            <div className="field-group">
              <label className="field-label">{t('auth_email')}</label>
              <input className="field-input" type="email" placeholder="you@example.com"
                value={form.email} onChange={set('email')} onKeyDown={onKey} />
            </div>

            <div className="field-group">
              <label className="field-label">{t('auth_password')}</label>
              <input className="field-input" type="password" placeholder="••••••••"
                value={form.password} onChange={set('password')} onKeyDown={onKey} />
            </div>

            <button className="auth-submit" onClick={submit} disabled={loading}>
              {loading ? t('auth_btnLoading') : tab === 'signin' ? t('auth_btnSignIn') : t('auth_btnSignUp')}
            </button>

            {error && <p className="auth-error">{error}</p>}

            <p className="auth-switch">
              {tab === 'signin'
                ? <>{t('auth_noAccount')} <a onClick={() => { setTab('signup'); setError(''); }}>{t('auth_createOne')}</a></>
                : <>{t('auth_haveAccount')} <a onClick={() => { setTab('signin'); setError(''); }}>{t('auth_signInLink')}</a></>
              }
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
