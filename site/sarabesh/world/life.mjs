/* Existing Dwellers artwork, anchored in the panorama rather than the viewport. */
const radians = value => value * Math.PI / 180;
const seedFor = value => [...value].reduce((n,c)=>((n*31+c.charCodeAt(0))>>>0),7);
const vector = (yaw,pitch) => {const a=radians(yaw),b=radians(pitch);return [Math.sin(a)*Math.cos(b),Math.sin(b),Math.cos(a)*Math.cos(b)];};
export function ambientPhase(time,seconds,pause=0,offset=0){
  const elapsed=Math.max(0,time+offset*seconds),cycle=seconds+pause,age=elapsed%cycle;
  return {active:age<seconds,progress:Math.min(1,age/seconds),reverse:Math.floor(elapsed/cycle)%2===1};
}
export class WorldLife {
  constructor({viewer}) {
    this.viewer=viewer;this.nodes=[];this.state=null;this.motion=matchMedia('(prefers-reduced-motion: reduce)');this.started=performance.now();this.lastCamera=null;this.motion.addEventListener('change',()=>{this.lastCamera=null;});
    this.layer=document.createElement('div');this.layer.id='world-life';this.layer.inert=true;document.querySelector('#panorama').append(this.layer);
    this.loaded=Promise.all(['world/life.json?v=life-16','world/cast-art.json?v=life-16'].map(async url=>{const r=await fetch(url);if(!r.ok)throw Error('Resident artwork could not load');return r.json();})).then(([data,art])=>{this.data=data;this.art=art;this.rebuild();document.body.dataset.lifeReady='true';});
    this.loaded.catch(error=>console.error(error));
    this.frame=()=>{this.render();this.animation=requestAnimationFrame(this.frame);};this.animation=requestAnimationFrame(this.frame);
  }
  setScene(scene,period,light){const key=[scene,period,light].join('/');if(this.state?.key===key)return;this.state={scene,period,light,key};this.rebuild();}
  sprite(parent,art){for(const type of ['body','eyes']){const img=document.createElement('img');img.src=art[type];img.alt='';img.draggable=false;img.className='dweller-'+type;parent.append(img);}}
  rebuild(){
    if(!this.data||!this.state)return;
    this.layer.replaceChildren();this.nodes=[];this.lastCamera=null;const {scene,period,light}=this.state;
    this.layer.dataset.period=period;this.layer.dataset.light=String(light);this.layer.dataset.scene=scene;
    const outside=['town','landing','window'].includes(scene);this.layer.classList.toggle('outside',outside);this.layer.classList.toggle('windowless',['foyer','hotel'].includes(scene));
    for(const resident of this.data.cast.filter(item=>item.scene===scene&&item.periods.includes(period))){
      const art=this.art[resident.art];const button=document.createElement('div');button.className='world-resident';button.setAttribute('role','img');button.setAttribute('aria-label','Dweller');button.dataset.resident=resident.id;
      const shadow=document.createElement('span');shadow.className='resident-shadow';shadow.setAttribute('aria-hidden','true');button.append(shadow);
      const crop=document.createElement('span');crop.className='resident-crop';if(resident.occlusion)crop.style.clipPath=`inset(0 0 ${resident.occlusion*100}% 0)`;
      const pose=document.createElement('span');pose.className='dweller-motion '+(resident.motion||'idle');pose.style.setProperty('--idle-duration',(7+seedFor(resident.id)%50/10)+'s');pose.style.setProperty('--idle-delay',-(seedFor(resident.id)%60)/10+'s');pose.style.setProperty('--eye-x',art.eyeX*100+'%');pose.style.setProperty('--eye-y',art.eyeY*100+'%');this.sprite(pose,art);
      if(resident.prop){const prop=document.createElement('span');prop.className='dweller-prop '+resident.prop;prop.setAttribute('aria-hidden','true');pose.append(prop);}
      crop.append(pose);button.append(crop);
      if(resident.occlusion)shadow.hidden=true;
      this.layer.append(button);this.nodes.push({el:button,...resident,aspect:art.aspect,point:vector(resident.yaw,resident.pitch),kind:'resident'});
    }
    const weather=this.data.weather[scene]||{};
    if(light)for(const [i,lamp]of(weather.lamps||[]).entries()){
      const el=document.createElement('div');el.className='ambient lamp-flicker';el.setAttribute('aria-hidden','true');el.innerHTML='<span class="lamp-aura"></span><span class="lamp-dip"></span>';el.style.setProperty('--lamp-delay',-(seedFor(scene)%13+i*4)+'s');this.layer.append(el);this.nodes.push({el,...lamp,aspect:1,point:vector(lamp.yaw,lamp.pitch),kind:'lamp'});
    }
    for(const [i,emitter]of(weather.steam||[]).entries()){
      const el=document.createElement('div');el.className='ambient steam-source';el.style.setProperty('--steam-delay',-(seedFor(scene)%17+i*3)+'s');el.setAttribute('aria-hidden','true');
      for(let j=0;j<5;j++){const w=document.createElement('span');w.className='steam-wisp';w.style.setProperty('--wisp-delay',(-j*1.23-i*.5)+'s');w.style.setProperty('--drift',(j%2?1:-1)*18+'%');el.append(w);}this.layer.append(el);this.nodes.push({el,...emitter,aspect:.54,point:vector(emitter.yaw,emitter.pitch),kind:'steam'});
    }
    for(const [i,path]of(weather.sand||[]).entries()){const el=document.createElement('div');el.className='ambient wind-sand';el.setAttribute('aria-hidden','true');this.layer.append(el);this.nodes.push({el,...path,kind:'sand',phase:i*.3,aspect:path.width/path.height});}
    for(const [i,path]of(weather.weeds||[]).entries()){const el=document.createElement('div');el.className='ambient tumbleweed';el.setAttribute('aria-hidden','true');el.innerHTML='<span class="weed-shadow"></span>'+this.weed(seedFor(scene)+i);this.layer.append(el);this.nodes.push({el,...path,kind:'weed',phase:.16+i*.4,aspect:1});}
    for(const [i,path]of(weather.creatures||[]).entries()){
      const el=document.createElement('div');el.className='ambient clockwork-critter';el.setAttribute('aria-hidden','true');const shadow=document.createElement('span');shadow.className='resident-shadow';el.append(shadow);const pose=document.createElement('span');pose.className='critter-step';pose.innerHTML=this.beetle();el.append(pose);this.layer.append(el);this.nodes.push({el,...path,from:[path.start.yaw,path.start.pitch],to:[path.end.yaw,path.end.pitch],kind:'critter',phase:.25+i*.33,aspect:1.25});
    }
    document.body.dataset.residents=String(this.nodes.filter(n=>n.kind==='resident').length);
  }
  beetle(){return `<svg class="clockwork-beetle" viewBox="5 0 90 72" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="beetle-shell"><stop stop-color="#b09c61"/><stop offset=".55" stop-color="#686c47"/><stop offset="1" stop-color="#242c21"/></radialGradient></defs><g class="beetle-legs" fill="none" stroke="#58422a" stroke-width="3" stroke-linecap="round"><path d="M40 31 23 23 15 30M38 43 17 42 10 50M41 55 22 62 20 70M60 31 77 23 85 30M62 43 83 42 90 50M59 55 78 62 80 70"/></g><g stroke="#342d1e" stroke-width="2"><ellipse cx="50" cy="45" rx="20" ry="27" fill="url(#beetle-shell)"/><path d="M50 21v49" stroke="#c5aa68" stroke-width="1.4"/><ellipse cx="50" cy="18" rx="12" ry="10" fill="#5b5435"/><path d="M44 11 36 4M56 11 64 4" fill="none" stroke-linecap="round"/></g><path d="M37 34q-5 13 0 22" fill="none" stroke="#cebc83" stroke-width="1.5" opacity=".55"/></svg>`;}
  weed(seed){
    let n=seed;const random=()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;};let paths='';
    for(let i=0;i<46;i++){const angle=random()*Math.PI*2,r=28+random()*18;const x=50+Math.cos(angle)*r,y=50+Math.sin(angle)*r;const bx=50+Math.cos(angle+1.6)*r*.7,by=50+Math.sin(angle+1.6)*r*.7;const ex=50+Math.cos(angle+2.8)*r*.65,ey=50+Math.sin(angle+2.8)*r*.65;paths+=`<path d="M${x.toFixed(1)} ${y.toFixed(1)}Q${bx.toFixed(1)} ${by.toFixed(1)},${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="${i%3?'#9c743d':'#d2b17b'}" stroke-width="${(.7+random()*.8).toFixed(1)}"/>`;}
    return `<svg class="weed-brush" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">${paths}</svg>`;
  }
  render(){
    const active=document.body.classList.contains('entered')&&document.body.dataset.ready==='true';this.layer.inert=!active;
    if(!active||!this.nodes.length||document.hidden)return;
    const width=this.layer.clientWidth,height=this.layer.clientHeight;if(!width||!height)return;
    const yaw=radians(this.viewer.getYaw()),pitch=radians(this.viewer.getPitch()),f=width/(2*Math.tan(radians(this.viewer.getHfov()/2))),time=(performance.now()-this.started)/1000;
    const cameraKey=[width,height,yaw.toFixed(5),pitch.toFixed(5),f.toFixed(3)].join('/');const cameraChanged=cameraKey!==this.lastCamera;this.lastCamera=cameraKey;
    for(const node of this.nodes){
      if(this.motion.matches&&node.kind!=='resident'){node.el.hidden=true;continue;}
      if(!node.from&&!cameraChanged)continue;
      let point=node.point,alpha=1;
      let headingPoint=null;
      if(node.from){
        const phase=ambientPhase(time,node.seconds,node.pause,node.phase);if(!phase.active){node.el.hidden=true;continue;}
        let progress=phase.progress;if(node.kind==='critter')progress=phase.reverse?1-progress:progress;
        const at=p=>vector(node.from[0]+(node.to[0]-node.from[0])*p,node.from[1]+(node.to[1]-node.from[1])*p);
        point=at(progress);alpha=Math.min(1,phase.progress/.09,(1-phase.progress)/.09);
        if(node.kind==='weed')node.el.style.setProperty('--roll',time*65+'deg');
        if(node.kind==='critter')headingPoint=at(progress+(phase.reverse?-.001:.001));
      }
      const [x,y,z]=point;const xp=x*Math.cos(yaw)-z*Math.sin(yaw),zp=x*Math.sin(yaw)+z*Math.cos(yaw),yp=y*Math.cos(pitch)-zp*Math.sin(pitch),zz=y*Math.sin(pitch)+zp*Math.cos(pitch);
      if(zz<.16){node.el.hidden=true;continue;}
      const px=width/2+f*xp/zz,py=height/2-f*yp/zz,h=f*Math.tan(radians(node.height))/zz,w=h*node.aspect;
      if(px+w/2<0||px-w/2>width||py< -h||py-h>height){node.el.hidden=true;continue;}
      if(headingPoint){const [hx,hy,hz]=headingPoint;const hxp=hx*Math.cos(yaw)-hz*Math.sin(yaw),hzp=hx*Math.sin(yaw)+hz*Math.cos(yaw),hyp=hy*Math.cos(pitch)-hzp*Math.sin(pitch),hzz=hy*Math.sin(pitch)+hzp*Math.cos(pitch);const dx=width/2+f*hxp/hzz-px,dy=height/2-f*hyp/hzz-py;node.el.style.setProperty('--heading',(Math.atan2(dy,dx)*180/Math.PI+90)+'deg');}
      node.el.hidden=false;node.el.style.setProperty('--shade-softness',Math.max(1,Math.min(8,h*.025))+'px');node.el.style.width=w+'px';node.el.style.height=h+'px';node.el.style.left=px+'px';node.el.style.top=py+'px';node.el.style.opacity=alpha;
      node.el.style.zIndex=node.kind==='resident'?Math.round(35-node.pitch*2):node.kind==='critter'?85:node.kind==='lamp'?4:3;
    }
  }
  destroy(){cancelAnimationFrame(this.animation);this.layer.remove();}
}
