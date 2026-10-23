/* DTS-X terminal shell. The original nodes and command protocol remain authoritative. */
(function () {
  'use strict';
  if (window.DTSModern) return;
  var document = window.document;
  var root = document.documentElement;
  var KEY = 'dtsx.terminal.v1';
  var MOVEMENT = 12;
  var state = { active: false, depth: 0, moves: [], panels: new Map(), z: 20, feeds: new Map(), busy: false };
  var settings = readSettings();
  var toolbar, workspace, dock, announcer, toggle, arrange, reset, viewport, oldViewport;
  var embedded = new URLSearchParams(window.location.search).get('dts-frame') === 'map';
  var descriptors = [
    ['status', '角色 / 现场', '01'], ['commands', '行动指令', '02'],
    ['equipment', '装备', '03'], ['backpack', '背包', '04'],
    ['log', '行动记录', '05'], ['chat', '聊天', '06'],
    ['news', '游戏状况', '07'], ['map', '地图', '08'], ['navigation', '导航', '09']
  ];

  function readSettings() {
    try {
      var value = JSON.parse(localStorage.getItem(KEY));
      if (value && value.version === 1 && typeof value.panels === 'object' && value.panels) {
        return { version: 1, modern: !!value.modern, compact: !!value.compact, panels: value.panels };
      }
    } catch (_) { /* Storage may be disabled. The interface still works. */ }
    return { version: 1, modern: false, compact: false, panels: {} };
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch (_) {} }
  function byId(id) { return document.getElementById(id); }
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }
  function button(text, title, handler, className) {
    var node = el('button', className || 'dts-tool', text);
    node.type = 'button'; node.title = title;
    node.addEventListener('click', handler);
    return node;
  }
  function say(message) {
    if (!announcer) return;
    announcer.textContent = '';
    window.setTimeout(function () { announcer.textContent = message; }, 20);
  }
  function compact() { return settings.compact || window.innerWidth < 780; }
  function isReplay() { return window.in_replay_mode === 1 || /\/replay\.php$/i.test(window.location.pathname); }
  function number(value, fallback) { return typeof value === 'number' && Number.isFinite(value) ? value : fallback; }
  function clamp(value, low, high) { return Math.max(low, Math.min(value, high)); }

  function defaultLayout(id) {
    // clientWidth excludes the browser scrollbar; innerWidth made the far column
    // overlap its neighbour on pages tall enough to scroll.
    var width = Math.max(320, state.active && workspace && workspace.clientWidth || root.clientWidth - (window.innerWidth <= 1000 ? 32 : 48));
    var large = width >= 1180;
    var left = large ? Math.min(744, width - 688) : Math.min(744, width - 350);
    var commandWidth = large ? 310 : 326;
    var rightX = left + 14;
    var farX = rightX + commandWidth + 14;
    var mapWidth = Math.max(320, width - farX);
    var map = {
      status: [0, 0, left, 320], commands: [rightX, 0, commandWidth, 484],
      equipment: [0, 334, Math.floor((left - 14) / 2), 240],
      backpack: [Math.floor((left + 14) / 2), 334, Math.floor((left - 14) / 2), 240],
      log: [rightX, 498, commandWidth, 322], chat: [0, 588, left, 232],
      news: large ? [farX, 416, mapWidth, 310] : [0, 890, Math.floor((width - 14) / 2), 290],
      map: large ? [farX, 0, mapWidth, 402] : [Math.floor((width + 14) / 2), 890, Math.floor((width - 14) / 2), 360],
      navigation: large ? [farX, 740, mapWidth, 108] : [rightX, 834, 326, 130]
    };
    var tuple = map[id] || [0, 0, 400, 300];
    return { x: Math.max(0, tuple[0]), y: tuple[1], w: Math.max(280, tuple[2]), h: tuple[3], minimized: false,
      order: descriptors.findIndex(function (entry) { return entry[0] === id; }) };
  }
  function layout(id) {
    var fallback = defaultLayout(id), value = settings.panels[id] || {};
    return {
      x: clamp(number(value.x, fallback.x), 0, 20000), y: clamp(number(value.y, fallback.y), 0, 20000),
      w: clamp(number(value.w, fallback.w), 280, 3000), h: clamp(number(value.h, fallback.h), 110, 2400),
      minimized: !!value.minimized, order: clamp(number(value.order, fallback.order), 0, 99)
    };
  }
  function storeLayout(panel) { settings.panels[panel.id] = Object.assign({}, panel.layout); save(); }

  function createPanel(descriptor) {
    var id = descriptor[0];
    var node = el('section', 'dts-panel');
    node.dataset.panel = id;
    node.setAttribute('aria-labelledby', 'dts-panel-title-' + id);
    var header = el('header', 'dts-panel-header');
    var handle = el('button', 'dts-panel-handle');
    handle.type = 'button';
    handle.title = '拖动以移动；方向键移动，Shift + 方向键调整大小；Enter 最小化';
    handle.setAttribute('aria-describedby', 'dts-layout-help');
    handle.append(el('span', 'dts-panel-index', descriptor[2]));
    var title = el('span', 'dts-panel-title', descriptor[1]); title.id = 'dts-panel-title-' + id;
    handle.append(title, el('span', 'dts-drag-mark', '⠿'));
    var minimize = button('−', '最小化' + descriptor[1], function () { setMinimized(panel, true); }, 'dts-panel-minimize');
    minimize.setAttribute('aria-label', '最小化' + descriptor[1]);
    header.append(handle, minimize);
    var body = el('div', 'dts-panel-body');
    var resize = button('◢', '拖动或用方向键调整大小', function () {}, 'dts-panel-resize');
    resize.setAttribute('aria-label', '调整' + descriptor[1] + '大小');
    node.append(header, body, resize);
    var dockButton = button(descriptor[1], '显示' + descriptor[1], function () {
      setMinimized(panel, false); raise(panel); node.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); handle.focus({ preventScroll: true });
    }, 'dts-dock-item');
    dockButton.dataset.panel = id;
    var panel = { id: id, node: node, body: body, handle: handle, dockButton: dockButton, layout: layout(id), available: false };
    workspace.append(node); dock.append(dockButton); state.panels.set(id, panel);
    handle.addEventListener('pointerdown', function (event) { startDrag(event, panel, false); });
    resize.addEventListener('pointerdown', function (event) { startDrag(event, panel, true); });
    handle.addEventListener('keydown', function (event) { keyboardLayout(event, panel, false); });
    resize.addEventListener('keydown', function (event) { keyboardLayout(event, panel, true); });
    handle.addEventListener('dblclick', function () { setMinimized(panel, true); });
    node.addEventListener('pointerdown', function () { raise(panel); });
    return panel;
  }

  function raise(panel) {
    if (++state.z > 800) {
      state.z = 20;
      state.panels.forEach(function (item) { item.node.style.zIndex = '20'; });
    }
    panel.node.style.zIndex = String(state.z);
  }
  function setMinimized(panel, value) {
    panel.layout.minimized = value; applyLayout(panel); resizeWorkspace(); storeLayout(panel);
    say(panel.handle.textContent.replace('⠿', '') + (value ? '已最小化，可从底栏恢复' : '已恢复'));
    if (value) panel.dockButton.focus({ preventScroll: true });
  }
  function applyLayout(panel) {
    var p = panel.layout;
    panel.node.hidden = !panel.available || p.minimized;
    panel.dockButton.hidden = !panel.available;
    panel.dockButton.classList.toggle('is-minimized', p.minimized);
    panel.dockButton.setAttribute('aria-pressed', String(!p.minimized));
    panel.node.style.left = p.x + 'px'; panel.node.style.top = p.y + 'px';
    panel.node.style.width = p.w + 'px'; panel.node.style.height = p.h + 'px';
    panel.node.style.order = p.order;
    if (panel.id === 'status') panel.node.style.setProperty('--dts-profile-scale', compact() ? '1' : String(clamp((p.w - 22) / 720, .8, 1)));
  }
  function resizeWorkspace() {
    if (!workspace) return;
    root.classList.toggle('dts-compact', compact());
    arrange.textContent = settings.compact ? '自由布局' : '紧凑排列';
    var maxY = Math.max(window.innerHeight - 156, 480);
    state.panels.forEach(function (panel) {
      if (panel.available && !panel.layout.minimized) maxY = Math.max(maxY, panel.layout.y + panel.layout.h + 30);
    });
    workspace.style.height = compact() ? 'auto' : maxY + 'px';
  }
  function constrain(panel) {
    if (compact()) return; // A narrow screen must not overwrite the saved desktop geometry.
    var width = workspace.clientWidth || window.innerWidth - 32;
    panel.layout.w = Math.min(panel.layout.w, Math.max(280, width));
    panel.layout.x = clamp(panel.layout.x, 0, Math.max(0, width - panel.layout.w));
    panel.layout.y = Math.max(0, panel.layout.y);
  }
  function reorder(panel, delta) {
    var ordered = Array.from(state.panels.values()).sort(function (a, b) { return a.layout.order - b.layout.order; });
    var index = ordered.indexOf(panel), next = clamp(index + delta, 0, ordered.length - 1);
    ordered.splice(index, 1); ordered.splice(next, 0, panel);
    ordered.forEach(function (item, i) { item.layout.order = i; settings.panels[item.id] = Object.assign({}, item.layout); applyLayout(item); });
    save();
  }
  function keyboardLayout(event, panel, resizing) {
    if (event.key === 'Enter' && !resizing) { event.preventDefault(); event.stopPropagation(); setMinimized(panel, true); return; }
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation();
    if (compact()) { reorder(panel, event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 1); return; }
    var dx = event.key === 'ArrowLeft' ? -MOVEMENT : event.key === 'ArrowRight' ? MOVEMENT : 0;
    var dy = event.key === 'ArrowUp' ? -MOVEMENT : event.key === 'ArrowDown' ? MOVEMENT : 0;
    if (resizing || event.shiftKey) {
      panel.layout.w = clamp(panel.layout.w + dx, 280, 3000); panel.layout.h = clamp(panel.layout.h + dy, 110, 2400);
    } else { panel.layout.x += dx; panel.layout.y += dy; }
    constrain(panel); applyLayout(panel); resizeWorkspace(); storeLayout(panel);
  }
  function startDrag(event, panel, resizing) {
    if (event.button !== 0 || (compact() && resizing)) return;
    event.preventDefault(); raise(panel);
    var target = event.currentTarget, start = Object.assign({}, panel.layout);
    var startX = event.clientX, startY = event.clientY, scrollY = window.scrollY;
    var wasCompact = compact();
    target.setPointerCapture(event.pointerId);
    panel.node.classList.add('is-dragging'); root.classList.add('dts-drag-active');
    function move(e) {
      if (e.pointerId !== event.pointerId) return;
      var dx = e.clientX - startX, dy = e.clientY - startY + window.scrollY - scrollY;
      if (wasCompact) {
        panel.node.style.transform = 'translateY(' + dy + 'px)';
      } else {
        if (resizing) {
          panel.layout.w = clamp(start.w + dx, 280, 3000); panel.layout.h = clamp(start.h + dy, 110, 2400);
        } else { panel.layout.x = start.x + dx; panel.layout.y = Math.max(0, start.y + dy); }
        constrain(panel); applyLayout(panel); resizeWorkspace();
      }
      if (e.clientY > window.innerHeight - 44) window.scrollBy(0, 14);
      else if (e.clientY < 80) window.scrollBy(0, -14);
    }
    function end(e) {
      if (e.pointerId !== event.pointerId) return;
      target.removeEventListener('pointermove', move); target.removeEventListener('pointerup', end);
      target.removeEventListener('pointercancel', end);
      if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
      if (e.type === 'pointercancel') panel.layout = start;
      else if (wasCompact) {
        var ordered = Array.from(state.panels.values()).filter(function (item) { return item.available && !item.layout.minimized; })
          .sort(function (a, b) { return a.layout.order - b.layout.order; });
        var current = ordered.indexOf(panel), destination = current;
        ordered.forEach(function (item, index) {
          if (item === panel) return;
          var rect = item.node.getBoundingClientRect();
          if (e.clientY > rect.top + rect.height / 2 && index > current) destination = index;
          if (e.clientY < rect.top + rect.height / 2 && index < current && destination === current) destination = index;
        });
        reorder(panel, destination - current);
      }
      panel.node.style.transform = ''; panel.node.classList.remove('is-dragging'); root.classList.remove('dts-drag-active');
      applyLayout(panel); resizeWorkspace(); storeLayout(panel);
    }
    target.addEventListener('pointermove', move); target.addEventListener('pointerup', end); target.addEventListener('pointercancel', end);
  }

  // Comment anchors do not affect firstElementChild/nextElementSibling, the legacy replay format.
  function moveNode(node, panelId) {
    if (!node || !node.parentNode) return;
    var panel = state.panels.get(panelId);
    var anchor = document.createComment('dts-original:' + panelId);
    node.parentNode.insertBefore(anchor, node);
    state.moves.push({ node: node, anchor: anchor });
    panel.body.append(node); panel.available = true;
  }
  function restoreNodes() {
    for (var i = state.moves.length - 1; i >= 0; i--) {
      var record = state.moves[i];
      if (record.anchor.parentNode) {
        record.anchor.parentNode.insertBefore(record.node, record.anchor);
        record.anchor.remove();
      }
    }
    state.moves = [];
  }
  function legacyDOMPath(node) {
    var path = [], game = byId('game_interface');
    while (node && node !== game && node !== document) {
      // A moved root occupies its comment anchor's position in the original
      // tree. Other anchors still count as their original element siblings.
      // Walking this virtual tree keeps native select popups and focus intact.
      var moved = state.moves.find(function (record) { return record.node === node; });
      var position = moved ? moved.anchor : node, parent = position.parentNode;
      if (!parent) return null;
      var index = 0;
      for (var sibling = parent.firstChild; sibling && sibling !== position; sibling = sibling.nextSibling) {
        if (sibling.nodeType === 1 || state.moves.some(function (record) { return record.anchor === sibling; })) index++;
      }
      path.unshift(index); node = parent;
    }
    return node === game && game ? path.join('.') + '.' : null;
  }
  function rememberFocus() {
    var focused = document.activeElement;
    var selection;
    try { selection = [focused.selectionStart, focused.selectionEnd, focused.selectionDirection]; } catch (_) {}
    return function () {
      if (focused && focused.isConnected && document.activeElement !== focused) {
        focused.focus({ preventScroll: true });
        if (selection && typeof selection[0] === 'number') {
          try { focused.setSelectionRange.apply(focused, selection); } catch (_) {}
        }
      }
    };
  }
  function mountNodes() {
    if (!state.active || !byId('game_interface')) return;
    state.panels.forEach(function (panel) { panel.available = panel.id === 'map' && !isReplay(); });
    moveNode(byId('main'), 'status');
    var packs = byId('packs');
    if (packs && packs.rows[0] && packs.rows[0].cells.length >= 2) {
      moveNode(packs.rows[0].cells[0].firstElementChild, 'equipment');
      moveNode(packs.rows[0].cells[1].firstElementChild, 'backpack');
      state.panels.get('status').node.classList.add('has-split-packs');
    } else { state.panels.get('status').node.classList.remove('has-split-packs'); }
    // Template 2 is retained as a complete status panel: its short/full equipment controls are coupled.
    moveNode(byId('cmd_interface'), 'commands');
    moveNode(byId('notice'), 'log'); moveNode(byId('log'), 'log');
    moveNode(byId('chat'), 'chat'); moveNode(byId('newslist'), 'news');
    moveNode(byId('chat_floating_banner'), 'chat');
    moveNode(document.querySelector('.headerlink'), 'navigation');
    state.panels.forEach(function (panel) { constrain(panel); applyLayout(panel); });
    resizeWorkspace();
  }
  function withLegacy(callback, context, args) {
    if (!state.active || state.depth) return callback.apply(context, args || []);
    var restoreFocus = rememberFocus();
    state.depth++;
    restoreNodes();
    try { return callback.apply(context, args || []); }
    finally { state.depth--; mountNodes(); restoreFocus(); }
  }

  function wrap(name, handler) {
    var original = window[name];
    if (typeof original !== 'function' || original.dtsModernWrapped) return;
    var wrapped = function () { return handler(original, this, Array.prototype.slice.call(arguments)); };
    wrapped.dtsModernWrapped = true; wrapped.dtsModernOriginal = original;
    window[name] = wrapped;
  }
  function installHooks() {
    ['showData', 'postCmd'].forEach(function (name) {
      wrap(name, function (original, context, args) { return withLegacy(original, context, args); });
    });
    wrap('replay_record_DOM_path', function (original, context, args) {
      if (!state.active || state.depth) return original.apply(context, args);
      var sender = args[0];
      if (!sender || !/^(INPUT|SELECT|OPTION)$/.test(sender.tagName)) return;
      if (sender === window.last_sender) return;
      window.last_sender = sender;
      var path = legacyDOMPath(sender), recorder = byId('oprecorder');
      if (path !== null && recorder) recorder.value += path + ',' + (sender.tagName === 'OPTION' ? 'e,' : '');
    });
    wrap('hotkey', function (original, context, args) {
      var target = document.activeElement;
      if (state.active && target && (target.isContentEditable || /^(TEXTAREA|SELECT)$/.test(target.tagName) || target.closest('[data-dts-controls], .dts-panel-header, .dts-panel-resize'))) return;
      return original.apply(context, args);
    });
    wrap('chat', function (original, context, args) {
      var result = original.apply(context, args);
      if (state.active && byId('game_interface')) fetchCompanionFeed(args[0] === 'news' ? 'chat' : 'news');
      return result;
    });
    wrap('replay_stimulate_click', function (original, context, args) {
      if (!state.active) return original.apply(context, args);
      var path = args[0];
      if (!path || !path.length || (path.length === 1 && path[0] === 'e')) return;
      var target = withLegacy(function () {
        var node = byId('game_interface');
        for (var i = 0; node && i < path.length; i++) node = node.children[Number(path[i])];
        return node;
      });
      if (!target) return;
      // Resolve against the original tree, then perform the upstream click behavior at its visible position.
      if (target.tagName === 'SELECT') {
        var rect = target.getBoundingClientRect();
        target.style.position = 'fixed'; target.style.zIndex = '9000';
        target.style.left = rect.left + 'px'; target.style.top = rect.top + 'px'; target.size = Math.min(target.length, 10);
      } else if (target.tagName === 'OPTION') {
        if (target.parentNode.tagName === 'SELECT') {
          target.parentNode.style.position = ''; target.style.left = ''; target.style.top = '';
          target.parentNode.style.zIndex = '0'; target.parentNode.size = 1;
        }
        target.selected = true;
      } else target.click();
    });
  }

  function feedIdentity() {
    return ['cgamenum', 'croomid', 'obsv_flag'].map(function (id) { return byId(id) ? byId(id).value : ''; }).join('|');
  }
  function abortFeeds() { state.feeds.forEach(function (controller) { controller.abort(); }); state.feeds.clear(); }
  async function fetchCompanionFeed(kind) {
    if (!state.active || isReplay() || window.refchat_ok === false || state.feeds.has(kind)) return;
    var form = byId('sendchat');
    if (!form || typeof window.showChatdata !== 'function') return;
    var body = new URLSearchParams(new FormData(form));
    body.set('sendmode', kind === 'news' ? 'news' : 'ref');
    // A companion request is read-only even if started by the send button.
    body.set('chatmsg', '');
    var identity = feedIdentity(), controller = new AbortController();
    state.feeds.set(kind, controller);
    var timeout = window.setTimeout(function () { controller.abort(); }, 12000);
    try {
      var response = await fetch(new URL(kind === 'news' ? 'news.php' : 'chat.php', window.location.href), {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(), signal: controller.signal
      });
      if (!response.ok) return;
      var text = await response.text();
      if (!state.active || identity !== feedIdentity()) return;
      // The regular poll may have overtaken this request; never rewind its cursor.
      var data = JSON.parse(decodeURIComponent(escape(window.JXG.decompress(text))));
      var cursor = kind === 'news' ? 'lastnid' : 'lastcid';
      if (data && data[cursor] != null && byId(cursor) && Number(data[cursor]) < Number(byId(cursor).value)) return;
      window.showChatdata(text);
    } catch (error) {
      if (error.name !== 'AbortError' && window.console) console.debug('[DTS terminal] Feed refresh deferred.', error.message);
    } finally {
      window.clearTimeout(timeout);
      if (state.feeds.get(kind) === controller) state.feeds.delete(kind);
    }
  }

  function makeMap() {
    var panel = state.panels.get('map');
    var tools = el('div', 'dts-map-tools');
    var frame = el('iframe', 'dts-map-frame');
    // The workspace starts hidden. Eager loading avoids browsers leaving a lazy
    // iframe blank when its parent is moved from hidden to absolute positioning.
    frame.title = '游戏地图'; frame.loading = 'eager'; frame.referrerPolicy = 'same-origin';
    var mapURL = new URL('map.php', window.location.href); mapURL.searchParams.set('dts-frame', 'map');
    tools.append(el('span', '', '红 · 禁区  /  黄 · 预告  /  绿 · 通行'));
    tools.append(button('刷新', '刷新地图与禁区', function () { frame.src = mapURL.href; }));
    var full = el('a', '', '展开地图 ↗'); full.href = new URL('map.php', window.location.href).href; full.target = '_blank'; full.rel = 'noopener';
    tools.append(full); panel.body.append(tools, frame); panel.frame = frame; panel.mapURL = mapURL.href;
  }
  function setMode(enabled, persist) {
    if (embedded || state.active === enabled) return;
    var restoreFocus = rememberFocus();
    state.active = enabled;
    if (enabled) {
      installHooks(); root.classList.add('dts-modern');
      root.classList.toggle('dts-game', !!byId('game_interface'));
      if (viewport) viewport.setAttribute('content', 'width=device-width, initial-scale=1');
      mountNodes();
      if (byId('game_interface') && !isReplay()) {
        var map = state.panels.get('map'); if (!map.frame.src) map.frame.src = map.mapURL;
        fetchCompanionFeed(byId('sendmode') && byId('sendmode').value === 'news' ? 'chat' : 'news');
      }
    } else {
      abortFeeds(); restoreNodes(); root.classList.remove('dts-modern', 'dts-game', 'dts-compact', 'dts-drag-active');
      if (viewport) { if (oldViewport == null) viewport.removeAttribute('content'); else viewport.setAttribute('content', oldViewport); }
    }
    toggle.textContent = enabled ? '经典界面' : '电波终端';
    toggle.setAttribute('aria-pressed', String(enabled));
    workspace.hidden = dock.hidden = !(enabled && byId('game_interface'));
    arrange.hidden = reset.hidden = !byId('game_interface');
    if (persist !== false) { settings.modern = enabled; save(); }
    restoreFocus();
  }
  function resetLayout() {
    settings.panels = {}; settings.compact = false;
    state.panels.forEach(function (panel) { panel.layout = defaultLayout(panel.id); constrain(panel); applyLayout(panel); });
    resizeWorkspace(); save(); say('所有窗口已归位');
  }
  function boot() {
    viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) { viewport = el('meta'); viewport.name = 'viewport'; document.head.append(viewport); }
    oldViewport = viewport.getAttribute('content');
    if (embedded) {
      root.dataset.dtsEmbed = 'map'; viewport.setAttribute('content', 'width=device-width, initial-scale=1');
      // The legacy header leaves a page wrapper open. Its last body div contains
      // the map as well as the footer, so identify the footer by its own content.
      var copyright = byId('copyright');
      if (copyright && copyright.parentElement && copyright.parentElement.parentElement) {
        copyright.parentElement.parentElement.dataset.dtsMapFooter = '';
      }
      return;
    }
    toolbar = el('div', 'dts-toolbar'); toolbar.id = 'dts-toolbar'; toolbar.dataset.dtsControls = '';
    var brand = el('div', 'dts-brand');
    brand.append(el('span', 'dts-brand-symbol', '↯'), el('strong', '', 'DTS'), el('span', 'dts-brand-label', '电波终端'));
    var meta = el('span', 'dts-terminal-note', 'DTS / FIELD TERMINAL');
    var controls = el('div', 'dts-toolbar-controls');
    arrange = button('紧凑排列', '切换自由布局与紧凑排列', function () {
      settings.compact = !settings.compact; resizeWorkspace(); save();
    });
    reset = button('窗口归位', '重置窗口位置、尺寸与最小化状态', resetLayout);
    toggle = button('电波终端', '切换经典界面与可自由排列的电波终端', function () { setMode(!state.active); }, 'dts-mode-toggle');
    toggle.id = 'dts-mode-toggle'; toggle.setAttribute('aria-pressed', 'false');
    controls.append(arrange, reset, toggle); toolbar.append(brand, meta, controls);
    workspace = el('main', 'dts-workspace'); workspace.id = 'dts-workspace'; workspace.hidden = true;
    dock = el('nav', 'dts-dock'); dock.setAttribute('aria-label', '游戏窗口，点击显示或恢复'); dock.dataset.dtsControls = ''; dock.hidden = true;
    var help = el('p', 'dts-sr-only', '拖动标题栏移动窗口。标题栏获得焦点后，用方向键移动，Shift 加方向键调整大小。紧凑排列中方向键改变顺序。Enter 最小化，底栏恢复。');
    help.id = 'dts-layout-help';
    announcer = el('div', 'dts-sr-only'); announcer.setAttribute('role', 'status'); announcer.setAttribute('aria-live', 'polite');
    document.body.append(toolbar, dock, help, announcer);
    var gameRoot = byId('game_interface');
    if (gameRoot) gameRoot.parentNode.insertBefore(workspace, gameRoot);
    else document.body.append(workspace);
    descriptors.forEach(createPanel); makeMap(); installHooks();
    // Prevent UI controls from reaching legacy body.onkeyup, including its letter shortcuts.
    toolbar.addEventListener('keyup', function (event) { event.stopPropagation(); });
    dock.addEventListener('keyup', function (event) { event.stopPropagation(); });
    workspace.addEventListener('keyup', function (event) {
      if (event.target.closest('.dts-panel-header, .dts-panel-resize')) event.stopPropagation();
    });
    window.addEventListener('resize', function () {
      if (!state.active) return;
      state.panels.forEach(function (panel) { constrain(panel); applyLayout(panel); }); resizeWorkspace();
    });
    window.addEventListener('storage', function (event) {
      if (event.key !== KEY) return;
      settings = readSettings(); setMode(settings.modern, false);
    });
    document.addEventListener('dts:render', function () { installHooks(); withLegacy(function () {}); });
    arrange.hidden = reset.hidden = !byId('game_interface');
    if (settings.modern) setMode(true, false);
  }
  window.DTSModern = {
    version: 1,
    setMode: function (mode) { setMode(mode === true || mode === 'modern'); },
    refresh: function () { installHooks(); withLegacy(function () {}); },
    resetLayout: resetLayout,
    withLegacyDOM: function (callback) { return withLegacy(callback); },
    getState: function () {
      return { modern: state.active, compact: compact(), moves: state.moves.length,
        panels: Array.from(state.panels.values()).map(function (panel) { return { id: panel.id, available: panel.available, layout: Object.assign({}, panel.layout) }; }) };
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
