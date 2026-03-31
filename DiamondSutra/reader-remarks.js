/**
 * Load desc_2 / desc_3 / desc_4 and attach matched blocks to reader.html D* sections.
 * Match by D number (贊述、疏論纂要); 論釋 by parent Q section number.
 */
(function () {
  'use strict';

  var SOURCES = [
    { url: 'desc_2.html', key: 'zanshu', label: '【贊述】' },
    { url: 'desc_3.html', key: 'shuolun', label: '【疏論纂要】' },
    { url: 'desc_4.html', key: 'lunshi', label: '【論釋】', byQ: true },
  ];

  function parseDNumbers(className) {
    if (!className) return [];
    var out = [];
    var parts = String(className).trim().split(/\s+/);
    for (var i = 0; i < parts.length; i++) {
      var m = /^D(\d+)$/.exec(parts[i]);
      if (m) out.push(parseInt(m[1], 10));
    }
    return out;
  }

  function parseQNumbers(className) {
    if (!className) return [];
    var matches = String(className).match(/\bQ(\d+)\b/g);
    if (!matches) return [];
    var out = [];
    for (var i = 0; i < matches.length; i++) {
      out.push(parseInt(matches[i].slice(1), 10));
    }
    return out;
  }

  /** Map D number -> array of HTML strings (document order), merged from divs whose class lists that D. */
  function buildDIndex(doc) {
    var buckets = {};
    var divs = doc.querySelectorAll('div');
    for (var i = 0; i < divs.length; i++) {
      var el = divs[i];
      var nums = parseDNumbers(el.className);
      if (!nums.length) continue;
      var html = el.innerHTML;
      for (var j = 0; j < nums.length; j++) {
        var n = nums[j];
        if (!buckets[n]) buckets[n] = [];
        buckets[n].push(html);
      }
    }
    var map = {};
    for (var k in buckets) {
      if (Object.prototype.hasOwnProperty.call(buckets, k)) {
        map[k] = buckets[k].join('<hr class="reader-note-part-sep"/>');
      }
    }
    return map;
  }

  function buildQIndex(doc) {
    var buckets = {};
    var divs = doc.querySelectorAll('div');
    for (var i = 0; i < divs.length; i++) {
      var el = divs[i];
      var nums = parseQNumbers(el.className);
      if (!nums.length) continue;
      var html = el.innerHTML;
      for (var j = 0; j < nums.length; j++) {
        var n = nums[j];
        if (!buckets[n]) buckets[n] = [];
        buckets[n].push(html);
      }
    }
    var map = {};
    for (var k in buckets) {
      if (Object.prototype.hasOwnProperty.call(buckets, k)) {
        map[k] = buckets[k].join('<hr class="reader-note-part-sep"/>');
      }
    }
    return map;
  }

  function parentQNumber(el) {
    var p = el.parentElement;
    while (p && p !== document.body) {
      var m = (p.className && String(p.className).match(/\bQ(\d+)\b/));
      if (m) return parseInt(m[1], 10);
      p = p.parentElement;
    }
    return null;
  }

  function collectReaderDBlocks() {
    var all = document.querySelectorAll('body div');
    var out = [];
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      var nums = parseDNumbers(el.className);
      if (nums.length === 1) out.push(el);
    }
    return out;
  }

  function makeNoteSection(label, html, uid, kind) {
    if (!html || !String(html).trim()) return null;
    var wrap = document.createElement('div');
    wrap.className = 'reader-source-note';
    wrap.setAttribute('data-reader-note', '');
    if (kind) wrap.setAttribute('data-reader-note-kind', kind);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'reader-note-toggle';
    btn.setAttribute('aria-expanded', 'false');
    var panelId = 'reader-note-panel-' + uid;
    btn.setAttribute('aria-controls', panelId);
    btn.textContent = label;

    var panel = document.createElement('div');
    panel.id = panelId;
    panel.className =
      'reader-note-panel' +
      (kind ? ' reader-note-panel--' + kind : '');
    panel.setAttribute('hidden', '');
    panel.innerHTML = html;
    if (typeof window.wrapDescBrackets === 'function' &&
        (label === '【贊述】' || label === '【疏論纂要】')) {
      window.wrapDescBrackets(panel);
    }

    btn.addEventListener('click', function () {
      var open = !wrap.classList.contains('reader-note-open');
      wrap.classList.toggle('reader-note-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) panel.removeAttribute('hidden');
      else panel.setAttribute('hidden', '');
    });

    wrap.appendChild(btn);
    wrap.appendChild(panel);
    return wrap;
  }

  function initWithMaps(maps) {
    var dZanshu = maps.zanshu || {};
    var dShuolun = maps.shuolun || {};
    var qLunshi = maps.lunshi || {};

    var blocks = collectReaderDBlocks();
    var uid = 0;
    var attached = 0;
    for (var b = 0; b < blocks.length; b++) {
      var block = blocks[b];
      var dn = parseDNumbers(block.className);
      if (dn.length !== 1) continue;
      var dNum = dn[0];

      var container = document.createElement('div');
      container.className = 'reader-extra-notes';

      var qn = parentQNumber(block);
      var sections = [];

      var z = makeNoteSection('【贊述】', dZanshu[dNum], ++uid, 'zanshu');
      if (z) sections.push(z);

      var s = makeNoteSection(
        '【疏論纂要】',
        dShuolun[dNum],
        ++uid,
        'shuolun'
      );
      if (s) sections.push(s);

      if (qn != null) {
        var l = makeNoteSection('【論釋】', qLunshi[qn], ++uid, 'lunshi');
        if (l) sections.push(l);
      }

      if (!sections.length) continue;

      for (var t = 0; t < sections.length; t++) {
        container.appendChild(sections[t]);
      }
      block.appendChild(container);
      attached++;
    }

    if (attached) {
      document.body.classList.add('reader-cross-remarks');
      installReaderRefMasterToggle();
    }
  }

  function closeAllReaderRefPanels() {
    var open = document.querySelectorAll(
      '.reader-source-note.reader-note-open'
    );
    for (var i = 0; i < open.length; i++) {
      var wrap = open[i];
      wrap.classList.remove('reader-note-open');
      var btn = wrap.querySelector('.reader-note-toggle');
      var panel = wrap.querySelector('.reader-note-panel');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (panel) panel.setAttribute('hidden', '');
    }
  }

  function installReaderRefMasterToggle() {
    if (document.getElementById('reader-ref-toggles-master')) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'reader-ref-toggles-master';
    btn.className =
      'sutra-outline-toolbar-btn reader-ref-toggles-master-btn';
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute(
      'title',
      '隱藏或顯示各段下方的【贊述】、【疏論纂要】、【論釋】按鈕'
    );

    function labelFor(hidden) {
      return hidden ? '顯示參考按鈕' : '隱藏參考按鈕';
    }

    function apply(hidden) {
      document.body.classList.toggle(
        'reader-hide-ref-note-toggles',
        hidden
      );
      btn.setAttribute('aria-pressed', hidden ? 'true' : 'false');
      btn.textContent = labelFor(hidden);
      if (hidden) closeAllReaderRefPanels();
    }

    btn.addEventListener('click', function () {
      apply(!document.body.classList.contains('reader-hide-ref-note-toggles'));
    });

    apply(false);

    var toolbar = document.querySelector('.sutra-outline-toolbar');
    if (toolbar) {
      var sep = document.createElement('span');
      sep.className = 'reader-ref-toolbar-sep';
      sep.setAttribute('aria-hidden', 'true');
      sep.textContent = '\u00a0|\u00a0';
      toolbar.appendChild(sep);
      toolbar.appendChild(btn);
    } else {
      var bar = document.createElement('div');
      bar.className = 'reader-ref-master-toolbar-fallback';
      bar.setAttribute('role', 'toolbar');
      bar.setAttribute('aria-label', '參考文按鈕');
      bar.appendChild(btn);
      document.body.insertBefore(bar, document.body.firstChild);
    }
  }

  /**
   * Parse raw HTML (fragment or full page) into a document for indexing.
   * Bare fragments often get an empty body from DOMParser unless wrapped.
   */
  function documentFromHtmlString(text) {
    var t = String(text || '').trim();
    if (!t) return null;
    var lower = t.slice(0, 200).toLowerCase();
    var wrapped =
      lower.indexOf('<!doctype') >= 0 || lower.indexOf('<html') >= 0
        ? t
        : '<!DOCTYPE html><meta charset="UTF-8"><body>' + t + '</body>';
    var doc = new DOMParser().parseFromString(wrapped, 'text/html');
    if (doc.body && doc.body.querySelector('parsererror')) return null;
    return doc;
  }

  /** file:// pages: fetch() usually fails; load sibling HTML via a hidden iframe (same folder = same origin). */
  function loadDocumentViaIframe(url) {
    return new Promise(function (resolve) {
      var done = false;
      function finish(doc) {
        if (done) return;
        done = true;
        resolve(doc);
      }
      var fr = document.createElement('iframe');
      fr.style.cssText =
        'position:absolute;left:-9999px;top:0;width:1px;height:1px;border:0;opacity:0;pointer-events:none';
      var to = setTimeout(function () {
        try {
          document.body.removeChild(fr);
        } catch (e) {}
        finish(null);
      }, 60000);
      fr.onload = function () {
        clearTimeout(to);
        try {
          var d = fr.contentDocument || (fr.contentWindow && fr.contentWindow.document);
          document.body.removeChild(fr);
          finish(d || null);
        } catch (err) {
          try {
            document.body.removeChild(fr);
          } catch (e2) {}
          finish(null);
        }
      };
      fr.onerror = function () {
        clearTimeout(to);
        try {
          document.body.removeChild(fr);
        } catch (e) {}
        finish(null);
      };
      fr.src = url;
      document.body.appendChild(fr);
    });
  }

  /** Inline copy of desc_2/3/4 (reader-embedded-desc.js), avoids fetch on file:// */
  function embeddedHtmlForUrl(url) {
    var emb = window.READER_EMBEDDED_DESC;
    if (!emb || typeof emb !== 'object') return null;
    var s = String(url || '').replace(/\\/g, '/').toLowerCase();
    if (s.indexOf('desc_2.html') !== -1 && emb.desc2) return emb.desc2;
    if (s.indexOf('desc_3.html') !== -1 && emb.desc3) return emb.desc3;
    if (s.indexOf('desc_4.html') !== -1 && emb.desc4) return emb.desc4;
    return null;
  }

  function loadSourceDocument(url) {
    var inline = embeddedHtmlForUrl(url);
    if (inline) {
      return Promise.resolve(documentFromHtmlString(inline));
    }
    return fetch(url, { credentials: 'same-origin' })
      .then(function (r) {
        if (!r.ok) throw new Error('http');
        return r.text();
      })
      .then(function (text) {
        return documentFromHtmlString(text);
      })
      .catch(function () {
        if (location.protocol === 'file:') {
          return loadDocumentViaIframe(url);
        }
        return null;
      });
  }

  function resolveUrl(u) {
    try {
      return new URL(u, document.baseURI || window.location.href).href;
    } catch (e) {
      return u;
    }
  }

  function loadAll() {
    var maps = { zanshu: null, shuolun: null, lunshi: null };
    var pending = SOURCES.length;

    function tryFinish() {
      pending--;
      if (pending > 0) return;
      initWithMaps({
        zanshu: maps.zanshu || {},
        shuolun: maps.shuolun || {},
        lunshi: maps.lunshi || {},
      });
      if (!document.querySelector('.reader-extra-notes')) {
        showLoadFailureHint();
      }
    }

    for (var s = 0; s < SOURCES.length; s++) {
      (function (src) {
        var abs = resolveUrl(src.url);
        loadSourceDocument(abs)
          .then(function (doc) {
            if (!doc) {
              maps[src.key] = {};
              return;
            }
            maps[src.key] = src.byQ ? buildQIndex(doc) : buildDIndex(doc);
          })
          .catch(function () {
            maps[src.key] = {};
          })
          .then(function () {
            tryFinish();
          });
      })(SOURCES[s]);
    }
  }

  function showLoadFailureHint() {
    if (document.querySelector('.reader-remarks-fail-hint')) return;
    var bar = document.createElement('div');
    bar.className = 'reader-remarks-fail-hint';
    bar.setAttribute('role', 'status');
    var extra =
      window.READER_EMBEDDED_DESC_MISSING
        ? '（偵測到無法載入 <code>reader-embedded-desc.js</code>，請勿單獨複製 reader.html，需一併放入該檔。）'
        : '';
    bar.innerHTML =
      '無法載入參考文檔（desc_2／desc_3／desc_4）。' +
      extra +
      ' 請確認檔名為連字號 <code>reader-embedded-desc.js</code>（非底線 <code>reader_embedded_desc.js</code>），且與 <code>reader.html</code> 同資料夾；可由 desc_2／3／4 以 Node 重新產生。若仍失敗，請以本機伺服器開啟此資料夾（例如：<code>npx serve .</code>）。';
    var toolbar = document.querySelector('.sutra-outline-toolbar');
    if (toolbar && toolbar.parentNode) {
      toolbar.parentNode.insertBefore(bar, toolbar.nextSibling);
    } else {
      document.body.insertBefore(bar, document.body.firstChild);
    }
  }

  function embeddedLooksReady() {
    var emb = window.READER_EMBEDDED_DESC;
    if (emb == null || typeof emb !== 'object') return false;
    function ok(x) {
      return typeof x === 'string' && x.length > 0;
    }
    return ok(emb.desc2) && ok(emb.desc3) && ok(emb.desc4);
  }

  /**
   * Primary embed is reader-embedded-desc.js (hyphens). If missing/404, try
   * reader_embedded_desc.js (underscores) for users who renamed the file.
   */
  function startReaderRemarks() {
    if (embeddedLooksReady()) {
      loadAll();
      return;
    }
    var alt = document.createElement('script');
    alt.src = 'reader_embedded_desc.js';
    alt.onload = function () {
      loadAll();
    };
    alt.onerror = function () {
      loadAll();
    };
    document.head.appendChild(alt);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startReaderRemarks);
  } else {
    startReaderRemarks();
  }
})();
