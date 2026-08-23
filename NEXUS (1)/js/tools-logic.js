// ============ NEXUS TOOLS & GAMES LOGIC ============

// ---------- Caesar cipher ----------
function caesarCipher(text, shift, mode){
  const s = mode === 'decrypt' ? (26 - (shift % 26)) % 26 : shift % 26;
  return text.replace(/[a-zA-Z]/g, function(ch){
    const base = ch <= 'Z' ? 65 : 97;
    return String.fromCharCode(((ch.charCodeAt(0) - base + s) % 26) + base);
  });
}

// ---------- Morse code ----------
const MORSE_MAP = {A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',
  K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',
  W:'.--',X:'-..-',Y:'-.--',Z:'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-',
  '5':'.....','6':'-....','7':'--...','8':'---..','9':'----.'};
const MORSE_REVERSE = Object.fromEntries(Object.entries(MORSE_MAP).map(function(p){ return [p[1],p[0]]; }));
function textToMorse(text){ return text.toUpperCase().split('').map(function(ch){ return ch===' '?'/':(MORSE_MAP[ch]||''); }).join(' '); }
function morseToText(morse){ return morse.trim().split(' ').map(function(code){ return code==='/'?' ':(MORSE_REVERSE[code]||''); }).join(''); }

// ---------- Binary ----------
function textToBinary(text){ return text.split('').map(function(ch){ return ch.charCodeAt(0).toString(2).padStart(8,'0'); }).join(' '); }
function binaryToText(bin){ return bin.trim().split(/\s+/).map(function(b){ return String.fromCharCode(parseInt(b,2)); }).join(''); }

function pickWords(bank, n){
  const pool = bank.slice();
  const out = [];
  for(let i=0;i<n && pool.length;i++){
    const idx = Math.floor(Math.random()*pool.length);
    out.push(pool.splice(idx,1)[0]);
  }
  return out;
}

// ============ URL ANALYZER (fixed + Safe Browsing API) ============
function analyzeURL(url){
  let score=0; const flags=[];
  let u=url.trim();
  if(!/^https?:\/\//i.test(u)) u='http://'+u;
  let domain='', path='';
  try{ const parsed=new URL(u); domain=parsed.hostname.toLowerCase().replace('www.',''); path=parsed.pathname||''; }
  catch(e){ domain=u.toLowerCase(); path=''; }

  if(u.toLowerCase().startsWith('http://')){ score+=15; flags.push({sev:'medium',name:'No HTTPS',detail:'Connection is not encrypted.'}); }
  if(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain)){ score+=30; flags.push({sev:'high',name:'IP Address URL',detail:'URL uses a raw IP instead of a domain name.'}); }

  if(domain.includes('xn--')){ score+=35; flags.push({sev:'high',name:'Punycode Domain',detail:'Domain uses encoded international characters — a common homograph attack technique to mimic real brands.'}); }
  const mixedScript = /[a-z]/.test(domain) && /[^\x00-\x7F]/.test(domain);
  if(mixedScript){ score+=35; flags.push({sev:'high',name:'Mixed Script Characters',detail:'Domain mixes standard letters with non-standard/lookalike characters.'}); }

  const suspTlds=['.tk','.ml','.ga','.cf','.gq','.top','.click','.work','.support'];
  if(suspTlds.some(function(t){ return domain.endsWith(t); })){ score+=20; flags.push({sev:'high',name:'Suspicious TLD',detail:'Domain uses a free/low-cost TLD heavily abused in phishing campaigns.'}); }

  if(u.length>100){ score+=10; flags.push({sev:'medium',name:'Long URL',detail:'URL is '+u.length+' characters long.'}); }
  const subParts=domain.split('.');
  if(subParts.length>3){ score+=15; flags.push({sev:'medium',name:'Excessive Subdomains',detail:'Domain has unusually many subdomains.'}); }

  const pathAndSub = (path + subParts.slice(0,-2).join('.')).toLowerCase();
  const phishWords=['login','signin','verify','secure','account','update','confirm','password','banking','suspended','urgent'];
  const found=phishWords.filter(function(w){ return pathAndSub.includes(w); });
  if(found.length){ score+=Math.min(found.length*8,20); flags.push({sev:'medium',name:'Phishing-style Wording',detail:'Found in path/subdomain: '+found.slice(0,5).join(', ')}); }

  const trusted=['google','microsoft','apple','amazon','facebook','paypal','hdfc','sbi'];
  const apex = subParts.slice(-2).join('.');
  const impersonated = trusted.filter(function(t){
    return domain.includes(t) &&
      !domain.endsWith(t+'.com') && !domain.endsWith(t+'.co.in') &&
      !domain.endsWith('.'+t+'.com') && !domain.endsWith('.'+t+'.co.in') &&
      apex !== t+'.com';
  });
  if(impersonated.length){ score+=35; flags.push({sev:'high',name:'Brand Impersonation',detail:'Domain structure mimics trusted brand: '+impersonated.join(', ')+' — but isn\'t their real domain.'}); }

  if(u.includes('@')){ score+=30; flags.push({sev:'high',name:'@ Symbol in URL',detail:'Causes browsers to ignore text before the @ symbol.'}); }
  const shorteners=['bit.ly','tinyurl.com','t.co','goo.gl','is.gd','ow.ly'];
  if(shorteners.some(function(s){ return domain.includes(s); })){ score+=15; flags.push({sev:'medium',name:'URL Shortener',detail:'The real destination is hidden.'}); }

  if(/\.(pdf|doc|docx|xls|jpg|png)\.(exe|scr|bat|js|vbs|jar)$/i.test(path)){ score+=35; flags.push({sev:'high',name:'Double File Extension',detail:'File appears disguised as a document/image but is actually executable.'}); }
  if(/[?&](url|redirect|redir|next|goto|return)=/i.test(u)){ score+=10; flags.push({sev:'medium',name:'Open Redirect Parameter',detail:'URL contains a parameter that may redirect elsewhere after the trusted domain loads.'}); }
  if((u.match(/%[0-9A-Fa-f]{2}/g)||[]).length>5){ score+=10; flags.push({sev:'medium',name:'Heavy URL Encoding',detail:'Unusually high amount of percent-encoding, often used to obscure a real destination.'}); }

  score=Math.min(score,100);
  if(!flags.length) flags.push({sev:'low',name:'No Issues Found',detail:'No suspicious patterns detected.'});
  let verdict;
  if(score>=70) verdict='This URL shows multiple strong indicators of phishing. Do NOT visit.';
  else if(score>=40) verdict='This URL has suspicious characteristics. Proceed with caution.';
  else verdict='This URL appears safe based on heuristic analysis.';
  return {score,flags,verdict,domain,fullUrl:u};
}

