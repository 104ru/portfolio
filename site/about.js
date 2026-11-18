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

// Timeline: reveal each entry as it scrolls into view.
(() => {
 const items=[...document.querySelectorAll('.tl-item')];
 if(!items.length||matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
 document.documentElement.classList.add('tl-animate');
 const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target);}}),{rootMargin:'0px 0px -8% 0px'});
 items.forEach(i=>io.observe(i));
})();
