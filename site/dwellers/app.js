const game = document.querySelector('#game');
const announcements = document.querySelector('#announcements');
const categories = ['legs', 'frame', 'hand', 'antenna', 'detail', 'sensor'];
const categoryNames = {
  legs: 'Feet', frame: 'Bodies', hand: 'Arms', antenna: 'Antennae',
  detail: 'Instruments', sensor: 'Eyes'
};
const iconPaths = {
  workshop: '<path d="m5 5 14 14M19 5 5 19M4 3l3 1 1 3-2 2-3-1-1-3Zm14 12 3 1 1 3-2 2-3-1-1-3Z"/>',
  feed: '<path d="m4 5 14-2 2 15-14 2Z"/><path d="M7 9h10v7H7zM8 15l3-3 2 2 2-3 2 4"/><path d="M2 8v14h15"/>',
  nearby: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 12 19 5M12 2v2M22 12h-2"/>',
  legs: '<path d="M7 3v8l-3 5v4h7M17 3v8l3 5v4h-7"/><circle cx="7" cy="11" r="2"/><circle cx="17" cy="11" r="2"/>',
  frame: '<rect x="5" y="5" width="14" height="16" rx="5"/><path d="M9 2h6"/>',
  hand: '<path d="m5 20 5-6-2-4 3-7 2 5 4 1 4-3-1 7-7 3-5 6Z"/>',
  antenna: '<path d="M12 20V4M7 20h10M7 6 4 10l3 4M17 6l3 4-3 4"/><circle cx="12" cy="3" r="1"/>',
  detail: '<path d="M3 18a9 9 0 1 1 18 0ZM12 13l4-5M7 17h10"/><circle cx="12" cy="14" r="1"/>',
  sensor: '<circle cx="6.5" cy="12" r="5"/><circle cx="17.5" cy="12" r="5"/><circle cx="6.5" cy="12" r="1"/><circle cx="17.5" cy="12" r="1"/>',
  power: '<path d="M12 2v10M7 5a9 9 0 1 0 10 0"/>',
  rocket: '<path d="M9 15C6 9 10 3 15 2c3 6 1 11-4 14ZM8 11l-5 5h5M15 13l2 5-5-1M8 18l-3 3"/><circle cx="12" cy="8" r="1.5"/>',
  pin: '<path d="M18 9c0 5-6 11-6 11S6 14 6 9a6 6 0 1 1 12 0Z"/><circle cx="12" cy="8" r="2"/>',
  camera: '<rect x="2" y="6" width="20" height="15" rx="3"/><path d="m7 6 2-3h6l2 3"/><circle cx="12" cy="13" r="4"/>',
  check: '<path d="m5 12 5 5L20 5"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  back: '<path d="m14 5-7 7 7 7"/>',
  undo: '<path d="m8 3-5 5 5 5M3 8h11a7 7 0 0 1 0 14"/>',
  publish: '<rect x="3" y="4" width="16" height="16" rx="1"/><path d="m5 16 4-4 3 3 3-6 3 7M17 2h5v5M22 2l-7 7"/>',
  locate: '<circle cx="12" cy="12" r="5"/><path d="M12 2v5M22 12h-5M12 22v-5M2 12h5"/>'
};

