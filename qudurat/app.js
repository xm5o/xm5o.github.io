const QUESTIONS = [
  {id:"q01",section:"quant",category:"النسب المئوية",prompt:"ما قيمة 25٪ من 240؟",choices:["40","50","60","80"],answer:2,explanation:"25٪ تساوي الربع، وربع 240 = 60."},
  {id:"q02",section:"quant",category:"النسب",prompt:"نسبة عدد الأولاد إلى البنات في مجموعة هي 3 : 5، وكان مجموعهم 40. كم عدد الأولاد؟",choices:["15","18","20","25"],answer:0,explanation:"مجموع أجزاء النسبة 8. قيمة الجزء = 40 ÷ 8 = 5، إذن الأولاد = 3 × 5 = 15."},
  {id:"q03",section:"quant",category:"المتوسط",prompt:"متوسط أربعة أعداد يساوي 18. إذا كانت ثلاثة منها 12 و16 و20، فما العدد الرابع؟",choices:["22","24","26","28"],answer:1,explanation:"مجموع الأعداد الأربعة = 18 × 4 = 72. مجموع الأعداد المعطاة = 48، فالعدد الرابع = 24."},
  {id:"q04",section:"quant",category:"السرعة",prompt:"سيارة تسير بسرعة ثابتة مقدارها 90 كم/ساعة. كم تقطع خلال ساعتين ونصف؟",choices:["180 كم","205 كم","225 كم","240 كم"],answer:2,explanation:"المسافة = السرعة × الزمن = 90 × 2.5 = 225 كم."},
  {id:"q05",section:"quant",category:"النسب المئوية",prompt:"سعر سلعة 350 ريالًا، خُفّض سعرها 20٪. ما السعر بعد التخفيض؟",choices:["270","280","290","300"],answer:1,explanation:"قيمة الخصم = 350 × 20٪ = 70. السعر الجديد = 350 - 70 = 280."},
  {id:"q06",section:"quant",category:"الهندسة",prompt:"زوايا مثلث هي 2س، 3س، 4س. ما قياس أكبر زاوية؟",choices:["60°","70°","80°","90°"],answer:2,explanation:"2س + 3س + 4س = 180، إذن 9س = 180 وس = 20. أكبر زاوية = 4 × 20 = 80°."},
  {id:"q07",section:"quant",category:"الهندسة",prompt:"محيط مربع يساوي 36 سم. ما مساحته؟",choices:["72 سم²","81 سم²","90 سم²","108 سم²"],answer:1,explanation:"طول الضلع = 36 ÷ 4 = 9 سم، والمساحة = 9 × 9 = 81 سم²."},
  {id:"q08",section:"quant",category:"العمل",prompt:"إذا أنجز 3 عمال عملًا في 6 أيام بالمعدل نفسه، فكم يومًا يحتاج 6 عمال لإنجاز العمل نفسه؟",choices:["2","3","4","6"],answer:1,explanation:"عدد العمال تضاعف، لذلك الزمن ينخفض إلى النصف: 6 ÷ 2 = 3 أيام."},
  {id:"q09",section:"quant",category:"المتتابعات",prompt:"أكمل النمط: 2، 6، 12، 20، 30، ؟",choices:["36","40","42","44"],answer:2,explanation:"الفروق هي 4، 6، 8، 10. الفرق التالي 12، لذلك 30 + 12 = 42."},
  {id:"q10",section:"quant",category:"التناسب",prompt:"إذا كان س ÷ 5 = 12 ÷ 20، فما قيمة س؟",choices:["2","3","4","5"],answer:1,explanation:"12 ÷ 20 = 3 ÷ 5، إذن س ÷ 5 = 3 ÷ 5، وبالتالي س = 3."},
  {id:"q11",section:"quant",category:"الاحتمالات",prompt:"عند رمي حجر نرد عادل مرة واحدة، ما احتمال ظهور عدد أكبر من 4؟",choices:["1/6","1/3","1/2","2/3"],answer:1,explanation:"الأعداد الأكبر من 4 هي 5 و6، أي نتيجتان من 6. الاحتمال = 2/6 = 1/3."},
  {id:"q12",section:"quant",category:"الأعمار",prompt:"عمر أب يساوي ثلاثة أمثال عمر ابنه. بعد 8 سنوات يصبح عمر الأب مثلي عمر الابن. كم عمر الابن الآن؟",choices:["6","8","10","12"],answer:1,explanation:"إذا كان عمر الابن س، فالأب 3س. بعد 8 سنوات: 3س + 8 = 2(س + 8)، ومنها س = 8."},
  {id:"q13",section:"quant",category:"الزوايا",prompt:"ما الزاوية الصغرى بين عقربي الساعة عند الساعة 3:00 تمامًا؟",choices:["60°","75°","90°","120°"],answer:2,explanation:"عقرب الدقائق عند 12 وعقرب الساعات عند 3. المسافة بين كل رقمين 30°، إذن 3 × 30 = 90°."},
  {id:"q14",section:"quant",category:"القابلية للقسمة",prompt:"أي الأعداد التالية يقبل القسمة على 3؟",choices:["1241","1243","1245","1247"],answer:2,explanation:"العدد يقبل القسمة على 3 إذا كان مجموع أرقامه يقبل القسمة على 3. مجموع أرقام 1245 = 12."},
  {id:"q15",section:"quant",category:"الربح والخسارة",prompt:"اشترى متجر منتجًا بـ 200 ريال وباعه بربح 15٪ من سعر التكلفة. ما سعر البيع؟",choices:["215","225","230","240"],answer:2,explanation:"الربح = 200 × 15٪ = 30 ريالًا. سعر البيع = 230 ريالًا."},
  {id:"q16",section:"quant",category:"الأسس",prompt:"ما قيمة 2⁵ × 2³؟",choices:["64","128","256","512"],answer:2,explanation:"عند ضرب قوتين لهما الأساس نفسه نجمع الأسس: 2⁵ × 2³ = 2⁸ = 256."},
  {id:"q17",section:"quant",category:"الهندسة",prompt:"مساحة مستطيل 96 سم² وطوله 12 سم. ما محيطه؟",choices:["32 سم","36 سم","40 سم","44 سم"],answer:2,explanation:"العرض = 96 ÷ 12 = 8 سم. المحيط = 2 × (12 + 8) = 40 سم."},
  {id:"q18",section:"quant",category:"السرعة",prompt:"قطار طوله 180 مترًا تجاوز عمودًا ثابتًا بالكامل خلال 12 ثانية. ما سرعته بالكيلومتر لكل ساعة؟",choices:["45","54","60","72"],answer:1,explanation:"السرعة = 180 ÷ 12 = 15 م/ث. للتحويل إلى كم/ساعة نضرب في 3.6، فتصبح 54 كم/ساعة."},

  {id:"v01",section:"verbal",category:"التناظر اللفظي",prompt:"كتاب : قراءة\nطعام : ؟",choices:["طبخ","أكل","مطبخ","جوع"],answer:1,explanation:"العلاقة هي شيء وفعل الانتفاع الأساسي منه: الكتاب يُقرأ، والطعام يُؤكل."},
  {id:"v02",section:"verbal",category:"التناظر اللفظي",prompt:"طبيب : مريض\nمعلم : ؟",choices:["مدرسة","كتاب","طالب","درس"],answer:2,explanation:"الطبيب يقدم خدمته للمريض، والمعلم يقدم تعليمه للطالب."},
  {id:"v03",section:"verbal",category:"التناظر اللفظي",prompt:"عين : إبصار\nأذن : ؟",choices:["صوت","سمع","كلام","نظر"],answer:1,explanation:"العين عضو الإبصار، والأذن عضو السمع."},
  {id:"v04",section:"verbal",category:"إكمال الجمل",prompt:"كلما كان الهدف واضحًا، أصبح اتخاذ القرار أكثر ____ لأن الخيارات تُقاس بمدى خدمتها لذلك الهدف.",choices:["غموضًا","سهولةً","تأخيرًا","تشتتًا"],answer:1,explanation:"وضوح الهدف يقلل الحيرة بين الخيارات، لذلك تصبح عملية اتخاذ القرار أسهل."},
  {id:"v05",section:"verbal",category:"إكمال الجمل",prompt:"لا تُقاس جودة الفكرة بكثرة كلماتها، بل بقدرتها على إيصال المعنى بوضوح و____.",choices:["تعقيد","اختصار","تردد","مبالغة"],answer:1,explanation:"السياق يمدح الوضوح وقلة الكلمات، لذا الأنسب هو الاختصار."},
  {id:"v06",section:"verbal",category:"الخطأ السياقي",prompt:"اختر الكلمة غير المنسجمة مع سياق الجملة:\nحرص خالد على الوصول مبكرًا، لذلك خرج من المنزل بعد بدء الموعد بساعة.",choices:["حرص","الوصول","مبكرًا","بعد"],answer:3,explanation:"الخروج بعد بدء الموعد يناقض الحرص على الوصول مبكرًا. الكلمة المسببة للتناقض هي «بعد»."},
  {id:"v07",section:"verbal",category:"الخطأ السياقي",prompt:"اختر الكلمة غير المنسجمة مع سياق الجملة:\nساعد التنظيم الجيد الفريق على إنجاز المهمة بسرعة، فزاد ذلك من فوضى العمل.",choices:["التنظيم","إنجاز","بسرعة","فوضى"],answer:3,explanation:"التنظيم الجيد والإنجاز السريع لا ينسجمان مع زيادة الفوضى في هذا السياق."},
  {id:"v08",section:"verbal",category:"المفردات",prompt:"ما الكلمة الأقرب في المعنى إلى «وجيز»؟",choices:["قصير","واسع","غامض","متكرر"],answer:0,explanation:"«وجيز» تعني قصيرًا أو مختصرًا."},
  {id:"v09",section:"verbal",category:"المفردات",prompt:"ما الكلمة المضادة لـ «نادر»؟",choices:["قليل","شائع","بعيد","ضعيف"],answer:1,explanation:"نادر تعني قليل الحدوث أو الوجود، ومضادها شائع."},
  {id:"v10",section:"verbal",category:"التناظر اللفظي",prompt:"بذرة : شجرة\nفكرة : ؟",choices:["رأي","مشروع","سؤال","ذاكرة"],answer:1,explanation:"البذرة تنمو لتصبح شجرة، والفكرة تنمو وتتطور لتصبح مشروعًا."},
  {id:"v11",section:"verbal",category:"إكمال الجمل",prompt:"القارئ الجيد لا يكتفي بجمع المعلومات، بل ____ بينها ليصل إلى معنى متكامل.",choices:["يفصل","يربط","يهمل","يكرر"],answer:1,explanation:"الوصول إلى معنى متكامل يحتاج ربط المعلومات ببعضها."},
  {id:"v12",section:"verbal",category:"إكمال الجمل",prompt:"عندما تتعدد المهام في وقت قصير، يساعد ترتيبها حسب الأولوية على تقليل ____ وزيادة التركيز.",choices:["التشتت","الوضوح","الإنجاز","الدقة"],answer:0,explanation:"ترتيب الأولويات يقلل التشتت بين المهام."},
  {id:"v13",section:"verbal",category:"استيعاب المقروء",prompt:"اقرأ ثم أجب:\n«المراجعة المتباعدة تعتمد على توزيع جلسات التعلم على أوقات مختلفة بدل جمعها في جلسة واحدة طويلة. هذا الأسلوب يمنح العقل فرصًا متكررة لاسترجاع المعلومة، مما يدعم ثباتها مدة أطول.»\n\nما الفكرة الرئيسة للنص؟",choices:["الجلسات الطويلة أفضل دائمًا","توزيع المراجعة يساعد على تثبيت المعلومات","الذاكرة لا تستفيد من الاسترجاع","المراجعة يجب أن تكون يومية فقط"],answer:1,explanation:"النص يشرح فائدة توزيع جلسات المراجعة في دعم ثبات المعلومات."},
  {id:"v14",section:"verbal",category:"استيعاب المقروء",prompt:"بناءً على النص التالي:\n«المراجعة المتباعدة تعتمد على توزيع جلسات التعلم على أوقات مختلفة بدل جمعها في جلسة واحدة طويلة. هذا الأسلوب يمنح العقل فرصًا متكررة لاسترجاع المعلومة، مما يدعم ثباتها مدة أطول.»\n\nما السبب المذكور لفائدة المراجعة المتباعدة؟",choices:["تقلل عدد المعلومات","تمنع الحاجة للنوم","تكرر فرص استرجاع المعلومة","تجعل الجلسة أطول"],answer:2,explanation:"النص يربط الفائدة بإعطاء العقل فرصًا متكررة للاسترجاع."},
  {id:"v15",section:"verbal",category:"استيعاب المقروء",prompt:"اقرأ ثم أجب:\n«لا تعني السرعة في حل المسألة تجاهل خطواتها. الحل الفعال يبدأ بفهم المطلوب، ثم اختيار أقصر طريق صحيح، وأخيرًا التحقق من أن النتيجة منطقية.»\n\nأي خطوة تأتي أولًا بحسب النص؟",choices:["التحقق من النتيجة","فهم المطلوب","اختيار الإجابة الأقرب","اختصار كل الخطوات"],answer:1,explanation:"النص ينص على أن الحل الفعال يبدأ بفهم المطلوب."},
  {id:"v16",section:"verbal",category:"استيعاب المقروء",prompt:"بناءً على النص التالي:\n«لا تعني السرعة في حل المسألة تجاهل خطواتها. الحل الفعال يبدأ بفهم المطلوب، ثم اختيار أقصر طريق صحيح، وأخيرًا التحقق من أن النتيجة منطقية.»\n\nما الذي يرفضه النص؟",choices:["التحقق من منطقية النتيجة","اختيار طريق مختصر وصحيح","فهم السؤال قبل الحل","التضحية بصحة الحل من أجل السرعة"],answer:3,explanation:"النص يرفض أن تتحول السرعة إلى تجاهل للخطوات أو صحة الحل."},
  {id:"v17",section:"verbal",category:"المفردات",prompt:"في قولنا «اتخذ موقفًا حازمًا»، ما معنى «حازمًا» الأقرب؟",choices:["مترددًا","صارمًا","سريعًا","مؤقتًا"],answer:1,explanation:"الحزم يدل على الثبات والصرامة في اتخاذ القرار."},
  {id:"v18",section:"verbal",category:"التناظر اللفظي",prompt:"مفتاح : قفل\nكلمة مرور : ؟",choices:["حساب","لوحة مفاتيح","رسالة","هاتف"],answer:0,explanation:"المفتاح وسيلة للوصول عبر القفل، وكلمة المرور وسيلة للوصول إلى الحساب."}
];

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const STORAGE = "qudurat-review-v1";
const EXAM_AT = new Date("2026-09-27T08:15:00+03:00");

