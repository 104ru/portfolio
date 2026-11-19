(() => {
 const links = [...document.querySelectorAll('a[href="prototype.html"],a[href="dwellers/prototype.html"]')];
 if (!links.length) return;
 const popup = document.createElement('dialog');
 popup.className = 'prototype-popup';
 popup.setAttribute('aria-label', 'Dwellers playable prototype');
 popup.innerHTML = '<header><span>Dwellers · Browser prototype</span><button type="button" aria-label="Close prototype">×</button></header><iframe title="Dwellers playable prototype"></iframe>';
 document.body.append(popup);
 const frame = popup.querySelector('iframe');
 let opener;
 function close() { popup.close(); }
 popup.querySelector('button').addEventListener('click', close);
 popup.addEventListener('click', e => { if(e.target === popup) close(); });
 popup.addEventListener('close', () => { document.body.classList.remove('prototype-open'); frame.removeAttribute('src'); opener?.focus(); });
 window.addEventListener('message', e => { if(e.origin === location.origin && e.source === frame.contentWindow && e.data === 'dwellers:close') close(); });
 links.forEach(link => { link.removeAttribute('target');link.addEventListener('click', e => {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !matchMedia('(min-width: 761px)').matches) return;
  e.preventDefault(); opener = link; const url=new URL(link.href);url.searchParams.set('embed','1');frame.src=url.href; popup.showModal(); document.body.classList.add('prototype-open');
 });});
})();