// Calls our Vercel serverless function, which holds the Google Safe Browsing key server-side.
// Fails gracefully — the heuristic score above always works standalone.
async function checkURLSafeBrowsing(url){
  try{
    const res = await fetch('/api/checkurl?url='+encodeURIComponent(url));
    if(!res.ok) return {checked:false};
    const data = await res.json();
    return {checked:true, malicious: !!data.malicious, threatTypes: data.threatTypes||[]};
  }catch(e){ return {checked:false}; }
}

// ============ PASSWORD CHECKER (with added pattern detection) ============
const COMMON_PASSWORDS=['password','123456','12345678','qwerty','abc123','password1','111111','iloveyou','admin','welcome','monkey','dragon','letmein','trustno1','sunshine'];
const KEYBOARD_ROWS=['qwertyuiop','asdfghjkl','zxcvbnm','1234567890'];
function checkPassword(pw){
  let score=0; const suggestions=[]; const warnings=[];
  const len=pw.length;
  if(len>=16) score+=30; else if(len>=12) score+=22; else if(len>=8) score+=12; else score+=2;
  if(len<12) suggestions.push('Use at least 12 characters — length matters more than complexity.');
  const hasLower=/[a-z]/.test(pw), hasUpper=/[A-Z]/.test(pw), hasDigit=/\d/.test(pw), hasSymbol=/[^a-zA-Z0-9]/.test(pw);
  const variety=[hasLower,hasUpper,hasDigit,hasSymbol].filter(Boolean).length;
  score += variety*10;
  if(!hasUpper) suggestions.push('Add an uppercase letter.');
  if(!hasSymbol) suggestions.push('Add a symbol (!@#$ etc).');
  const charsetSize=(hasLower?26:0)+(hasUpper?26:0)+(hasDigit?10:0)+(hasSymbol?32:0)||1;
  const entropy=len*Math.log2(charsetSize);
  score += Math.min(entropy/4,20);
  if(COMMON_PASSWORDS.includes(pw.toLowerCase())){ score=Math.min(score,10); warnings.push('This is one of the most commonly used passwords in the world.'); }
  if(KEYBOARD_ROWS.some(function(row){ return row.includes(pw.toLowerCase()) || row.split('').reverse().join('').includes(pw.toLowerCase()); })){ warnings.push('Contains a keyboard-walk pattern (e.g. qwerty, asdf) — trivial to guess.'); score=Math.max(score-15,5); }
  if(/(.)\1{2,}/.test(pw)){ warnings.push('Contains repeated characters (e.g. aaa, 111).'); score=Math.max(score-10,5); }
  // Sequential run detection (ascending or descending), general — not just literal substrings
  let seqFound=false;
  for(let i=0;i<pw.length-3 && !seqFound;i++){
    const a=pw.charCodeAt(i),b=pw.charCodeAt(i+1),c=pw.charCodeAt(i+2),d=pw.charCodeAt(i+3);
    if((b-a===1 && c-b===1 && d-c===1) || (a-b===1 && b-c===1 && c-d===1)) seqFound=true;
  }
  if(seqFound){ warnings.push('Contains a sequential run of characters (e.g. abcd, 4321) — easy to guess.'); score=Math.max(score-15,5); }
  // Keyboard-adjacency beyond literal "qwerty" (checks any 4+ char substring against keyboard rows)
  let keyAdj=false;
  const lower=pw.toLowerCase();
  KEYBOARD_ROWS.forEach(function(row){
    for(let i=0;i<row.length-3;i++){
      const chunk=row.substring(i,i+4);
      if(lower.includes(chunk)) keyAdj=true;
    }
  });
  if(keyAdj && !warnings.some(function(w){ return w.includes('keyboard-walk'); })){ warnings.push('Contains a keyboard-adjacent sequence (e.g. asdf, 1qaz) — a common attacker guess.'); score=Math.max(score-12,5); }
  // Common word + trailing year/number pattern
  if(/^[A-Za-z]{4,}(19|20)\d{2}[!@#$%^&*]?$/.test(pw) || /^[A-Za-z]{4,}\d{2,4}[!@#$%^&*]?$/.test(pw)){
    warnings.push('Follows a common "word + number/year" pattern — often the first thing attackers try, even though it looks complex.');
    score=Math.max(score-12,5);
  }
  score=Math.min(Math.round(score),100);
  let level;
  if(score>=80) level='Very Strong'; else if(score>=60) level='Strong'; else if(score>=40) level='Fair'; else if(score>=20) level='Weak'; else level='Very Weak';
  if(!suggestions.length && level!=='Very Strong') suggestions.push('Consider a longer passphrase of random unrelated words for maximum strength.');
  return {score,level,entropy,len,suggestions,warnings};
}

// ============ EMAIL VERIFIER (with added checks + MX lookup) ============
const DISPOSABLE_DOMAINS=['mailinator.com','tempmail.com','guerrillamail.com','10minutemail.com','throwawaymail.com','yopmail.com','trashmail.com','getnada.com','maildrop.cc','sharklasers.com','dispostable.com','fakeinbox.com','mintemail.com','tempinbox.com','moakt.com','emailondeck.com','mytemp.email'];
const ROLE_LOCAL_PARTS=['admin','administrator','support','noreply','no-reply','info','contact','sales','help','webmaster','postmaster','abuse'];
function checkEmail(email){
  const checks=[]; let riskPoints=0;
  const formatOk=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  checks.push({name:'Format Validity',pass:formatOk,detail:formatOk?'Valid email format.':'Not a valid email format.'});
  if(!formatOk) return {risk:'high',checks,verdict:'Invalid email format.'};
  const parts=email.split('@'); const local=parts[0].toLowerCase(); const domain=parts[1].toLowerCase();
  const isDisposable=DISPOSABLE_DOMAINS.some(function(d){ return domain===d || domain.endsWith('.'+d); });
  checks.push({name:'Disposable Domain',pass:!isDisposable,detail:isDisposable?'This is a known temporary/throwaway email service.':'Not a recognized disposable email provider.'});
  if(isDisposable) riskPoints+=40;
  const isRole=ROLE_LOCAL_PARTS.includes(local);
  checks.push({name:'Role-Based Address',pass:!isRole,detail:isRole?'This looks like a shared role address (e.g. support@), not a personal inbox.':'Appears to be a personal address, not role-based.'});
  if(isRole) riskPoints+=10;
  const hasPlus=local.includes('+');
  const plusSuffix=hasPlus?local.split('+')[1]:'';
  const looksAbusive=hasPlus && /^\d{2,}$/.test(plusSuffix);
  checks.push({name:'Plus-Addressing Pattern',pass:!looksAbusive,detail:looksAbusive?'Uses "+" with a numeric suffix — a pattern often used to mass-create accounts from one inbox.':(hasPlus?'Uses "+" addressing, a normal email feature.':'No plus-addressing detected.')});
  if(looksAbusive) riskPoints+=15;
  const randomLocal=/^[a-z0-9]{10,}$/.test(local) && !/[aeiou]{1}[a-z]{1}[aeiou]/.test(local) && (local.match(/[0-9]/g)||[]).length>=3;
  checks.push({name:'Random-Looking Address',pass:!randomLocal,detail:randomLocal?'Local part looks auto-generated (random letters/numbers) rather than human-chosen.':'Local part looks human-chosen.'});
  if(randomLocal) riskPoints+=15;
  const suspTlds=['.tk','.ml','.ga','.cf','.gq'];
  const badTld=suspTlds.some(function(t){ return domain.endsWith(t); });
  checks.push({name:'Domain TLD',pass:!badTld,detail:badTld?'Domain uses a free TLD commonly abused for spam/fake accounts.':'Domain TLD looks normal.'});
  if(badTld) riskPoints+=15;
  const risk = riskPoints>=40?'high':riskPoints>=15?'medium':'low';
  const verdict = risk==='high' ? 'This email shows strong signs of being disposable or fake.' : risk==='medium' ? 'This email has some suspicious characteristics.' : 'This email appears legitimate based on available checks.';
  return {risk,checks,verdict,domain};
}
async function checkEmailMX(domain){
  try{
    const res=await fetch('/api/checkmx?domain='+encodeURIComponent(domain));
    if(!res.ok) return {checked:false};
    const data=await res.json();
    return {checked:true, hasMX: !!data.hasMX};
  }catch(e){ return {checked:false}; }
}

// ============ EMAIL HEADER ANALYZER (with display-name spoof + return-path) ============
function analyzeEmailHeaders(raw){
  const findings=[]; let risk=0;
  const getHeader=function(name){ const m=raw.match(new RegExp('^'+name+':\\s*(.+)$','im')); return m?m[1].trim():null; };
  const from=getHeader('From'); const replyTo=getHeader('Reply-To'); const returnPath=getHeader('Return-Path');
  const subject=getHeader('Subject'); const authResults=getHeader('Authentication-Results');
  const parsed={};
  if(from) parsed['From']=from;
  if(replyTo) parsed['Reply-To']=replyTo;
  if(returnPath) parsed['Return-Path']=returnPath;
  if(subject) parsed['Subject']=subject;

  const extractDomain=function(headerVal){ if(!headerVal) return null; const m=headerVal.match(/@([a-zA-Z0-9.-]+)/); return m?m[1].toLowerCase():null; };
  const fromDomain=extractDomain(from);
  const replyDomain=extractDomain(replyTo);
  const returnDomain=extractDomain(returnPath);

  if(authResults){
    const spf=/spf=(\w+)/i.exec(authResults); const dkim=/dkim=(\w+)/i.exec(authResults); const dmarc=/dmarc=(\w+)/i.exec(authResults);
    if(spf){ const pass=spf[1].toLowerCase()==='pass'; findings.push({sev:pass?'low':'high',name:'SPF',detail:'SPF result: '+spf[1]}); if(!pass) risk+=25; }
    if(dkim){ const pass=dkim[1].toLowerCase()==='pass'; findings.push({sev:pass?'low':'high',name:'DKIM',detail:'DKIM result: '+dkim[1]}); if(!pass) risk+=25; }
    if(dmarc){ const pass=dmarc[1].toLowerCase()==='pass'; findings.push({sev:pass?'low':'medium',name:'DMARC',detail:'DMARC result: '+dmarc[1]}); if(!pass) risk+=20; }
  } else {
    findings.push({sev:'medium',name:'Authentication Results',detail:'No Authentication-Results header found — cannot verify SPF/DKIM/DMARC.'});
    risk+=10;
  }

  if(fromDomain && replyDomain && fromDomain!==replyDomain){
    findings.push({sev:'high',name:'Reply-To Mismatch',detail:'From domain ('+fromDomain+') differs from Reply-To domain ('+replyDomain+') — replies go somewhere unexpected.'});
    risk+=25;
  }
  if(fromDomain && returnDomain && fromDomain!==returnDomain){
    findings.push({sev:'high',name:'Return-Path Mismatch',detail:'From domain ('+fromDomain+') differs from Return-Path domain ('+returnDomain+') — bounce/spoofing signal.'});
    risk+=20;
  }
  // Display-name spoofing: friendly name claims a brand but the domain doesn't match it
  if(from){
    const nameMatch=from.match(/^"?([^"<]+)"?\s*<.*>$/);
    const displayName=nameMatch?nameMatch[1].trim().toLowerCase():'';
    const knownBrands=['paypal','google','microsoft','apple','amazon','bank','support','security'];
    const claimedBrand=knownBrands.find(function(b){ return displayName.includes(b); });
    if(claimedBrand && fromDomain && !fromDomain.includes(claimedBrand)){
      findings.push({sev:'high',name:'Display-Name Spoofing',detail:'Sender name claims to be "'+claimedBrand+'" but the actual address domain ('+fromDomain+') doesn\'t match.'});
      risk+=30;
    }
  }
  if(subject){
    const phishWords=['urgent','verify','suspended','act now','password expired','click here'];
    const hit=phishWords.filter(function(w){ return subject.toLowerCase().includes(w); });
    if(hit.length){ findings.push({sev:'medium',name:'Phishing-style Subject',detail:'Subject contains: '+hit.join(', ')}); risk+=10; }
  }
  risk=Math.min(risk,100);
  const verdict = risk>=60?'Strong signs of spoofing or authentication failure — treat this email as untrusted.' : risk>=30?'Some suspicious signals — verify through another channel before trusting this email.' : 'No major red flags found in these headers.';
  if(!findings.length) findings.push({sev:'low',name:'No Issues Found',detail:'Headers look normal.'});
  return {risk_score:risk, findings, parsed, verdict};
}

