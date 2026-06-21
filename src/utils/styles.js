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
    position: relative; min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; text-align: center;
    padding: 120px 24px 80px;
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 10px; font-size: 11px;
    letter-spacing: .18em; text-transform: uppercase; color: var(--warm-dim); margin-bottom: 36px;
    opacity: 0; animation: fadeUp 1.2s .2s var(--ease-slow) forwards;
  }
  .hero-eyebrow::before, .hero-eyebrow::after { content:''; width:24px; height:1px; background: var(--border2); }
  .hero h1 {
    font-family: 'Cormorant Garamond', serif; font-size: clamp(48px,7.5vw,100px);
    font-weight: 300; line-height: 1.04; max-width: 880px; letter-spacing: -0.01em;
    opacity: 0; animation: fadeUp 1.3s .4s var(--ease-slow) forwards;
  }
  .hero h1 em { font-style: italic; color: var(--muted2); }
  .hero-sub {
    margin-top: 28px; font-size: 16.5px; color: var(--muted2); max-width: 500px; line-height: 1.75;
    opacity: 0; animation: fadeUp 1.3s .65s var(--ease-slow) forwards; font-weight: 300;
  }
  .hero-actions {
    margin-top: 44px; display: flex; gap: 14px;
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

  /* chat preview */
  .chat-preview { margin-top: 68px; width: min(580px, 94vw); opacity: 0; animation: fadeUp 1.4s 1.1s var(--ease-slow) forwards; }
  .chat-window {
    background: var(--glass); border: 1px solid var(--border); border-radius: 28px;
    padding: 30px; backdrop-filter: blur(40px) saturate(150%);
    -webkit-backdrop-filter: blur(40px) saturate(150%);
    box-shadow: 0 1px 0 rgba(255,255,255,0.07) inset, 0 50px 120px rgba(0,0,0,0.5);
  }
  .chat-hdr { display:flex; align-items:center; gap:12px; margin-bottom:22px; padding-bottom:18px; border-bottom:1px solid var(--border); }
  .chat-av {
    width:38px; height:38px; border-radius:50%;
    background: rgba(255,255,255,0.1); border: 1px solid var(--border2);
    display:flex; align-items:center; justify-content:center; font-size:17px;
  }
  .chat-av-name { font-family:'Cormorant Garamond',serif; font-size:16px; font-weight: 400; }
  .chat-av-status { font-size:11px; color:var(--green); opacity: 0.85; }
  .chat-online { width:6px; height:6px; border-radius:50%; background:var(--green); box-shadow:0 0 8px var(--green); margin-left:auto; animation:pulse 2.5s infinite; }
  .chat-msgs { display:flex; flex-direction:column; gap:13px; }
  .cmsg { max-width:82%; padding:13px 17px; border-radius:18px; font-size:13.5px; line-height:1.65; opacity:0; font-weight: 300; }
  .cmsg.ai {
    background: linear-gradient(135deg, rgba(232,180,150,0.16), rgba(217,140,150,0.09));
    border:1px solid rgba(232,180,150,0.2); border-radius:18px 18px 18px 5px; color: var(--cream);
  }
  .cmsg.me {
    align-self:flex-end;
    background: linear-gradient(135deg, rgba(150,170,232,0.15), rgba(170,150,232,0.1));
    border:1px solid rgba(170,165,232,0.22); border-radius:18px 18px 5px 18px; color: var(--cream);
  }
  .cmsg:nth-child(1){animation:fadeUp 0.8s 1.6s var(--ease-slow) forwards;}
  .cmsg:nth-child(2){animation:fadeUp 0.8s 2.3s var(--ease-slow) forwards;}
  .cmsg:nth-child(3){animation:fadeUp 0.8s 3.1s var(--ease-slow) forwards;}

  /* ── SECTIONS ── */
  .section { position:relative; padding:120px 24px; }
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

  @keyframes sheetUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

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

  .mem-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; max-width:880px; }
  .mem-card { background: var(--glass); border:1px solid var(--border); border-radius:20px; padding:26px; transition: all .5s var(--ease); backdrop-filter: blur(24px); }
  .mem-card:hover { border-color: var(--border2); background: var(--glass-hover); }
  .mc-icon { font-size:20px; margin-bottom:12px; opacity: 0.85; }
  .mc-title { font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:400; margin-bottom:8px; }
  .mc-body { font-size:13px; color:var(--muted2); line-height:1.75; font-weight: 300; }
  .mtag { display:inline-block; padding:4px 12px; border-radius:100px; font-size:11.5px; margin:3px 2px; border:1px solid var(--border); background: var(--glass); color: var(--muted2); }
  .ta, .tr, .tl { color: var(--muted2); border-color: var(--border); background: var(--glass); }
  .span2 { grid-column:span 2; }

  .tl-wrap { position:relative; padding-left:32px; max-width:680px; }
  .tl-wrap::before { content:''; position:absolute; left:0; top:8px; bottom:0; width:1px; background: linear-gradient(180deg, var(--border2), var(--border), transparent); }
  .tl-item { position:relative; margin-bottom:32px; animation:fadeUp 0.6s var(--ease-slow); }
  .tl-dot { position:absolute; left:-36px; top:6px; width:8px; height:8px; border-radius:50%; background: var(--muted2); box-shadow: 0 0 10px rgba(255,255,255,0.2); }
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

    .hero { padding: 100px 18px 56px; min-height: auto; }
    .hero h1 { font-size: clamp(36px, 11vw, 56px); }
    .hero-sub { font-size: 15px; padding: 0 4px; }
    .hero-actions { flex-direction: column; width: 100%; gap: 12px; }
    .hero-actions a, .hero-actions button { width: 100%; justify-content: center; text-align:center; }
    .chat-preview { margin-top: 48px; }
    .chat-window { padding: 20px; border-radius: 22px; }

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
    .sb-nav {
      flex: 1; display: flex; flex-direction: row; padding: 6px 4px;
      padding-bottom: max(6px, env(safe-area-inset-bottom));
      overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch;
    }
    .sb-section { display: none; }
    .sb-item { flex-direction: column; gap: 4px; flex: 1; min-width: 70px; padding: 9px 4px; font-size: 10.5px; text-align: center; white-space: nowrap; }
    .sb-icon { font-size: 19px; width: auto; }

    .main-area { order: 1; padding-bottom: 64px; height: calc(100dvh - 64px); }

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

    .msgs-area { padding: 16px; }
    .msg-bubble { max-width: 82%; font-size: 14px; padding: 11px 15px; }
    .welcome-box { padding: 40px 20px; }
    .welcome-icon { font-size: 38px; }
    .welcome-title { font-size: 26px; }

    .input-area { padding: 10px 12px 12px; }
    .msg-input { font-size: 16px; padding: 11px 14px; min-height: 44px; }
    .send-btn { width: 44px; height: 44px; font-size: 18px; }
    .input-hint { display: none; }

    .inner-view { padding: 20px 16px 24px; }
    .view-title { font-size: 26px; }
    .view-sub { font-size: 13px; margin-bottom: 24px; }

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
