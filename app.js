/* ================= QUESTIONS ================= */
/* This-or-that pairs: subject picks one, partner guesses. */
const PAIRS = [
["Coffee","Tea"],["Sunrise","Sunset"],["Beach","Mountains"],["Movie night","Game night"],["Sweet","Salty"],
["Early bird","Night owl"],["Texting","Calling"],["Summer","Winter"],["Cats","Dogs"],["Pizza","Burger"],
["Books","Movies"],["City","Countryside"],["Plan everything","Go with the flow"],["Cook at home","Eat out"],["Rain","Sunshine"],
["Dancing","Singing"],["Hugs","Kisses"],["Surprise gift","Planned gift"],["Road trip","Flight"],["Bath","Shower"],
["Chocolate","Ice cream"],["Morning cuddles","Night cuddles"],["Adventure","Relaxation"],["Big party","Small gathering"],["Save","Spend"],
["Handwritten letter","Voice note"],["Netflix","YouTube"],["Spicy","Mild"],["Window seat","Aisle seat"],["Music","Silence"],
["Photos","Videos"],["Say sorry first","Wait it out"],["Sneakers","Sandals"],["Comedy","Horror"],["Romance","Thriller"],
["Lazy Sunday","Busy Sunday"],["Camping","Hotel"],["Snow","Sand"],["Pancakes","Waffles"],["Breakfast in bed","Dinner date"],
["Stay in","Go out"],["Driver","Passenger"],["Public affection","Private affection"],["Gifts","Quality time"],["Talk it out","Cool off first"],
["Dress up","Dress comfy"],["Board games","Video games"],["Arrive early","Arrive late"],["Old songs","New songs"],["Spontaneous trip","Planned trip"],
["Cook together","Order in together"],["Long hugs","Long talks"],["Sea","Forest"],["Fries","Popcorn"],["Sunny day","Rainy day"],
["Window shopping","Online shopping"],["Text at midnight","Talk at midnight"]
];
/* Topics with four answers: subject sees "Your ...?", partner sees "Name's ...?". */
const TOPICS = [
["favourite way to spend a weekend",["Cosy at home","Out exploring","Meeting friends","Sleeping in"]],
["comfort food",["Pizza","Pasta","Ice cream","Fries"]],
["love language",["Kind words","Touch","Quality time","Helping out"]],
["biggest fear",["Heights","Being alone","Failing","Spiders"]],
["dream holiday",["Beach island","Snowy mountains","Big city","Hidden village"]],
["go-to way to relax",["Music","A show","A walk","A nap"]],
["first thing to do with a million",["Travel","Buy a home","Invest it","Share it"]],
["favourite time of day",["Morning","Afternoon","Evening","Late night"]],
["favourite movie genre",["Romance","Comedy","Thriller","Fantasy"]],
["way of handling stress",["Talk about it","Keep busy","Go quiet","Sleep on it"]],
["dream superpower",["Flying","Reading minds","Invisibility","Stopping time"]],
["ideal date",["Candlelit dinner","Movie under blankets","Long drive","Street food walk"]],
["favourite season",["Spring","Summer","Autumn","Winter"]],
["most-used app",["Messaging","Music","Videos","Social feed"]],
["morning drink",["Coffee","Tea","Water","Juice"]],
["ideal birthday",["Big party","Quiet dinner","Surprise trip","Just cake"]],
["favourite kind of music",["Pop","Rock","Classical","Hip-hop"]],
["biggest pet peeve",["Being late","Loud chewing","Messy room","Slow replies"]],
["sense of humour",["Silly jokes","Sarcasm","Memes","Bad puns"]],
["dream job vibe",["Creative","Adventurous","Steady and safe","Being the boss"]],
["favourite dessert",["Chocolate","Fruit","Ice cream","Cake"]],
["biggest strength",["Kindness","Humour","Patience","Determination"]],
["biggest spending habit",["Food","Clothes","Gadgets","Trips"]],
["first thing they notice in someone",["Smile","Eyes","Voice","Style"]],
["way of saying sorry",["Words","A small gift","A hug","Time together"]],
["ideal night in",["A movie","Games","Cooking","Deep talk"]],
["favourite place to relax",["Bed","Balcony","Café","Park"]],
["morning mood",["Chatty","Grumpy","Sleepy","Energetic"]],
["favourite kind of gift",["Handmade","Practical","Surprise","Experience"]],
["happiest feeling",["Loved","Free","Proud","Calm"]],
["favourite thing about us",["Our laughter","Late talks","Small gestures","Adventures"]],
["item for a desert island",["Music","A book","Their phone","You"]],
["texting style",["Long messages","Short and quick","Voice notes","Memes and stickers"]],
["favourite weather",["Rain","Sun","Snow","A cool breeze"]],
["dream pet",["Dog","Cat","Rabbit","Parrot"]],
["reaction to scary movies",["Watches through fingers","Loves them","Avoids them","Falls asleep"]],
["most important thing in love",["Trust","Humour","Respect","Passion"]],
["favourite way to be surprised",["Flowers","A trip","A note","A dinner"]],
["biggest dream",["Travel the world","Build something","A peaceful home","Be known for something"]]
];
const QS = [...PAIRS.map(p => ({t:'', o:p})), ...TOPICS.map(t => ({t:t[0], o:t[1]}))];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