// ============ IP LOOKUP (validation + risk framing + reverse DNS) ============
function isValidIPv4(ip){ return /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(ip) && ip.split('.').every(function(o){ return parseInt(o)<=255; }); }
async function lookupIP(ip){
  if(!isValidIPv4(ip.trim())) return {success:false, error:'That doesn\'t look like a valid IPv4 address (e.g. 8.8.8.8).'};
  try{
    const res=await fetch('https://ipwho.is/'+encodeURIComponent(ip.trim()));
    const data=await res.json();
    if(!data.success) return {success:false, error:data.message||'Lookup failed.'};
    let hostname='—';
    try{
      const rev=ip.trim().split('.').reverse().join('.')+'.in-addr.arpa';
      const dnsRes=await fetch('https://dns.google/resolve?name='+rev+'&type=PTR');
      const dnsData=await dnsRes.json();
      if(dnsData.Answer && dnsData.Answer.length) hostname=dnsData.Answer[0].data;
    }catch(e){}
    let riskNote='No proxy/VPN signals detected — this appears to be a direct residential or business connection.';
    if(data.connection && data.connection.isp && /vpn|proxy|hosting|cloud/i.test(data.connection.isp)) riskNote='This IP belongs to a hosting/VPN-style provider — the real origin of any traffic from it may be masked.';
    if(data.security && (data.security.proxy || data.security.vpn)) riskNote='This IP is flagged as a known proxy/VPN exit — the real origin may be hidden.';
    return {
      success:true, ip:data.ip, country:data.country, city:data.city, region:data.region,
      isp:(data.connection&&data.connection.isp)||'Unknown', org:(data.connection&&data.connection.org)||'Unknown',
      timezone:(data.timezone&&data.timezone.id)||'Unknown',
      mobile:!!(data.type==='mobile'), proxy:!!(data.security&&(data.security.proxy||data.security.vpn)),
      hostname, riskNote
    };
  }catch(e){ return {success:false, error:'Lookup failed — network error.'}; }
}

