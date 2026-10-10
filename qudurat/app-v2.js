const QUESTIONS = Array.isArray(window.QUDURAT_BANK) ? window.QUDURAT_BANK : [];
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const STORAGE = "qudurat-review-v2";
const EXAM_AT = new Date("2026-09-27T08:15:00+03:00");

const state = {
  questions: [], answers: [], checked: new Set(), flagged: new Set(), current: 0,
  duration: 0, remaining: 0, startedAt: 0, timerId: null, mode: "quick", sound: true
};

function shuffle(items){
  const a=[...items];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
function readStore(){try{return JSON.parse(localStorage.getItem(STORAGE))||{history:[],mistakes:[],sound:true,seen:[]};}catch{return {history:[],mistakes:[],sound:true,seen:[]};}}
function writeStore(data){localStorage.setItem(STORAGE,JSON.stringify(data));}
function showScreen(id){$$('.screen').forEach(el=>el.classList.remove('active'));$(id).classList.add('active');window.scrollTo({top:0,behavior:'smooth'});}
function sectionName(section){return section==='quant'?'كمي':'لفظي';}
function escapeHTML(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function formatTime(sec){const m=Math.floor(sec/60).toString().padStart(2,'0');const s=Math.floor(sec%60).toString().padStart(2,'0');return `${m}:${s}`;}

function injectModes(){
  const q=QUESTIONS.filter(x=>x.section==='quant').length;
  const v=QUESTIONS.filter(x=>x.section==='verbal').length;
  const c=QUESTIONS.filter(x=>x.category.startsWith('المقارنات')).length;
  const hero=$('.hero-copy');
  if(hero) hero.textContent=`مكتبة تدريب فيها ${QUESTIONS.length} سؤال أصلي، منها ${q} كمي و${v} لفظي. كل جولة تسحب أسئلة مختلفة وتحفظ أخطاءك تلقائيًا.`;

  const grid=$('.mode-grid');
  grid.innerHTML=`
    <button class="mode-card recommended" data-mode="quick" type="button">
      <span class="pill">ابدأ هنا</span><div class="mode-icon">20</div><h2>مراجعة سريعة</h2>
      <p>20 سؤالًا مختلطًا. ممتازة قبل الاختبار.</p><div class="mode-meta"><span>25 دقيقة</span><span>بدون تكرار قدر الإمكان</span></div>
    </button>
    <button class="mode-card" data-mode="compare" type="button">
      <div class="mode-icon">${c}</div><h2>تحدي المقارنات</h2>
      <p>القيمة الأولى، الثانية، التساوي، أو عدم كفاية المعطيات.</p><div class="mode-meta"><span>20 سؤالًا</span><span>كمي</span></div>
    </button>
    <button class="mode-card" data-mode="quant" type="button">
      <div class="mode-icon">30</div><h2>كمي فقط</h2>
      <p>نسب، جبر، هندسة، متوسط، سرعة، متتابعات ومقارنات.</p><div class="mode-meta"><span>35 دقيقة</span><span>${q} في المكتبة</span></div>
    </button>
    <button class="mode-card" data-mode="verbal" type="button">
      <div class="mode-icon">30</div><h2>لفظي فقط</h2>
      <p>تناظر، إكمال، مفردات، خطأ سياقي واستيعاب مقروء.</p><div class="mode-meta"><span>35 دقيقة</span><span>${v} في المكتبة</span></div>
    </button>
    <button class="mode-card" data-mode="full" type="button">
      <div class="mode-icon">60</div><h2>محاكاة قوية</h2>
      <p>60 سؤالًا موزعة بين اللفظي والكمي لقياس أوسع.</p><div class="mode-meta"><span>70 دقيقة</span><span>تحليل كامل</span></div>
    </button>
    <button class="mode-card" data-mode="marathon" type="button">
      <div class="mode-icon">100</div><h2>ماراثون</h2>
      <p>100 سؤال لمن يبي يضغط نفسه ويشوف ثبات مستواه.</p><div class="mode-meta"><span>120 دقيقة</span><span>عينة كبيرة</span></div>
    </button>
    <button class="mode-card" data-mode="weak" type="button">
      <div class="mode-icon">20</div><h2>أضعف قسم</h2>
      <p>يبني الجولة من القسم الأقل في آخر نتائجك.</p><div class="mode-meta"><span>25 دقيقة</span><span>يتكيف معك</span></div>
    </button>`;
  $$('.mode-card').forEach(btn=>btn.addEventListener('click',()=>startQuiz(btn.dataset.mode)));

  const dash=$('.dashboard-card .section-head');
  if(dash && !$('#libraryBadge')){
    const badge=document.createElement('span'); badge.id='libraryBadge'; badge.className='score-badge'; badge.textContent=`${QUESTIONS.length} سؤال بالمكتبة`;
    dash.appendChild(badge);
  }
}

function unseenFirst(pool,count){
  const store=readStore();
  let seen=new Set(store.seen||[]);
  let unseen=shuffle(pool.filter(q=>!seen.has(q.id)));
  let picked=unseen.slice(0,count);
  if(picked.length<count){
    const rest=shuffle(pool.filter(q=>!picked.some(p=>p.id===q.id))).slice(0,count-picked.length);
    picked=picked.concat(rest);
  }
  picked.forEach(q=>seen.add(q.id));
  if(seen.size>Math.max(QUESTIONS.length*0.9,220)) seen=new Set(picked.map(q=>q.id));
  store.seen=[...seen]; writeStore(store);
  return shuffle(picked);
}

function pickQuestions(mode){
  const quant=QUESTIONS.filter(q=>q.section==='quant');
  const verbal=QUESTIONS.filter(q=>q.section==='verbal');
  const compare=quant.filter(q=>q.category.startsWith('المقارنات'));
  if(mode==='compare') return unseenFirst(compare,Math.min(20,compare.length));
  if(mode==='quant') return unseenFirst(quant,30);
  if(mode==='verbal') return unseenFirst(verbal,30);
  if(mode==='full') return shuffle([...unseenFirst(verbal,33),...unseenFirst(quant,27)]);
  if(mode==='marathon') return shuffle([...unseenFirst(verbal,55),...unseenFirst(quant,45)]);
  if(mode==='quick') return shuffle([...unseenFirst(verbal,10),...unseenFirst(quant,10)]);
  const store=readStore(), last=store.history?.[store.history.length-1];
  if(!last) return shuffle([...unseenFirst(verbal,10),...unseenFirst(quant,10)]);
  const weak=last.quant<=last.verbal?'quant':'verbal';
  return unseenFirst(weak==='quant'?quant:verbal,20);
}
function durationFor(mode){return ({compare:20,quant:35,verbal:35,full:70,marathon:120,weak:25,quick:25}[mode]||25)*60;}

function startQuiz(mode){
  clearInterval(state.timerId); state.mode=mode; state.questions=pickQuestions(mode); state.answers=Array(state.questions.length).fill(null);
  state.checked=new Set(); state.flagged=new Set(); state.current=0; state.duration=durationFor(mode); state.remaining=state.duration; state.startedAt=Date.now();
  showScreen('#quizScreen'); renderDots(); renderQuestion(); updateTimer();
  state.timerId=setInterval(()=>{state.remaining=Math.max(0,state.remaining-1);updateTimer();if(state.remaining===0){clearInterval(state.timerId);finishQuiz(true);}},1000);
}

function renderQuestion(){
  const q=state.questions[state.current]; if(!q) return;
  const checked=state.checked.has(state.current), selected=state.answers[state.current];
  $('#questionCounter').textContent=`${state.current+1} / ${state.questions.length}`;
  $('#sectionLabel').textContent=sectionName(q.section);
  $('#typeTag').textContent=q.category;
  $('#questionText').textContent=q.prompt;
  $('#progressBar').style.width=`${((state.current+1)/state.questions.length)*100}%`;
  $('#flagQuestion').setAttribute('aria-pressed',state.flagged.has(state.current)?'true':'false');
  const letters=['أ','ب','ج','د'];
  $('#choices').innerHTML=q.choices.map((choice,i)=>{
    let cls='choice'; if(selected===i) cls+=' selected'; if(checked&&i===q.answer) cls+=' correct'; if(checked&&selected===i&&selected!==q.answer) cls+=' wrong';
    return `<button class="${cls}" data-choice="${i}" type="button" ${checked?'disabled':''}><span class="choice-letter">${letters[i]}</span><span>${escapeHTML(choice)}</span></button>`;
  }).join('');
  $$('.choice').forEach(btn=>btn.addEventListener('click',()=>{if(checked)return;state.answers[state.current]=Number(btn.dataset.choice);renderQuestion();}));
  $('#prevQuestion').disabled=state.current===0;
  $('#checkAnswer').classList.toggle('hidden',checked); $('#nextQuestion').classList.toggle('hidden',!checked); $('#checkAnswer').disabled=selected===null;
  if(checked){const ok=selected===q.answer;$('#explanationBox').classList.remove('hidden');$('#answerStatus').textContent=ok?'إجابة صحيحة':'الإجابة تحتاج مراجعة';$('#answerStatus').className=`answer-status ${ok?'good':'bad'}`;$('#explanationText').textContent=q.explanation;$('#nextQuestion').textContent=state.current===state.questions.length-1?'عرض النتيجة':'التالي';}
  else $('#explanationBox').classList.add('hidden');
  updateDots();
}
function renderDots(){$('#questionDots').innerHTML=state.questions.map((_,i)=>`<button class="qdot" data-index="${i}" type="button" aria-label="السؤال ${i+1}"></button>`).join('');$$('.qdot').forEach(d=>d.addEventListener('click',()=>{state.current=Number(d.dataset.index);renderQuestion();}));}
function updateDots(){$$('.qdot').forEach((d,i)=>{d.classList.toggle('current',i===state.current);d.classList.toggle('answered',state.checked.has(i));d.classList.toggle('flagged',state.flagged.has(i));});}
function checkCurrent(){if(state.answers[state.current]===null)return;state.checked.add(state.current);const q=state.questions[state.current],ok=state.answers[state.current]===q.answer;updateMistake(q.id,ok);playTone(ok);renderQuestion();}
function updateMistake(id,correct){const store=readStore(),set=new Set(store.mistakes||[]);correct?set.delete(id):set.add(id);store.mistakes=[...set];writeStore(store);}
function nextQuestion(){if(state.current===state.questions.length-1){finishQuiz(false);return;}state.current++;renderQuestion();}
function prevQuestion(){if(state.current>0){state.current--;renderQuestion();}}

function finishQuiz(fromTimer=false){
  clearInterval(state.timerId); state.timerId=null; const total=state.questions.length; let correct=0,vc=0,vt=0,qc=0,qt=0; const cats={};
  state.questions.forEach((q,i)=>{const ok=state.answers[i]===q.answer;if(ok)correct++;if(q.section==='verbal'){vt++;if(ok)vc++;}else{qt++;if(ok)qc++;}if(!cats[q.category])cats[q.category]={correct:0,total:0};cats[q.category].total++;if(ok)cats[q.category].correct++;if(!ok)updateMistake(q.id,false);});
  const pct=Math.round(correct/total*100),verbal=vt?Math.round(vc/vt*100):null,quant=qt?Math.round(qc/qt*100):null,elapsed=Math.min(state.duration,Math.round((Date.now()-state.startedAt)/1000));
  const store=readStore();store.history=store.history||[];store.history.push({date:Date.now(),mode:state.mode,score:pct,verbal:verbal??0,quant:quant??0,verbalApplicable:verbal!==null,quantApplicable:quant!==null});store.history=store.history.slice(-40);writeStore(store);
  renderResults({total,correct,pct,verbal,quant,cats,elapsed,fromTimer});showScreen('#resultScreen');updateDashboard();
}
function renderResults(r){
  $('#finalScore').textContent=`${r.pct}%`;$('#scoreRing').style.setProperty('--score',r.pct);$('#correctCount').textContent=`${r.correct} / ${r.total}`;$('#timeUsed').textContent=formatTime(r.elapsed);
  $('#verbalScore').textContent=r.verbal===null?'لم يُختبر':`${r.verbal}%`;$('#quantScore').textContent=r.quant===null?'لم يُختبر':`${r.quant}%`;$('#verbalBar').style.width=`${r.verbal??0}%`;$('#quantBar').style.width=`${r.quant??0}%`;
  let title='ركز على الأنواع الأضعف.';let summary='راجع الأخطاء تحت، وبعدها خذ جولة قصيرة من أضعف قسم بدل إعادة كل المكتبة.';
  if(r.pct>=85){title='مستواك قوي في هذه الجولة.';summary='راجع الأخطاء القليلة فقط، ثم حافظ على هدوئك وطاقتك.';}else if(r.pct>=70){title='مستواك جيد.';summary='الأساس عندك جيد. ركز على الأنواع اللي نسبتها أقل في التحليل.';}else if(r.pct>=55){title='عندك نقاط تحتاج تثبيت.';summary='راجع الأنواع الضعيفة ثم أعد اختبارًا قصيرًا عليها.';}if(r.fromTimer)summary='انتهى الوقت. '+summary;
  $('#resultTitle').textContent=title;$('#resultSummary').textContent=summary;
  const entries=Object.entries(r.cats).sort((a,b)=>(a[1].correct/a[1].total)-(b[1].correct/b[1].total));
  $('#categoryBreakdown').innerHTML=entries.map(([name,d])=>{const p=Math.round(d.correct/d.total*100),cls=p>=80?'high':p>=60?'mid':'low';return `<div class="category-row"><div><strong>${escapeHTML(name)}</strong><small>${d.correct} من ${d.total} صحيحة</small></div><span class="category-score ${cls}">${p}%</span></div>`;}).join('');
  const wrong=state.questions.map((question,i)=>({question,i})).filter(x=>state.answers[x.i]!==x.question.answer);$('#wrongBadge').textContent=`${wrong.length} أخطاء`;$('#wrongList').innerHTML=wrong.length?wrong.map(({question,i})=>wrongCard(question,state.answers[i])).join(''):'<div class="empty-state">ما عندك أخطاء في هذه الجولة.</div>';
}
function wrongCard(q,selectedIndex=null){const chosen=selectedIndex===null?'لم تتم الإجابة':q.choices[selectedIndex];return `<article class="wrong-item"><div class="wrong-meta"><span class="tag">${sectionName(q.section)}</span><span class="tag">${escapeHTML(q.category)}</span></div><h3>${escapeHTML(q.prompt).replace(/\n/g,'<br>')}</h3><p>إجابتك: ${escapeHTML(chosen)}</p><p class="correct-answer">الصحيح: ${escapeHTML(q.choices[q.answer])}</p><p>${escapeHTML(q.explanation)}</p></article>`;}
function showSavedMistakes(){const store=readStore(),ids=new Set(store.mistakes||[]),items=QUESTIONS.filter(q=>ids.has(q.id));$('#savedMistakesList').innerHTML=items.length?items.map(q=>wrongCard(q,null)).join(''):'<div class="empty-state">ما عندك أخطاء محفوظة حاليًا.</div>';showScreen('#mistakesScreen');}
function updateDashboard(){const store=readStore();state.sound=store.sound!==false;$('#soundToggle').textContent=state.sound?'صوت: يعمل':'صوت: صامت';const h=store.history||[];$('#attemptsBadge').textContent=`${h.length} ${h.length===1?'محاولة':'محاولات'}`;$('#mistakeCount').textContent=(store.mistakes||[]).length;$('#bestScore').textContent=h.length?`${Math.max(...h.map(x=>x.score))}%`:'--';const v=h.filter(x=>x.verbalApplicable!==false&&typeof x.verbal==='number'),q=h.filter(x=>x.quantApplicable!==false&&typeof x.quant==='number');$('#verbalBest').textContent=v.length?`${Math.max(...v.map(x=>x.verbal))}%`:'--';$('#quantBest').textContent=q.length?`${Math.max(...q.map(x=>x.quant))}%`:'--';}
function updateTimer(){$('#timer').textContent=formatTime(state.remaining);$('#timer').classList.toggle('warning',state.remaining<=300&&state.remaining>60);$('#timer').classList.toggle('danger',state.remaining<=60);}
function updateExamCountdown(){const card=$('#examCountdownCard'),out=$('#examCountdown'),diff=EXAM_AT-Date.now();if(diff<=0){card.style.display='none';return;}const t=Math.floor(diff/1000),h=Math.floor(t/3600),m=Math.floor((t%3600)/60),s=t%60;out.textContent=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;}
function playTone(correct){if(!state.sound)return;try{const Ctx=window.AudioContext||window.webkitAudioContext,ctx=new Ctx(),osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.value=correct?620:220;gain.gain.setValueAtTime(.035,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.12);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.12);}catch{}}
function openConfirm(title,text,onConfirm){const d=$('#confirmDialog');$('#dialogTitle').textContent=title;$('#dialogText').textContent=text;d.showModal();d.addEventListener('close',function handler(){d.removeEventListener('close',handler);if(d.returnValue==='confirm')onConfirm();});}

$('#checkAnswer').addEventListener('click',checkCurrent);$('#nextQuestion').addEventListener('click',nextQuestion);$('#prevQuestion').addEventListener('click',prevQuestion);$('#flagQuestion').addEventListener('click',()=>{state.flagged.has(state.current)?state.flagged.delete(state.current):state.flagged.add(state.current);renderQuestion();});
$('#quitQuiz').addEventListener('click',()=>openConfirm('إنهاء الجولة؟','سيتم حساب نتيجتك بما أجبت عنه حتى الآن.',()=>finishQuiz(false)));$('#backHome').addEventListener('click',()=>showScreen('#homeScreen'));$('#retryWeak').addEventListener('click',()=>startQuiz('weak'));$('#reviewMistakesHome').addEventListener('click',showSavedMistakes);$('#mistakesBack').addEventListener('click',()=>showScreen('#homeScreen'));
$('#soundToggle').addEventListener('click',()=>{const store=readStore();store.sound=store.sound===false;writeStore(store);updateDashboard();});$('#resetAll').addEventListener('click',()=>openConfirm('مسح التقدم؟','سيتم حذف نتائج المحاولات والأخطاء والأسئلة التي ظهرت لك.',()=>{localStorage.removeItem(STORAGE);updateDashboard();}));
document.addEventListener('keydown',e=>{if(!$('#quizScreen').classList.contains('active'))return;if(['1','2','3','4'].includes(e.key)&&!state.checked.has(state.current)){const i=Number(e.key)-1;if(i<state.questions[state.current].choices.length){state.answers[state.current]=i;renderQuestion();}}if(e.key==='Enter'){state.checked.has(state.current)?nextQuestion():checkCurrent();}});

injectModes();updateDashboard();updateExamCountdown();setInterval(updateExamCountdown,1000);
