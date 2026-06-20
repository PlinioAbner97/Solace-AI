export const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:      #0b0d14;
    --surface: #13151f;
    --panel:   #181b27;
    --border:  rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.13);
    --amber:   #e8a75a;
    --rose:    #d97a8a;
    --lav:     #9b8ec4;
    --cream:   #f0e9de;
    --muted:   #6b6b7e;
    --muted2:  #9898aa;
    --green:   #5ecb7a;
    --accent:  var(--amber);
  }

  html { scroll-behavior: smooth; }
  body { background: var(--bg); color: var(--cream); font-family: 'DM Sans', sans-serif; font-weight: 300; }

  /* ── HOMEPAGE ── */
  .home { min-height: 100vh; overflow-x: hidden; }

  nav.home-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 22px 56px;
    background: linear-gradient(to bottom, rgba(11,13,20,0.95), transparent);
    backdrop-filter: blur(4px);
  }
  .nav-logo { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400; text-decoration: none; color: var(--cream); }
  .nav-logo span { color: var(--amber); }
  .nav-links { display: flex; gap: 32px; align-items: center; list-style: none; }
  .nav-links a { color: var(--muted2); text-decoration: none; font-size: 13px; letter-spacing: 0.07em; transition: color .3s; }
  .nav-links a:hover { color: var(--cream); }
  .nav-cta {
    background: rgba(232,167,90,0.12); border: 1px solid rgba(232,167,90,0.35);
    color: var(--amber) !important; padding: 9px 22px; border-radius: 40px;
    font-size: 12px !important; transition: background .3s !important;
  }
  .nav-cta:hover { background: rgba(232,167,90,0.22) !important; }

  /* ── LANGUAGE SWITCHER ── */
  .lang-switch {
    display: flex; align-items: center; gap: 2px;
    background: var(--panel); border: 1px solid var(--border);
    border-radius: 30px; padding: 3px;
  }
  .lang-btn {
    padding: 6px 12px; border: none; border-radius: 24px; cursor: pointer;
    background: transparent; color: var(--muted2);
    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 400;
    transition: all .25s; letter-spacing: 0.03em;
  }
  .lang-btn.active { background: rgba(232,167,90,0.16); color: var(--amber); }
  .lang-btn:hover:not(.active) { color: var(--cream); }

  .lang-switch-sidebar {
    display: flex; gap: 4px; padding: 10px 14px;
    border-top: 1px solid var(--border);
  }
  .lang-switch-sidebar .lang-btn { flex: 1; text-align: center; padding: 7px; font-size: 11px; }

  /* hero */
  .hero {
    position: relative; min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; text-align: center;
    padding: 120px 24px 80px;
    background: radial-gradient(ellipse at 50% 60%, rgba(155,142,196,0.07) 0%, transparent 65%);
  }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 10px; font-size: 11px;
    letter-spacing: .2em; text-transform: uppercase; color: var(--amber); margin-bottom: 36px;
    opacity: 0; animation: fadeUp .9s .2s forwards;
  }
  .hero-eyebrow::before, .hero-eyebrow::after { content:''; width:28px; height:1px; background:var(--amber); opacity:.6; }
  .hero h1 {
    font-family: 'Cormorant Garamond', serif; font-size: clamp(52px,8vw,108px);
    font-weight: 300; line-height: 1.0; max-width: 900px;
    opacity: 0; animation: fadeUp 1s .4s forwards;
  }
  .hero h1 em { font-style: italic; color: var(--rose); }
  .hero-sub {
    margin-top: 28px; font-size: 17px; color: var(--muted2); max-width: 520px; line-height: 1.75;
    opacity: 0; animation: fadeUp 1s .65s forwards;
  }
  .hero-actions {
    margin-top: 48px; display: flex; gap: 16px;
    opacity: 0; animation: fadeUp 1s .85s forwards;
  }
  .btn-primary {
    background: linear-gradient(135deg, var(--amber), #c46e3a); color: #0b0d14;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
    letter-spacing: .04em; padding: 15px 38px; border-radius: 50px; border: none;
    cursor: pointer; transition: transform .2s, box-shadow .3s;
    box-shadow: 0 8px 40px rgba(232,167,90,.25);
    text-decoration: none; display: inline-flex; align-items: center;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 50px rgba(232,167,90,.38); }
  .btn-ghost {
    background: transparent; color: var(--cream); font-family: 'DM Sans', sans-serif;
    font-size: 14px; padding: 15px 34px; border-radius: 50px; border: 1px solid var(--border);
    cursor: pointer; transition: border-color .3s, background .3s; text-decoration: none;
    display: inline-flex; align-items: center;
  }
  .btn-ghost:hover { border-color: rgba(255,255,255,.2); background: rgba(255,255,255,.04); }

  /* chat preview */
  .chat-preview { margin-top: 72px; width: min(580px, 94vw); opacity: 0; animation: fadeUp 1.1s 1.1s forwards; }
  .chat-window {
    background: rgba(20,23,36,.75); border: 1px solid var(--border); border-radius: 24px;
    padding: 28px; backdrop-filter: blur(20px);
    box-shadow: 0 40px 100px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.06);
  }
  .chat-hdr { display:flex; align-items:center; gap:12px; margin-bottom:24px; padding-bottom:18px; border-bottom:1px solid var(--border); }
  .chat-av {
    width:40px; height:40px; border-radius:50%;
    background:linear-gradient(135deg,var(--lav),var(--rose));
    display:flex; align-items:center; justify-content:center; font-size:18px;
  }
  .chat-av-name { font-family:'Cormorant Garamond',serif; font-size:17px; }
  .chat-av-status { font-size:11px; color:var(--green); }
  .chat-online { width:7px; height:7px; border-radius:50%; background:var(--green); box-shadow:0 0 8px var(--green); margin-left:auto; animation:pulse 2s infinite; }
  .chat-msgs { display:flex; flex-direction:column; gap:14px; }
  .cmsg { max-width:82%; padding:13px 18px; border-radius:18px; font-size:14px; line-height:1.65; opacity:0; }
  .cmsg.ai { background:rgba(155,142,196,.12); border:1px solid rgba(155,142,196,.18); border-radius:18px 18px 18px 4px; color:#d8d0e8; }
  .cmsg.me { align-self:flex-end; background:rgba(232,167,90,.1); border:1px solid rgba(232,167,90,.18); border-radius:18px 18px 4px 18px; color:#e8dfc8; }
  .cmsg:nth-child(1){animation:fadeUp .6s 1.5s forwards;}
  .cmsg:nth-child(2){animation:fadeUp .6s 2.1s forwards;}
  .cmsg:nth-child(3){animation:fadeUp .6s 2.8s forwards;}

  /* sections */
  .section { position:relative; padding:110px 24px; }
  .container { max-width:1100px; margin:0 auto; }
  .sec-label { font-size:11px; letter-spacing:.2em; text-transform:uppercase; color:var(--amber); margin-bottom:18px; }
  .sec-title { font-family:'Cormorant Garamond',serif; font-size:clamp(36px,5vw,62px); font-weight:300; line-height:1.1; margin-bottom:18px; }
  .sec-title em { font-style:italic; color:var(--rose); }
  .sec-body { font-size:16px; color:var(--muted2); line-height:1.8; max-width:520px; }

  /* companions preview */
  .companions-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-top:56px; }
  .comp-card {
    background:var(--surface); border:1px solid var(--border); border-radius:20px;
    padding:28px 20px; text-align:center; transition:all .35s; cursor:default;
  }
  .comp-card:hover { border-color:var(--border2); transform:translateY(-5px); background:rgba(20,23,36,.9); }
  .comp-emoji { font-size:36px; margin-bottom:14px; display:block; }
  .comp-name { font-family:'Cormorant Garamond',serif; font-size:20px; font-weight:400; margin-bottom:6px; }
  .comp-trait { font-size:12.5px; color:var(--muted2); line-height:1.6; }
  .comp-gender { font-size:10px; letter-spacing:.12em; text-transform:uppercase; margin-top:10px; }
  .comp-gender.f { color:var(--rose); }
  .comp-gender.m { color:var(--lav); }

  /* features strip */
  .features-strip { border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
  .features-row { display:grid; grid-template-columns:repeat(4,1fr); }
  .feat { padding:48px 32px; border-right:1px solid var(--border); transition:background .3s; }
  .feat:last-child { border-right:none; }
  .feat:hover { background:rgba(255,255,255,.02); }
  .feat-icon { font-size:26px; margin-bottom:18px; display:block; }
  .feat-title { font-family:'Cormorant Garamond',serif; font-size:19px; font-weight:400; margin-bottom:8px; }
  .feat-text { font-size:13px; color:var(--muted2); line-height:1.7; }

  /* cta */
  .cta-section { text-align:center; padding:130px 24px; }
  .cta-section h2 { font-family:'Cormorant Garamond',serif; font-size:clamp(42px,6vw,76px); font-weight:300; line-height:1.1; margin-bottom:22px; }
  .cta-section h2 em { font-style:italic; color:var(--rose); }
  .cta-sub { font-size:16px; color:var(--muted2); margin-bottom:44px; }
  .cta-actions { display:flex; gap:14px; justify-content:center; }
  .cta-note { font-size:11px; color:var(--muted); letter-spacing:.1em; text-transform:uppercase; margin-top:28px; }

  /* footer */
  footer { border-top:1px solid var(--border); padding:40px 56px; display:flex; align-items:center; justify-content:space-between; }
  .footer-logo { font-family:'Cormorant Garamond',serif; font-size:18px; }
  .footer-logo span { color:var(--amber); }
  .footer-note { font-size:12px; color:var(--muted); }
  .footer-links { display:flex; gap:24px; }
  .footer-links a { font-size:12px; color:var(--muted); text-decoration:none; letter-spacing:.07em; text-transform:uppercase; transition:color .3s; }
  .footer-links a:hover { color:var(--cream); }

  .divider { height:1px; background:linear-gradient(90deg,transparent,var(--border),transparent); max-width:900px; margin:0 auto; }

  /* ── AUTH PAGE ── */
  .auth-page {
    min-height: 100vh; display: flex; align-items: stretch;
    background: radial-gradient(ellipse at 20% 50%, rgba(155,142,196,0.07) 0%, transparent 55%),
                radial-gradient(ellipse at 80% 30%, rgba(232,167,90,0.06) 0%, transparent 50%);
  }
  .auth-left {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 60px 48px; max-width: 540px;
  }
  .auth-right {
    flex: 1; background: var(--surface); border-left: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center; padding: 60px 48px;
  }
  .auth-brand { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 300; margin-bottom: 10px; }
  .auth-brand span { color: var(--amber); }
  .auth-tagline { font-size: 15px; color: var(--muted2); line-height: 1.7; max-width: 340px; margin-bottom: 48px; }
  .auth-testimonial {
    background: rgba(20,23,36,.6); border: 1px solid var(--border); border-radius: 18px;
    padding: 28px; max-width: 380px;
  }
  .auth-quote { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-style: italic; line-height: 1.65; color: var(--cream); margin-bottom: 16px; }
  .auth-quote-author { font-size: 12px; color: var(--muted2); letter-spacing: .07em; }

  .auth-form { width: 100%; max-width: 420px; }
  .auth-form-title { font-family: 'Cormorant Garamond', serif; font-size: 30px; font-weight: 300; margin-bottom: 8px; }
  .auth-form-title em { font-style: italic; color: var(--rose); }
  .auth-form-sub { font-size: 14px; color: var(--muted2); margin-bottom: 36px; }
  .auth-tabs { display:flex; gap:4px; background:var(--panel); border-radius:12px; padding:4px; margin-bottom:28px; }
  .auth-tab { flex:1; padding:10px; border:none; border-radius:10px; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:13px; transition:all .25s; background:transparent; color:var(--muted2); }
  .auth-tab.active { background:var(--surface); color:var(--cream); box-shadow:0 2px 8px rgba(0,0,0,.3); }
  .field-group { margin-bottom: 16px; }
  .field-label { font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--muted2); margin-bottom:8px; display:block; }
  .field-input {
    width:100%; background:var(--panel); border:1px solid var(--border); border-radius:12px;
    padding:13px 16px; color:var(--cream); font-family:'DM Sans',sans-serif; font-size:14px;
    font-weight:300; outline:none; transition:border-color .25s;
  }
  .field-input:focus { border-color:rgba(232,167,90,.45); }
  .field-input::placeholder { color:var(--muted); }
  .auth-submit {
    width:100%; padding:15px; border:none; border-radius:12px; cursor:pointer; margin-top:8px;
    background:linear-gradient(135deg,var(--amber),#c46e3a); color:#0b0d14;
    font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500;
    transition:opacity .2s,transform .2s; box-shadow:0 8px 30px rgba(232,167,90,.2);
  }
  .auth-submit:hover:not(:disabled) { opacity:.9; transform:translateY(-1px); }
  .auth-submit:disabled { opacity:.5; cursor:not-allowed; }
  .auth-error { font-size:13px; color:var(--rose); margin-top:12px; text-align:center; }
  .auth-switch { font-size:13px; color:var(--muted2); text-align:center; margin-top:18px; }
  .auth-switch a { color:var(--amber); text-decoration:none; cursor:pointer; }
  .auth-back { display:inline-flex; align-items:center; gap:8px; font-size:13px; color:var(--muted2); text-decoration:none; margin-bottom:36px; transition:color .2s; }
  .auth-back:hover { color:var(--cream); }

  /* ── COMPANION PICKER ── */
  .picker-page {
    min-height: 100vh; display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 60px 24px;
    background: radial-gradient(ellipse at 50% 50%, rgba(155,142,196,0.06) 0%, transparent 65%);
  }
  .picker-title { font-family:'Cormorant Garamond',serif; font-size:clamp(34px,5vw,58px); font-weight:300; margin-bottom:12px; text-align:center; }
  .picker-title em { font-style:italic; color:var(--rose); }
  .picker-sub { font-size:15px; color:var(--muted2); margin-bottom:48px; text-align:center; max-width:480px; line-height:1.7; }
  .gender-tabs { display:flex; gap:8px; margin-bottom:40px; }
  .gender-tab {
    padding:12px 32px; border-radius:50px; font-size:14px; font-weight:400; cursor:pointer;
    border:1px solid var(--border); background:transparent; color:var(--muted2);
    font-family:'DM Sans',sans-serif; transition:all .25s;
  }
  .gender-tab.active-f { border-color:rgba(217,122,138,.5); background:rgba(217,122,138,.1); color:var(--rose); }
  .gender-tab.active-m { border-color:rgba(155,142,196,.5); background:rgba(155,142,196,.1); color:var(--lav); }
  .picker-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; max-width:900px; width:100%; margin-bottom:40px; }
  .picker-card {
    background:var(--surface); border:2px solid var(--border); border-radius:20px;
    padding:28px 16px; text-align:center; cursor:pointer; transition:all .3s;
  }
  .picker-card:hover { border-color:var(--border2); transform:translateY(-4px); }
  .picker-card.selected { transform:translateY(-6px); box-shadow:0 16px 40px rgba(0,0,0,.3); }
  .picker-emoji { font-size:38px; margin-bottom:12px; display:block; }
  .picker-name { font-family:'Cormorant Garamond',serif; font-size:20px; font-weight:400; margin-bottom:6px; }
  .picker-trait { font-size:12px; color:var(--muted2); line-height:1.6; }
  .picker-check { font-size:18px; margin-top:10px; display:block; }
  .picker-btn {
    padding:15px 48px; border:none; border-radius:50px; cursor:pointer;
    background:linear-gradient(135deg,var(--amber),#c46e3a); color:#0b0d14;
    font-family:'DM Sans',sans-serif; font-size:15px; font-weight:500;
    transition:all .2s; box-shadow:0 8px 30px rgba(232,167,90,.22);
  }
  .picker-btn:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(232,167,90,.34); }
  .picker-btn:disabled { opacity:.4; cursor:not-allowed; transform:none; }

  /* ── APP SHELL ── */
  .app-shell { display:flex; height:100vh; overflow:hidden; }

  /* sidebar */
  .sidebar {
    width:272px; min-width:272px; background:var(--surface);
    border-right:1px solid var(--border); display:flex; flex-direction:column;
    padding:0; overflow:hidden;
  }
  .sb-top { padding:22px 20px 18px; border-bottom:1px solid var(--border); }
  .sb-logo { font-family:'Cormorant Garamond',serif; font-size:20px; font-weight:400; }
  .sb-logo span { color:var(--amber); }
  .sb-user {
    display:flex; align-items:center; gap:10px; margin-top:14px;
    background:var(--panel); border-radius:12px; padding:10px 12px;
  }
  .sb-avatar {
    width:36px; height:36px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-family:'Cormorant Garamond',serif; font-size:16px; color:white; flex-shrink:0;
  }
  .sb-uname { font-size:14px; font-weight:400; color:var(--cream); }
  .sb-since { font-size:11px; color:var(--muted); margin-top:1px; }

  /* companion badge in sidebar */
  .sb-companion {
    margin:14px 20px 0; padding:12px 14px; border-radius:14px;
    background:var(--panel); border:1px solid var(--border);
    display:flex; align-items:center; gap:10px;
  }
  .sb-comp-emoji { font-size:22px; flex-shrink:0; }
  .sb-comp-name { font-family:'Cormorant Garamond',serif; font-size:16px; font-weight:400; }
  .sb-comp-online { font-size:11px; color:var(--green); display:flex; align-items:center; gap:4px; }
  .sb-comp-dot { width:5px; height:5px; border-radius:50%; background:var(--green); box-shadow:0 0 5px var(--green); animation:pulse 2s infinite; }

  .sb-nav { flex:1; padding:14px 12px; overflow-y:auto; }
  .sb-nav::-webkit-scrollbar { width:3px; }
  .sb-nav::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }
  .sb-section { font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:var(--muted); padding:0 8px; margin:18px 0 6px; }
  .sb-item {
    display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:10px;
    cursor:pointer; font-size:13.5px; color:var(--muted2); transition:all .2s; margin-bottom:2px;
    border:none; background:transparent; width:100%; text-align:left;
    font-family:'DM Sans',sans-serif; font-weight:300;
  }
  .sb-item:hover { background:var(--panel); color:var(--cream); }
  .sb-item.active { background:rgba(232,167,90,.1); color:var(--amber); }
  .sb-icon { font-size:15px; width:20px; text-align:center; }

  .sb-stats {
    margin:16px 0 0; padding:12px 14px; border-radius:12px;
    background:rgba(232,167,90,.05); border:1px solid rgba(232,167,90,.1);
  }
  .sb-stats-label { font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--amber); margin-bottom:8px; }
  .sb-stats-row { font-size:12.5px; color:var(--muted2); line-height:1.8; }

  .sb-bottom { padding:14px 12px; border-top:1px solid var(--border); }
  .sb-signout {
    display:flex; align-items:center; gap:10px; padding:9px 12px; width:100%;
    border:none; background:transparent; cursor:pointer; border-radius:10px;
    font-size:13px; color:var(--muted); font-family:'DM Sans',sans-serif; transition:all .2s;
  }
  .sb-signout:hover { background:rgba(217,122,138,.08); color:var(--rose); }
  .sb-change-comp {
    display:flex; align-items:center; gap:10px; padding:9px 12px; width:100%;
    border:none; background:transparent; cursor:pointer; border-radius:10px;
    font-size:13px; color:var(--muted); font-family:'DM Sans',sans-serif; transition:all .2s; margin-bottom:4px;
  }
  .sb-change-comp:hover { background:rgba(155,142,196,.08); color:var(--lav); }

  /* main area */
  .main-area { flex:1; display:flex; flex-direction:column; overflow:hidden; }

  /* chat */
  .chat-view { display:flex; flex-direction:column; height:100%; }
  .chat-top {
    padding:16px 28px; border-bottom:1px solid var(--border);
    display:flex; align-items:center; justify-content:space-between;
    background:var(--surface); flex-shrink:0;
  }
  .chat-comp-info { display:flex; align-items:center; gap:12px; }
  .chat-comp-av {
    width:44px; height:44px; border-radius:50%;
    display:flex; align-items:center; justify-content:center; font-size:22px;
  }
  .chat-comp-name { font-family:'Cormorant Garamond',serif; font-size:20px; font-weight:400; }
  .chat-comp-status { font-size:11.5px; display:flex; align-items:center; gap:5px; }
  .status-dot { width:6px; height:6px; border-radius:50%; animation:pulse 2s infinite; }
  .mode-btns { display:flex; gap:6px; }
  .mode-btn {
    padding:7px 14px; border-radius:20px; font-size:12px; cursor:pointer;
    border:1px solid var(--border); background:transparent; color:var(--muted2);
    font-family:'DM Sans',sans-serif; transition:all .2s;
  }
  .mode-btn.active { border-color:rgba(232,167,90,.4); background:rgba(232,167,90,.08); color:var(--amber); }
  .mode-btn:hover:not(.active) { border-color:var(--border2); color:var(--cream); }

  .msgs-area { flex:1; overflow-y:auto; padding:24px 32px; }
  .msgs-area::-webkit-scrollbar { width:4px; }
  .msgs-area::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }
  .msg-row { display:flex; margin-bottom:18px; animation:fadeUp .4s ease; }
  .msg-row.user { justify-content:flex-end; }
  .msg-bubble {
    max-width:68%; padding:13px 18px; border-radius:20px;
    font-size:14.5px; line-height:1.7; font-weight:300; white-space:pre-wrap; word-break:break-word;
  }
  .msg-row.ai .msg-bubble { background:rgba(155,142,196,.1); border:1px solid rgba(155,142,196,.15); border-radius:20px 20px 20px 5px; color:#d8d0e8; }
  .msg-row.user .msg-bubble { background:rgba(232,167,90,.1); border:1px solid rgba(232,167,90,.2); border-radius:20px 20px 5px 20px; color:#e8dfc8; }
  .msg-time { font-size:11px; color:var(--muted); margin-top:5px; padding:0 4px; }
  .msg-row.user .msg-time { text-align:right; }
  .typing-ind { display:flex; gap:5px; align-items:center; padding:15px 18px; max-width:68px; background:rgba(155,142,196,.1); border:1px solid rgba(155,142,196,.15); border-radius:20px 20px 20px 5px; animation:fadeUp .3s ease; }
  .t-dot { width:6px; height:6px; border-radius:50%; background:var(--lav); animation:bounce 1.2s infinite; }
  .t-dot:nth-child(2){animation-delay:.2s;} .t-dot:nth-child(3){animation-delay:.4s;}

  .input-area { padding:16px 28px 22px; border-top:1px solid var(--border); background:var(--surface); flex-shrink:0; }
  .input-row { display:flex; gap:10px; align-items:flex-end; }
  .msg-input {
    flex:1; background:var(--panel); border:1px solid var(--border); border-radius:16px;
    padding:13px 18px; color:var(--cream); font-family:'DM Sans',sans-serif; font-size:14px;
    font-weight:300; outline:none; resize:none; transition:border-color .25s;
    min-height:50px; max-height:140px; line-height:1.6;
  }
  .msg-input:focus { border-color:rgba(232,167,90,.3); }
  .msg-input::placeholder { color:var(--muted); }
  .send-btn {
    width:50px; height:50px; border-radius:14px; border:none; cursor:pointer;
    background:linear-gradient(135deg,var(--amber),#c46e3a); color:#0b0d14;
    font-size:22px; transition:all .2s; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 4px 20px rgba(232,167,90,.2);
  }
  .send-btn:hover:not(:disabled) { transform:scale(1.05); }
  .send-btn:disabled { opacity:.4; cursor:not-allowed; }
  .input-hint { font-size:11px; color:var(--muted); margin-top:7px; text-align:center; }

  /* inner views */
  .inner-view { padding:38px 40px; overflow-y:auto; height:100%; }
  .inner-view::-webkit-scrollbar { width:4px; }
  .inner-view::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }
  .view-title { font-family:'Cormorant Garamond',serif; font-size:34px; font-weight:300; margin-bottom:8px; }
  .view-title em { font-style:italic; color:var(--rose); }
  .view-sub { font-size:14px; color:var(--muted2); margin-bottom:32px; line-height:1.6; max-width:560px; }

  .mem-grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; max-width:880px; }
  .mem-card { background:var(--surface); border:1px solid var(--border); border-radius:18px; padding:26px; transition:border-color .3s; }
  .mem-card:hover { border-color:var(--border2); }
  .mc-icon { font-size:22px; margin-bottom:12px; }
  .mc-title { font-family:'Cormorant Garamond',serif; font-size:19px; font-weight:400; margin-bottom:8px; }
  .mc-body { font-size:13.5px; color:var(--muted2); line-height:1.75; }
  .mtag { display:inline-block; padding:4px 10px; border-radius:20px; font-size:12px; margin:3px 2px; border:1px solid; }
  .ta { color:var(--amber); border-color:rgba(232,167,90,.3); background:rgba(232,167,90,.06); }
  .tr { color:var(--rose); border-color:rgba(217,122,138,.3); background:rgba(217,122,138,.06); }
  .tl { color:var(--lav); border-color:rgba(155,142,196,.3); background:rgba(155,142,196,.06); }
  .span2 { grid-column:span 2; }

  .tl-wrap { position:relative; padding-left:34px; max-width:680px; }
  .tl-wrap::before { content:''; position:absolute; left:0; top:8px; bottom:0; width:1px; background:linear-gradient(180deg,var(--amber),var(--rose),var(--lav),transparent); }
  .tl-item { position:relative; margin-bottom:34px; animation:fadeUp .5s ease; }
  .tl-dot { position:absolute; left:-38px; top:6px; width:9px; height:9px; border-radius:50%; background:var(--amber); box-shadow:0 0 10px var(--amber); }
  .tl-item:nth-child(2n) .tl-dot { background:var(--rose); box-shadow:0 0 10px var(--rose); }
  .tl-item:nth-child(3n) .tl-dot { background:var(--lav); box-shadow:0 0 10px var(--lav); }
  .tl-date { font-size:11px; letter-spacing:.14em; color:var(--amber); text-transform:uppercase; margin-bottom:5px; }
  .tl-content { font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:300; line-height:1.6; }
  .tl-detail { font-size:13px; color:var(--muted2); margin-top:3px; }

  .pf-form { max-width:560px; }
  .pf-field { margin-bottom:20px; }
  .pf-label { font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); margin-bottom:7px; display:block; }
  .pf-input { width:100%; background:var(--panel); border:1px solid var(--border); border-radius:12px; padding:12px 15px; color:var(--cream); font-family:'DM Sans',sans-serif; font-size:14px; font-weight:300; outline:none; transition:border-color .25s; }
  .pf-input:focus { border-color:rgba(232,167,90,.4); }
  .save-btn { padding:12px 28px; border-radius:10px; border:none; cursor:pointer; background:linear-gradient(135deg,var(--amber),#c46e3a); color:#0b0d14; font-size:13px; font-weight:500; font-family:'DM Sans',sans-serif; transition:opacity .2s; }
  .save-btn:hover { opacity:.87; }
  .save-ok { font-size:13px; color:var(--green); margin-left:12px; }

  .empty-box { text-align:center; padding:56px 40px; color:var(--muted); }
  .empty-icon { font-size:44px; margin-bottom:14px; }
  .empty-title { font-family:'Cormorant Garamond',serif; font-size:21px; font-style:italic; margin-bottom:7px; }
  .empty-hint { font-size:14px; }

  .welcome-box { text-align:center; padding:70px 40px; max-width:480px; margin:0 auto; }
  .welcome-icon { font-size:48px; margin-bottom:22px; }
  .welcome-title { font-family:'Cormorant Garamond',serif; font-size:32px; font-weight:300; margin-bottom:12px; }
  .welcome-title em { font-style:italic; color:var(--rose); }
  .welcome-body { font-size:15px; color:var(--muted2); line-height:1.75; }

  .loading-screen { height:100vh; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:14px; }
  .loading-logo { font-family:'Cormorant Garamond',serif; font-size:28px; font-weight:300; }
  .loading-logo span { color:var(--amber); }
  .loading-sub { font-size:13px; color:var(--muted); }

  .prog-bar { height:4px; background:var(--border); border-radius:2px; overflow:hidden; }
  .prog-fill { height:100%; border-radius:2px; background:linear-gradient(90deg,var(--amber),var(--rose)); transition:width .8s ease; }

  /* reveal */
  .reveal { opacity:0; transform:translateY(28px); transition:opacity .8s ease,transform .8s ease; }
  .reveal.vis { opacity:1; transform:none; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
  @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:.4;} }
  @keyframes bounce { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-5px);} }

  /* ════════════════════════════════════════════════════════════════
     MOBILE STYLES — phones & small tablets (max-width: 768px)
     ════════════════════════════════════════════════════════════════ */
  @media (max-width:768px) {

    /* ── Prevent horizontal scroll & fix tap highlight ── */
    html, body { overflow-x: hidden; -webkit-tap-highlight-color: transparent; }
    button, a { touch-action: manipulation; }

    /* ── HOMEPAGE ── */
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
    .chat-window { padding: 20px; border-radius: 18px; }

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

    /* ── AUTH PAGE ── */
    .auth-page { flex-direction: column; }
    .auth-left { padding: 48px 24px 24px; max-width: 100%; }
    .auth-testimonial { display: none; }
    .auth-right { display: flex; border-left: none; border-top: 1px solid var(--border); padding: 32px 24px 56px; }
    .auth-form { max-width: 100%; }
    .auth-form-title { font-size: 26px; }

    /* ── COMPANION PICKER ── */
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

    /* ── APP SHELL — sidebar becomes bottom tab bar ── */
    .app-shell { flex-direction: column; height: 100dvh; }

    .sidebar {
      display: flex;
      flex-direction: row;
      width: 100%;
      min-width: 100%;
      height: auto;
      order: 2;
      border-right: none;
      border-top: 1px solid var(--border);
      padding: 0;
      position: fixed;
      bottom: 0; left: 0; right: 0;
      z-index: 50;
      background: var(--surface);
    }
    .sb-top, .sb-companion, .sb-stats, .sb-bottom { display: none; }
    .sb-nav {
      flex: 1;
      display: flex;
      flex-direction: row;
      padding: 6px 4px;
      padding-bottom: max(6px, env(safe-area-inset-bottom));
      overflow-x: auto;
      overflow-y: hidden;
    }
    .sb-section { display: none; }
    .sb-item {
      flex-direction: column;
      gap: 3px;
      flex: 1;
      min-width: 64px;
      padding: 7px 4px;
      font-size: 10px;
      text-align: center;
      white-space: nowrap;
    }
    .sb-icon { font-size: 19px; width: auto; }

    .main-area { order: 1; padding-bottom: 64px; height: calc(100dvh - 64px); }

    /* ── CHAT VIEW ── */
    .chat-top { padding: 12px 16px; }
    .chat-comp-name { font-size: 17px; }
    .chat-comp-av { width: 36px; height: 36px; font-size: 18px; }
    .mode-btns { gap: 4px; }
    .mode-btn { padding: 6px 9px; font-size: 11px; }
    .mode-btn-label-text, .mode-label-text { display: none; } /* keep emoji only on small screens */
    .mode-btn { padding: 8px 11px; }

    .msgs-area { padding: 16px; }
    .msg-bubble { max-width: 82%; font-size: 14px; padding: 11px 15px; }
    .welcome-box { padding: 40px 20px; }
    .welcome-icon { font-size: 38px; }
    .welcome-title { font-size: 26px; }

    .input-area { padding: 10px 12px 12px; }
    .msg-input { font-size: 16px; padding: 11px 14px; min-height: 44px; } /* 16px prevents iOS zoom */
    .send-btn { width: 44px; height: 44px; font-size: 18px; }
    .input-hint { display: none; }

    /* ── INNER VIEWS (memory, journal, profile) ── */
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
    .pf-input { font-size: 16px; } /* prevents iOS zoom on focus */

    /* ── MODALS / CARDS GENERAL ── */
    .modes-grid { grid-template-columns: 1fr; }
  }

  /* ════════════════════════════════════════════════════════════════
     VERY SMALL PHONES (max-width: 380px)
     ════════════════════════════════════════════════════════════════ */
  @media (max-width: 380px) {
    .companions-grid, .picker-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
    .sb-item { min-width: 56px; font-size: 9px; }
    .sb-icon { font-size: 17px; }
    .msg-bubble { max-width: 88%; }
  }
`;