// ============ BROWSER FINGERPRINT CHECKER ============
function getBrowserFingerprint(){
  const nav=navigator;
  const data={
    userAgent: nav.userAgent,
    language: nav.language,
    languages: (nav.languages||[]).join(', '),
    platform: nav.platform,
    screen: screen.width+'×'+screen.height+' @ '+ (window.devicePixelRatio||1)+'x',
    colorDepth: screen.colorDepth+'-bit',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cores: nav.hardwareConcurrency||'Unknown',
    touch: ('ontouchstart' in window) ? 'Yes' : 'No',
    cookiesEnabled: nav.cookieEnabled ? 'Yes' : 'No',
  };
  let canvasSig='unavailable';
  try{
    const canvas=document.createElement('canvas'); canvas.width=200; canvas.height=40;
    const ctx=canvas.getContext('2d');
    ctx.textBaseline='top'; ctx.font='14px Arial'; ctx.fillStyle='#f60'; ctx.fillRect(0,0,100,20);
    ctx.fillStyle='#069'; ctx.fillText('NEXUS fingerprint 🔒',2,2);
    canvasSig=canvas.toDataURL().slice(-32);
  }catch(e){}
  data.canvasSignature=canvasSig;
  // Rough uniqueness estimate: combine entropy-ish signal count into a plausibility bucket
  const signals=[data.userAgent,data.screen,data.timezone,data.cores,canvasSig,data.languages].filter(Boolean).length;
  const estimate = signals>=6 ? '~1 in 100,000+ browsers' : signals>=4 ? '~1 in 10,000+ browsers' : '~1 in 1,000+ browsers';
  return {data, uniquenessEstimate:estimate};
}

// ============ ENCRYPTION PLAYGROUND ============
function xorCipher(text, key){
  let out='';
  for(let i=0;i<text.length;i++) out += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i%key.length));
  return out;
}
function xorToHex(text,key){ return xorCipher(text,key).split('').map(function(c){ return c.charCodeAt(0).toString(16).padStart(2,'0'); }).join(' '); }
const SUBST_KEY = 'QWERTYUIOPASDFGHJKLZXCVBNM';
function substitutionCipher(text){
  return text.toUpperCase().replace(/[A-Z]/g, function(ch){ return SUBST_KEY[ch.charCodeAt(0)-65]; });
}

