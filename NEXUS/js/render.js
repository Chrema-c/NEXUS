// ============ RENDER ENGINE ============

function styleVars(colorKey){
  const c=COLOR_MAP[colorKey]||COLOR_MAP.teal;
  return `--accent:${c.c};--accent-glow:${c.glow};--accent-bg:${c.bg};--accent-border:${c.border};`;
}

function appNav(activeSection){
  document.querySelectorAll('#app-navbar .nav-link').forEach(l=>{
    l.classList.toggle('active', l.dataset.section===activeSection);
  });
}

// ---------- TOOLS/QUIZZES/GAMES SECTION LIST PAGE ----------
function renderSectionPage(sectionKey){
  const sec=SECTIONS[sectionKey];
  const items=Object.entries(ITEMS).filter(([k,v])=>v.section===sectionKey);
  const colorClass = sectionKey==='tools' ? 'v-tools' : sectionKey==='quizzes' ? 'v-quizzes' : 'v-games';

  let cards='';
  items.forEach(([key,it],i)=>{
    cards+=`<div class="item-card ${colorClass}" data-go="intro-${key}">
      <div class="ic-icon">${it.icon}</div>
      <div class="ic-name" style="color:${COLOR_MAP[sec.accent].c}">${it.name}</div>
      <div class="ic-desc">${it.short}</div>
    </div>`;
  });

  return `
    <div class="page-section">
      <div class="section-hero">
        <div class="sh-left">
          <div class="sh-tag" style="color:${COLOR_MAP[sec.accent].c}">${sec.name}</div>
          <div class="sh-title">${sec.title}</div>
          <div class="sh-desc">${sec.desc}</div>
        </div>
      </div>
      <div class="item-grid">${cards}</div>
    </div>
  `;
}

// ---------- INTRO / ABOUT SLIDE ----------
function renderIntro(key){
  const it=ITEMS[key];
  const c=COLOR_MAP[it.color];
  return `
    <div class="page-section">
      <div class="back-btn" data-go="${it.section}">← Back to ${SECTIONS[it.section].name}</div>
      <div class="intro-box" style="background:${c.bg};border:0.5px solid ${c.border};">
        <div class="intro-icon">${it.icon}</div>
        <div class="intro-tag" style="color:${c.c}">${it.name}</div>
        <div class="intro-title">${it.short}</div>
        <div class="intro-section">
          <div class="intro-section-label" style="color:${c.c}">What is this?</div>
          <div class="intro-section-text">${it.what}</div>
        </div>
        <div class="intro-section">
          <div class="intro-section-label" style="color:${c.c}">Why does it matter?</div>
          <div class="intro-section-text">${it.why}</div>
        </div>
        <div class="intro-section">
          <div class="intro-section-label" style="color:${c.c}">How can it help you?</div>
          <div class="intro-section-text">${it.how}</div>
        </div>
        <div class="intro-go-btn" style="background:${c.bg};border:0.5px solid ${c.border};color:${c.c}" data-go="open-${key}">${it.btn} →</div>
      </div>
    </div>
  `;
}

// ---------- HOW TO USE PAGE ----------
function renderHowTo(key){
  const it=ITEMS[key]; const c=COLOR_MAP[it.color]; const ht=HOW_TO[key];
  if(!ht) return `<div class="page-section"><div class="back-btn" data-go="open-${key}">← Back to ${it.name}</div><p style="color:var(--muted)">Guide coming soon.</p></div>`;
  let steps=''; ht.steps.forEach((s,i)=>{
    steps+=`<div class="how-step"><div class="how-num" style="background:${c.bg};border:0.5px solid ${c.border};color:${c.c}">${i+1}</div><div class="how-text">${s}</div></div>`;
  });
  return `
    <div class="page-section">
      <div class="back-btn" data-go="open-${key}">← Back to ${it.name}</div>
      <div class="tool-title" style="color:${c.c}">How To Use — ${it.name}</div>
      <div style="margin-top:24px">${steps}</div>
      <div class="demo-box" style="background:${c.bg};border:0.5px solid ${c.border};">
        <div class="demo-label" style="color:${c.c}">Mini Demo</div>
        <div class="demo-row">
          <div><div class="demo-label" style="color:var(--muted)">INPUT</div><div class="demo-in">${ht.demoIn}</div></div>
          <div><div class="demo-label" style="color:var(--muted)">OUTPUT</div><div class="demo-out" style="background:${c.bg};color:${c.c}">${ht.demoOut}</div></div>
        </div>
      </div>
      <div class="tech-expand" id="techExpandBtn" style="background:${c.bg};border:0.5px solid ${c.border};color:${c.c}">+ HOW IT WORKS — Technical Deep Dive</div>
      <div class="tech-content" id="techContent">${ht.works}</div>
    </div>
  `;
}