const state = {
  questions: [],
  answers: [],
  checked: new Set(),
  flagged: new Set(),
  current: 0,
  duration: 0,
  remaining: 0,
  startedAt: 0,
  timerId: null,
  mode: "quick",
  sound: true
};

function shuffle(items){
  const a = [...items];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function readStore(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE)) || {history:[],mistakes:[],sound:true};
  }catch{
    return {history:[],mistakes:[],sound:true};
  }
}

function writeStore(data){
  localStorage.setItem(STORAGE,JSON.stringify(data));
}

function showScreen(id){
  $$(".screen").forEach(el=>el.classList.remove("active"));
  $(id).classList.add("active");
  window.scrollTo({top:0,behavior:"smooth"});
}

function sectionName(section){
  return section === "quant" ? "كمي" : "لفظي";
}

function pickQuestions(mode){
  const quant = shuffle(QUESTIONS.filter(q=>q.section==="quant"));
  const verbal = shuffle(QUESTIONS.filter(q=>q.section==="verbal"));

  if(mode==="full") return shuffle([...quant,...verbal]);

  if(mode==="quick"){
    return shuffle([...quant.slice(0,10),...verbal.slice(0,10)]);
  }

  const store=readStore();
  const last=store.history?.[store.history.length-1];
  if(!last) return shuffle([...quant.slice(0,6),...verbal.slice(0,6)]);
  const weak = last.quant <= last.verbal ? "quant" : "verbal";
  const pool = weak==="quant" ? quant : verbal;
  return pool.slice(0,12);
}

