// LinkedIn recommendation cards: clamp long text, Read more / Show less.
(() => {
 const cards=[...document.querySelectorAll('.li-card')];
 if(!cards.length)return;
 function measure(){
  cards.forEach(card=>{
   const text=card.querySelector('.li-text'),more=card.querySelector('.li-more');
   if(card.classList.contains('is-open'))return;
   if(!text.offsetParent)return;
   more.hidden=text.scrollHeight<=text.clientHeight+2;
  });
 }
 cards.forEach(card=>{
  const more=card.querySelector('.li-more');
  more.addEventListener('click',()=>{
   const open=card.classList.toggle('is-open');
   more.setAttribute('aria-expanded',String(open));
   more.textContent=open?'Show less':'…more';
  });
 });
 document.querySelectorAll('details.portfolio-accordion').forEach(d=>d.addEventListener('toggle',()=>requestAnimationFrame(measure)));
 addEventListener('resize',measure);
 document.fonts?.ready.then(measure);
 measure();
})();

// Timeline: unwrap one entry at a time, in order, as the reader reaches it; the rail grows with it.
(() => {
 const tl=document.querySelector('.tl'),items=[...document.querySelectorAll('.tl-item')];
 if(!tl||!items.length||matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
 document.documentElement.classList.add('tl-animate');
 let last=null;
 const rail=()=>{if(last)tl.style.setProperty('--tl-end',(last.offsetTop+last.offsetHeight)+'px');};
 new ResizeObserver(rail).observe(tl);
 const io=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(!e.isIntersecting)return;
  io.unobserve(e.target);e.target.classList.add('is-in');last=e.target;rail();
  const next=items[items.indexOf(e.target)+1];
  if(next)setTimeout(()=>io.observe(next),600);
 }),{rootMargin:'0px 0px -12% 0px'});
 io.observe(items[0]);
})();
