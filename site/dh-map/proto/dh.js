/* EY Digital Hub screen kit: app bar, bottom nav and icons from data attributes. */
(function(){
'use strict';
const ICONS={
  grid:'<svg viewBox="0 0 24 24"><path d="M3 3h5v5H3zM9.5 3h5v5h-5zM16 3h5v5h-5zM3 9.5h5v5H3zM9.5 9.5h5v5h-5zM16 9.5h5v5h-5zM3 16h5v5H3zM9.5 16h5v5h-5zM16 16h5v5h-5z"/></svg>',
  gauge:'<svg viewBox="0 0 24 24"><path d="M12 4a9 9 0 0 0-9 9 8.9 8.9 0 0 0 1.6 5.1l1.6-1.2A7 7 0 1 1 19 13h2a9 9 0 0 0-9-9zm4.2 4.4-5 4.2a1.6 1.6 0 1 0 1.9 1.9l3.1-6.1z"/></svg>',
  face:'<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-3.5-9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm7 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM12 17.5c2.3 0 4.3-1.4 5.1-3.5H6.9c.8 2.1 2.8 3.5 5.1 3.5z"/></svg>',
  bell:'<svg viewBox="0 0 24 24"><path d="M12 3a1 1 0 0 1 1 1v1.1a7 7 0 0 1 6 6.9v1l1.5 2.5a1 1 0 0 1-.9 1.5h-3.9a3.8 3.8 0 0 1-7.4 0H4.4a1 1 0 0 1-.9-1.5L5 13v-1a7 7 0 0 1 6-6.9V4a1 1 0 0 1 1-1zm0 16a1.8 1.8 0 0 0 1.7-1h-3.4a1.8 1.8 0 0 0 1.7 1z"/></svg>',
  bookmark:'<svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1zm1 2v12.6l5-2.9 5 2.9V5H7z"/></svg>',
  search:'<svg viewBox="0 0 24 24"><path d="M10 3a7 7 0 0 1 5.6 11.2l5.1 5.1-1.4 1.4-5.1-5.1A7 7 0 1 1 10 3zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/></svg>',
  close:'<svg viewBox="0 0 24 24"><path d="M5.7 4.3 12 10.6l6.3-6.3 1.4 1.4L13.4 12l6.3 6.3-1.4 1.4L12 13.4l-6.3 6.3-1.4-1.4L10.6 12 4.3 5.7z"/></svg>',
  back:'<svg viewBox="0 0 24 24"><path d="m10.8 4.4 1.4 1.4L7.6 10.4H20v2H7.6l4.6 4.6-1.4 1.4-7-7z"/></svg>',
  chevron:'<svg viewBox="0 0 24 24"><path d="m9 5.6 1.4-1.4L18.2 12l-7.8 7.8L9 18.4l6.4-6.4z"/></svg>',
  down:'<svg viewBox="0 0 24 24"><path d="M12 15.4 5.6 9 7 7.6l5 5 5-5L18.4 9z"/></svg>',
  door:'<svg viewBox="0 0 24 24"><path d="M4 3h11v18H4zm2 2v14h7V5zm5 6h1.6v2H11zM17 7h3v10h-3v-2h1V9h-1z"/></svg>',
  mouse:'<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 1 7 7v6a7 7 0 1 1-14 0V9a7 7 0 0 1 7-7zm-1 2.1A5 5 0 0 0 7 9v1h4zm2 0V10h4V9a5 5 0 0 0-4-4.9zM7 12v3a5 5 0 0 0 10 0v-3z"/></svg>',
  monitor:'<svg viewBox="0 0 24 24"><path d="M3 4h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-7v2h3v2H7v-2h3v-2H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm1 2v9h16V6z"/></svg>',
  ticket:'<svg viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2.5a2.5 2.5 0 0 0 0 5V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2.5a2.5 2.5 0 0 0 0-5zm2 0v1.1A4.5 4.5 0 0 1 5 15.9V17h14v-1.1a4.5 4.5 0 0 1 0-7.8V7zm4 2h2v2H9zm0 4h2v2H9z"/></svg>',
  pin:'<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7zm0 4.5A2.5 2.5 0 1 0 12 11.5 2.5 2.5 0 0 0 12 6.5z"/></svg>',
  check:'<svg viewBox="0 0 24 24"><path d="m9.5 16.2-3.7-3.7-1.4 1.4 5.1 5.1 11-11-1.4-1.4z"/></svg>',
  warn:'<svg viewBox="0 0 24 24"><path d="M12 2 1.5 21h21zm-1 7h2v6h-2zm0 7h2v2h-2z"/></svg>',
  camera:'<svg viewBox="0 0 24 24"><path d="M9 4h6l1.5 2H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.5zm3 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/></svg>',
  image:'<svg viewBox="0 0 24 24"><path d="M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm1 2v10.5l4-4 3 3 3-4 4 5.3V6zm3 1.5A1.5 1.5 0 1 1 8 10.5a1.5 1.5 0 0 1 0-3z"/></svg>',
  wifi:'<svg viewBox="0 0 24 24"><path d="M12 20a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm-4.2-5.2-1.4-1.4a8 8 0 0 1 11.2 0l-1.4 1.4a6 6 0 0 0-8.4 0zm-2.8-2.8L3.6 10.6a12 12 0 0 1 16.8 0L19 12a10 10 0 0 0-14 0z"/></svg>',
  clock:'<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm-1 3h2v5.6l3.5 2-1 1.7L11 13z"/></svg>',
  people:'<svg viewBox="0 0 24 24"><path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm8 0a3 3 0 1 1 0-6 3 3 0 0 1 0 6zM2 19a6 6 0 0 1 12 0zm10.5 0a7.9 7.9 0 0 0-2.2-5.2A6 6 0 0 1 22 19z"/></svg>',
  tv:'<svg viewBox="0 0 24 24"><path d="M3 5h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2v9h16V7zm4 13h8v1.5H8z"/></svg>',
  phone:'<svg viewBox="0 0 24 24"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.2 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.2.2 2.4.6 3.6a1 1 0 0 1-.3 1z"/></svg>',
  battery:'<svg viewBox="0 0 24 24"><path d="M4 7h13a1 1 0 0 1 1 1v1h2v6h-2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zm1 2v6h11V9z"/></svg>',
  dock:'<svg viewBox="0 0 24 24"><path d="M12 3l4 4h-3v6h-2V7H8zM3 15h18v4H3z"/></svg>',
  headset:'<svg viewBox="0 0 24 24"><path d="M12 3a8 8 0 0 1 8 8v6a3 3 0 0 1-3 3h-2v-7h3v-2a6 6 0 0 0-12 0v2h3v7H7a3 3 0 0 1-3-3v-6a8 8 0 0 1 8-8z"/></svg>',
  keyboard:'<svg viewBox="0 0 24 24"><path d="M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm2 3v2h2V9zm4 0v2h2V9zm4 0v2h2V9zm4 0v2h2V9zM5 13v2h2v-2zm4 0v2h6v-2zm8 0v2h2v-2z"/></svg>',
  adapter:'<svg viewBox="0 0 24 24"><path d="M4 5h11v8H4zm2 2v4h7V7zm11 1h3v2h-3zm0 3h3v2h-3zM8 14h3v3h3v2H8z"/></svg>',
  laptop:'<svg viewBox="0 0 24 24"><path d="M4 5h16a1 1 0 0 1 1 1v10H3V6a1 1 0 0 1 1-1zm1 2v7h14V7zM2 17h20v2H2z"/></svg>',
  shield:'<svg viewBox="0 0 24 24"><path d="M12 2 4 5v6c0 5 3.4 9.6 8 11 4.6-1.4 8-6 8-11V5zm-1 13.4-3.2-3.2 1.4-1.4 1.8 1.8 4.6-4.6 1.4 1.4z"/></svg>',
  doc:'<svg viewBox="0 0 24 24"><path d="M6 2h8l5 5v15H6zm7 2v4h4zM8 12h8v1.5H8zm0 3h8v1.5H8z"/></svg>',
  lock:'<svg viewBox="0 0 24 24"><path d="M12 2a5 5 0 0 1 5 5v3h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h1V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v3h6V7a3 3 0 0 0-3-3zm0 9a1.5 1.5 0 0 0-.8 2.8V18h1.6v-2.2A1.5 1.5 0 0 0 12 13z"/></svg>',
  star:'<svg viewBox="0 0 24 24"><path d="m12 2 3 6.5 7 .8-5.2 4.8 1.4 7L12 17.5 5.8 21l1.4-7L2 9.3l7-.8z"/></svg>',
  filter:'<svg viewBox="0 0 24 24"><path d="M3 5h18v2l-7 7v6l-4-2v-4L3 7z"/></svg>',
  plus:'<svg viewBox="0 0 24 24"><path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7z"/></svg>',
  send:'<svg viewBox="0 0 24 24"><path d="M3 11 21 3l-8 18-2-7z"/></svg>',
  user:'<svg viewBox="0 0 24 24"><path d="M12 12a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm-8 9a8 8 0 0 1 16 0z"/></svg>',
  key:'<svg viewBox="0 0 24 24"><path d="M14.5 2a7.5 7.5 0 0 0-7.2 9.7L2 17v5h5v-3h3v-3h3l1.3-1.3A7.5 7.5 0 1 0 14.5 2zm2 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/></svg>',
  arrowdown:'<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM11 7h2v6.2l2.6-2.6 1.4 1.4-5 5-5-5 1.4-1.4L11 13.2z"/></svg>',
  cart:'<svg viewBox="0 0 24 24"><path d="M3 3h3l.8 3H21l-2.5 8H8.2L5 5H3zm5.6 5 1.4 4.5h7.1L18.4 8zM9 18a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm8 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/></svg>'
};
const icon=n=>ICONS[n]||ICONS.grid;
document.querySelectorAll('[data-icon]').forEach(el=>{el.classList.add('ic');el.innerHTML=icon(el.dataset.icon);});
document.querySelectorAll('.appbar[data-title]').forEach(bar=>{
  const title=bar.dataset.title, avatar=bar.hasAttribute('data-avatar');
  bar.innerHTML=(avatar?'<span class="avatar"><span class="avatar-img"></span></span>':'')+(bar.dataset.back!==undefined?'<span class="leading ic">'+ICONS.back+'</span>':'')+'<span class="title">'+title+'</span><span class="ey" aria-hidden="true"><span class="wedge"></span><span class="beam"></span><span class="word">EY</span></span>';
});
document.querySelectorAll('.appbar.plain[data-close]').forEach(bar=>{bar.innerHTML='<span class="close ic">'+ICONS.close+'</span>';});
document.querySelectorAll('.bottomnav').forEach(nav=>{
  if(nav.children.length)return;
  nav.innerHTML='<span class="home"><span class="ic">'+ICONS.grid+'</span></span><span class="ic">'+ICONS.gauge+'</span><span class="ic">'+ICONS.face+'</span><span class="ic">'+ICONS.bell+'</span><span class="ic">'+ICONS.bookmark+'</span>';
});
document.querySelectorAll('.steps[data-step]').forEach(s=>{const [a,b]=s.dataset.step.split('/').map(Number);s.innerHTML='<i style="width:'+(100*a/b)+'%"></i>';});
})();