function durationFor(mode){
  if(mode==="full") return 45*60;
  if(mode==="weak") return 16*60;
  return 25*60;
}

function startQuiz(mode){
  clearInterval(state.timerId);
  state.mode=mode;
  state.questions=pickQuestions(mode);
  state.answers=Array(state.questions.length).fill(null);
  state.checked=new Set();
  state.flagged=new Set();
  state.current=0;
  state.duration=durationFor(mode);
  state.remaining=state.duration;
  state.startedAt=Date.now();

  showScreen("#quizScreen");
  renderDots();
  renderQuestion();
  updateTimer();
  state.timerId=setInterval(()=>{
    state.remaining=Math.max(0,state.remaining-1);
    updateTimer();
    if(state.remaining===0){
      clearInterval(state.timerId);
      finishQuiz(true);
    }
  },1000);
}

function renderQuestion(){
  const q=state.questions[state.current];
  if(!q) return;
  const isChecked=state.checked.has(state.current);
  const selected=state.answers[state.current];

  $("#questionCounter").textContent=`${state.current+1} / ${state.questions.length}`;
  $("#sectionLabel").textContent=sectionName(q.section);
  $("#typeTag").textContent=q.category;
  $("#questionText").textContent=q.prompt;
  $("#progressBar").style.width=`${((state.current+1)/state.questions.length)*100}%`;

  const flag=$("#flagQuestion");
  flag.setAttribute("aria-pressed",state.flagged.has(state.current)?"true":"false");

  const letters=["أ","ب","ج","د"];
  $("#choices").innerHTML=q.choices.map((choice,i)=>{
    let classes="choice";
    if(selected===i) classes+=" selected";
    if(isChecked && i===q.answer) classes+=" correct";
    if(isChecked && selected===i && selected!==q.answer) classes+=" wrong";
    return `<button class="${classes}" data-choice="${i}" type="button" ${isChecked?"disabled":""}>
      <span class="choice-letter">${letters[i]}</span>
      <span>${escapeHTML(choice)}</span>
    </button>`;
  }).join("");

  $$(".choice").forEach(btn=>btn.addEventListener("click",()=>{
    if(isChecked) return;
    state.answers[state.current]=Number(btn.dataset.choice);
    renderQuestion();
  }));

  $("#prevQuestion").disabled=state.current===0;
  $("#checkAnswer").classList.toggle("hidden",isChecked);
  $("#nextQuestion").classList.toggle("hidden",!isChecked);
  $("#checkAnswer").disabled=selected===null;

  if(isChecked){
    const correct=selected===q.answer;
    $("#explanationBox").classList.remove("hidden");
    $("#answerStatus").textContent=correct?"إجابة صحيحة":"الإجابة تحتاج مراجعة";
    $("#answerStatus").className=`answer-status ${correct?"good":"bad"}`;
    $("#explanationText").textContent=q.explanation;
    $("#nextQuestion").textContent=state.current===state.questions.length-1?"عرض النتيجة":"التالي";
  }else{
    $("#explanationBox").classList.add("hidden");
  }
  updateDots();
}