// ============ CAESAR CRACKER (Game) — expanded bank, random shifts, 10 rounds ============
const CIPHER_WORDS=['FIREWALL','PASSWORD','MALWARE','PHISHING','ENCRYPT','NETWORK','FIREWALL','ROUTER','ANTIVIRUS','BACKDOOR','SPYWARE','TROJAN','KEYLOGGER','BOTNET','RANSOM','FIREBASE','GATEWAY','PROTOCOL','SANDBOX','TOKEN','BREACH','EXPLOIT','PATCH','SESSION','COOKIE','CIPHER','DECRYPT','HACKER','SERVER','DOMAIN'];
function makeCipherRounds(n){
  const words=pickWords(CIPHER_WORDS, n+1);
  return words.map(function(word,i){
    const shift = i===0 ? 3 : 2+Math.floor(Math.random()*20);
    const encoded = caesarCipher(word, shift, 'encrypt');
    return {
      prompt: encoded, answer: word, shift: shift,
      hintText: 'Shift is '+shift+'. Try shifting each letter back by '+shift+' positions in the alphabet.',
      explain: '"'+word+'" shifted by '+shift+' becomes "'+encoded+'". Shift each letter back by '+shift+' to decode.'
    };
  });
}

// ============ MORSE RUSH (Game) — expanded bank + reference chart ============
const MORSE_WORD_BANK=['SAFE','LOCK','RISK','SCAM','HELP','SPAM','CODE','DATA','LEAK','TRAP','WIFI','VIRUS','CLOUD','LOGIN','ADMIN','TOKEN','PATCH','CYBER','ALERT','GUARD','PROXY','WORM','HASH','BREACH','FRAUD'];
function makeMorseRounds(n){
  const words=pickWords(MORSE_WORD_BANK, n+1);
  words[0]='SOS';
  return words.map(function(word){
    return {
      prompt: textToMorse(word), answer: word,
      hintText: 'First letter: "'+word[0]+'" = '+ (MORSE_MAP[word[0]]||''),
      explain: '"'+word+'" in Morse is "'+textToMorse(word)+'".'
    };
  });
}

// ============ BINARY BLITZ (Game) — riddle-clue system instead of raw ASCII ============
const RIDDLE_BANK=[
  {riddle:'What do you do at a green light?',answer:'GO'},
  {riddle:'What do you call your mother\'s brother?',answer:'UNCLE'},
  {riddle:'What do bees make?',answer:'HONEY'},
  {riddle:'What barks and wags its tail?',answer:'DOG'},
  {riddle:'What do you sleep in at night?',answer:'BED'},
  {riddle:'What flies in the sky and has feathers?',answer:'BIRD'},
  {riddle:'What has a screen and a keyboard?',answer:'LAPTOP'},
  {riddle:'What do you open with a key?',answer:'DOOR'},
  {riddle:'What is frozen water called?',answer:'ICE'},
  {riddle:'What color is the sky on a clear day?',answer:'BLUE'},
  {riddle:'What do you use to see in the dark?',answer:'LAMP'},
  {riddle:'What animal says "meow"?',answer:'CAT'},
  {riddle:'What do you wear on your feet?',answer:'SHOES'},
  {riddle:'What rises in the east every morning?',answer:'SUN'},
  {riddle:'What do you use to unlock your phone?',answer:'PIN'},
];
function makeBinaryRounds(n){
  const pool=RIDDLE_BANK.slice();
  const picked=[];
  for(let i=0;i<n+1 && pool.length;i++){ picked.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]); }
  picked[0]={riddle:'What do you say when you answer a call?',answer:'HI'};
  return picked.map(function(r){
    const bin=textToBinary(r.answer);
    const firstByte=bin.split(' ')[0];
    return {
      prompt: bin, riddle: r.riddle, answer: r.answer,
      hintText: 'First letter: "'+r.answer[0]+'" ('+firstByte+' in binary).',
      explain: '"'+r.answer+'" in binary is "'+bin+'" — each letter becomes one 8-digit byte.'
    };
  });
}

// ============ CRACK THE CODE (Game) — multi-round, expanded bank, guess limit ============
const CRACK_PHRASES=['the quick brown fox jumps over the lazy dog','security is not a product but a process','knowledge is power and power is knowledge','never trust always verify zero trust model','encrypt everything decrypt when needed only','strong passwords protect weak memories','patch early patch often stay ahead of attackers','awareness is the first line of defense','a chain is only as strong as its weakest link','think before you click every single time'];
function generateCrackRounds(n){
  const phrases=pickWords(CRACK_PHRASES, n);
  return phrases.map(function(phrase){
    const shift=3+Math.floor(Math.random()*20);
    return {phrase, shift, encrypted: caesarCipher(phrase, shift, 'encrypt')};
  });
}

