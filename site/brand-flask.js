// Case-study header logo: on hover it shows the homepage flask (rainbow liquid) and sprinkles
// the same confetti burst as the homepage flask (flask.js): colours, count, speed and gravity match.
(() => {
  const logo = document.querySelector('.masthead .brand-logo');
  if (!logo) return;
  logo.insertAdjacentHTML('beforeend', '<img class="brand-logo-flask" src="assets/inkpromptu-flask.svg" alt="" aria-hidden="true" width="48" height="48"/>');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const COLORS = ['#f2a035', '#82b747', '#69b8aa', '#b598be', '#87b9d4', '#e8647c', '#f4c84a', '#2c6e7e'];
  const MOUTH = [83 / 170, 40 / 170];
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = () => COLORS[Math.random() * COLORS.length | 0];
  const canvas = document.createElement('canvas');
  canvas.className = 'brand-burst';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');
  let sparks = [], running = false;

  function size() {
    const d = devicePixelRatio || 1, w = Math.round(innerWidth * d), h = Math.round(innerHeight * d);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }

  function burst(n) {
    const f = logo.getBoundingClientRect(), x = f.left + f.width * MOUTH[0], y = f.top + f.height * MOUTH[1];
    for (let i = 0; i < n; i++) sparks.push({ x, y, vx: rnd(-3, 3), vy: rnd(-7, -2.5), r: rnd(3, 7), c: pick(), life: rnd(50, 90) });
    if (!running) { running = true; requestAnimationFrame(frame); }
  }

  function frame() {
    size();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sparks = sparks.filter(s => s.life-- > 0);
    for (const s of sparks) {
      s.x += s.vx; s.y += s.vy; s.vy += .12;
      ctx.globalAlpha = Math.min(1, s.life / 30); ctx.fillStyle = s.c;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    running = sparks.length > 0;
    if (running) requestAnimationFrame(frame);
  }

  // Same rule as the homepage: only a pointer that actually moves counts, at most one burst every 700ms.
  let last = 0, px, py;
  logo.addEventListener('pointermove', ev => {
    if (ev.clientX === px && ev.clientY === py) return;
    px = ev.clientX; py = ev.clientY;
    if (performance.now() - last > 700) { last = performance.now(); burst(16); }
  });
})();