function renderDots(){
  $("#questionDots").innerHTML=state.questions.map((_,i)=>`<button class="qdot" data-index="${i}" type="button" aria-label="السؤال ${i+1}"></button>`).join("");
  $$(".qdot").forEach(dot=>dot.addEventListener("click",()=>{
    state.current=Number(dot.dataset.index);
    renderQuestion();
  }));
}

function updateDots(){
  $$(".qdot").forEach((dot,i)=>{
    dot.classList.toggle("current",i===state.current);
    dot.classList.toggle("answered",state.checked.has(i));
    dot.classList.toggle("flagged",state.flagged.has(i));
  });
}

function checkCurrent(){
  if(state.answers[state.current]===null) return;
  state.checked.add(state.current);
  const q=state.questions[state.current];
  const correct=state.answers[state.current]===q.answer;
  updateMistake(q.id,correct);
  playTone(correct);
  renderQuestion();
}

function updateMistake(id,correct){
  const store=readStore();
  const set=new Set(store.mistakes || []);
  if(correct) set.delete(id);
  else set.add(id);
  store.mistakes=[...set];
  writeStore(store);
}

function nextQuestion(){
  if(state.current===state.questions.length-1){
    finishQuiz(false);
    return;
  }
  state.current++;
  renderQuestion();
}

