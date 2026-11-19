// Browser preview of the current native app. Sample play stays on this device.
const previewVersion = '0.3.5';
const previewKey = 'dwellers-browser-035';
let accountReturn='release';
let panelReturn = 'workshop', libraryTab = 'Photos', selectedPhoto, selectedTarget;
let opticalControl, treatment = {hue:0,tint:0,grain:0,frame:'none'};
let capturedDraft, undoHistory = [], demoAccount = false, roleHistory;
const frameNames = ['none','film','brick','retro','rust','antique','broken','grunge','circleHalftone','stamp1','stamp2','halftone','roundBlob','tinyHoles','circlesShade','splash'];
iconPaths.publish = '<path d="m2 3 20 8-20 10 4-9Zm4 9 16-1"/>';
iconPaths.rocket = '<path d="M3 13c5 0 8-8 12-7l6 3-5 1c-1 7-7 11-13 8l6-3Z"/>';
iconPaths.gear = '<circle cx="12" cy="12" r="4"/><path d="m10 2 4 0 1 4 4-1 2 4-3 3 3 3-2 4-4-1-1 4h-4l-1-4-4 1-2-4 3-3-3-3 2-4 4 1Z"/>';
iconPaths.book = '<path d="M12 5C8 2 4 3 2 4v16c3-2 7-2 10 0 3-2 7-2 10 0V4c-3-1-7-2-10 1Zm0 0v15"/>';
try {
 const saved = JSON.parse(localStorage.getItem(previewKey));
 if(saved && Array.isArray(saved.creatures) && Array.isArray(saved.photos)) {
  creatures.splice(0,creatures.length,...saved.creatures); photos=saved.photos;
  demoAccount=!!saved.demoAccount; capturedDraft=saved.draft;
 }
} catch { /* Private browsing can disable storage; current play remains usable. */ }
function persistPreview() {
 try { localStorage.setItem(previewKey,JSON.stringify({creatures,photos,demoAccount,draft:capturedDraft})); }
 catch { announce('Browser storage is unavailable. Keep this preview open to retain your work.'); }
}
const today = () => new Date().toLocaleDateString('en-CA');
function caughtToday(creature) { return photos.some(p => !p.sample && p.creature.id===creature.id && p.day===today()); }
function activeCreatures() { return creatures.filter(c => !c.retired); }
function panel(title, body, back='close-panel') {
 return `<section class="app-panel"><header class="panel-head">${roundControl(back,'back','Back')}<h2>${title}</h2></header><div class="panel-scroll">${body}</div></section>`;
}
const baseRender = render;
render = function() {
 const extra={player:renderPlayer,settings:renderSettings,rules:renderRules,library:renderLibrary,detail:renderDetail,release:renderRelease,finish:renderFinishing,account:renderAccount};
 if(extra[view]) game.innerHTML=extra[view](); else baseRender();
 if(['workshop','nearby','feed','library'].includes(view)) game.insertAdjacentHTML('beforeend',roundControl('player','gear','Player and settings','player-button'));
};
const baseWorkshop = renderWorkshop;
renderWorkshop = function() {
 // Keep archived creations outside the cabinet without altering released snapshots.
 const all=[...creatures]; creatures.splice(0,creatures.length,...all.filter(c=>!c.retired));
 let html=baseWorkshop(); creatures.splice(0,creatures.length,...all);
 return html;
};
const baseBeginBuilder = beginBuilder;
beginBuilder = function(id) {
 baseBeginBuilder(id); progress=5; undoHistory=[];
 if(newCreation) { draft.name=''; draft.chosen=[...categories]; draft.arms={'left-middle':3,'right-middle':3}; }
 render();
};
const baseBuilder = renderBuilder;
renderBuilder = function() {
 let html=baseBuilder().replace('aria-label="Reset this edit"','aria-label="Undo last change"');
  html=html.replace(/(<div class="drawer-bottom"[^>]*>)([\s\S]*?)(<\/div>)/, (_,a,b,c)=>a+b+`<button class="finish-swatch ${draft.finish==='silver'?'active':''}" data-finish="silver" aria-label="silver finish" aria-pressed="${draft.finish==='silver'}"></button>`+c);
 if(!newCreation) html=html.replace('<div class="builder-drawer">',`<div class="builder-secondary">${roundControl('rename','pin','Rename Dweller')}${roundControl('retire','close','Retire Dweller')}</div><div class="builder-drawer">`);
 return html;
};
const baseCreatureSVG=creatureSVG;
creatureSVG=function(creature,options={}) {
 const markup=baseCreatureSVG({...creature,name:creature.name || 'New Dweller'},options);
 return creature.finish==='silver' ? markup.replace('class="dweller-svg','style="filter:grayscale(.85) sepia(.2)" class="dweller-svg') : markup;
};
const baseChoosePart=choosePart;
choosePart=function(variant) { undoHistory.push(structuredClone(draft)); if(activeCategory==='hand') draft.arms[selectedSocket]=variant; else draft[activeCategory]=variant; const scroll=game.querySelector('.parts-tray').scrollTop; render();game.querySelector('.parts-tray').scrollTop=scroll; };
function namedDialog(title,value,onSave) {
 showDialog({title,message:'',creature:draft,confirm:'Save',action:()=>{}});
 const box=game.querySelector('.dialog-box');
 const actionsNode=box.querySelector('.dialog-actions');
 const form=document.createElement('form');form.className='name-form';
 form.innerHTML=`<label for="dweller-name">Name</label><input class="form-input" id="dweller-name" maxlength="36" autocomplete="off" value="${escapeText(value)}" required>`;
 actionsNode.before(form);form.append(actionsNode);actionsNode.querySelector('[data-dialog-confirm]').type='submit';
 const submit=actionsNode.querySelector('[data-dialog-confirm]');submit.replaceWith(submit.cloneNode(true));
 form.addEventListener('submit',e=>{e.preventDefault();const name=form.querySelector('input').value.trim();if(!name)return;game.querySelector('.game-dialog').remove();onSave(name);});
 form.querySelector('input').focus();
}
function commitDraft() {
 const saved=structuredClone(draft);saved.chosen=[...categories];
 const at=creatures.findIndex(c=>c.id===saved.id);
 if(at<0)creatures.push(saved);else creatures[at]=saved;
 currentId=saved.id;view='workshop';persistPreview();render();announce('Dweller saved');
}
saveDraft=function() { if(!draft.name.trim()) namedDialog('Name your Dweller',names[nameIndex++%names.length],name=>{draft.name=name;commitDraft();});else commitDraft(); };
actions.save=saveDraft;
actions.reset=()=>{if(undoHistory.length){draft=undoHistory.pop();render();}};
actions.rename=()=>namedDialog('Rename Dweller',draft.name,name=>{draft.name=name;render();});
actions['close-builder']=()=>{
 if(JSON.stringify(draft)===JSON.stringify(initialDraft)){view='workshop';render();return;}
 showDialog({title:'Save your changes?',message:'Your unfinished Dweller is still on the workbench.',creature:draft,confirm:'Save',action:saveDraft});
 const discard=document.createElement('button');discard.textContent='Discard';discard.onclick=()=>{view='workshop';render();};game.querySelector('.dialog-actions').append(discard);
 game.querySelector('[data-dialog-cancel]').textContent='Continue';
};
actions.retire=()=>showDialog({title:'Retire Dweller?',message:'Keep it in Library. Its photographs stay in the feed.',creature:draft,confirm:'Retire',action:()=>{creatures.find(c=>c.id===draft.id).retired=true;view='workshop';persistPreview();render();}});
releaseCreature=function(id){currentId=id;selectedTarget=id;const c=creatures.find(c=>c.id===id);if(c.released){view='nearby';render();return;}accountReturn='release';view=demoAccount?'release':'account';render();};
function renderAccount(){return panel('Meet the world',`<p>Your Dweller is saved. The app asks for an account when you release it.</p><p class="sample-note">Browser preview: use a sample account. No email or password is collected.</p><button class="text-control" data-action="demo-account">Continue as sample player</button>`,accountReturn==='settings'?'settings-back':'cancel-release');}
function renderRelease(){const c=creatures.find(c=>c.id===currentId);return `<section class="app-panel"><header class="panel-head">${roundControl('cancel-release','close','Return to cabinet')}<h2>Dolores Park</h2><span class="sample-note">Demo</span></header><div class="release-map">${mapArt()}<span class="release-marker">${creatureSVG(c)}</span></div><div class="release-footer">${roundControl('confirm-release','rocket','Release here')}</div></section>`;}
actions['demo-account']=()=>{demoAccount=true;persistPreview();view=accountReturn;render();};
actions['settings-back']=()=>{view='settings';render();};
actions['cancel-release']=()=>{view='workshop';render();};
actions['confirm-release']=()=>{const c=creatures.find(c=>c.id===currentId);showDialog({title:'Release here?',message:'Place this saved version at the sample location.',creature:c,confirm:'Release',action:()=>{c.released=true;c.releasedSnapshot=structuredClone(c);const n=creatures.filter(v=>v.released).length;c.x=25+(n%3)*22;c.y=30+Math.floor(n/3)*15;c.distance=40+n*50;view='nearby';selectedTarget=c.id;persistPreview();render();}});};
const baseNearby=renderNearby;
renderNearby=function(){
 creatures.forEach(c=>{c.captured=caughtToday(c);});
 const all=[...creatures];creatures.splice(0,creatures.length,...all.filter(c=>!c.retired));
 let html=baseNearby();creatures.splice(0,creatures.length,...all);
 html=html.replaceAll('>Find<','>Catch<').replaceAll('>Explore<','>Walk<');
 if(capturedDraft)html=html.replace('<div class="game-map">','<div class="game-map"><button class="draft-badge" data-action="resume-draft">Drafts</button>');
 if(selectedTarget)html=html.replaceAll(`data-find="${selectedTarget}"`,`data-find="${selectedTarget}" aria-current="true"`);
 return html;
};
findCreature=function(id){currentId=id;selectedTarget=id;const c=creatures.find(c=>c.id===id);
 if(caughtToday(c)){const p=photos.find(p=>p.creature.id===id&&!p.sample&&p.day===today());showDialog({title:'Tomorrow',message:'You caught this Dweller today.',creature:c,confirm:'View photo',action:()=>{selectedPhoto=p.id;view='detail';render();}});return;}
 if(c.distance>328){showDialog({title:`${c.distance} ft away`,message:'Walk to this Dweller at the sample location.',creature:c,confirm:'Walk here',action:()=>{c.distance=50;c.x=53;c.y=46;render();}});return;}
 if(capturedDraft?.creature.id===id){actions['resume-draft']();return;}
 treatment={hue:0,tint:0,grain:0,frame:'none'};startHunt();
};
function filterStyle(t=treatment){return `sepia(${t.tint*.6}) hue-rotate(${t.hue*360}deg) saturate(${1+t.tint*.6}) contrast(${1+t.grain*.25})`;}
const baseHuntScene=huntScene;
huntScene=function(c,scene=0){let html=baseHuntScene(c,scene);return html.replace('class="hunt-viewport"',`class="hunt-viewport" style="filter:${filterStyle()}"`);};
const baseHunt=renderHunt;
renderHunt=function(){let html=baseHunt();return html.replace('<div class="hunt-footer">',`<div class="optics">${['Hue','Tint','Grain'].map(v=>`<button data-optical="${v.toLowerCase()}" aria-pressed="${opticalControl===v.toLowerCase()}">${v}</button>`).join('')}${opticalControl?`<input type="range" aria-label="${opticalControl}" data-optical-range="${opticalControl}" min="0" max="1" step=".01" value="${treatment[opticalControl]}">`:''}</div><div class="hunt-footer">`).replace('<span class="hunt-note">Drag to compose · pinch to zoom</span>','');};
function photoMarkup(p){const t=p.treatment||{hue:0,tint:0,grain:0,frame:'none'};const isSticker=t.frame.startsWith('stamp');const cutout=['halftone','roundBlob','tinyHoles','circlesShade','splash'].includes(t.frame);const mask=cutout?(['halftone','roundBlob'].includes(t.frame)?`mask-image:linear-gradient(#fff,#fff),url(assets/frames/${t.frame}.webp);mask-mode:alpha,luminance;mask-composite:exclude;`:`mask-image:url(assets/frames/${t.frame}.webp);mask-mode:luminance;`):'';return `<div class="feed-photo"><div class="photo-content" style="filter:${filterStyle(t)};${mask}">${outdoorArt(p.scene||0)}<div class="feed-creature" style="transform:translate(${p.position?.x||0}px,${p.position?.y||0}px) scale(${p.zoom||1})">${creatureSVG(p.creature)}</div></div>${t.frame!=='none'&&!cutout?`<img class="photo-treatment ${isSticker?'sticker':''}" src="assets/frames/${t.frame}.webp" alt="">`:''}</div>`;}
function renderFinishing(){return `<section class="hunt-screen"><header class="hunt-header">${roundControl('retake','back','Retake photo')}<span>Frame or sticker</span>${roundControl('photo-preview','check','Preview photo')}</header><div class="detail-photo">${photoMarkup({...capturedDraft,treatment})}</div><div class="frame-tray" aria-label="Photo treatment">${frameNames.map(f=>`<button data-frame="${f}" aria-label="${f==='none'?'No frame':f+' treatment'}" aria-pressed="${treatment.frame===f}">${f==='none'?'None':`<img src="assets/frames/${f}.webp" alt="">`}</button>`).join('')}</div></section>`;}
renderPreview=function(){return `<section class="hunt-screen"><header class="hunt-header">${roundControl('back-finish','back','Back to finishing')}<span>Preview</span></header><div class="detail-photo">${photoMarkup({...capturedDraft,treatment})}</div><div class="hunt-footer">${roundControl('ask-publish','publish','Publish photo','publish-control')}</div></section>`;};
actions.capture=()=>{const c=creatures.find(c=>c.id===currentId);capturedDraft={id:`photo-${Date.now()}`,creature:structuredClone(c.releasedSnapshot||c),position:{...huntPosition},zoom,treatment:{...treatment},scene:0};persistPreview();view='finish';render();};
actions['resume-draft']=()=>{currentId=capturedDraft.creature.id;zoom=capturedDraft.zoom;huntPosition={...capturedDraft.position};treatment={...capturedDraft.treatment};view='finish';render();};
actions['photo-preview']=()=>{capturedDraft.treatment={...treatment};persistPreview();view='preview';render();};
actions['back-finish']=()=>{view='finish';render();};
actions['ask-publish']=()=>showDialog({title:'Publish photo?',message:'Share this photograph in this browser’s sample feed.',creature:capturedDraft.creature,confirm:'Publish',action:()=>{
 const c=creatures.find(c=>c.id===capturedDraft.creature.id);if(caughtToday(c)){toast('Already caught today');return;}
 const photo={...structuredClone(capturedDraft),treatment:{...treatment},day:today(),published:true,liked:false};
 if(!photos.some(p=>p.id===photo.id))photos.unshift(photo);selectedPhoto=photo.id;capturedDraft=undefined;view='feed';persistPreview();render();
}});
renderFeed=function(){return `<div class="game-view">${navigation('feed')}<div class="app-switches"><button aria-pressed="true" data-view="feed">Feed</button><button data-view="library">Library</button></div><div class="feed-scroll">${photos.filter(p=>!p.removed).map(p=>`<article class="feed-card" data-photo="${p.id}"><button class="photo-open" data-open-photo="${p.id}" aria-label="Open ${escapeText(p.creature.name)} photograph">${photoMarkup(p)}</button><div class="feed-card-foot"><div><h4>${escapeText(p.creature.name)}</h4><p class="feed-byline">${p.sample?'Sample encounter · Dolores Park':'Created and photographed by you · Demo'}</p></div><button class="like ${p.liked?'liked':''}" data-like="${p.id}" aria-label="${p.liked?'Unlike':'Like'} ${escapeText(p.creature.name)} photo" aria-pressed="${p.liked}">${p.liked?'♥':'♡'}</button></div></article>`).join('')||'<p>No photographs yet.</p>'}</div></div>`;};
function renderDetail(){const p=photos.find(p=>p.id===selectedPhoto);if(!p)return panel('Photograph','<p>Photograph unavailable.</p>','back-feed');return panel(escapeText(p.creature.name),`<div class="detail-photo">${photoMarkup(p)}</div><p>${p.sample?'Sample encounter · Dolores Park':'Creator: you · Photographer: you'}</p><div class="panel-actions"><button class="text-control" data-like="${p.id}">${p.liked?'Unlike':'Like'}</button>${!p.sample&&!p.removed?'<button class="text-control" data-action="remove-post">Remove from Feed</button>':''}</div>`,'back-feed');}
function renderLibrary(){let body=`<div class="app-switches">${['Photos','Dwellers','Trash'].map(t=>`<button data-library-tab="${t}" aria-pressed="${libraryTab===t}">${t}</button>`).join('')}</div>`;
 if(libraryTab==='Photos'){if(capturedDraft)body+='<button class="panel-row" data-action="resume-draft">Unfinished photograph<small>Resume</small></button>';body+=photos.filter(p=>!p.sample&&!p.libraryRemoved).map(p=>`<div class="panel-row"><button class="photo-open" data-open-photo="${p.id}" aria-label="Open ${escapeText(p.creature.name)}">${photoMarkup(p)}</button><button class="text-control" data-remove-library="${p.id}">Remove</button></div>`).join('');}
 if(libraryTab==='Dwellers')body+=creatures.filter(c=>c.retired).map(c=>`<div class="panel-row">${creatureSVG(c)}<span>${escapeText(c.name)}</span><button class="text-control" data-restore-creature="${c.id}">Restore</button></div>`).join('');
 if(libraryTab==='Trash')body+=photos.filter(p=>p.removed||p.libraryRemoved).map(p=>`<div class="panel-row"><span>${escapeText(p.creature.name)}<small>${p.removed?'Feed':'Library'} removal</small></span><button class="text-control" data-restore-photo="${p.id}">Restore</button></div>`).join('');
 return `<div class="game-view">${navigation('feed')}<div class="app-switches"><button data-view="feed">Feed</button><button aria-pressed="true" data-view="library">Library</button></div><div class="panel-scroll">${body}</div></div>`;}
