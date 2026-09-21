(() => {
  'use strict';
  const STORAGE_KEY = 'immortal-site-language-v1';
  const DEFAULT_LANGUAGE = 'ar';
  const SUPPORTED = new Set(['ar','en']);
  let AR = {};
  let MANAGED_SEO = null;
  const META = {
    '/': ['Immortal | مطوّر، بوتات Discord ومودات FNF','موقع Immortal الشخصي: مشاريع ويب، بوتات Discord، مودات FNF، والأشياء اللي أشتغل عليها حاليًا.'],
    '/index.html': ['Immortal | مطوّر، بوتات Discord ومودات FNF','موقع Immortal الشخصي: مشاريع ويب، بوتات Discord، مودات FNF، والأشياء اللي أشتغل عليها حاليًا.'],
    '/commission/': ['طلبات FNF | Immortal','طلبات تشارت Psych Engine وCodename Engine، برمجة Psych Engine مخصصة، وتدريب مودتشارت على Codename Engine.'],
    '/commission/index.html': ['طلبات FNF | Immortal','طلبات تشارت Psych Engine وCodename Engine، برمجة Psych Engine مخصصة، وتدريب مودتشارت على Codename Engine.'],
    '/privacy.html': ['الخصوصية | Immortal','تفاصيل الخصوصية والإحصائيات في موقع Immortal وخيارات التحكم بالبيانات.'],
    '/selina/': ['Selina | بوت Discord للمجتمعات','Selina بوت Discord للإشراف والمستويات ومحادثة الذكاء الاصطناعي وأدوات المجتمعات.'],
    '/selina/index.html': ['Selina | بوت Discord للمجتمعات','Selina بوت Discord للإشراف والمستويات ومحادثة الذكاء الاصطناعي وأدوات المجتمعات.'],
    '/analytics.html': ['إحصائيات الموقع | Immortal','لوحة إحصائيات مجمعة تحترم الخصوصية لموقع Immortal.'],
    '/404.html': ['404 | الصفحة مو موجودة','الصفحة اللي تدور عليها مو موجودة.']
  };
  function normalize(value){ return SUPPORTED.has(value) ? value : DEFAULT_LANGUAGE; }
  function getLanguage(){
    const q = new URLSearchParams(location.search).get('lang');
    if (SUPPORTED.has(q)) { try { localStorage.setItem(STORAGE_KEY,q); } catch {} return q; }
    try { return normalize(localStorage.getItem(STORAGE_KEY)); } catch { return DEFAULT_LANGUAGE; }
  }
  const language = getLanguage();
  const isArabic = language === 'ar';
  function dynamic(text){
    const raw=String(text??'');
    if (Object.prototype.hasOwnProperty.call(AR,raw)) return AR[raw];
    const normalized=raw.replace(/\s+/g,' ').trim();
    if (Object.prototype.hasOwnProperty.call(AR,normalized)) return AR[normalized];
    if (raw.includes('\n')) {
      const translated=raw.split('\n').map(line=>dynamic(line)).join('\n');
      if (translated!==raw) return translated;
    }
    let m;
    const target=normalized;
    const months={Jan:'يناير',Feb:'فبراير',Mar:'مارس',Apr:'أبريل',May:'مايو',Jun:'يونيو',Jul:'يوليو',Aug:'أغسطس',Sep:'سبتمبر',Oct:'أكتوبر',Nov:'نوفمبر',Dec:'ديسمبر'};
    if ((m=target.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s+(\d{4})$/))) return m[2]+' '+months[m[1]]+' '+m[3];
    if ((m=target.match(/^(\d[\d,.]*) visitors today$/i))) return m[1]+' زائر اليوم';
    if ((m=target.match(/^(\d[\d,.]*) daily uniques in 7 days$/i))) return m[1]+' زائر فريد خلال 7 أيام';
    if ((m=target.match(/^(\d[\d,.]*) views(?: · (\d[\d,.]*) visitors)?$/i))) return m[1]+' مشاهدة'+(m[2]?' · '+m[2]+' زائر':'');
    if ((m=target.match(/^Open · (\d+)\/(\d+) available$/i))) return 'مفتوح · '+m[1]+'/'+m[2]+' متاح';
    if ((m=target.match(/^(\d+) of (\d+) commission slots used$/i))) return 'تم استخدام '+m[1]+' من '+m[2]+' خانات للطلبات';
    if ((m=target.match(/^Copied @(.+) to your clipboard\.$/))) return 'تم نسخ @'+m[1]+' للحافظة.';
    if ((m=target.match(/^Analytics data could not be loaded:\s*(.+)$/))) return 'تعذر تحميل بيانات الإحصائيات: '+m[1];
    const labels = [
      [/^Service:\s*(.+)$/,'الخدمة: '],
      [/^Song \/ project:\s*(.+)$/,'الأغنية / المشروع: '],
      [/^Engine version:\s*(.+)$/,'إصدار المحرك: '],
      [/^Song length:\s*(.+)$/,'مدة الأغنية: '],
      [/^Estimated chart price:\s*(.+)$/,'السعر التقديري للتشارت: '],
      [/^Difficulty \/ style:\s*(.+)$/,'الصعوبة / الأسلوب: '],
      [/^Deadline:\s*(.+)$/,'الموعد المطلوب: ']
    ];
    for (const [re,label] of labels) { m=target.match(re); if (m) return label+(AR[m[1]]||m[1]); }
    return raw;
  }
  function t(value){
    if (!isArabic) return String(value??'');
    const raw=String(value??'');
    const lead=(raw.match(/^\s*/)||[''])[0], tail=(raw.match(/\s*$/)||[''])[0], core=raw.trim();
    return core ? lead+dynamic(core)+tail : raw;
  }
  function skip(node){ const p=node?.parentElement; return !!p && (p.closest('[data-i18n-ignore]') || ['SCRIPT','STYLE','NOSCRIPT','CODE','PRE'].includes(p.tagName)); }
  function textNode(node){ if (!isArabic || !node || skip(node)) return; const n=t(node.nodeValue); if(n!==node.nodeValue) node.nodeValue=n; }
  const ATTRS=['placeholder','aria-label','title','alt'];
  function attrs(el){ if(!isArabic || !(el instanceof Element) || el.closest('[data-i18n-ignore]')) return; for(const a of ATTRS){ if(!el.hasAttribute(a)) continue; const v=el.getAttribute(a),n=t(v); if(n!==v) el.setAttribute(a,n); } }
  function subtree(root){
    if(!isArabic||!root) return;
    if(root.nodeType===Node.TEXT_NODE){textNode(root);return;}
    if(root instanceof Element) attrs(root);
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT); let n; while((n=w.nextNode())) textNode(n);
    root.querySelectorAll?.('*').forEach(attrs);
  }
  function meta(){
    if(!isArabic) return; const path=location.pathname||'/'; const base=META[path]; if(!base) return; const managedHome=(path==='/'||path==='/index.html')&&MANAGED_SEO; const title=managedHome?.titleAr||base[0],description=managedHome?.descriptionAr||base[1]; document.title=title;
    const set=(s,v)=>{const e=document.querySelector(s);if(e)e.setAttribute('content',v)};
    set('meta[name="description"]',description);set('meta[property="og:title"]',title);set('meta[property="og:description"]',description);
    set('meta[name="twitter:title"]',title);set('meta[name="twitter:description"]',description);
  }
  function styles(){
    if(document.getElementById('immortal-i18n-styles'))return;
    const s=document.createElement('style');s.id='immortal-i18n-styles';s.textContent=
      '.site-language-switch{position:fixed;right:max(14px,env(safe-area-inset-right));bottom:max(14px,env(safe-area-inset-bottom));z-index:2147483000;display:flex;align-items:center;gap:5px;padding:6px;border:1px solid rgba(255,255,255,.13);border-radius:999px;background:rgba(10,10,10,.78);box-shadow:0 8px 30px rgba(0,0,0,.28);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);font:600 12px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.site-language-switch button{appearance:none;border:0;background:transparent;color:rgba(255,255,255,.62);padding:8px 10px;border-radius:999px;cursor:pointer;font:inherit}.site-language-switch button[aria-pressed="true"]{color:#fff;background:rgba(255,255,255,.11)}.site-language-switch button:focus-visible{outline:2px solid var(--accent-color,var(--main-color,#d4a574));outline-offset:2px}.site-language-switch .divider{color:rgba(255,255,255,.24);user-select:none}html[dir="rtl"] .site-language-switch{right:auto;left:max(14px,env(safe-area-inset-left))}html[dir="rtl"] body{direction:rtl}html[dir="rtl"] input,html[dir="rtl"] textarea,html[dir="rtl"] select{text-align:right}html[dir="rtl"] .command-name,html[dir="rtl"] code,html[dir="rtl"] pre,html[dir="rtl"] .code-elements,html[dir="rtl"] [data-ltr]{direction:ltr;text-align:left;unicode-bidi:isolate}@media(max-width:600px){.site-language-switch{bottom:max(10px,env(safe-area-inset-bottom));transform:scale(.94);transform-origin:bottom right}html[dir="rtl"] .site-language-switch{transform-origin:bottom left}}';
    document.head.append(s);
  }
  function switcher(){
    if(document.querySelector('.site-language-switch'))return;
    const w=document.createElement('div');w.className='site-language-switch';w.setAttribute('role','group');w.setAttribute('aria-label',isArabic?'اختيار اللغة':'Choose language');
    w.innerHTML='<button type="button" data-lang="ar" aria-pressed="'+isArabic+'">عربي</button><span class="divider" aria-hidden="true">·</span><button type="button" data-lang="en" aria-pressed="'+(!isArabic)+'">EN</button>';
    w.addEventListener('click',e=>{const b=e.target.closest('button[data-lang]');if(!b)return;const next=normalize(b.dataset.lang);if(next===language)return;try{localStorage.setItem(STORAGE_KEY,next)}catch{}location.reload()});
    document.body.append(w);
  }
  function observer(){
    if(!isArabic||!document.body)return; const o=new MutationObserver(rs=>{for(const r of rs){if(r.type==='characterData'){textNode(r.target);continue}if(r.type==='attributes'){attrs(r.target);continue}for(const n of r.addedNodes)subtree(n)}});
    o.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTRS});
  }
  async function boot(){
    document.documentElement.lang=isArabic?'ar-SA':'en';document.documentElement.dir=isArabic?'rtl':'ltr';document.documentElement.dataset.siteLanguage=language;
    styles();
    if(isArabic){
      try{
        const [dictResponse,seoResponse]=await Promise.all([fetch('/data/i18n-ar.json',{cache:'no-cache'}),fetch('/data/site-seo.json',{cache:'no-cache'})]);
        if(dictResponse.ok) AR=await dictResponse.json();
        if(seoResponse.ok) MANAGED_SEO=await seoResponse.json();
      }catch(e){console.warn('[i18n] Arabic resources failed to load',e)}
    }
    meta(); if(isArabic)subtree(document.body); switcher(); observer();
    window.dispatchEvent(new CustomEvent('immortal-language-ready',{detail:{language,isArabic}}));
  }
  window.ImmortalI18n={language,isArabic,t,setLanguage(next){try{localStorage.setItem(STORAGE_KEY,normalize(next))}catch{}location.reload()}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();