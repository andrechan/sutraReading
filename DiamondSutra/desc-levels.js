/**
 * Outline levels from (甲一)(乙一)… 天干 → 地支 → 千字文 順序。
 * Click .in_index: collapse/expand descendant D* blocks and/or this block’s
 * .in_sutra / .in_commentary (leaf levels with no sub-levels still toggle body).
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

  function init() {
    var blocks = collectOutlineBlocks();
    if (!blocks.length) return;

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

    function refreshOutlineUi() {
      applyVisibility(blocks, depths, nextPeer, collapsed);
      for (var t = 0; t < blocks.length; t++) {
        var meta = toggleMeta[t];
        if (!meta) continue;
        var on = !!collapsed[t];
        meta.indexNode.setAttribute('aria-expanded', on ? 'false' : 'true');
        meta.indexNode.classList.toggle('sutra-level-collapsed', on);
        if (meta.hasBody) {
          blocks[t].classList.toggle('sutra-outline-body-collapsed', on);
        }
      }
    }

    function setAllCollapsed(wantCollapsed) {
      for (var u = 0; u < blocks.length; u++) {
        if (toggleMeta[u]) collapsed[u] = wantCollapsed;
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

      toggleMeta[k] = { indexNode: indexEl, hasBody: body };
      indexEl.classList.add('sutra-level-toggle');
      indexEl.setAttribute('role', 'button');
      indexEl.setAttribute('tabindex', '0');
      indexEl.setAttribute('aria-expanded', 'true');
      indexEl.dataset.sutraOutlineIndex = String(k);

      (function (blockIndex) {
        function toggle(e) {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
          }
          collapsed[blockIndex] = !collapsed[blockIndex];
          refreshOutlineUi();
        }
        indexEl.addEventListener('click', toggle);
        indexEl.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') toggle(e);
        });
      })(k);
    }

    document.body.classList.add('sutra-outline-enabled');

    var toolbar = document.createElement('div');
    toolbar.className = 'sutra-outline-toolbar';
    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', '大綱收合');

    var btnCollapse = document.createElement('button');
    btnCollapse.type = 'button';
    btnCollapse.className = 'sutra-outline-toolbar-btn';
    btnCollapse.textContent = '全部收合';
    btnCollapse.addEventListener('click', function () {
      setAllCollapsed(true);
    });

    var btnExpand = document.createElement('button');
    btnExpand.type = 'button';
    btnExpand.className = 'sutra-outline-toolbar-btn';
    btnExpand.textContent = '全部展開';
    btnExpand.addEventListener('click', function () {
      setAllCollapsed(false);
    });

    toolbar.appendChild(btnCollapse);
    toolbar.appendChild(btnExpand);
    document.body.insertBefore(toolbar, document.body.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