function renderPlayer(){const counts={Artist:activeCreatures().length,Hunter:photos.filter(p=>!p.sample&&!p.libraryRemoved).length+(capturedDraft?1:0),Spectator:photos.filter(p=>p.liked&&!p.removed).length};
 if(roleHistory){let content='';if(roleHistory==='Artist')content=activeCreatures().map(c=>`<button class="panel-row" data-edit="${c.id}">${creatureSVG(c)}<span>${escapeText(c.name)}</span></button>`).join('');else content=photos.filter(p=>roleHistory==='Hunter'?!p.sample&&!p.libraryRemoved:p.liked&&!p.removed).map(p=>`<button class="panel-row" data-open-photo="${p.id}"><span>${escapeText(p.creature.name)}</span></button>`).join('');return panel(roleHistory,content||'<p>Nothing here yet.</p>','back-roles');}
 return panel('Player',`<div class="token-balance">✧ Tokens <span>0</span></div>${Object.entries(counts).map(([r,n])=>`<button class="panel-row" data-role="${r}"><img src="assets/theme/${r==='Artist'?'nav-workshop-v2':r==='Hunter'?'nav-nearby-v2':'nav-camera-v2'}.webp" alt=""><span>${r}<small>${n} ${r==='Artist'?'creations':r==='Hunter'?'photos':'likes'}</small></span></button>`).join('')}<div class="panel-actions"><button class="text-control" data-view="rules">Game rules</button><button class="text-control" data-view="settings">Settings</button></div>`);}