function prevQuestion(){
  if(state.current>0){
    state.current--;
    renderQuestion();
  }
}

function finishQuiz(fromTimer=false){
  clearInterval(state.timerId);
  state.timerId=null;

  const total=state.questions.length;
  let correct=0;
  let verbalCorrect=0,verbalTotal=0,quantCorrect=0,quantTotal=0;
  const cats={};

  state.questions.forEach((q,i)=>{
    const ok=state.answers[i]===q.answer;
    if(ok) correct++;
    if(q.section==="verbal"){ verbalTotal++; if(ok) verbalCorrect++; }
    else { quantTotal++; if(ok) quantCorrect++; }

    if(!cats[q.category]) cats[q.category]={correct:0,total:0};
    cats[q.category].total++;
    if(ok) cats[q.category].correct++;

    if(!ok) updateMistake(q.id,false);
  });

  const pct=Math.round(correct/total*100);
  const verbal=verbalTotal?Math.round(verbalCorrect/verbalTotal*100):null;
  const quant=quantTotal?Math.round(quantCorrect/quantTotal*100):null;
  const elapsed=Math.min(state.duration,Math.round((Date.now()-state.startedAt)/1000));

  const store=readStore();
  store.history=store.history || [];
  store.history.push({
    date:Date.now(),
    mode:state.mode,
    score:pct,
    verbal:verbal ?? 0,
    quant:quant ?? 0,
    verbalApplicable:verbal!==null,
    quantApplicable:quant!==null
  });
  store.history=store.history.slice(-30);
  writeStore(store);

  renderResults({total,correct,pct,verbal,quant,cats,elapsed,fromTimer});
  showScreen("#resultScreen");
  updateDashboard();
}

