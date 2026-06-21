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

// ── MEMORY CONSTELLATION — the page's signature element.
// Real memory fragments drifting slowly on connecting threads, visualizing
// the one thing that makes Solace different: a continuous thread of you,
// not a stateless chat window.
const NODES = [
  { id: 'mem1', x: 14, y: 18, r: 0 },
  { id: 'mem2', x: 62, y: 8,  r: 1 },
  { id: 'mem3', x: 86, y: 34, r: 2 },
  { id: 'mem4', x: 8,  y: 56, r: 3 },
  { id: 'mem5', x: 50, y: 64, r: 4 },
  { id: 'mem6', x: 80, y: 82, r: 5 },
];
const THREADS = [[0,1],[1,2],[0,3],[3,4],[4,5],[1,4]];

function MemoryConstellation({ t }) {
  return (
    <div className="constellation">
      <svg className="constellation-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {THREADS.map(([a, b], i) => {
          const A = NODES[a], B = NODES[b];
          const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2 - 6;
          return (
            <path key={i}
              d={`M ${A.x} ${A.y} Q ${mx} ${my} ${B.x} ${B.y}`}
              className="thread-line" style={{ animationDelay: `${i * 0.4}s` }} />
          );
        })}
      </svg>
      {NODES.map((n) => (
        <div key={n.id} className="mem-node" style={{ left: `${n.x}%`, top: `${n.y}%`, animationDelay: `${n.r * 0.6}s` }}>
          <span className="mem-node-dot" />
          <span className="mem-node-label">{t(n.id)}</span>
        </div>
      ))}
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
          <div className="hero-grid">
            <div className="hero-text">
              <div className="hero-eyebrow">{t('hero_eyebrow')}</div>
              <h1>{t('hero_title_1')}<br /><em>{t('hero_title_em')}</em></h1>
              <p className="hero-sub">{t('hero_sub')}</p>
              <div className="hero-actions">
                <Link to="/auth?tab=signup" className="btn-primary">{t('hero_cta_primary')}</Link>
                <a href="#companions" className="btn-ghost">{t('hero_cta_secondary')}</a>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-memory-label">{t('hero_memory_label')}</div>
              <MemoryConstellation t={t} />
            </div>
          </div>
        </section>

        <div className="thread-divider">
          <svg viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
            <path d="M 0 6 Q 50 0, 100 6 T 200 6" className="thread-divider-path" />
          </svg>
        </div>


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
