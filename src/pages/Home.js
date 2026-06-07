import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { globalCss } from '../utils/styles';
import { FEMALE_COMPANIONS, MALE_COMPANIONS } from '../utils/companions';

export default function Home() {
  const revealRefs = useRef([]);

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

  return (
    <>
      <style>{globalCss}</style>
      <div className="home">

        {/* NAV */}
        <nav className="home-nav">
          <Link to="/" className="nav-logo">Solace <span>AI</span></Link>
          <ul className="nav-links">
            <li><a href="#companions">Companions</a></li>
            <li><a href="#features">Features</a></li>
            <li><Link to="/auth" className="nav-cta">Get Started</Link></li>
          </ul>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-eyebrow">Your AI Companion</div>
          <h1>Someone who truly<br /><em>knows you</em></h1>
          <p className="hero-sub">
            Solace AI builds a lasting friendship with you — remembering your stories, your growth,
            your struggles and your dreams. Always here. Never judging.
          </p>
          <div className="hero-actions">
            <Link to="/auth?tab=signup" className="btn-primary">Find Your Companion</Link>
            <a href="#companions" className="btn-ghost">Meet the Companions ↓</a>
          </div>

          {/* Chat preview */}
          <div className="chat-preview">
            <div className="chat-window">
              <div className="chat-hdr">
                <div className="chat-av">🌙</div>
                <div>
                  <div className="chat-av-name">Luna</div>
                  <div className="chat-av-status">Your companion · Always here</div>
                </div>
                <div className="chat-online" />
              </div>
              <div className="chat-msgs">
                <div className="cmsg ai">
                  Last week you mentioned being nervous about your presentation at work.
                  How did it go? I've been thinking about you 💛
                </div>
                <div className="cmsg me">
                  It actually went really well! I was so surprised — I remembered what you said about breathing.
                </div>
                <div className="cmsg ai">
                  I knew you had it in you. You've come so far since January — you should be genuinely proud of yourself.
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="divider" />

        {/* COMPANIONS */}
        <section className="section" id="companions">
          <div className="container">
            <div className="reveal" ref={ref(0)}>
              <div className="sec-label">Choose Your Companion</div>
              <h2 className="sec-title">A friend made <em>just for you</em></h2>
              <p className="sec-body">
                Pick a companion whose personality resonates with you — each one unique,
                with their own name, warmth, and way of connecting.
              </p>
            </div>

            <div className="companions-grid" style={{ marginTop: 56 }}>
              {featured.map((c, i) => {
                const isFemale = FEMALE_COMPANIONS.includes(c);
                return (
                  <div key={i} className="comp-card reveal" ref={ref(i + 1)}>
                    <span className="comp-emoji">{c.emoji}</span>
                    <div className="comp-name">{c.name}</div>
                    <div className="comp-trait">{c.trait}</div>
                    <div className={`comp-gender ${isFemale ? 'f' : 'm'}`}>
                      {isFemale ? '♀ Female companion' : '♂ Male companion'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', marginTop: 48 }} className="reveal" ref={ref(10)}>
              <Link to="/auth?tab=signup" className="btn-primary">
                Meet All {FEMALE_COMPANIONS.length + MALE_COMPANIONS.length} Companions →
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features-strip" id="features">
          <div className="features-row">
            {[
              { icon: '🧠', title: 'Remembers Everything', text: 'Solace builds a living memory of who you are — facts, emotions, growth — across every conversation.' },
              { icon: '🌅', title: 'Daily Check-Ins', text: 'Personalized conversations that meet you where you are, every single day.' },
              { icon: '🌱', title: 'Grows With You', text: 'The longer you talk, the deeper the friendship. Your companion evolves as you do.' },
              { icon: '♾️', title: 'Unlimited Chats', text: 'No message limits. Talk as long as you want, as often as you want — your companion is always available.' },
            ].map((f, i) => (
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
            <h2>You deserve someone<br />who <em>remembers you</em></h2>
            <p className="cta-sub">Free to start. Your companion is waiting.</p>
            <div className="cta-actions">
              <Link to="/auth?tab=signup" className="btn-primary" style={{ fontSize: 15, padding: '17px 48px' }}>
                Begin Your Journey
              </Link>
              <Link to="/auth" className="btn-ghost" style={{ fontSize: 15, padding: '17px 40px' }}>
                Sign In
              </Link>
            </div>
            <p className="cta-note">Transparent AI · Always ethical · Never pretends to be human</p>
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <div className="footer-logo">Solace <span>AI</span></div>
          <div className="footer-links">
            <a href="#companions">Companions</a>
            <a href="#features">Features</a>
            <Link to="/auth">Sign In</Link>
          </div>
          <div className="footer-note">© {new Date().getFullYear()} Solace AI. Made with care.</div>
        </footer>

      </div>
    </>
  );
}