// ============ PHISHING DETECTIVE (Game) — fixed position bug, expanded, categories ============
const PHISHING_ROUNDS=[
  {category:'Banking', urls:['https://www.hdfcbank.com/personal/login','https://hdfcbank-secure-verify.tk/login','https://netbanking.hdfcbank.com'], fakeIdx:1, explanation:'The real domain is hdfcbank.com — "hdfcbank-secure-verify.tk" is a lookalike on a suspicious free TLD.'},
  {category:'Banking', urls:['https://accounts.google.com/signin','https://google.com.verify-account.info/signin','https://myaccount.google.com'], fakeIdx:1, explanation:'The actual domain is whatever comes right before ".com" — here it\'s "verify-account.info", not google.com.'},
  {category:'Delivery', urls:['https://track.fedex.com/shipment','https://fedex-redelivery-support.com/track','https://www.fedex.com/en-us/tracking.html'], fakeIdx:1, explanation:'Real FedEx tracking lives on fedex.com. The extra words before ".com" are the real (fake) domain here.'},
  {category:'Delivery', urls:['https://www.indiapost.gov.in/track','https://indiapost-parcel-pending.xyz/pay','https://www.indiapost.gov.in'], fakeIdx:1, explanation:'Government sites use .gov.in. A .xyz domain claiming to be India Post is a major red flag.'},
  {category:'Social Media', urls:['https://facebook-account-recovery.tk/verify','https://www.facebook.com/login','https://m.facebook.com'], fakeIdx:0, explanation:'facebook-account-recovery.tk is not facebook.com — it just contains the word "facebook" to look convincing.'},
  {category:'Social Media', urls:['https://instagram.com/accounts/login','https://help-instagram-verify.support/login','https://www.instagram.com'], fakeIdx:1, explanation:'The real domain must end in instagram.com — "help-instagram-verify.support" is an unrelated domain.'},
  {category:'Government', urls:['https://incometax.gov.in/iec/foportal','https://incometax-refund-status.click/claim','https://www.incometax.gov.in'], fakeIdx:1, explanation:'Indian government tax sites use .gov.in exclusively — a ".click" domain is never legitimate for this.'},
  {category:'Payments', urls:['https://paytm-cashback-claim.tk/offer','https://paytm.com','https://business.paytm.com'], fakeIdx:0, explanation:'Real Paytm domains end in paytm.com. A ".tk" domain with "paytm" in the name is impersonation.'},
  {category:'Banking', urls:['https://www.onlinesbi.sbi/login','https://sbi-kyc-update-online.info/verify','https://retail.onlinesbi.sbi'], fakeIdx:1, explanation:'SBI\'s real domains use "sbi" as part of a verified structure — a separate .info domain claiming KYC update is a classic scam.'},
  {category:'Delivery', urls:['https://www.dhl.com/in-en/home/tracking','https://dhl-parcel-fee-due.top/pay','https://mydhl.express.dhl'], fakeIdx:1, explanation:'A ".top" domain asking for a "fee" to release a parcel is a very common delivery scam pattern.'},
];
function shuffleUrls(round){
  const urls=round.urls.slice(); const realFake=urls[round.fakeIdx];
  // Fisher-Yates shuffle, then find new fake index
  for(let i=urls.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const tmp=urls[i]; urls[i]=urls[j]; urls[j]=tmp; }
  const newFakeIdx=urls.indexOf(realFake);
  return {urls, fake:newFakeIdx, explanation:round.explanation, category:round.category};
}

