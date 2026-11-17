/* Stand-in for the Shopify storefront endpoints, so the static copy behaves like the store:
   cart (add / change / drawer / header badge), predictive search, search page, contact and
   newsletter forms, checkout. The cart lives in localStorage. Nothing leaves the browser. */
(function () {
  'use strict';
  var BASE = window.__RC_BASE__ || '';
  var KEY = 'rc-demo-cart';
  var realFetch = window.fetch.bind(window);
  var dataPromise = realFetch(BASE + '/assets/store-data.json').then(function (r) { return r.json(); });

  window.Shopify = window.Shopify || {};
  Shopify.shop = 'rancourt-test.myshopify.com';
  Shopify.locale = 'en';
  Shopify.currency = { active: 'USD', rate: '1.0' };
  Shopify.country = 'US';
  Shopify.routes = { root: BASE + '/' };
  Shopify.theme = Shopify.theme || { name: 'Avenue', role: 'main' };

  /* ---------- money ---------- */
  function money(cents, trim) {
    var s = '$' + (cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return trim ? s.replace(/\.00$/, '') : s;
  }

  /* ---------- cart state ---------- */
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save(lines) { try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch (e) {} }

  function cartJson(data) {
    var lines = load(), items = [], count = 0, total = 0;
    lines.forEach(function (l) {
      var v = data.variants[l.id]; if (!v) return;
      var p = data.products[v.handle] || {};
      var line = v.price * l.qty; count += l.qty; total += line;
      items.push({
        id: v.id, key: v.id + ':demo', quantity: l.qty, variant_id: v.id, product_id: p.id,
        title: p.title + (v.title && v.title !== 'Default Title' ? ' - ' + v.title : ''),
        product_title: p.title, variant_title: v.title === 'Default Title' ? null : v.title,
        price: v.price, original_price: v.price, final_price: v.price, line_price: line,
        original_line_price: line, final_line_price: line, sku: v.sku, vendor: p.vendor,
        handle: v.handle, url: p.url + '?variant=' + v.id, image: v.image || p.image,
        featured_image: { url: v.image || p.image, alt: p.title }, options_with_values: [],
        product_type: p.type, requires_shipping: true, discounts: [], properties: {}
      });
    });
    return { token: 'demo', note: null, attributes: {}, items: items, item_count: count,
      total_price: total, original_total_price: total, items_subtotal_price: total,
      total_discount: 0, total_weight: 0, currency: 'USD', requires_shipping: count > 0, cart_level_discount_applications: [] };
  }

  function addItems(data, list) {
    var lines = load(), added = [];
    list.forEach(function (it) {
      var id = String(it.id), qty = parseInt(it.quantity || 1, 10) || 1;
      if (!data.variants[id]) return;
      var l = lines.find(function (x) { return x.id === id; });
      if (l) l.qty += qty; else lines.push({ id: id, qty: qty });
      added.push(id);
    });
    save(lines);
    var cart = cartJson(data);
    return cart.items.filter(function (i) { return added.indexOf(String(i.variant_id)) !== -1; });
  }

  function changeLine(data, body) {
    var lines = load(), cart = cartJson(data), id = null;
    if (body.line) { var it = cart.items[parseInt(body.line, 10) - 1]; if (it) id = String(it.variant_id); }
    if (!id && body.id != null) id = String(body.id).split(':')[0];
    var qty = parseInt(body.quantity, 10);
    lines = lines.map(function (l) { if (l.id === id) l.qty = qty; return l; }).filter(function (l) { return l.qty > 0; });
    save(lines);
    return cartJson(data);
  }

  /* ---------- section rendering ---------- */
  function parse(html) { return new DOMParser().parseFromString(html, 'text/html'); }

  function shortTitle(t) { return String(t || '').split(' - ')[0]; }

  function renderDrawer(data) {
    var cart = cartJson(data);
    if (!cart.items.length) return data['capture:empty-cart-drawer.html'];
    var dom = parse(data['capture:one-cart-drawer.html']);
    var drawer = dom.querySelector('cart-drawer');
    var tpl = dom.querySelector('.rc-cart-item');
    var wrap = tpl.parentNode;
    tpl.remove();
    cart.items.forEach(function (it) {
      var n = tpl.cloneNode(true);
      n.setAttribute('data-line-key', it.key);
      n.setAttribute('data-variant-id', it.variant_id);
      n.querySelectorAll('a').forEach(function (a) { a.setAttribute('href', it.url); });
      var img = n.querySelector('img');
      if (img) {
        ['srcset', 'data-src', 'data-zoom', 'data-source', 'sizes'].forEach(function (k) { img.removeAttribute(k); });
        img.setAttribute('src', it.image); img.setAttribute('alt', it.product_title);
        img.classList.remove('lazyload');
      }
      n.querySelector('.rc-cart-item__title a').textContent = shortTitle(it.product_title);
      var meta = n.querySelector('.rc-cart-item__meta');
      if (meta) meta.textContent = (it.variant_title || '').split(' / ').join(' · ');
      n.querySelector('.rc-cart-item__price').textContent = money(it.final_line_price);
      var badges = n.querySelector('.rc-cart-item__badges'); if (badges) badges.remove();
      n.querySelector('[data-cart-qty]').setAttribute('value', it.quantity);
      var rm = n.querySelector('[data-cart-remove]'); if (rm) rm.setAttribute('aria-label', 'Remove ' + it.product_title);
      wrap.appendChild(n);
    });
    drawer.setAttribute('data-cart-count', cart.item_count);
    drawer.setAttribute('data-cart-total', cart.total_price);
    var title = dom.querySelector('[data-cart-title]'); if (title) title.textContent = 'Cart (' + cart.item_count + ')';
    dom.querySelectorAll('[data-cart-subtotal],[data-cart-total-display]').forEach(function (e) { e.textContent = money(cart.total_price, true); });
    var ship = dom.querySelector('[data-rc-free-ship]');
    if (ship) {
      var th = parseInt(ship.getAttribute('data-threshold') || '25000', 10);
      var met = cart.total_price >= th;
      var msg = met ? ship.getAttribute('data-msg-met') : ship.getAttribute('data-msg-below').replace('{amount}', money(th - cart.total_price, true));
      ship.style.setProperty('--rc-fill-pct', Math.min(100, Math.round(cart.total_price / th * 100)) + '%');
      var m = ship.querySelector('[data-rc-free-ship-msg]'); if (m) m.textContent = msg;
    }
    return dom.body.innerHTML;
  }

  function renderDropdown(data) {
    var cart = cartJson(data);
    if (!cart.items.length) return data['capture:empty-cart-dropdown.html'];
    var dom = parse(data['capture:one-cart-dropdown.html']);
    var ul = dom.querySelector('#cart-dropdown'), tpl = ul.querySelector('li');
    tpl.remove();
    cart.items.forEach(function (it) {
      var n = tpl.cloneNode(true);
      n.querySelectorAll('a').forEach(function (a) { a.setAttribute('href', it.url); a.setAttribute('title', it.title); });
      var img = n.querySelector('img');
      if (img) { ['srcset', 'data-src', 'data-zoom', 'data-source'].forEach(function (k) { img.removeAttribute(k); }); img.setAttribute('src', it.image); }
      var h5 = n.querySelector('.item-title h5 a'); if (h5) h5.innerHTML = it.product_title + (it.variant_title ? '<br/><small>' + it.variant_title + '</small>' : '');
      var rev = n.querySelector('.reviews'); if (rev) rev.remove();
      var h6 = n.querySelector('.product-price h6'); if (h6) h6.textContent = money(it.price) + ' each';
      var tot = n.querySelector('.vendors'); if (tot) tot.textContent = 'total: ' + money(it.final_line_price);
      ul.appendChild(n);
    });
    ul.setAttribute('data-items', cart.item_count);
    ul.setAttribute('data-total', money(cart.total_price, true));
    return dom.body.innerHTML;
  }

  /* ---------- search ---------- */
  function matches(data, q) {
    var words = String(q || '').toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    return Object.keys(data.products).map(function (h) { return data.products[h]; }).filter(function (p) {
      var hay = (p.title + ' ' + p.type + ' ' + (p.tags || []).join(' ') + ' ' + p.description).toLowerCase();
      return words.every(function (w) { return hay.indexOf(w.replace(/s$/, '')) !== -1; });
    });
  }

  function renderPredictive(data, q) {
    var dom = parse(data['capture:predictive-products-loafer.html']);
    var found = matches(data, q).slice(0, 6);
    var cards = dom.querySelectorAll('[data-rc-search-products-slot] > *, .rc-search-product, .predictive-search__item');
    var tplCard = null;
    dom.querySelectorAll('a[href*="/products/"]').forEach(function (a) { if (!tplCard) tplCard = a.closest('li, .rc-search-product, article, div'); });
    if (tplCard) {
      var parent = tplCard.parentNode;
      var siblings = Array.prototype.filter.call(parent.children, function (c) { return c.tagName === tplCard.tagName; });
      siblings.forEach(function (c) { c.remove(); });
      found.forEach(function (p) {
        var n = tplCard.cloneNode(true);
        n.querySelectorAll('a').forEach(function (a) { a.setAttribute('href', p.url); });
        n.querySelectorAll('img').forEach(function (img) {
          ['srcset', 'data-src', 'data-srcset', 'sizes'].forEach(function (k) { img.removeAttribute(k); });
          img.setAttribute('src', p.image); img.setAttribute('alt', p.title); img.classList.remove('lazyload');
        });
        var texts = n.querySelectorAll('h3, h4, h5, .title, [class*="title"]');
        if (texts.length) texts[0].textContent = p.title;
        var price = n.querySelector('[class*="price"]'); if (price) price.textContent = money(p.price);
        parent.appendChild(n);
      });
    }
    dom.querySelectorAll('a[href*="/search"]').forEach(function (a) { a.setAttribute('href', BASE + '/search/?q=' + encodeURIComponent(q)); });
    dom.querySelectorAll('strong').forEach(function (s) { if (/loafer/i.test(s.textContent)) s.textContent = '"' + q + '"'; });
    return dom.body.innerHTML;
  }

  function renderShell(data, q) {
    var html = data['capture:suggest-shell-loaf.html'] || '';
    return html.replace(/loaf/gi, function (m) { return q; });
  }

  /* ---------- fetch ---------- */
  function json(obj, status) { return new Response(JSON.stringify(obj), { status: status || 200, headers: { 'Content-Type': 'application/json' } }); }
  function text(s) { return new Response(s, { status: 200, headers: { 'Content-Type': 'text/html' } }); }

  async function bodyOf(init) {
    var b = init && init.body;
    if (!b) return {};
    if (b instanceof FormData) {
      var o = {}; b.forEach(function (v, k) { o[k] = v; });
      if (o['items[0][id]']) o = { items: [{ id: o['items[0][id]'], quantity: o['items[0][quantity]'] }] };
      return o;
    }
    if (typeof b === 'string') { try { return JSON.parse(b); } catch (e) { var p = new URLSearchParams(b), r = {}; p.forEach(function (v, k) { r[k] = v; }); return r; } }
    return {};
  }

  window.fetch = async function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    var u;
    try { u = new URL(url, location.href); } catch (e) { return realFetch(input, init); }
    if (u.origin !== location.origin) return realFetch(input, init);
    var path = u.pathname;
    if (BASE && path.indexOf(BASE + '/') === 0) path = path.slice(BASE.length);
    var method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();
    var section = u.searchParams.get('section_id') || u.searchParams.get('sections');
    if (/^\/cart\/add(\.js)?$/.test(path)) {
      var data = await dataPromise, b = await bodyOf(init);
      var list = b.items || [{ id: b.id, quantity: b.quantity }];
      var added = addItems(data, list);
      if (!added.length) return json({ status: 422, message: 'Demo store', description: 'This item is not part of the demo catalogue.' }, 422);
      return json(b.items ? { items: added } : added[0]);
    }
    if (/^\/cart\/(change|update)(\.js)?$/.test(path)) {
      var data2 = await dataPromise, b2 = await bodyOf(init);
      if (b2.updates) { var ls = load(); Object.keys(b2.updates).forEach(function (k) { var l = ls.find(function (x) { return x.id === String(k).split(':')[0]; }); if (l) l.qty = parseInt(b2.updates[k], 10); }); save(ls.filter(function (l) { return l.qty > 0; })); return json(cartJson(data2)); }
      return json(changeLine(data2, b2));
    }
    if (/^\/cart\/clear(\.js)?$/.test(path)) { save([]); return json(cartJson(await dataPromise)); }
    if (path === '/cart.js' || (path.replace(/\/$/, '') === '/cart' && /json/.test(((init && init.headers && (init.headers.Accept || init.headers.accept)) || '')))) return json(cartJson(await dataPromise));
    if (path.replace(/\/$/, '') === '/cart' && section) {
      var d3 = await dataPromise;
      if (/cart-drawer/.test(section)) return text(renderDrawer(d3));
      if (/cart-dropdown/.test(section)) return text(renderDropdown(d3));
      return text('');
    }
    if (path === '/search/suggest' || path === '/search/suggest.json') {
      var d4 = await dataPromise; return text(renderShell(d4, u.searchParams.get('q') || ''));
    }
    if (path.replace(/\/$/, '') === '/search' && section) {
      var d5 = await dataPromise; return text(renderPredictive(d5, u.searchParams.get('q') || ''));
    }
    if (/^\/recommendations\//.test(path)) return text('');
    if (/^\/products\/[^/]+\.js$/.test(path)) return realFetch(BASE + path.replace(/\.js$/, '.json'), init);
    if (BASE && u.pathname.indexOf(BASE + '/') !== 0 && /^\/(products|collections|pages|blogs)\//.test(path)) {
      return realFetch(BASE + path + u.search, init);
    }
    return realFetch(input, init);
  };

  /* ---------- page wiring ---------- */
  function notice(title, body) {
    var el = document.getElementById('rc-demo-notice');
    if (!el) {
      el = document.createElement('div'); el.id = 'rc-demo-notice'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
      el.innerHTML = '<div class="rc-demo-notice__card"><h3></h3><p></p><button type="button" class="btn">Continue browsing</button></div>';
      el.addEventListener('click', function (e) { if (e.target === el || e.target.tagName === 'BUTTON') el.classList.remove('is-open'); });
      document.body.appendChild(el);
    }
    el.querySelector('h3').textContent = title; el.querySelector('p').textContent = body;
    el.classList.add('is-open'); el.querySelector('button').focus();
  }
  window.RcDemoNotice = notice;

  document.addEventListener('click', function (e) {
    var t = e.target.closest('button[name="checkout"], a[href*="/checkout"], input[name="checkout"], .shopify-payment-button, shopify-accelerated-checkout, [data-shopify="payment-button"]');
    if (t) { e.preventDefault(); e.stopPropagation(); notice('Checkout is switched off', 'This is a portfolio copy of the storefront. Everything up to checkout works; payment is handled by Shopify on the live store.'); return; }
    var acc = e.target.closest('a[href$="/account"], a[href*="/account/"]');
    if (acc) { e.preventDefault(); notice('Customer accounts', 'Sign-in and order history run on Shopify customer accounts on the live store.'); }
  }, true);

  document.addEventListener('submit', function (e) {
    var f = e.target, action = f.getAttribute('action') || '';
    if (/\/cart\/add/.test(action)) return; // the theme's own handler takes it
    if (/\/cart$/.test(action) || f.id === 'cart_form') { e.preventDefault(); notice('Checkout is switched off', 'This is a portfolio copy of the storefront. Everything up to checkout works; payment is handled by Shopify on the live store.'); return; }
    if (/kmail-lists|klaviyo/.test(action)) { e.preventDefault(); notice('Thanks for signing up', 'In the live store this adds you to the Rancourt & Co. newsletter.'); f.reset(); return; }
    if (/\/contact/.test(action) || f.querySelector('[name="form_type"][value="customer"]') || f.querySelector('[name="contact[email]"]')) {
      e.preventDefault();
      var newsletter = !!f.querySelector('[name="contact[tags]"]') || /newsletter/i.test(f.className + f.id);
      notice(newsletter ? 'Thanks for signing up' : 'Thanks for your message', newsletter ? 'In the live store this adds you to the Rancourt & Co. newsletter.' : 'In the live store this message goes to the Rancourt & Co. team.');
      f.reset();
      return;
    }
    if (/\/search\/?$/.test(action)) {
      e.preventDefault();
      var q = (f.querySelector('[name="q"]') || {}).value || '';
      location.href = BASE + '/search/?q=' + encodeURIComponent(q);
    }
  }, true);

  document.addEventListener('DOMContentLoaded', function () {
    if (load().length) {
      var drawer = document.querySelector('cart-drawer');
      var go = function () { if (drawer && drawer.refresh) drawer.refresh(); };
      if (customElements.get('cart-drawer')) go(); else customElements.whenDefined('cart-drawer').then(go);
    }
    if (/\/search\/?$/.test(location.pathname)) renderSearchPage();
  });

  /* ---------- /search/?q= ---------- */
  async function renderSearchPage() {
    var q = new URLSearchParams(location.search).get('q');
    if (!q) return;
    var data = await dataPromise, found = matches(data, q);
    document.querySelectorAll('input[name="q"]').forEach(function (i) { i.value = q; });
    var res = await realFetch(BASE + '/search/loafer/index.html').then(function (r) { return r.text(); });
    var dom = parse(res);
    var card = null;
    dom.querySelectorAll('main a[href*="/products/"]').forEach(function (a) { if (!card) card = a.closest('.product-index, li, article'); });
    var grid = card && card.parentNode;
    var main = document.querySelector('main') || document.body;
    var newMain = dom.querySelector('main');
    if (!grid || !newMain) return;
    Array.prototype.slice.call(grid.children).forEach(function (c) { if (c.tagName === card.tagName) c.remove(); });
    found.forEach(function (p) {
      var n = card.cloneNode(true);
      n.querySelectorAll('a').forEach(function (a) { if (/\/products\//.test(a.getAttribute('href') || '')) a.setAttribute('href', p.url); });
      var imgs = n.querySelectorAll('img');
      imgs.forEach(function (img, i) {
        ['srcset', 'data-src', 'data-srcset', 'sizes', 'data-zoom', 'data-source'].forEach(function (k) { img.removeAttribute(k); });
        img.setAttribute('src', p.image); img.setAttribute('alt', p.title); img.classList.remove('lazyload');
        if (i > 0) img.remove();
      });
      var t = n.querySelector('.prod-title, [class*="title"]'); if (t) t.textContent = p.title;
      var pr = n.querySelector('.price, [class*="price"]'); if (pr) pr.textContent = money(p.price);
      grid.appendChild(n);
    });
    newMain.querySelectorAll('h1, h2').forEach(function (h) { h.innerHTML = h.innerHTML.replace(/loafer/gi, q.replace(/</g, '')); });
    newMain.querySelectorAll('*').forEach(function (el) {
      if (el.children.length === 0 && /\b\d+\s+results?\b/i.test(el.textContent)) el.textContent = el.textContent.replace(/\d+(\s+results?)/i, found.length + '$1');
    });
    main.replaceWith(newMain);
  }
})();
