// ============ MAIN APP LOGIC ============
let currentFlashIndex = 0;
let flashAnswers = [];
let flashScore = 0;
let flashKey = '';

// ---------- Custom cursor ----------
const cursor = document.getElementById('crosshair-cursor');
document.addEventListener('mousemove', function(e){
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});
document.addEventListener('mouseover', function(e){
  if(e.target.closest('a,button,.item-card,.explore-box,.nexus-btn,.intro-go-btn,.fc-opt,.fc-pill,.how-to-btn,.numbered-row,.back-btn,.tech-expand,.edu-card,.flip-card')){
    cursor.classList.add('hover');
  }
});
document.addEventListener('mouseout', function(e){
  if(e.target.closest('a,button,.item-card,.explore-box,.nexus-btn,.intro-go-btn,.fc-opt,.fc-pill,.how-to-btn,.numbered-row,.back-btn,.tech-expand,.edu-card,.flip-card')){
    cursor.classList.remove('hover');
  }
});

// ---------- Glitch on load ----------
window.addEventListener('DOMContentLoaded', function(){
  setTimeout(function(){
    const h = document.getElementById('nexus-hero-text');
    if(h) h.classList.add('glitching');
  }, 600);
  buildGuide();
  setupSnapObservers();
  setupFloatingBtns();
  initThemeToggle();
});

// ============ INTERSECTION OBSERVER — re-trigger every time section enters view ============
function setupSnapObservers(){
  // Navbar show/hide
  const landing = document.getElementById('section-landing');
  if(landing){
    const navObs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        const nb = document.getElementById('navbar');
        if(!nb) return;
        if(e.isIntersecting){ nb.classList.remove('visible'); }
        else { nb.classList.add('visible'); }
      });
    }, {threshold: 0.3});
    navObs.observe(landing);
  }

  // Glass boxes — re-trigger every time about section enters
  const aboutSection = document.getElementById('section-about');
  [aboutSection].forEach(function(sec){
    if(!sec) return;
    const boxObs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        const boxes = sec.querySelectorAll('.glass-box, .threat-extra-card, .protect-extra-card');
        if(e.isIntersecting){
          boxes.forEach(function(b){ b.classList.remove('in-view'); });
          setTimeout(function(){
            boxes.forEach(function(b, i){
              setTimeout(function(){ b.classList.add('in-view'); }, i * 120);
            });
          }, 60);
        } else {
          boxes.forEach(function(b){ b.classList.remove('in-view'); });
        }
      });
    }, {threshold: 0.15});
    boxObs.observe(sec);
  });

  // (Stats count-up removed along with the old stats section — nothing left to animate here)

  // Explore boxes — re-trigger every time
  const exploreSection = document.getElementById('section-explore');
  if(exploreSection){
    const expObs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        const boxes = exploreSection.querySelectorAll('.explore-box, .explore-extra');
        if(e.isIntersecting){
          boxes.forEach(function(b){ b.classList.remove('exp-in'); });
          setTimeout(function(){
            boxes.forEach(function(b, i){
              setTimeout(function(){ b.classList.add('exp-in'); }, i * 100);
            });
          }, 60);
        } else {
          boxes.forEach(function(b){ b.classList.remove('exp-in'); });
        }
      });
    }, {threshold: 0.15});
    expObs.observe(exploreSection);
  }
}

// ---------- Floating quick-access buttons ----------
function setupFloatingBtns(){
  const floatHtml = '<div id="floatBtns" class="float-btns hidden">' +
    '<div class="float-btn" data-go="threats" title="Threats">⚠️</div>' +
    '<div class="float-btn" data-go="learn" title="Learn">💡</div>' +
    '</div>';
  document.body.insertAdjacentHTML('beforeend', floatHtml);

  const floatSection = document.getElementById('section-nexushas');
  if(floatSection){
    const fbObs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        const fb = document.getElementById('floatBtns');
        if(!fb) return;
        if(e.isIntersecting) fb.classList.remove('hidden');
        else fb.classList.add('hidden');
      });
    }, {threshold: 0.1});
    fbObs.observe(floatSection);
  }
}

// ============ BUILD FUNCTIONS ============
function buildGuide(){
  const el = document.getElementById('guide-grid');
  if(!el) return;
  const steps = [
    {text:'<b>Pick a category</b> from the navbar — Tools, Quizzes, or Games — or jump straight to one from the "What NEXUS Has" section above.'},
    {text:'<b>Tap any card</b> to see a short intro explaining what it does and why it matters, then open the tool/quiz/game itself.'},
    {text:'<b>Tools give instant results</b> the moment you enter something — no waiting, no signup, nothing saved.'},
    {text:'<b>Quizzes and games track your score</b> as you go, with an explanation after every answer so you learn either way.'},
    {text:'<b>Stuck on how something works?</b> Every single item has its own "How It Works" panel — look for the expandable section on that page.'},
    {text:'<b>Nothing you type is stored.</b> URLs, passwords, and emails you check are analyzed entirely in your browser or via a one-off request — never logged.'},
    {text:'<b>Toggle dark/light mode</b> anytime from the navbar if you prefer reading in a brighter theme.'},
  ];
  el.innerHTML = steps.map(function(s,i){
    return '<div class="guide-row"><div class="guide-num">'+(i+1)+'</div><div class="guide-text">'+s.text+'</div></div>';
  }).join('');
}

// ---------- Dark / Light mode toggle ----------
function initThemeToggle(){
  const saved = localStorage.getItem('nexus-theme');
  if(saved === 'light') applyTheme('light');
  document.querySelectorAll('.theme-toggle').forEach(function(btn){
    btn.addEventListener('click', function(){
      const isLight = document.body.classList.contains('light-mode');
      applyTheme(isLight ? 'dark' : 'light');
    });
  });
}
function applyTheme(mode){
  document.body.classList.toggle('light-mode', mode==='light');
  document.querySelectorAll('.theme-toggle').forEach(function(btn){ btn.textContent = mode==='light' ? '☀️' : '🌙'; });
  try{ localStorage.setItem('nexus-theme', mode); }catch(e){}
}

// ---------- Keyboard accessibility for dynamically-rendered clickable divs ----------
function enhanceKeyboardAccess(root){
  (root||document).querySelectorAll('.nexus-btn, .fc-opt, .explore-box, .item-card, .learn-card, .redflag-zone, [data-go], [data-page], [data-section]').forEach(function(el){
    if(!el.hasAttribute('tabindex')) el.setAttribute('tabindex','0');
    if(!el.hasAttribute('role')) el.setAttribute('role','button');
  });
}
document.addEventListener('keydown', function(e){
  if(e.key !== 'Enter' && e.key !== ' ') return;
  const el = e.target.closest('.nexus-btn, .fc-opt, .explore-box, .item-card, .learn-card, .redflag-zone, [data-go], [data-page], [data-section], .theme-toggle');
  if(!el) return;
  e.preventDefault();
  el.click();
});
// Re-scan for new interactive elements whenever the DOM changes (content is rendered dynamically throughout the app)
new MutationObserver(function(){ enhanceKeyboardAccess(document); }).observe(document.body, {childList:true, subtree:true});


// ============ ROUTING ============
const dashboardRoot = document.getElementById('dashboard-root');
const appRoot = document.getElementById('app-root');
const appContent = document.getElementById('app-content');

function showDashboard(){
  dashboardRoot.classList.remove('hidden');
  appRoot.classList.add('hidden');
  document.getElementById('floatBtns') && document.getElementById('floatBtns').classList.add('hidden');
}

