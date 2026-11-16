// Open accordion ancestors when following a link to content inside them.
function revealAccordionTarget() {
 const id=decodeURIComponent(location.hash.slice(1));
 const target=id&&document.getElementById(id);
 if(!target)return;
 let ancestor=target.parentElement,opened=false;
 while(ancestor){if(ancestor.matches('details.portfolio-accordion')&&!ancestor.open){ancestor.open=true;opened=true;}ancestor=ancestor.parentElement;}
 if(opened)requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
}
window.addEventListener('hashchange',revealAccordionTarget);
revealAccordionTarget();

// Case-study video story: open in a dialog, pause when closed.
(() => {
 const dialog=document.getElementById('case-video-dialog');
 const opener=document.querySelector('.video-open');
 if(!dialog||!opener)return;
 const video=dialog.querySelector('video');
 opener.addEventListener('click',()=>{dialog.showModal();video.play().catch(()=>{});});
 dialog.querySelector('.video-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>video.pause());
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
})();

// Contribution pills: show only elements tagged data-topics with the chosen key.
(() => {
 const buttons=[...document.querySelectorAll('[data-contribution]')];
 const header=document.querySelector('.masthead');
 const study=document.querySelector('.original-study');
 if(!buttons.length||!study)return;
 const roots=[...study.children].filter(e=>e.matches('details.portfolio-accordion'));
 const openingResults=document.querySelector('.opening > .portfolio-card-grid');
 let active=null,originalOpen=null;
 function apply(key){
  if(!originalOpen)originalOpen=new Map(roots.map(e=>[e,e.open]));
  study.querySelectorAll('.portfolio-contribution-hidden').forEach(e=>e.classList.remove('portfolio-contribution-hidden'));
  active=active===key?null:key;
  buttons.forEach(b=>{if(b.dataset.contribution==='reset')return;b.setAttribute('aria-pressed',String(b.dataset.contribution===active));});
  openingResults?.classList.toggle('portfolio-contribution-hidden',!!active);
  if(!active){originalOpen.forEach((open,e)=>e.open=open);originalOpen=null;document.dispatchEvent(new Event('portfolio:contribution-changed'));return;}
  const selected=[...study.querySelectorAll('[data-topics~="'+active+'"]')];
  function visit(node){
   if(selected.includes(node))return;
   if(!selected.some(item=>node.contains(item))){node.classList.add('portfolio-contribution-hidden');return;}
   for(const child of node.children){if(node.matches('details')&&child.matches('summary'))continue;visit(child);}
  }
  roots.forEach(root=>{visit(root);if(!root.classList.contains('portfolio-contribution-hidden'))root.open=true;});
  document.dispatchEvent(new Event('portfolio:contribution-changed'));
  const first=roots.find(root=>!root.classList.contains('portfolio-contribution-hidden'));
  requestAnimationFrame(()=>first?.scrollIntoView({block:'start',behavior:'instant'}));
 }
 buttons.forEach(b=>b.addEventListener('click',()=>apply(b.dataset.contribution==='reset'?null:b.dataset.contribution)));
 document.addEventListener('portfolio:reset-contribution',()=>apply(null));
 new ResizeObserver(()=>document.documentElement.style.setProperty('--portfolio-header-height',header.getBoundingClientRect().height+'px')).observe(header);
})();