function icon(name) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.workshop}</svg>`;
}

function roundControl(action, symbol, label, extra = '') {
  return `<button class="round-control ${extra}" data-action="${action}" aria-label="${label}" title="${label}">${icon(symbol)}</button>`;
}

function navigation(active) {
  return `<nav class="game-nav" aria-label="Demo navigation">
    <button data-view="workshop" class="${active === 'workshop' ? 'active' : ''}" aria-label="Workshop" ${active === 'workshop' ? 'aria-current="page"' : ''}><img src="assets/theme/nav-workshop-v2.webp" alt=""></button>
    <button data-view="feed" class="${active === 'feed' ? 'active' : ''}" aria-label="Photo feed" ${active === 'feed' ? 'aria-current="page"' : ''}><span class="feed-nav-icon">${icon('feed')}</span></button>
    <button data-view="nearby" class="${active === 'nearby' ? 'active' : ''}" aria-label="Nearby Dwellers" ${active === 'nearby' ? 'aria-current="page"' : ''}><img src="assets/theme/nav-nearby-v2.webp" alt=""></button>
  </nav>`;
}

let geometry = {};
let view = 'workshop';
let currentId = 'amber';
let draft;
let initialDraft;
let activeCategory = 'legs';
let selectedSocket = 'right-middle';
let newCreation = false;
let progress = 5;
let powered = false;
let zoom = 1;
let huntPosition = { x: 0, y: 0 };
let sheetState = 'middle';
let mapZoom = 1;
let toastTimer;
let returnFocus;
const names = ['Moss Whistle', 'Clover Cog', 'Poppy Bell', 'Juniper Brass', 'Thistle Tinker', 'Cinnamon Spring'];
let nameIndex = 0;

const creatures = [
  { id: 'amber', name: 'Amber Valve', frame: 6, legs: 5, sensor: 1, antenna: 5, detail: 1, arms: { 'left-middle': 3, 'right-middle': 3 }, finish: 'brass', released: false, x: 43, y: 45, distance: 32, captured: false },
  { id: 'saffron', name: 'Saffron Bell', frame: 12, legs: 9, sensor: 16, antenna: 4, detail: 2, arms: { 'left-middle': 11, 'right-upper': 13 }, finish: 'brass', released: true, x: 61, y: 27, distance: 74, captured: false },
  { id: 'moss', name: 'Moss & Brass', frame: 3, legs: 1, sensor: 4, antenna: 1, detail: 8, arms: { 'left-middle': 1, 'right-middle': 2 }, finish: 'sage', released: true, x: 23, y: 66, distance: 486, captured: false },
  { id: 'pip', name: 'Pip', frame: 9, legs: 10, sensor: 5, antenna: 12, detail: 9, arms: { 'left-middle': 8, 'right-middle': 4 }, finish: 'brass', released: false, x: 75, y: 66, distance: 534, captured: false }
];
let photos = [
  { id: 'sample-1', creature: structuredClone(creatures[1]), likes: 0, liked: false, sample: true, scene: 0 },
  { id: 'sample-2', creature: structuredClone(creatures[2]), likes: 0, liked: false, sample: true, scene: 1 }
];

function announce(message) {
  announcements.textContent = message;
}

function toast(message) {
  game.querySelector('.game-toast')?.remove();
  clearTimeout(toastTimer);
  const element = document.createElement('div');
  element.className = 'game-toast';
  element.textContent = message;
  game.append(element);
  announce(message);
  toastTimer = setTimeout(() => element.remove(), 3000);
}

function file(category, variant) {
  return `${category}${String(variant).padStart(2, '0')}`;
}

function partMetric(category, variant) {
  return geometry[file(category, variant)] || { aspect: 1, mountX: .5, mountY: .5 };
}

function posesFor(creature) {
  const pose = (category, variant, width, height, x, y, rotation = 0, mirrored = false) => {
    const metric = partMetric(category, variant);
    const aspect = metric.aspect * (metric.shapeScaleX || 1);
    const scale = Math.min(width / aspect, height);
    return { category, variant, x, y, width: scale * aspect, height: scale, rotation, mirrored };
  };
  const mounted = (category, variant, width, height, x, y, rotation = 0, mirrored = false) => {
    const part = pose(category, variant, width, height, 0, 0, rotation, mirrored);
    const root = partMetric(category, variant);
    const localX = (root.mountX - .5) * part.width;
    const localY = (root.mountY - .5) * part.height;
    const radians = rotation * Math.PI / 180;
    const offsetX = localX * Math.cos(radians) - localY * Math.sin(radians);
    const offsetY = localX * Math.sin(radians) + localY * Math.cos(radians);
    part.x = x - (mirrored ? -offsetX : offsetX);
    part.y = y - offsetY;
    part.mount = { x, y };
    return part;
  };
  const metric = partMetric('frame', creature.frame);
  const body = pose('frame', creature.frame, 180, 144, 160, 208);
  const top = body.y - body.height / 2;
  const bottom = body.y + body.height / 2;
  const baseMetric = partMetric('legs', creature.legs);
  const baseHeight = baseMetric.baseHeight || Math.min(80, 381 - bottom + 7);
  const baseWidth = baseMetric.baseHeight ? Math.min(205, body.width * 1.2) : body.width * .94;
  const footY = top + body.height * (metric.footY ?? 1) - 7;
  const legs = mounted('legs', creature.legs, baseWidth, baseHeight, 160, footY);
  const floorOffset = 381 - (legs.y + legs.height / 2);
  const antenna = mounted('antenna', creature.antenna, body.width * .43, Math.min(78, top - 16), 160, top + body.height * .06);
  const eyeY = metric.eyeY ?? .32;
  const detailY = metric.detailY ?? .73;
  const eyes = pose('sensor', creature.sensor, body.width * .57, body.height * Math.max(.22, Math.min(.37, (detailY - eyeY) * 2 - .41)), 160, top + body.height * eyeY);
  const panelTop = eyes.y + eyes.height / 2 + body.height * .026;
  const panelBottom = bottom - body.height * .045;
  const panelHeight = Math.min(body.height * .45, panelBottom - panelTop);
  const panelY = Math.min(panelBottom - panelHeight / 2, Math.max(panelTop + panelHeight / 2, top + body.height * detailY));
  const detail = pose('detail', creature.detail, body.width * .73 * Math.max(.88, metric.detailScale || 1), panelHeight, 160, panelY);
  const sockets = {};
  const arms = [];
  for (const side of ['left', 'right']) {
    for (const [index, level] of ['upper', 'middle', 'lower'].entries()) {
      const slot = `${side}-${level}`;
      const edge = metric[side === 'left' ? 'armLeft' : 'armRight']?.[index] ?? (side === 'left' ? .02 : .98);
      const x = body.x - body.width / 2 + body.width * edge + (side === 'left' ? 4 : -4);
      const y = top + body.height * [.24, .5, .76][index];
      sockets[slot] = { x, y: y + floorOffset };
      if (!creature.arms[slot]) continue;
      const variant = creature.arms[slot];
      const hand = partMetric('hand', variant);
      const nativeHeading = Math.atan2((hand.reachY - hand.mountY) / hand.aspect, hand.reachX - hand.mountX) * 180 / Math.PI;
      const heading = [-55, 0, 55][index];
      const rotation = Number.isFinite(nativeHeading) ? heading - nativeHeading : 0;
      const arm = mounted('hand', variant, 65, 65, x, y, rotation, side === 'left');
      arm.slot = slot;
      arms.push(arm);
    }
  }
  for (const part of [legs, body, antenna, eyes, detail, ...arms]) part.y += floorOffset;
  return { legs, body, antenna, eyes, detail, arms, sockets };
}

function partImage(part, className = '') {
  return `<g class="${className}"><g transform="translate(${part.x} ${part.y}) scale(${part.mirrored ? -1 : 1} 1) rotate(${part.rotation})"><image href="assets/parts/${file(part.category, part.variant)}.webp" x="${-part.width / 2}" y="${-part.height / 2}" width="${part.width}" height="${part.height}"/></g></g>`;
}

function creatureSVG(creature, options = {}) {
  const layout = posesFor(creature);
  const pieces = [layout.body, layout.antenna, layout.legs];
  const minY = Math.min(...pieces.map(part => part.y - part.height / 2)) - 8;
  const showing = options.builder && newCreation ? new Set(categories.slice(0, progress + 1).filter(category => draft.chosen.includes(category))) : new Set(categories);
  const on = options.builder ? powered : true;
  const armMarkup = showing.has('hand') ? layout.arms.map(arm => {
    const interactive = options.builder ? `data-draggable="${arm.slot}" tabindex="0" role="button" aria-label="Move ${arm.slot.replace('-', ' ')} arm. Delete key removes it."` : '';
    return `<g ${interactive} class="robot-arm">${partImage(arm)}</g>`;
  }).join('') : '';
  const slots = options.builder && activeCategory === 'hand' ? Object.entries(layout.sockets).map(([slot, position]) => `<circle class="socket ${slot === selectedSocket ? 'active' : ''}" data-socket="${slot}" role="button" tabindex="0" aria-label="${slot.replace('-', ' ')} arm socket" cx="${position.x}" cy="${position.y}" r="4.5"/>`).join('') : '';
  const filter = creature.finish === 'sage' ? 'url(#sage-paint)' : creature.finish === 'copper' ? 'url(#copper-paint)' : '';
  return `<svg class="dweller-svg ${on ? 'powered' : ''} ${options.builder ? 'builder-character' : ''}" viewBox="0 ${minY} 320 ${389 - minY}" xmlns="http://www.w3.org/2000/svg" role="${options.builder ? 'group' : 'img'}" aria-label="${creature.name}" preserveAspectRatio="xMidYMax meet">
    <ellipse class="dweller-shadow" cx="160" cy="382" rx="${layout.legs.width * .4}" ry="3"/>
    <g ${filter ? `filter="${filter}"` : ''}>
      ${showing.has('legs') ? partImage(layout.legs, 'robot-base') : ''}
    </g>
    <g class="${on ? 'robot-chassis' : ''}">
      <g ${filter ? `filter="${filter}"` : ''}>
        ${armMarkup}${showing.has('frame') ? partImage(layout.body) : ''}
        ${showing.has('antenna') ? partImage(layout.antenna, 'robot-antenna') : ''}
        ${showing.has('detail') ? partImage(layout.detail) : ''}
      </g>
      ${showing.has('sensor') ? partImage(layout.eyes, 'robot-eyes') : ''}
    </g>
    ${slots}
  </svg>`;
}

function render() {
  const rendering = {
    workshop: renderWorkshop, builder: renderBuilder, nearby: renderNearby,
    hunt: renderHunt, preview: renderPreview, feed: renderFeed
  };
  game.innerHTML = rendering[view]();
  document.querySelector('#demo-caption').textContent = {
    workshop: 'Interactive application prototype',
    builder: 'Change the parts. Fit the eyes. Switch it on.',
    nearby: 'Meet a nearby Dweller. Tap to find it.',
    hunt: 'Drag to compose. Pinch or use + to get closer.',
    preview: 'Photo preview',
    feed: 'Dweller feed'
  }[view];
}

function renderWorkshop() {
  const slots = [...creatures.map(creature => ({ creature })), { create: true }];
  if (slots.length % 2) slots.push({ closed: true });
  let rows = '';
  for (let index = 0; index < slots.length; index += 2) {
    rows += '<div class="cabinet-row">';
    for (const slot of slots.slice(index, index + 2)) {
      if (slot.closed) rows += '<div class="cabinet-slot closed" aria-label="Closed cabinet door"></div>';
      else if (slot.create) rows += '<div class="cabinet-slot"><button class="create-slot" data-action="new" aria-label="Create a new Dweller">+</button></div>';
      else {
        const creature = slot.creature;
        rows += `<div class="cabinet-slot"><button class="creature-button" data-edit="${creature.id}" aria-label="Edit ${creature.name}">${creatureSVG(creature)}</button><span class="cabinet-name">${creature.name}</span><button class="release-mini" data-release="${creature.id}" aria-label="${creature.released ? 'Find' : 'Release'} ${creature.name}" title="${creature.released ? 'Go to place' : 'Release'}">${icon(creature.released ? 'pin' : 'rocket')}</button></div>`;
      }
    }
    rows += '</div>';
  }
  return `<div class="game-view game-workshop">${navigation('workshop')}<div class="cabinet-scroll">${rows}</div><div class="cabinet-shadow"></div><div class="cabinet-base"></div></div>`;
}

function beginBuilder(id) {
  const creature = creatures.find(item => item.id === id);
  newCreation = !creature;
  draft = creature ? structuredClone(creature) : {
    id: `creation-${Date.now()}`, name: names[nameIndex++ % names.length],
    frame: 6, legs: 1, sensor: 1, antenna: 5, detail: 1,
    arms: {}, finish: 'brass', released: false, distance: 40,
    x: 40, y: 43, captured: false, chosen: []
  };
  initialDraft = structuredClone(draft);
  activeCategory = 'legs';
  selectedSocket = 'right-middle';
  progress = creature ? 5 : 0;
  powered = false;
  view = 'builder';
  render();
}

function renderBuilder() {
  const options = Object.keys(geometry).filter(key => key.startsWith(activeCategory));
  const activeVariant = activeCategory === 'hand' ? draft.arms[selectedSocket] : draft[activeCategory];
  const ready = !newCreation || draft.chosen.includes('sensor');
  return `<div class="game-view builder-view">
    <div class="builder-top">
      <div class="builder-tools">${roundControl('close-builder', 'close', 'Close builder')}${roundControl('reset', 'undo', 'Reset this edit')}${roundControl('save', 'check', 'Save Dweller')}</div>
      ${newCreation && !ready ? `<span class="builder-helper">${activeCategory === 'hand' ? 'Choose a socket, then an arm' : `Choose ${categoryNames[activeCategory].toLowerCase()}`}</span>` : ''}
      <div class="builder-stage">${creatureSVG(draft, { builder: true })}</div>
      <span class="builder-name">${draft.name}</span>
      <button class="round-control ignite" data-action="power" aria-label="${powered ? 'Switch off' : 'Bring to life'}" title="${ready ? 'Bring to life' : 'Fit the eyes to bring it alive'}" ${ready ? '' : 'disabled'}>${icon('power')}</button>
    </div>
    <div class="builder-drawer">
      <div class="category-tabs" role="tablist" aria-label="Part categories">${categories.map((category, index) => `<button role="tab" aria-selected="${category === activeCategory}" aria-controls="parts-tray" data-category="${category}" aria-label="${categoryNames[category]}" title="${categoryNames[category]}" class="${category === activeCategory ? 'active' : ''}" ${index > progress ? 'disabled' : ''}>${icon(category)}</button>`).join('')}</div>
      <div class="parts-tray" id="parts-tray" role="tabpanel" aria-label="${categoryNames[activeCategory]}">${options.map(key => {
        const variant = Number(key.replace(activeCategory, ''));
        return `<button data-part="${variant}" ${activeCategory === 'hand' ? 'data-hand-part="true"' : ''} class="${activeVariant === variant ? 'selected' : ''}" aria-label="${categoryNames[activeCategory]} option ${variant}" aria-pressed="${activeVariant === variant}"><img src="assets/parts/${key}.webp" alt="" draggable="false" loading="lazy"></button>`;
      }).join('')}</div>
      <div class="drawer-bottom" aria-label="Metal finish">${['brass', 'copper', 'sage'].map(finish => `<button class="finish-swatch ${draft.finish === finish ? 'active' : ''}" data-finish="${finish}" aria-label="${finish} finish" aria-pressed="${draft.finish === finish}"></button>`).join('')}</div>
    </div>
  </div>`;
}

function choosePart(variant) {
  powered = false;
  if (activeCategory === 'hand') draft.arms[selectedSocket] = variant;
  else draft[activeCategory] = variant;
  if (newCreation && !draft.chosen.includes(activeCategory)) draft.chosen.push(activeCategory);
  const chosenIndex = categories.indexOf(activeCategory);
  progress = Math.max(progress, chosenIndex === 1 ? 3 : Math.min(5, chosenIndex + 1));
  const scroll = game.querySelector('.parts-tray').scrollTop;
  render();
  game.querySelector('.parts-tray').scrollTop = scroll;
  if (newCreation && chosenIndex < 5) toast(chosenIndex === 1 ? 'Arms & antennae unlocked' : `${categoryNames[categories[chosenIndex + 1]]} unlocked`);
}

function saveDraft() {
  const ready = !newCreation || draft.chosen.includes('sensor');
  if (!ready) {
    toast('Fit the remaining parts and eyes first');
    return;
  }
  const index = creatures.findIndex(item => item.id === draft.id);
  if (index >= 0) creatures[index] = structuredClone(draft);
  else creatures.unshift(structuredClone(draft));
  currentId = draft.id;
  view = 'workshop';
  render();
  toast(`${draft.name} is in the cabinet`);
}

function mapArt() {
  return `<svg class="map-art" viewBox="0 0 320 430" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="320" height="430" fill="#d8cf9e"/>
    <path d="M83-10 45 440M244-10l34 450M-20 105l360-28M-20 326l360-8" stroke="#b5ad85" stroke-width="15"/>
    <path d="M83-10 45 440M244-10l34 450M-20 105l360-28M-20 326l360-8" stroke="#ece0b1" stroke-width="10"/>
    <path d="M91 118 234 104 249 304 74 312Z" fill="#afbe81"/>
    <path d="M159 116c65 48-52 76 4 126s-42 58-31 65M82 212l159-42" fill="none" stroke="#dfd5a2" stroke-width="5"/>
    <path d="m106 137 44-3 3 34-44 3Z" fill="#c9c795"/>
    <path d="m112 145 31-2 1 17-30 2Z" fill="none" stroke="#e6dcb0" stroke-width="2"/>
    <g fill="#c4bb8d"><path d="m5 25 47 3-4 22-44-3ZM6 62h43l-2 22H4ZM97 13h44v48H93ZM155 13h57l3 44h-64ZM268 9h46v49h-43ZM267 114l46-4v38l-43 3ZM274 167h40v60h-37ZM282 248h31v48h-28ZM7 132h40l-5 49H5ZM8 201h30l-3 43H6ZM5 259h32l-4 42H4ZM76 352h50v59H71ZM144 349h56l3 62h-61ZM218 348h39l7 63h-45Z"/></g>
    <g fill="#87a169" opacity=".6"><circle cx="95" cy="195" r="6"/><circle cx="215" cy="140" r="7"/><circle cx="226" cy="260" r="6"/><circle cx="101" cy="281" r="8"/><circle cx="196" cy="287" r="6"/><circle cx="118" cy="214" r="5"/></g>
    <g font-family="Georgia, serif" font-size="9" fill="#6b7751" letter-spacing="1"><text x="130" y="191">DOLORES PARK</text><text x="108" y="92" transform="rotate(-4 108 92)">18TH STREET</text><text x="99" y="330">19TH STREET</text></g>
  </svg>`;
}

function renderNearby() {
  const released = creatures.filter(creature => creature.released);
  const ordered = [...released].sort((a, b) => a.distance - b.distance);
  return `<div class="game-view">${navigation('nearby')}
    <div class="game-map"><div class="map-world" style="transform:scale(${mapZoom})">${mapArt()}<span class="map-radius"></span><span class="map-player" aria-label="Your demo location">▲</span>
      ${released.map(creature => `<button class="map-pin ${creature.distance <= 150 ? 'reachable' : ''} ${creature.captured ? 'dormant' : ''}" style="left:${creature.x}%;top:${creature.y}%" data-find="${creature.id}" aria-label="${creature.name}, ${creature.distance} feet${creature.captured ? ', photographed today' : ''}">${creatureSVG(creature)}</button>`).join('')}
    </div><span class="demo-tag">DEMO MAP</span><div class="map-controls">${roundControl('recenter', 'locate', 'Recenter demo map')}<button class="round-control" data-action="map-in" aria-label="Zoom map in">+</button><button class="round-control" data-action="map-out" aria-label="Zoom map out">−</button></div></div>
    <div class="nearby-sheet ${sheetState === 'middle' ? '' : sheetState}"><button class="sheet-handle" data-action="sheet" aria-label="Change nearby drawer height. Drag up or down."><span></span></button><div class="nearby-list">${ordered.map(creature => `<button class="nearby-row" data-find="${creature.id}"><span class="row-creature">${creatureSVG(creature)}</span><span class="row-name">${creature.name}</span><span class="row-distance">${creature.distance} ft</span><span class="row-state ${creature.captured ? 'asleep' : ''}">${creature.captured ? 'Tomorrow' : creature.distance <= 150 ? 'Find' : 'Explore'}</span></button>`).join('')}</div></div>
  </div>`;
}

function outdoorArt(scene = 0) {
  const sky = scene ? '#c6c5ad' : '#bcc6ad';
  return `<svg class="outdoor-art" viewBox="0 0 320 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="320" height="320" fill="${sky}"/><circle cx="249" cy="58" r="35" fill="#f3d997" opacity=".75"/>
    <path d="M0 154q70-38 145-8t175-17v191H0Z" fill="#87976c"/><path d="M0 197q74-36 144-14t176-5v142H0Z" fill="#6d825a"/>
    <path d="M145 181q-3 47-102 139h243q-113-81-141-139" fill="#cbb98a"/>
    <g fill="#4e6c4d"><path d="M30 0h13l-1 183-11 23Z"/><path d="M26 84 1 45l4-5 32 30 18-55 6 4-19 68Z"/><ellipse cx="19" cy="25" rx="48" ry="45"/><ellipse cx="75" cy="17" rx="46" ry="35"/><ellipse cx="307" cy="32" rx="62" ry="61"/><path d="m289 61 9 1 11 153-10 2Z"/></g>
    <g stroke="#516447" stroke-width="1.5" opacity=".6"><path d="M0 225h108M204 225h116M0 238h91M223 238h97"/><path d="m10 206 5-11m8 12 2-8m275 17 4-11m-14 9-1-7"/></g>
    <path d="M0 297h320M0 311h320" stroke="#bcab7d" stroke-width="1" opacity=".6"/>
    <rect width="320" height="320" fill="url(#scene-grain)" opacity=".12"/>
  </svg>`;
}

function findCreature(id) {
  currentId = id;
  const creature = creatures.find(item => item.id === id);
  if (creature.captured) {
    view = 'feed';
    render();
    const photo = photos.find(item => item.creature.id === id);
    if (photo) game.querySelector(`[data-photo="${photo.id}"]`)?.scrollIntoView({ block: 'nearest' });
    toast('Photographed today · ready again tomorrow');
    return;
  }
  if (creature.distance > 150) {
    showDialog({
      title: `${creature.distance} feet away`, message: 'For this demo, take a short walk to meet this Dweller.',
      creature, confirm: 'Take a walk', action: () => {
        creature.distance = 50;
        creature.x = 57;
        creature.y = 45;
        startHunt();
      }
    });
    return;
  }
  startHunt();
}

function startHunt() {
  zoom = 1;
  huntPosition = { x: 0, y: 0 };
  view = 'hunt';
  render();
}

function huntScene(creature, scene = 0) {
  return `<div class="hunt-viewport">${outdoorArt(scene)}<div class="hunt-creature" style="transform:translate(${huntPosition.x}px,${huntPosition.y}px) scale(${zoom})">${creatureSVG(creature)}</div></div>`;
}

function renderHunt() {
  const creature = creatures.find(item => item.id === currentId);
  return `<div class="hunt-screen"><div class="hunt-header">${roundControl('back-map', 'back', 'Back to nearby map')}<span>${creature.name}</span><span class="demo-disclosure">DEMO</span></div>${huntScene(creature)}<div class="hunt-footer"><span class="zoom-value">${zoom.toFixed(1)}×</span><div class="camera-controls"><button class="round-control zoom" data-action="zoom-out" aria-label="Zoom out">−</button><button class="shutter" data-action="capture" aria-label="Take a demo photo">${icon('camera')}</button><button class="round-control zoom" data-action="zoom-in" aria-label="Zoom in">+</button></div><span class="hunt-note">Drag to compose · pinch to zoom</span></div></div>`;
}

function renderPreview() {
  const creature = creatures.find(item => item.id === currentId);
  return `<div class="hunt-screen"><div class="hunt-header">${roundControl('retake', 'back', 'Retake photo')}<span class="preview-title">Your encounter</span><span></span></div><div class="shot-frame">${huntScene(creature)}<p>${creature.name}</p></div><div class="hunt-footer"><div class="preview-actions">${roundControl('retake', 'undo', 'Retake photo')}${roundControl('ask-publish', 'publish', 'Publish photo', 'publish-control')}</div><span class="hunt-note">Share this encounter in the demo feed</span></div></div>`;
}

function renderFeed() {
  return `<div class="game-view">${navigation('feed')}<div class="feed-scroll">${photos.map(photo => `<article class="feed-card" data-photo="${photo.id}"><div class="feed-photo">${outdoorArt(photo.scene)}<div class="feed-creature" ${photo.zoom ? `style="transform:translate(${photo.position.x}px,${photo.position.y}px) scale(${photo.zoom})"` : ''}>${creatureSVG(photo.creature)}</div></div><div class="feed-card-foot"><div><h4>${photo.creature.name}</h4><p class="feed-byline">${photo.sample ? 'Sample encounter · Dolores Park' : 'Your encounter · just now'}</p></div><button class="like ${photo.liked ? 'liked' : ''}" data-like="${photo.id}" aria-label="${photo.liked ? 'Unlike' : 'Like'} ${photo.creature.name} photo" aria-pressed="${photo.liked}">${photo.liked ? '♥' : '♡'}</button></div></article>`).join('')}</div></div>`;
}

function showDialog({ title, message, creature, confirm, action }) {
  returnFocus = document.activeElement;
  const dialog = document.createElement('div');
  dialog.className = 'game-dialog';
  dialog.innerHTML = `<div class="dialog-box" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div class="dialog-creature">${creatureSVG(creature)}</div><h3 id="dialog-title">${title}</h3><p>${message}</p><div class="dialog-actions"><button class="cancel" data-dialog-cancel>Cancel</button><button data-dialog-confirm>${confirm}</button></div></div>`;
  game.append(dialog);
  const close = () => {
    dialog.remove();
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  };
  dialog.querySelector('[data-dialog-cancel]').onclick = close;
  dialog.querySelector('[data-dialog-confirm]').onclick = () => { close(); action(); };
  dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Escape') close();
    if (event.key === 'Tab') {
      event.preventDefault();
      const buttons = dialog.querySelectorAll('button');
      const index = document.activeElement === buttons[0] ? 1 : 0;
      buttons[index].focus();
    }
  });
  dialog.querySelector('button').focus({ preventScroll: true });
}

function releaseCreature(id) {
  const creature = creatures.find(item => item.id === id);
  if (creature.released) {
    view = 'nearby';
    render();
    return;
  }
  showDialog({
    title: 'Let this one explore?', message: `${creature.name} will appear on the demo map.`,
    creature, confirm: 'Release', action: () => {
      creature.released = true;
      const nearbyIndex = creatures.filter(item => item.released && item.distance < 150).length;
      creature.x = 37 + (nearbyIndex % 3) * 13;
      creature.y = 47 - Math.floor(nearbyIndex / 3) * 10;
      creature.distance = 30 + nearbyIndex * 18;
      view = 'nearby';
      render();
      toast(`${creature.name} is out exploring`);
    }
  });
}

const actions = {
  new: () => beginBuilder(),
  'close-builder': () => { view = 'workshop'; render(); },
  reset: () => { draft = structuredClone(initialDraft); progress = newCreation ? 0 : 5; activeCategory = 'legs'; powered = false; render(); },
  save: saveDraft,
  power: () => { powered = !powered; render(); if (powered) toast(`${draft.name} is alive`); },
  recenter: () => { mapZoom = 1; render(); },
  'map-in': () => { mapZoom = Math.min(2, mapZoom + .25); render(); },
  'map-out': () => { mapZoom = Math.max(.75, mapZoom - .25); render(); },
  sheet: () => { sheetState = sheetState === 'middle' ? 'expanded' : sheetState === 'expanded' ? 'collapsed' : 'middle'; render(); },
  'back-map': () => { view = 'nearby'; render(); },
  'zoom-in': () => changeZoom(.2),
  'zoom-out': () => changeZoom(-.2),
  capture: () => { view = 'preview'; render(); game.classList.add('preview-flash'); setTimeout(() => game.classList.remove('preview-flash'), 500); },
  retake: () => { view = 'hunt'; render(); },
  'ask-publish': () => {
    const creature = creatures.find(item => item.id === currentId);
    showDialog({ title: 'Share this encounter?', message: 'Add your photo to the demo feed.', creature, confirm: 'Publish', action: () => {
      photos.unshift({ id: `photo-${Date.now()}`, creature: structuredClone(creature), likes: 0, liked: false, scene: 0, zoom, position: { ...huntPosition } });
      creature.captured = true;
      view = 'feed';
      render();
      toast('Published · this Dweller is ready again tomorrow');
    } });
  }
};

function changeZoom(amount) {
  zoom = Math.max(.7, Math.min(2.5, zoom + amount));
  updateHuntTransform();
}

function updateHuntTransform() {
  const target = game.querySelector('.hunt-creature');
  if (target) target.style.transform = `translate(${huntPosition.x}px,${huntPosition.y}px) scale(${zoom})`;
  const label = game.querySelector('.zoom-value');
  if (label) label.textContent = `${zoom.toFixed(1)}×`;
}

let suppressClickUntil = 0;
game.addEventListener('click', event => {
  if (Date.now() < suppressClickUntil || event.target.closest('.game-dialog')) return;
  const button = event.target.closest('button, [data-socket]');
  if (!button || button.disabled) return;
  if (button.dataset.view) { view = button.dataset.view; render(); }
  else if (button.dataset.edit) beginBuilder(button.dataset.edit);
  else if (button.dataset.release) releaseCreature(button.dataset.release);
  else if (button.dataset.find) findCreature(button.dataset.find);
  else if (button.dataset.category) {
    activeCategory = button.dataset.category;
    powered = false;
    render();
  } else if (button.dataset.socket) { selectedSocket = button.dataset.socket; powered = false; render(); }
  else if (button.dataset.part) choosePart(Number(button.dataset.part));
  else if (button.dataset.finish) { draft.finish = button.dataset.finish; powered = false; render(); }
  else if (button.dataset.like) {
    const photo = photos.find(item => item.id === button.dataset.like);
    photo.liked = !photo.liked;
    const scroll = game.querySelector('.feed-scroll').scrollTop;
    render();
    game.querySelector('.feed-scroll').scrollTop = scroll;
  } else if (button.dataset.action) actions[button.dataset.action]?.();
});

game.addEventListener('keydown', event => {
  const socket = event.target.closest('[data-socket]');
  if (socket && ['Enter', ' '].includes(event.key)) {
    event.preventDefault();
    selectedSocket = socket.dataset.socket;
    render();
  }
  const arm = event.target.closest('[data-draggable]');
  if (arm && ['Delete', 'Backspace'].includes(event.key)) {
    event.preventDefault();
    delete draft.arms[arm.dataset.draggable];
    powered = false;
    render();
    announce('Arm removed');
  }
});

let drag;
let ghost;
let sheetDrag;
const huntPointers = new Map();
let pinchDistance;

game.addEventListener('pointerdown', event => {
  if (event.target.closest('.game-dialog')) return;
  const handle = event.target.closest('.sheet-handle');
  if (handle) {
    sheetDrag = { y: event.clientY, pointerId: event.pointerId };
    handle.setPointerCapture(event.pointerId);
    return;
  }
  if (view === 'hunt' && event.target.closest('.hunt-viewport')) {
    event.preventDefault();
    event.target.setPointerCapture(event.pointerId);
    huntPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    pinchDistance = huntPointers.size === 2 ? pointerDistance() : undefined;
    return;
  }
  if (view !== 'builder' || activeCategory !== 'hand') return;
  const arm = event.target.closest('[data-draggable]');
  const part = event.target.closest('[data-hand-part]');
  if (!arm && !part) return;
  if (arm) event.preventDefault();
  const slot = arm?.dataset.draggable;
  drag = {
    x: event.clientX, y: event.clientY, slot,
    variant: slot ? draft.arms[slot] : Number(part.dataset.part),
    pointerId: event.pointerId, active: false, element: arm || part
  };
  if (arm) arm.setPointerCapture(event.pointerId);
});

function pointerDistance() {
  const [a, b] = [...huntPointers.values()];
  return Math.hypot(a.x - b.x, a.y - b.y);
}

window.addEventListener('pointermove', event => {
  if (huntPointers.has(event.pointerId)) {
    const previous = huntPointers.get(event.pointerId);
    huntPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (huntPointers.size === 2) {
      const distance = pointerDistance();
      if (pinchDistance) zoom = Math.max(.7, Math.min(2.5, zoom * distance / pinchDistance));
      pinchDistance = distance;
    } else {
      huntPosition.x = Math.max(-100, Math.min(100, huntPosition.x + event.clientX - previous.x));
      huntPosition.y = Math.max(-75, Math.min(45, huntPosition.y + event.clientY - previous.y));
    }
    updateHuntTransform();
  }
  if (!drag || drag.pointerId !== event.pointerId) return;
  if (!drag.active && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 10) {
    drag.active = true;
    powered = false;
    game.querySelector('.builder-character')?.classList.remove('powered');
    drag.element.classList.add('dragging');
    ghost = document.createElement('img');
    ghost.src = `assets/parts/${file('hand', drag.variant)}.webp`;
    ghost.alt = '';
    Object.assign(ghost.style, { position: 'fixed', width: '65px', height: '65px', objectFit: 'contain', pointerEvents: 'none', zIndex: '100', opacity: '.85' });
    document.body.append(ghost);
  }
  if (ghost) {
    ghost.style.left = `${event.clientX - 32}px`;
    ghost.style.top = `${event.clientY - 32}px`;
  }
});

function finishPointer(event, cancelled = false) {
  huntPointers.delete(event.pointerId);
  pinchDistance = undefined;
  if (sheetDrag?.pointerId === event.pointerId) {
    const difference = event.clientY - sheetDrag.y;
    if (!cancelled && Math.abs(difference) > 18) {
      const states = ['collapsed', 'middle', 'expanded'];
      const index = states.indexOf(sheetState);
      sheetState = states[Math.max(0, Math.min(2, index + (difference < 0 ? 1 : -1)))];
      suppressClickUntil = Date.now() + 400;
      render();
    }
    sheetDrag = undefined;
  }
  if (!drag || drag.pointerId !== event.pointerId) return;
  if (drag.active && !cancelled) {
    suppressClickUntil = Date.now() + 400;
    const svg = game.querySelector('.builder-character');
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(svg.getScreenCTM().inverse());
    const sockets = Object.entries(posesFor(draft).sockets);
    const sorted = sockets.sort((a, b) => Math.hypot(point.x - a[1].x, point.y - a[1].y) - Math.hypot(point.x - b[1].x, point.y - b[1].y));
    const [target, position] = sorted[0];
    const nearby = Math.hypot(point.x - position.x, point.y - position.y) < 46;
    if (nearby) {
      if (drag.slot && drag.slot !== target) {
        const occupied = draft.arms[target];
        delete draft.arms[drag.slot];
        if (occupied) draft.arms[drag.slot] = occupied;
      }
      draft.arms[target] = drag.variant;
      selectedSocket = target;
      if (newCreation && !draft.chosen.includes('hand')) draft.chosen.push('hand');
      progress = Math.max(progress, 3);
    } else if (drag.slot) delete draft.arms[drag.slot];
  }
  const shouldRender = drag.active;
  drag.element.classList.remove('dragging');
  ghost?.remove();
  ghost = undefined;
  drag = undefined;
  if (shouldRender) render();
}

window.addEventListener('pointerup', event => finishPointer(event));
window.addEventListener('pointercancel', event => finishPointer(event, true));

function goToDemo(target) {
  if (target === 'builder') beginBuilder(creatures[0].id);
  else { view = target; render(); }
  document.querySelector('#play').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelectorAll('[data-demo]').forEach(button => button.addEventListener('click', () => goToDemo(button.dataset.demo)));
document.querySelector('#enter-workshop').addEventListener('click', () => { if (Object.keys(geometry).length) goToDemo('builder'); });
document.querySelector('#try-builder').addEventListener('click', () => goToDemo('builder'));
document.querySelector('#expand-demo').addEventListener('click', async () => {
  const target = document.querySelector('#play');
  if (document.fullscreenElement) await document.exitFullscreen();
  else if (target.requestFullscreen) {
    try { await target.requestFullscreen(); } catch { target.scrollIntoView({ block: 'center' }); }
  } else target.scrollIntoView({ block: 'center' });
});

document.body.insertAdjacentHTML('beforeend', `<svg width="0" height="0" aria-hidden="true" style="position:absolute;pointer-events:none"><defs>
  <filter id="sage-paint" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".6 .18 .02 0 0 .12 .78 .06 0 0 .04 .2 .4 0 0 0 0 0 1 0"/></filter>
  <filter id="copper-paint" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1.1 .05 0 0 0 0 .82 0 0 0 0 0 .65 0 0 0 0 0 1 0"/></filter>
  <pattern id="scene-grain" width="120" height="120" patternUnits="userSpaceOnUse"><image href="assets/theme/parchment.webp" width="120" height="120"/></pattern>
</defs></svg>`);

document.querySelector('#parts-collection').innerHTML = [
  ['antenna', 7], ['frame', 3], ['hand', 11],
  ['sensor', 1], ['frame', 9], ['antenna', 13],
  ['legs', 9], ['detail', 1], ['hand', 3]
].map(([category, variant]) => `<img src="assets/parts/${file(category, variant)}.webp" alt="${categoryNames[category]} from the Dwellers part collection" loading="lazy">`).join('');

geometry = dwellerPartGeometry;
render();