// ---------- TOOL PAGES (functional) ----------
// ---------- FLASHCARD QUIZ/CHECKLIST PAGE ----------
function renderFlashPage(key){
  const it=ITEMS[key]; const c=COLOR_MAP[it.color];
  const backBtn=`<div class="back-btn" data-go="${it.section}">← Back to ${SECTIONS[it.section].name}</div>`;
  const header=`<div class="tool-header">
      <div class="tool-title" style="color:${c.c}">${it.name}</div>
      <div class="how-to-btn" style="background:${c.bg};border:0.5px solid ${c.border};color:${c.c}" data-go="howto-${key}">? HOW TO USE</div>
    </div>`;
  return `<div class="page-section">${backBtn}${header}
    <div class="flash-wrap" id="flashWrap"></div>
  </div>`;
}

// ---------- END SCREEN ----------
function renderEndScreen(key,scoreText,variantKey){
  const it=ITEMS[key]; const c=COLOR_MAP[it.color];
  const end=END_SCREENS[variantKey||key]||{title:'Well Done!',msg:'You have completed this successfully.',tip:'Keep practising to stay sharp.'};
  const learnedHtml = end.learned ? `<div class="end-extra-block">
      <div class="end-extra-label" style="color:${c.c}">📘 What You Learned</div>
      ${end.learned.map(function(l){ return '<div class="end-extra-row"><span class="eer-dot" style="background:'+c.c+'"></span><span>'+l+'</span></div>'; }).join('')}
    </div>` : '';
  const levelUpHtml = end.levelUp ? `<div class="end-extra-block">
      <div class="end-extra-label" style="color:${c.c}">🚀 Level Up From Here</div>
      ${end.levelUp.map(function(l){ return '<div class="end-extra-row"><span class="eer-dot" style="background:'+c.c+'"></span><span>'+l+'</span></div>'; }).join('')}
    </div>` : '';
  return `<div class="page-section">
    <div class="end-wrap">
      <div class="end-box" style="background:${c.bg};border:0.5px solid ${c.border};">
        <div class="end-trophy">${end.icon||'🏆'}</div>
        <div class="end-title">${end.title}</div>
        ${scoreText?`<div class="end-score" style="color:${c.c}">${scoreText}</div>`:''}
        <div class="end-msg">${end.msg}</div>
        ${!end.learned?`<div class="end-tip" style="background:${c.bg};border-left-color:${c.c}">
          <div class="end-tip-label" style="color:${c.c}">Pro Tip</div>
          <div class="end-tip-text">${end.tip}</div>
        </div>`:''}
        ${learnedHtml}
        ${levelUpHtml}
        <div class="nexus-btn" style="background:${c.bg};border:0.5px solid ${c.border};color:${c.c}" data-go="${it.section}">← BACK TO ${SECTIONS[it.section].name.toUpperCase()}</div>
      </div>
    </div>
  </div>`;
}

