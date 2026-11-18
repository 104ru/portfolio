// The book: a front cover leaf, 100 paper leaves (200 pages) and a back cover leaf.
// L is how many leaves are turned. Only the leaves near L are in the page.
(() => {
  const PAGES = 200, N = PAGES / 2 + 2, DIR = 'panic-book/';
  const stage = document.getElementById('stage'), book = document.getElementById('book');
  const prev = document.getElementById('prev'), next = document.getElementById('next');
  const scrub = document.getElementById('scrub'), where = document.getElementById('where'), hint = document.getElementById('hint');
  const pad = n => String(n).padStart(3, '0');
  const leaves = new Map();
  let L = 0, side = 'R', single = false;
  scrub.max = N;

  // What is printed on each side of leaf i.
  function art(i, back) {
    if (i === 0) return back ? null : DIR + 'front.webp';
    if (i === N - 1) return back ? DIR + 'back.webp' : null;
    return DIR + 'pages/' + pad(back ? 2 * i : 2 * i - 1) + '.webp';
  }

  function face(i, back) {
    const f = document.createElement('div'), src = art(i, back);
    f.className = 'face ' + (back ? 'back' : 'front') + (i === 0 || i === N - 1 ? ' cover' : '');
    if (src) { const img = new Image(); img.decoding = 'async'; img.alt = ''; img.src = src; f.append(img); }
    return f;
  }

  function place(el, i) {
    const turned = i < L, depth = turned ? L - 1 - i : i - L;
    el.style.transform = `translateZ(${-depth * .6}px) rotateY(${turned ? -180 : 0}deg)`;
  }

  function render() {
    const lo = Math.max(0, L - 4), hi = Math.min(N - 1, L + 3);
    for (const [i, el] of leaves) if (i < lo || i > hi) { el.remove(); leaves.delete(i); }
    for (let i = lo; i <= hi; i++) {
      let el = leaves.get(i);
      if (!el) {
        el = document.createElement('div'); el.className = 'leaf';
        el.append(face(i, false), face(i, true));
        el.addEventListener('transitionend', () => el.classList.remove('turning'));
        leaves.set(i, el); book.append(el); place(el, i); el.getBoundingClientRect();
      } else place(el, i);
    }
    for (let i = hi + 1; i <= Math.min(N - 1, hi + 2); i++) { new Image().src = art(i, false) || art(i, true); }
    view();
  }

  // Where the book sits: closed and turned to show its spine, or open and lying flat.
  function view() {
    const open = L > 0 && L < N;
    book.classList.toggle('open', open);
    book.classList.toggle('at-front', L === 0);
    book.classList.toggle('at-back', L === N);
    book.style.setProperty('--tl', `calc(var(--t)*${L / N})`);
    book.style.setProperty('--tr', `calc(var(--t)*${(N - L) / N})`);
    let x = 0, ry = 0, rx = 12;
    if (L === 0) { x = -25; ry = single ? 0 : 24; rx = 4; }
    else if (L === N) { x = 25; ry = single ? 0 : -24; rx = 4; }
    else if (single) { x = side === 'R' ? -25 : 25; rx = 0; }
    book.style.transformOrigin = `${50 - x * 2 * (open ? 0 : 1) / 2}% 50%`;
    book.style.transform = `translateX(${x}%) rotateX(${rx}deg) rotateY(${ry}deg)`;
    const l = 2 * (L - 1), r = 2 * L - 1;
    where.textContent = L === 0 ? 'Cover' : L === N ? 'Back cover'
      : single ? `Page ${side === 'R' ? Math.min(r, PAGES) : Math.max(l, 1)} of ${PAGES}`
      : l < 1 ? `Page 1 of ${PAGES}` : r > PAGES ? `Page ${PAGES} of ${PAGES}` : `Pages ${l}–${r} of ${PAGES}`;
    scrub.value = L; scrub.style.setProperty('--p', `${L / N * 100}%`);
    prev.disabled = L === 0; next.disabled = L === N;
    if (L > 0) hint.classList.add('gone');
  }

  function go(to, s) {
    to = Math.max(0, Math.min(N, to));
    const d = to - L;
    if (Math.abs(d) === 1) {
      const el = leaves.get(d > 0 ? L : to);
      if (el) el.classList.add('turning');
      book.classList.remove('jump');
    } else if (d) book.classList.add('jump');
    L = to; side = s || 'R';
    render();
  }

  // On a phone one page shows at a time: right page, turn, left page, slide, and so on.
  function step(d) {
    if (!single) return go(L + d);
    if (d > 0) {
      if (L === 0) go(1, 'R');
      else if (L === N) return;
      else if (side === 'L') { side = 'R'; L === N - 1 ? go(N) : view(); }
      else go(L + 1, L + 1 === N ? 'R' : 'L');
    } else {
      if (L === N) go(N - 1, 'L');
      else if (L === 0) return;
      else if (side === 'R') { if (L === 1) go(0); else { side = 'L'; view(); } }
      else go(L - 1, 'R');
    }
  }

  function size() {
    const w = stage.clientWidth, h = stage.clientHeight;
    single = w < 700;
    const pw = Math.floor(single ? Math.min(w * .86, (h - 40) * 2 / 3) : Math.min(w * .43, (h - 70) * 2 / 3));
    book.style.setProperty('--pw', pw + 'px');
    book.style.setProperty('--ph', pw * 1.5 + 'px');
    book.style.setProperty('--t', Math.round(pw * .094) + 'px');
    book.classList.add('jump'); view();
  }

  book.addEventListener('click', ev => {
    const b = book.getBoundingClientRect();
    if (L === 0) step(1); else if (L === N) step(-1);
    else step(ev.clientX > b.left + b.width / 2 ? 1 : -1);
  });
  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  scrub.addEventListener('input', () => go(+scrub.value));
  addEventListener('keydown', ev => {
    if (ev.target === scrub) return;
    if (ev.key === 'ArrowRight' || ev.key === ' ') { ev.preventDefault(); step(1); }
    if (ev.key === 'ArrowLeft') step(-1);
    if (ev.key === 'Home') go(0);
    if (ev.key === 'End') go(N);
  });
  let sx = null;
  stage.addEventListener('touchstart', ev => { sx = ev.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', ev => {
    if (sx === null) return;
    const dx = ev.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 40) { ev.preventDefault(); step(dx < 0 ? 1 : -1); }
  });
  addEventListener('resize', size);
  size(); render();
})();
