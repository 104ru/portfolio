(async()=>{
 const status=document.querySelector('#status'), select=document.querySelector('#scene');
 try {
  const response=await fetch('tour.json');if(!response.ok)throw Error('Unable to load the tour.');
  const config=await response.json();if(matchMedia('(prefers-reduced-motion: reduce)').matches)config.default.sceneFadeDuration=0;
  const viewer=pannellum.viewer('panorama',config);
  viewer.on('load',()=>{status.textContent='Drag to look around';});
  viewer.on('scenechange',id=>{select.value=id;status.textContent='Loading scene…';});
  viewer.on('error',()=>{status.textContent='This panorama could not load.';});
  select.addEventListener('change',()=>viewer.loadScene(select.value));
 } catch {status.textContent='The tour could not load. Please try again.';}
 addEventListener('keydown',e=>{if(e.key==='Escape')parent.postMessage('early-ai:close-tour',location.origin);});
})();
const enabledControls=new WeakSet();
function labelControls(){
 document.querySelectorAll('.pnlm-scene,.pnlm-zoom-in,.pnlm-zoom-out').forEach(el=>{
  if(enabledControls.has(el))return;enabledControls.add(el);el.setAttribute('role','button');el.tabIndex=0;
  el.setAttribute('aria-label',el.classList.contains('pnlm-zoom-in')?'Zoom in':el.classList.contains('pnlm-zoom-out')?'Zoom out':el.querySelector('span')?.textContent||'Go to the next scene');
  el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}});
 });
}
new MutationObserver(labelControls).observe(document.querySelector('#panorama'),{childList:true,subtree:true});labelControls();