function renderSettings(){return panel('Settings',`<p>Demo location: Dolores Park</p><p class="sample-note">Browser prototype · based on app ${previewVersion}. Map, camera and account use samples. Your work stays in this browser.</p><button class="text-control" data-action="account-settings">Account</button>`,'back-roles');}
function renderRules(){return panel('How to play','<p>Build a Dweller in Workshop. Save it, then release it at the sample location.</p><p>Find a Dweller in Nearby. Walk closer, compose a photograph, and choose a frame or sticker.</p><p>Publish the photograph to catch that Dweller for today. Retaking before publishing does not consume the catch.</p><p>Explore the Feed, like photographs, and keep drafts or retired Dwellers in Library.</p>','back-roles');}
actions.player=()=>{panelReturn=view;roleHistory=undefined;view='player';render();};
actions['close-panel']=()=>{view=panelReturn;render();};
actions['back-roles']=()=>{roleHistory=undefined;view='player';render();};
actions['back-feed']=()=>{view='feed';render();};
actions['account-settings']=()=>{accountReturn='settings';view='account';render();};
actions['remove-post']=()=>{const p=photos.find(p=>p.id===selectedPhoto);showDialog({title:'Remove from Feed?',message:'The local photograph stays in Library. Today’s catch remains used.',creature:p.creature,confirm:'Remove',action:()=>{p.removed=true;persistPreview();view='feed';render();}});};
// Additional current-app controls. Existing builder gestures remain in app.js.
game.addEventListener('click',e=>{
 if(e.target.closest('.game-dialog'))return;
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.openPhoto){selectedPhoto=b.dataset.openPhoto;view='detail';render();}
 else if(b.dataset.frame){treatment.frame=b.dataset.frame;capturedDraft.treatment={...treatment};persistPreview();render();}
 else if(b.dataset.optical){opticalControl=opticalControl===b.dataset.optical?undefined:b.dataset.optical;render();}
 else if(b.dataset.libraryTab){libraryTab=b.dataset.libraryTab;render();}
 else if(b.dataset.role){roleHistory=b.dataset.role;render();}
 else if(b.dataset.restoreCreature){creatures.find(c=>c.id===b.dataset.restoreCreature).retired=false;persistPreview();render();}
 else if(b.dataset.restorePhoto){const p=photos.find(p=>p.id===b.dataset.restorePhoto);if(p.removed)p.removed=false;else p.libraryRemoved=false;persistPreview();render();}
 else if(b.dataset.removeLibrary){const p=photos.find(p=>p.id===b.dataset.removeLibrary);showDialog({title:'Remove from Library?',message:'A published Feed copy stays visible. Restore this photo from Trash.',creature:p.creature,confirm:'Remove',action:()=>{p.libraryRemoved=true;persistPreview();render();}});}
 if(b.dataset.like||b.dataset.finish)persistPreview();
});
game.addEventListener('input',e=>{const key=e.target.dataset.opticalRange;if(!key)return;treatment[key]=Number(e.target.value);const finder=game.querySelector('.hunt-viewport');if(finder)finder.style.filter=filterStyle();});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!game.querySelector('.game-dialog')&&document.documentElement.classList.contains('embedded'))parent.postMessage('dwellers:close',location.origin);});
window.addEventListener('pagehide',persistPreview);
render();

