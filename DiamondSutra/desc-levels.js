/**
 * Outline levels from (甲一)(乙一)… 天干 → 地支 → 千字文 順序。
 * Click .in_index: solo 大綱（收合其他支線），並強制保留該節與所有上層之經文／纂釋可見；
 * 有下屆科判（子區塊）之節：再次點擊同一索引列可隱藏或顯示其下全部子節（如丙、丁諸節）。
 * 含 .subIndex 之節（且無子區塊時）：再次點擊可隱藏或顯示細目與本節經／纂釋。
 * 僅有經／纂釋無細目、無子區塊者：再次點擊僅切換正文顯示。
 * 頂端單鍵「收合／展開」切換可重置此模式。
 */
(function () {
  'use strict';

  var TIANGAN = '甲乙丙丁戊己庚辛壬癸';
  var DIZHI = '子丑寅卯辰巳午未申酉戌亥';
  // 千字文（周興嗣本，句讀後連寫；用於癸亥之後的層級）
  var QIANZI =
    '天地玄黃宇宙洪荒日月盈昃辰宿列張寒來暑往秋收冬藏閏餘成歲律呂調陽雲騰致雨露結為霜金生麗水玉出崑岡劍號巨闕珠稱夜光果珍李柰菜重芥姜海鹹河淡鱗潛羽翔龍師火帝鳥官人皇始制文字乃服衣裳推位讓國有虞陶唐弔民伐罪周發殷湯坐朝問道垂拱平章愛育黎首臣伏戎羌遐邇一體率賓歸王鳴鳳在樹白駒食場化被草木賴及萬方蓋此身髮四大五常恭惟鞠養豈敢毀傷女慕貞潔男效才良知過必改得能莫忘罔談彼短靡恃己長信使可覆器欲難量墨悲絲染詩讚羔羊景行維賢克念作聖德建名立形端表正空谷傳聲虛堂習聽禍因惡積福緣善慶尺璧非寶寸陰是競資父事君曰嚴與敬孝當竭力忠則盡命臨深履薄夙興溫凊似蘭斯馨如松之盛川流不息淵澄取映容止若思言辭安定篤初誠美慎終宜令榮業所基籍甚無竟學優登仕攝職從政存以甘棠去而益詠樂殊貴賤禮別尊卑上和下睦夫唱婦隨外受傅訓入奉母儀諸姑伯叔猶子比兒孔懷兄弟同氣連枝交友投分切磨箴規仁慈隱惻造次弗離節義廉退顛沛匪虧性靜情逸心動神疲守真誌滿逐物意移堅持雅操好爵自縻都邑華夏東西二京背邙面洛浮渭據涇宮殿盤郁樓觀飛驚圖寫禽獸畫彩仙靈丙舍傍啟甲帳對楹肆筵設席鼓瑟吹笙升階納陛弁轉疑星右通廣內左達承明既集墳典亦聚群英杜稾鍾隸漆書壁經府羅將相路俠槐卿戶封八縣家給千兵高冠陪輦驅轂振纓世祿侈富車駕肥輕策功茂實勒碑刻銘盤溪伊尹佐時阿衡奄宅曲阜微旦孰營桓公匡合濟弱扶傾綺迴漢惠說感武丁俊乂密勿多士寔寧晉楚更霸趙魏困橫假途滅虢踐土會盟何遵約法韓弊煩刑起翦頗牧用軍最精宣威沙漠馳譽丹青九州禹跡百郡秦并嶽宗泰岱禪主雲亭雁門紫塞雞田赤城崑池碣石鉅野洞庭曠遠綿邈巖岫杳冥治本於農務茲稼穡俶載南畝我藝黍稷稅熟貢新勸賞黜陟孟軻敦素史魚秉直庶幾中庸勞謙謹敕聆音察理鑑貌辨色貽厥嘉猷勉其祗植省躬譏誡寵增抗極殆辱近恥林皋幸即兩疏見機解組誰逼索居閒處沈默寂寥求古尋論散慮逍遙欣奏累遣戚謝歡招渠荷的歷園莽抽條枇杷晚翠梧桐早凋陳根委翳落葉飄搖游鶤獨運凌摩絳霄耽讀玩市寓目囊箱易輶攸畏屬耳垣牆具膳餐飯適口充腸飽飫烹宰饑厭糟糠親戚故舊老少異糧妾御績紡侍巾帷房紈扇圓潔銀燭煒煌晝眠夕寐藍筍象床弦歌酒讖接杯舉觴嬌手頓足悅豫且康嫡後嗣續祭祀烝嘗稽顙再拜悚懼恐惶箋牒簡要顧答審詳骸垢想浴執熱願涼驢騾犢特駭躍超驤誅斬賊盜捕獲叛亡布射遼丸嵇琴阮嘯恬筆倫紙鈞巧任釣釋紛利俗並皆佳妙毛施淑姿工顰妍笑年矢每催曦暉朗曜璇璣懸斡晦魄環照指薪修祜永綏吉劭矩步引領俯仰廊廟束帶矜莊徘徊瞻眺孤陋寡聞愚蒙等誚謂語助者焉哉乎也';

  var ORDER = TIANGAN + DIZHI + QIANZI;
  var ORDER_INDEX = {};
  for (var oi = 0; oi < ORDER.length; oi++) {
    var ch = ORDER[oi];
    if (ORDER_INDEX[ch] === undefined) ORDER_INDEX[ch] = oi;
  }

  // 常見訛字 → 正字（層級用）
  var STEM_ALIASES = { 實: '寅' };

  function parseStemFromIndexEl(el) {
    if (!el) return null;
    var t = el.textContent || '';
    var m = t.match(/\(([^)]+)\)/);
    if (!m) return null;
    var inner = m[1].trim();
    if (!inner.length) return null;
    var stem = inner[0];
    if (STEM_ALIASES[stem]) stem = STEM_ALIASES[stem];
    return ORDER_INDEX[stem] !== undefined ? stem : null;
  }

  function depthForStem(stem) {
    if (!stem) return -1;
    var idx = ORDER_INDEX[stem];
    return idx !== undefined ? idx : -1;
  }

  function collectOutlineBlocks() {
    var all = document.querySelectorAll('body div');
    var out = [];
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      var cn = el.className && String(el.className).trim();
      if (/^D\d+$/.test(cn)) out.push(el);
    }
    return out;
  }

  function computeNextPeer(depths) {
    var n = depths.length;
    var nextPeer = new Array(n);
    for (var i = 0; i < n; i++) {
      var d = depths[i];
      var j = i + 1;
      while (j < n && depths[j] > d) j++;
      nextPeer[i] = j;
    }
    return nextPeer;
  }

  function hasDescendants(i, depths, nextPeer) {
    var end = nextPeer[i];
    var d = depths[i];
    for (var j = i + 1; j < end; j++) {
      if (depths[j] > d) return true;
    }
    return false;
  }

  /** Direct body under a D* block (經、纂釋), excluding the title row. */
  function blockHasBodyContent(block) {
    var kids = block.children;
    for (var i = 0; i < kids.length; i++) {
      if (!kids[i].classList.contains('in_index')) return true;
    }
    return false;
  }

  /** Direct child .in_sutra and .in_commentary (toggle 纂釋 on 【經】 click). */
  function findDirectSutraCommentary(block) {
    var sutraEl = null;
    var commentaryEl = null;
    var ch = block.children;
    for (var i = 0; i < ch.length; i++) {
      var c = ch[i];
      if (c.classList.contains('in_sutra')) sutraEl = c;
      if (c.classList.contains('in_commentary')) commentaryEl = c;
    }
    return sutraEl && commentaryEl ? { sutra: sutraEl, commentary: commentaryEl } : null;
  }

  function applyVisibility(blocks, depths, nextPeer, collapsed) {
    var n = blocks.length;
    for (var j = 0; j < n; j++) {
      var hide = false;
      for (var i = 0; i < n && !hide; i++) {
        if (!collapsed[i]) continue;
        if (j <= i || j >= nextPeer[i]) continue;
        if (depths[j] > depths[i]) hide = true;
      }
      blocks[j].classList.toggle('sutra-outline-hidden', hide);
    }
  }

  /** e.g. "D57" from class "D57" or "D57 extra" */
  function dClassFromBlock(block) {
    var cn = block.className && String(block.className).trim();
    if (!cn) return null;
    var parts = cn.split(/\s+/);
    for (var p = 0; p < parts.length; p++) {
      if (/^D\d+$/.test(parts[p])) return parts[p];
    }
    return null;
  }

  /**
   * When .in_sutra follows (as sibling) an .in_index that contains .subIndex,
   * show the parent block id (Dxx) at the start of the sutra row (reader.html 等).
   */
  function labelSutraWhenAfterSubIndexOutline(blocks) {
    for (var i = 0; i < blocks.length; i++) {
      var block = blocks[i];
      var dName = dClassFromBlock(block);
      if (!dName) continue;
      var ch = block.children;
      var lastSubIdxBeforeSutra = -1;
      var sutraIdx = -1;
      for (var c = 0; c < ch.length; c++) {
        var el = ch[c];
        if (el.classList.contains('in_index') && el.querySelector('.subIndex')) {
          lastSubIdxBeforeSutra = c;
        }
        if (el.classList.contains('in_sutra')) {
          sutraIdx = c;
          break;
        }
      }
      if (lastSubIdxBeforeSutra < 0 || sutraIdx < 0) continue;
      if (sutraIdx <= lastSubIdxBeforeSutra) continue;
      var sutraEl = ch[sutraIdx];
      if (sutraEl.querySelector(':scope > .reader-sutra-d-loc')) continue;
      var badge = document.createElement('span');
      badge.className = 'reader-sutra-d-loc';
      badge.setAttribute('title', '區塊編號 ' + dName);
      badge.textContent = dName;
      sutraEl.insertBefore(badge, sutraEl.firstChild);
    }
  }

  function init() {
    var blocks = collectOutlineBlocks();
    if (!blocks.length) return;

    labelSutraWhenAfterSubIndexOutline(blocks);

    var depths = [];
    var lastDepth = 0;
    for (var b = 0; b < blocks.length; b++) {
      var idxEl = blocks[b].querySelector('.in_index');
      var stem = parseStemFromIndexEl(idxEl);
      var d = depthForStem(stem);
      if (d < 0) d = lastDepth;
      depths.push(d);
      lastDepth = d;
    }

    var nextPeer = computeNextPeer(depths);
    var collapsed = {};
    var toggleMeta = new Array(blocks.length);
    /** 使用者對該節「經／纂釋」按索引收起後為 true（僅用於無 .subIndex 之列）。 */
    var userBodyHidden = {};
    /** 含 subIndex 之列：再次點擊為 true 時隱藏細目與本節經／纂釋。 */
    var userOutlineCompact = {};
    /** 有子區塊之列：再次點擊為 true 時隱藏 nextPeer 範圍內所有下層區塊。 */
    var userBranchCollapsed = {};
    /** Last block focused via 大綱點選；用於強制保留該路徑上所有上層的經文／纂釋與區塊可見。 */
    var lastOutlineFocusIdx = -1;

    function parentOutlineIndex(i) {
      if (i <= 0) return -1;
      var myD = depths[i];
      for (var j = i - 1; j >= 0; j--) {
        if (depths[j] < myD) return j;
      }
      return -1;
    }

    function isOutlineAncestor(ancIdx, descIdx) {
      var p = parentOutlineIndex(descIdx);
      while (p >= 0) {
        if (p === ancIdx) return true;
        p = parentOutlineIndex(p);
      }
      return false;
    }

    function isOutlineStrictDescendantOf(d, f) {
      return d > f && d < nextPeer[f];
    }

    function isOnOutlineFocusPath(t) {
      if (lastOutlineFocusIdx < 0) return false;
      if (t === lastOutlineFocusIdx) return true;
      if (isOutlineAncestor(t, lastOutlineFocusIdx)) return true;
      if (isOutlineStrictDescendantOf(t, lastOutlineFocusIdx)) return true;
      return false;
    }

    /** Undo mistaken hiding of the focused branch (上層 + 本節子樹仍須可見). */
    function forceFocusPathVisible() {
      if (lastOutlineFocusIdx < 0) return;
      var f = lastOutlineFocusIdx;
      var a = f;
      while (a >= 0) {
        blocks[a].classList.remove('sutra-outline-hidden');
        blocks[a].classList.remove('sutra-outline-body-collapsed');
        a = parentOutlineIndex(a);
      }
      for (var d = f + 1; d < nextPeer[f]; d++) {
        blocks[d].classList.remove('sutra-outline-hidden');
        blocks[d].classList.remove('sutra-outline-body-collapsed');
      }
    }

    var outlineMasterToggleBtn = null;

    function isAllCollapsedGlobally() {
      var any = false;
      for (var u = 0; u < blocks.length; u++) {
        if (!toggleMeta[u]) continue;
        any = true;
        if (!collapsed[u]) return false;
      }
      return any;
    }

    function syncOutlineMasterToggle() {
      if (!outlineMasterToggleBtn) return;
      var allC = isAllCollapsedGlobally();
      outlineMasterToggleBtn.setAttribute(
        'aria-pressed',
        allC ? 'true' : 'false'
      );
      outlineMasterToggleBtn.textContent = allC ? '展開' : '收合';
    }

    function refreshBranchChildClasses() {
      for (var i = 0; i < blocks.length; i++) {
        blocks[i].classList.remove('sutra-outline-branch-child-hidden');
      }
      for (var p = 0; p < blocks.length; p++) {
        if (!userBranchCollapsed[p]) continue;
        var end = nextPeer[p];
        for (var j = p + 1; j < end; j++) {
          blocks[j].classList.add('sutra-outline-branch-child-hidden');
        }
      }
    }

    function refreshOutlineUi() {
      applyVisibility(blocks, depths, nextPeer, collapsed);
      forceFocusPathVisible();
      for (var t = 0; t < blocks.length; t++) {
        var meta = toggleMeta[t];
        if (!meta) continue;
        var on = !!collapsed[t];
        var treeOpen = !on || isOnOutlineFocusPath(t);
        var rowSelfExpanded;
        if (meta.hasSubIndex) {
          rowSelfExpanded = !userOutlineCompact[t];
        } else {
          rowSelfExpanded = !(meta.hasBody && userBodyHidden[t]);
        }
        var childrenExpanded =
          !meta.hasDescendants || !userBranchCollapsed[t];
        var treeRowOpen = treeOpen && rowSelfExpanded;
        var ariaExpanded = treeRowOpen && childrenExpanded;
        blocks[t].classList.toggle(
          'sutra-outline-user-compact',
          !!userOutlineCompact[t]
        );
        meta.indexNode.setAttribute(
          'aria-expanded',
          ariaExpanded ? 'true' : 'false'
        );
        meta.indexNode.classList.toggle('sutra-level-collapsed', !treeOpen);
        meta.indexNode.classList.toggle(
          'sutra-branch-children-collapsed',
          !!(meta.hasDescendants && userBranchCollapsed[t])
        );
        if (meta.hasBody) {
          blocks[t].classList.toggle(
            'sutra-outline-body-collapsed',
            !treeRowOpen
          );
        }
      }
      refreshBranchChildClasses();
      syncOutlineMasterToggle();
    }

    function setAllCollapsed(wantCollapsed) {
      lastOutlineFocusIdx = -1;
      for (var u = 0; u < blocks.length; u++) {
        if (toggleMeta[u]) {
          collapsed[u] = wantCollapsed;
          delete userBodyHidden[u];
          delete userOutlineCompact[u];
          delete userBranchCollapsed[u];
        }
      }
      refreshOutlineUi();
    }

    /** Expand ancestors + this node + its subtree; collapse all other branches. */
    function applyFocusOutlineCollapse(fIdx) {
      if (fIdx < 0 || fIdx >= blocks.length) return;
      lastOutlineFocusIdx = fIdx;
      for (var k = 0; k < blocks.length; k++) {
        if (!toggleMeta[k]) continue;
        if (
          k === fIdx ||
          isOutlineAncestor(k, fIdx) ||
          isOutlineStrictDescendantOf(k, fIdx)
        ) {
          collapsed[k] = false;
        } else {
          collapsed[k] = true;
        }
      }
      refreshOutlineUi();
    }

    for (var k = 0; k < blocks.length; k++) {
      blocks[k].classList.add('sutra-outline-block');
      blocks[k].style.setProperty('--sutra-depth', String(depths[k]));

      var indexEl = blocks[k].querySelector('.in_index');
      if (!indexEl) continue;

      var sub = hasDescendants(k, depths, nextPeer);
      var body = blockHasBodyContent(blocks[k]);
      if (!sub && !body) continue;

      var hasSubIndex = !!indexEl.querySelector('.subIndex');
      toggleMeta[k] = {
        indexNode: indexEl,
        hasBody: body,
        hasSubIndex: hasSubIndex,
        hasDescendants: sub,
      };
      indexEl.classList.add('sutra-level-toggle');
      indexEl.setAttribute('role', 'button');
      indexEl.setAttribute('tabindex', '0');
      indexEl.setAttribute('aria-expanded', 'true');
      indexEl.dataset.sutraOutlineIndex = String(k);
      indexEl.title =
        (indexEl.title ? indexEl.title + ' ' : '') +
        '點擊後僅展開此支大綱，其餘自動收合；頂端按鈕可一次展開或收合。' +
        (sub
          ? ' 有下屆科判之節：再次點擊本列可隱藏或顯示其下全部子節。'
          : hasSubIndex
            ? ' 含細目之節：再次點擊本列可隱藏或顯示細目與本節正文。'
            : body
              ? ' 有經／纂釋之節：再次點擊本列可隱藏或顯示該節正文。'
              : '');
    }

    for (var c = 0; c < blocks.length; c++) {
      var pair = findDirectSutraCommentary(blocks[c]);
      if (!pair) continue;
      var blk = blocks[c];
      var sutra = pair.sutra;
      var commentary = pair.commentary;
      blk.classList.add('sutra-has-commentary');
      sutra.classList.add('sutra-sutra-click-toggle');
      if (!commentary.id) commentary.id = 'sutra-commentary-' + c;
      sutra.setAttribute('role', 'button');
      sutra.setAttribute('tabindex', '0');
      sutra.setAttribute('aria-expanded', 'false');
      sutra.setAttribute('aria-controls', commentary.id);
      sutra.title =
        typeof window.applySutraRemarkCycle === 'function'
          ? '點擊循序：【纂釋】→參考文→全部關閉'
          : '點擊顯示或隱藏【纂釋】';
    }

    if (!document.documentElement.dataset.sutraRemarkDelegate) {
      document.documentElement.dataset.sutraRemarkDelegate = '1';
      function sutraTargetFromEvent(ev) {
        var t = ev.target;
        if (!t || !t.closest) return null;
        if (t.closest('a')) return null;
        var sutra = t.closest('.sutra-sutra-click-toggle');
        if (!sutra) return null;
        var block = sutra.closest('.sutra-has-commentary');
        if (!block) return null;
        return { sutra: sutra, block: block };
      }
      document.addEventListener(
        'click',
        function (ev) {
          var pair = sutraTargetFromEvent(ev);
          if (!pair) return;
          if (typeof window.applySutraRemarkCycle === 'function') {
            ev.preventDefault();
            window.applySutraRemarkCycle(pair.block, pair.sutra);
            return;
          }
          var open = pair.block.classList.toggle('sutra-show-commentary');
          pair.sutra.setAttribute('aria-expanded', open ? 'true' : 'false');
        },
        true
      );
      document.addEventListener(
        'keydown',
        function (ev) {
          if (ev.key !== 'Enter' && ev.key !== ' ') return;
          var ae = document.activeElement;
          if (!ae || !ae.classList.contains('sutra-sutra-click-toggle')) return;
          var block = ae.closest('.sutra-has-commentary');
          if (!block) return;
          ev.preventDefault();
          if (typeof window.applySutraRemarkCycle === 'function') {
            window.applySutraRemarkCycle(block, ae);
            return;
          }
          var open = block.classList.toggle('sutra-show-commentary');
          ae.setAttribute('aria-expanded', open ? 'true' : 'false');
        },
        true
      );
    }

    function indexTitlePlain(block) {
      var el = block.querySelector('.in_index');
      if (!el) return '';
      var clone = el.cloneNode(true);
      var subs = clone.querySelectorAll('.subIndex');
      for (var si = 0; si < subs.length; si++) subs[si].remove();
      return (clone.textContent || '').replace(/\s+/g, ' ').trim();
    }

    function getAncestorChainIndices(blockIndex) {
      var myD = depths[blockIndex];
      if (myD <= 0) return [];
      var chain = [];
      var threshold = myD;
      for (var j = blockIndex - 1; j >= 0; j--) {
        if (depths[j] < threshold) {
          chain.unshift(j);
          threshold = depths[j];
          if (threshold === 0) break;
        }
      }
      return chain;
    }

    function formatOutlineBreadcrumbAncestors(blockIndex) {
      if (blockIndex < 0 || blockIndex >= blocks.length) return '';
      var anc = getAncestorChainIndices(blockIndex);
      if (!anc.length) return '';
      var parts = [];
      for (var p = 0; p < anc.length; p++) {
        var t = indexTitlePlain(blocks[anc[p]]);
        if (t) parts.push(t);
      }
      return parts.join('、');
    }

    function formatOutlineBreadcrumbFull(blockIndex) {
      if (blockIndex < 0 || blockIndex >= blocks.length) return '';
      var anc = getAncestorChainIndices(blockIndex);
      var parts = [];
      for (var p = 0; p < anc.length; p++) {
        var t = indexTitlePlain(blocks[anc[p]]);
        if (t) parts.push(t);
      }
      var cur = indexTitlePlain(blocks[blockIndex]);
      if (cur) parts.push(cur);
      return parts.join('、');
    }

    var breadcrumbEl = document.createElement('div');
    breadcrumbEl.className =
      'sutra-outline-breadcrumb sutra-outline-breadcrumb--inactive';
    breadcrumbEl.setAttribute('role', 'navigation');

    var lastBreadcrumbIdx = -999;

    function renderOutlineBreadcrumbText(text) {
      breadcrumbEl.replaceChildren();
      var t = String(text || '').trim();
      if (!t) {
        breadcrumbEl.classList.add('sutra-outline-breadcrumb--inactive');
        breadcrumbEl.removeAttribute('aria-label');
        return;
      }
      breadcrumbEl.classList.remove('sutra-outline-breadcrumb--inactive');
      breadcrumbEl.setAttribute('aria-label', t);
      var parts = t.split('、');
      for (var pi = 0; pi < parts.length; pi++) {
        var chunk = String(parts[pi] || '').trim();
        if (!chunk.length) continue;
        var span = document.createElement('span');
        span.className = 'sutra-outline-breadcrumb-seg';
        span.textContent = chunk;
        breadcrumbEl.appendChild(span);
      }
      if (!breadcrumbEl.firstChild) {
        breadcrumbEl.classList.add('sutra-outline-breadcrumb--inactive');
        breadcrumbEl.removeAttribute('aria-label');
      }
    }

    function stickyHeadBottom() {
      var head = document.querySelector('.sutra-outline-sticky-head');
      if (!head) return 0;
      return head.getBoundingClientRect().bottom;
    }

    function blockIndexFromReadingPoint() {
      var y = stickyHeadBottom() + 10;
      var x = Math.min(window.innerWidth - 8, Math.max(8, window.innerWidth / 2));
      if (y >= window.innerHeight - 4) return -1;
      var el = document.elementFromPoint(x, y);
      if (!el) return -1;
      var block = el.closest('.sutra-outline-block');
      if (!block) return -1;
      return blocks.indexOf(block);
    }

    function setOutlineBreadcrumbIndex(idx) {
      if (idx === lastBreadcrumbIdx) return;
      lastBreadcrumbIdx = idx;
      var text = idx >= 0 ? formatOutlineBreadcrumbAncestors(idx) : '';
      renderOutlineBreadcrumbText(text);
      breadcrumbEl.title =
        idx >= 0 ? formatOutlineBreadcrumbFull(idx) : '';
    }

    function updateOutlineBreadcrumbFromScroll() {
      var idx = blockIndexFromReadingPoint();
      if (idx >= 0) setOutlineBreadcrumbIndex(idx);
    }

    var scrollBreadcrumbScheduled = false;
    function scheduleScrollBreadcrumb() {
      if (scrollBreadcrumbScheduled) return;
      scrollBreadcrumbScheduled = true;
      requestAnimationFrame(function () {
        scrollBreadcrumbScheduled = false;
        updateOutlineBreadcrumbFromScroll();
      });
    }

    function activateOutlineIndexFromPointer(idx) {
      if (idx < 0) return;
      var meta = toggleMeta[idx];
      if (!meta) return;
      var hadFocus = lastOutlineFocusIdx === idx;
      if (!hadFocus) {
        if (meta.hasDescendants) {
          userBranchCollapsed[idx] = false;
        }
        if (meta.hasSubIndex) {
          userOutlineCompact[idx] = false;
        }
        if (meta.hasSubIndex) {
          delete userBodyHidden[idx];
        } else if (meta.hasBody) {
          userBodyHidden[idx] = false;
        }
      }
      setOutlineBreadcrumbIndex(idx);
      applyFocusOutlineCollapse(idx);
      if (!hadFocus) {
        return;
      }
      if (meta.hasDescendants) {
        userBranchCollapsed[idx] = !userBranchCollapsed[idx];
        refreshOutlineUi();
      } else if (meta.hasSubIndex) {
        userOutlineCompact[idx] = !userOutlineCompact[idx];
        refreshOutlineUi();
      } else if (meta.hasBody) {
        userBodyHidden[idx] = !userBodyHidden[idx];
        refreshOutlineUi();
      }
    }

    function onOutlineIndexActivate(ev) {
      var t = ev.target;
      if (!t || !t.closest) return;
      var idxEl = t.closest('.in_index');
      if (!idxEl) return;
      var block = idxEl.closest('.sutra-outline-block');
      if (!block) return;
      var idx = blocks.indexOf(block);
      if (idx < 0) return;
      if (ev.type === 'click') {
        if (t.closest && t.closest('a')) return;
        activateOutlineIndexFromPointer(idx);
        return;
      }
      setOutlineBreadcrumbIndex(idx);
      applyFocusOutlineCollapse(idx);
    }

    document.addEventListener('focusin', onOutlineIndexActivate);
    document.addEventListener('click', onOutlineIndexActivate, true);
    document.addEventListener(
      'keydown',
      function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        var ae = document.activeElement;
        if (!ae || !ae.classList.contains('sutra-level-toggle')) return;
        var blk = ae.closest('.sutra-outline-block');
        if (!blk) return;
        var ix = blocks.indexOf(blk);
        if (ix < 0) return;
        e.preventDefault();
        activateOutlineIndexFromPointer(ix);
      },
      true
    );
    window.addEventListener('scroll', scheduleScrollBreadcrumb, { passive: true });
    window.addEventListener('resize', scheduleScrollBreadcrumb);

    document.body.classList.add('sutra-outline-enabled');

    var stickyHead = document.createElement('div');
    stickyHead.className = 'sutra-outline-sticky-head';

    var toolbar = document.createElement('div');
    toolbar.className = 'sutra-outline-toolbar';
    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', '大綱收合');

    var modeGroup = document.createElement('div');
    modeGroup.className = 'sutra-outline-toolbar-mode';
    modeGroup.setAttribute('role', 'group');
    modeGroup.setAttribute('aria-label', '展開或收合');

    var btnToggle = document.createElement('button');
    btnToggle.type = 'button';
    btnToggle.className =
      'sutra-outline-toolbar-btn sutra-outline-master-toggle-btn';
    btnToggle.setAttribute('aria-pressed', 'false');
    btnToggle.setAttribute(
      'title',
      '在「一次收合」與「一次展開」之間切換'
    );
    outlineMasterToggleBtn = btnToggle;
    syncOutlineMasterToggle();

    btnToggle.addEventListener('click', function () {
      setAllCollapsed(!isAllCollapsedGlobally());
    });

    modeGroup.appendChild(btnToggle);
    toolbar.appendChild(modeGroup);
    stickyHead.appendChild(toolbar);
    stickyHead.appendChild(breadcrumbEl);
    document.body.insertBefore(stickyHead, document.body.firstChild);

    requestAnimationFrame(function () {
      updateOutlineBreadcrumbFromScroll();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
