// Homepage preview. On load the flask fills with coloured dots in the middle of the screen
// and rises straight into the header; then the name, copy, pills and cards follow. Afterwards it
// keeps its colours and sprinkles confetti when hovered or clicked.
(() => {
  const COLORS = ['#f2a035', '#82b747', '#69b8aa', '#b598be', '#87b9d4', '#e8647c', '#f4c84a', '#2c6e7e'];
  const FLY = 600, POP = 1300, DRAIN = 600, EMPTY = 138, FULL = 30, MOUTH = [83 / 170, 40 / 170];
  const body = document.body, stage = document.querySelector('.profile');
  const canvas = stage.querySelector('canvas'), ctx = canvas.getContext('2d');
  const flask = stage.querySelector('.flask'), liquid = stage.querySelector('.liquid');
  const nav = performance.getEntriesByType('navigation')[0];
  const returning = (nav && nav.type === 'back_forward') || sessionStorage.getItem('flask-intro') === 'done';
  if (returning) body.classList.add('returning');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches || returning;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = () => COLORS[Math.random() * COLORS.length | 0];
  let dots = [], sparks = [], mouth, start, phase = 'idle', hover = false, intro = !still, running = false;

  // Re-measured every frame: the header can change height while fonts load, and the flask moves.
  function size() {
    const d = devicePixelRatio || 1, s = stage.getBoundingClientRect(), f = flask.getBoundingClientRect();
    const w = Math.round(s.width * d), h = Math.round(s.height * d);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    ctx.setTransform(d, 0, 0, d, 0, 0);
    mouth = { x: f.left - s.left + f.width * MOUTH[0], y: f.top - s.top + f.height * MOUTH[1] };
  }

  function seed() {
    const w = stage.clientWidth, h = stage.clientHeight;
    dots = Array.from({ length: 140 }, () => {
      const x = 14 + 28 * (Math.random() * w / 28 | 0), y = 14 + 28 * (Math.random() * h / 28 | 0);
      return { x, y, r: rnd(3, 6.5), c: pick(), delay: rnd(250, POP - FLY - 100), stay: false };
    });
  }

  function dot(x, y, r, c, a = 1) {
    ctx.globalAlpha = a; ctx.fillStyle = c;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }

  function burst(n) {
    for (let i = 0; i < n; i++) sparks.push({ x: mouth.x, y: mouth.y, vx: rnd(-3, 3), vy: rnd(-7, -2.5), r: rnd(3, 7), c: pick(), life: rnd(50, 90) });
  }

  function run() { if (!running) { running = true; requestAnimationFrame(frame); } }

  function play() {
    if (phase !== 'idle') return;
    size(); seed(); start = null; phase = 'fill'; run();
  }

  function frame(now) {
    const e = now - (start ??= now);
    size();
    let level = phase === 'idle' ? EMPTY : FULL, fade = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (phase === 'fill') {
      let absorbed = 0;
      for (const p of dots) {
        const k = p.stay ? 0 : (e - p.delay) / FLY;
        if (k >= 1) { absorbed++; continue; }
        // Each dot fades in just before it sets off, so they arrive one by one rather than all at once.
        if (k <= 0) { const a = (e - p.delay + 250) / 250; if (a > 0) dot(p.x, p.y, p.r, p.c, a); continue; }
        const t = k * k, u = 1 - t, cx = mouth.x + (p.x - mouth.x) * .3, cy = mouth.y - 90;
        dot(u * u * p.x + 2 * u * t * cx + t * t * mouth.x, u * u * p.y + 2 * u * t * cy + t * t * mouth.y, p.r * (1 - .6 * k), p.c);
      }
      level = EMPTY - (EMPTY - FULL) * absorbed / dots.filter(p => !p.stay).length;
      if (e >= POP) {
        // Once full the flask bursts, and only after the burst does it go up.
        dots = dots.filter(p => p.stay); start = now;
        burst(46);
        if (intro) { phase = 'settle'; setTimeout(rise, 900); } else { phase = 'full'; }
      }
    } else if (phase === 'settle') {
      const k = Math.min(1, e / DRAIN);
      fade = 1 - k;
      if (k === 1) { phase = 'rest'; dots = []; }
    } else if (phase === 'full' && !intro && !hover) {
      phase = 'drain'; start = now;
    } else if (phase === 'drain') {
      const k = Math.min(1, e / DRAIN);
      level = FULL + (EMPTY - FULL) * k; fade = 1 - k;
      if (k === 1) { phase = 'idle'; dots = []; if (intro) rise(); }
    }
    if (phase !== 'fill') for (const p of dots) dot(p.x, p.y, p.r, p.c, fade);
    sparks = sparks.filter(s => s.life-- > 0);
    for (const s of sparks) { s.x += s.vx; s.y += s.vy; s.vy += .12; dot(s.x, s.y, s.r, s.c, Math.min(1, s.life / 30)); }
    ctx.globalAlpha = 1;
    liquid.setAttribute('y', level);
    running = (phase !== 'idle' && phase !== 'rest') || sparks.length > 0;
    if (running) requestAnimationFrame(frame);
  }

  // Each step waits for the one before: the flask lifts into the header, then the page follows.
  function rise() {
    intro = false;
    try { sessionStorage.setItem('flask-intro', 'done'); } catch (e) {}
    flask.classList.add('up');
    setTimeout(() => body.classList.add('loaded'), still ? 0 : 450);
    if (returning) { document.querySelectorAll('.card').forEach(card => card.classList.add('in', 'drawn')); return; }
    setTimeout(() => document.querySelectorAll('.card').forEach(card => enter.observe(card)), still ? 0 : 2200);
  }

  // Cards that come into view together are drawn one after another.
  const enter = new IntersectionObserver(entries => entries.filter(en => en.isIntersecting).forEach((en, i) => {
    en.target.style.setProperty('--s', `${i * .3}s`);
    en.target.classList.add('in');
    setTimeout(() => en.target.classList.add('drawn'), (i * .3 + 2.2) * 1000);
    enter.unobserve(en.target);
  }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.work .card').forEach(card => card.insertAdjacentHTML('afterbegin',
    '<svg class="outline" aria-hidden="true"><rect x="0" y="0" width="100%" height="100%" pathLength="1"/></svg>'));

  if (still) {
    liquid.setAttribute('y', FULL);
    rise();
    if (!returning || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Coming back from a case study: no intro, but the flask still bursts on hover and click.
    phase = 'rest';
  } else {
    // The intro always starts at the top of the page, even on reload.
    history.scrollRestoration = 'manual';
    scrollTo(0, 0);
    const r = flask.getBoundingClientRect();
    flask.style.setProperty('--rise', `${innerHeight / 2 - (r.top + r.height / 2)}px`);
    requestAnimationFrame(() => requestAnimationFrame(() => { flask.classList.add('shown'); setTimeout(play, 250); }));
  }

  // Only a pointer that actually moves counts, so the flask passing under a resting cursor doesn't fire a burst.
  let last = 0, px, py;
  flask.addEventListener('pointermove', ev => {
    if (ev.clientX === px && ev.clientY === py) return;
    px = ev.clientX; py = ev.clientY; hover = true;
    if (phase === 'rest' && performance.now() - last > 700) { last = performance.now(); size(); burst(16); run(); }
  });
  flask.addEventListener('pointerleave', () => { hover = false; });
  flask.addEventListener('click', () => { if (phase === 'rest') { size(); burst(30); run(); } });
})();
