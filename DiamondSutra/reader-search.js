/**
 * reader.html: compact search in sutra-outline-toolbar (top row, right).
 */
(function () {
  var hits = [];
  var hitIndex = 0;
  var debounceTimer = null;
  var lastCurrent = null;

  function clearCurrentClass() {
    if (lastCurrent && lastCurrent.classList) {
      lastCurrent.classList.remove('reader-search-current');
    }
    lastCurrent = null;
  }

  function depth(el) {
    var d = 0;
    for (var n = el; n && n !== document.body; n = n.parentElement) {
      d++;
    }
    return d;
  }

  /** If both .in_index and inner .subIndex match, keep the inner node only. */
  function dedupePreferInner(candidates) {
    var arr = candidates.slice();
    arr.sort(function (a, b) {
      return depth(b) - depth(a);
    });
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      var el = arr[i];
      var wrapsKept = false;
      for (var j = 0; j < out.length; j++) {
        if (el.contains(out[j])) {
          wrapsKept = true;
          break;
        }
      }
      if (wrapsKept) continue;
      out.push(el);
    }
    out.sort(function (a, b) {
      var pos = a.compareDocumentPosition(b);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });
    return out;
  }

  function collectMatching(q) {
    var raw = [];
    document
      .querySelectorAll(
        '.in_index, .in_sutra, .in_commentary, span.subIndex, .subIndex'
      )
      .forEach(function (el) {
        if (el.textContent && el.textContent.indexOf(q) !== -1) {
          raw.push(el);
        }
      });
    return dedupePreferInner(raw);
  }

  function runSearch(input, meta, btnPrev, btnNext) {
    clearCurrentClass();
    var q = (input.value || '').trim();
    if (!q) {
      hits = [];
      hitIndex = 0;
      meta.textContent = '';
      btnPrev.disabled = true;
      btnNext.disabled = true;
      return;
    }
    hits = collectMatching(q);
    if (hits.length === 0) {
      hitIndex = 0;
      meta.textContent = '0';
      btnPrev.disabled = true;
      btnNext.disabled = true;
      return;
    }
    hitIndex = 0;
    meta.textContent = '1/' + hits.length;
    btnPrev.disabled = hits.length <= 1;
    btnNext.disabled = hits.length <= 1;
    goToHit(0, meta, btnPrev, btnNext);
  }

  function goToHit(i, meta, btnPrev, btnNext) {
    if (!hits.length) return;
    if (i < 0) i = hits.length - 1;
    if (i >= hits.length) i = 0;
    hitIndex = i;
    clearCurrentClass();
    var el = hits[hitIndex];
    lastCurrent = el;
    el.classList.add('reader-search-current');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    meta.textContent = hitIndex + 1 + '/' + hits.length;
    if (btnPrev) btnPrev.disabled = hits.length <= 1;
    if (btnNext) btnNext.disabled = hits.length <= 1;
  }

  function scheduleSearch(input, meta, btnPrev, btnNext) {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      debounceTimer = null;
      runSearch(input, meta, btnPrev, btnNext);
    }, 220);
  }

  function install() {
    if (document.getElementById('reader-search-input')) return;

    var wrap = document.createElement('div');
    wrap.className = 'reader-search-inline';
    wrap.setAttribute('role', 'search');
    wrap.setAttribute('aria-label', '全文搜尋');

    var input = document.createElement('input');
    input.type = 'search';
    input.id = 'reader-search-input';
    input.className = 'reader-search-input reader-search-input--compact';
    input.placeholder = '搜尋…';
    input.setAttribute('enterkeyhint', 'search');
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('spellcheck', 'false');
    input.setAttribute('title', '搜尋科判、細目、經文、纂釋');

    var meta = document.createElement('span');
    meta.className = 'reader-search-meta';
    meta.id = 'reader-search-meta';
    meta.setAttribute('aria-live', 'polite');

    function mkBtn(id, label, text) {
      var b = document.createElement('button');
      b.type = 'button';
      b.id = id;
      b.className = 'sutra-outline-toolbar-btn reader-search-nav-btn';
      b.setAttribute('aria-label', label);
      b.setAttribute('title', label);
      b.textContent = text;
      return b;
    }

    var btnPrev = mkBtn('reader-search-prev', '上一筆', '⟨');
    var btnNext = mkBtn('reader-search-next', '下一筆', '⟩');
    var btnClear = mkBtn('reader-search-clear', '清除', '×');

    btnPrev.disabled = true;
    btnNext.disabled = true;

    input.addEventListener('input', function () {
      scheduleSearch(input, meta, btnPrev, btnNext);
    });
    input.addEventListener('search', function () {
      if (debounceTimer) clearTimeout(debounceTimer);
      runSearch(input, meta, btnPrev, btnNext);
    });

    btnPrev.addEventListener('click', function () {
      if (hits.length) goToHit(hitIndex - 1, meta, btnPrev, btnNext);
    });
    btnNext.addEventListener('click', function () {
      if (hits.length) goToHit(hitIndex + 1, meta, btnPrev, btnNext);
    });
    btnClear.addEventListener('click', function () {
      input.value = '';
      if (debounceTimer) clearTimeout(debounceTimer);
      clearCurrentClass();
      hits = [];
      hitIndex = 0;
      meta.textContent = '';
      btnPrev.disabled = true;
      btnNext.disabled = true;
      input.focus();
    });

    wrap.appendChild(input);
    wrap.appendChild(meta);
    wrap.appendChild(btnPrev);
    wrap.appendChild(btnNext);
    wrap.appendChild(btnClear);

    var toolbar = document.querySelector('.sutra-outline-toolbar');
    if (toolbar) {
      toolbar.appendChild(wrap);
      var obs = new MutationObserver(function () {
        if (wrap.parentNode === toolbar && toolbar.lastElementChild !== wrap) {
          toolbar.appendChild(wrap);
        }
      });
      obs.observe(toolbar, { childList: true });
    } else {
      wrap.classList.add('reader-search-fallback');
      document.body.appendChild(wrap);
    }
  }

  function start() {
    requestAnimationFrame(function () {
      requestAnimationFrame(install);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
