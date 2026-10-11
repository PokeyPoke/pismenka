(() => {
  'use strict';

  const BASE = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const ACCENTED = 'áčďéěíňóřšťúůýž'.split('');
  const COLORS = ['#ff5fa2', '#ff9f1c', '#22b864', '#3fa7ff', '#9b5de5', '#f15bb5', '#00bbf9', '#e36414'];
  const FLOATIES = ['⭐', '🎈', '☁️', '🌈', '🦋', '🍭', '🌸', '✏️', '🐞', '🍓'];

  const TEXT = {
    cs: {
      subtitle: 'Poznáš psací písmenka? Zmáčkni správnou klávesu!',
      letters: 'Písmenka:',
      lower: 'malá', upper: 'velká', both: 'obojí',
      accents: 'háčky a čárky',
      speak: 'předčítat',
      keyboard: 'klávesnice na obrazovce',
      play: 'Hrát!',
      pressSpace: 'nebo zmáčkni mezerník',
      prompt: 'Které je to písmenko? Zmáčkni ho!',
      inARow: 'v řadě',
      record: '🏆 Nový rekord! 🏆',
      practice: 'Tahle písmenka si ještě procvič:',
      again: 'Znovu!',
      menu: 'Menu',
      best: (n) => `Tvůj rekord: ⭐ ${n}`,
      go: 'Start!',
      titles: ['Dobrý začátek!', 'Šikula!', 'Výborně!', 'Super hvězda!'],
    },
    en: {
      subtitle: 'Can you read Czech script letters? Press the right key!',
      letters: 'Letters:',
      lower: 'small', upper: 'capital', both: 'both',
      accents: 'accents (háčky & čárky)',
      speak: 'read aloud',
      keyboard: 'on-screen keyboard',
      play: 'Play!',
      pressSpace: 'or press the space bar',
      prompt: 'Which letter is it? Press it!',
      inARow: 'in a row',
      record: '🏆 New record! 🏆',
      practice: 'Practise these letters a bit more:',
      again: 'Again!',
      menu: 'Menu',
      best: (n) => `Your best: ⭐ ${n}`,
      go: 'Go!',
      titles: ['Good start!', 'Nice one!', 'Great job!', 'Superstar!'],
    },
  };

  // ---------- settings ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem('pismenka.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('pismenka.' + k, JSON.stringify(v)); } catch {} },
  };
  const touchy = window.matchMedia('(pointer: coarse)').matches;
  const settings = {
    lang: store.get('lang', 'cs'),
    case: store.get('case', 'lower'),
    accents: store.get('accents', false),
    speak: store.get('speak', true),
    keyboard: store.get('keyboard', touchy),
  };
  const bestKey = () => `best.${settings.case}.${settings.accents ? 'acc' : 'plain'}.streak`;
  const t = (k) => TEXT[settings.lang][k];

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  // ---------- mascot (drawn once, cloned into each slot) ----------
  const MASCOT = `
    <ellipse cx="100" cy="172" rx="60" ry="7" fill="rgba(59,42,92,.18)"/>
    <path d="M58 44 L48 6 L84 34 Z" fill="#ff8fc1"/>
    <path d="M142 44 L152 6 L116 34 Z" fill="#ff8fc1"/>
    <path d="M62 38 L56 18 L76 33 Z" fill="#ffd1e6"/>
    <path d="M138 38 L144 18 L124 33 Z" fill="#ffd1e6"/>
    <ellipse cx="100" cy="100" rx="78" ry="72" fill="#ff8fc1"/>
    <ellipse cx="100" cy="118" rx="52" ry="44" fill="#ffd1e6"/>
    <g>
      <ellipse cx="72" cy="88" rx="17" ry="20" fill="#fff"/>
      <ellipse cx="128" cy="88" rx="17" ry="20" fill="#fff"/>
      <circle cx="75" cy="92" r="10" fill="#3b2a5c"/>
      <circle cx="131" cy="92" r="10" fill="#3b2a5c"/>
      <circle cx="79" cy="87" r="4" fill="#fff"/>
      <circle cx="135" cy="87" r="4" fill="#fff"/>
      <ellipse class="eye-lid" cx="72" cy="88" rx="18" ry="21" fill="#ff8fc1"/>
      <ellipse class="eye-lid" cx="128" cy="88" rx="18" ry="21" fill="#ff8fc1"/>
    </g>
    <ellipse cx="54" cy="116" rx="11" ry="7" fill="#ff5fa2" opacity=".55"/>
    <ellipse cx="146" cy="116" rx="11" ry="7" fill="#ff5fa2" opacity=".55"/>
    <path class="mouth-normal" d="M88 118 Q100 130 112 118" stroke="#3b2a5c" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path class="mouth-happy" d="M82 114 Q100 146 118 114 Z" fill="#3b2a5c"/>
    <ellipse class="mouth-oops" cx="100" cy="124" rx="9" ry="11" fill="#3b2a5c"/>
    <ellipse cx="48" cy="150" rx="14" ry="10" fill="#ff8fc1"/>
    <ellipse cx="152" cy="150" rx="14" ry="10" fill="#ff8fc1"/>`;
  $$('.mascot').forEach((m) => { m.innerHTML = MASCOT; });

  function mascotMood(mood) {
    $$('.mascot').forEach((m) => {
      m.classList.remove('happy', 'oops');
      void m.getBoundingClientRect(); // restart animation
      if (mood) m.classList.add(mood);
    });
  }

  // ---------- background ----------
  (function makeSky() {
    const sky = $('.sky');
    for (let i = 0; i < 16; i++) {
      const b = document.createElement('span');
      b.className = 'blob';
      b.textContent = FLOATIES[i % FLOATIES.length];
      b.style.left = Math.random() * 100 + 'vw';
      b.style.fontSize = 24 + Math.random() * 36 + 'px';
      b.style.animationDuration = 14 + Math.random() * 18 + 's';
      b.style.animationDelay = -Math.random() * 30 + 's';
      sky.appendChild(b);
    }
  })();

  // ---------- sound ----------
  let audio;
  function ctx() {
    if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
    return audio;
  }
  function tone(freq, start, dur, type = 'sine', vol = 0.18) {
    const a = ctx();
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, a.currentTime + start);
    g.gain.setValueAtTime(0, a.currentTime + start);
    g.gain.linearRampToValueAtTime(vol, a.currentTime + start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + start + dur);
    o.connect(g).connect(a.destination);
    o.start(a.currentTime + start);
    o.stop(a.currentTime + start + dur + 0.05);
  }
  const sfx = {
    good(streak) {
      const base = 523 * Math.pow(2, Math.min(streak, 8) / 12);
      tone(base, 0, 0.12, 'triangle');
      tone(base * 1.5, 0.07, 0.18, 'triangle');
    },
    bad() { tone(220, 0, 0.18, 'square', 0.07); tone(180, 0.1, 0.22, 'square', 0.07); },
    count() { tone(660, 0, 0.15, 'sine', 0.2); },
    go() { tone(880, 0, 0.3, 'triangle', 0.22); },
    end() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3, 'triangle', 0.2)); },
  };

  // ---------- speech ----------
  let czVoice = null;
  function pickVoice() {
    const vs = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    czVoice = vs.find((v) => /^cs/i.test(v.lang)) || null;
  }
  if (window.speechSynthesis) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function say(ch) {
    if (!settings.speak || !window.speechSynthesis || !czVoice) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(ch.toLowerCase());
    u.voice = czVoice;
    u.lang = czVoice.lang;
    u.rate = 1.1;
    speechSynthesis.speak(u);
  }

  // ---------- effects ----------
  const fx = $('#fx');
  function burst(x, y, n = 14) {
    for (let i = 0; i < n; i++) {
      const p = document.createElement('span');
      p.className = 'particle';
      p.textContent = ['⭐', '✨', '💖', '🌟'][i % 4];
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.fontSize = 16 + Math.random() * 20 + 'px';
      fx.appendChild(p);
      const ang = Math.random() * Math.PI * 2;
      const dist = 80 + Math.random() * 140;
      p.animate([
        { transform: 'translate(-50%,-50%) scale(.4)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(ang) * dist}px), calc(-50% + ${Math.sin(ang) * dist}px)) scale(1.2) rotate(${Math.random() * 360}deg)`, opacity: 0 },
      ], { duration: 650 + Math.random() * 300, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => p.remove();
    }
  }
  function confetti(n = 120) {
    for (let i = 0; i < n; i++) {
      const c = document.createElement('span');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = COLORS[i % COLORS.length];
      fx.appendChild(c);
      const drift = (Math.random() - 0.5) * 300;
      c.animate([
        { transform: `translate(0,0) rotate(0)` },
        { transform: `translate(${drift}px, 110vh) rotate(${720 + Math.random() * 720}deg)` },
      ], { duration: 2200 + Math.random() * 2000, delay: Math.random() * 600, easing: 'cubic-bezier(.3,.1,.7,1)' }).onfinish = () => c.remove();
    }
  }

  // ---------- screens & i18n ----------
  function show(id) {
    $$('.screen').forEach((s) => s.classList.toggle('active', s.id === id));
    state.screen = id;
  }
  function applyText() {
    document.documentElement.lang = settings.lang;
    $$('[data-t]').forEach((el) => {
      const v = t(el.dataset.t);
      if (typeof v === 'string') el.textContent = v;
    });
    $('#langBtn').textContent = settings.lang === 'cs' ? 'EN' : 'CZ';
    const best = store.get(bestKey(), 0);
    $('#bestStart').textContent = best ? t('best')(best) : '';
  }
  function applyOptions() {
    $$('.seg[data-opt] button').forEach((b) => b.classList.toggle('on', settings[b.parentElement.dataset.opt] === b.dataset.val));
    $$('.toggle[data-opt]').forEach((b) => b.classList.toggle('on', !!settings[b.dataset.opt]));
    applyText();
  }

  $$('.seg[data-opt] button').forEach((b) => b.addEventListener('click', () => {
    settings[b.parentElement.dataset.opt] = b.dataset.val;
    store.set(b.parentElement.dataset.opt, b.dataset.val);
    applyOptions();
  }));
  $$('.toggle[data-opt]').forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.opt;
    settings[k] = !settings[k];
    store.set(k, settings[k]);
    applyOptions();
    if (k === 'speak' && settings.speak) say('a');
  }));
  $('#langBtn').addEventListener('click', () => {
    settings.lang = settings.lang === 'cs' ? 'en' : 'cs';
    store.set('lang', settings.lang);
    applyText();
  });

  // ---------- on-screen keyboard ----------
  function buildKeyboard() {
    const rows = settings.accents
      ? ['ěščřžýáíéúů', 'qwertzuiop', 'asdfghjklóď', 'yxcvbnmňť']
      : ['qwertzuiop', 'asdfghjkl', 'yxcvbnm'];
    const osk = $('#osk');
    osk.innerHTML = '';
    rows.forEach((r) => {
      const row = document.createElement('div');
      row.className = 'osk-row';
      [...r].forEach((ch) => {
        const b = document.createElement('button');
        b.textContent = ch;
        b.addEventListener('pointerdown', (e) => { e.preventDefault(); guess(ch); });
        row.appendChild(b);
      });
      osk.appendChild(row);
    });
    osk.classList.toggle('show', !!settings.keyboard);
    $('#game').classList.toggle('with-osk', !!settings.keyboard);
  }

  // ---------- game ----------
  const state = {
    screen: 'start',
    pool: [],
    current: null,
    score: 0,
    streak: 0,
    missed: new Map(),
    locked: false,
    colorIdx: 0,
    resultsAt: 0,
    round: 0,
  };

  function makePool() {
    const lower = settings.accents ? BASE.concat(ACCENTED) : BASE;
    if (settings.case === 'lower') return lower;
    const upper = lower.map((c) => c.toUpperCase());
    return settings.case === 'upper' ? upper : lower.concat(upper);
  }

  // Script glyphs have swashes that draw outside their text box (W, M, Ž…),
  // so measure the actual ink, then centre it and shrink it to fit the card.
  const measure = document.createElement('canvas').getContext('2d');
  function fitLetter(el, card) {
    const cs = getComputedStyle(el);
    measure.font = `${cs.fontSize} ${cs.fontFamily}`;
    const m = measure.measureText(el.textContent);
    const inkW = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
    const inkH = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    const shiftX = m.width / 2 - (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2;
    // with line-height 1 the font's ascent+descent is centred in the line box;
    // move the ink's middle (not the baseline) to the middle of the element
    const size = parseFloat(cs.fontSize);
    const baseline = (size - m.fontBoundingBoxAscent - m.fontBoundingBoxDescent) / 2 + m.fontBoundingBoxAscent;
    const inkMid = baseline + (m.actualBoundingBoxDescent - m.actualBoundingBoxAscent) / 2;
    const shiftY = size / 2 - inkMid;
    const scale = Math.min(1, (card.clientWidth * 0.8) / inkW, (card.clientHeight * 0.78) / inkH);
    el.style.transform = `scale(${scale}) translate(${shiftX}px, ${shiftY}px)`;
  }

  function nextLetter() {
    let ch;
    do { ch = state.pool[Math.floor(Math.random() * state.pool.length)]; }
    while (state.pool.length > 1 && ch === state.current);
    state.current = ch;
    state.colorIdx = (state.colorIdx + 1 + Math.floor(Math.random() * (COLORS.length - 1))) % COLORS.length;

    const card = $('#card');
    card.style.setProperty('--c', COLORS[state.colorIdx]);
    const letter = $('#letter');
    letter.textContent = ch;
    fitLetter(letter, card);
    $('#reveal').textContent = ch;
    $('#reveal').classList.remove('show');
    card.classList.remove('out', 'wrong', 'in');
    void card.offsetWidth;
    card.classList.add('in');
    state.locked = false;
  }

  function startCountdown() {
    ctx();
    // iOS only lets speech start from a tap, so prime it here
    if (settings.speak && window.speechSynthesis) speechSynthesis.speak(new SpeechSynthesisUtterance(''));
    state.pool = makePool();
    buildKeyboard();
    show('countdown');
    const el = $('#countNum');
    const steps = ['3', '2', '1', t('go')];
    let i = 0;
    const step = () => {
      if (state.screen !== 'countdown') return;
      if (i === steps.length) { startGame(); return; }
      el.textContent = steps[i];
      el.classList.remove('go');
      void el.offsetWidth;
      el.classList.add('go');
      i === steps.length - 1 ? sfx.go() : sfx.count();
      i++;
      setTimeout(step, i === steps.length ? 500 : 700);
    };
    step();
  }

  function startGame() {
    state.round++;
    state.score = 0;
    state.streak = 0;
    state.current = null;
    state.missed = new Map();
    $('#score').textContent = '0';
    show('game');
    nextLetter();
  }

  function guess(key) {
    if (state.screen !== 'game' || state.locked || !state.current) return;
    const target = state.current;
    if (key.toLowerCase() === target.toLowerCase()) {
      state.locked = true;
      state.score++;
      state.streak++;
      sfx.good(state.streak);
      say(target);
      mascotMood('happy');
      const sb = $('.score-box');
      sb.classList.remove('bump'); void sb.offsetWidth; sb.classList.add('bump');
      $('#score').textContent = state.score;
      const r = $('#card').getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2);
      $('#card').classList.add('out');
      setTimeout(() => { if (state.screen === 'game') nextLetter(); }, 220);
    } else {
      state.streak = 0;
      state.missed.set(target, (state.missed.get(target) || 0) + 1);
      sfx.bad();
      mascotMood('oops');
      const card = $('#card');
      card.classList.remove('wrong', 'in'); void card.offsetWidth; card.classList.add('wrong');
      // show the right answer for a moment, then the streak is over
      state.locked = true;
      $('#reveal').classList.add('show');
      const round = state.round;
      setTimeout(() => { if (state.screen === 'game' && state.round === round) endGame(); }, 1600);
    }
  }

  function endGame() {
    state.current = null;
    sfx.end();
    const score = state.score;
    const prev = store.get(bestKey(), 0);
    const isRecord = score > prev && score > 0;
    if (isRecord) store.set(bestKey(), score);

    const stars = score >= 20 ? 3 : score >= 10 ? 2 : score >= 4 ? 1 : 0;
    const titles = t('titles');
    $('#resultTitle').textContent = titles[stars];
    $('#finalScore').textContent = score;
    $$('#rating span').forEach((s, i) => s.classList.toggle('lit', i < stars));
    const rating = $('#rating');
    rating.classList.remove('show'); void rating.offsetWidth; rating.classList.add('show');
    $('#record').classList.toggle('show', isRecord);

    const pairs = $('#pairs');
    pairs.innerHTML = '';
    [...state.missed.keys()].slice(0, 10).forEach((ch) => {
      const d = document.createElement('div');
      d.className = 'pair';
      d.innerHTML = `<span class="s"></span><span class="p"></span>`;
      d.querySelector('.s').textContent = ch;
      d.querySelector('.p').textContent = '= ' + ch;
      pairs.appendChild(d);
    });
    $('#practice').classList.toggle('show', state.missed.size > 0);

    show('results');
    state.resultsAt = performance.now();
    applyText();
    mascotMood(stars >= 2 ? 'happy' : null);
    if (stars >= 1 || isRecord) confetti(isRecord ? 180 : 40 + stars * 30);
  }

  // ---------- input ----------
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) return;
    if (state.screen === 'game') {
      if (e.key === 'Escape') { state.current = null; show('start'); applyText(); return; }
      if (e.repeat || e.key.length !== 1 || e.key === ' ') return;
      e.preventDefault();
      guess(e.key);
      return;
    }
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
      // short pause on results so key-mashing at the buzzer doesn't skip it
      if (state.screen === 'start' || (state.screen === 'results' && performance.now() > state.resultsAt + 1200)) {
        e.preventDefault();
        startCountdown();
      }
    } else if (e.key === 'Escape' && state.screen === 'results') {
      show('start');
      applyText();
    }
  });

  $('#playBtn').addEventListener('click', startCountdown);
  $('#againBtn').addEventListener('click', startCountdown);
  $('#menuBtn').addEventListener('click', () => { show('start'); applyText(); });

  // Buttons keep focus after a click; stop Space from re-clicking them
  // (the keydown handler above already starts the game).
  $$('button').forEach((b) => b.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') e.preventDefault(); }));

  // rotating the phone resizes the card, so re-fit the letter
  window.addEventListener('resize', () => {
    if (state.screen === 'game') fitLetter($('#letter'), $('#card'));
  });

  applyOptions();
})();