function renderResults(r){
  $("#finalScore").textContent=`${r.pct}%`;
  $("#scoreRing").style.setProperty("--score",r.pct);
  $("#correctCount").textContent=`${r.correct} / ${r.total}`;
  $("#timeUsed").textContent=formatTime(r.elapsed);

  const v=r.verbal;
  const q=r.quant;
  $("#verbalScore").textContent=v===null?"لم يُختبر":`${v}%`;
  $("#quantScore").textContent=q===null?"لم يُختبر":`${q}%`;
  $("#verbalBar").style.width=`${v ?? 0}%`;
  $("#quantBar").style.width=`${q ?? 0}%`;

  let title="ركز على الأساسيات.";
  let summary="راجع الأخطاء بهدوء، ثم اختبر أضعف قسم بجولة قصيرة.";
  if(r.pct>=85){
    title="مستواك قوي في هذه الجولة.";
    summary="الآن راجع الأخطاء القليلة فقط، ولا تستهلك طاقتك في جولة طويلة أخرى.";
  }else if(r.pct>=70){
    title="مستواك جيد.";
    summary="عندك أساس جيد. ركز الآن على الأنواع اللي نزلت نسبتها بدل إعادة كل شيء.";
  }else if(r.pct>=55){
    title="عندك نقاط واضحة تحتاج تثبيت.";
    summary="راجع الأنواع الأضعف أدناه، ثم جرّب جولة قصيرة عليها.";
  }
  if(r.fromTimer) summary="انتهى الوقت. "+summary;
  $("#resultTitle").textContent=title;
  $("#resultSummary").textContent=summary;

  const catEntries=Object.entries(r.cats).sort((a,b)=>(a[1].correct/a[1].total)-(b[1].correct/b[1].total));
  $("#categoryBreakdown").innerHTML=catEntries.map(([name,data])=>{
    const p=Math.round(data.correct/data.total*100);
    const cls=p>=80?"high":p>=60?"mid":"low";
    return `<div class="category-row">
      <div><strong>${escapeHTML(name)}</strong><small>${data.correct} من ${data.total} صحيحة</small></div>
      <span class="category-score ${cls}">${p}%</span>
    </div>`;
  }).join("");

  const wrong=state.questions.map((question,i)=>({question,i})).filter(x=>state.answers[x.i]!==x.question.answer);
  $("#wrongBadge").textContent=`${wrong.length} أخطاء`;
  $("#wrongList").innerHTML=wrong.length?wrong.map(({question,i})=>wrongCard(question,state.answers[i])).join(""):'<div class="empty-state">ما عندك أخطاء في هذه الجولة.</div>';
}

