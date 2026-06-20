import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { globalCss } from '../utils/styles';
import { FEMALE_COMPANIONS, MALE_COMPANIONS } from '../utils/companions';
import { useLanguage } from '../utils/LanguageContext';

function LangSwitch({ className = '' }) {
  const { lang, setLang } = useLanguage();
  return (
    <div className={`lang-switch ${className}`}>
      <button className={`lang-btn${lang === 'en' ? ' active' : ''}`} onClick={() => setLang('en')}>EN</button>
      <button className={`lang-btn${lang === 'es' ? ' active' : ''}`} onClick={() => setLang('es')}>ES</button>
    </div>
  );
}

export default function Home() {
  const revealRefs = useRef([]);
  const { t } = useLanguage();

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
    }, { threshold: 0.1 });
    revealRefs.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const ref = (i) => el => { revealRefs.current[i] = el; };

  const featured = [
    FEMALE_COMPANIONS[0], FEMALE_COMPANIONS[2],
    MALE_COMPANIONS[0],   MALE_COMPANIONS[2],
    FEMALE_COMPANIONS[5], FEMALE_COMPANIONS[6],
    MALE_COMPANIONS[4],   MALE_COMPANIONS[7],
  ];

  const features = [
    { icon: '🧠', title: t('feat1_title'), text: t('feat1_text') },
    { icon: '🌅', title: t('feat2_title'), text: t('feat2_text') },
    { icon: '🌱', title: t('feat3_title'), text: t('feat3_text') },
    { icon: '♾️', title: t('feat4_title'), text: t('feat4_text') },
  ];

  return (
    <>
      <style>{globalCss}</style>
      <div className="home">

        {/* NAV */}
        <nav className="home-nav">
          <Link to="/" className="nav-logo">Solace <span>AI</span></Link>
          <ul className="nav-links">
            <li className="lang-li"><LangSwitch /></li>
            <li><a href="#companions">{t('nav_companions')}</a></li>
            <li><a href="#features">{t('nav_features')}</a></li>
            <li><Link to="/auth" className="nav-cta">{t('nav_getStarted')}</Link></li>
          </ul>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-eyebrow">{t('hero_eyebrow')}</div>
          <h1>{t('hero_title_1')}<br /><em>{t('hero_title_em')}</em></h1>
          <p className="hero-sub">{t('hero_sub')}</p>
          <div className="hero-actions">
            <Link to="/auth?tab=signup" className="btn-primary">{t('hero_cta_primary')}</Link>
            <a href="#companions" className="btn-ghost">{t('hero_cta_secondary')}</a>
          </div>

          {/* Chat preview */}
          <div className="chat-preview">
            <div className="chat-window">
              <div className="chat-hdr">
                <div className="chat-av">🌙</div>
                <div>
                  <div className="chat-av-name">{t('chat_preview_name')}</div>
                  <div className="chat-av-status">{t('chat_preview_status')}</div>
                </div>
                <div className="chat-online" />
              </div>
              <div className="chat-msgs">
                <div className="cmsg ai">{t('chat_preview_msg1')}</div>
                <div className="cmsg me">{t('chat_preview_msg2')}</div>
                <div className="cmsg ai">{t('chat_preview_msg3')}</div>
              </div>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* COMPANIONS */}
        <section className="section" id="companions">
          <div className="container">
            <div className="reveal" ref={ref(0)}>
              <div className="sec-label">{t('companions_label')}</div>
              <h2 className="sec-title">{t('companions_title_1')} <em>{t('companions_title_em')}</em></h2>
              <p className="sec-body">{t('companions_body')}</p>
            </div>

            <div className="companions-grid" style={{ marginTop: 56 }}>
              {featured.map((c, i) => {
                const isFemale = FEMALE_COMPANIONS.includes(c);
                const traitKey = `companion_${c.name.toLowerCase()}`;
                return (
                  <div key={i} className="comp-card reveal" ref={ref(i + 1)}>
                    <span className="comp-emoji">{c.emoji}</span>
                    <div className="comp-name">{c.name}</div>
                    <div className="comp-trait">{t(traitKey)}</div>
                    <div className={`comp-gender ${isFemale ? 'f' : 'm'}`}>
                      {isFemale ? `♀ ${t('companions_female')}` : `♂ ${t('companions_male')}`}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', marginTop: 48 }} className="reveal" ref={ref(10)}>
              <Link to="/auth?tab=signup" className="btn-primary">
                {t('companions_meetAll')} {FEMALE_COMPANIONS.length + MALE_COMPANIONS.length} {t('companions_companionsWord')} →
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features-strip" id="features">
          <div className="features-row">
            {features.map((f, i) => (
              <div key={i} className="feat reveal" ref={ref(11 + i)}>
                <span className="feat-icon">{f.icon}</span>
                <div className="feat-title">{f.title}</div>
                <p className="feat-text">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <div className="reveal" ref={ref(16)}>
            <h2>{t('cta_title_1')}<br /><em>{t('cta_title_em')}</em></h2>
            <p className="cta-sub">{t('cta_sub')}</p>
            <div className="cta-actions">
              <Link to="/auth?tab=signup" className="btn-primary" style={{ fontSize: 15, padding: '17px 48px' }}>
                {t('cta_primary')}
              </Link>
              <Link to="/auth" className="btn-ghost" style={{ fontSize: 15, padding: '17px 40px' }}>
                {t('cta_secondary')}
              </Link>
            </div>
            <p className="cta-note">{t('cta_note')}</p>
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <div className="footer-logo">Solace <span>AI</span></div>
          <LangSwitch />
          <div className="footer-links">
            <a href="#companions">{t('nav_companions')}</a>
            <a href="#features">{t('nav_features')}</a>
            <Link to="/auth">{t('nav_signIn')}</Link>
          </div>
          <div className="footer-note">© {new Date().getFullYear()} Solace AI. {t('footer_rights')}</div>
        </footer>

      </div>
    </>
  );
}