function showApp(html, sectionForNav){
  dashboardRoot.classList.add('hidden');
  appRoot.classList.remove('hidden');
  appContent.innerHTML = html;
  appNav(sectionForNav);
  window.scrollTo(0,0);
  attachDynamicHandlers();
  document.getElementById('floatBtns') && document.getElementById('floatBtns').classList.add('hidden');
}

function navigate(route){
  if(route === 'home'){ showDashboard(); return; }
  if(route === 'tools' || route === 'quizzes' || route === 'games'){
    showApp(renderSectionPage(route), route); return;
  }
  if(route === 'threats'){
    showApp(renderThreatsPage(), 'threats'); return;
  }
  if(route === 'learn'){
    showApp(renderLearnPage(), 'learn'); return;
  }
  if(route.indexOf('intro-') === 0){
    const key = route.replace('intro-','');
    showApp(renderIntro(key), ITEMS[key].section); return;
  }
  if(route.indexOf('howto-') === 0){
    const key = route.replace('howto-','');
    showApp(renderHowTo(key), ITEMS[key].section); return;
  }
  if(route.indexOf('open-') === 0){
    const key = route.replace('open-','');
    const it = ITEMS[key];
    if(it.type === 'tool' || it.type === 'game'){
      showApp(renderToolPage(key), it.section);
      initToolPage(key);
    } else if(it.type === 'quiz' || it.type === 'checklist'){
      showApp(renderFlashPage(key), it.section);
      initFlashPage(key);
    }
    return;
  }
  if(route.indexOf('end|') === 0){
    const parts = route.split('|');
    const key = parts[1];
    const score = parts[2] || '';
    showApp(renderEndScreen(key, score), ITEMS[key].section); return;
  }
  if(['about','contact','privacy'].indexOf(route) !== -1){
    showApp(renderStatic(route), null); return;
  }
}

document.addEventListener('click', function(e){
  const goEl = e.target.closest('[data-go]');
  if(goEl){ e.preventDefault(); navigate(goEl.dataset.go); return; }
  const secEl = e.target.closest('[data-section]');
  if(secEl){ e.preventDefault(); navigate(secEl.dataset.section); return; }
  const pageEl = e.target.closest('[data-page]');
  if(pageEl){ e.preventDefault(); navigate(pageEl.dataset.page); return; }
});