// ---------- STATIC PAGES ----------
// ============ UPDATED STATIC PAGES ============
function renderStatic(page){
  if(page === 'about'){
    return '<div class="page-section"><div class="static-page">' +
      '<div class="static-hero">' +
      '<div class="static-tag">About NEXUS</div>' +
      '<h1>Your Cyber Shield, Built for Everyone</h1>' +
      '<p class="lead">NEXUS is a free, standalone cybersecurity awareness platform designed to help everyday people understand, detect, and defend against digital threats — no technical background required.</p>' +
      '</div>' +
      '<div class="static-section"><h2>What Is NEXUS?</h2>' +
      '<p>NEXUS is a comprehensive suite of cybersecurity tools, quizzes, and games built to make cyber safety accessible to everyone. From phishing link detection to password analysis, email verification to malware scanning — every tool runs instantly in your browser and stores nothing.</p>' +
      '<p>Whether you\'re a student, a professional, or just someone who wants to stay safe online, NEXUS gives you the knowledge and tools to protect yourself in the modern digital world.</p></div>' +
      '<div class="static-section"><h2>What We Offer</h2><div class="static-grid">' +
      '<div class="static-card"><div class="sc-title">🛠 10 Security Tools</div><div class="sc-desc">URL analyzer (with real Google Safe Browsing check), password checker, email verifier, forensics analyzer, QR scanner, header analyzer, IP lookup, browser fingerprint checker, encryption playground, and metadata stripper.</div></div>' +
      '<div class="static-card"><div class="sc-title">📋 10 Learning Quizzes</div><div class="sc-desc">Wi-Fi & network security, device & mobile security, digital hygiene, privacy & data protection, password knowledge, Cyber IQ test, social engineering, dark web awareness, incident response, and digital footprint.</div></div>' +
      '<div class="static-card"><div class="sc-title">🎮 10 Games & Labs</div><div class="sc-desc">Caesar Cracker, Crack the Code, Phishing Detective, Morse Rush, Binary Blitz, Password Generator Game, Cyber Escape Room, Threat Triage, Red Flag Hunter, and Scam Call Simulator.</div></div>' +
      '<div class="static-card"><div class="sc-title">📚 Threats & Learn Pages</div><div class="sc-desc">Deep-dive into the threat landscape and structured learning paths covering every major cybersecurity topic.</div></div>' +
      '</div></div>' +
      '<div class="static-section"><h2>Our Principles</h2>' +
      '<p><b style="color:var(--cream)">Privacy first.</b> Your inputs never leave your device. No accounts, no tracking, no data collection — ever.</p>' +
      '<p><b style="color:var(--cream)">Always free.</b> Every tool, quiz, and game on NEXUS is and will remain completely free to use.</p>' +
      '<p><b style="color:var(--cream)">Education over fear.</b> We believe awareness — not panic — is the best defense against cyber threats.</p>' +
      '</div>' +
      '<div class="nexus-btn" style="margin-top:10px" data-go="tools">EXPLORE THE TOOLS →</div>' +
      '</div></div>';
  }
  if(page === 'privacy'){
    return '<div class="page-section"><div class="static-page">' +
      '<div class="static-hero">' +
      '<div class="static-tag">Privacy Policy</div>' +
      '<h1>We Collect Nothing. Seriously.</h1>' +
      '<p class="lead">NEXUS is built on a simple principle: your data is yours. We don\'t collect it, store it, sell it, or share it. Full stop.</p>' +
      '</div>' +
      '<div class="static-section"><h2>What We Don\'t Collect</h2>' +
      '<p>Every tool on NEXUS — URL analysis, password checks, email verification, file scanning — runs entirely in your browser session. When you close the tab, everything disappears. Nothing is sent to any server for processing or storage.</p>' +
      '<p>We don\'t use cookies for tracking, we don\'t use analytics tools that record your behavior, and we don\'t require any account or sign-in.</p></div>' +
      '<div class="static-section"><h2>Usage Statistics</h2>' +
      '<p>The stats shown on the dashboard (URLs scanned, passwords checked, etc.) are approximate cumulative counts used for display purposes only. They are not tied to individual users or sessions.</p></div>' +
      '<div class="static-section"><h2>Third-Party Services</h2>' +
      '<p>NEXUS loads fonts from Google Fonts. This is the only external resource loaded, and it is standard practice across virtually all modern websites. Google\'s font service may log your IP address per their own privacy policy.</p></div>' +
      '<div class="static-section"><h2>Your Rights</h2>' +
      '<p>Since we collect no personal data, there is nothing to request, delete, or export. You have complete privacy by design — not by policy.</p></div>' +
      '<div class="static-section"><h2>Contact</h2>' +
      '<p>Questions about privacy? Reach us at <b style="color:var(--cream)">Chrema.1409@gmail.com</b></p></div>' +
      '</div></div>';
  }
  if(page === 'contact'){
    return '<div class="page-section"><div class="static-page">' +
      '<div class="static-hero">' +
      '<div class="static-tag">Reach Us</div>' +
      '<h1>We\'d Love To Hear From You</h1>' +
      '<p class="lead">Have feedback, found a bug, want to suggest a new tool, or just want to say hello? We\'re all ears.</p>' +
      '</div>' +
      '<div class="static-section"><h2>Get In Touch</h2>' +
      '<div class="contact-item"><div class="ci-icon">📧</div><div><div class="ci-label">Email</div><div class="ci-val">Chrema.1409@gmail.com</div><div class="ci-sub">We typically respond within 24–48 hours.</div></div></div>' +
      '<div class="contact-item"><div class="ci-icon">🐛</div><div><div class="ci-label">Bug Reports</div><div class="ci-val">Found something broken?</div><div class="ci-sub">Email us with the tool name, what you did, and what happened. Screenshots help!</div></div></div>' +
      '<div class="contact-item"><div class="ci-icon">💡</div><div><div class="ci-label">Feature Suggestions</div><div class="ci-val">Have an idea for a new tool or quiz?</div><div class="ci-sub">We love hearing ideas from users. Send us a description and we\'ll consider it for the next update.</div></div></div>' +
      '<div class="contact-item"><div class="ci-icon">🤝</div><div><div class="ci-label">Collaborations</div><div class="ci-val">Want to work together?</div><div class="ci-sub">We\'re open to educational partnerships, cybersecurity awareness collaborations, and community projects.</div></div></div>' +
      '</div>' +
      '<div class="static-section"><h2>Before You Write</h2>' +
      '<p>Check the tool\'s <b style="color:var(--cream)">How To Use</b> guide first — many common questions are answered there. Also note that NEXUS tools use static analysis and heuristics, not live databases, so some edge cases may not be detected.</p></div>' +
      '</div></div>';
  }
  return '<div class="page-section"><div class="static-page"><h1>Page Not Found</h1></div></div>';
}

