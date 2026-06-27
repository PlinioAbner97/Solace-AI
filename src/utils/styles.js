export const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ════════════════════════════════════════════════════════════════
     DESIGN SYSTEM — warm glass: blur + soft gradients with a pulse of
     warmth underneath, so it feels calm and alive, not sterile.
     ════════════════════════════════════════════════════════════════ */
  :root {
    /* Warm-leaning dark base — espresso, not cold charcoal */
    --bg:        #0c0a09;
    --bg-2:      #120e0c;
    --surface:   rgba(255,250,240,0.035);
    --surface-2: rgba(255,250,240,0.055);
    --panel:     rgba(255,250,240,0.045);
    --glass:     rgba(255,248,238,0.06);
    --glass-hover: rgba(255,248,238,0.095);
    --border:    rgba(255,240,220,0.09);
    --border2:   rgba(255,235,210,0.16);

    /* A quiet, warm accent — used sparingly for life and presence */
    --warm:      #e8c79a;
    --warm-dim:  rgba(232,199,154,0.55);
    --warm-glow: rgba(232,199,154,0.18);

    --accent:    #ece5d8;
    --accent-dim: rgba(236,229,216,0.5);

    --cream:     #f5efe4;
    --muted:     #7a7268;
    --muted2:    #a8a096;
    --green:     #8fd0a0;
    --rose:      #d9a39a;

    /* legacy aliases kept so existing inline styles still resolve */
    --amber: var(--warm);
    --lav:   var(--accent);

    --ease: cubic-bezier(0.16, 1, 0.3, 1);
    --ease-slow: cubic-bezier(0.22, 1, 0.36, 1);
  }

  html { scroll-behavior: smooth; }
  body {
    background:
      radial-gradient(ellipse 80% 50% at 20% -10%, rgba(232,199,154,0.06), transparent 60%),
      radial-gradient(ellipse 60% 40% at 90% 10%, rgba(255,250,240,0.035), transparent 55%),
      radial-gradient(ellipse 70% 50% at 50% 110%, rgba(232,199,154,0.04), transparent 60%),
      var(--bg);
    color: var(--cream);
    font-family: 'Inter', sans-serif;
    font-weight: 300;
    letter-spacing: -0.005em;
  }

  ::selection { background: rgba(255,255,255,0.18); }

  /* ── GLASS PRIMITIVE — reused everywhere ── */
  .glass {
    background: var(--glass);
    backdrop-filter: blur(28px) saturate(140%);
    -webkit-backdrop-filter: blur(28px) saturate(140%);
    border: 1px solid var(--border);
  }

  /* ── HOMEPAGE ── */
  .home { min-height: 100vh; overflow-x: hidden; }

  nav.home-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 56px;
    background: rgba(10,10,12,0.55);
    backdrop-filter: blur(24px) saturate(160%);
    -webkit-backdrop-filter: blur(24px) saturate(160%);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    transition: background 0.5s var(--ease);
  }
  .nav-logo {
    font-family: 'Cormorant Garamond', serif; font-size: 21px; font-weight: 400;
    text-decoration: none; color: var(--cream); letter-spacing: 0.01em;
  }
  .nav-logo span { color: var(--muted2); font-style: italic; }
  .nav-links { display: flex; gap: 30px; align-items: center; list-style: none; }
  .nav-links a {
    color: var(--muted2); text-decoration: none; font-size: 13px;
    letter-spacing: 0.02em; transition: color .5s var(--ease);
  }
  .nav-links a:hover { color: var(--cream); }
  .nav-cta {
    background: var(--glass); border: 1px solid var(--border2);
    backdrop-filter: blur(20px);
    color: var(--cream) !important; padding: 10px 24px; border-radius: 100px;
    font-size: 12.5px !important; font-weight: 400 !important;
    transition: all .5s var(--ease) !important;
    box-shadow: 0 1px 0 rgba(255,255,255,0.06) inset, 0 8px 24px rgba(0,0,0,0.25);
  }
  .nav-cta:hover {
    background: var(--glass-hover) !important;
    transform: translateY(-1px);
    box-shadow: 0 1px 0 rgba(255,255,255,0.1) inset, 0 12px 32px rgba(0,0,0,0.3);
  }

  /* ── LANGUAGE SWITCHER ── */
  .lang-switch {
    display: flex; align-items: center; gap: 2px;
    background: var(--glass); border: 1px solid var(--border);
    backdrop-filter: blur(20px);
    border-radius: 100px; padding: 3px;
  }
  .lang-btn {
    padding: 6px 14px; border: none; border-radius: 100px; cursor: pointer;
    background: transparent; color: var(--muted2);
    font-family: 'Inter', sans-serif; font-size: 11.5px; font-weight: 400;
    transition: all .4s var(--ease); letter-spacing: 0.03em;
  }
  .lang-btn.active { background: rgba(232,199,154,0.16); color: var(--cream); }
  .lang-btn:hover:not(.active) { color: var(--cream); }

  .lang-switch-sidebar {
    display: flex; gap: 4px; padding: 10px 14px;
    border-top: 1px solid var(--border);
  }
  .lang-switch-sidebar .lang-btn { flex: 1; text-align: center; padding: 7px; font-size: 11px; }

  /* ── HERO ── */
  .hero {
    position: relative; min-height: 100vh; display: flex; align-items: center;
    padding: 140px 56px 80px;
  }
  .hero-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
    max-width: 1280px; margin: 0 auto; width: 100%;
  }
  .hero-text { text-align: left; }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 10px; font-size: 11px;
    letter-spacing: .18em; text-transform: uppercase; color: var(--warm-dim); margin-bottom: 28px;
    opacity: 0; animation: fadeUp 1.2s .2s var(--ease-slow) forwards;
  }
  .hero-eyebrow::before { content:''; width:24px; height:1px; background: var(--border2); }
  .hero h1 {
    font-family: 'Cormorant Garamond', serif; font-size: clamp(44px,5.2vw,76px);
    font-weight: 300; line-height: 1.05; letter-spacing: -0.01em;
    opacity: 0; animation: fadeUp 1.3s .4s var(--ease-slow) forwards;
  }
  .hero h1 em { font-style: italic; color: var(--muted2); }
  .hero-sub {
    margin-top: 26px; font-size: 16px; color: var(--muted2); max-width: 440px; line-height: 1.75;
    opacity: 0; animation: fadeUp 1.3s .65s var(--ease-slow) forwards; font-weight: 300;
  }
  .hero-actions {
    margin-top: 40px; display: flex; gap: 14px;
    opacity: 0; animation: fadeUp 1.3s .85s var(--ease-slow) forwards;
  }
  .btn-primary {
    background: var(--cream); color: #0a0a0c;
    font-family: 'Inter', sans-serif; font-size: 13.5px; font-weight: 500;
    letter-spacing: 0.01em; padding: 15px 36px; border-radius: 100px; border: none;
    cursor: pointer; transition: all .5s var(--ease);
    box-shadow: 0 1px 0 rgba(255,255,255,0.4) inset, 0 12px 32px rgba(0,0,0,0.35);
    text-decoration: none; display: inline-flex; align-items: center;
  }
  .btn-primary:hover {
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 1px 0 rgba(255,255,255,0.5) inset, 0 18px 44px rgba(0,0,0,0.4);
  }
  .btn-ghost {
    background: var(--glass); color: var(--cream); font-family: 'Inter', sans-serif;
    font-size: 13.5px; font-weight: 400; padding: 15px 32px; border-radius: 100px;
    border: 1px solid var(--border2); backdrop-filter: blur(20px);
    cursor: pointer; transition: all .5s var(--ease); text-decoration: none;
    display: inline-flex; align-items: center;
  }
  .btn-ghost:hover { background: var(--glass-hover); transform: translateY(-2px); }

  /* ── MEMORY CONSTELLATION — signature element ──
     A small thread of real memory fragments, drifting slowly, connected by
     curved lines. This is the one bold visual idea on the page: Solace holds
     a continuous thread of you, not a stateless chat window. */
  .hero-visual {
    position: relative; opacity: 0;
    animation: fadeUp 1.5s 1s var(--ease-slow) forwards;
  }
  .hero-memory-label {
    font-size: 10.5px; letter-spacing: .14em; text-transform: uppercase;
    color: var(--muted); margin-bottom: 18px; text-align: left;
  }
  .constellation {
    position: relative; width: 100%; aspect-ratio: 1.15 / 1;
    max-width: 560px;
  }
  .constellation-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
  .thread-line {
    fill: none; stroke: var(--warm-dim); stroke-width: 0.15; opacity: 0;
    stroke-dasharray: 4; stroke-dashoffset: 4;
    animation: threadDraw 2.4s var(--ease-slow) forwards;
  }
  @keyframes threadDraw {
    0%   { opacity: 0; stroke-dashoffset: 4; }
    15%  { opacity: 0.55; }
    100% { opacity: 0.4; stroke-dashoffset: 0; }
  }
  .mem-node {
    position: absolute; transform: translate(-50%, -50%);
    display: flex; align-items: center; gap: 9px;
    opacity: 0; animation: nodeAppear 1.4s var(--ease-slow) forwards, drift 9s ease-in-out infinite;
  }
  @keyframes nodeAppear { from { opacity: 0; transform: translate(-50%,-50%) scale(0.7); } to { opacity: 1; transform: translate(-50%,-50%) scale(1); } }
  @keyframes drift {
    0%, 100% { margin-top: 0px; margin-left: 0px; }
    50%      { margin-top: -7px; margin-left: 4px; }
  }
  .mem-node-dot {
    width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
    background: var(--warm); box-shadow: 0 0 12px 2px var(--warm-glow);
  }
  .mem-node-label {
    font-size: 12px; color: var(--muted2); white-space: nowrap;
    background: rgba(255,248,238,0.05); border: 1px solid var(--border);
    backdrop-filter: blur(16px); padding: 5px 11px; border-radius: 100px;
    font-weight: 300;
  }

  /* signature thread divider — used instead of a plain hairline between sections */
  .thread-divider { max-width: 900px; margin: 0 auto; padding: 0 24px; }
  .thread-divider svg { width: 100%; height: 12px; display: block; }
  .thread-divider-path { fill: none; stroke: var(--border2); stroke-width: 1; }

  /* ── SECTIONS ── */
  .section { position:relative; padding:120px 24px; }

  /* ── LIVE PREVIEW SECTION ── */
  .preview-section { padding: 100px 24px; }
  .preview-container {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 72px; align-items: center; max-width: 1100px; margin: 0 auto;
  }
  .preview-text { text-align: left; }

  /* The phone shell */
  .preview-wrap { display: flex; justify-content: center; align-items: center; }
  .preview-phone {
    width: 100%; max-width: 380px;
    background: rgba(16,14,12,0.85);
    backdrop-filter: blur(32px) saturate(150%);
    -webkit-backdrop-filter: blur(32px) saturate(150%);
    border: 1px solid var(--border2); border-radius: 28px;
    overflow: hidden;
    box-shadow:
      0 1px 0 rgba(255,255,255,0.08) inset,
      0 40px 80px rgba(0,0,0,0.55),
      0 0 0 1px rgba(0,0,0,0.3);
  }
  .preview-phone-hdr {
    display: flex; align-items: center; gap: 12px;
    padding: 18px 20px 14px;
    border-bottom: 1px solid var(--border);
    background: rgba(255,255,255,0.02);
  }
  .preview-comp-av {
    width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
    background: rgba(255,248,238,0.1); border: 1px solid var(--border2);
    display: flex; align-items: center; justify-content: center; font-size: 17px;
    animation: breathe 5s ease-in-out infinite;
  }
  .preview-comp-name { font-family: 'Cormorant Garamond', serif; font-size: 16px; font-weight: 400; }
  .preview-comp-status {
    font-size: 10.5px; color: var(--green); display: flex; align-items: center; gap: 5px; margin-top: 1px;
  }
  .preview-comp-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--green); box-shadow: 0 0 6px var(--green);
    animation: pulse 2.5s infinite;
  }

  /* Memory context pills — shows what Luna knows */
  .preview-memory-bar {
    padding: 10px 16px 8px;
    background: rgba(232,199,154,0.04);
    border-bottom: 1px solid var(--border);
  }
  .preview-memory-label-sm {
    font-size: 9.5px; letter-spacing: .12em; text-transform: uppercase;
    color: var(--warm-dim); margin-bottom: 7px;
  }
  .preview-pills { display: flex; flex-wrap: wrap; gap: 5px; }
  .preview-pill {
    font-size: 10.5px; padding: 3px 10px; border-radius: 100px;
    background: rgba(232,199,154,0.08); border: 1px solid rgba(232,199,154,0.15);
    color: var(--muted2); opacity: 0; transform: translateY(4px);
    transition: opacity 0.5s var(--ease-slow), transform 0.5s var(--ease-slow);
  }
  .preview-pill.preview-pill-vis { opacity: 1; transform: translateY(0); }

  /* Messages */
  .preview-msgs {
    padding: 16px; display: flex; flex-direction: column;
    gap: 10px; min-height: 260px;
  }
  .preview-msg {
    max-width: 82%; padding: 10px 14px; border-radius: 16px;
    font-size: 13px; line-height: 1.6; font-weight: 300;
    opacity: 0; transform: translateY(8px);
    transition: opacity 0.6s var(--ease-slow), transform 0.6s var(--ease-slow);
  }
  .preview-msg.preview-msg-vis { opacity: 1; transform: translateY(0); }
  .preview-msg-ai {
    background: linear-gradient(135deg, rgba(232,180,150,0.16), rgba(217,140,150,0.08));
    border: 1px solid rgba(232,180,150,0.2);
    border-radius: 16px 16px 16px 4px; color: var(--cream);
  }
  .preview-msg-user {
    align-self: flex-end;
    background: linear-gradient(135deg, rgba(150,170,232,0.14), rgba(170,150,232,0.1));
    border: 1px solid rgba(170,165,232,0.2);
    border-radius: 16px 16px 4px 16px; color: var(--cream);
  }
  .preview-typing {
    display: flex; gap: 4px; align-items: center; padding: 10px 14px;
    width: fit-content;
    background: linear-gradient(135deg, rgba(232,180,150,0.16), rgba(217,140,150,0.08));
    border: 1px solid rgba(232,180,150,0.2); border-radius: 16px 16px 16px 4px;
  }


  .container { max-width:1100px; margin:0 auto; }
  .sec-label { font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--muted2); margin-bottom:18px; }
  .sec-title { font-family:'Cormorant Garamond',serif; font-size:clamp(34px,4.8vw,58px); font-weight:300; line-height:1.15; margin-bottom:18px; letter-spacing: -0.01em; }
  .sec-title em { font-style:italic; color:var(--muted2); }
  .sec-body { font-size:15.5px; color:var(--muted2); line-height:1.8; max-width:520px; font-weight: 300; }

  .divider { height:1px; background:linear-gradient(90deg,transparent,var(--border),transparent); max-width:900px; margin:0 auto; }

  /* companions preview */
  .companions-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-top:56px; }
  .comp-card {
    background: var(--glass); border:1px solid var(--border); border-radius:22px;
    padding:30px 20px; text-align:center; cursor:default;
    backdrop-filter: blur(24px);
    transition: all .6s var(--ease);
  }
  .comp-card:hover {
    border-color: var(--border2); transform:translateY(-6px);
    background: var(--glass-hover);
    box-shadow: 0 30px 60px rgba(0,0,0,0.3);
  }
  .comp-emoji { font-size:32px; margin-bottom:14px; display:block; filter: saturate(0.9); }
  .comp-name { font-family:'Cormorant Garamond',serif; font-size:19px; font-weight:400; margin-bottom:6px; }
  .comp-trait { font-size:12px; color:var(--muted2); line-height:1.6; font-weight: 300; }
  .comp-gender { font-size:10px; letter-spacing:.1em; text-transform:uppercase; margin-top:10px; color: var(--muted); }

  /* features strip */
  .features-strip { border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
  .features-row { display:grid; grid-template-columns:repeat(4,1fr); }
  .feat { padding:52px 32px; border-right:1px solid var(--border); transition: background .6s var(--ease); }
  .feat:last-child { border-right:none; }
  .feat:hover { background: rgba(255,255,255,0.02); }
  .feat-icon { font-size:24px; margin-bottom:18px; display:block; opacity: 0.85; filter: saturate(0.8); }
  .feat-title { font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:400; margin-bottom:8px; }
  .feat-text { font-size:12.5px; color:var(--muted2); line-height:1.7; font-weight: 300; }

  /* cta */
  .cta-section { text-align:center; padding:140px 24px; }
  .cta-section h2 { font-family:'Cormorant Garamond',serif; font-size:clamp(40px,5.5vw,72px); font-weight:300; line-height:1.12; margin-bottom:22px; letter-spacing: -0.01em; }
  .cta-section h2 em { font-style:italic; color:var(--muted2); }
  .cta-sub { font-size:15.5px; color:var(--muted2); margin-bottom:44px; font-weight: 300; }
  .cta-actions { display:flex; gap:14px; justify-content:center; }
  .cta-note { font-size:10.5px; color:var(--muted); letter-spacing:.1em; text-transform:uppercase; margin-top:28px; }

  /* footer */
  footer { border-top:1px solid var(--border); padding:40px 56px; display:flex; align-items:center; justify-content:space-between; }
  .footer-logo { font-family:'Cormorant Garamond',serif; font-size:17px; font-weight: 400; }
  .footer-logo span { color: var(--muted2); font-style: italic; }
  .footer-note { font-size:11.5px; color:var(--muted); }
  .footer-links { display:flex; gap:24px; }
  .footer-links a { font-size:11.5px; color:var(--muted); text-decoration:none; letter-spacing:.05em; transition:color .4s var(--ease); }
  .footer-links a:hover { color:var(--cream); }

  /* ── ONBOARDING ── */
  .onb-wrap {
    min-height: 100dvh; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 32px 24px max(32px, env(safe-area-inset-bottom));
    background:
      radial-gradient(ellipse 70% 50% at 20% 10%, rgba(232,199,154,0.07), transparent 60%),
      radial-gradient(ellipse 60% 40% at 85% 80%, rgba(200,180,232,0.05), transparent 55%),
      var(--bg);
  }
  .onb-dots {
    display: flex; gap: 8px; margin-bottom: 48px;
  }
  .onb-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--border2); transition: all .4s var(--ease);
  }
  .onb-dot-active { background: var(--warm); width: 22px; border-radius: 3px; }
  .onb-dot-done { background: var(--muted); }

  .onb-step {
    display: flex; flex-direction: column; align-items: center; text-align: center;
    max-width: 440px; width: 100%;
    animation: fadeUp 0.6s var(--ease-slow);
  }
  .onb-companion-av {
    font-size: 72px; margin-bottom: 24px;
    animation: breathe 4s ease-in-out infinite;
    display: block;
  }
  .onb-step-icon { font-size: 48px; margin-bottom: 22px; }
  .onb-title {
    font-family: 'Cormorant Garamond', serif; font-size: clamp(30px, 7vw, 42px);
    font-weight: 300; line-height: 1.15; margin-bottom: 18px; letter-spacing: -0.01em;
  }
  .onb-body {
    font-size: 15px; color: var(--muted2); line-height: 1.75; font-weight: 300; max-width: 380px;
  }
  .onb-trait {
    font-size: 12px; color: var(--muted); font-style: italic; margin-top: 16px; letter-spacing: .04em;
  }
  .onb-btn {
    margin-top: 36px; padding: 16px 40px; border-radius: 100px; border: none; cursor: pointer;
    background: var(--cream); color: #0a0a0c;
    font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500;
    transition: all .5s var(--ease);
    box-shadow: 0 1px 0 rgba(255,255,255,0.4) inset, 0 12px 30px rgba(0,0,0,0.3);
    width: 100%; max-width: 320px;
  }
  .onb-btn:hover:not(:disabled) { transform: translateY(-2px); }
  .onb-btn:disabled { cursor: not-allowed; }
  .onb-skip {
    margin-top: 14px; background: transparent; border: none; cursor: pointer;
    color: var(--muted); font-family: 'Inter', sans-serif; font-size: 12.5px;
    transition: color .3s var(--ease); padding: 6px;
  }
  .onb-skip:hover { color: var(--muted2); }

  .onb-fields { width: 100%; margin-top: 28px; display: flex; flex-direction: column; gap: 18px; }
  .onb-field { text-align: left; }
  .onb-label { font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted2); margin-bottom: 8px; display: block; }
  .onb-input {
    width: 100%; background: var(--glass); border: 1px solid var(--border); border-radius: 14px;
    padding: 13px 16px; color: var(--cream); font-family: 'Inter', sans-serif;
    font-size: 14px; font-weight: 300; outline: none; transition: all .4s var(--ease);
    backdrop-filter: blur(16px); resize: none;
  }
  .onb-input:focus { border-color: var(--border2); background: var(--glass-hover); }
  .onb-input::placeholder { color: var(--muted); }
  .onb-textarea { min-height: 90px; }

  .onb-moods { display: flex; gap: 10px; margin-top: 28px; justify-content: center; flex-wrap: wrap; }
  .onb-mood {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    padding: 16px 14px; border-radius: 18px; border: 1px solid var(--border);
    background: var(--glass); backdrop-filter: blur(16px); cursor: pointer;
    transition: all .4s var(--ease); min-width: 72px; flex: 1; max-width: 90px;
  }
  .onb-mood:hover { border-color: var(--border2); transform: translateY(-3px); }
  .onb-mood.onb-mood-selected {
    border-color: var(--warm-dim); background: rgba(232,199,154,0.13);
    transform: translateY(-5px);
    box-shadow: 0 12px 28px rgba(0,0,0,0.2);
  }
  .onb-mood-emoji { font-size: 28px; }
  .onb-mood-label { font-size: 11px; color: var(--muted2); }

  .onb-promises { width: 100%; margin-top: 28px; display: flex; flex-direction: column; gap: 12px; }
  .onb-promise {
    display: flex; align-items: center; gap: 14px; padding: 14px 18px;
    background: var(--glass); border: 1px solid var(--border); border-radius: 14px;
    text-align: left; backdrop-filter: blur(16px);
    animation: fadeUp 0.5s var(--ease-slow);
  }
  .onb-promise-icon { font-size: 20px; flex-shrink: 0; }
  .onb-promise-text { font-size: 14px; color: var(--cream); font-weight: 300; line-height: 1.5; }

  /* ── AUTH PAGE ── */
  .auth-page { min-height: 100vh; display: flex; align-items: stretch; }
  .auth-left {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 60px 48px; max-width: 540px;
  }
  .auth-right {
    flex: 1; background: rgba(255,255,255,0.02); border-left: 1px solid var(--border);
    backdrop-filter: blur(20px);
    display: flex; align-items: center; justify-content: center; padding: 60px 48px;
  }
  .auth-brand { font-family: 'Cormorant Garamond', serif; font-size: 30px; font-weight: 300; margin-bottom: 10px; }
  .auth-brand span { color: var(--muted2); font-style: italic; }
  .auth-tagline { font-size: 14.5px; color: var(--muted2); line-height: 1.75; max-width: 340px; margin-bottom: 48px; font-weight: 300; }
  .auth-testimonial {
    background: var(--glass); border: 1px solid var(--border); border-radius: 20px;
    backdrop-filter: blur(24px);
    padding: 28px; max-width: 380px;
  }
  .auth-quote { font-family: 'Cormorant Garamond', serif; font-size: 17px; font-style: italic; line-height: 1.65; color: var(--cream); margin-bottom: 16px; font-weight: 300; }
  .auth-quote-author { font-size: 11.5px; color: var(--muted2); letter-spacing: .05em; }

  .auth-form { width: 100%; max-width: 420px; }
  .auth-form-title { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 300; margin-bottom: 8px; }
  .auth-form-title em { font-style: italic; color: var(--muted2); }
  .auth-form-sub { font-size: 13.5px; color: var(--muted2); margin-bottom: 36px; font-weight: 300; }
  .auth-tabs {
    display:flex; gap:4px; background: var(--glass); border: 1px solid var(--border);
    backdrop-filter: blur(20px);
    border-radius:100px; padding:4px; margin-bottom:28px;
  }
  .auth-tab {
    flex:1; padding:10px; border:none; border-radius:100px; cursor:pointer;
    font-family:'Inter',sans-serif; font-size:12.5px; transition:all .4s var(--ease);
    background:transparent; color:var(--muted2);
  }
  .auth-tab.active { background: rgba(232,199,154,0.14); color: var(--cream); }
  .field-group { margin-bottom: 16px; }
  .field-label { font-size:10.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted2); margin-bottom:8px; display:block; }
  .field-input {
    width:100%; background: var(--glass); border:1px solid var(--border); border-radius:14px;
    padding:13px 16px; color:var(--cream); font-family:'Inter',sans-serif; font-size:14px;
    font-weight:300; outline:none; transition:all .4s var(--ease); backdrop-filter: blur(12px);
  }
  .field-input:focus { border-color: var(--border2); background: var(--glass-hover); }
  .field-input::placeholder { color:var(--muted); }
  .auth-submit {
    width:100%; padding:15px; border:none; border-radius:14px; cursor:pointer; margin-top:8px;
    background: var(--cream); color: #0a0a0c;
    font-family:'Inter',sans-serif; font-size:13.5px; font-weight:500;
    transition: all .5s var(--ease);
    box-shadow: 0 1px 0 rgba(255,255,255,0.4) inset, 0 12px 30px rgba(0,0,0,0.3);
  }
  .auth-submit:hover:not(:disabled) { transform:translateY(-2px); }
  .auth-submit:disabled { opacity:.5; cursor:not-allowed; }
  .auth-error { font-size:12.5px; color:var(--rose); margin-top:12px; text-align:center; }
  .auth-switch { font-size:12.5px; color:var(--muted2); text-align:center; margin-top:18px; }
  .auth-switch a { color:var(--cream); text-decoration:none; cursor:pointer; }
  .auth-back { display:inline-flex; align-items:center; gap:8px; font-size:12.5px; color:var(--muted2); text-decoration:none; margin-bottom:36px; transition:color .4s var(--ease); }
  .auth-back:hover { color:var(--cream); }

  /* ── COMPANION PICKER ── */
  .picker-page {
    min-height: 100vh; display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 60px 24px;
  }
  .picker-title { font-family:'Cormorant Garamond',serif; font-size:clamp(32px,4.8vw,54px); font-weight:300; margin-bottom:12px; text-align:center; letter-spacing: -0.01em; }
  .picker-title em { font-style:italic; color:var(--muted2); }
  .picker-sub { font-size:14.5px; color:var(--muted2); margin-bottom:48px; text-align:center; max-width:480px; line-height:1.7; font-weight: 300; }
  .gender-tabs { display:flex; gap:8px; margin-bottom:40px; }
  .gender-tab {
    padding:12px 32px; border-radius:100px; font-size:13.5px; font-weight:400; cursor:pointer;
    border:1px solid var(--border); background: var(--glass);
    backdrop-filter: blur(20px);
    color:var(--muted2); font-family:'Inter',sans-serif; transition:all .4s var(--ease);
  }
  .gender-tab.active-f, .gender-tab.active-m {
    border-color: var(--warm-dim); background: rgba(232,199,154,0.13); color: var(--cream);
  }
  .picker-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; max-width:900px; width:100%; margin-bottom:40px; }
  .picker-card {
    background: var(--glass); border:1px solid var(--border); border-radius:22px;
    padding:28px 16px; text-align:center; cursor:pointer; transition: all .5s var(--ease);
    backdrop-filter: blur(24px);
  }
  .picker-card:hover { border-color: var(--border2); transform:translateY(-4px); background: var(--glass-hover); }
  .picker-card.selected { transform:translateY(-6px); box-shadow: 0 24px 50px rgba(0,0,0,0.35), 0 0 0 1px var(--warm-dim); background: var(--glass-hover); border-color: var(--warm-dim); }
  .picker-emoji { font-size:36px; margin-bottom:12px; display:block; filter: saturate(0.9); }
  .picker-name { font-family:'Cormorant Garamond',serif; font-size:19px; font-weight:400; margin-bottom:6px; }
  .picker-trait { font-size:11.5px; color:var(--muted2); line-height:1.6; font-weight: 300; }
  .picker-check { font-size:16px; margin-top:10px; display:block; color: var(--warm); }
  .picker-btn {
    padding:15px 48px; border:none; border-radius:100px; cursor:pointer;
    background: var(--cream); color: #0a0a0c;
    font-family:'Inter',sans-serif; font-size:14px; font-weight:500;
    transition:all .5s var(--ease);
    box-shadow: 0 1px 0 rgba(255,255,255,0.4) inset, 0 12px 30px rgba(0,0,0,0.3);
  }
  .picker-btn:hover { transform:translateY(-2px); }
  .picker-btn:disabled { opacity:.4; cursor:not-allowed; transform:none; }

  /* ── APP SHELL ── */
  .app-shell { display:flex; height:100vh; overflow:hidden; }

  /* sidebar */
  .sidebar {
    width:272px; min-width:272px;
    background: rgba(255,255,255,0.025);
    backdrop-filter: blur(30px) saturate(150%);
    -webkit-backdrop-filter: blur(30px) saturate(150%);
    border-right:1px solid var(--border); display:flex; flex-direction:column;
    padding:0; overflow:hidden;
  }
  .sb-top { padding:22px 20px 18px; border-bottom:1px solid var(--border); }
  .sb-logo { font-family:'Cormorant Garamond',serif; font-size:19px; font-weight:400; }
  .sb-logo span { color: var(--muted2); font-style: italic; }
  .sb-user {
    display:flex; align-items:center; gap:10px; margin-top:14px;
    background: var(--glass); border: 1px solid var(--border); border-radius:14px; padding:10px 12px;
  }
  .sb-avatar {
    width:34px; height:34px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-family:'Cormorant Garamond',serif; font-size:15px; color: var(--cream); flex-shrink:0;
    background: rgba(255,255,255,0.12) !important; border: 1px solid var(--border2);
  }
  .sb-uname { font-size:13.5px; font-weight:400; color:var(--cream); }
  .sb-since { font-size:10.5px; color:var(--muted); margin-top:1px; }

  .sb-companion {
    margin:14px 20px 0; padding:12px 14px; border-radius:16px;
    background: var(--glass); border:1px solid var(--border);
    display:flex; align-items:center; gap:10px;
  }
  .sb-comp-emoji { font-size:20px; flex-shrink:0; filter: saturate(0.9); }
  .sb-comp-name { font-family:'Cormorant Garamond',serif; font-size:15px; font-weight:400; }
  .sb-comp-online { font-size:10.5px; color:var(--green); display:flex; align-items:center; gap:4px; opacity: 0.85; }
  .sb-comp-dot { width:5px; height:5px; border-radius:50%; background:var(--green); box-shadow:0 0 5px var(--green); animation:pulse 2.5s infinite; }

  .sb-nav { flex:1; padding:14px 12px; overflow-y:auto; }
  .sb-nav::-webkit-scrollbar { width:3px; }
  .sb-nav::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }
  .sb-section { font-size:9.5px; letter-spacing:.16em; text-transform:uppercase; color:var(--muted); padding:0 8px; margin:18px 0 6px; }
  .sb-item {
    display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:12px;
    cursor:pointer; font-size:13px; color:var(--muted2); transition: all .4s var(--ease); margin-bottom:2px;
    border:none; background:transparent; width:100%; text-align:left;
    font-family:'Inter',sans-serif; font-weight:300;
  }
  .sb-item:hover { background: var(--glass); color:var(--cream); }
  .sb-item.active { background: rgba(232,199,154,0.13); color:var(--cream); }
  .sb-icon { font-size:14px; width:20px; text-align:center; opacity: 0.85; }

  .sb-stats {
    margin:16px 0 0; padding:12px 14px; border-radius:14px;
    background: var(--glass); border:1px solid var(--border);
  }
  .sb-stats-label { font-size:9.5px; letter-spacing:.14em; text-transform:uppercase; color:var(--muted2); margin-bottom:8px; }
  .sb-stats-row { font-size:12px; color:var(--muted2); line-height:1.8; }

  .sb-bottom { padding:14px 12px; border-top:1px solid var(--border); }
  .sb-signout {
    display:flex; align-items:center; gap:10px; padding:9px 12px; width:100%;
    border:none; background:transparent; cursor:pointer; border-radius:12px;
    font-size:12.5px; color:var(--muted); font-family:'Inter',sans-serif; transition: all .4s var(--ease);
  }
  .sb-signout:hover { background: rgba(217,154,154,0.08); color:var(--rose); }
  .sb-change-comp {
    display:flex; align-items:center; gap:10px; padding:9px 12px; width:100%;
    border:none; background:transparent; cursor:pointer; border-radius:12px;
    font-size:12.5px; color:var(--muted); font-family:'Inter',sans-serif; transition: all .4s var(--ease); margin-bottom:4px;
  }
  .sb-change-comp:hover { background: var(--glass); color:var(--cream); }

  /* main area */
  .main-area { flex:1; display:flex; flex-direction:column; overflow:hidden; }

  /* chat */
  .chat-view { display:flex; flex-direction:column; height:100%; }
  .chat-top {
    padding:16px 28px; border-bottom:1px solid var(--border);
    display:flex; align-items:center; justify-content:space-between;
    background: rgba(255,255,255,0.015); backdrop-filter: blur(20px);
    flex-shrink:0;
  }
  .chat-comp-info { display:flex; align-items:center; gap:12px; }
  .chat-comp-av {
    width:42px; height:42px; border-radius:50%;
    display:flex; align-items:center; justify-content:center; font-size:20px;
    background: rgba(255,248,238,0.1) !important; border: 1px solid var(--border2);
    box-shadow: 0 0 0 0 var(--warm-glow);
    animation: breathe 5s ease-in-out infinite;
  }
  @keyframes breathe {
    0%, 100% { box-shadow: 0 0 0 0 var(--warm-glow); }
    50%      { box-shadow: 0 0 18px 4px var(--warm-glow); }
  }
  .chat-comp-name { font-family:'Cormorant Garamond',serif; font-size:19px; font-weight:400; }
  .chat-comp-status { font-size:11px; display:flex; align-items:center; gap:5px; }
  .status-dot { width:6px; height:6px; border-radius:50%; animation:pulse 2.5s infinite; }
  .mode-btns { display:flex; gap:6px; }
  .mode-btn {
    padding:7px 14px; border-radius:100px; font-size:11.5px; cursor:pointer;
    border:1px solid var(--border); background: var(--glass);
    backdrop-filter: blur(16px);
    color:var(--muted2); font-family:'Inter',sans-serif; transition:all .4s var(--ease);
  }
  .mode-btn.active { border-color: var(--warm-dim); background: rgba(232,199,154,0.14) !important; color: var(--cream) !important; }
  .mode-btn:hover:not(.active) { border-color:var(--border2); color:var(--cream); }

  /* ── MOBILE MENU TRIGGER (hidden on desktop) ── */
  .menu-trigger {
    display: none;
    width: 38px; height: 38px; border-radius: 50%;
    border: 1px solid var(--border); background: var(--glass); backdrop-filter: blur(16px);
    color: var(--cream); font-size: 19px; font-weight: 600;
    align-items: center; justify-content: center;
    cursor: pointer; flex-shrink: 0;
  }

  /* ── MOBILE BOTTOM SHEET MENU ── */
  .menu-overlay {
    display: none;
    position: fixed; inset: 0; z-index: 90;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px);
    animation: fadeUp 0.35s var(--ease-slow);
  }
  .menu-sheet {
    display: none;
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 91;
    background: rgba(16,16,18,0.85);
    backdrop-filter: blur(40px) saturate(160%);
    -webkit-backdrop-filter: blur(40px) saturate(160%);
    border-top: 1px solid var(--border2);
    border-radius: 28px 28px 0 0;
    padding: 10px 20px max(20px, env(safe-area-inset-bottom));
    box-shadow: 0 1px 0 rgba(255,255,255,0.07) inset, 0 -20px 60px rgba(0,0,0,0.5);
    animation: sheetUp 0.5s var(--ease-slow);
    max-height: 80vh;
    overflow-y: auto;
  }
  .menu-sheet-handle {
    width: 36px; height: 4px; border-radius: 4px;
    background: var(--border2); margin: 0 auto 18px;
  }
  .menu-sheet-user {
    display: flex; align-items: center; gap: 12px;
    padding-bottom: 16px; margin-bottom: 16px;
    border-bottom: 1px solid var(--border);
  }
  .menu-sheet-stats {
    padding: 14px; border-radius: 16px;
    background: var(--glass); border: 1px solid var(--border);
    margin-bottom: 16px;
  }
  .menu-sheet-lang {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 4px; margin-bottom: 12px;
    border-bottom: 1px solid var(--border);
  }
  .menu-sheet-lang-label { font-size: 13.5px; color: var(--cream); }
  .menu-sheet-item {
    display: flex; align-items: center; gap: 12px; width: 100%;
    padding: 14px 12px; border: none; background: transparent;
    border-radius: 14px; cursor: pointer; text-align: left;
    font-family: 'Inter', sans-serif; font-size: 14.5px; color: var(--cream);
    margin-bottom: 4px; transition: background 0.4s var(--ease);
  }
  .menu-sheet-item:active { background: var(--glass); }
  .menu-sheet-item span { font-size: 17px; }
  .menu-sheet-danger { color: var(--rose); }
  .menu-sheet-close {
    width: 100%; margin-top: 12px; padding: 13px;
    border: 1px solid var(--border); background: var(--glass);
    border-radius: 16px; color: var(--muted2);
    font-family: 'Inter', sans-serif; font-size: 13.5px; cursor: pointer;
  }

  /* ── STORY CARD MODAL ── */
  .story-card-modal {
    position: fixed; left: 50%; top: 50%; transform: translate(-50%,-50%);
    z-index: 96; width: min(560px, 95vw);
    background: rgba(14,12,10,0.92);
    backdrop-filter: blur(40px) saturate(160%);
    -webkit-backdrop-filter: blur(40px) saturate(160%);
    border: 1px solid var(--border2); border-radius: 28px;
    padding: 24px;
    box-shadow: 0 1px 0 rgba(255,255,255,0.07) inset, 0 40px 100px rgba(0,0,0,0.7);
    animation: scaleIn 0.45s var(--ease-slow);
    max-height: 95vh; overflow-y: auto;
  }
  .story-slide-tabs {
    display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap;
  }
  .story-slide-tab {
    padding: 7px 14px; border-radius: 100px; font-size: 12px;
    border: 1px solid var(--border); background: var(--glass);
    color: var(--muted2); cursor: pointer; transition: all .3s var(--ease);
    font-family: 'Inter', sans-serif;
  }
  .story-slide-tab.active {
    border-color: var(--warm-dim); background: rgba(232,199,154,0.12);
    color: var(--warm);
  }
  .story-canvas-wrap {
    border-radius: 16px; overflow: hidden;
    border: 1px solid var(--border);
    box-shadow: 0 20px 50px rgba(0,0,0,0.4);
    /* Portrait aspect ratio — 9:16 */
    aspect-ratio: 9/16; max-height: 50vh; display: flex; align-items: center;
    background: #0e0b08;
  }
  .story-canvas {
    width: 100%; height: 100%; object-fit: contain; display: block;
  }

  /* ── SHARE RELATIONSHIP CARD MODAL ── */
  .share-card-modal {
    position: fixed; left: 50%; top: 50%; transform: translate(-50%,-50%);
    z-index: 96; width: min(960px, 95vw);
    background: rgba(14,12,10,0.92);
    backdrop-filter: blur(40px) saturate(160%);
    -webkit-backdrop-filter: blur(40px) saturate(160%);
    border: 1px solid var(--border2); border-radius: 28px;
    padding: 28px;
    box-shadow: 0 1px 0 rgba(255,255,255,0.07) inset, 0 40px 100px rgba(0,0,0,0.7);
    animation: scaleIn 0.45s var(--ease-slow);
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: translate(-50%,-50%) scale(0.92); }
    to   { opacity: 1; transform: translate(-50%,-50%) scale(1); }
  }
  .share-card-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px;
  }
  .share-card-title {
    font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 400;
    color: var(--cream);
  }
  .share-card-close {
    width: 32px; height: 32px; border-radius: 50%;
    border: 1px solid var(--border); background: var(--glass);
    color: var(--muted2); font-size: 18px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all .3s var(--ease);
  }
  .share-card-close:hover { color: var(--cream); border-color: var(--border2); }
  .share-card-canvas-wrap {
    border-radius: 18px; overflow: hidden;
    border: 1px solid var(--border);
    box-shadow: 0 20px 50px rgba(0,0,0,0.4);
  }
  .share-card-canvas { display: block; width: 100%; height: auto; }
  .share-card-actions { margin-top: 20px; text-align: center; }
  .share-card-download {
    padding: 12px 32px; border-radius: 100px; border: none; cursor: pointer;
    background: var(--cream); color: #0a0a0c;
    font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500;
    transition: all .4s var(--ease);
    box-shadow: 0 1px 0 rgba(255,255,255,0.4) inset, 0 8px 20px rgba(0,0,0,0.3);
  }
  .share-card-download:hover { transform: translateY(-2px); }
  .share-card-hint {
    font-size: 12px; color: var(--muted); margin-top: 10px; line-height: 1.5;
  }

  /* dashboard share button */
  .dash-share-btn {
    padding: 8px 18px; border-radius: 100px; border: 1px solid var(--border);
    background: var(--glass); color: var(--warm-dim);
    font-family: 'Inter', sans-serif; font-size: 12px; cursor: pointer;
    transition: all .4s var(--ease); backdrop-filter: blur(12px);
    margin-top: 6px;
  }
  .dash-share-btn:hover {
    border-color: var(--warm-dim); background: rgba(232,199,154,0.1);
    color: var(--warm);
  }

  /* ── DAILY MOOD CHECK-IN MODAL ── */
  .mood-overlay {
    position: fixed; inset: 0; z-index: 95;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(6px);
    animation: fadeUp 0.35s var(--ease-slow);
  }
  .mood-modal {
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 96;
    background: rgba(14,12,10,0.92);
    backdrop-filter: blur(40px) saturate(160%);
    -webkit-backdrop-filter: blur(40px) saturate(160%);
    border-top: 1px solid var(--border2);
    border-radius: 28px 28px 0 0;
    padding: 14px 28px max(28px, env(safe-area-inset-bottom));
    box-shadow: 0 1px 0 rgba(255,255,255,0.07) inset, 0 -20px 60px rgba(0,0,0,0.5);
    animation: sheetUp 0.5s var(--ease-slow);
  }
  .mood-modal-handle {
    width: 36px; height: 4px; border-radius: 4px;
    background: var(--border2); margin: 0 auto 22px;
  }
  .mood-modal-title {
    font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 300;
    text-align: center; margin-bottom: 6px; line-height: 1.3;
  }
  .mood-modal-title em { font-style: italic; color: var(--warm); }
  .mood-modal-sub {
    font-size: 13px; color: var(--muted2); text-align: center; margin-bottom: 28px;
  }
  .mood-options {
    display: flex; gap: 10px; justify-content: center; margin-bottom: 20px; flex-wrap: wrap;
  }
  .mood-option {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    padding: 16px 14px; border-radius: 20px; border: 1px solid var(--border);
    background: var(--glass); backdrop-filter: blur(16px);
    cursor: pointer; transition: all .4s var(--ease); min-width: 72px; flex: 1;
  }
  .mood-option:hover, .mood-option:active {
    border-color: var(--warm-dim); background: rgba(232,199,154,0.12);
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0,0,0,0.25);
  }
  .mood-option-emoji { font-size: 28px; line-height: 1; }
  .mood-option-label {
    font-size: 11px; color: var(--muted2); font-weight: 400;
    letter-spacing: 0.02em; white-space: nowrap;
  }
  .mood-skip {
    display: block; margin: 0 auto; background: transparent; border: none;
    color: var(--muted); font-family: 'Inter', sans-serif; font-size: 12px;
    cursor: pointer; transition: color .3s var(--ease); padding: 8px;
  }
  .mood-skip:hover { color: var(--muted2); }

  /* streak indicator in sidebar */
  .sb-streak {
    display: flex; align-items: center; gap: 7px; margin-top: 9px;
    font-size: 12px; color: var(--muted2); padding: 6px 8px;
    background: rgba(232,199,154,0.08); border-radius: 8px;
    border: 1px solid rgba(232,199,154,0.12);
  }
  .sb-streak-fire { font-size: 14px; }
  .sb-streak-today { margin-left: auto; color: var(--warm-dim); font-size: 11px; }

  @keyframes sheetUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  /* ── TODAY SCREEN ── */
  .today-view {
    padding: 36px 40px 40px; overflow-y: auto; height: 100%;
    display: flex; flex-direction: column; gap: 16px; max-width: 680px;
  }
  .today-view::-webkit-scrollbar { width: 4px; }
  .today-view::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .today-header { margin-bottom: 4px; animation: fadeUp 0.7s var(--ease-slow); }
  .today-greeting { font-size: 13px; color: var(--muted2); letter-spacing: .04em; margin-bottom: 4px; }
  .today-name {
    font-family: 'Cormorant Garamond', serif; font-size: 38px; font-weight: 300;
    line-height: 1.1; letter-spacing: -0.01em; color: var(--cream);
  }
  .today-date { font-size: 12px; color: var(--muted); margin-top: 6px; letter-spacing: .04em; }

  /* Companion card — tappable, leads to chat */
  .today-comp-card {
    display: flex; align-items: center; gap: 16px; width: 100%;
    background: var(--glass); border: 1px solid var(--border); border-radius: 22px;
    padding: 18px 20px; cursor: pointer; text-align: left;
    backdrop-filter: blur(24px);
    transition: all .5s var(--ease);
    box-shadow: 0 1px 0 rgba(255,255,255,0.07) inset;
    animation: fadeUp 0.7s 0.08s var(--ease-slow) both;
  }
  .today-comp-card:hover, .today-comp-card:active {
    border-color: var(--border2); background: var(--glass-hover);
    transform: translateY(-2px);
    box-shadow: 0 1px 0 rgba(255,255,255,0.1) inset, 0 16px 36px rgba(0,0,0,0.25);
  }
  .today-comp-av {
    font-size: 32px; flex-shrink: 0;
    animation: breathe 5s ease-in-out infinite;
  }
  .today-comp-info { flex: 1; min-width: 0; }
  .today-comp-name { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 400; }
  .today-comp-status {
    font-size: 11px; color: var(--green); display: flex; align-items: center; gap: 5px; margin-top: 2px;
  }
  .today-comp-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--green); box-shadow: 0 0 6px var(--green);
    animation: pulse 2.5s infinite; flex-shrink: 0;
  }
  .today-comp-preview {
    font-size: 12.5px; color: var(--muted2); margin-top: 6px; font-style: italic;
    line-height: 1.5; font-weight: 300;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .today-comp-arrow { font-size: 18px; color: var(--muted); flex-shrink: 0; }

  /* Stats row */
  .today-stats {
    display: grid; grid-template-columns: repeat(4,1fr); gap: 10px;
    animation: fadeUp 0.7s 0.14s var(--ease-slow) both;
  }
  .today-stat {
    background: var(--glass); border: 1px solid var(--border); border-radius: 16px;
    padding: 14px 8px; text-align: center; backdrop-filter: blur(16px);
    transition: all .4s var(--ease);
  }
  .today-stat:hover { border-color: var(--border2); background: var(--glass-hover); }
  .today-stat-val {
    font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400;
    color: var(--cream); line-height: 1;
  }
  .today-stat-lbl { font-size: 9.5px; color: var(--muted2); margin-top: 4px; letter-spacing: .04em; }

  /* Mission card */
  .today-mission {
    width: 100%; text-align: left; cursor: pointer;
    background: linear-gradient(135deg, rgba(143,208,160,0.1), rgba(100,200,180,0.06));
    border: 1px solid rgba(143,208,160,0.22); border-radius: 20px; padding: 18px 20px;
    transition: all .5s var(--ease);
    animation: fadeUp 0.7s 0.2s var(--ease-slow) both;
  }
  .today-mission:hover { transform: translateY(-2px); border-color: rgba(143,208,160,0.35); }
  .today-mission.today-mission-done { opacity: 0.75; }
  .today-mission-top { display: flex; align-items: center; gap: 9px; margin-bottom: 10px; }
  .today-mission-icon { font-size: 14px; color: var(--green); }
  .today-mission-label { font-size: 10px; letter-spacing:.12em; text-transform:uppercase; color:rgba(143,208,160,0.7); flex:1; }
  .today-mission-badge { font-size:11px; color:var(--green); background:rgba(143,208,160,0.12); border:1px solid rgba(143,208,160,0.2); padding:3px 10px; border-radius:100px; }
  .today-mission-tap { font-size:11px; color:var(--muted2); }
  .today-mission-text { font-family:'Cormorant Garamond',serif; font-size:17px; font-style:italic; font-weight:300; line-height:1.55; color:var(--cream); }

  /* Mood card */
  .today-mood-card {
    background: var(--glass); border: 1px solid var(--border); border-radius: 18px;
    padding: 16px 18px; backdrop-filter: blur(20px); transition: all .4s var(--ease);
    animation: fadeUp 0.7s 0.26s var(--ease-slow) both;
  }
  .today-mood-card:hover { border-color: var(--border2); }
  .today-mood-label { font-size: 12px; color: var(--cream); display: flex; align-items: center; }
  .today-mood-tap { font-size: 11px; color: var(--muted2); margin-left: auto; }
  .today-mood-emojis { display:flex; justify-content:space-between; font-size:13px; opacity:0.5; margin-top:3px; }

  /* Quick nav */
  .today-quicknav {
    display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-top: 4px;
    animation: fadeUp 0.7s 0.32s var(--ease-slow) both;
  }
  .today-quicknav-btn {
    display: flex; flex-direction: column; align-items: center; gap: 7px;
    padding: 14px 8px; border-radius: 16px; border: 1px solid var(--border);
    background: var(--glass); backdrop-filter: blur(16px); cursor: pointer;
    transition: all .4s var(--ease);
  }
  .today-quicknav-btn:hover { border-color: var(--border2); background: var(--glass-hover); transform: translateY(-2px); }
  .today-quicknav-icon { font-size: 18px; }
  .today-quicknav-label { font-size: 10px; color: var(--muted2); letter-spacing: .03em; }

  /* ── WEEKLY RECAP CARD ── */
  .today-recap-card {
    background: linear-gradient(145deg, rgba(200,180,232,0.1), rgba(180,160,220,0.06));
    border: 1px solid rgba(200,180,232,0.2); border-radius: 20px;
    padding: 20px; backdrop-filter: blur(20px);
    transition: all .5s var(--ease);
    animation: fadeUp 0.7s 0.28s var(--ease-slow) both;
    display: flex; flex-direction: column; gap: 13px;
  }
  .today-recap-header { display: flex; align-items: flex-start; gap: 12px; }
  .today-recap-icon {
    width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
    background: rgba(200,180,232,0.15); border: 1px solid rgba(200,180,232,0.25);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; color: rgba(200,180,232,0.9);
    animation: breathe 5s ease-in-out infinite;
  }
  .today-recap-label {
    font-size: 10px; letter-spacing: .12em; text-transform: uppercase;
    color: rgba(200,180,232,0.7); margin-bottom: 4px;
  }
  .today-recap-headline {
    font-family: 'Cormorant Garamond', serif; font-size: 16px; font-style: italic;
    font-weight: 300; color: var(--cream); line-height: 1.4;
  }
  .today-recap-body {
    font-size: 13.5px; color: var(--muted2); line-height: 1.65; font-weight: 300;
  }
  .today-recap-stats {
    display: flex; gap: 14px; flex-wrap: wrap;
    font-size: 12px; color: var(--muted2);
  }
  .today-recap-highlight {
    display: flex; flex-direction: column; gap: 4px;
    padding: 11px 14px; border-radius: 12px;
    background: rgba(200,180,232,0.06); border: 1px solid rgba(200,180,232,0.12);
  }
  .today-recap-highlight-label { font-size: 10px; color: rgba(200,180,232,0.6); letter-spacing:.06em; }
  .today-recap-highlight span:last-child { font-size: 13px; color: var(--cream); font-weight: 300; }
  .today-recap-next {
    display: flex; gap: 8px; align-items: baseline;
    font-size: 12.5px; color: var(--muted2); font-weight: 300;
    border-top: 1px solid rgba(200,180,232,0.1); padding-top: 11px;
  }
  .today-recap-next-label { color: rgba(200,180,232,0.6); font-size: 11px; flex-shrink: 0; }

  /* ── DAILY MISSION CARD ── */
  .mission-card {
    margin: 16px 28px 0;
    padding: 16px 20px;
    background: linear-gradient(135deg, rgba(143,208,160,0.1), rgba(100,200,180,0.06));
    border: 1px solid rgba(143,208,160,0.22);
    border-radius: 18px;
    backdrop-filter: blur(20px);
    transition: all 0.6s var(--ease-slow);
    animation: fadeUp 0.7s var(--ease-slow);
    flex-shrink: 0;
  }
  .mission-card.mission-done {
    background: linear-gradient(135deg, rgba(143,208,160,0.07), rgba(100,200,180,0.03));
    border-color: rgba(143,208,160,0.15);
    opacity: 0.8;
  }
  .mission-header {
    display: flex; align-items: center; gap: 10px; margin-bottom: 8px;
  }
  .mission-icon {
    font-size: 14px; color: var(--green); font-weight: 500; flex-shrink: 0;
  }
  .mission-label {
    font-size: 10px; letter-spacing: .14em; text-transform: uppercase;
    color: rgba(143,208,160,0.7); flex: 1;
  }
  .mission-badge {
    font-size: 11px; color: var(--green);
    background: rgba(143,208,160,0.12); border: 1px solid rgba(143,208,160,0.2);
    padding: 3px 10px; border-radius: 100px;
  }
  .mission-text {
    font-family: 'Cormorant Garamond', serif; font-size: 16px; font-style: italic;
    font-weight: 300; line-height: 1.55; color: var(--cream);
    margin-bottom: 6px;
  }
  .mission-hint {
    font-size: 11px; color: var(--muted2);
  }

  /* ── DAILY CHECK-IN CARD — proactive warmth waiting for the user ── */
  .checkin-card {
    margin: 16px 28px 0;
    display: flex; gap: 14px; align-items: flex-start;
    padding: 18px 20px;
    background: linear-gradient(135deg, rgba(232,180,150,0.14), rgba(217,140,150,0.07));
    border: 1px solid rgba(232,180,150,0.2);
    border-radius: 20px;
    backdrop-filter: blur(24px) saturate(140%);
    -webkit-backdrop-filter: blur(24px) saturate(140%);
    box-shadow: 0 1px 0 rgba(255,255,255,0.08) inset, 0 16px 40px rgba(232,150,150,0.08);
    opacity: 0; transform: translateY(-14px);
    transition: opacity 0.7s var(--ease-slow), transform 0.7s var(--ease-slow);
    flex-shrink: 0;
  }
  .checkin-card.checkin-visible { opacity: 1; transform: translateY(0); }
  .checkin-icon {
    font-size: 22px; flex-shrink: 0; margin-top: 1px;
    animation: breathe-soft 5s ease-in-out infinite;
  }
  .checkin-body { flex: 1; min-width: 0; }
  .checkin-label {
    font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase;
    color: var(--warm-dim); margin-bottom: 6px;
  }
  .checkin-text {
    font-family: 'Cormorant Garamond', serif; font-size: 16.5px; font-weight: 300;
    line-height: 1.6; color: var(--cream); margin-bottom: 14px;
  }
  .checkin-actions { display: flex; gap: 10px; }
  .checkin-reply {
    padding: 8px 18px; border-radius: 100px; border: none; cursor: pointer;
    background: var(--cream); color: #0a0a0c;
    font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500;
    transition: all .4s var(--ease);
  }
  .checkin-reply:hover { transform: translateY(-1px); }
  .checkin-dismiss {
    padding: 8px 16px; border-radius: 100px; border: 1px solid var(--border);
    cursor: pointer; background: transparent; color: var(--muted2);
    font-family: 'Inter', sans-serif; font-size: 12px; transition: all .4s var(--ease);
  }
  .checkin-dismiss:hover { color: var(--cream); border-color: var(--border2); }

  .msgs-area { flex:1; overflow-y:auto; padding:24px 32px; }
  .msgs-area::-webkit-scrollbar { width:4px; }
  .msgs-area::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }
  .msg-row { display:flex; margin-bottom:18px; animation:fadeUp 0.6s var(--ease-slow); }
  .msg-row.user { justify-content:flex-end; }
  .msg-bubble {
    max-width:68%; padding:13px 18px; border-radius:20px;
    font-size:14px; line-height:1.7; font-weight:300; white-space:pre-wrap; word-break:break-word;
    backdrop-filter: blur(20px);
  }
  .msg-row.ai .msg-bubble {
    background: linear-gradient(135deg, rgba(232,180,150,0.18), rgba(217,140,150,0.10));
    border: 1px solid rgba(232,180,150,0.22);
    border-radius:20px 20px 20px 6px; color: var(--cream);
    box-shadow: 0 1px 0 rgba(255,255,255,0.08) inset, 0 8px 24px rgba(232,150,150,0.06);
  }
  .msg-row.user .msg-bubble {
    background: linear-gradient(135deg, rgba(150,170,232,0.16), rgba(170,150,232,0.12));
    border: 1px solid rgba(170,165,232,0.24);
    border-radius:20px 20px 6px 20px; color: var(--cream);
    box-shadow: 0 1px 0 rgba(255,255,255,0.08) inset, 0 8px 24px rgba(150,150,232,0.06);
  }
  .msg-time { font-size:10.5px; color:var(--muted); margin-top:5px; padding:0 4px; }
  .msg-row.user .msg-time { text-align:right; }
  .typing-ind {
    display:flex; gap:5px; align-items:center; padding:15px 18px; max-width:68px;
    background: linear-gradient(135deg, rgba(232,180,150,0.18), rgba(217,140,150,0.10));
    border: 1px solid rgba(232,180,150,0.22);
    border-radius:20px 20px 20px 6px; animation:fadeUp 0.4s var(--ease-slow); backdrop-filter: blur(20px);
  }
  .t-dot { width:6px; height:6px; border-radius:50%; background: rgba(232,180,150,0.7); animation:bounce 1.4s infinite; }
  .t-dot:nth-child(2){animation-delay:.2s;} .t-dot:nth-child(3){animation-delay:.4s;}

  /* ── SMART REPLY SUGGESTIONS ── */
  .suggestions-bar {
    padding: 10px 28px 8px;
    display: flex; gap: 8px; flex-wrap: wrap;
    background: rgba(255,255,255,0.01); border-top: 1px solid var(--border);
    flex-shrink: 0;
  }
  .suggestions-loading {
    display: flex; gap: 5px; align-items: center; padding: 6px 0;
  }
  .suggestion-chip {
    padding: 8px 16px; border-radius: 100px;
    border: 1px solid var(--border2);
    background: var(--glass); backdrop-filter: blur(16px);
    color: var(--cream); font-family: 'Inter', sans-serif;
    font-size: 13px; font-weight: 300; cursor: pointer;
    transition: all .35s var(--ease);
    opacity: 0; transform: translateY(6px);
    animation: chipIn 0.4s var(--ease-slow) forwards;
    white-space: nowrap;
  }
  .suggestion-chip:hover {
    border-color: var(--warm-dim);
    background: rgba(232,199,154,0.1);
    transform: translateY(-2px);
  }
  .suggestion-chip:active { transform: scale(0.96); }
  @keyframes chipIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .input-area { padding:16px 28px 22px; border-top:1px solid var(--border); background: rgba(255,255,255,0.015); backdrop-filter: blur(20px); flex-shrink:0; }
  .input-row { display:flex; gap:10px; align-items:flex-end; }
  .msg-input {
    flex:1; background: var(--glass); border:1px solid var(--border); border-radius:18px;
    padding:13px 18px; color:var(--cream); font-family:'Inter',sans-serif; font-size:14px;
    font-weight:300; outline:none; resize:none; transition: all .4s var(--ease);
    min-height:50px; max-height:140px; line-height:1.6; backdrop-filter: blur(16px);
  }
  .msg-input:focus { border-color: var(--border2); background: var(--glass-hover); }
  .msg-input::placeholder { color:var(--muted); }
  .send-btn {
    width:50px; height:50px; border-radius:50%; border:none; cursor:pointer;
    background: var(--cream); color: #0a0a0c;
    font-size:20px; transition: all .4s var(--ease); flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    box-shadow: 0 1px 0 rgba(255,255,255,0.4) inset, 0 10px 24px rgba(0,0,0,0.3);
  }
  .send-btn:hover:not(:disabled) { transform: scale(1.06); }
  .send-btn:disabled { opacity:.35; cursor:not-allowed; }
  .input-hint { font-size:10.5px; color:var(--muted); margin-top:7px; text-align:center; }

  /* inner views */
  .inner-view { padding:38px 40px; overflow-y:auto; height:100%; }
  .inner-view::-webkit-scrollbar { width:4px; }
  .inner-view::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }
  .view-title { font-family:'Cormorant Garamond',serif; font-size:32px; font-weight:300; margin-bottom:8px; letter-spacing: -0.01em; }
  .view-title em { font-style:italic; color:var(--muted2); }
  .view-sub { font-size:13.5px; color:var(--muted2); margin-bottom:32px; line-height:1.6; max-width:560px; font-weight: 300; }

  /* ── WEEKLY INSIGHT CARD ── */
  .insight-loading {
    display: flex; align-items: center; gap: 12px; padding: 18px 20px;
    color: var(--muted2); font-size: 13px; margin-bottom: 20px;
  }
  .insight-loading-dots { display: flex; gap: 5px; }

  .insight-card {
    background: linear-gradient(145deg, rgba(232,180,150,0.1), rgba(232,199,154,0.06));
    border: 1px solid rgba(232,180,150,0.2); border-radius: 24px;
    padding: 28px; margin-bottom: 28px; max-width: 880px;
    backdrop-filter: blur(24px);
    box-shadow: 0 1px 0 rgba(255,255,255,0.07) inset, 0 20px 50px rgba(232,150,150,0.06);
    animation: fadeUp 0.7s var(--ease-slow);
  }
  .insight-header {
    display: flex; align-items: center; gap: 14px;
    margin-bottom: 20px; padding-bottom: 20px;
    border-bottom: 1px solid rgba(232,180,150,0.15);
  }
  .insight-icon {
    font-size: 22px; width: 44px; height: 44px; border-radius: 50%;
    background: rgba(232,199,154,0.15); border: 1px solid rgba(232,199,154,0.25);
    display: flex; align-items: center; justify-content: center;
    color: var(--warm); flex-shrink: 0;
    animation: breathe 5s ease-in-out infinite;
  }
  .insight-title {
    font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 400;
  }
  .insight-week { font-size: 11px; color: var(--muted2); letter-spacing: .05em; margin-top: 2px; }

  .insight-themes { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 20px; }
  .insight-theme {
    padding: 5px 13px; border-radius: 100px; font-size: 11.5px;
    background: rgba(232,199,154,0.12); border: 1px solid rgba(232,199,154,0.2);
    color: var(--warm); font-weight: 400;
  }

  .insight-row { margin-bottom: 16px; }
  .insight-label { font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted2); margin-bottom: 5px; }
  .insight-value { font-size: 14px; color: var(--cream); line-height: 1.65; font-weight: 300; }

  .insight-question {
    margin-top: 22px; padding-top: 20px;
    border-top: 1px solid rgba(232,180,150,0.15);
  }
  .insight-q-label { font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: var(--warm-dim); margin-bottom: 10px; }
  .insight-q-text {
    font-family: 'Cormorant Garamond', serif; font-size: 18px; font-style: italic;
    font-weight: 300; line-height: 1.6; color: var(--cream); margin-bottom: 16px;
  }
  .insight-reply-btn {
    padding: 10px 22px; border-radius: 100px; border: none; cursor: pointer;
    background: var(--cream); color: #0a0a0c;
    font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500;
    transition: all .4s var(--ease);
    box-shadow: 0 1px 0 rgba(255,255,255,0.4) inset, 0 6px 16px rgba(0,0,0,0.2);
  }
  .insight-reply-btn:hover { transform: translateY(-2px); }

  .mem-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; max-width:880px; }
  .mem-card { background: var(--glass); border:1px solid var(--border); border-radius:20px; padding:26px; transition: all .5s var(--ease); backdrop-filter: blur(24px); }
  .mem-card:hover { border-color: var(--border2); background: var(--glass-hover); }
  .mc-icon { font-size:20px; margin-bottom:12px; opacity: 0.85; }
  .mc-title { font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:400; margin-bottom:8px; }
  .mc-body { font-size:13px; color:var(--muted2); line-height:1.75; font-weight: 300; }
  .mtag { display:inline-block; padding:4px 12px; border-radius:100px; font-size:11.5px; margin:3px 2px; border:1px solid var(--border); background: var(--glass); color: var(--muted2); }
  .ta, .tr, .tl { color: var(--muted2); border-color: var(--border); background: var(--glass); }
  .span2 { grid-column:span 2; }

  /* ── RELATIONSHIP DASHBOARD ── */
  .dashboard {
    padding: 28px 40px 40px; overflow-y: auto; height: 100%;
    display: flex; flex-direction: column; gap: 18px; max-width: 900px;
  }
  .dashboard::-webkit-scrollbar { width: 4px; }
  .dashboard::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .dash-header {
    display: flex; align-items: center; justify-content: space-between;
    background: var(--glass); border: 1px solid var(--border);
    border-radius: 24px; padding: 22px 26px;
    backdrop-filter: blur(24px);
    box-shadow: 0 1px 0 rgba(255,255,255,0.07) inset;
    animation: fadeUp 0.6s var(--ease-slow);
  }
  .dash-companion { display: flex; align-items: center; gap: 16px; }
  .dash-comp-av {
    width: 60px; height: 60px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center; font-size: 28px;
    border: 1px solid; flex-shrink: 0;
    animation: breathe 6s ease-in-out infinite;
  }
  .dash-comp-name { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 400; }
  .dash-comp-trait { font-size: 12px; color: var(--muted2); margin-top: 3px; font-style: italic; }

  .dash-ring-wrap { display: flex; flex-direction: column; align-items: center; gap: 7px; }
  .dash-ring-label { font-size: 11px; color: var(--warm-dim); letter-spacing: .08em; text-align: center; }

  .dash-stats {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
    animation: fadeUp 0.6s 0.1s var(--ease-slow) both;
  }
  .dash-stat {
    background: var(--glass); border: 1px solid var(--border); border-radius: 18px;
    padding: 18px 12px; text-align: center; backdrop-filter: blur(20px);
    transition: all .4s var(--ease);
  }
  .dash-stat:hover { border-color: var(--border2); background: var(--glass-hover); }
  .dash-stat-val { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 400; color: var(--cream); }
  .dash-stat-lbl { font-size: 10px; color: var(--muted2); margin-top: 4px; letter-spacing: .04em; }

  .dash-card {
    background: var(--glass); border: 1px solid var(--border); border-radius: 22px;
    padding: 22px 24px; backdrop-filter: blur(24px);
    transition: all .4s var(--ease);
    animation: fadeUp 0.6s 0.15s var(--ease-slow) both;
  }
  .dash-card:hover { border-color: var(--border2); }
  .dash-card-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px;
  }
  .dash-card-title { font-size: 13px; color: var(--cream); font-weight: 400; }
  .dash-card-sub { font-size: 11px; color: var(--muted); }

  .dash-sparkline-wrap { position: relative; }
  .dash-sparkline-labels {
    display: flex; justify-content: space-between; margin-top: 4px;
    font-size: 14px; opacity: 0.5; padding: 0 2px;
  }

  .dash-facts { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
  .dash-fact-tag {
    padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 300;
    background: rgba(232,199,154,0.1); border: 1px solid rgba(232,199,154,0.2);
    color: var(--cream); transition: all .3s var(--ease);
  }
  .dash-fact-tag:hover { background: rgba(232,199,154,0.18); }

  /* ── WELLBEING VIEW ── */
  .wellbeing-view { max-width: 780px; }

  .wb-log-prompt {
    display: flex; align-items: center; gap: 14px; width: 100%;
    background: linear-gradient(135deg, rgba(143,208,160,0.1), rgba(100,200,180,0.06));
    border: 1px solid rgba(143,208,160,0.25); border-radius: 18px;
    padding: 16px 20px; cursor: pointer; text-align: left; margin-bottom: 4px;
    transition: all .4s var(--ease); animation: fadeUp 0.5s var(--ease-slow);
  }
  .wb-log-prompt:hover { transform: translateY(-2px); border-color: rgba(143,208,160,0.4); }
  .wb-log-prompt > span:first-child { font-size: 22px; flex-shrink: 0; }
  .wb-log-title { font-size: 14px; color: var(--cream); font-weight: 400; }
  .wb-log-sub { font-size: 11.5px; color: var(--muted2); margin-top: 2px; }
  .wb-log-arrow { font-size: 18px; color: var(--muted2); margin-left: auto; }

  .wb-streak-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
  .wb-streak-card {
    background: var(--glass); border: 1px solid var(--border); border-radius: 18px;
    padding: 18px 12px; text-align: center; backdrop-filter: blur(16px);
    animation: fadeUp 0.5s 0.06s var(--ease-slow) both;
  }
  .wb-streak-val { font-family:'Cormorant Garamond',serif; font-size: 28px; font-weight: 400; color: var(--cream); }
  .wb-streak-lbl { font-size: 10px; color: var(--muted2); margin-top: 5px; letter-spacing:.04em; }

  .wb-summary-card {
    display: flex; gap: 14px; align-items: flex-start;
    background: linear-gradient(135deg, rgba(232,180,150,0.1), rgba(217,140,150,0.06));
    border: 1px solid rgba(232,180,150,0.2); border-radius: 20px; padding: 20px;
    backdrop-filter: blur(20px); animation: fadeUp 0.5s 0.1s var(--ease-slow) both;
  }
  .wb-summary-icon { font-size: 18px; color: var(--warm); flex-shrink: 0; margin-top: 2px; }
  .wb-summary-label { font-size: 10.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--warm-dim); margin-bottom: 7px; }
  .wb-summary-text { font-size: 14px; color: var(--cream); line-height: 1.7; font-weight: 300; }

  .wb-cal-wrap {
    background: var(--glass); border: 1px solid var(--border); border-radius: 22px;
    padding: 22px; backdrop-filter: blur(20px);
    animation: fadeUp 0.5s 0.14s var(--ease-slow) both;
  }
  .wb-cal-title { font-size: 13px; color: var(--cream); margin-bottom: 16px; }
  .wb-cal-grid {
    display: grid; grid-template-columns: repeat(10, 1fr); gap: 5px;
  }
  .wb-cal-cell {
    aspect-ratio: 1; border-radius: 8px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    border: 1px solid rgba(255,255,255,0.06);
    cursor: default; transition: transform .2s var(--ease);
    position: relative;
  }
  .wb-cal-cell:hover { transform: scale(1.15); z-index: 2; }
  .wb-cal-day { font-size: 8px; color: rgba(255,255,255,0.5); line-height: 1; }
  .wb-cal-emoji { font-size: 11px; line-height: 1; }
  .wb-cal-legend {
    display: flex; justify-content: space-between;
    font-size: 10.5px; color: var(--muted); margin-top: 12px; padding: 0 2px;
  }

  .wb-weeks-wrap {
    background: var(--glass); border: 1px solid var(--border); border-radius: 22px;
    padding: 22px; backdrop-filter: blur(20px);
    animation: fadeUp 0.5s 0.18s var(--ease-slow) both;
  }
  .wb-weeks { display: flex; gap: 10px; align-items: flex-end; height: 120px; margin-top: 16px; }
  .wb-week { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; }
  .wb-week-label { font-size: 9.5px; color: var(--muted2); text-align: center; flex-shrink: 0; }
  .wb-week-bar-wrap {
    flex: 1; width: 100%; display: flex; align-items: flex-end;
    background: rgba(255,255,255,0.03); border-radius: 6px; overflow: hidden;
    border: 1px solid var(--border);
  }
  .wb-week-bar { width: 100%; border-radius: 5px; transition: height 1s var(--ease-slow); }
  .wb-week-val { font-size: 11px; color: var(--cream); font-weight: 400; flex-shrink: 0; }
  .wb-week-logged { font-size: 9px; color: var(--muted); flex-shrink: 0; }

  /* ── SESSION SUMMARY ITEMS in memory view ── */
  .session-summary-item {
    padding: 14px 18px; border-radius: 16px; margin-bottom: 10px;
    background: var(--glass); border: 1px solid var(--border);
    backdrop-filter: blur(16px);
    transition: all .4s var(--ease); animation: fadeUp 0.5s var(--ease-slow);
  }
  .session-summary-item:hover { border-color: var(--border2); background: var(--glass-hover); }
  .session-summary-date {
    font-size: 10px; letter-spacing: .12em; text-transform: uppercase;
    color: var(--warm-dim); margin-bottom: 6px;
  }
  .session-summary-text {
    font-size: 13.5px; color: var(--muted2); line-height: 1.65; font-weight: 300;
    font-style: italic;
  }

  .tl-wrap { position:relative; padding-left:38px; max-width:680px; }
  .tl-wrap::before { content:''; position:absolute; left:0; top:8px; bottom:0; width:1px; background: linear-gradient(180deg, var(--border2), var(--border), transparent); }
  .tl-item { position:relative; margin-bottom:32px; animation:fadeUp 0.6s var(--ease-slow); }
  .tl-dot {
    position: absolute; left: -38px; top: 2px;
    width: 22px; height: 22px; border-radius: 50%;
    background: var(--glass); border: 1px solid var(--border2);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; color: var(--muted2);
    box-shadow: 0 0 8px rgba(232,199,154,0.15);
  }
  .tl-date { font-size:10.5px; letter-spacing:.12em; color:var(--muted2); text-transform:uppercase; margin-bottom:5px; }
  .tl-content { font-family:'Cormorant Garamond',serif; font-size:17px; font-weight:300; line-height:1.6; }
  .tl-detail { font-size:12.5px; color:var(--muted2); margin-top:3px; }

  .pf-form { max-width:560px; }
  .pf-field { margin-bottom:20px; }
  .pf-label { font-size:10.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); margin-bottom:7px; display:block; }
  .pf-input { width:100%; background: var(--glass); border:1px solid var(--border); border-radius:14px; padding:12px 15px; color:var(--cream); font-family:'Inter',sans-serif; font-size:14px; font-weight:300; outline:none; transition: all .4s var(--ease); backdrop-filter: blur(16px); }
  .pf-input:focus { border-color: var(--border2); background: var(--glass-hover); }
  .save-btn { padding:12px 28px; border-radius:100px; border:none; cursor:pointer; background: var(--cream); color: #0a0a0c; font-size:12.5px; font-weight:500; font-family:'Inter',sans-serif; transition: all .4s var(--ease); }
  .save-btn:hover { transform: translateY(-2px); }
  .save-ok { font-size:12.5px; color:var(--green); margin-left:12px; }

  .empty-box { text-align:center; padding:56px 40px; color:var(--muted); }
  .empty-icon { font-size:40px; margin-bottom:14px; opacity: 0.6; }
  .empty-title { font-family:'Cormorant Garamond',serif; font-size:20px; font-style:italic; margin-bottom:7px; font-weight: 300; }
  .empty-hint { font-size:13.5px; }

  .welcome-box { text-align:center; padding:70px 40px; max-width:480px; margin:0 auto; }
  .welcome-icon { font-size:44px; margin-bottom:22px; opacity: 0.85; filter: saturate(0.9); animation: breathe-soft 6s ease-in-out infinite; display: inline-block; }
  @keyframes breathe-soft {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50%      { transform: scale(1.05); opacity: 1; }
  }
  .welcome-title { font-family:'Cormorant Garamond',serif; font-size:30px; font-weight:300; margin-bottom:12px; letter-spacing: -0.01em; }
  .welcome-title em { font-style:italic; color:var(--muted2); }
  .welcome-body { font-size:14.5px; color:var(--muted2); line-height:1.75; font-weight: 300; }

  .loading-screen { height:100vh; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:14px; }
  .loading-logo { font-family:'Cormorant Garamond',serif; font-size:26px; font-weight:300; }
  .loading-logo span { color: var(--muted2); font-style: italic; }
  .loading-sub { font-size:12.5px; color:var(--muted); }

  .prog-bar { height:3px; background:var(--border); border-radius:3px; overflow:hidden; }
  .prog-fill { height:100%; border-radius:3px; background: var(--cream); opacity: 0.4; transition: width 1.2s var(--ease-slow); }

  /* reveal */
  .reveal { opacity:0; transform:translateY(32px); transition: opacity 1s var(--ease-slow), transform 1s var(--ease-slow); }
  .reveal.vis { opacity:1; transform:none; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(18px);} to{opacity:1;transform:translateY(0);} }
  @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:.35;} }
  @keyframes bounce { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-5px);} }

  @media (max-width:768px) {
    html, body { overflow-x: hidden; -webkit-tap-highlight-color: transparent; }
    button, a { touch-action: manipulation; }

    nav.home-nav { padding:14px 18px; }
    nav.home-nav .nav-links { gap: 10px; }
    nav.home-nav .nav-links li:not(:last-child):not(.lang-li) { display:none; }
    .nav-logo { font-size: 19px; }
    .lang-switch { padding: 2px; }
    .lang-btn { padding: 5px 9px; font-size: 11px; }

    .hero { padding: 110px 20px 56px; min-height: auto; }

    .preview-section { padding: 64px 20px; }
    .preview-container { grid-template-columns: 1fr; gap: 40px; }
    .preview-text { text-align: center; }
    .preview-phone { max-width: 100%; }
    .preview-msgs { min-height: 200px; }
    .preview-msg { font-size: 12.5px; }
    .hero-grid { grid-template-columns: 1fr; gap: 48px; text-align: center; }
    .hero-text { text-align: center; }
    .hero-eyebrow { justify-content: center; }
    .hero h1 { font-size: clamp(36px, 11vw, 56px); }
    .hero-sub { font-size: 15px; padding: 0 4px; margin-left: auto; margin-right: auto; }
    .hero-actions { flex-direction: column; width: 100%; gap: 12px; justify-content: center; }
    .hero-actions a, .hero-actions button { width: 100%; justify-content: center; text-align:center; }
    .hero-visual { margin: 0 auto; }
    .hero-memory-label { text-align: center; }
    .constellation { max-width: 100%; aspect-ratio: 1 / 1; }
    .mem-node-label { font-size: 10.5px; padding: 4px 9px; }

    .section { padding: 64px 18px; }
    .sec-title { font-size: clamp(28px, 8vw, 40px); }
    .companions-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
    .comp-card { padding: 20px 12px; }
    .comp-emoji { font-size: 28px; }
    .comp-name { font-size: 17px; }

    .features-strip .features-row { grid-template-columns: 1fr 1fr; }
    .feat { padding: 28px 18px; border-bottom: 1px solid var(--border); }
    .feat:nth-child(2n) { border-right: none; }
    .feat:nth-child(3), .feat:nth-child(4) { border-bottom: none; }

    .cta-section { padding: 80px 18px; }
    .cta-section h2 { font-size: clamp(30px, 9vw, 44px); }
    .cta-actions { flex-direction: column; gap: 12px; }
    .cta-actions a, .cta-actions button { width: 100%; }

    footer { flex-direction:column; gap:18px; text-align:center; padding:32px 20px; }
    .footer-links { flex-wrap: wrap; justify-content: center; gap: 16px; }

    .onb-wrap { padding: 24px 20px max(24px, env(safe-area-inset-bottom)); justify-content: flex-start; padding-top: 60px; }
    .onb-dots { margin-bottom: 36px; }
    .onb-companion-av { font-size: 56px; }
    .onb-title { font-size: clamp(26px, 8vw, 36px); }
    .onb-moods { gap: 7px; }
    .onb-mood { min-width: 58px; padding: 13px 10px; }
    .onb-mood-emoji { font-size: 24px; }

    .auth-page { flex-direction: column; }
    .auth-left { padding: 48px 24px 24px; max-width: 100%; }
    .auth-testimonial { display: none; }
    .auth-right { display: flex; border-left: none; border-top: 1px solid var(--border); padding: 32px 24px 56px; }
    .auth-form { max-width: 100%; }
    .auth-form-title { font-size: 26px; }

    .picker-page { padding: 40px 16px; }
    .picker-title { font-size: clamp(28px, 8vw, 40px); }
    .picker-sub { font-size: 14px; padding: 0 8px; }
    .gender-tabs { width: 100%; }
    .gender-tab { flex: 1; padding: 11px 16px; font-size: 13px; text-align: center; }
    .picker-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
    .picker-card { padding: 20px 12px; }
    .picker-emoji { font-size: 30px; }
    .picker-name { font-size: 17px; }
    .picker-btn { width: 100%; padding: 16px; }

    .app-shell { flex-direction: column; height: 100dvh; }

    .sidebar {
      display: flex; flex-direction: column; width: 100%; min-width: 100%;
      height: auto; order: 2; border-right: none; border-top: 1px solid var(--border);
      padding: 0; position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
      background: rgba(14,14,16,0.75);
      backdrop-filter: blur(30px) saturate(160%);
      -webkit-backdrop-filter: blur(30px) saturate(160%);
      box-shadow: 0 -10px 40px rgba(0,0,0,0.35);
    }
    .sb-top, .sb-companion, .sb-stats { display: none; }
    .sb-bottom-desktop { display: none; }
    .lang-switch-sidebar { display: none; } /* already in the bottom sheet menu */
    .sb-nav {
      flex: 1; display: flex; flex-direction: row; padding: 6px 4px;
      padding-bottom: max(6px, env(safe-area-inset-bottom));
      overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch;
    }
    .sb-section { display: none; }
    .sb-item { flex-direction: column; gap: 4px; flex: 1; min-width: 70px; padding: 9px 4px; font-size: 10.5px; text-align: center; white-space: nowrap; }
    .sb-icon { font-size: 19px; width: auto; }

    .main-area { order: 1; height: 100dvh; padding-bottom: 0; }
    .chat-view { height: 100%; display: flex; flex-direction: column; padding-bottom: 0; }
    .msgs-area { flex: 1; overflow-y: auto; min-height: 0; padding: 16px; }
    .input-area {
      padding: 10px 12px 12px;
      margin-bottom: calc(60px + env(safe-area-inset-bottom));
      flex-shrink: 0;
    }

    .menu-trigger { display: flex; }
    .menu-overlay { display: block; }
    .menu-sheet { display: block; }
    .menu-sheet-user .sb-avatar { width: 40px; height: 40px; }

    .chat-top { padding: 12px 16px; flex-wrap: wrap; gap: 10px; }
    .chat-comp-info { order: 1; flex: 1; }
    .menu-trigger { order: 2; }
    .mode-btns { order: 3; gap: 6px; width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: 2px; }
    .chat-comp-name { font-size: 17px; }
    .chat-comp-av { width: 36px; height: 36px; font-size: 18px; }
    .mode-btn { padding: 7px 12px; font-size: 12px; flex-shrink: 0; display: inline-flex; align-items: center; gap: 5px; }
    .mode-label-text { display: inline; }

    .mission-card { margin: 12px 16px 0; padding: 13px 15px; }
    .mission-text { font-size: 15px; }
    .checkin-card { margin: 12px 16px 0; padding: 15px 16px; gap: 11px; }
    .checkin-text { font-size: 15px; }
    .checkin-actions { flex-wrap: wrap; }

    .msg-bubble { max-width: 82%; font-size: 14px; padding: 11px 15px; }
    .welcome-box { padding: 40px 20px; }
    .welcome-icon { font-size: 38px; }
    .welcome-title { font-size: 26px; }

    .suggestions-bar { padding: 8px 12px 6px; gap: 6px; overflow-x: auto; flex-wrap: nowrap; -webkit-overflow-scrolling: touch; }
    .suggestion-chip { font-size: 12.5px; padding: 7px 13px; flex-shrink: 0; }
    .msg-input { font-size: 16px; padding: 11px 14px; min-height: 44px; }
    .send-btn { width: 44px; height: 44px; font-size: 18px; }
    .input-hint { display: none; }

    .inner-view { padding: 20px 16px calc(80px + env(safe-area-inset-bottom)); }

    .today-view { padding: 24px 16px calc(80px + env(safe-area-inset-bottom)); gap: 13px; }
    .today-name { font-size: 30px; }
    .today-stats { gap: 8px; }
    .today-stat { padding: 12px 6px; border-radius: 14px; }
    .today-stat-val { font-size: 19px; }
    .today-quicknav { gap: 8px; }
    .today-quicknav-btn { padding: 12px 6px; border-radius: 14px; }
    .today-comp-card { padding: 16px; border-radius: 18px; }
    .today-comp-av { font-size: 26px; }
    .today-comp-name { font-size: 18px; }
    .today-mission { border-radius: 18px; padding: 16px; }
    .today-mission-text { font-size: 15.5px; }

    .dashboard { padding: 16px 16px calc(80px + env(safe-area-inset-bottom)); gap: 14px; }

    .wb-cal-grid { grid-template-columns: repeat(6, 1fr); gap: 4px; }
    .wb-cal-cell { border-radius: 6px; }
    .wb-cal-day { font-size: 7px; }
    .wb-cal-emoji { font-size: 10px; }
    .wb-weeks { height: 90px; gap: 6px; }
    .wb-week-label { font-size: 8px; }
    .wb-streak-val { font-size: 22px; }
    .dash-header { flex-direction: column; gap: 20px; align-items: flex-start; padding: 18px 20px; }
    .dash-ring-wrap { flex-direction: row; gap: 14px; align-items: center; width: 100%; }
    .dash-ring-label { text-align: left; }
    .dash-comp-av { width: 48px; height: 48px; font-size: 22px; }
    .dash-comp-name { font-size: 20px; }
    .dash-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .dash-stat { padding: 14px 10px; border-radius: 14px; }
    .dash-stat-val { font-size: 22px; }
    .dash-card { padding: 18px 16px; border-radius: 18px; }
    .dash-facts { gap: 6px; }
    .dash-fact-tag { font-size: 11.5px; padding: 5px 11px; }
    .view-title { font-size: 26px; }
    .view-sub { font-size: 13px; margin-bottom: 24px; }

    .share-card-modal {
      left: 0; top: auto; bottom: 0; transform: none;
      width: 100%; border-radius: 28px 28px 0 0;
      animation: sheetUp 0.45s var(--ease-slow);
      max-height: 90vh; overflow-y: auto;
    }
    .story-card-modal {
      left: 0; top: auto; bottom: 0; transform: none;
      width: 100%; border-radius: 28px 28px 0 0;
      animation: sheetUp 0.45s var(--ease-slow);
      max-height: 92vh; overflow-y: auto;
    }
    .story-canvas-wrap { max-height: 45vh; }
    .insight-card { padding: 20px; margin-bottom: 20px; border-radius: 18px; }
    .insight-q-text { font-size: 16px; }

    .mem-grid { grid-template-columns: 1fr; gap: 14px; }
    .mem-card { padding: 20px; }
    .span2 { grid-column: span 1; }

    .tl-wrap { padding-left: 26px; }
    .tl-dot { left: -30px; }
    .tl-content { font-size: 16px; }

    .pf-form { max-width: 100%; }
    .pf-input { font-size: 16px; }
  }

  @media (max-width: 380px) {
    .companions-grid, .picker-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
    .sb-item { min-width: 56px; font-size: 9px; }
    .sb-icon { font-size: 17px; }
    .msg-bubble { max-width: 88%; }
  }
`;
