/**
 * Wrap full-width 【…】 segments in <span class="desc-bracket-em"> (styles in styles.css).
 * Used by desc_2.html / desc_3.html; exposed as wrapDescBrackets for reader-remarks panels.
 */
(function () {
  'use strict';

  function wrapBracketSpansInHtml(html) {
    if (!html || html.indexOf('【') === -1) return html;
    var out = '';
    var i = 0;
    while (i < html.length) {
      var start = html.indexOf('【', i);
      if (start === -1) {
        out += html.slice(i);
        break;
      }
      out += html.slice(i, start);
      var end = html.indexOf('】', start + 1);
      if (end === -1) {
        out += html.slice(start);
        break;
      }
      out += '<span class="desc-bracket-em">' + html.slice(start, end + 1) + '</span>';
      i = end + 1;
    }
    return out;
  }

  function wrapDescBrackets(root) {
    var el = root || document.body;
    if (!el) return;
    var html = el.innerHTML;
    var next = wrapBracketSpansInHtml(html);
    if (next !== html) el.innerHTML = next;
  }

  window.wrapDescBrackets = wrapDescBrackets;

  function autoRun() {
    if (document.body && document.body.classList.contains('desc-source-page')) {
      wrapDescBrackets(document.body);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoRun);
  } else {
    autoRun();
  }
})();