// ============ EXTENDED TOOL PAGES ============
function renderToolPage(key){
  const it = ITEMS[key]; if(!it) return '<div class="page-section"><p>Tool not found.</p></div>';
  const c = COLOR_MAP[it.color]||COLOR_MAP.teal;
  const backDest = it.section || 'tools';
  const header = '<div class="tool-header"><div class="tool-title" style="color:'+c.c+'">'+it.name+'</div>' +
    '<div class="how-to-btn" style="background:'+c.bg+';border:0.5px solid '+c.border+';color:'+c.c+'" data-go="howto-'+key+'">? HOW TO USE</div></div>';
  const back = '<div class="back-btn" data-go="'+backDest+'">← Back to '+SECTIONS[backDest].name+'</div>';

  let panel = '';

  if(key==='url'){
    panel='<div class="tool-panel" style="background:'+c.bg+';border:0.5px solid '+c.border+';">'+
      '<div class="input-label">Enter URL to analyze</div>'+
      '<input type="text" class="nexus-input" id="urlInput" placeholder="https://example.com" style="border-color:'+c.border+'">'+
      '<div class="nexus-btn" id="urlBtn" style="background:'+c.bg+';border:0.5px solid '+c.border+';color:'+c.c+'">ANALYZE URL</div>'+
      '<div id="urlResult"></div></div>';
  }
  else if(key==='password'){
    panel='<div class="tool-panel" style="background:'+c.bg+';border:0.5px solid '+c.border+';">'+
      '<div class="input-label">Enter password</div>'+
      '<input type="password" class="nexus-input" id="pwInput" placeholder="Type any password" style="border-color:'+c.border+'">'+
      '<div class="nexus-btn" id="pwBtn" style="background:'+c.bg+';border:0.5px solid '+c.border+';color:'+c.c+'">ANALYZE PASSWORD</div>'+
      '<div id="pwResult"></div></div>';
  }
  else if(key==='email'){
    panel='<div class="tool-panel" style="background:'+c.bg+';border:0.5px solid '+c.border+';">'+
      '<div class="input-label">Enter email address</div>'+
      '<input type="text" class="nexus-input" id="emInput" placeholder="user@example.com" style="border-color:'+c.border+'">'+
      '<div class="nexus-btn" id="emBtn" style="background:'+c.bg+';border:0.5px solid '+c.border+';color:'+c.c+'">VERIFY EMAIL</div>'+
      '<div id="emResult"></div></div>';
  }
  else if(key==='headers'){
    panel='<div class="tool-panel" style="background:'+c.bg+';border:0.5px solid '+c.border+';">'+
      '<div class="input-label">Paste raw email headers</div>'+
      '<div style="font-size:11px;color:var(--muted);margin-bottom:10px">Gmail: 3-dot menu → Show original. Outlook: File → Properties → Internet headers.</div>'+
      '<textarea class="nexus-input" id="headersInput" placeholder="Received: from mail.example.com..." style="border-color:'+c.border+';min-height:150px"></textarea>'+
      '<div class="nexus-btn" id="headersBtn" style="background:'+c.bg+';border:0.5px solid '+c.border+';color:'+c.c+'">ANALYZE HEADERS</div>'+
      '<div id="headersResult"></div></div>';
  }
  else if(key==='ip'){
    panel='<div class="tool-panel" style="background:'+c.bg+';border:0.5px solid '+c.border+';">'+
      '<div class="input-label">Enter IP address</div>'+
      '<input type="text" class="nexus-input" id="ipInput" placeholder="8.8.8.8" style="border-color:'+c.border+'">'+
      '<div class="nexus-btn" id="ipBtn" style="background:'+c.bg+';border:0.5px solid '+c.border+';color:'+c.c+'">LOOKUP IP</div>'+
      '<div id="ipResult"></div></div>';
  }
  else if(key==='forensics'){
    panel='<div class="tool-panel" style="background:'+c.bg+';border:0.5px solid '+c.border+';">'+
      '<div class="input-label">Upload image for analysis</div>'+
      '<div style="font-size:11px;color:var(--muted);margin-bottom:10px">Extracts EXIF metadata and detects steganography signals from the image.</div>'+
      '<input type="file" class="nexus-input" id="forensicsInput" accept="image/*" style="border-color:'+c.border+'">'+
      '<div class="nexus-btn" id="forensicsBtn" style="background:'+c.bg+';border:0.5px solid '+c.border+';color:'+c.c+'">ANALYZE IMAGE</div>'+
      '<div id="forensicsResult"></div></div>';
  }
  else if(key==='qr'){
    panel='<div class="tool-panel" style="background:'+c.bg+';border:0.5px solid '+c.border+';">'+
      '<div class="input-label">Upload an image containing a QR code</div>'+
      '<input type="file" class="nexus-input" id="qrInput" accept="image/*" style="border-color:'+c.border+'">'+
      '<div class="nexus-btn" id="qrBtn" style="background:'+c.bg+';border:0.5px solid '+c.border+';color:'+c.c+'">SCAN QR CODE</div>'+
      '<div id="qrResult"></div></div>';
  }
  else if(key==='fingerprint'){
    panel='<div class="tool-panel" style="background:'+c.bg+';border:0.5px solid '+c.border+';" id="fingerprintPanel"></div>';
  }
  else if(key==='encrypt_playground'){
    panel='<div class="tool-panel" style="background:'+c.bg+';border:0.5px solid '+c.border+';">'+
      '<div class="input-label">Type a message</div>'+
      '<input type="text" class="nexus-input" id="encInput" placeholder="Type something short..." style="border-color:'+c.border+'">'+
      '<div class="nexus-btn" id="encBtn" style="background:'+c.bg+';border:0.5px solid '+c.border+';color:'+c.c+'">TRANSFORM</div>'+
      '<div id="encResult"></div></div>';
  }
  else if(key==='metadata_strip'){
    panel='<div class="tool-panel" style="background:'+c.bg+';border:0.5px solid '+c.border+';">'+
      '<div class="input-label">Upload a photo</div>'+
      '<input type="file" class="nexus-input" id="metaInput" accept="image/*" style="border-color:'+c.border+'">'+
      '<div class="nexus-btn" id="metaBtn" style="background:'+c.bg+';border:0.5px solid '+c.border+';color:'+c.c+'">ANALYZE & STRIP</div>'+
      '<div id="metaResult"></div></div>';
  }
  else if(key==='cipher'){
    panel='<div class="tool-panel" style="background:'+c.bg+';border:0.5px solid '+c.border+'" id="cipherPanel"></div>';
  }
  else if(key==='crack_code'){
    panel='<div class="tool-panel" style="background:'+c.bg+';border:0.5px solid '+c.border+'" id="crackPanel">'+
      '<div class="input-label">Encrypted message</div>'+
      '<div class="demo-in" id="crackEncrypted" style="margin-bottom:14px;font-size:14px"></div>'+
      '<div class="input-label">Try shift: <span id="crackShiftVal">3</span></div>'+
      '<input type="range" id="crackSlider" min="1" max="25" value="3" style="width:100%;margin-bottom:12px;accent-color:'+c.c+'">'+
      '<div class="input-label">Live preview</div>'+
      '<div class="demo-in" id="crackPreview" style="margin-bottom:14px"></div>'+
      '<div class="nexus-btn" id="crackBtn" style="background:'+c.bg+';border:0.5px solid '+c.border+';color:'+c.c+'">SUBMIT GUESS</div>'+
      '<div id="crackResult"></div></div>';
  }
  else if(key==='phishing_detect'){
    panel='<div class="tool-panel" style="background:'+c.bg+';border:0.5px solid '+c.border+'" id="phishPanel"></div>';
  }
  else if(key==='morse'){
    panel='<div class="tool-panel" style="background:'+c.bg+';border:0.5px solid '+c.border+'" id="morsePanel"></div>';
  }
  else if(key==='binary'){
    panel='<div class="tool-panel" style="background:'+c.bg+';border:0.5px solid '+c.border+'" id="binaryPanel"></div>';
  }
  else if(key==='passgen'){
    panel='<div class="tool-panel" style="background:'+c.bg+';border:0.5px solid '+c.border+'" id="passgenPanel"></div>';
  }
  else if(key==='escape_room'){
    panel='<div class="tool-panel" style="background:'+c.bg+';border:0.5px solid '+c.border+'" id="escapePanel"></div>';
  }
  else if(key==='threat_triage'){
    panel='<div class="tool-panel" style="background:'+c.bg+';border:0.5px solid '+c.border+'" id="triagePanel"></div>';
  }
  else if(key==='redflag_hunter'){
    panel='<div class="tool-panel" style="background:'+c.bg+';border:0.5px solid '+c.border+'" id="redflagPanel"></div>';
  }
  else if(key==='scamcall_sim'){
    panel='<div class="tool-panel" style="background:'+c.bg+';border:0.5px solid '+c.border+'" id="scamcallPanel"></div>';
  }

  return '<div class="page-section">'+back+header+panel+'</div>';
}
