(function () {
    'use strict';

    var LAYERS = [
        { cls: 'sutra', label: '經' },
        { cls: 'tran001', label: '秦' },
        { cls: 'tran002', label: '魏' },
        { cls: 'tran003', label: '陳' },
        { cls: 'tran004', label: '隋' },
        { cls: 'tran005', label: '淨' },
        { cls: 'tran006', label: '英' },
        { cls: 'tran007', label: '梵' },
        { cls: 'tran008', label: '梵注' },
        { cls: 'tran009', label: '藏' }
    ];

    /** 除「經」外之譯層（秦～藏） */
    var TRANSLATION_LAYER_CLASSES = LAYERS.slice(1).map(function (l) {
        return l.cls;
    });

    var expandAllBtn = null;
    var translationsAllBtn = null;
    var layerButtons = {};

    function syncExpandAllLabel() {
        if (!expandAllBtn) return;
        var boxes = document.querySelectorAll('body.sutra-fulltext-page .cBox');
        var allCollapsed =
            boxes.length > 0 &&
            Array.prototype.every.call(boxes, function (b) {
                return b.classList.contains('sutra-branch-collapsed');
            });
        expandAllBtn.textContent = allCollapsed ? '全部展開' : '全部收合';
        expandAllBtn.setAttribute(
            'aria-label',
            allCollapsed ? '展開所有科判底下的經文與子目' : '收合所有科判底下的經文與子目'
        );
    }

    function allTranslationLayersHidden() {
        return TRANSLATION_LAYER_CLASSES.every(function (cls) {
            var b = layerButtons[cls];
            return b && b.getAttribute('aria-pressed') === 'false';
        });
    }

    function syncTranslationsAllLabel() {
        if (!translationsAllBtn) return;
        var hidden = allTranslationLayersHidden();
        translationsAllBtn.textContent = hidden ? '顯示全部譯文' : '隱藏全部譯文';
        translationsAllBtn.setAttribute(
            'aria-label',
            hidden ? '顯示所有譯本對照（秦、魏、陳、隋、淨、英、梵、梵注、藏）' : '隱藏所有譯本對照，僅保留各層按鈕狀態可再單獨開啟'
        );
    }

    /** 一併顯示或隱藏所有譯層；不影響「經」層。 */
    function setAllTranslationLayersVisible(visible) {
        for (var i = 0; i < TRANSLATION_LAYER_CLASSES.length; i++) {
            var cls = TRANSLATION_LAYER_CLASSES[i];
            var btn = layerButtons[cls];
            if (!btn) continue;
            btn.setAttribute('aria-pressed', visible ? 'true' : 'false');
            document.body.classList.toggle('sutra-ft-hide-' + cls, !visible);
        }
        syncTranslationsAllLabel();
    }

    function buildToolbar() {
        var head = document.createElement('header');
        head.className = 'sutra-fulltext-head';
        head.setAttribute('role', 'toolbar');
        head.setAttribute('aria-label', '經文與譯本顯示');

        var inner = document.createElement('div');
        inner.className = 'sutra-fulltext-toolbar-inner';

        expandAllBtn = document.createElement('button');
        expandAllBtn.type = 'button';
        expandAllBtn.className = 'sutra-fulltext-all-btn';
        expandAllBtn.textContent = '全部收合';
        expandAllBtn.setAttribute('aria-label', '收合所有科判底下的經文與子目');
        expandAllBtn.addEventListener('click', function () {
            var boxes = document.querySelectorAll('body.sutra-fulltext-page .cBox');
            var allCollapsed =
                boxes.length > 0 &&
                Array.prototype.every.call(boxes, function (b) {
                    return b.classList.contains('sutra-branch-collapsed');
                });
            var collapseAll = !allCollapsed;
            for (var i = 0; i < boxes.length; i++) {
                boxes[i].classList.toggle('sutra-branch-collapsed', collapseAll);
            }
            var indices = document.querySelectorAll('body.sutra-fulltext-page .index.sutra-ft-index-toggle');
            for (var j = 0; j < indices.length; j++) {
                indices[j].setAttribute('aria-expanded', collapseAll ? 'false' : 'true');
                indices[j].classList.toggle('sutra-ft-collapsed', collapseAll);
            }
            syncExpandAllLabel();
        });
        inner.appendChild(expandAllBtn);

        var sep0 = document.createElement('span');
        sep0.className = 'sutra-fulltext-toolbar-sep';
        sep0.setAttribute('aria-hidden', 'true');
        inner.appendChild(sep0);

        translationsAllBtn = document.createElement('button');
        translationsAllBtn.type = 'button';
        translationsAllBtn.className = 'sutra-fulltext-all-btn sutra-fulltext-translations-all-btn';
        translationsAllBtn.textContent = '隱藏全部譯文';
        translationsAllBtn.setAttribute(
            'aria-label',
            '隱藏所有譯本對照（秦、魏、陳、隋、淨、英、梵、梵注、藏）'
        );
        translationsAllBtn.addEventListener('click', function () {
            setAllTranslationLayersVisible(allTranslationLayersHidden());
        });
        inner.appendChild(translationsAllBtn);

        var sep = document.createElement('span');
        sep.className = 'sutra-fulltext-toolbar-sep';
        sep.setAttribute('aria-hidden', 'true');
        inner.appendChild(sep);

        var title = document.createElement('span');
        title.className = 'sutra-fulltext-toolbar-title';
        title.textContent = '顯示層';
        inner.appendChild(title);

        LAYERS.forEach(function (layer) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'sutra-fulltext-layer-btn';
            btn.textContent = layer.label;
            btn.setAttribute('aria-pressed', 'true');
            btn.dataset.layerClass = layer.cls;
            layerButtons[layer.cls] = btn;
            btn.addEventListener('click', function () {
                var visible = btn.getAttribute('aria-pressed') === 'true';
                var nextVisible = !visible;
                btn.setAttribute('aria-pressed', nextVisible ? 'true' : 'false');
                document.body.classList.toggle('sutra-ft-hide-' + layer.cls, !nextVisible);

                if (layer.cls === 'tran008' && nextVisible) {
                    document.body.classList.remove('sutra-ft-hide-tran007');
                    var bFan = layerButtons.tran007;
                    if (bFan) bFan.setAttribute('aria-pressed', 'true');
                }
                if (layer.cls === 'tran007' && !nextVisible) {
                    document.body.classList.add('sutra-ft-hide-tran008');
                    var bFanZhu = layerButtons.tran008;
                    if (bFanZhu) bFanZhu.setAttribute('aria-pressed', 'false');
                }
                syncTranslationsAllLabel();
            });
            inner.appendChild(btn);
        });

        head.appendChild(inner);
        document.body.insertBefore(head, document.body.firstChild);
    }

    function wireIndexToggles() {
        var indices = document.querySelectorAll('.index');
        for (var i = 0; i < indices.length; i++) {
            var idx = indices[i];
            var box = idx.nextElementSibling;
            if (!box || !box.classList.contains('cBox')) continue;

            idx.classList.add('sutra-ft-index-toggle');
            idx.setAttribute('role', 'button');
            idx.setAttribute('tabindex', '0');
            idx.setAttribute('aria-expanded', 'true');

            (function (cBox, el) {
                function toggleBranch() {
                    var collapsed = cBox.classList.toggle('sutra-branch-collapsed');
                    el.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
                    el.classList.toggle('sutra-ft-collapsed', collapsed);
                    syncExpandAllLabel();
                }
                el.addEventListener('click', toggleBranch);
                el.addEventListener('keydown', function (e) {
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                    toggleBranch();
                });
            })(box, idx);
        }
    }

    function init() {
        if (!document.body.classList.contains('sutra-fulltext-page')) return;
        buildToolbar();
        wireIndexToggles();
        syncExpandAllLabel();
        syncTranslationsAllLabel();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