function wrongCard(q,selectedIndex=null){
  const chosen = selectedIndex===null ? "لم تتم الإجابة" : q.choices[selectedIndex];
  return `<article class="wrong-item">
    <div class="wrong-meta">
      <span class="tag">${sectionName(q.section)}</span>
      <span class="tag">${escapeHTML(q.category)}</span>
    </div>
    <h3>${escapeHTML(q.prompt).replace(/\n/g,"<br>")}</h3>
    <p>إجابتك: ${escapeHTML(chosen)}</p>
    <p class="correct-answer">الصحيح: ${escapeHTML(q.choices[q.answer])}</p>
    <p>${escapeHTML(q.explanation)}</p>
  </article>`;
}

function showSavedMistakes(){
  const store=readStore();
  const ids=new Set(store.mistakes || []);
  const items=QUESTIONS.filter(q=>ids.has(q.id));
  $("#savedMistakesList").innerHTML=items.length
    ? items.map(q=>wrongCard(q,null)).join("")
    : '<div class="empty-state">ما عندك أخطاء محفوظة حاليًا. ابدأ جولة قصيرة.</div>';
  showScreen("#mistakesScreen");
}

function updateDashboard(){
  const store=readStore();
  state.sound=store.sound!==false;
  $("#soundToggle").textContent=state.sound?"صوت: يعمل":"صوت: صامت";

  const h=store.history || [];
  $("#attemptsBadge").textContent=`${h.length} ${h.length===1?"محاولة":"محاولات"}`;
  $("#mistakeCount").textContent=(store.mistakes || []).length;
  $("#bestScore").textContent=h.length?`${Math.max(...h.map(x=>x.score))}%`:"--";

  const v=h.filter(x=>x.verbalApplicable!==false && typeof x.verbal==="number");
  const q=h.filter(x=>x.quantApplicable!==false && typeof x.quant==="number");
  $("#verbalBest").textContent=v.length?`${Math.max(...v.map(x=>x.verbal))}%`:"--";
  $("#quantBest").textContent=q.length?`${Math.max(...q.map(x=>x.quant))}%`:"--";
}

