// Family tree of Dewji Bapa: collapsible tree, name search and a person panel.
// Each person keeps the permanent # number from the book, so a link like
// lineage.html#73 always opens the same person.
(function () {
  var people = window.PEOPLE || [];
  var byId = {};
  var kids = {};
  people.forEach(function (p) {
    byId[p.id] = p;
    if (p.parent) (kids[p.parent] = kids[p.parent] || []).push(p);
  });

  var BRANCHES = [
    { id: 1, label: 'Whole family', open: 4 },
    { id: 6, label: 'Bhanaji’s line', open: 3 },
    { id: 69, label: 'Dama’s line', open: 3 },
    { id: 158, label: 'Vela’s branch', open: 3 },
    { id: 223, label: 'Ranchhod’s branch', open: 3 }
  ];

  var treeEl = document.getElementById('tree');
  var panelEl = document.getElementById('person');
  var branchEl = document.getElementById('branches');
  var searchEl = document.getElementById('search');
  var resultsEl = document.getElementById('results');
  var currentRoot = 1;
  var selected = null;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function countDesc(id) {
    var n = 1;
    (kids[id] || []).forEach(function (k) { n += countDesc(k.id); });
    return n;
  }

  function years(p) {
    if (p.born && p.died) return p.born + '–' + p.died;
    if (p.died) return 'd. ' + p.died;
    if (p.late) return 'late';
    return '';
  }

  function relation(p) {
    var par = byId[p.parent];
    if (!par) return 'Founder of our line';
    return (p.sex === 'f' ? 'Daughter of ' : 'Son of ') + par.name;
  }

  function lineOf(p) {
    var line = [];
    while (p) { line.unshift(p); p = byId[p.parent]; }
    return line;
  }

  function isUnder(p, rootId) {
    while (p) { if (p.id === rootId) return true; p = byId[p.parent]; }
    return false;
  }

  // ---------- Tree ----------

  function nodeHtml(p, depth, openDepth) {
    var ch = kids[p.id] || [];
    var collapsed = ch.length && depth >= openDepth;
    var y = years(p);
    var html = '<li data-id="' + p.id + '"' + (collapsed ? ' class="collapsed"' : '') + '>';
    html += '<div class="node' + (p.sex === 'f' ? ' f' : '') + '" id="n' + p.id + '">';
    html += '<button class="tw" type="button"' + (ch.length ? ' aria-label="Show or hide children of ' + esc(p.name) + '"' : ' disabled aria-hidden="true"') + '>' + (ch.length ? (collapsed ? '+' : '−') : '·') + '</button>';
    html += '<button class="nm" type="button" data-id="' + p.id + '">' + esc(p.name) + '</button>';
    if (p.spouse) html += '<span class="sp">⚭ ' + esc(p.spouse) + '</span>';
    html += '<span class="meta">P' + p.gen + ' · #' + p.id + (y ? ' · ' + y : '') + (ch.length && collapsed ? ' · ' + (countDesc(p.id) - 1) + ' below' : '') + '</span>';
    html += '</div>';
    if (ch.length) {
      html += '<ul>';
      ch.forEach(function (c) { html += nodeHtml(c, depth + 1, openDepth); });
      html += '</ul>';
    }
    return html + '</li>';
  }

  function renderTree(rootId) {
    currentRoot = rootId;
    var b = BRANCHES.filter(function (x) { return x.id === rootId; })[0];
    treeEl.innerHTML = '<ul class="tree">' + nodeHtml(byId[rootId], 0, b ? b.open : 3) + '</ul>';
    branchEl.querySelectorAll('button').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(+btn.dataset.id === rootId));
    });
    if (selected) markPath(selected);
  }

  function setOpen(li, open) {
    li.classList.toggle('collapsed', !open);
    var tw = li.querySelector(':scope > .node > .tw');
    if (tw && !tw.disabled) tw.textContent = open ? '−' : '+';
    var meta = li.querySelector(':scope > .node > .meta');
    if (meta) meta.textContent = meta.textContent.replace(/ · \d+ below$/, '') +
      (open ? '' : ' · ' + (countDesc(+li.dataset.id) - 1) + ' below');
  }

  function markPath(p) {
    treeEl.querySelectorAll('.node.sel, .node.onpath').forEach(function (n) {
      n.classList.remove('sel', 'onpath');
    });
    lineOf(p).forEach(function (a) {
      var n = document.getElementById('n' + a.id);
      if (!n) return;
      n.classList.add(a.id === p.id ? 'sel' : 'onpath');
      if (a.id !== p.id) setOpen(n.parentNode, true);
    });
  }

  // ---------- Person panel ----------

  function link(p) {
    return '<a href="#' + p.id + '" data-id="' + p.id + '">' + esc(p.name) + '</a>';
  }

  function renderPerson(p) {
    var other = [];
    (p.alt || []).forEach(function (a) { other.push('also written “' + esc(a) + '”'); });
    (p.aka || []).forEach(function (a) { other.push('known as ' + esc(a)); });
    var ch = kids[p.id] || [];
    var y = years(p);
    var html = '<div class="pid">No. ' + p.id + ' · Pedhi ' + p.gen + '</div>';
    html += '<h3>' + esc(p.name) + '</h3>';
    if (other.length) html += '<div class="alt">' + other.join(', ') + '</div>';
    html += '<dl>';
    html += '<dt>Relation</dt><dd>' + (byId[p.parent] ? (p.sex === 'f' ? 'Daughter of ' : 'Son of ') + link(byId[p.parent]) : 'Founder of our line') + '</dd>';
    if (p.spouse) html += '<dt>Spouse</dt><dd>' + esc(p.spouse) + '</dd>';
    if (y) html += '<dt>Years</dt><dd>' + esc(y) + '</dd>';
    html += '<dt>Children</dt><dd class="kids">' + (ch.length ? ch.map(link).join('') : '<span class="empty">None recorded</span>') + '</dd>';
    if (p.photo) html += '<dt>Photo</dt><dd>In <a href="people.html">Faces of our family</a></dd>';
    html += '</dl>';
    if (p.unsure) html += '<p class="callout" style="margin:1rem 0;font-size:1rem">This name may be the same person as another entry. <a href="archive.html#confirm">Help us confirm it.</a></p>';
    html += '<div class="line"><div class="pid" style="margin-bottom:.4rem">Line from Dewji Bapa</div>' +
      lineOf(p).map(function (a) { return a.id === p.id ? '<b>' + esc(a.name) + '</b>' : link(a); }).join(' <span class="sep">›</span> ') + '</div>';
    panelEl.innerHTML = html;
  }

  function select(id, opts) {
    var p = byId[id];
    if (!p) return;
    selected = p;
    // Switch to the whole tree if the person is outside the open branch
    if (!isUnder(p, currentRoot)) renderTree(1);
    markPath(p);
    renderPerson(p);
    if (!opts || !opts.fromHash) history.replaceState(null, '', '#' + id);
    if (opts && opts.scroll) {
      var n = document.getElementById('n' + id);
      if (n) n.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  // ---------- Search ----------

  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  function search(q) {
    q = norm(q.trim());
    if (q.length < 2) { resultsEl.innerHTML = ''; return; }
    var hits = people.filter(function (p) {
      var names = [p.name].concat(p.alt || [], p.aka || [], p.spouse ? [p.spouse] : []);
      return names.some(function (n) { return norm(n).indexOf(q) !== -1; }) || ('#' + p.id) === q || String(p.id) === q;
    }).slice(0, 40);
    resultsEl.innerHTML = hits.length ? hits.map(function (p) {
      var viaSpouse = p.spouse && norm(p.spouse).indexOf(q) !== -1 && norm(p.name).indexOf(q) === -1;
      return '<li><button type="button" data-id="' + p.id + '"><span>' +
        (viaSpouse ? esc(p.spouse) + ' <small>⚭ ' + esc(p.name) + '</small>' : esc(p.name)) +
        '</span><small>P' + p.gen + ' · ' + esc(relation(p)) + ' · #' + p.id + '</small></button></li>';
    }).join('') : '<li><button type="button" disabled>No one by that name yet. <small>Send it in for the next edition</small></button></li>';
  }

  // ---------- Wire up ----------

  branchEl.innerHTML = BRANCHES.map(function (b) {
    return '<button type="button" data-id="' + b.id + '">' + b.label + '<span>' + countDesc(b.id) + '</span></button>';
  }).join('');
  branchEl.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (btn) renderTree(+btn.dataset.id);
  });

  treeEl.addEventListener('click', function (e) {
    var tw = e.target.closest('.tw');
    if (tw && !tw.disabled) {
      var li = tw.closest('li');
      setOpen(li, li.classList.contains('collapsed'));
      return;
    }
    var nm = e.target.closest('.nm');
    if (nm) select(+nm.dataset.id);
  });

  panelEl.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-id]');
    if (a) { e.preventDefault(); select(+a.dataset.id, { scroll: true }); }
  });

  searchEl.addEventListener('input', function () { search(searchEl.value); });
  resultsEl.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-id]');
    if (!btn) return;
    select(+btn.dataset.id, { scroll: true });
    resultsEl.innerHTML = '';
    searchEl.value = '';
  });

  window.addEventListener('hashchange', function () {
    var id = +location.hash.slice(1);
    if (id) select(id, { scroll: true, fromHash: true });
  });

  renderTree(1);
  var start = +location.hash.slice(1);
  if (byId[start]) select(start, { scroll: true, fromHash: true });
  else select(1, { fromHash: true });
})();
