/* Хан Сарай - сцена зала, плиты, меню-стол, языки */
(function () {
  'use strict';
  var d = document, de = d.documentElement;
  de.classList.remove('no-js');
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G = window.gsap, ST = window.ScrollTrigger;
  var HAS = !!(G && ST);
  var VER = (function () { var s = d.currentScript && d.currentScript.src; var m = s && s.match(/[?&]v=([^&]+)/); return m ? m[1] : '1'; })();

  /* одна кривая на весь сайт: cubic-bezier(.2,.7,.2,1) */
  function bez(x1, y1, x2, y2) {
    return function (t) {
      if (t <= 0) return 0; if (t >= 1) return 1;
      var a = 0, b = 1, u = t;
      for (var i = 0; i < 18; i++) {
        u = (a + b) / 2;
        var x = 3 * u * (1 - u) * (1 - u) * x1 + 3 * u * u * (1 - u) * x2 + u * u * u;
        if (x < t) a = u; else b = u;
      }
      return 3 * u * (1 - u) * (1 - u) * y1 + 3 * u * u * (1 - u) * y2 + u * u * u;
    };
  }
  var E = bez(.2, .7, .2, 1);
  var T1 = .2, T2 = .4, T3 = 1, STG = .08;

  if (HAS) { G.registerPlugin(ST); if (window.SplitText) G.registerPlugin(window.SplitText); ST.config({ ignoreMobileResize: true }); }
  /* телефон: фото не всплывают при прокрутке (решение владельца 06.11.2026) */
  var MOB = window.matchMedia('(max-width:760px)').matches;

  /* ---------- плавная прокрутка ---------- */
  var lenis = null;
  if (HAS && !RM && window.Lenis) {
    lenis = new window.Lenis({ lerp: .1, smoothWheel: true });
    lenis.on('scroll', ST.update);
    G.ticker.add(function (t) { lenis.raf(t * 1000); });
    G.ticker.lagSmoothing(0);
  }
  function hdrH() { return $('#hdr').offsetHeight; }
  function goTo(el) {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -hdrH() + 1, duration: 1.2 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - hdrH() + 1, behavior: RM ? 'auto' : 'smooth' });
  }
  d.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var t = d.getElementById(id.slice(1));
    if (!t) return;
    e.preventDefault();
    closeMenu();
    goTo(t);
  });

  /* ---------- шапка и меню ---------- */
  var hdr = $('#hdr'), burger = $('#burger'), mbar = $('.mbar');
  var atForm = false;
  function onScroll() {
    var y = window.scrollY;
    hdr.classList.toggle('solid', y > 40);
    if (mbar) mbar.classList.toggle('show', y > window.innerHeight * .6 && !atForm);
  }
  /* на форме заявки панель прячется: она закрывала бы кнопку отправки */
  if ('IntersectionObserver' in window && $('#zayavka')) {
    new IntersectionObserver(function (en) { atForm = en[0].isIntersecting; onScroll(); }, { rootMargin: '0px 0px -20% 0px' }).observe($('#zayavka'));
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  function closeMenu() {
    if (!d.body.classList.contains('menu-open')) return;
    d.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.start();
  }
  burger.addEventListener('click', function () {
    var open = !d.body.classList.contains('menu-open');
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (lenis) { if (open) lenis.stop(); else lenis.start(); }
  });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ================================================================
     СЦЕНА ГЕРОЯ: банкетный зал золотой линией, свет включается
     ================================================================ */
  var hero = $('.hero'), pin = $('.hero-pin'), scene = $('#scene'), heroTxt = $('#heroTxt');
  var L = {
    back: $('.sc-back'), stage: $('.sc-stage'), floor: $('.sc-floor'),
    light: $('.sc-light'), lusters: $('.sc-lusters'), front: $('.sc-front')
  };
  var photo = $('#scPhoto');
  var geo = null, lit = false, ledTimer = null, ledIdx = 0;

  function f(n) { return Math.round(n * 10) / 10; }
  function P(dd, cls) { return '<path class="ln' + (cls ? ' ' + cls : '') + '" pathLength="1" d="' + dd + '"/>'; }
  function wave(x, y0, y1, a) {
    var h = (y1 - y0) / 2, s = '';
    s += 'M' + f(x) + ' ' + f(y0);
    for (var i = 0; i < 2; i++) {
      var ya = y0 + h * i;
      s += 'C' + f(x + a) + ' ' + f(ya + h * .28) + ' ' + f(x - a) + ' ' + f(ya + h * .72) + ' ' + f(x) + ' ' + f(ya + h);
    }
    return s;
  }

  function lusterSVG(w, chain) {
    var vw = 200, body = 150, vh = chain + body;
    var y0 = chain, s = '';
    s += '<svg viewBox="0 0 ' + vw + ' ' + vh + '" fill="none" stroke="currentColor" stroke-width="1.1">';
    s += P('M100 0V' + (y0 + 8));
    s += P('M86 ' + (y0 + 8) + 'h28l-4 8h-20z');
    /* ярусы */
    var tiers = [[y0 + 36, 44, 8, 9, 14], [y0 + 70, 74, 13, 13, 20], [y0 + 98, 52, 9, 9, 15]];
    s += P('M100 ' + (y0 + 16) + 'V' + (y0 + 104));
    s += P('M100 ' + (y0 + 24) + 'C72 ' + (y0 + 30) + ' 40 ' + (y0 + 44) + ' 28 ' + (y0 + 68));
    s += P('M100 ' + (y0 + 24) + 'C128 ' + (y0 + 30) + ' 160 ' + (y0 + 44) + ' 172 ' + (y0 + 68));
    var crys = '', sparks = '';
    tiers.forEach(function (t, ti) {
      var cy = t[0], rx = t[1], ry = t[2], n = t[3], dl = t[4];
      s += '<ellipse class="ln" pathLength="1" cx="100" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '"/>';
      for (var i = 0; i < n; i++) {
        var ang = Math.PI * (i + .5) / n; /* передняя половина */
        var x = 100 - Math.cos(ang) * rx, y = cy + Math.sin(ang) * ry;
        var len = dl * (.7 + .3 * Math.sin(ang));
        s += P('M' + f(x) + ' ' + f(y) + 'v' + f(len));
        var yy = y + len;
        crys += '<path class="ln crys" pathLength="1" d="M' + f(x) + ' ' + f(yy) + 'l3 5-3 6-3-6z"/>';
        if (i % 4 === ti % 2) sparks += '<path class="spark" d="M' + f(x) + ' ' + f(yy + 1) + 'l1.2 4.2 4.2 1.2-4.2 1.2-1.2 4.2-1.2-4.2-4.2-1.2 4.2-1.2z"/>';
      }
    });
    /* гирлянды хрусталя между ярусами */
    for (var g = 0; g < 6; g++) {
      var a1 = Math.PI * (g + .5) / 6, x1 = 100 - Math.cos(a1) * 44, y1 = y0 + 36 + Math.sin(a1) * 8;
      var x2 = 100 - Math.cos(a1) * 74, y2 = y0 + 70 + Math.sin(a1) * 13;
      s += '<path class="ln" pathLength="1" stroke-dasharray="1.5 3" d="M' + f(x1) + ' ' + f(y1) + 'Q' + f((x1 + x2) / 2) + ' ' + f(y2 + 8) + ' ' + f(x2) + ' ' + f(y2) + '"/>';
    }
    s += P('M84 ' + (y0 + 106) + 'L100 ' + (y0 + 142) + 'L116 ' + (y0 + 106));
    s += crys + sparks + '</svg>';
    return { svg: s, h: w * vh / vw };
  }

  function tableSVG(x, y, r, chairs, fill) {
    var s = '', ry = r * .28;
    /* стулья с овальной спинкой - за столом */
    for (var i = 0; i < chairs; i++) {
      var a = Math.PI * (1.08 + i * (.84 / (chairs - 1)));
      var cx = x + Math.cos(a) * r * 1.08, cy = y + Math.sin(a) * ry * 1.25 - r * .12;
      s += '<ellipse class="ln" pathLength="1" cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(r * .13) + '" ry="' + f(r * .2) + '"/>';
      s += '<ellipse class="ln" pathLength="1" cx="' + f(cx) + '" cy="' + f(cy) + '" rx="' + f(r * .09) + '" ry="' + f(r * .15) + '"/>';
    }
    /* скатерть */
    var hb = r * .62;
    s += '<path class="ln" pathLength="1" fill="' + fill + '" d="M' + f(x - r) + ' ' + f(y) +
      'C' + f(x - r * 1.04) + ' ' + f(y + hb * .5) + ' ' + f(x - r * 1.06) + ' ' + f(y + hb * .8) + ' ' + f(x - r * 1.05) + ' ' + f(y + hb) +
      'Q' + f(x) + ' ' + f(y + hb + ry * 1.2) + ' ' + f(x + r * 1.05) + ' ' + f(y + hb) +
      'C' + f(x + r * 1.06) + ' ' + f(y + hb * .8) + ' ' + f(x + r * 1.04) + ' ' + f(y + hb * .5) + ' ' + f(x + r) + ' ' + f(y) + 'Z"/>';
    for (var k = -2; k <= 2; k++) {
      var fx = x + k * r * .38;
      s += P('M' + f(fx) + ' ' + f(y + ry * .9 * Math.cos(k * .55)) + 'q' + f(r * .03) + ' ' + f(hb * .5) + ' 0 ' + f(hb * .95));
    }
    s += '<ellipse class="ln" pathLength="1" fill="' + fill + '" cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(r) + '" ry="' + f(ry) + '"/>';
    /* высокая стойка с цветами */
    s += P('M' + f(x) + ' ' + f(y - ry * .2) + 'V' + f(y - r * .95));
    s += P('M' + f(x - r * .1) + ' ' + f(y - ry * .1) + 'h' + f(r * .2));
    var fr = r * .2, fy = y - r * 1.08;
    s += '<circle class="ln" pathLength="1" cx="' + f(x) + '" cy="' + f(fy) + '" r="' + f(fr) + '"/>';
    s += '<circle class="ln" pathLength="1" cx="' + f(x - fr * .7) + '" cy="' + f(fy + fr * .4) + '" r="' + f(fr * .55) + '"/>';
    s += '<circle class="ln" pathLength="1" cx="' + f(x + fr * .75) + '" cy="' + f(fy + fr * .35) + '" r="' + f(fr * .5) + '"/>';
    return s;
  }

  function medallionSVG(cx, cy, rx, ry) {
    var k = ry / rx, s = '<g transform="translate(' + f(cx) + ' ' + f(cy) + ') scale(1 ' + k.toFixed(3) + ')">';
    s += '<circle class="ln" pathLength="1" r="' + f(rx) + '" vector-effect="non-scaling-stroke"/>';
    s += '<circle class="ln" pathLength="1" r="' + f(rx * .93) + '" stroke-dasharray=".004 .012" vector-effect="non-scaling-stroke"/>';
    s += '<circle class="ln" pathLength="1" r="' + f(rx * .6) + '" vector-effect="non-scaling-stroke"/>';
    s += '<circle class="ln" pathLength="1" r="' + f(rx * .12) + '" vector-effect="non-scaling-stroke"/>';
    var u = rx / 100;
    /* узор «рога» по кругу */
    for (var i = 0; i < 4; i++) {
      s += '<g transform="rotate(' + (i * 90) + ') scale(' + u.toFixed(3) + ')">';
      s += '<path class="ln" pathLength="1" vector-effect="non-scaling-stroke" d="M0 -14C10 -16 22 -26 22 -40C22 -52 10 -58 2 -52C-6 -46 -2 -36 6 -38M0 -14C-10 -16 -22 -26 -22 -40C-22 -52 -10 -58 -2 -52C6 -46 2 -36 -6 -38"/>';
      s += '<path class="ln" pathLength="1" vector-effect="non-scaling-stroke" d="M0 -62L8 -72L0 -84L-8 -72Z"/>';
      s += '</g>';
    }
    return s + '</g>';
  }

  function buildScene() {
    var W = pin.clientWidth, H = window.innerHeight;
    if (!W || !H) return;
    var mob = W < 761;
    var hdrB = hdrH();
    var pr = pin.getBoundingClientRect();
    var sub = $('.hero-sub').getBoundingClientRect();
    var mq = $('.marquee').offsetHeight;
    var PH = Math.max(pin.clientHeight, H);
    var fb = PH - mq;
    var tb = sub.bottom - pr.top;
    var minAvail = mob ? 110 : 200;
    var S0 = Math.min(tb + (mob ? 22 : 34), fb - minAvail);
    var avail = fb - S0;
    var floorY = S0 + avail * (mob ? .64 : .6);
    var wallH = floorY - S0;
    var cx = W / 2;
    var sw = mob ? W * .5 : Math.min(W * .36, wallH * 2.3);
    geo = { W: W, H: PH, mob: mob, S0: S0, floorY: floorY, fb: fb, sw: sw, cx: cx };

    var open = '<svg viewBox="0 0 ' + f(W) + ' ' + f(PH) + '" preserveAspectRatio="none" fill="none" stroke="currentColor" stroke-width="1">';

    /* --- дальний план: купол, стены, дымка --- */
    var b = open + '<defs><linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A1F2E" stop-opacity="0"/><stop offset=".7" stop-color="#2A1F2E" stop-opacity=".55"/><stop offset="1" stop-color="#3A2836" stop-opacity=".8"/></linearGradient></defs>';
    var domeY = -PH * .04;
    for (var i = 0; i < 5; i++) {
      var rx = W * ((mob ? .9 : .64) - i * (mob ? .12 : .095)), ry = PH * ((mob ? .2 : .38) - i * (mob ? .028 : .058));
      b += '<path class="ln" pathLength="1"' + (i === 2 ? ' stroke-dasharray=".006 .01"' : '') + ' d="M' + f(cx - rx) + ' ' + f(domeY) + 'A' + f(rx) + ' ' + f(ry) + ' 0 0 0 ' + f(cx + rx) + ' ' + f(domeY) + '"/>';
    }
    b += '<circle class="ln" pathLength="1" cx="' + f(cx) + '" cy="0" r="' + f(W * (mob ? .1 : .055)) + '"/>';
    b += '<circle class="ln" pathLength="1" cx="' + f(cx) + '" cy="0" r="' + f(W * (mob ? .065 : .036)) + '" stroke-dasharray=".01 .02"/>';
    /* стены с арочными панелями */
    var np = mob ? 1 : 3, pw = mob ? W * .1 : W * .052, gap = W * .012;
    var pTop = mob ? S0 - 40 : PH * .3;
    for (var side = -1; side <= 1; side += 2) {
      for (var k = 0; k < np; k++) {
        var x0 = side < 0 ? W * .018 + k * (pw + gap) : W - W * .018 - (k + 1) * pw - k * gap;
        var yb = floorY, yt = pTop + k * (mob ? 0 : 10);
        b += P('M' + f(x0) + ' ' + f(yb) + 'V' + f(yt + pw / 2) + 'A' + f(pw / 2) + ' ' + f(pw / 2) + ' 0 0 1 ' + f(x0 + pw) + ' ' + f(yt + pw / 2) + 'V' + f(yb));
        b += P('M' + f(x0 + 6) + ' ' + f(yb - 6) + 'V' + f(yt + pw / 2 + 4) + 'A' + f(pw / 2 - 6) + ' ' + f(pw / 2 - 6) + ' 0 0 1 ' + f(x0 + pw - 6) + ' ' + f(yt + pw / 2 + 4) + 'V' + f(yb - 6));
      }
    }
    b += P('M0 ' + f(floorY) + 'H' + f(W));
    b += '<rect x="0" y="' + f(S0 - 40) + '" width="' + f(W) + '" height="' + f(fb - S0 + 40) + '" fill="url(#haze)" stroke="none"/>';
    b += '</svg>';
    L.back.innerHTML = b;

    /* --- сцена: стена с волнами, HS, президиум, ферма, LED --- */
    var s = open + '<defs>' +
      '<linearGradient id="ledOff" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1A1420"/><stop offset="1" stop-color="#2A1F2E"/></linearGradient>' +
      '<linearGradient id="ledOn" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3A2038"/><stop offset=".55" stop-color="#7A4565"/><stop offset="1" stop-color="#C08F8F"/></linearGradient>' +
      '<radialGradient id="wallG" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="#5A4030" stop-opacity=".55"/><stop offset="1" stop-color="#2A1F2E" stop-opacity="0"/></radialGradient>' +
      '</defs>';
    var x0w = cx - sw / 2, x1w = cx + sw / 2;
    s += '<path class="ln" pathLength="1" fill="url(#wallG)" d="M' + f(x0w) + ' ' + f(floorY) + 'V' + f(S0 + 10) + 'Q' + f(cx) + ' ' + f(S0 - wallH * .12) + ' ' + f(x1w) + ' ' + f(S0 + 10) + 'V' + f(floorY) + '"/>';
    var runs = '';
    for (var sd = -1; sd <= 1; sd += 2) {
      for (var q = 0; q < 3; q++) {
        var xo = cx + sd * sw * (.16 + q * .13), wpw = sw * .05, a = sd * sw * .04;
        var yA = S0 + 4 + q * wallH * .04;
        s += P(wave(xo, yA, floorY, a));
        s += P(wave(xo + sd * wpw, yA + 6, floorY, a));
        runs += '<path class="wave-run" pathLength="1" style="animation-delay:' + (-q * .9 - (sd > 0 ? .45 : 0)).toFixed(2) + 's" d="' + wave(xo, yA, floorY, a) + '"/>';
      }
    }
    s += runs;
    var fs = wallH * (mob ? .3 : .28);
    s += '<text class="hs-mono sc-fade" stroke="none" x="' + f(cx - fs * .34) + '" y="' + f(S0 + wallH * .45) + '" font-size="' + f(fs) + '" text-anchor="middle">H</text>';
    s += '<text class="hs-mono sc-fade" stroke="none" x="' + f(cx + fs * .32) + '" y="' + f(S0 + wallH * .45 + fs * .28) + '" font-size="' + f(fs) + '" text-anchor="middle">S</text>';
    /* президиум */
    var pt = floorY - wallH * .2, pwid = sw * .22;
    for (var c = 0; c < 4; c++) {
      var chx = cx - pwid * .75 + c * pwid * .5;
      s += P('M' + f(chx - wallH * .05) + ' ' + f(pt) + 'V' + f(pt - wallH * .1) + 'a' + f(wallH * .05) + ' ' + f(wallH * .05) + ' 0 0 1 ' + f(wallH * .1) + ' 0V' + f(pt));
    }
    s += '<rect class="ln" pathLength="1" x="' + f(cx - pwid) + '" y="' + f(pt) + '" width="' + f(pwid * 2) + '" height="' + f(floorY - pt - 3) + '" fill="#160F19"/>';
    for (var v = 1; v < 10; v++) s += P('M' + f(cx - pwid + v * pwid * .2) + ' ' + f(pt + 3) + 'V' + f(floorY - 5));
    /* подиум */
    var st = mob ? 7 : 12;
    s += '<path class="ln" pathLength="1" fill="#1A1219" d="M' + f(cx - sw * .62) + ' ' + f(floorY) + 'H' + f(cx + sw * .62) + 'L' + f(cx + sw * .68) + ' ' + f(floorY + st) + 'H' + f(cx - sw * .68) + 'Z"/>';
    /* ферма со светом */
    var ty = S0 - (mob ? 6 : 14), tx0 = cx - sw * .56, tx1 = cx + sw * .56, th = mob ? 5 : 8;
    s += P('M' + f(tx0) + ' ' + f(ty) + 'H' + f(tx1));
    s += P('M' + f(tx0) + ' ' + f(ty + th) + 'H' + f(tx1));
    var zz = 'M' + f(tx0) + ' ' + f(ty);
    var nz = Math.round((tx1 - tx0) / (th * 1.6));
    for (var z = 1; z <= nz; z++) zz += 'L' + f(tx0 + z * (tx1 - tx0) / nz) + ' ' + f(z % 2 ? ty + th : ty);
    s += P(zz);
    var spots = [];
    for (var sp = 0; sp < 7; sp++) {
      var spx = tx0 + (tx1 - tx0) * (.08 + sp * .14);
      spots.push(spx);
      s += '<circle class="ln" pathLength="1" cx="' + f(spx) + '" cy="' + f(ty + th + 5) + '" r="' + (mob ? 2.5 : 4) + '"/>';
    }
    /* LED-экраны */
    var lw, lh, lgap = mob ? 8 : W * .028;
    lw = mob ? Math.min((W - sw) / 2 - 16, 120) : Math.min(sw * .5, W / 2 - sw / 2 - lgap - W * .2, 240);
    lw = Math.max(lw, 60);
    lh = lw * .58;
    var ly = S0 + wallH * (mob ? .08 : .1);
    [cx - sw / 2 - lgap - lw, cx + sw / 2 + lgap].forEach(function (lx, li) {
      s += P('M' + f(lx + lw * .2) + ' ' + f(ly + lh) + 'V' + f(floorY) + 'M' + f(lx + lw * .8) + ' ' + f(ly + lh) + 'V' + f(floorY));
      s += '<rect x="' + f(lx) + '" y="' + f(ly) + '" width="' + f(lw) + '" height="' + f(lh) + '" class="led-scr" stroke="none"/>';
      s += '<rect x="' + f(lx) + '" y="' + f(ly) + '" width="' + f(lw) + '" height="' + f(lh) + '" class="led-on" fill="url(#ledOn)" stroke="none"/>';
      s += '<rect class="ln" pathLength="1" x="' + f(lx - 3) + '" y="' + f(ly - 3) + '" width="' + f(lw + 6) + '" height="' + f(lh + 6) + '" rx="2"/>';
      s += '<text class="led-txt" stroke="none" data-w="' + f(lw) + '" data-h="' + f(lh) + '" x="' + f(lx + lw / 2) + '" y="' + f(ly + lh / 2) + '"></text>';
    });
    s += '</svg>';
    L.stage.innerHTML = s;

    /* --- пол: перспектива мрамора и медальон --- */
    var fl = open;
    var vpY = S0 - wallH * 1.4;
    for (var t = -9; t <= 9; t++) {
      var xb = cx + t * W * (mob ? .2 : .11);
      var k1 = (floorY - vpY) / (PH - vpY);
      var xs = cx + (xb - cx) * k1;
      fl += '<path class="ln" pathLength="1" stroke-opacity=".35" d="M' + f(xs) + ' ' + f(floorY) + 'L' + f(xb) + ' ' + f(PH) + '"/>';
    }
    for (var hz = 1; hz <= 4; hz++) {
      var yy = floorY + (PH - floorY) * Math.pow(hz / 4.5, 1.6);
      fl += '<path class="ln" pathLength="1" stroke-opacity=".25" d="M0 ' + f(yy) + 'H' + f(W) + '"/>';
    }
    var my = floorY + (fb - floorY) * (mob ? .5 : .55);
    var mrx = mob ? W * .36 : Math.min(W * .19, 300), mry = mrx * (mob ? .2 : .17);
    fl += medallionSVG(cx, my, mrx, mry);
    fl += '</svg>';
    L.floor.innerHTML = fl;

    /* --- ближний план: круглые столы --- */
    var fr = open, cloth = '#140E17';
    if (mob) {
      fr += tableSVG(W * .02, fb - 18, W * .2, 5, cloth);
      fr += tableSVG(W * .98, fb - 18, W * .2, 5, cloth);
    } else {
      fr += tableSVG(W * .265, floorY + (fb - floorY) * .32, W * .036, 6, cloth);
      fr += tableSVG(W * .735, floorY + (fb - floorY) * .32, W * .036, 6, cloth);
      fr += tableSVG(W * .085, fb - 22, W * .075, 7, cloth);
      fr += tableSVG(W * .915, fb - 22, W * .075, 7, cloth);
    }
    fr += '</svg>';
    L.front.innerHTML = fr;

    /* --- свет --- */
    var li2 = '';
    li2 += '<i class="glow glow-stage" style="left:' + f(cx) + 'px;top:' + f(S0 + wallH * .5) + 'px;width:' + f(sw * 1.9) + 'px;height:' + f(wallH * 2.2) + 'px"></i>';
    li2 += '<i class="glow glow-floor" style="left:' + f(cx) + 'px;top:' + f(my) + 'px;width:' + f(mrx * 2.6) + 'px;height:' + f(mry * 3.4) + 'px"></i>';
    spots.forEach(function (spx, n) {
      var ch = floorY - ty, cw = ch * .55;
      li2 += '<i class="cone" style="left:' + f(spx - cw / 2) + 'px;top:' + f(ty + th + 5) + 'px;width:' + f(cw) + 'px;height:' + f(ch) + 'px;transform:rotate(' + ((n - 3) * -4) + 'deg)"></i>';
    });
    L.light.innerHTML = li2;

    /* --- люстры (каждая отдельным слоем) --- */
    var lus = mob
      ? [[W * .13, W * .2, hdrB * .9], [cx, W * .24, hdrB * 1.0], [W * .87, W * .2, hdrB * .9]]
      : [[W * .125, Math.min(W * .13, 210), PH * .2], [cx, Math.min(W * .085, 130), 0], [W * .875, Math.min(W * .13, 210), PH * .2]];
    var txtTop = heroTxt.offsetTop;
    var showCenter = mob || (txtTop - 12 - lus[1][1] * .75 >= hdrB * .85);
    var lh2 = '';
    lus.forEach(function (u, n) {
      if (n === 1 && !showCenter) return;
      var chain = n === 1 && !mob ? Math.max(10, txtTop - 12 - u[1] * .75) : u[2];
      /* на телефоне люстра не опускается на текст: низ подвески выше кикера */
      if (mob) chain = Math.max(8, Math.min(chain, txtTop - 10 - u[1] * .75));
      var cw = u[1], ls = lusterSVG(cw, chain * 200 / cw);
      lh2 += '<div class="luster" style="left:' + f(u[0] - cw / 2) + 'px;top:0;width:' + f(cw) + 'px;height:' + f(ls.h) + 'px"><i class="lu-glow"></i>' + ls.svg + '</div>';
    });
    L.lusters.innerHTML = lh2;
    if (lit) $$('.luster', L.lusters).forEach(function (el) { el.classList.add('on'); });

    /* --- окно с фото --- */
    var areaTop = hdrB + 16, areaBot = fb - 16;
    var pwPx, phPx;
    if (mob) { pwPx = Math.min(W * .84, (areaBot - areaTop) * 9 / 14); phPx = pwPx * 14 / 9; }
    else { pwPx = Math.min(W * .6, (areaBot - areaTop) * 16 / 9); phPx = pwPx * 9 / 16; }
    var pyPx = areaTop + (areaBot - areaTop) / 2;
    photo.style.setProperty('--pw', f(pwPx) + 'px');
    photo.style.setProperty('--py', f(pyPx) + 'px');
    geo.photo = { w: pwPx, h: phPx, y: pyPx, stageY: S0 + wallH * .5 };

    setLed(true);
    if (!RM) {
      scene.classList.remove('drawn');
      void scene.offsetWidth;
      requestAnimationFrame(function () { requestAnimationFrame(function () { scene.classList.add('drawn'); }); });
    } else scene.classList.add('drawn');
  }

  function ledWords() { return $$('.led-words li').map(function (li) { return li.textContent.trim(); }); }
  function setLed(instant) {
    var words = ledWords(), w = words[ledIdx % words.length];
    $$('.led-txt', L.stage).forEach(function (t) {
      var lw = +t.dataset.w, lh = +t.dataset.h;
      var fsz = Math.min(lh * .3, lw * .86 / (w.length * .56));
      if (instant) { t.textContent = w; t.setAttribute('font-size', fsz.toFixed(1)); t.classList.add('show'); return; }
      t.classList.remove('show');
      setTimeout(function () { t.textContent = w; t.setAttribute('font-size', fsz.toFixed(1)); t.classList.add('show'); }, 520);
    });
  }
  function lightOn() {
    if (lit) return; lit = true;
    scene.classList.add('lit');
    hero.classList.add('lit-done');
    var ls = $$('.luster', L.lusters);
    var order = ls.length === 3 ? [0, 2, 1] : [0, 1];
    order.forEach(function (i, n) { if (ls[i]) setTimeout(function () { ls[i].classList.add('on'); }, RM ? 0 : 260 * n); });
    if (!ledTimer) ledTimer = setInterval(function () {
      if (scene.classList.contains('paused')) return;
      ledIdx++; setLed(false);
    }, 2800);
  }
  $('#lightBtn').addEventListener('click', lightOn);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      var off = !en[0].isIntersecting;
      scene.classList.toggle('paused', off); pin.classList.toggle('paused', off);
    }).observe(pin);
    var medal = $('.medal');
    if (medal) new IntersectionObserver(function (en) { medal.classList.toggle('paused', !en[0].isIntersecting); }).observe(medal);
  }

  /* ---------- сборка героя и сценарий прокрутки ---------- */
  var heroTl = null, spacer = null;
  function heroScroll() {
    if (!HAS || RM) return;
    if (!spacer) { spacer = d.createElement('div'); spacer.className = 'hero-space'; hero.appendChild(spacer); }
    pin.style.position = 'sticky'; pin.style.top = '0px';
    var vh = window.innerHeight;
    var pinH = pin.offsetHeight;
    if (pinH > vh) pin.style.top = (vh - pinH) + 'px';
    hero.style.height = 'auto';
    spacer.style.height = (vh * 2.1) + 'px';
    $('.plates').style.marginTop = (-vh) + 'px';
    if (heroTl) { heroTl.scrollTrigger && heroTl.scrollTrigger.kill(); heroTl.kill(); }
    var g = geo.photo, sc = Math.min(.9, (geo.sw * 1.05) / g.w), dy = g.stageY - g.y;
    G.set(photo, { xPercent: -50, yPercent: -50, x: 0, y: dy, scale: sc, autoAlpha: 0 });
    G.set([heroTxt, L.stage, L.floor, L.front, L.lusters, L.back, L.light], { clearProps: 'transform,opacity' });
    heroTl = G.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: hero, start: 'top top', end: function () { return '+=' + window.innerHeight * 1.1; }, scrub: .6,
        onUpdate: function (self) { if (self.progress > .02) lightOn(); }
      }
    });
    heroTl
      .to(heroTxt, { y: -90, autoAlpha: 0, duration: .35 }, 0)
      .to(photo, { autoAlpha: 1, duration: .25 }, .18)
      .to(photo, { y: 0, scale: 1, duration: .62, ease: E }, .18)
      .to([L.stage, L.floor], { opacity: .1, duration: .5 }, .2)
      .to(L.light, { opacity: .55, duration: .5 }, .3)
      .to(L.lusters, { y: -window.innerHeight * .06, duration: 1 }, 0)
      .to(L.front, { y: window.innerHeight * .14, opacity: .35, duration: 1 }, 0)
      .to(L.back, { scale: 1.07, duration: 1 }, 0);
    /* уход героя под первую плиту */
    var dim = $('.hero-dim') || (function () { var i = d.createElement('i'); i.className = 'plate-dim hero-dim'; pin.appendChild(i); return i; })();
    G.timeline({ scrollTrigger: { trigger: '.plates', start: 'top bottom', end: 'top top', scrub: .5 } })
      .to(dim, { opacity: .7, ease: 'none' }, 0)
      .fromTo(scene, { scale: 1 }, { scale: .94, ease: 'none', immediateRender: false }, 0);
  }

  /* мышь двигает планы сцены (только десктоп) */
  if (HAS && !RM && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    var qs = $$('.sc-layer').map(function (el) {
      var dep = +el.dataset.depth || .3;
      return { x: G.quickTo(el, 'x', { duration: 1.2, ease: E }), dep: dep };
    });
    pin.addEventListener('pointermove', function (e) {
      var nx = e.clientX / window.innerWidth - .5;
      qs.forEach(function (q) { q.x(-nx * 26 * q.dep); });
    });
  }

  /* ---------- вступление героя ---------- */
  function heroIntro() {
    if (!HAS || RM) { return; }
    /* пришли по якорю или страница уже прокручена - интро не показываем */
    if (location.hash.length > 1 || window.scrollY > 80) return;
    var parts = [$('.kicker', heroTxt), $('.h1-b', heroTxt), $('.lead', heroTxt), $('.cta2', heroTxt), $('.hero-sub', heroTxt)];
    /* лид и кнопки не прячем: только сдвиг, текст виден с первого кадра (LCP) */
    var tl = G.timeline({ defaults: { ease: E } });
    var h1a = $('.h1-a', heroTxt);
    if (window.SplitText) {
      /* имя заголовка целиком - на h1 (span не может нести aria-label), буквы без aria */
      var h1 = $('.h1', heroTxt);
      h1.setAttribute('aria-label', h1.textContent.replace(/\s+/g, ' ').trim());
      var sp = new window.SplitText(h1a, { type: 'chars', aria: 'none' });
      splits.push(sp);
      tl.from(sp.chars, { yPercent: 60, autoAlpha: 0, duration: T3, stagger: .035 }, .2);
    } else tl.from(h1a, { y: 30, autoAlpha: 0, duration: T3 }, .2);
    tl.from(parts, { y: 22, duration: .8, stagger: STG }, .2);
  }

  /* ================================================================
     ПЛИТЫ
     ================================================================ */
  var plates = $$('.plate');
  function plateFit() {
    plates.forEach(function (p) {
      p.style.top = '0px';
      var h = p.offsetHeight, vh = window.innerHeight;
      if (h > vh) p.style.top = (vh - h) + 'px';
    });
  }
  function platesInit() {
    plates.forEach(function (p, i) {
      var inner = $('.plate-in', p);
      var dim = d.createElement('i'); dim.className = 'plate-dim'; inner.appendChild(dim);
      if (!HAS || RM) return;
      var next = plates[i + 1] || $('#events');
      G.timeline({ scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: .5 } })
        .to(inner, { scale: .93, ease: 'none' }, 0)
        .to(dim, { opacity: .6, ease: 'none' }, 0);
    });
  }

  /* ---------- «лампа»: кадр входит тёмным и загорается сверху ---------- */
  function lamps() {
    $$('.lamp').forEach(function (fig) {
      var sh = $('.shade', fig), gl = $('.glint', fig), pend = $('.pend', fig), img = $('img', fig);
      if (!HAS || RM || MOB) { if (sh) sh.style.display = 'none'; if (gl) gl.style.display = 'none'; return; }
      var tl = G.timeline({ paused: true, defaults: { ease: E } });
      if (pend) {
        tl.from(pend, { y: -50, autoAlpha: 0, duration: .7 })
          .add(function () { pend.classList.add('flash'); }, '-=.15');
      }
      if (sh) tl.fromTo(sh, { scale: 1, opacity: 1 }, { scale: 3.6, opacity: 0, duration: 1.5 }, pend ? '-=.1' : 0);
      if (img) tl.fromTo(img, { scale: 1.08 }, { scale: 1, duration: 1.8 }, '<');
      if (gl) tl.fromTo(gl, { xPercent: -130 }, { xPercent: 130, duration: 1.1, ease: 'power1.inOut' }, '-=1.1');
      ST.create({ trigger: fig, start: 'top 80%', once: true, onEnter: function () { tl.play(); } });
    });
  }

  /* ---------- появление блоков и заголовков ---------- */
  var splits = [];
  function reveals() {
    if (!HAS || RM) return;
    var items = $$('.head .kicker, .head .lead, .split-txt > *:not(h2), .arch-card, .steps li, .rules, .offer, .num, .kt-txt > *, .halls-txt > *, .vip-head, .vip-card, .sk-foot > *, .form, .ct-info, .det figcaption, .tb-count, .lists-col');
    if (MOB) items = items.filter(function (el) { return !el.matches('.arch-card, .vip-card') && !el.querySelector('img'); });
    items.forEach(function (el) { el.classList.add('rv'); });
    ST.batch(items, {
      start: 'top 88%', once: true,
      onEnter: function (b) { G.to(b, { y: 0, autoAlpha: 1, duration: .9, ease: E, stagger: STG, overwrite: true }); }
    });
    if (window.SplitText) {
      $$('.h2, .h3').forEach(function (h) {
        var sp = new window.SplitText(h, { type: 'words,lines', mask: 'lines' });
        splits.push(sp);
        G.from(sp.words, { yPercent: 110, duration: T3, ease: E, stagger: .03, scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
      });
    }
    /* шаги: линия прорисовывается */
    var steps = $('.steps');
    if (steps) G.fromTo(steps, { '--line': 0 }, { '--line': 1, ease: 'none', scrollTrigger: { trigger: steps, start: 'top 80%', end: 'bottom 60%', scrub: .5 } });
    /* кухня: тарелки ложатся вокруг главного кадра */
    var dishes = $$('.kt-dish');
    if (dishes.length && !MOB) {
      G.from(dishes, { scale: .4, rotation: -50, autoAlpha: 0, duration: T3, ease: E, stagger: .1, scrollTrigger: { trigger: '#kitchen', start: 'top 70%', once: true } });
      dishes.forEach(function (el, i) {
        G.to(el, { y: (i % 2 ? -1 : 1) * (30 + i * 8), ease: 'none', scrollTrigger: { trigger: '#kitchen', start: 'top bottom', end: 'bottom top', scrub: .8 } });
      });
    }
    /* значки предложений прорисовываются */
    $$('.of-ic').forEach(function (svg) {
      var paths = $$('path,circle', svg);
      paths.forEach(function (p) { p.setAttribute('pathLength', '1'); p.style.strokeDasharray = '1'; p.style.strokeDashoffset = '1'; });
      G.to(paths, { strokeDashoffset: 0, duration: 1.6, ease: E, stagger: .06, scrollTrigger: { trigger: svg, start: 'top 85%', once: true } });
    });
    /* цифры считают; глифы цифр Prata прогреваем заранее, иначе на старте счётчиков рывок растеризации */
    var nb = $('#about');
    if (nb) { var wm = d.createElement('span'); wm.className = 'glyph-warm'; wm.setAttribute('aria-hidden', 'true'); wm.textContent = '0123456789'; nb.appendChild(wm); }
    $$('.cnt').forEach(function (el) {
      var to = +el.dataset.to, o = { v: 0 };
      G.to(o, {
        v: to, duration: 1.8, ease: E, scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: function () { var v = Math.round(o.v); if (v !== el._v) { el._v = v; el.textContent = fmt(v); } }
      });
    });
  }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

  /* ---------- медальон в блоке «О нас», места стола «Ас» ---------- */
  (function () {
    var g = $('.medal-orn'); if (g) {
      var s = '';
      for (var i = 0; i < 8; i++) s += '<g transform="rotate(' + (i * 45) + ' 400 400)"><path d="M400 280c22-4 46-24 46-52s-24-40-40-30-8 30 8 26M400 280c-22-4-46-24-46-52s24-40 40-30 8 30-8 26"/><path d="M400 150l10 14-10 14-10-14z"/></g>';
      g.innerHTML = s;
    }
    var seats = $('.as-seats'); if (seats) {
      var t = '';
      for (var k = 0; k < 13; k++) {
        var a = -Math.PI / 2 + k * 2 * Math.PI / 13;
        t += '<circle cx="' + f(150 + Math.cos(a) * 92) + '" cy="' + f(104 + Math.sin(a) * 60) + '" r="7"/>';
      }
      seats.innerHTML = t;
    }
  })();

  /* ================================================================
     МЕНЮ: стол на 12 персон, уровень меняет состав
     ================================================================ */
  var LV = {
    b1: { seats: 12, sal: 3, cold: 3, hot: 2, bake: ['samsa', 'bread', 'tea'], bakeN: 4, drinks: [], price: '16 500' },
    b2: { seats: 12, sal: 4, cold: 4, hot: 2, bake: ['samsa', 'bread', 'sweet', 'cake', 'tea', 'jug'], bakeN: 7, drinks: [], price: '19 500' },
    b3: { seats: 12, sal: 5, cold: 4, hot: 3, bake: ['samsa', 'bread', 'sweet', 'cake', 'tea', 'citrus'], bakeN: 7, drinks: [], price: '22 000' },
    b4: { seats: 12, sal: 5, cold: 5, hot: 2, bake: ['samsa', 'bread', 'sweet', 'cake', 'tea'], bakeN: 6, drinks: ['jug', 'bottle', 'bottle'], price: '24 000' },
    b5: { seats: 12, sal: 5, cold: 5, hot: 4, bake: ['samsa', 'bread', 'sweet', 'cake', 'tea', 'citrus'], bakeN: 10, drinks: ['glass', 'bottle', 'glass', 'jug'], price: '29 000' },
    a1: { seats: 13, sal: 2, cold: 2, hot: 1, bake: ['samsa', 'bread', 'bread', 'tea'], bakeN: 6, drinks: [], price: '7 000 / 9 500', as: true },
    a2: { seats: 13, sal: 3, cold: 2, hot: 1, bake: ['samsa', 'bread', 'kurt', 'sweet', 'tea', 'jug'], bakeN: 14, drinks: [], price: '9 000 / 12 000', as: true }
  };
  var HOTN = { b1: 2, b2: 2, b3: 2, b4: 2, b5: 2 };
  var SAL = ['47', '50'], COLD = ['44', '46', '49', '51', '52'];
  var table = $('#table'), tbSvg = $('.tb-svg'), tbD = $('.tb-dishes');
  var curLv = 'b1', seatsDrawn = 0;

  function drawCloth(n) {
    if (seatsDrawn === n) return; seatsDrawn = n;
    var s = '<defs><radialGradient id="cloth" cx=".5" cy=".45" r=".55"><stop offset="0" stop-color="#FFFDF8"/><stop offset=".8" stop-color="#F3EADB"/><stop offset="1" stop-color="#E6D8BF"/></radialGradient>' +
      '<radialGradient id="chairG" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#FFFDF8"/><stop offset="1" stop-color="#E8DCC6"/></radialGradient></defs>';
    for (var i = 0; i < n; i++) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / n + Math.PI / n;
      var x = 500 + Math.cos(a) * 470, y = 500 + Math.sin(a) * 470, deg = a * 180 / Math.PI + 90;
      s += '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(deg) + ')"><ellipse rx="44" ry="30" fill="url(#chairG)" stroke="#C9A55C" stroke-width="3"/><ellipse rx="34" ry="21" fill="none" stroke="#C9A55C" stroke-width="1.2"/></g>';
    }
    s += '<circle cx="500" cy="500" r="432" fill="url(#cloth)" stroke="#D8B46A" stroke-width="3"/>';
    s += '<circle cx="500" cy="500" r="416" fill="none" stroke="#C9A55C" stroke-width="1" stroke-dasharray="3 7" opacity=".7"/>';
    for (var j = 0; j < n; j++) {
      var b = -Math.PI / 2 + j * 2 * Math.PI / n + Math.PI / n;
      var px = 500 + Math.cos(b) * 372, py = 500 + Math.sin(b) * 372, dg = b * 180 / Math.PI + 90;
      s += '<g transform="translate(' + f(px) + ' ' + f(py) + ') rotate(' + f(dg) + ')" fill="none" stroke="#B8914A" stroke-width="1.6">' +
        '<circle r="34" fill="#FFFDF8"/><circle r="24"/><path d="M-46 -20v40M-50 -20v12M-42 -20v12M46 -20v40" stroke-linecap="round"/>' +
        '<path d="M14 -46l6 -10" stroke-width="1.2"/></g>';
    }
    tbSvg.innerHTML = s;
  }

  function dishEl(kind, val, x, y, size) {
    var el = d.createElement('div');
    el.className = 'dish' + (kind === 'photo' ? '' : ' drawn');
    el.style.setProperty('--x', x + '%'); el.style.setProperty('--y', y + '%'); el.style.setProperty('--s', size + '%');
    if (kind === 'photo') el.innerHTML = '<img src="assets/photos/dish-' + val + '.webp" width="260" height="260" alt="" loading="lazy" decoding="async">';
    else el.innerHTML = '<svg class="ic"><use href="#d-' + val + '"/></svg>';
    return el;
  }

  function serve(lv, animate) {
    var c = LV[lv]; if (!c) return;
    curLv = lv;
    var outer = [], inner = [];
    var i;
    for (i = 0; i < c.sal; i++) outer.push(['photo', SAL[i % SAL.length]]);
    for (i = 0; i < c.cold; i++) outer.push(['photo', COLD[i % COLD.length]]);
    for (i = 0; i < c.hot; i++) inner.push(['icon', 'hot']);
    c.bake.forEach(function (b) { inner.push(['icon', b]); });
    c.drinks.forEach(function (b) { inner.push(['icon', b]); });

    var build = function () {
      drawCloth(c.seats);
      tbD.innerHTML = '';
      var nodes = [];
      var so = outer.length <= 6 ? 15 : outer.length <= 8 ? 13.5 : 12;
      outer.forEach(function (o, k) {
        var a = -Math.PI / 2 + k * 2 * Math.PI / outer.length;
        var el = dishEl(o[0], o[1], 50 + Math.cos(a) * 28.5, 50 + Math.sin(a) * 28.5, so);
        tbD.appendChild(el); nodes.push(el);
      });
      var si = Math.min(8.6, (2 * Math.PI * 16.8) / inner.length - .9);
      inner.forEach(function (o, k) {
        var a = -Math.PI / 2 + Math.PI / inner.length + k * 2 * Math.PI / inner.length;
        var el = dishEl(o[0], o[1], 50 + Math.cos(a) * 16.8, 50 + Math.sin(a) * 16.8, si);
        tbD.appendChild(el); nodes.push(el);
      });
      if (HAS && !RM && animate) {
        G.from(nodes, { scale: .3, autoAlpha: 0, y: -24, duration: .6, ease: E, stagger: .045 });
        G.fromTo('.tb-center', { scale: .8 }, { scale: 1, duration: .6, ease: E });
      }
    };
    var old = $$('.dish', tbD);
    if (HAS && !RM && animate && old.length) {
      G.to(old, { scale: .6, autoAlpha: 0, duration: T1, ease: 'power1.in', stagger: .012, onComplete: build });
    } else build();

    /* счётчик */
    var cnt = { sal: c.sal, cold: c.cold, hot: lv.charAt(0) === 'b' ? HOTN[lv] : c.hot, bake: c.bakeN };
    $$('#tbCount b').forEach(function (b) { b.textContent = cnt[b.dataset.c]; });
    /* списки */
    $$('.mlist').forEach(function (m) {
      var on = m.dataset.lv === lv;
      if (on && m.hidden) {
        m.hidden = false;
        if (HAS && !RM && animate) G.from(m, { autoAlpha: 0, y: 14, duration: T2, ease: E });
      } else if (!on) m.hidden = true;
    });
    $$('.lv').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.lv === lv ? 'true' : 'false'); });
    /* WhatsApp с выбранным уровнем */
    var msg = c.as
      ? 'Здравствуйте! Пришлите, пожалуйста, меню «Ас» на ' + c.price + ' тг на гостя.\nДата:\nЧисло гостей:'
      : 'Здравствуйте! Пришлите, пожалуйста, банкетное меню на ' + c.price + ' тг на гостя.\nДата:\nЧисло гостей:';
    $('#menuWa').href = 'https://wa.me/77079510510?text=' + encodeURIComponent(msg);
  }
  $$('.lv').forEach(function (b) { b.addEventListener('click', function () { if (b.dataset.lv !== curLv) serve(b.dataset.lv, true); }); });
  $$('.mtab').forEach(function (t) {
    t.addEventListener('click', function () {
      var tab = t.dataset.tab;
      $$('.mtab').forEach(function (x) { x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
      $$('.lv-set').forEach(function (s) { s.hidden = s.dataset.set !== tab; });
      serve(tab === 'as' ? 'a1' : 'b1', true);
    });
  });
  serve('b1', false);
  /* первая подача - когда стол виден */
  if (HAS && !RM && !MOB) ST.create({ trigger: table, start: 'top 75%', once: true, onEnter: function () { serve(curLv, true); } });

  /* ---------- лента VIP: стрелки ---------- */
  (function () {
    var tr = $('.vip-track'); if (!tr) return;
    var btns = $$('.vip .arr');
    function step() { var c = $('.vip-card', tr); return c ? c.getBoundingClientRect().width + 20 : 400; }
    function upd() {
      var max = tr.scrollWidth - tr.clientWidth - 2;
      btns.forEach(function (b) {
        b.hidden = max <= 0;
        b.disabled = b.dataset.dir < 0 ? tr.scrollLeft <= 2 : tr.scrollLeft >= max;
      });
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { tr.scrollBy({ left: step() * b.dataset.dir, behavior: RM ? 'auto' : 'smooth' }); }); });
    tr.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  })();

  /* ---------- форма -> WhatsApp ---------- */
  (function () {
    var form = $('#zayavka'); if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name, phone = form.elements.phone;
      var ok = true;
      [name, phone].forEach(function (el) { el.classList.remove('err'); });
      if (!name.value.trim()) { name.classList.add('err'); ok = false; }
      if (phone.value.replace(/\D/g, '').length < 10) { phone.classList.add('err'); ok = false; }
      if (!ok) { (name.classList.contains('err') ? name : phone).focus(); return; }
      var occ = form.querySelector('input[name="occasion"]:checked');
      var msg = 'Здравствуйте! Заявка на банкет в Хан Сарае.\nИмя: ' + name.value.trim() +
        '\nТелефон: ' + phone.value.trim() +
        '\nПовод: ' + (occ ? occ.value : '') +
        '\nДата: ' + (form.elements.date.value || '') +
        '\nЧисло гостей: ' + (form.elements.guests.value || '');
      window.open('https://wa.me/77079510510?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    });
  })();

  /* ================================================================
     ЯЗЫКИ: русский в разметке, kk.js и en.js подгружаются по кнопке
     ================================================================ */
  var i18nEls = $$('[data-i18n]');
  i18nEls.forEach(function (el) { el._ru = el.innerHTML; });
  var curLang = 'ru';
  function applyLang(l) {
    splits.forEach(function (s) { try { s.revert(); } catch (e) {} });
    splits = [];
    $('.h1').removeAttribute('aria-label');
    var dict = l === 'kk' ? window.SITE_KK : l === 'en' ? window.SITE_EN : null;
    i18nEls.forEach(function (el) {
      var k = el.dataset.i18n;
      el.innerHTML = dict && dict[k] != null ? dict[k] : el._ru;
    });
    de.lang = l;
    curLang = l;
    $$('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.lang === l ? 'true' : 'false'); });
    setLed(true);
    relayout();
  }
  function setLang(l, save) {
    if (save) { try { localStorage.setItem('hs-lang', l); } catch (e) {} }
    if (l === 'ru') { applyLang('ru'); return; }
    var g = l === 'kk' ? 'SITE_KK' : 'SITE_EN';
    if (window[g]) { applyLang(l); return; }
    var sc = d.createElement('script');
    sc.src = 'assets/lang/' + l + '.js?v=' + VER;
    sc.onload = function () { applyLang(l); };
    d.head.appendChild(sc);
  }
  $$('.lang button').forEach(function (b) { b.addEventListener('click', function () { if (b.dataset.lang !== curLang) setLang(b.dataset.lang, true); }); });

  /* ---------- раскладка ---------- */
  var lastW = 0, lastH = 0;
  function relayout() {
    buildScene();
    plateFit();
    heroScroll();
    if (HAS) ST.refresh();
  }
  window.addEventListener('resize', function () {
    var w = window.innerWidth, h = window.innerHeight;
    if (w === lastW && Math.abs(h - lastH) < 140) return;
    lastW = w; lastH = h;
    clearTimeout(window.__hsR); window.__hsR = setTimeout(relayout, 180);
  });

  /* кадр зала для перехода из сцены грузим после загрузки страницы: на первом экране он не виден */
  function loadHeroPhoto() {
    $$('[data-srcset]', photo).forEach(function (s) { s.srcset = s.dataset.srcset; s.removeAttribute('data-srcset'); });
    $$('img[data-src]', photo).forEach(function (i) { i.src = i.dataset.src; i.removeAttribute('data-src'); });
  }
  if (d.readyState === 'complete') setTimeout(loadHeroPhoto, 200); else window.addEventListener('load', function () { setTimeout(loadHeroPhoto, 200); });

  function start() {
    lastW = window.innerWidth; lastH = window.innerHeight;
    buildScene();
    plateFit();
    heroScroll();
    platesInit();
    lamps();
    reveals();
    heroIntro();
    if (RM) lightOn();
    else setTimeout(lightOn, 4600);
    var q = (location.search.match(/[?&]lang=(ru|kk|en)/) || [])[1];
    var saved = null; try { saved = localStorage.getItem('hs-lang'); } catch (e) {}
    var l = q || saved;
    if (l && l !== 'ru') setLang(l, false);
    if (HAS) ST.refresh();
    /* прямой переход по ссылке с якорем: раскладка героя поменялась, доводим до цели заново */
    var h = location.hash.length > 1 && d.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (h && h !== hero) {
      var jump = function () {
        var top = h.getBoundingClientRect().top + window.scrollY - hdrH() + 1;
        if (lenis) lenis.scrollTo(top, { immediate: true, force: true }); else window.scrollTo(0, top);
        if (HAS) ST.update();
      };
      jump(); setTimeout(jump, 120); window.addEventListener('load', function () { setTimeout(jump, 60); });
    }
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(start); else window.addEventListener('load', start);
})();