function updateTimer(){
  $("#timer").textContent=formatTime(state.remaining);
  $("#timer").classList.toggle("warning",state.remaining<=300 && state.remaining>60);
  $("#timer").classList.toggle("danger",state.remaining<=60);
}

function formatTime(sec){
  const m=Math.floor(sec/60).toString().padStart(2,"0");
  const s=Math.floor(sec%60).toString().padStart(2,"0");
  return `${m}:${s}`;
}

function updateExamCountdown(){
  const card=$("#examCountdownCard");
  const out=$("#examCountdown");
  const diff=EXAM_AT-Date.now();
  if(diff<=0){
    card.style.display="none";
    return;
  }
  const total=Math.floor(diff/1000);
  const h=Math.floor(total/3600);
  const m=Math.floor((total%3600)/60);
  const s=total%60;
  out.textContent=`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function escapeHTML(value){
  return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}

function playTone(correct){
  if(!state.sound) return;
  try{
    const Ctx=window.AudioContext||window.webkitAudioContext;
    const ctx=new Ctx();
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    osc.type="sine";
    osc.frequency.value=correct?620:220;
    gain.gain.setValueAtTime(.035,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.12);
    osc.connect(gain);gain.connect(ctx.destination);
    osc.start();osc.stop(ctx.currentTime+.12);
  }catch{}
}

function openConfirm(title,text,onConfirm){
  const d=$("#confirmDialog");
  $("#dialogTitle").textContent=title;
  $("#dialogText").textContent=text;
  d.showModal();
  d.addEventListener("close",function handler(){
    d.removeEventListener("close",handler);
    if(d.returnValue==="confirm") onConfirm();
  });
}

$$(".mode-card").forEach(btn=>btn.addEventListener("click",()=>startQuiz(btn.dataset.mode)));
$("#checkAnswer").addEventListener("click",checkCurrent);
$("#nextQuestion").addEventListener("click",nextQuestion);
$("#prevQuestion").addEventListener("click",prevQuestion);
$("#flagQuestion").addEventListener("click",()=>{
  if(state.flagged.has(state.current)) state.flagged.delete(state.current);
  else state.flagged.add(state.current);
  renderQuestion();
});
$("#quitQuiz").addEventListener("click",()=>{
  openConfirm("إنهاء الجولة؟","سيتم حساب نتيجتك بما أجبت عنه حتى الآن.",()=>finishQuiz(false));
});
$("#backHome").addEventListener("click",()=>showScreen("#homeScreen"));
$("#retryWeak").addEventListener("click",()=>startQuiz("weak"));
$("#reviewMistakesHome").addEventListener("click",showSavedMistakes);
$("#mistakesBack").addEventListener("click",()=>showScreen("#homeScreen"));
$("#soundToggle").addEventListener("click",()=>{
  const store=readStore();
  store.sound=store.sound===false;
  writeStore(store);
  updateDashboard();
});
$("#resetAll").addEventListener("click",()=>{
  openConfirm("مسح التقدم؟","سيتم حذف نتائج المحاولات والأخطاء المحفوظة على هذا الجهاز.",()=>{
    localStorage.removeItem(STORAGE);
    updateDashboard();
  });
});

document.addEventListener("keydown",(e)=>{
  if(!$("#quizScreen").classList.contains("active")) return;
  if(["1","2","3","4"].includes(e.key) && !state.checked.has(state.current)){
    const i=Number(e.key)-1;
    if(i<state.questions[state.current].choices.length){
      state.answers[state.current]=i;
      renderQuestion();
    }
  }
  if(e.key==="Enter"){
    if(state.checked.has(state.current)) nextQuestion();
    else checkCurrent();
  }
});

updateDashboard();
updateExamCountdown();
setInterval(updateExamCountdown,1000);
