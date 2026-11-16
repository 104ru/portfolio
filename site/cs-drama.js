// Before/after slider: the range input moves the split.
document.querySelectorAll('.drama-compare').forEach(box => {
 const input = box.querySelector('input');
 const set = () => box.style.setProperty('--x', input.value + '%');
 input.addEventListener('input', set);
 set();
});
// Looping clips play only while on screen, and never with reduced motion.
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const io = new IntersectionObserver(es => es.forEach(e => {
 const v = e.target;
 if (still) return;
 e.isIntersecting ? v.play().catch(() => {}) : v.pause();
}), {threshold: .4});
document.querySelectorAll('.drama-loop video').forEach(v => io.observe(v));
