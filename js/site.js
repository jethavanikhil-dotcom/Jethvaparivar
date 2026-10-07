// Motion for the archive: line-art that draws itself, scroll reveals,
// parallax, a pinned horizontal timeline, counters and drifting dust.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var vh = window.innerHeight;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  // ---------- Header ----------
  var header = document.querySelector('.site-header');
  var lastY = 0;
  function onHeader() {
    var y = window.scrollY;
    header.classList.toggle('scrolled', y > 40);
    header.classList.toggle('hide', y > 400 && y > lastY && !document.querySelector('.nav.open'));
    lastY = y;
  }
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle) toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // ---------- Line-art ----------
  var NS = 'http://www.w3.org/2000/svg';
  function mountArt(el) {
    var name = el.dataset.art;
    var a = window.ART && window.ART[name];
    if (!a) return;
    var extra = '';
    if (name === 'map') extra = mapExtras();
    el.innerHTML = '<svg class="art" viewBox="' + a[0] + '" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + a[1] + extra + '</svg>';
  }

  function mapExtras() {
    var L = window.ART._labels, M = window.ART._mapmeta;
    var s = '<text class="sea" x="' + L.sea[0] + '" y="' + L.sea[1] + '">ARABIAN SEA</text>' +
      '<text class="sea" x="' + L.gulf[0] + '" y="' + L.gulf[1] + '" transform="rotate(-12 ' + L.gulf[0] + ' ' + L.gulf[1] + ')">GULF OF KUTCH</text>' +
      '<text x="' + L.kutch[0] + '" y="' + L.kutch[1] + '" font-size="16" style="font-family:var(--display)">Kutch</text>' +
      '<text x="' + L.saurashtra[0] + '" y="' + L.saurashtra[1] + '" font-size="28" letter-spacing="10" style="font-family:var(--display);fill:rgba(192,154,91,.35)">SAURASHTRA</text>' +
      '<text x="' + M.barda[0] + '" y="' + M.barda[1] + '" font-size="14" style="font-family:var(--display);fill:#c09a5b">Barda hills</text>' +
      '<text x="' + M.compass[0] + '" y="' + (M.compass[1] - 50) + '" text-anchor="middle" font-size="15" style="font-family:var(--display);fill:#e0c48f">N</text>';
    window.ART._places.forEach(function (p) {
      var name = p[0], x = p[1], y = p[2], sub = p[3], side = p[4];
      var anchor = side > 0 ? 'start' : 'end', dx = 12 * side;
      var q = encodeURIComponent(name + ', Gujarat');
      s += '<a class="pin" data-pin="' + name + '" href="https://www.google.com/maps/search/?api=1&amp;query=' + q + '" target="_blank" rel="noopener">' +
        '<title>Open ' + name + ' in Google Maps</title>' +
        '<circle class="ring" cx="' + x + '" cy="' + y + '" r="5"/><circle cx="' + x + '" cy="' + y + '" r="4.5"/>' +
        '<text x="' + (x + dx) + '" y="' + (y + 5) + '" text-anchor="' + anchor + '">' + name + '</text>' +
        (sub ? '<text class="sub" x="' + (x + dx) + '" y="' + (y + 19) + '" text-anchor="' + anchor + '">' + sub + '</text>' : '') + '</a>';
    });
    return s;
  }

  // The real family tree as a fan: Dewji Bapa at the root, every pedhi a ring.
  function mountFan(el) {
    var people = window.PEOPLE;
    if (!people) return;
    var kids = {}, byId = {};
    people.forEach(function (p) { byId[p.id] = p; if (p.parent) (kids[p.parent] = kids[p.parent] || []).push(p); });
    var leaves = 0, pos = {};
    (function walk(p) {
      var ch = kids[p.id] || [];
      if (!ch.length) { pos[p.id] = leaves++; return; }
      ch.forEach(walk);
      pos[p.id] = (pos[ch[0].id] + pos[ch[ch.length - 1].id]) / 2;
    })(byId[1]);
    var W = 1000, H = 560, cx = W / 2, cy = H - 20, R0 = 0, dr = (H - 60) / 11;
    function pt(p) {
      var ang = Math.PI + (pos[p.id] + .5) / leaves * Math.PI;
      var r = R0 + (p.gen - 1) * dr;
      return [cx + r * Math.cos(ang), cy + r * Math.sin(ang), ang, r];
    }
    var s = '';
    for (var g = 2; g <= 12; g++) {
      var r = (g - 1) * dr;
      s += '<path class="faint" stroke-dasharray="1 7" d="M' + (cx - r) + ',' + cy + ' A' + r + ',' + r + ' 0 0 1 ' + (cx + r) + ',' + cy + '"/>';
    }
    var links = '', dots = '';
    people.forEach(function (p) {
      var b = pt(p);
      if (p.parent) {
        var a = pt(byId[p.parent]);
        var rm = (a[3] + b[3]) / 2;
        var c1 = [cx + rm * Math.cos(a[2]), cy + rm * Math.sin(a[2])];
        var c2 = [cx + rm * Math.cos(b[2]), cy + rm * Math.sin(b[2])];
        links += '<path' + (p.sex === 'f' ? ' class="rouge"' : '') + ' d="M' + a[0].toFixed(1) + ',' + a[1].toFixed(1) + ' C' + c1[0].toFixed(1) + ',' + c1[1].toFixed(1) + ' ' + c2[0].toFixed(1) + ',' + c2[1].toFixed(1) + ' ' + b[0].toFixed(1) + ',' + b[1].toFixed(1) + '"/>';
      }
      dots += '<circle class="fill-dot" data-dot cx="' + b[0].toFixed(1) + '" cy="' + b[1].toFixed(1) + '" r="' + (p.id === 1 ? 5 : 1.8) + '" style="opacity:0"/>';
    });
    s += links + dots + '<text x="' + cx + '" y="' + (cy + 18) + '" text-anchor="middle" font-size="12" letter-spacing="3" style="fill:#e0c48f">DEWJI BAPA</text>';
    el.innerHTML = '<svg class="art" viewBox="0 0 ' + W + ' ' + (H + 10) + '" aria-label="The family tree of Dewji Bapa, 262 people over twelve generations">' + s + '</svg>';
  }

  var drawers = [];
  function prepDraw(el) {
    var svg = el.querySelector('svg');
    if (!svg) return;
    var paths = Array.prototype.slice.call(svg.querySelectorAll('path, line, polyline, circle:not(.fill-dot):not(.ring), rect, ellipse'));
    paths.forEach(function (p) {
      var len = 0;
      try { len = p.getTotalLength(); } catch (e) { len = 400; }
      p.style.strokeDasharray = len + ' ' + len;
      p.style.strokeDashoffset = reduce ? 0 : len;
      p._len = len;
    });
    var d = { el: el, paths: paths, dots: svg.querySelectorAll('[data-dot], .pin'), mode: el.dataset.draw || 'scroll' };
    if (d.mode === 'load' || reduce) {
      paths.forEach(function (p, i) {
        p.style.transition = 'stroke-dashoffset ' + (2.2 + Math.random() * 1.6) + 's cubic-bezier(.4,.1,.2,1) ' + (0.3 + i / paths.length * 1.6) + 's';
        requestAnimationFrame(function () { requestAnimationFrame(function () { p.style.strokeDashoffset = 0; }); });
      });
      Array.prototype.forEach.call(d.dots, function (n, i) {
        n.style.transition = 'opacity 1s ' + (1.5 + i * .02) + 's'; n.style.opacity = 1;
      });
    } else {
      Array.prototype.forEach.call(d.dots, function (n) { n.style.opacity = 0; n.style.transition = 'opacity .8s'; });
      drawers.push(d);
    }
  }

  function updateDraw() {
    drawers.forEach(function (d) {
      var r = d.el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var span = Math.min(vh * .9, r.height + vh * .35);
      var prog = clamp((vh * .95 - r.top) / span, 0, 1);
      var n = d.paths.length;
      for (var i = 0; i < n; i++) {
        var start = (i / n) * .55;
        var local = clamp((prog - start) / .45, 0, 1);
        d.paths[i].style.strokeDashoffset = d.paths[i]._len * (1 - local);
      }
      var dn = d.dots.length;
      for (var j = 0; j < dn; j++) d.dots[j].style.opacity = prog > .35 + (j / dn) * .55 ? 1 : 0;
    });
  }

  // ---------- Parallax ----------
  var parallax = document.querySelectorAll('[data-speed]');
  function updateParallax() {
    if (reduce) return;
    parallax.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var c = r.top + r.height / 2 - vh / 2;
      el.style.transform = 'translate3d(0,' + (c * parseFloat(el.dataset.speed)).toFixed(1) + 'px,0)';
    });
  }

  // ---------- Words that light up as you read ----------
  var statements = document.querySelectorAll('.statement');
  statements.forEach(function (st) {
    st.innerHTML = st.textContent.trim().split(/\s+/).map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
  });
  function updateStatements() {
    statements.forEach(function (st) {
      var r = st.getBoundingClientRect();
      var prog = clamp((vh * .85 - r.top) / (r.height + vh * .3), 0, 1);
      var words = st.querySelectorAll('.w');
      var lit = Math.round(prog * words.length * 1.15);
      words.forEach(function (w, i) { w.classList.toggle('lit', reduce || i < lit); });
    });
  }

  // ---------- Pinned horizontal timeline ----------
  var hs = document.querySelectorAll('.hscroll');
  function sizeH() {
    hs.forEach(function (h) {
      var track = h.querySelector('.track');
      var extra = Math.max(0, track.scrollWidth - window.innerWidth + 80);
      h._extra = extra;
      h.style.height = (vh + extra) + 'px';
    });
  }
  function updateH() {
    hs.forEach(function (h) {
      var r = h.getBoundingClientRect();
      var prog = clamp(-r.top / (h._extra || 1), 0, 1);
      h.querySelector('.track').style.transform = 'translate3d(' + (-prog * h._extra) + 'px,0,0)';
      var bar = h.querySelector('.progress');
      if (bar) bar.style.width = (prog * 100) + '%';
    });
  }

  // ---------- Scrollytelling steps ----------
  var steps = document.querySelectorAll('[data-step]');
  function updateSteps() {
    var best = null, bestD = 1e9;
    steps.forEach(function (s) {
      var r = s.getBoundingClientRect();
      var d = Math.abs(r.top + r.height / 2 - vh / 2);
      if (d < bestD) { bestD = d; best = s; }
    });
    steps.forEach(function (s) { s.classList.toggle('active', s === best); });
    if (best && best.dataset.pins !== undefined) {
      var on = best.dataset.pins.split(',');
      document.querySelectorAll('.pin').forEach(function (p) {
        p.style.opacity = !best.dataset.pins || on.indexOf(p.dataset.pin) !== -1 ? 1 : .25;
      });
    }
  }

  // ---------- Reveal + counters ----------
  document.querySelectorAll('[data-stagger]').forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (c, i) { c.style.setProperty('--d', (i * .09) + 's'); c.classList.add('reveal'); });
  });
  function countUp(el) {
    var to = +el.dataset.count, t0 = null, dur = 2200;
    var suffix = el.dataset.suffix || '';
    function f(t) {
      if (!t0) t0 = t;
      var k = clamp((t - t0) / dur, 0, 1);
      k = 1 - Math.pow(1 - k, 4);
      el.innerHTML = Math.round(to * k) + (suffix ? '<small>' + suffix + '</small>' : '');
      if (k < 1) requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  }
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      if (e.target.dataset.count) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  document.querySelectorAll('.reveal, .mask, [data-count]').forEach(function (el) {
    if (io && !reduce) io.observe(el); else { el.classList.add('in'); }
  });

  // ---------- Dust in the hero ----------
  var canvas = document.querySelector('.hero canvas');
  if (canvas && !reduce) {
    var ctx = canvas.getContext('2d'), parts = [], W, H, dpr = Math.min(2, window.devicePixelRatio || 1);
    var size = function () { W = canvas.offsetWidth; H = canvas.offsetHeight; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size();
    window.addEventListener('resize', size);
    for (var i = 0; i < 70; i++) parts.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.6 + .3, s: Math.random() * .00025 + .00006, a: Math.random() * .5 + .1, p: Math.random() * 6 });
    (function tick(t) {
      ctx.clearRect(0, 0, W, H);
      parts.forEach(function (q) {
        q.y -= q.s; q.x += Math.sin(t / 3000 + q.p) * .00012;
        if (q.y < -.02) { q.y = 1.02; q.x = Math.random(); }
        ctx.beginPath();
        ctx.fillStyle = 'rgba(224,196,143,' + (q.a * (.6 + .4 * Math.sin(t / 900 + q.p))) + ')';
        ctx.arc(q.x * W, q.y * H, q.r, 0, 6.283);
        ctx.fill();
      });
      requestAnimationFrame(tick);
    })(0);
  }

  // ---------- Boot ----------
  document.querySelectorAll('[data-art]').forEach(mountArt);
  document.querySelectorAll('[data-fan]').forEach(mountFan);
  document.querySelectorAll('[data-art], [data-fan]').forEach(prepDraw);
  sizeH();

  var ticking = false;
  function frame() {
    ticking = false;
    onHeader(); updateDraw(); updateParallax(); updateStatements(); updateH();
    if (steps.length) updateSteps();
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', function () { vh = window.innerHeight; sizeH(); req(); });
  frame();
})();