// ============ TOOL PAGE INIT ============
function initToolPage(key){
  if(key === 'url'){
    document.getElementById('urlBtn').addEventListener('click', async function(){
      const val = document.getElementById('urlInput').value.trim();
      if(!val) return;
      const r = analyzeURL(val);
      const cls = r.score >= 70 ? 'result-danger' : r.score >= 40 ? 'result-warn' : 'result-safe';
      const label = r.score >= 70 ? 'HIGH RISK' : r.score >= 40 ? 'MEDIUM RISK' : 'LOW RISK';
      let flagsHtml = r.flags.map(function(f){
        return '<div class="finding-row"><b>[' + f.sev.toUpperCase() + ']</b> ' + f.name + ' — ' + f.detail + '</div>';
      }).join('');
      document.getElementById('urlResult').innerHTML =
        '<div class="result-box ' + cls + '"><b>' + label + '</b> — Score: ' + r.score + '/100<br>' + r.verdict + '</div>' +
        '<div id="sbBadge" class="result-box result-info" style="margin-top:10px">Checking Google Safe Browsing...</div>' +
        '<div style="margin-top:14px">' + flagsHtml + '</div>';
      const sb = await checkURLSafeBrowsing(r.fullUrl);
      const badge = document.getElementById('sbBadge');
      if(!badge) return;
      if(!sb.checked){ badge.innerHTML = '⚠️ Google Safe Browsing check unavailable right now — heuristic score above still applies.'; }
      else if(sb.malicious){ badge.className='result-box result-danger'; badge.innerHTML = '🚫 Flagged by Google Safe Browsing as: ' + (sb.threatTypes.join(', ')||'malicious'); }
      else { badge.className='result-box result-safe'; badge.innerHTML = '✅ Not found on Google\'s Safe Browsing known-malicious list.'; }
    });
  }
  if(key === 'password'){
    document.getElementById('pwBtn').addEventListener('click', function(){
      const val = document.getElementById('pwInput').value;
      if(!val) return;
      const r = checkPassword(val);
      const map = {'Very Weak':'result-danger','Weak':'result-danger','Fair':'result-warn','Strong':'result-safe','Very Strong':'result-safe'};
      let sugg = r.suggestions.map(function(s){ return '<div class="finding-row">' + s + '</div>'; }).join('');
      let warn = r.warnings.map(function(s){ return '<div class="finding-row"><b>[WARN]</b> ' + s + '</div>'; }).join('');
      document.getElementById('pwResult').innerHTML =
        '<div class="result-box ' + map[r.level] + '"><b>' + r.level + '</b> — Score: ' + r.score + '/100<br>Length: ' + r.len + ' | Entropy: ' + r.entropy.toFixed(1) + ' bits</div>' +
        (sugg ? '<div style="margin-top:14px"><b style="font-size:12px;color:var(--muted)">SUGGESTIONS</b>' + sugg + '</div>' : '') +
        (warn ? '<div style="margin-top:10px">' + warn + '</div>' : '');
    });
  }
  if(key === 'email'){
    document.getElementById('emBtn').addEventListener('click', async function(){
      const val = document.getElementById('emInput').value.trim();
      if(!val) return;
      const r = checkEmail(val);
      const cls = r.risk === 'high' ? 'result-danger' : r.risk === 'medium' ? 'result-warn' : 'result-safe';
      let checksHtml = r.checks.map(function(c){
        return '<div class="finding-row"><b>[' + (c.pass ? 'PASS' : 'FAIL') + ']</b> ' + c.name + ' — ' + c.detail + '</div>';
      }).join('');
      document.getElementById('emResult').innerHTML =
        '<div class="result-box ' + cls + '"><b>' + r.risk.toUpperCase() + ' RISK</b><br>' + r.verdict + '</div>' +
        '<div id="mxBadge" class="result-box result-info" style="margin-top:10px">Checking mail server...</div>' +
        '<div style="margin-top:14px">' + checksHtml + '</div>';
      if(r.domain){
        const mx = await checkEmailMX(r.domain);
        const badge=document.getElementById('mxBadge');
        if(!badge) return;
        if(!mx.checked){ badge.innerHTML='⚠️ Mail server check unavailable right now.'; }
        else if(mx.hasMX){ badge.className='result-box result-safe'; badge.innerHTML='✅ Domain has a valid mail server (MX record) — it can actually receive mail.'; }
        else { badge.className='result-box result-danger'; badge.innerHTML='🚫 No mail server (MX record) found — this domain cannot receive mail at all.'; }
      }
    });
  }
  if(key === 'headers'){
    document.getElementById('headersBtn').addEventListener('click',function(){
      const val=document.getElementById('headersInput').value.trim();
      if(!val) return;
      const r=analyzeEmailHeaders(val);
      const cls=r.risk_score>=60?'result-danger':r.risk_score>=30?'result-warn':'result-safe';
      let rows=r.findings.map(function(f){ return '<div class="finding-row"><b>['+f.sev.toUpperCase()+']</b> '+f.name+' — '+f.detail+'</div>'; }).join('');
      let parsed=Object.keys(r.parsed).map(function(k){ return '<div class="finding-row"><b>'+k+':</b> '+r.parsed[k]+'</div>'; }).join('');
      document.getElementById('headersResult').innerHTML=
        '<div class="result-box '+cls+'"><b>Risk Score: '+r.risk_score+'/100</b><br>'+r.verdict+'</div>'+
        (parsed?'<div style="margin-top:14px"><b style="font-size:11px;color:var(--muted)">KEY FIELDS</b>'+parsed+'</div>':'')+
        '<div style="margin-top:10px">'+rows+'</div>';
    });
  }
  if(key==='ip'){
    document.getElementById('ipBtn').addEventListener('click',async function(){
      const val=document.getElementById('ipInput').value.trim();
      if(!val) return;
      const ipResEl=document.getElementById('ipResult');
      if(ipResEl) ipResEl.innerHTML='<div class="result-box result-info">Looking up...</div>';
      const r=await lookupIP(val);
      const ipResEl2=document.getElementById('ipResult');
      if(!ipResEl2) return;
      if(r.success){
        ipResEl2.innerHTML=
          '<div class="result-box result-info"><b>'+r.ip+'</b></div>'+
          '<div class="result-box '+(r.proxy?'result-warn':'result-safe')+'" style="margin-top:10px">'+r.riskNote+'</div>'+
          '<div style="margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:10px">'+
          ['Country:'+r.country,'City:'+r.city,'Region:'+r.region,'ISP:'+r.isp,'Org:'+r.org,'Timezone:'+r.timezone,'Hostname:'+r.hostname,'Mobile:'+(r.mobile?'Yes':'No'),'Proxy/VPN:'+(r.proxy?'Yes':'No')].map(function(i){
            const p=i.split(':'); return '<div class="finding-row"><b>'+p[0]+':</b> '+p.slice(1).join(':')+'</div>';
          }).join('')+'</div>';
      } else {
        ipResEl2.innerHTML='<div class="result-box result-danger">'+r.error+'</div>';
      }
    });
  }

  if(key==='forensics'){
    document.getElementById('forensicsBtn').addEventListener('click',async function(){
      const file=document.getElementById('forensicsInput').files[0];
      const resEl=document.getElementById('forensicsResult');
      if(!file){ resEl.innerHTML='<div class="result-box result-warn">Please select an image file.</div>'; return; }
      resEl.innerHTML='<div class="result-box result-info">Analyzing image — extracting EXIF, checking for hidden data, and generating ELA heatmap...</div>';

      let exifHtml='<div class="finding-row">No EXIF metadata found (or library unavailable).</div>';
      try{
        if(window.exifr){
          const exif=await exifr.parse(file);
          if(exif){
            const rows=[];
            if(exif.latitude && exif.longitude) rows.push('<div class="finding-row"><b>[HIGH]</b> GPS Location — '+exif.latitude.toFixed(5)+', '+exif.longitude.toFixed(5)+'</div>');
            if(exif.DateTimeOriginal) rows.push('<div class="finding-row"><b>[MEDIUM]</b> Timestamp — '+exif.DateTimeOriginal+'</div>');
            if(exif.Make||exif.Model) rows.push('<div class="finding-row"><b>[LOW]</b> Camera/Device — '+(exif.Make||'')+' '+(exif.Model||'')+'</div>');
            if(rows.length) exifHtml=rows.join('');
          }
        }
      }catch(e){}

      const img=new Image();
      const reader=new FileReader();
      reader.onload=function(e){
        img.onload=function(){
          const w=img.width, h=img.height;
          const canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
          const ctx=canvas.getContext('2d'); ctx.drawImage(img,0,0);
          const imgData=ctx.getImageData(0,0,w,h).data;

          // Real LSB steganography check: measure bias in least-significant bit of red channel
          let ones=0, total=0;
          for(let i=0;i<imgData.length;i+=4){ if(imgData[i]&1) ones++; total++; }
          const lsbRatio=ones/total;
          const deviation=Math.abs(lsbRatio-0.5);
          const stegoSev = deviation<0.01 ? 'medium' : 'low';
          const stegoNote = deviation<0.01
            ? 'LSB bit distribution is very close to 50/50 ('+(lsbRatio*100).toFixed(2)+'%) — mildly consistent with LSB steganography, though natural photo noise can also produce this. Not conclusive alone.'
            : 'LSB bit distribution shows natural variance ('+(lsbRatio*100).toFixed(2)+'%), typical of an untouched photo.';

          // Real ELA: re-compress via canvas JPEG export, diff against original
          const elaCanvas=document.createElement('canvas'); elaCanvas.width=w; elaCanvas.height=h;
          const elaCtx=elaCanvas.getContext('2d');
          const compressed=new Image();
          compressed.onload=function(){
            const cCanvas=document.createElement('canvas'); cCanvas.width=w; cCanvas.height=h;
            const cCtx=cCanvas.getContext('2d'); cCtx.drawImage(compressed,0,0);
            const cData=cCtx.getImageData(0,0,w,h);
            const origData=ctx.getImageData(0,0,w,h);
            const elaData=elaCtx.createImageData(w,h);
            let maxDiff=0;
            for(let i=0;i<origData.data.length;i+=4){
              const dr=Math.abs(origData.data[i]-cData.data[i]);
              const dg=Math.abs(origData.data[i+1]-cData.data[i+1]);
              const db=Math.abs(origData.data[i+2]-cData.data[i+2]);
              const diff=(dr+dg+db)/3;
              if(diff>maxDiff) maxDiff=diff;
              const amp=Math.min(diff*12,255);
              elaData.data[i]=amp; elaData.data[i+1]=amp; elaData.data[i+2]=amp; elaData.data[i+3]=255;
            }
            elaCtx.putImageData(elaData,0,0);
            const elaUrl=elaCanvas.toDataURL();
            const elaNote = maxDiff>40 ? 'Some regions show notably higher error levels than the rest of the image — worth a closer look for possible editing.' : 'Error levels look fairly uniform across the image — no strong sign of localized editing.';
            const elaImgEl=document.getElementById('elaImg');
            if(elaImgEl){ elaImgEl.src=elaUrl; elaImgEl.style.display='block'; }
            const elaNoteEl=document.getElementById('elaNote');
            if(elaNoteEl) elaNoteEl.textContent=elaNote;
          };
          compressed.src=canvas.toDataURL('image/jpeg',0.85);

          resEl.innerHTML=
            '<div class="result-box result-info"><b>Analysis complete for: '+file.name+'</b><br>Dimensions: '+w+' × '+h+' px</div>'+
            '<div style="margin-top:14px"><b style="font-size:11px;color:var(--muted)">EXIF METADATA</b>'+exifHtml+'</div>'+
            '<div style="margin-top:14px"><b style="font-size:11px;color:var(--muted)">STEGANOGRAPHY CHECK (LSB analysis)</b>'+
            '<div class="finding-row"><b>['+stegoSev.toUpperCase()+']</b> '+stegoNote+'</div></div>'+
            '<div style="margin-top:14px"><b style="font-size:11px;color:var(--muted)">ERROR LEVEL ANALYSIS (ELA) HEATMAP</b>'+
            '<img id="elaImg" style="display:none;max-width:100%;border-radius:8px;margin-top:8px;border:1px solid rgba(255,255,255,.1)">'+
            '<div id="elaNote" class="finding-row">Generating heatmap...</div></div>';
        };
        img.src=e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  if(key==='qr'){
    document.getElementById('qrBtn').addEventListener('click',function(){
      const file=document.getElementById('qrInput').files[0];
      const resEl=document.getElementById('qrResult');
      if(!file){ resEl.innerHTML='<div class="result-box result-warn">Please select an image.</div>'; return; }
      if(!window.jsQR){ resEl.innerHTML='<div class="result-box result-danger">QR decoding library failed to load. Check your connection and try again.</div>'; return; }
      const img=new Image();
      const reader=new FileReader();
      reader.onload=function(e){
        img.onload=function(){
          const canvas=document.createElement('canvas'); canvas.width=img.width; canvas.height=img.height;
          const ctx=canvas.getContext('2d'); ctx.drawImage(img,0,0);
          const imageData=ctx.getImageData(0,0,canvas.width,canvas.height);
          const code=jsQR(imageData.data, imageData.width, imageData.height);
          if(!code){ resEl.innerHTML='<div class="result-box result-warn">No QR code detected in this image. Try a clearer photo.</div>'; return; }
          const val=code.data;
          let contentType='Text', riskNotes=[];
          const lower=val.toLowerCase();
          if(lower.startsWith('http://')||lower.startsWith('https://')||lower.startsWith('www.')){ contentType='URL'; }
          else if(lower.startsWith('upi://')){ contentType='UPI Payment'; riskNotes.push('Verify recipient name and amount carefully before paying.'); }
          else if(lower.startsWith('wifi:')){ contentType='Wi-Fi Network'; riskNotes.push('Only connect to Wi-Fi from trusted sources.'); }
          else if(lower.startsWith('mailto:')){ contentType='Email Address'; }
          else if(lower.startsWith('tel:')){ contentType='Phone Number'; }
          let html='<div class="result-box result-info"><b>Decoded Content ('+contentType+')</b><br><code style="font-size:12px;word-break:break-all">'+val+'</code></div>';
          riskNotes.forEach(function(n){ html+='<div class="finding-row">[WARN] '+n+'</div>'; });
          if(contentType==='URL'){
            const r=analyzeURL(val);
            const cls=r.score>=70?'result-danger':r.score>=40?'result-warn':'result-safe';
            const label=r.score>=70?'HIGH RISK':r.score>=40?'MEDIUM RISK':'LOW RISK';
            html+='<div style="margin-top:14px"><b style="font-size:12px;color:var(--muted)">URL SAFETY CHECK</b></div>'+
              '<div class="result-box '+cls+'"><b>'+label+'</b> — Score: '+r.score+'/100<br>'+r.verdict+'</div>'+
              r.flags.map(function(f){ return '<div class="finding-row"><b>['+f.sev.toUpperCase()+']</b> '+f.name+' — '+f.detail+'</div>'; }).join('');
          }
          resEl.innerHTML=html;
        };
        img.src=e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  if(key==='fingerprint'){
    const fp=getBrowserFingerprint();
    const rows=Object.keys(fp.data).map(function(k){ return '<div class="finding-row"><b>'+k+':</b> '+fp.data[k]+'</div>'; }).join('');
    document.getElementById('fingerprintPanel').innerHTML=
      '<div class="result-box result-warn"><b>Estimated uniqueness: '+fp.uniquenessEstimate+'</b><br>This is how identifiable your browser session is — without a single cookie.</div>'+
      '<div style="margin-top:14px">'+rows+'</div>';
  }

  if(key==='encrypt_playground'){
    document.getElementById('encBtn').addEventListener('click',function(){
      const val=document.getElementById('encInput').value;
      if(!val) return;
      const caesar=caesarCipher(val,3,'encrypt');
      const xorHex=xorToHex(val,'KEY');
      const sub=substitutionCipher(val);
      document.getElementById('encResult').innerHTML=
        '<div class="result-box result-info"><b>Caesar Shift (shift=3)</b><br><code>'+caesar+'</code><br><span style="font-size:11px;color:var(--muted)">Trivial to break — only 25 possible shifts to try.</span></div>'+
        '<div class="result-box result-warn" style="margin-top:10px"><b>XOR Cipher (key="KEY")</b><br><code style="word-break:break-all">'+xorHex+'</code><br><span style="font-size:11px;color:var(--muted)">Unbreakable IF the key is truly random and never reused — reused/weak keys are crackable.</span></div>'+
        '<div class="result-box result-info" style="margin-top:10px"><b>Substitution Cipher</b><br><code>'+sub+'</code><br><span style="font-size:11px;color:var(--muted)">Breakable via letter-frequency analysis — "E" is the most common English letter, a huge clue.</span></div>';
    });
  }

  if(key==='metadata_strip'){
    document.getElementById('metaBtn').addEventListener('click',async function(){
      const file=document.getElementById('metaInput').files[0];
      const resEl=document.getElementById('metaResult');
      if(!file){ resEl.innerHTML='<div class="result-box result-warn">Please select an image.</div>'; return; }
      let exifRows='<div class="finding-row">No identifiable metadata found.</div>';
      try{
        if(window.exifr){
          const exif=await exifr.parse(file);
          if(exif){
            const rows=[];
            if(exif.latitude && exif.longitude) rows.push('<div class="finding-row"><b>GPS:</b> '+exif.latitude.toFixed(5)+', '+exif.longitude.toFixed(5)+'</div>');
            if(exif.DateTimeOriginal) rows.push('<div class="finding-row"><b>Timestamp:</b> '+exif.DateTimeOriginal+'</div>');
            if(exif.Make||exif.Model) rows.push('<div class="finding-row"><b>Device:</b> '+(exif.Make||'')+' '+(exif.Model||'')+'</div>');
            if(rows.length) exifRows=rows.join('');
          }
        }
      }catch(e){}
      const img=new Image();
      const reader=new FileReader();
      reader.onload=function(e){
        img.onload=function(){
          const canvas=document.createElement('canvas'); canvas.width=img.width; canvas.height=img.height;
          const ctx=canvas.getContext('2d'); ctx.drawImage(img,0,0);
          const cleanUrl=canvas.toDataURL('image/jpeg',0.95);
          resEl.innerHTML=
            '<div class="result-box result-warn"><b>Found in your photo:</b></div>'+
            '<div style="margin-top:6px">'+exifRows+'</div>'+
            '<div class="result-box result-safe" style="margin-top:14px">✅ Cleaned version generated — this copy carries none of the metadata above.</div>'+
            '<a href="'+cleanUrl+'" download="cleaned-'+file.name.replace(/\.[^.]+$/,'')+'.jpg" class="nexus-btn" style="margin-top:10px;display:inline-block;text-decoration:none">DOWNLOAD CLEANED PHOTO →</a>';
        };
        img.src=e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  if(key === 'cipher'){ wireCipherGame(); }
  if(key === 'morse'){ wireMorseGame(); }
  if(key === 'binary'){ wireBinaryGame(); }

  if(key === 'crack_code'){ wireCrackCodeGame(); }

  if(key === 'phishing_detect'){ wirePhishingGame(); }

  if(key==='passgen'){ wirePasswordGeneratorGame(); }

  if(key==='escape_room'){ wireEscapeRoomGame(); }

  if(key==='threat_triage'){ wireThreatTriageGame(); }
  if(key==='redflag_hunter'){ wireRedFlagGame(); }
  if(key==='scamcall_sim'){ wireScamCallGame(); }
}

// ============ FLASHCARD ENGINE (all quizzes are MCQ now) ============
function initFlashPage(key){
  flashKey = key; currentFlashIndex = 0; flashAnswers = []; flashScore = 0;
  const it = ITEMS[key];
  let questions = QUIZ_QUESTIONS[key] || [];
  renderFlashCard(key, questions);
}

function renderFlashCard(key, questions){
  const it = ITEMS[key]; const c = COLOR_MAP[it.color];
  const wrap = document.getElementById('flashWrap');
  if(!wrap) return;
  if(currentFlashIndex >= questions.length){
    let scoreText = flashScore + ' / ' + questions.length;
    showApp(renderEndScreen(key, scoreText), it.section); return;
  }
  let progress = '';
  for(let i=0; i<questions.length; i++){
    const bg = i < currentFlashIndex ? c.c : i === currentFlashIndex ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)';
    progress += '<div class="p-segment" style="background:' + bg + '"></div>';
  }
  const item = questions[currentFlashIndex];
  // Shuffle option order every render so the correct answer's position is never predictable/patterned.
  const shuffled = item.opts.map(function(opt,i){ return {text:opt, correct:i===item.a}; });
  for(let i=shuffled.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const tmp=shuffled[i]; shuffled[i]=shuffled[j]; shuffled[j]=tmp; }
  let optionsHtml = '<div class="fc-options">' + shuffled.map(function(opt, i){
    return '<div class="fc-opt" data-idx="' + i + '" style="border-color:' + c.border + '">' + opt.text + '</div>';
  }).join('') + '</div>';
  wrap.innerHTML =
    '<div class="progress-row">' + progress + '</div>' +
    '<div class="card-stack"><div class="flash-card" id="flashCard" style="background:' + c.bg + ';border:0.5px solid ' + c.border + ';">' +
    '<div class="fc-tag" style="color:' + c.c + '">' + it.name + ' — ' + (currentFlashIndex+1) + ' of ' + questions.length + '</div>' +
    '<div class="fc-text">' + item.q + '</div>' + optionsHtml +
    '<div id="fcFeedback"></div></div></div>';

  document.querySelectorAll('.fc-opt').forEach(function(opt){
    opt.addEventListener('click', function(){
      const idx = parseInt(opt.dataset.idx); const correct = shuffled[idx].correct;
      if(correct) flashScore++;
      document.querySelectorAll('.fc-opt').forEach(function(o){ o.style.pointerEvents = 'none'; });
      document.getElementById('fcFeedback').innerHTML =
        '<div class="fc-feedback" style="background:' + (correct ? 'rgba(0,255,136,.08)' : 'rgba(255,56,96,.08)') + ';border-left:3px solid ' + (correct ? '#00ff88' : '#ff3860') + '">' +
        '<b>' + (correct ? 'Correct!' : 'Not quite.') + '</b><div class="fc-explain">' + item.ex + '</div></div>' +
        '<div class="nexus-btn" id="fcNextBtn" style="background:' + c.bg + ';border:0.5px solid ' + c.border + ';color:' + c.c + ';margin-top:16px">NEXT →</div>';
      document.getElementById('fcNextBtn').addEventListener('click', function(){ currentFlashIndex++; renderFlashCard(key, questions); });
    });
  });
}

function attachDynamicHandlers(){
  const techBtn = document.getElementById('techExpandBtn');
  if(techBtn){
    techBtn.addEventListener('click', function(){
      document.getElementById('techContent').classList.toggle('open');
      techBtn.textContent = techBtn.textContent.startsWith('+') ? techBtn.textContent.replace('+','−') : techBtn.textContent.replace('−','+');
    });
  }
}

// ============ THREATS PAGE ============
function renderThreatsPage(){
  return '<div class="page-section">' +
    '<div class="back-btn" data-go="home">← Back to Dashboard</div>' +
    '<div class="section-heading" style="color:var(--c-red)">Threat Landscape</div>' +
    '<p style="color:var(--muted);font-size:15px;max-width:700px;line-height:1.7;margin-bottom:32px">The cyber threat landscape evolves every second. Understanding the threats that exist is the first step to defending against them.</p>' +
    '<div class="threats-grid">' +
    renderThreatCard('🎣','Phishing','The most common attack. Fake emails, links, and websites trick victims into handing over credentials or installing malware.','85% of organizations experienced phishing in 2024') +
    renderThreatCard('💣','Ransomware','Malware that encrypts your files and demands payment for the decryption key. Average ransom demand: $1.54 million.','New ransomware strain every 11 seconds') +
    renderThreatCard('🕵️','Social Engineering','Psychological manipulation — attackers exploit trust, fear, and urgency to bypass technical security entirely.','95% of breaches involve human error') +
    renderThreatCard('🔗','Malware','Malicious software installed without consent — stealing data, recording keystrokes, or providing remote access.','450,000 new malware programs daily') +
    renderThreatCard('🌐','DDoS Attacks','Flooding servers with traffic to take down websites and services — often used as a distraction for deeper attacks.','DDoS attacks up 200% in 2024') +
    renderThreatCard('📱','Mobile Threats','Fake apps, SMS phishing (smishing), and malicious QR codes targeting smartphone users.','60% of digital fraud now via mobile') +
    '</div>' +
    '<div class="threat-protect-cta">' +
    '<div class="cta-title">Protect yourself with NEXUS tools</div>' +
    '<div class="cta-btns"><div class="nexus-btn" data-go="tools">OPEN TOOLS →</div><div class="nexus-btn" style="margin-left:16px" data-go="quizzes">TAKE A QUIZ →</div></div>' +
    '</div>' +
    '</div>';
}
function renderThreatCard(icon, name, desc, stat){
  return '<div class="threat-card">' +
    '<div class="tc-icon">' + icon + '</div>' +
    '<div class="tc-name">' + name + '</div>' +
    '<div class="tc-desc">' + desc + '</div>' +
    '<div class="tc-stat">' + stat + '</div>' +
    '</div>';
}

// ============ LEARN PAGE ============
function renderLearnPage(){
  const topics = [
    {icon:'🔐',title:'Password Security',desc:'Learn what makes a password truly strong — entropy, length, and why complexity alone isn\'t enough.', go:'intro-password'},
    {icon:'🎣',title:'Phishing Awareness',desc:'How to spot fake emails, URLs, and social engineering attempts before they catch you off guard.', go:'intro-phishing_detect'},
    {icon:'📡',title:'Network Security',desc:'Wi-Fi encryption, router settings, VPNs, and how attackers exploit unsecured networks.', go:'intro-wifi_quiz'},
    {icon:'🧠',title:'Social Engineering',desc:'The psychology behind manipulation attacks — why humans are the #1 vulnerability in any system.', go:'intro-social_eng'},
    {icon:'🕸️',title:'The Dark Web',desc:'What the dark web really is, how your data ends up there, and what you can do about it.', go:'intro-darkweb'},
    {icon:'🚨',title:'Incident Response',desc:'What to do when you get hacked — the exact steps to take to minimize damage and recover fast.', go:'intro-incident'},
  ];
  return '<div class="page-section">' +
    '<div class="back-btn" data-go="home">← Back to Dashboard</div>' +
    '<div class="section-heading" style="color:var(--gold)">Learn Cybersecurity</div>' +
    '<p style="color:var(--muted);font-size:15px;max-width:700px;line-height:1.7;margin-bottom:32px">Build real cybersecurity knowledge through interactive quizzes and guided learning modules.</p>' +
    '<div class="learn-grid">' +
    topics.map(function(t){
      return '<div class="learn-card" data-go="' + t.go + '">' +
        '<div class="lc-icon">' + t.icon + '</div>' +
        '<div class="lc-title">' + t.title + '</div>' +
        '<div class="lc-desc">' + t.desc + '</div>' +
        '<div class="lc-cta">LEARN MORE →</div>' +
        '</div>';
    }).join('') +
    '</div></div>';
}

// ============ SHARED UNTIMED PRACTICE GAME ENGINE (Cipher / Morse / Binary) ============
function initPracticeGame(containerId, key, cfg){
  // cfg: rounds (index0 = practice, 1..N = scored), needToWin, renderPrompt(round,c,isPractice), afterRender, getUserValue, isCorrect, referenceHtml(optional)
  const container = document.getElementById(containerId);
  const c = COLOR_MAP[ITEMS[key].color];
  const state = { idx:0, score:0 };
  const totalRounds = cfg.rounds.length - 1;

  function refBlock(){
    if(!cfg.referenceHtml) return '';
    return '<div class="nexus-btn" id="refToggleBtn" style="background:rgba(255,255,255,.03);border:0.5px solid rgba(255,255,255,.12);color:var(--muted);margin-bottom:12px;font-size:11px">📖 SHOW/HIDE REFERENCE CHART</div>' +
      '<div id="refBlock" style="display:none;max-height:180px;overflow-y:auto;background:rgba(0,0,0,.2);border-radius:8px;padding:10px;margin-bottom:14px;font-size:11px;font-family:var(--font-mono)">'+cfg.referenceHtml+'</div>';
  }
  function wireRef(){
    const btn=document.getElementById('refToggleBtn');
    if(btn) btn.addEventListener('click', function(){
      const b=document.getElementById('refBlock');
      if(b) b.style.display = b.style.display==='none' ? 'block' : 'none';
    });
  }

  function renderPractice(){
    const round = cfg.rounds[0];
    container.innerHTML =
      '<div style="font-family:var(--font-mono);font-size:10px;color:'+c.c+';letter-spacing:1.5px;margin-bottom:14px">PRACTICE ROUND — UNTIMED</div>'+
      refBlock() +
      cfg.renderPrompt(round, c, true) +
      '<div class="result-box result-info" style="margin-top:16px"><b>Worked example:</b><br>'+round.explain+'</div>'+
      '<div class="nexus-btn" id="pgStartBtn" style="background:'+c.bg+';border:0.5px solid '+c.border+';color:'+c.c+';margin-top:16px">START ROUNDS →</div>';
    wireRef();
    const startBtn=document.getElementById('pgStartBtn');
    if(startBtn) startBtn.addEventListener('click', function(){ state.idx=1; state.score=0; renderRound(); });
  }

  function renderRound(){
    if(state.idx > totalRounds){
      const won = state.score >= cfg.needToWin;
      showApp(renderEndScreen(key, state.score+' / '+totalRounds, won?key:key+'_practice'), 'games');
      return;
    }
    const round = cfg.rounds[state.idx];
    container.innerHTML =
      '<div style="font-family:var(--font-mono);font-size:10px;color:var(--muted);letter-spacing:1px;margin-bottom:12px">ROUND '+state.idx+' OF '+totalRounds+' — SCORE '+state.score+' — NEED '+cfg.needToWin+' TO WIN</div>'+
      refBlock() +
      cfg.renderPrompt(round, c, false)+
      '<div id="pgFeedback" style="margin-top:12px"></div>'+
      '<div style="display:flex;gap:10px;margin-top:12px">'+
      '<div class="nexus-btn" id="pgSubmitBtn" style="flex:1;background:'+c.bg+';border:0.5px solid '+c.border+';color:'+c.c+'">SUBMIT</div>'+
      '<div class="nexus-btn" id="pgHintBtn" style="flex:0 0 auto;background:rgba(255,255,255,.03);border:0.5px solid rgba(255,255,255,.12);color:var(--muted)">💡 HINT</div>'+
      '<div class="nexus-btn" id="pgSkipBtn" style="flex:0 0 auto;background:rgba(255,255,255,.03);border:0.5px solid rgba(255,255,255,.12);color:var(--muted)">SKIP →</div>'+
      '</div>';
    wireRef();
    cfg.afterRender && cfg.afterRender(round, c);

    const hintBtn=document.getElementById('pgHintBtn');
    if(hintBtn) hintBtn.addEventListener('click', function(){
      const fb=document.getElementById('pgFeedback');
      if(fb) fb.innerHTML='<div class="result-box result-info">💡 '+round.hintText+'</div>';
    });
    const skipBtn=document.getElementById('pgSkipBtn');
    if(skipBtn) skipBtn.addEventListener('click', function(){ state.idx++; renderRound(); });
    const submitBtn=document.getElementById('pgSubmitBtn');
    if(submitBtn) submitBtn.addEventListener('click', function(){
      const val=cfg.getUserValue();
      if(val===null||val==='') return;
      const correct=cfg.isCorrect(round,val);
      const fb=document.getElementById('pgFeedback');
      if(correct){
        state.score++;
        if(fb) fb.innerHTML='<div class="result-box result-safe"><b>Correct!</b><br>'+round.explain+'</div>';
        submitBtn.style.opacity='0.4'; submitBtn.style.pointerEvents='none';
        setTimeout(function(){ state.idx++; renderRound(); }, 1200);
      } else {
        if(fb) fb.innerHTML='<div class="result-box result-warn">Not quite — try again, use Hint, or Skip.</div>';
      }
    });
  }
  renderPractice();
}

function wireCipherGame(){
  const rounds = makeCipherRounds(10);
  initPracticeGame('cipherPanel','cipher',{
    rounds: rounds, needToWin: 7,
    renderPrompt: function(round,c,isPractice){
      return '<div class="input-label">Decrypt this message'+(isPractice?' (shift 3, shown for practice)':'')+':</div>'+
        '<div class="demo-in" style="font-size:16px;letter-spacing:2px;margin-bottom:14px">'+round.prompt+'</div>'+
        (isPractice?'':'<div class="input-label">Your answer</div><input type="text" class="nexus-input" id="pgInput" placeholder="Type the decoded word...">');
    },
    getUserValue: function(){ const el=document.getElementById('pgInput'); return el?el.value.trim():null; },
    isCorrect: function(round,val){ return val.toUpperCase()===round.answer.toUpperCase(); }
  });
}

function wireMorseGame(){
  const rounds = makeMorseRounds(10);
  const chart = Object.keys(MORSE_MAP).map(function(k){ return '<span style="display:inline-block;width:70px">'+k+' = '+MORSE_MAP[k]+'</span>'; }).join('');
  initPracticeGame('morsePanel','morse',{
    rounds: rounds, needToWin: 7, referenceHtml: chart,
    renderPrompt: function(round,c,isPractice){
      return '<div class="input-label">Decode this Morse code:</div>'+
        '<div class="demo-in" style="font-size:18px;letter-spacing:3px;margin-bottom:14px">'+round.prompt+'</div>'+
        (isPractice?'':'<div class="input-label">Your answer</div><input type="text" class="nexus-input" id="pgInput" placeholder="Type the decoded word...">');
    },
    getUserValue: function(){ const el=document.getElementById('pgInput'); return el?el.value.trim():null; },
    isCorrect: function(round,val){ return val.toUpperCase()===round.answer.toUpperCase(); }
  });
}

function wireBinaryGame(){
  const rounds = makeBinaryRounds(10);
  initPracticeGame('binaryPanel','binary',{
    rounds: rounds, needToWin: 7,
    renderPrompt: function(round,c,isPractice){
      return '<div class="input-label">Riddle: '+round.riddle+'</div>'+
        '<div class="demo-in" style="font-size:14px;letter-spacing:1px;word-break:break-all;margin-bottom:14px">'+round.prompt+'</div>'+
        (isPractice?'':'<div class="input-label">Your answer</div><input type="text" class="nexus-input" id="pgInput" placeholder="Type the answer...">');
    },
    getUserValue: function(){ const el=document.getElementById('pgInput'); return el?el.value.trim():null; },
    isCorrect: function(round,val){ return val.toUpperCase()===round.answer.toUpperCase(); }
  });
}

// ============ CRACK THE CODE — multi-round, guess limit ============
function wireCrackCodeGame(){
  const rounds = generateCrackRounds(5);
  let idx=0, score=0, guessesLeft=8;
  function renderRound(){
    if(idx>=rounds.length){
      showApp(renderEndScreen('crack_code', score+' / '+rounds.length), 'games'); return;
    }
    const puzzle=rounds[idx]; guessesLeft=8;
    document.getElementById('crackEncrypted').textContent=puzzle.encrypted;
    const slider=document.getElementById('crackSlider');
    function updatePreview(){
      const guess=parseInt(slider.value);
      document.getElementById('crackShiftVal').textContent=guess;
      document.getElementById('crackPreview').textContent=caesarCipher(puzzle.encrypted, guess, 'decrypt');
    }
    slider.value=3; slider.addEventListener('input', updatePreview); updatePreview();
    document.getElementById('crackResult').innerHTML='<div class="finding-row">Round '+(idx+1)+' of '+rounds.length+' — '+guessesLeft+' guesses left — Score: '+score+'</div>';
    document.getElementById('crackBtn').onclick=function(){
      const guess=parseInt(slider.value);
      if(guess===puzzle.shift){
        score++;
        document.getElementById('crackResult').innerHTML='<div class="result-box result-safe"><b>CORRECT!</b> The shift was '+puzzle.shift+'.</div>';
        setTimeout(function(){ idx++; renderRound(); }, 1200);
      } else {
        guessesLeft--;
        if(guessesLeft<=0){
          document.getElementById('crackResult').innerHTML='<div class="result-box result-warn">Out of guesses — the shift was '+puzzle.shift+'.</div>';
          setTimeout(function(){ idx++; renderRound(); }, 1400);
        } else {
          document.getElementById('crackResult').innerHTML='<div class="finding-row">Not quite — '+guessesLeft+' guesses left.</div>';
        }
      }
    };
  }
  renderRound();
}

// ============ PHISHING DETECTIVE — fixed position, 8 rounds, categories ============
function wirePhishingGame(){
  let round=0, score=0;
  const TOTAL=8;
  function renderRound(){
    if(round>=TOTAL){ showApp(renderEndScreen('phishing_detect', score+' / '+TOTAL), 'games'); return; }
    const base=PHISHING_ROUNDS[round % PHISHING_ROUNDS.length];
    const pz=shuffleUrls(base);
    let urlsHtml=pz.urls.map(function(u,i){
      return '<div class="fc-opt" data-idx="'+i+'" style="margin-bottom:10px">'+String.fromCharCode(65+i)+'. '+u+'</div>';
    }).join('');
    document.getElementById('phishPanel').innerHTML=
      '<div style="font-family:var(--font-mono);font-size:11px;color:var(--muted);margin-bottom:14px">ROUND '+(round+1)+' OF '+TOTAL+' — ['+pz.category+'] Which URL is phishing?</div>'+
      urlsHtml+'<div id="phishFeedback"></div>';
    document.querySelectorAll('#phishPanel .fc-opt').forEach(function(opt){
      opt.addEventListener('click', function(){
        const idx=parseInt(opt.dataset.idx);
        const correct=idx===pz.fake;
        if(correct) score++;
        document.getElementById('phishFeedback').innerHTML=
          '<div class="result-box '+(correct?'result-safe':'result-danger')+'" style="margin-top:14px">'+
          (correct?'CORRECT! ':'Wrong. The fake was '+String.fromCharCode(65+pz.fake)+'. ')+pz.explanation+'</div>'+
          '<div class="nexus-btn" style="margin-top:14px" id="nextRoundBtn">NEXT ROUND →</div>';
        document.getElementById('nextRoundBtn').addEventListener('click', function(){ round++; renderRound(); });
      });
    });
  }
  renderRound();
}

// ============ PASSWORD GENERATOR GAME — live feedback + attempt limit ============
function wirePasswordGeneratorGame(){
  const rules=getPwRules(4);
  let attemptsLeft=6;
  function renderRules(pwd){
    return rules.map(function(r){
      const pass=r.test(pwd||'');
      return '<div class="finding-row">'+(pass?'✅':'⬜')+' '+r.text+'</div>';
    }).join('');
  }
  document.getElementById('passgenPanel').innerHTML=
    '<div style="margin-bottom:10px"><b style="color:var(--c-pink)">Rules — build a password satisfying ALL of these:</b></div>'+
    '<div id="pwgRules" style="margin-bottom:14px">'+renderRules('')+'</div>'+
    '<div class="finding-row" id="pwgAttempts">Attempts left: '+attemptsLeft+'</div>'+
    '<div class="input-label">Your password</div>'+
    '<input type="text" class="nexus-input" id="pwgInput" placeholder="Type here — checklist updates live..." style="border-color:var(--c-pink)">'+
    '<div class="nexus-btn" id="pwgBtn" style="background:rgba(244,143,177,.07);border:0.5px solid var(--c-pink);color:var(--c-pink)">SUBMIT ATTEMPT</div>'+
    '<div id="pwgResult"></div>';
  const input=document.getElementById('pwgInput');
  input.addEventListener('input', function(){ document.getElementById('pwgRules').innerHTML=renderRules(input.value); });
  document.getElementById('pwgBtn').addEventListener('click',function(){
    const pwd=input.value;
    const r=evalPwGame(pwd,rules);
    if(r.won){
      document.getElementById('pwgResult').innerHTML='<div class="result-box result-safe"><b>All rules passed!</b></div>'+
        '<div class="nexus-btn" style="margin-top:14px;background:rgba(244,143,177,.07);border:0.5px solid var(--c-pink);color:var(--c-pink)" data-go="end|passgen|Won with '+(6-attemptsLeft+1)+' attempts">COMPLETE GAME →</div>';
    } else {
      attemptsLeft--;
      document.getElementById('pwgAttempts').textContent='Attempts left: '+attemptsLeft;
      if(attemptsLeft<=0){
        document.getElementById('pwgResult').innerHTML='<div class="result-box result-danger">Out of attempts — '+r.passed+'/'+r.total+' rules passed.</div>'+
          '<div class="nexus-btn" style="margin-top:14px" data-go="tools">BACK TO GAMES</div>';
      } else {
        document.getElementById('pwgResult').innerHTML='<div class="result-box result-warn">'+r.passed+'/'+r.total+' rules passed — keep adjusting.</div>';
      }
    }
  });
}

// ============ CYBER ESCAPE ROOM — random 5, fuzzy match, attempt limit ============
function wireEscapeRoomGame(){
  const puzzles=pickEscapeSet(5);
  let solved=0, current=0, attemptsLeft=4;
  function showPuzzle(){
    if(current>=puzzles.length){
      document.getElementById('escapePanel').innerHTML='<div class="result-box result-safe" style="text-align:center"><b>🏆 ALL PUZZLES ATTEMPTED!</b><br>You solved '+solved+' of '+puzzles.length+'.</div>'+
        '<div class="nexus-btn" style="margin-top:14px;background:rgba(244,143,177,.07);border:0.5px solid var(--c-pink);color:var(--c-pink)" data-go="end|escape_room|'+solved+'/'+puzzles.length+' puzzles">COMPLETE →</div>';
      return;
    }
    attemptsLeft=4;
    const pz=puzzles[current];
    document.getElementById('escapePanel').innerHTML=
      '<div style="font-family:var(--font-mono);font-size:11px;color:var(--muted);margin-bottom:12px">PUZZLE '+(current+1)+' OF '+puzzles.length+' — '+solved+' SOLVED — '+attemptsLeft+' attempts left</div>'+
      '<div style="background:rgba(0,0,0,.2);border-radius:10px;padding:16px;margin-bottom:16px;white-space:pre-wrap;font-size:13px;color:var(--cream)">'+pz.title+'\n\n'+pz.desc+'</div>'+
      '<div class="nexus-btn" id="escHintBtn" style="background:rgba(244,143,177,.05);border:0.5px solid rgba(244,143,177,.2);color:var(--muted);margin-bottom:14px">SHOW HINT</div>'+
      '<div id="escHint" style="display:none" class="finding-row">Hint: '+pz.hint+'</div>'+
      '<div class="input-label">Your answer</div>'+
      '<input type="text" class="nexus-input" id="escAnswer" placeholder="Type your answer..." style="border-color:var(--c-pink)">'+
      '<div class="nexus-btn" id="escSubmit" style="background:rgba(244,143,177,.07);border:0.5px solid var(--c-pink);color:var(--c-pink)">SUBMIT</div>'+
      '<div id="escResult"></div>';
    document.getElementById('escHintBtn').addEventListener('click',function(){ document.getElementById('escHint').style.display='block'; });
    document.getElementById('escSubmit').addEventListener('click',function(){
      const ans=normalizeAnswer(document.getElementById('escAnswer').value);
      if(ans===normalizeAnswer(pz.answer)){
        solved++; current++;
        document.getElementById('escResult').innerHTML='<div class="result-box result-safe"><b>CORRECT!</b></div>';
        setTimeout(showPuzzle,900);
      } else {
        attemptsLeft--;
        if(attemptsLeft<=0){
          document.getElementById('escResult').innerHTML='<div class="result-box result-warn">Out of attempts — the answer was "'+pz.answer+'".</div>';
          current++;
          setTimeout(showPuzzle,1400);
        } else {
          document.getElementById('escResult').innerHTML='<div class="result-box result-warn">Wrong answer — '+attemptsLeft+' attempts left.</div>';
        }
      }
    });
  }
  showPuzzle();
}

// ============ THREAT TRIAGE ============
function wireThreatTriageGame(){
  const pool=THREAT_SCENARIOS.slice();
  const rounds=[];
  for(let i=0;i<10 && pool.length;i++){ rounds.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]); }
  let idx=0, score=0;
  function render(){
    if(idx>=rounds.length){ showApp(renderEndScreen('threat_triage', score+' / '+rounds.length), 'games'); return; }
    const s=rounds[idx];
    document.getElementById('triagePanel').innerHTML=
      '<div style="font-family:var(--font-mono);font-size:11px;color:var(--muted);margin-bottom:12px">SCENARIO '+(idx+1)+' OF '+rounds.length+' — SCORE '+score+'</div>'+
      '<div class="demo-in" style="margin-bottom:16px;font-size:14px;line-height:1.6">'+s.text+'</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'+
      THREAT_CATS.map(function(cat){ return '<div class="fc-opt" data-cat="'+cat.id+'">'+cat.label+'</div>'; }).join('')+
      '</div><div id="triageFeedback" style="margin-top:14px"></div>';
    document.querySelectorAll('#triagePanel .fc-opt').forEach(function(opt){
      opt.addEventListener('click', function(){
        const correct=opt.dataset.cat===s.cat;
        if(correct) score++;
        document.querySelectorAll('#triagePanel .fc-opt').forEach(function(o){ o.style.pointerEvents='none'; });
        document.getElementById('triageFeedback').innerHTML=
          '<div class="result-box '+(correct?'result-safe':'result-danger')+'"><b>'+(correct?'Correct!':'Not quite.')+'</b><br>'+s.explain+'</div>'+
          '<div class="nexus-btn" style="margin-top:12px" id="triageNext">NEXT →</div>';
        document.getElementById('triageNext').addEventListener('click', function(){ idx++; render(); });
      });
    });
  }
  render();
}

// ============ RED FLAG HUNTER ============
function wireRedFlagGame(){
  let idx=0, totalScore=0;
  function render(){
    if(idx>=REDFLAG_SCENARIOS.length){ showApp(renderEndScreen('redflag_hunter', totalScore+' pts'), 'games'); return; }
    const scenario=REDFLAG_SCENARIOS[idx];
    const clicked={};
    document.getElementById('redflagPanel').innerHTML=
      '<div style="font-family:var(--font-mono);font-size:11px;color:var(--muted);margin-bottom:12px">SCENARIO '+(idx+1)+' OF '+REDFLAG_SCENARIOS.length+' — click every red flag you spot</div>'+
      '<div style="background:rgba(0,0,0,.2);border-radius:10px;padding:14px">'+
      scenario.zones.map(function(z){ return '<div class="redflag-zone" data-id="'+z.id+'" style="padding:10px 12px;margin-bottom:6px;border-radius:6px;border:1px solid rgba(255,255,255,.08);cursor:pointer;font-size:13px">'+z.text+'</div>'; }).join('')+
      '</div>'+
      '<div class="nexus-btn" id="redflagSubmit" style="margin-top:14px;background:rgba(244,143,177,.07);border:0.5px solid var(--c-pink);color:var(--c-pink)">REVEAL RESULTS</div>'+
      '<div id="redflagResult"></div>';
    document.querySelectorAll('.redflag-zone').forEach(function(el){
      el.addEventListener('click', function(){
        const id=el.dataset.id;
        clicked[id]=!clicked[id];
        el.style.outline=clicked[id] ? '2px solid var(--c-pink)' : 'none';
      });
    });
    document.getElementById('redflagSubmit').addEventListener('click', function(){
      let roundScore=0;
      const rows=scenario.zones.map(function(z){
        const wasClicked=!!clicked[z.id];
        const correct = wasClicked===z.flag;
        if(correct && z.flag) roundScore++;
        if(wasClicked && !z.flag) roundScore--;
        const label = z.flag ? (wasClicked?'✅ Correctly flagged':'❌ Missed — this WAS a red flag') : (wasClicked?'⚠️ Not actually a flag':'✅ Correctly left alone');
        return '<div class="finding-row"><b>'+label+':</b> '+z.text+'<br><span style="color:var(--muted);font-size:11px">'+z.explain+'</span></div>';
      }).join('');
      totalScore+=Math.max(roundScore,0);
      document.getElementById('redflagResult').innerHTML='<div style="margin-top:14px">'+rows+'</div>'+
        '<div class="nexus-btn" style="margin-top:14px" id="redflagNext">NEXT →</div>';
      document.getElementById('redflagNext').addEventListener('click', function(){ idx++; render(); });
    });
  }
  render();
}

// ============ SCAM CALL SIMULATOR ============
function wireScamCallGame(){
  const script=SCAMCALL_SCRIPTS[Math.floor(Math.random()*SCAMCALL_SCRIPTS.length)];
  let nodeKey='start';
  function render(){
    const node=script.nodes[nodeKey];
    let html='<div style="font-family:var(--font-mono);font-size:11px;color:var(--muted);margin-bottom:12px">'+script.title+'</div>'+
      '<div class="demo-in" style="margin-bottom:16px;font-size:14px;line-height:1.7"><b>'+node.speaker+':</b> '+node.text+'</div>';
    if(node.terminal){
      const cls = node.outcome==='safe' ? 'result-safe' : node.outcome==='partial' ? 'result-warn' : 'result-danger';
      html+='<div class="result-box '+cls+'">'+ (node.outcome==='safe'?'✅ Safe outcome':node.outcome==='partial'?'⚠️ Partial — some info given away':'🚫 Scam succeeded')+'</div>'+
        '<div class="nexus-btn" style="margin-top:14px;background:rgba(244,143,177,.07);border:0.5px solid var(--c-pink);color:var(--c-pink)" data-go="end|scamcall_sim|'+node.outcome+'">COMPLETE →</div>';
      document.getElementById('scamcallPanel').innerHTML=html;
      return;
    }
    html+='<div style="display:flex;flex-direction:column;gap:10px">'+
      node.options.map(function(o,i){ return '<div class="fc-opt" data-next="'+o.next+'">'+o.label+'</div>'; }).join('')+
      '</div>';
    document.getElementById('scamcallPanel').innerHTML=html;
    document.querySelectorAll('#scamcallPanel .fc-opt').forEach(function(opt){
      opt.addEventListener('click', function(){ nodeKey=opt.dataset.next; render(); });
    });
  }
  render();
}