game.addEventListener('click',e=>{if(view==='builder'&&e.target.closest('[data-finish]'))undoHistory.push(structuredClone(draft));},{capture:true});
game.addEventListener('pointerdown',e=>{if(view==='builder'&&e.target.closest('[data-draggable]'))undoHistory.push(structuredClone(draft));},{capture:true});
// Preserve map framing across drawer and destination changes.
let mapOffset={x:0,y:0}, mapPointer;
const currentRender=render;
render=function(){currentRender();const world=game.querySelector('.map-world');if(world)world.style.transform=`translate(${mapOffset.x}px,${mapOffset.y}px) scale(${mapZoom})`;};
const oldRecenter=actions.recenter;
actions.recenter=()=>{mapOffset={x:0,y:0};oldRecenter();};
game.addEventListener('pointerdown',e=>{const world=e.target.closest('.game-map');if(view!=='nearby'||!world||e.target.closest('button'))return;mapPointer={id:e.pointerId,x:e.clientX,y:e.clientY};world.setPointerCapture(e.pointerId);});
game.addEventListener('pointermove',e=>{if(mapPointer?.id!==e.pointerId)return;mapOffset.x=Math.max(-180,Math.min(180,mapOffset.x+e.clientX-mapPointer.x));mapOffset.y=Math.max(-180,Math.min(180,mapOffset.y+e.clientY-mapPointer.y));mapPointer.x=e.clientX;mapPointer.y=e.clientY;const world=game.querySelector('.map-world');if(world)world.style.transform=`translate(${mapOffset.x}px,${mapOffset.y}px) scale(${mapZoom})`;});
window.addEventListener('pointerup',()=>{mapPointer=undefined;});window.addEventListener('pointercancel',()=>{mapPointer=undefined;});
iconPaths.rename='<path d="m4 16 11-12 5 5L9 21H3Zm9-10 5 5"/>';
iconPaths.retire='<path d="M3 4h18v5H3Zm2 5v12h14V9M9 13h6"/>';
const currentBuilder=renderBuilder;
renderBuilder=function(){return currentBuilder().replace('data-action="rename" aria-label="Rename Dweller" title="Rename Dweller">'+icon('pin'),'data-action="rename" aria-label="Rename Dweller" title="Rename Dweller">'+icon('rename')).replace('data-action="retire" aria-label="Retire Dweller" title="Retire Dweller">'+icon('close'),'data-action="retire" aria-label="Retire Dweller" title="Retire Dweller">'+icon('retire'));};