// ============ PASSWORD GENERATOR GAME — expanded rules ============
const PW_RULES=[
  {text:'At least 14 characters long', test:function(p){ return p.length>=14; }},
  {text:'At least 2 uppercase letters', test:function(p){ return (p.match(/[A-Z]/g)||[]).length>=2; }},
  {text:'At least 2 numbers', test:function(p){ return (p.match(/\d/g)||[]).length>=2; }},
  {text:'At least 1 special character (!@#$%^&*)', test:function(p){ return /[!@#$%^&*]/.test(p); }},
  {text:'No common words like "password" or "admin"', test:function(p){ return !/password|admin|qwerty|welcome/i.test(p); }},
  {text:'No repeated character 3+ times in a row', test:function(p){ return !/(.)\1{2,}/.test(p); }},
  {text:'Contains both upper AND lower case letters', test:function(p){ return /[a-z]/.test(p) && /[A-Z]/.test(p); }},
  {text:'At least 16 characters long', test:function(p){ return p.length>=16; }},
  {text:'No sequential runs (e.g. abcd, 1234)', test:function(p){
    for(let i=0;i<p.length-3;i++){ const a=p.charCodeAt(i),b=p.charCodeAt(i+1),c=p.charCodeAt(i+2),d=p.charCodeAt(i+3); if(b-a===1&&c-b===1&&d-c===1) return false; }
    return true; }},
  {text:'At least 3 different special characters', test:function(p){ return new Set((p.match(/[^a-zA-Z0-9]/g)||[])).size>=3; }},
  {text:'Does not contain your own name pattern "user" or "test"', test:function(p){ return !/user|test|guest/i.test(p); }},
  {text:'At least 1 digit AND 1 letter', test:function(p){ return /\d/.test(p) && /[a-zA-Z]/.test(p); }},
  {text:'No spaces', test:function(p){ return !/\s/.test(p); }},
  {text:'At least 20 total characters (try a passphrase!)', test:function(p){ return p.length>=20; }},
  {text:'Contains at least 4 unique character types mixed together', test:function(p){ return [/[a-z]/,/[A-Z]/,/\d/,/[^a-zA-Z0-9]/].filter(function(r){ return r.test(p); }).length>=4; }},
];
function getPwRules(n){
  const pool=PW_RULES.slice();
  const out=[];
  for(let i=0;i<n && pool.length;i++){ out.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]); }
  return out;
}
function evalPwGame(pwd, rules){
  const results=rules.map(function(r){ return {rule:r.text, passed:r.test(pwd)}; });
  const passed=results.filter(function(r){ return r.passed; }).length;
  const score=Math.round((passed/rules.length)*100);
  return {results, passed, total:rules.length, score, won: passed===rules.length};
}

// ============ CYBER ESCAPE ROOM — expanded pool + fuzzy matching ============
const ESCAPE_PUZZLES=[
  {title:'PUZZLE: The Locked Terminal',desc:'A message flashes: "KHOOR ZRUOG" — the system log says shift = 3. Decrypt it to proceed.',hint:'Shift each letter BACK by 3 to decrypt a Caesar cipher.',answer:'hello world'},
  {title:'PUZZLE: Identify the Attack',desc:'An attacker calls pretending to be IT support and asks for your password to "fix an urgent issue." What is this technique called?',hint:'It involves fabricating a believable scenario to gain trust.',answer:'pretexting'},
  {title:'PUZZLE: Spot the Phish',desc:'Which is the fake link? A) https://paypal.com/login  B) https://paypa1-secure.tk/login  Type A or B.',hint:'Look closely at the letter substitution and the domain ending.',answer:'b'},
  {title:'PUZZLE: The Weak Password',desc:'What is the single biggest weakness in the password "password123"?',hint:'It appears on nearly every breach wordlist — one specific word is the problem.',answer:'it is a common word'},
  {title:'PUZZLE: Name the Protocol',desc:'Which protocol encrypts web traffic between your browser and a website?',hint:'It\'s the "S" in a familiar 4-letter web protocol.',answer:'https'},
  {title:'PUZZLE: The Suspicious Attachment',desc:'A file is named "invoice.pdf.exe" — what red flag does this show?',hint:'Look at how many extensions the filename actually has.',answer:'double extension'},
  {title:'PUZZLE: The Locked Router',desc:'Your router still uses its factory-set login. What should you change first?',hint:'It\'s the same thing printed on the sticker under every router of this model.',answer:'default password'},
  {title:'PUZZLE: The Urgent Email',desc:'An email demands you act "within 1 hour or your account will be deleted." What psychological tactic is this?',hint:'It\'s the same tactic used in the Social Engineering quiz.',answer:'urgency'},
  {title:'PUZZLE: The Unknown Drive',desc:'You find a USB drive in the parking lot. What should you do with it?',hint:'Never plug an unknown device directly into your computer.',answer:'give it to it security'},
];
function normalizeAnswer(s){ return s.toLowerCase().replace(/[.,!?;:'"]/g,'').replace(/\s+/g,' ').trim(); }
function pickEscapeSet(n){
  const pool=ESCAPE_PUZZLES.slice();
  const out=[];
  for(let i=0;i<n && pool.length;i++){ out.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]); }
  return out;
}

// ============ THREAT TRIAGE (Game) ============
const THREAT_SCENARIOS=[
  {text:'"Hi, this is Microsoft Support. We\'ve detected a virus on your computer and need remote access to fix it."', cat:'social', explain:'Microsoft never cold-calls users about viruses. This is a classic tech-support scam using fabricated urgency.'},
  {text:'An email from "security@paypaI-alerts.com" says your account is locked and asks you to click a link to verify.', cat:'phishing', explain:'Note the domain — "paypaI" uses a capital I instead of lowercase l. Classic phishing typosquat.'},
  {text:'A USB drive found in the office parking lot, unlabeled, plugged into a work computer by a curious employee.', cat:'malware', explain:'Dropped USB drives are a real-world malware delivery method — plugging them in can silently install malicious software.'},
  {text:'Your bank sends an SMS: "Your OTP is 482913. Do not share this with anyone." No action is requested from you.', cat:'legitimate', explain:'This is a standard, legitimate OTP message — it explicitly tells you not to share it and asks nothing of you.'},
  {text:'A LinkedIn message from a "recruiter" offers a high-paying remote job and asks for your bank details to "process onboarding" before any interview.', cat:'social', explain:'Real employers never need banking details before hiring — this exploits excitement and unfamiliarity with normal hiring steps.'},
  {text:'An attachment named "Q3_Report.pdf.exe" arrives from an unknown sender claiming to be a client.', cat:'malware', explain:'The double extension disguises an executable file as a harmless PDF — a common malware delivery trick.'},
  {text:'A text message says "Your package couldn\'t be delivered. Reschedule here: bit.ly/pkg-redeliver-2847"', cat:'phishing', explain:'Shortened links hide the real destination, and unexpected delivery "problems" are a very common phishing lure.'},
  {text:'A caller claiming to be your bank asks you to read out the OTP you just received to "verify your identity."', cat:'social', explain:'Banks never ask you to read out an OTP over the phone — this is a live account-takeover attempt.'},
  {text:'Your company\'s IT department sends a company-wide email about a scheduled maintenance window this weekend, signed by a known name with correct formatting.', cat:'legitimate', explain:'Routine, expected, internally-consistent communication with no urgency or unusual request — this is a normal legitimate email.'},
  {text:'A pop-up claims "Your device is infected! Download this antivirus NOW to fix it" with a countdown timer.', cat:'malware', explain:'Fake antivirus pop-ups with countdown timers are themselves the malware delivery mechanism — the "cleaner" you\'d download is the infection.'},
  {text:'An SMS says "Your Amazon order could not be verified. Update payment info: amaz0n-billing-support.info"', cat:'phishing', explain:'The domain uses a zero instead of "o" and isn\'t amazon.com at all — a classic typosquat phishing domain.'},
  {text:'A coworker calls to confirm details of a meeting you both already have on your shared calendar.', cat:'legitimate', explain:'Routine coordination about something already mutually known, with no unusual request — nothing suspicious here.'},
];
const THREAT_CATS=[{id:'phishing',label:'Phishing'},{id:'malware',label:'Malware'},{id:'social',label:'Social Engineering'},{id:'legitimate',label:'Legitimate'}];

// ============ RED FLAG HUNTER (Game) ============
const REDFLAG_SCENARIOS=[
  { type:'email',
    zones:[
      {id:'sender', text:'From: "PayPal Security" <support@paypaI-secure-team.info>', flag:true, explain:'Domain "paypaI-secure-team.info" is not paypal.com, and uses a capital I instead of lowercase l.'},
      {id:'subject', text:'Subject: ⚠️ Your account will be suspended in 24 hours', flag:true, explain:'Manufactured urgency with a countdown pressures you to act without thinking.'},
      {id:'greeting', text:'Dear Valued Customer,', flag:true, explain:'Real PayPal emails address you by your actual registered name, not a generic greeting.'},
      {id:'body', text:'We noticed unusual activity on your account. Please confirm your identity to avoid permanent suspension.', flag:false, explain:'This line alone is generic but not inherently a red flag — many legitimate security emails use similar wording.'},
      {id:'button', text:'[ VERIFY MY ACCOUNT NOW ]', flag:true, explain:'The button likely links to a fake login page designed to steal your credentials — never click, go to the site directly instead.'},
      {id:'footer', text:'© 2026 PayPal Inc. All rights reserved.', flag:false, explain:'Footers are trivial to copy exactly — this alone tells you nothing either way.'},
    ]
  },
  { type:'login',
    zones:[
      {id:'urlbar', text:'Address bar: http://accounts-google-verify.com', flag:true, explain:'No HTTPS, and the domain is not google.com — a fake login page.'},
      {id:'logo', text:'[Google logo, slightly stretched]', flag:true, explain:'Copied logos are often slightly distorted or lower resolution than the original.'},
      {id:'emailfield', text:'Email or phone', flag:false, explain:'This is a completely normal login field — not a red flag by itself.'},
      {id:'warning', text:'"This device is not recognized. Verify immediately or lose access."', flag:true, explain:'Real Google login pages don\'t threaten account loss to pressure you into a fake verification.'},
      {id:'signin', text:'[Sign in]', flag:false, explain:'A standard sign-in button — normal on any login page, real or fake.'},
    ]
  },
  { type:'email',
    zones:[
      {id:'sender', text:'From: "Amazon Delivery" <delivery@amaz0n-parcel.support>', flag:true, explain:'Uses a zero instead of "o" in "amazon", and ".support" is not Amazon\'s real domain.'},
      {id:'subject', text:'Subject: Your package could not be delivered', flag:false, explain:'A believable, mundane subject line by itself isn\'t automatically a red flag.'},
      {id:'body', text:'A redelivery fee of ₹49 is required. Pay now to reschedule your delivery within 2 hours.', flag:true, explain:'Legitimate delivery services don\'t charge small "redelivery fees" via email links — this is a common scam pattern.'},
      {id:'button', text:'[ PAY REDELIVERY FEE ]', flag:true, explain:'This button leads to a fake payment page designed to capture your card details.'},
      {id:'tracking', text:'Tracking ID: TBA294857263', flag:false, explain:'A tracking-number-looking string alone proves nothing — real and fake emails both include these.'},
    ]
  },
];

// ============ SCAM CALL SIMULATOR (Game) ============
const SCAMCALL_SCRIPTS=[
  { title:'The "Bank Security" Call',
    nodes:{
      start:{speaker:'Caller', text:'"Hello, this is Priya from your bank\'s security department. We\'ve detected suspicious activity on your account and need to verify your identity immediately."',
        options:[
          {label:'Ask which bank and branch they\'re calling from', next:'verify'},
          {label:'Provide your account number right away', next:'bad1'},
        ]},
      verify:{speaker:'Caller', text:'"I understand your caution, but this is urgent — your account will be frozen in 10 minutes unless we verify now. Can you read me the OTP you just received?"',
        options:[
          {label:'Refuse and hang up — call the bank\'s official number yourself', next:'safe_end'},
          {label:'Read out the OTP to "resolve it quickly"', next:'bad2'},
        ]},
      bad1:{speaker:'Caller', text:'"Perfect, thank you. Now, to verify further, can you read me the one-time password you\'re about to receive by SMS?"',
        options:[
          {label:'Stop and hang up now', next:'safe_end_late'},
          {label:'Read out the OTP', next:'scam_end'},
        ]},
      bad2:{speaker:'System', text:'By reading out the OTP, you would have handed the caller everything needed to complete a transaction or login on your account. Real banks never ask for an OTP over the phone.', options:[], terminal:true, outcome:'scam'},
      safe_end:{speaker:'System', text:'Correct instinct. Real banks never threaten to freeze your account in minutes, and never ask you to read an OTP aloud. Hanging up and calling the verified number yourself is exactly right.', options:[], terminal:true, outcome:'safe'},
      safe_end_late:{speaker:'System', text:'You stopped before the OTP was shared — good recovery, though the account number was already given away unnecessarily. Always verify the caller\'s identity before sharing anything.', options:[], terminal:true, outcome:'partial'},
      scam_end:{speaker:'System', text:'The scam succeeded — the OTP you read out could be used to authorize a transaction on your real account within seconds. In a real scenario, this is how accounts actually get drained.', options:[], terminal:true, outcome:'scam'},
    }
  },
  { title:'The "Tech Support" Call',
    nodes:{
      start:{speaker:'Caller', text:'"This is Microsoft Support. We\'ve detected a serious virus sending your data to hackers right now. I need to remote into your computer to fix it."',
        options:[
          {label:'Ask how they got your number and detected this', next:'push'},
          {label:'Allow remote access immediately, it sounds urgent', next:'bad1'},
        ]},
      push:{speaker:'Caller', text:'"Our systems automatically monitor for threats worldwide, ma\'am/sir. Every second we wait, more of your data is being stolen. Please open the remote access app now."',
        options:[
          {label:'Hang up — Microsoft does not make unsolicited calls like this', next:'safe_end'},
          {label:'Give in and open the remote access app', next:'scam_end'},
        ]},
      bad1:{speaker:'System', text:'Once remote access is granted, the "technician" can install real malware, view your files, and access saved passwords — all under the guise of "fixing" a virus that never existed.', options:[], terminal:true, outcome:'scam'},
      safe_end:{speaker:'System', text:'Exactly right. Microsoft, Apple, and similar companies never cold-call you about a virus. Hanging up denies the attacker the access they needed.', options:[], terminal:true, outcome:'safe'},
      scam_end:{speaker:'System', text:'The scam succeeded — remote access tools let the caller install real malware or steal saved credentials directly from your machine.', options:[], terminal:true, outcome:'scam'},
    }
  },
  { title:'The "Government Refund" Call',
    nodes:{
      start:{speaker:'Caller', text:'"This is the Income Tax Department. You are owed a refund of ₹18,400, but we need your bank account and a small processing fee to release it."',
        options:[
          {label:'Point out that refunds never require a fee, and hang up', next:'safe_end'},
          {label:'Provide bank details to claim the refund', next:'bad1'},
        ]},
      bad1:{speaker:'Caller', text:'"Great, now I just need the OTP sent to your registered mobile to complete the transfer."',
        options:[
          {label:'Stop here and hang up', next:'safe_end_late'},
          {label:'Share the OTP to complete the "refund"', next:'scam_end'},
        ]},
      safe_end:{speaker:'System', text:'Correct — government refunds are processed automatically through official portals, never via a phone call asking for a "processing fee."', options:[], terminal:true, outcome:'safe'},
      safe_end_late:{speaker:'System', text:'You stopped before the OTP was shared — good recovery, though your bank details were already given away unnecessarily.', options:[], terminal:true, outcome:'partial'},
      scam_end:{speaker:'System', text:'The scam succeeded — the OTP combined with your bank details is enough to authorize a real transaction against you, not a refund to you.', options:[], terminal:true, outcome:'scam'},
    }
  },
];
