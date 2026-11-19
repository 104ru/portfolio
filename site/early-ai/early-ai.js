(async()=>{
 const art=document.querySelector('.art-dialog'), image=document.querySelector('#large-art'), caption=document.querySelector('#art-caption');
 const controls=art.querySelector('.art-controls'), previous=art.querySelector('[data-art-prev]'), next=art.querySelector('[data-art-next]'), position=document.querySelector('#art-position');
 const tour=document.querySelector('.tour-dialog'), frame=tour.querySelector('iframe');
 let gallery=[],index=0,opener;
 let data={dragons:[],boroughs:[]};
 try{const response=await fetch('gallery-data.json');if(response.ok)data=await response.json();}catch{}
 function update(){const item=gallery[index];image.src=item.src;image.alt=item.caption;caption.textContent=item.caption;position.textContent=`${index+1} / ${gallery.length}`;controls.hidden=gallery.length<2;previous.disabled=index===0;next.disabled=index===gallery.length-1;}
 function show(items,start,button){if(!items.length)return;gallery=items;index=start;opener=button;update();art.showModal();}
 document.querySelectorAll('[data-image],[data-dragon],[data-borough]').forEach(button=>button.addEventListener('click',()=>{
  if(button.dataset.image)show([{src:button.dataset.image,caption:button.dataset.caption||button.getAttribute('aria-label')}],0,button);
  else if(button.dataset.dragon!==undefined)show(data.dragons,Number(button.dataset.dragon),button);
  else show(data.boroughs,Number(button.dataset.borough),button);
 }));
 previous.addEventListener('click',()=>{if(index>0){index--;update();}});next.addEventListener('click',()=>{if(index<gallery.length-1){index++;update();}});
 art.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();previous.click();}if(e.key==='ArrowRight'){e.preventDefault();next.click();}});
 for(const dialog of [art,tour]){
  dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  dialog.addEventListener('close',()=>{if(dialog===tour)frame.removeAttribute('src');opener?.focus({preventScroll:true});});
 }
 document.querySelector('[data-tour]').addEventListener('click',e=>{opener=e.currentTarget;frame.src='tour/';tour.showModal();});
 window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===frame.contentWindow&&e.data==='early-ai:close-tour')tour.close();});
})();