/* ================= STATE ================= */
const KEY = 'know-me-v1';
const DEF = {names:['',''], settings:{sound:true, turns:10}, game:null, history:[], used:[]};
let S = load();
function load(){
  try{ const r = JSON.parse(localStorage.getItem(KEY)); if (r) return {...JSON.parse(JSON.stringify(DEF)), ...r, settings:{...DEF.settings, ...(r.settings||{})}}; }catch(e){}
  return JSON.parse(JSON.stringify(DEF));
}
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
if (!Array.isArray(S.used)) S.used = [];
const ui = {screen: S.game ? 'play' : 'splash', sel: String(S.settings.turns), custom: '', pick: null, res: 0, detail: 0, from: null};
if (![6,10,16].includes(S.settings.turns)){ ui.sel = 'custom'; ui.custom = String(S.settings.turns); }

/* ================= HELPERS ================= */
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const N = i => esc(S.names[i] || 'Player ' + (i+1));
const fmtDate = ts => new Date(ts).toLocaleDateString(undefined, {day:'numeric', month:'short'});
let ac;
function beep(f=520, d=.14, v=.035){
  if (!S.settings.sound) return;
  try{ ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    const o = ac.createOscillator(), g = ac.createGain(); o.type='sine'; o.frequency.value=f;
    g.gain.setValueAtTime(v, ac.currentTime); g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime+d);
    o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime+d); }catch(e){}
}
function buzz(ms=14){ if (S.settings.sound && navigator.vibrate) try{ navigator.vibrate(ms); }catch(e){} }
let toastT;
function toast(m){ const t=$('#toast'); t.textContent=m; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),1900); }
function confirmBox(title, msg, ok, cb){
  const m = $('#modal');
  m.innerHTML = `<div class="box glass"><h3>${title}</h3><p>${msg}</p><div class="acts"><button class="btn ghost" data-m="no">Cancel</button><button class="btn" data-m="yes">${ok}</button></div></div>`;
  m.style.display = 'flex';
  m.onclick = e => { const b = e.target.closest('[data-m]'); if (!b && e.target !== m) return; m.style.display = 'none'; if (b && b.dataset.m === 'yes') cb(); };
}
/* never repeat a question until all have been used, then start over */
function pickQuestion(){
  let avail = QS.map((_, i) => i).filter(i => !S.used.includes(i));
  if (!avail.length){ S.used = []; avail = QS.map((_, i) => i); }
  const i = avail[Math.floor(Math.random() * avail.length)];
  S.used.push(i);
  return QS[i];
}
const sv = (p, s=22) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const ic = {
  back: sv('<path d="M15 5l-7 7 7 7"/>'), gear: sv('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>', 20),
  user: sv('<circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-3.6 3.8-5.4 7-5.4s6.2 1.8 7 5.4"/>'),
  play: sv('<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M10 8.5l5 3.5-5 3.5z"/>'),
  clock: sv('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  chev: sv('<path d="M9 5l7 7-7 7"/>', 18), arrow: sv('<path d="M5 12h14M13 6l6 6-6 6"/>', 18),
  sound: sv('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 010 7"/>'),
  reset: sv('<path d="M4 12a8 8 0 108-8 8 8 0 00-6 2.7L4 9"/><path d="M4 4v5h5"/>'),
  edit: sv('<path d="M4 20h4L19 9a2.8 2.8 0 00-4-4L4 16z"/>'), book: sv('<path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3z"/><path d="M5 17a3 3 0 013-3h11"/>'),
  hash: sv('<path d="M5 9h14M5 15h14M10 4L8 20M16 4l-2 16"/>')
};

/* ================= LAYOUT ================= */
function bar({back, title, serif, gear, act}){
  const l = back ? `<button class="ib" data-act="${act||'go'}" data-v="${back}" aria-label="Back">${ic.back}</button>` : '';
  const r = gear ? `<button class="ib" data-act="go" data-v="settings" aria-label="Settings">${ic.gear}</button>` : '';
  return `<div class="bar"><div>${l}</div><div class="bt ${serif?'s':''}">${title||''}</div><div class="r">${r}</div></div>`;
}
const navHTML = sc => { const on = {home:'home', gsetup:'home', history:'history', detail:'history', settings:'settings'}[sc];
  return [['home','Play',ic.play],['history','History',ic.clock],['settings','Settings',ic.gear]]
    .map(([v,l,i]) => `<button data-act="go" data-v="${v}" class="${on===v?'on':''}">${i}<span>${l}</span></button>`).join(''); };
function chipsHTML(){
  const c = v => `<button class="chip glass ${ui.sel===v?'on':''}" data-act="chip" data-v="${v}"><b>${v==='custom'?'Custom':v}</b><small>${v==='custom'?'your number':'questions'}</small></button>`;
  return `<div class="chips">${c('6')}${c('10')}${c('16')}${c('custom')}</div>` +
    (ui.sel==='custom' ? `<div class="custom glass"><input id="customN" type="number" inputmode="numeric" min="2" max="40" placeholder="2 – 40" value="${esc(ui.custom)}" aria-label="Custom number of questions"><span>questions</span></div>` : '');
}
const chosenTotal = () => { const n = ui.sel==='custom' ? parseInt(ui.custom,10) : parseInt(ui.sel,10); return (n>=2 && n<=40) ? n : null; };
const pct = (m, t) => t ? Math.round(100 * m / t) : 0;
const optsHTML = (q, sel) => {
  const two = q.o.length === 2;
  return `<div class="opts ${two?'two':''}">` + q.o.map((t, i) => `${two && i===1 ? '<div class="or">OR</div>' : ''}<button class="opt glass ${sel===i?'on':''}" data-act="pickOpt" data-v="${i}"><i>${'ABCD'[i]}</i><span>${esc(t)}</span></button>`).join('') + `</div>`;
};

/* ================= SCREENS ================= */
const SC = {
splash(){
  return {top:'', nav:false, plain:true, body:`
  <div class="splash" data-act="start">
    <div class="spacer"></div>
    <div class="emblem"><svg viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <defs><linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#7d818d"/></linearGradient></defs>
      <circle class="orbit" cx="60" cy="60" r="58" stroke="rgba(255,255,255,.26)" stroke-width=".8" stroke-dasharray="1.5 6" stroke-linecap="round"/>
      <g class="beat"><path transform="translate(3 -1) scale(4.6)" d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" fill="rgba(255,255,255,.06)" stroke="url(#eg)" stroke-width=".3"/>
      <text x="60" y="73" text-anchor="middle" font-family="Georgia,serif" font-size="40" fill="url(#eg)">?</text></g>
    </svg></div>
    <h1 class="metal">How well do<br>you know me?</h1>
    <p class="tg">A game for two</p>
    <div class="spacer"></div>
    <button class="btn" data-act="start">Tap to start ${ic.arrow}</button>
  </div>`};
},
names(){
  return {top: bar({back: ui.from==='settings' ? 'settings' : null}), nav:false, body:`
  <div class="center" style="margin-top:10px"><h1 class="serif ttl">Enter Player Names</h1><p class="sub">Two people. One phone.</p></div>
  <div class="field glass" style="margin-top:34px"><span class="av">${ic.user}</span><div style="flex:1"><label for="n1">Player 1</label><input id="n1" maxlength="14" placeholder="Name" value="${esc(S.names[0])}" autocomplete="off"></div></div>
  <div class="field glass"><span class="av">${ic.user}</span><div style="flex:1"><label for="n2">Player 2</label><input id="n2" maxlength="14" placeholder="Name" value="${esc(S.names[1])}" autocomplete="off"></div></div>
  <div class="spacer"></div>
  <button class="btn" data-act="saveNames">Continue ${ic.arrow}</button>`};
},
home(){
  const g = S.game, h = S.history;
  const avg = h.length ? Math.round(h.reduce((a, x) => a + x.pct, 0) / h.length) : 0;
  const best = h.length ? Math.max(...h.map(x => x.pct)) : 0;
  return {top: bar({gear:true}), nav:true, body:`
  <div style="margin-top:14px"><h1 class="serif hello metal">Hey,<br>${N(0)} &amp; ${N(1)}</h1><p class="sub" style="font-size:16px;margin-top:14px">How well do you really know each other?</p></div>
  ${h.length ? `<div class="strip3 glass"><div><b>${h.length}</b><small>Games</small></div><div><b>${avg}%</b><small>Average</small></div><div><b>${best}%</b><small>Best</small></div></div>` : ''}
  <div class="spacer"></div>
  ${g ? `<div class="resume glass"><i></i><span>Game in progress · <b>Question ${g.idx+1} of ${g.total}</b></span></div>` : ''}
  <button class="btn" data-act="${g?'resume':'newGame'}">${g?'Resume Game':'Start Game'} ${ic.arrow}</button>
  ${g ? `<button class="link" data-act="newGame">Start a new game</button>` : ''}`};
},
gsetup(){
  return {top: bar({back:'home', title:'New game'}), nav:true, body:`
  <div class="center" style="margin-top:8px"><h1 class="serif ttl">How many questions?</h1><p class="sub">One person answers, the other guesses.</p></div>
  ${chipsHTML()}
  <p class="note">${N(0)} answers first, then you swap.</p>
  <div class="spacer"></div>
  <button class="btn" data-act="startGame">Start Game ${ic.arrow}</button>`};
},
play(){
  const g = S.game;
  if (!g){ ui.screen = 'home'; return SC.home(); }
  const sub = g.idx % 2, gue = 1 - sub, q = g.cur;
  const top = bar({back:'leave', act:'leave', title:`Question ${g.idx+1} / ${g.total}`}) + `<div class="prog"><i style="transform:scaleX(${g.idx/g.total})"></i></div>`;
  const ini = i => esc((S.names[i] || '?').trim().charAt(0).toUpperCase());

  if (g.phase === 'intro') return {top, nav:false, body:`
    <div class="spacer"></div>
    <div class="center"><div class="avatar">${ini(sub)}</div>
      <h2 class="serif big metal">${N(sub)}'s turn</h2>
      <p class="sub" style="margin-top:14px;max-width:260px">Pass the phone to ${N(sub)}.<br>Answer honestly. ${N(gue)} will try to guess.</p></div>
    <div class="spacer"></div>
    <button class="btn" data-act="ready">I'm ready ${ic.arrow}</button>`};

  if (g.phase === 'ask') return {top, nav:false, body:`
    <div class="who"><span class="tagc"><i></i>Only ${N(sub)} looks</span></div>
    <p class="q">${q.t ? `Your ${esc(q.t)}?` : 'Which one is you?'}</p>
    ${optsHTML(q, ui.pick)}
    <div class="spacer"></div>
    <button class="btn" data-act="lock" ${ui.pick==null?'disabled':''}>Lock in answer ${ic.arrow}</button>`};

  if (g.phase === 'pass') return {top, nav:false, body:`
    <div class="spacer"></div>
    <div class="center"><p class="eyebrow">Answer locked</p>
      <h2 class="serif big metal" style="font-size:34px">Nicely done.</h2>
      <p class="sub" style="margin-top:16px;font-size:16px">Pass the phone to ${N(gue)}.</p></div>
    <div class="spacer"></div>
    <button class="btn" data-act="passReady">I'm ready ${ic.arrow}</button>`};

  if (g.phase === 'guess') return {top, nav:false, body:`
    <div class="who"><span class="tagc"><i></i>${N(gue)}'s guess</span></div>
    <p class="q">${q.t ? `${N(sub)}'s ${esc(q.t)}?` : `Which one would ${N(sub)} pick?`}</p>
    ${optsHTML(q, ui.pick)}
    <div class="spacer"></div>
    <button class="btn" data-act="lockGuess" ${ui.pick==null?'disabled':''}>Lock in guess ${ic.arrow}</button>`};

  if (g.phase === 'reveal'){
    const ok = g.guess === g.ans, last = g.idx + 1 >= g.total;
    const m = g.items.filter(x => x.ok).length;
    return {top, nav:false, body:`
    <div class="center" style="margin-top:8px"><p class="eyebrow" style="margin:0 0 10px">The reveal</p><p class="serif" style="margin:0;font-size:20px;color:var(--ink2);text-align:center;line-height:1.4">${esc(q.t ? cap(q.t) : q.o.join(' or '))}</p></div>
    <div class="rv">
      <div class="rp glass a"><small>${N(gue)} guessed</small><b>${esc(q.o[g.guess])}</b></div>
      <div class="rp glass b"><small>${N(sub)} chose</small><b>${esc(q.o[g.ans])}</b></div>
      <div class="rp v verdict ${ok?'ok':'no'}"><h3>${ok ? 'In sync ✓' : 'Not this time'}</h3><p>${ok ? `${N(gue)} knows ${N(sub)} well.` : `Now you know something new about ${N(sub)}.`}</p></div>
    </div>
    <div class="spacer"></div>
    <p class="note later" style="margin:0 0 12px">${m} of ${g.items.length} in sync so far</p>
    <button class="btn later" data-act="next">${last ? 'See results' : 'Next question'} ${ic.arrow}</button>`};
  }
  return {top, nav:false, body:''};
},
result(){
  const r = S.history[ui.res];
  if (!r){ ui.screen = 'home'; return SC.home(); }
  const msg = r.pct >= 90 ? 'Two minds, one heart.' : r.pct >= 70 ? 'You really know each other.' : r.pct >= 40 ? 'A lovely mix of known and new.' : 'So much left to discover. That is the fun part.';
  return {top:'', nav:false, body:`
  <div class="spacer"></div>
  <div class="center"><p class="eyebrow">Game complete</p>
    <div class="pct metal">${r.pct}%</div><div class="pcs">in sync</div>
    <p class="msg">${msg}</p>
    <div class="grid2">
      <div class="stat glass"><b>${r.k[1]}/${r.n[1]}</b><small>${esc(r.names[0])} knows ${esc(r.names[1])}</small></div>
      <div class="stat glass"><b>${r.k[0]}/${r.n[0]}</b><small>${esc(r.names[1])} knows ${esc(r.names[0])}</small></div>
    </div></div>
  <div class="spacer"></div>
  <button class="btn ghost" data-act="seeAnswers">See all answers</button><div class="gap"></div>
  <button class="btn" data-act="again">Play Again</button><div class="gap"></div>
  <button class="link" data-act="homeAfter">Back Home</button>`};
},
history(){
  const h = S.history;
  let body = `<div class="center"><h1 class="serif ttl" style="font-size:26px">Game History</h1></div>`;
  if (!h.length) body += `<div class="empty">No games yet.<br>Every finished game will be saved here.</div>`;
  else body += `<div class="list">${h.map((x, i) => `<button class="row glass" data-act="detail" data-v="${i}"><div class="rt"><b>${esc(x.names[0])} &amp; ${esc(x.names[1])}</b><small>${fmtDate(x.id)} · ${x.total} questions</small></div><span class="pc metal">${x.pct}%</span><span class="ch">${ic.chev}</span></button>`).join('')}</div>`;
  return {top: bar({back:'home'}), nav:true, body};
},
detail(){
  const r = S.history[ui.detail];
  if (!r){ ui.screen = 'history'; return SC.history(); }
  return {top: bar({back: ui.from==='result' ? 'result' : 'history', title: `${r.pct}% in sync`}), nav: ui.from!=='result', body:
    r.items.map((x, i) => `<div class="rev glass"><div class="rq"><b>${esc(x.q)}</b><span>${i+1}</span></div>
      <div class="ln"><em>${esc(r.names[x.s])}</em> chose <em>${esc(x.a)}</em></div>
      <div class="ln ${x.ok?'ok':'no'}">${esc(r.names[1-x.s])} guessed <em>${esc(x.g)}</em> ${x.ok ? '✓' : ''}</div></div>`).join('') + '<div class="gap"></div>'};
},
settings(){
  const row = (i, t, s, act, v, right) => `<button class="row glass" data-act="${act}" ${v!==undefined?`data-v="${v}"`:''}><span class="ri">${i}</span><span class="rt"><b>${t}</b>${s?`<small>${s}</small>`:''}</span>${right===undefined?`<span class="ch">${ic.chev}</span>`:right}</button>`;
  return {top: bar({back:'home', title:'Settings', serif:true}), nav:true, body:`
  <div class="sec">GAME</div>
  <div class="list" style="margin-top:8px">
    ${row(ic.edit,'Change Player Names',`${N(0)} &amp; ${N(1)}`,'editNames')}
    ${row(ic.sound,'Sound &amp; Vibration',S.settings.sound?'On':'Off','sound','',`<span class="sw ${S.settings.sound?'on':''}"></span>`)}
    ${row(ic.reset,'Reset Data',`Clears history and starts questions fresh`,'reset')}
  </div>
  <div class="sec">ABOUT</div>
  <div class="list" style="margin-top:8px">${row(ic.book,'How to Play','','go','howto')}</div>`};
},
howto(){
  const st = [['Pass the phone','Only the person whose turn it is looks at the screen.'],['Answer honestly','Pick what is true for you and lock it in.'],['Guess','Pass the phone. Your partner guesses what you chose.'],['Reveal','See if you are in sync, then swap roles.'],['Enjoy','No winner. Just a chance to know each other better.']];
  return {top: bar({back:'settings', title:'How to Play', serif:true}), nav:false, body:`
  <div style="margin-top:14px">${st.map((s,i) => `<div class="step"><i>${i+1}</i><div><b>${s[0]}</b><small>${s[1]}</small></div></div>`).join('')}</div>
  <div class="spacer"></div><button class="btn" data-act="go" data-v="settings">Got it ${ic.arrow}</button>`};
}
};

/* ================= RENDER ================= */
function render(anim=true){
  const r = SC[ui.screen]();
  $('#top').innerHTML = r.top || '';
  const sc = $('#screen'); sc.innerHTML = r.body;
  const nv = $('#nav'); nv.style.display = r.nav ? 'flex' : 'none'; nv.innerHTML = r.nav ? navHTML(ui.screen) : '';
  $('#bg').classList.toggle('plain', !!r.plain);
  if (anim){ sc.classList.remove('enter'); void sc.offsetWidth; sc.classList.add('enter'); sc.scrollTop = 0; }
}
function go(s){
  ui.screen = s; ui.pick = null;
  if (s === 'gsetup'){ const n = S.settings.turns; ui.sel = [6,10,16].includes(n) ? String(n) : 'custom'; ui.custom = String(n); }
  render();
}

/* ================= GAME LOGIC ================= */
function startGame(total){
  S.settings.turns = total;
  S.game = {id: Date.now(), total, idx: 0, phase: 'intro', cur: pickQuestion(), ans: null, guess: null, items: []};
  ui.pick = null; save(); ui.screen = 'play'; render();
}
function finishGame(){
  const g = S.game, k = [0,0], n = [0,0];
  g.items.forEach(x => { n[x.s]++; if (x.ok) k[x.s]++; });
  const m = k[0] + k[1];
  S.history.unshift({id: g.id, total: g.total, names: [S.names[0], S.names[1]], pct: pct(m, g.total), k, n, items: g.items});
  S.history = S.history.slice(0, 60);
  S.game = null; ui.res = 0; ui.from = null; save(); ui.screen = 'result'; render();
}
const act = {
  start(){ go(S.names[0] && S.names[1] ? 'home' : 'names'); },
  go(t){ ui.from = null; go(t.dataset.v); },
  saveNames(){
    const a = $('#n1').value.trim(), b = $('#n2').value.trim();
    if (!a || !b){ toast('Add both names to continue'); const f = $('.field'); f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake'); return; }
    S.names = [a, b]; save(); const back = ui.from; ui.from = null; go(back || 'home');
  },
  editNames(){ ui.screen = 'names'; ui.from = 'settings'; render(); },
  newGame(){ go('gsetup'); },
  resume(){ go('play'); },
  chip(t){ ui.sel = t.dataset.v; render(false); const c = $('#customN'); if (c) c.focus(); },
  startGame(){ const n = chosenTotal(); if (!n) return toast('Choose 2 to 40 questions'); startGame(n); },
  pickOpt(t){ ui.pick = parseInt(t.dataset.v, 10); buzz(8); render(false); },
  ready(){ const g = S.game; if (g && g.phase === 'intro'){ g.phase = 'ask'; ui.pick = null; save(); render(); } },
  lock(){ const g = S.game; if (!g || g.phase !== 'ask' || ui.pick == null) return; g.ans = ui.pick; ui.pick = null; g.phase = 'pass'; save(); buzz(); beep(470); render(); },
  passReady(){ const g = S.game; if (g && g.phase === 'pass'){ g.phase = 'guess'; ui.pick = null; save(); render(); } },
  lockGuess(){
    const g = S.game; if (!g || g.phase !== 'guess' || ui.pick == null) return;
    g.guess = ui.pick; ui.pick = null;
    const sub = g.idx % 2, q = g.cur;
    g.items.push({q: q.t ? cap(q.t) : q.o.join(' or '), s: sub, a: q.o[g.ans], g: q.o[g.guess], ok: g.guess === g.ans});
    g.phase = 'reveal'; save(); render();
    const ok = g.guess === g.ans; setTimeout(() => { buzz(ok ? 30 : 12); beep(ok ? 700 : 300, .22, .04); }, 1500);
  },
  next(){
    const g = S.game; if (!g || g.phase !== 'reveal') return;
    if (g.idx + 1 >= g.total) return finishGame();
    g.idx++; g.cur = pickQuestion(); g.ans = null; g.guess = null; g.phase = 'intro'; ui.pick = null; save(); render();
  },
  leave(){ confirmBox('Leave game?', 'Your progress is saved. You can resume from Home.', 'Leave', () => go('home')); },
  seeAnswers(){ ui.detail = ui.res; ui.from = 'result'; ui.screen = 'detail'; render(); },
  again(){ const r = S.history[ui.res]; startGame(r ? r.total : S.settings.turns); },
  homeAfter(){ go('home'); },
  detail(t){ ui.detail = parseInt(t.dataset.v, 10); ui.from = null; go('detail'); },
  sound(){ S.settings.sound = !S.settings.sound; save(); render(false); if (S.settings.sound){ buzz(); beep(); } },
  reset(){ confirmBox('Reset data?', 'This clears your game history and any game in progress. Your names stay.', 'Reset', () => { S.history = []; S.game = null; S.used = []; save(); toast('Data reset'); render(false); }); }
};
document.addEventListener('click', e => { const t = e.target.closest('[data-act]'); if (t && act[t.dataset.act]) act[t.dataset.act](t); });
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'n1') $('#n2').focus();
  else if (e.key === 'Enter' && e.target.id === 'n2') act.saveNames();
});
document.addEventListener('input', e => { if (e.target.id === 'customN') ui.custom = e.target.value; });

render();

/* ================= OFFLINE (service worker) ================= */
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

