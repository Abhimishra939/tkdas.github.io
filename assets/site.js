/* Dr. T. K. Das — Interactive Academic Portfolio Engine */
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ARCHIVE = window.TKD_ARCHIVE || {};

  /* ---------- 0. Unified Professional Academic Footer ---------- */
  const footerEl = document.querySelector('footer.footer');
  if (footerEl) {
    footerEl.innerHTML = `
      <div class="wrap">
        <div class="footer-top">
          <div class="footer-identity">
            <strong>Dr. Tapas Kumar Das <span class="footer-fellows">FNASc · FNAAS · FISA · FISWS · FSPPS</span></strong>
            <span class="footer-affil">Professor &amp; Principal Scientist · Division of Agronomy, ICAR–Indian Agricultural Research Institute (IARI), New Delhi – 110 012</span>
          </div>
          <nav class="footer-nav" aria-label="Footer navigation">
            <a href="index.html">Home</a>
            <a href="about.html">Profile</a>
            <a href="research.html">Research</a>
            <a href="achievements.html">Achievements</a>
            <a href="books.html">Books &amp; Chapters</a>
            <a href="publications.html">Publications</a>
            <a href="top50.html">Top 50</a>
            <a href="contact.html">Contact</a>
            <a href="https://scholar.google.co.in/citations?user=wfz2In0AAAAJ" target="_blank" rel="noopener">Google Scholar ↗</a>
            <a href="#top" class="footer-top-btn" onclick="window.scrollTo({top:0,behavior:'smooth'});return false;">↑ Top</a>
          </nav>
        </div>
        <div class="footer-bottom">
          <div>© ${new Date().getFullYear()} Dr. Tapas Kumar Das · All Rights Reserved</div>
          <div class="update-note" id="dataUpdated">Google Scholar metrics synced · Official Academic Portfolio</div>
        </div>
      </div>
    `;
  }

  /* ---------- 1. Live Theme Engine ---------- */
  const savedTheme = localStorage.getItem('tkd_theme') || 'emerald';
  function applyTheme(t) {
    if (t === 'emerald') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('tkd_theme', t);
    document.querySelectorAll('.theme-dot').forEach((d) => {
      d.classList.toggle('active', d.dataset.t === t);
    });
  }
  applyTheme(savedTheme);
  document.querySelectorAll('.theme-dot').forEach((btn) => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.t));
  });

  /* ---------- 2. Mobile Navigation & Sticky State ---------- */
  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('navLinks');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.textContent = open ? '✕' : '☰';
    });
    nav.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        menuBtn.textContent = '☰';
      })
    );
  }
  const navBar = document.querySelector('.nav');
  const updateNav = () => { if (navBar) navBar.classList.toggle('scrolled', window.scrollY > 14); };
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  /* ---------- 3. Interactive Botanical/Molecular Canvas in Hero ---------- */
  const canvas = document.getElementById('heroCanvas');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];
    const mouse = { x: -999, y: -999 };

    function resize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const count = Math.min(55, Math.floor((w * h) / 16000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        r: Math.random() * 2.2 + 1.1
      });
    }

    const heroEl = canvas.parentElement;
    heroEl.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    heroEl.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const gold = getComputedStyle(document.documentElement).getPropertyValue('--gold').trim() || '#d5ad62';
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        const dxm = p.x - mouse.x;
        const dym = p.y - mouse.y;
        const distM = Math.hypot(dxm, dym);
        if (distM < 130 && distM > 0) {
          p.x += (dxm / distM) * 0.8;
          p.y += (dym / distM) * 0.8;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = gold;
        ctx.globalAlpha = 0.55;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 125) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = gold;
            ctx.globalAlpha = (1 - d / 125) * 0.22;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ---------- 4. 3D Tilt on Portrait ---------- */
  const portraitWrap = document.getElementById('portraitWrap');
  if (portraitWrap && !reduceMotion) {
    portraitWrap.addEventListener('mousemove', (e) => {
      const r = portraitWrap.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      portraitWrap.style.transform = `perspective(700px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
    });
    portraitWrap.addEventListener('mouseleave', () => {
      portraitWrap.style.transform = 'perspective(700px) rotateY(0deg) rotateX(0deg)';
    });
  }

  /* ---------- 5. Metric Count-Up Animation ---------- */
  function animateValue(el, end, duration, suffix) {
    if (reduceMotion || end == null || isNaN(end)) {
      el.textContent = (typeof end === 'number' ? end.toLocaleString('en-IN') : end) + (suffix || '');
      return;
    }
    const startTime = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(end * eased);
      el.textContent = current.toLocaleString('en-IN') + (t >= 1 ? (suffix || '') : '');
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function runMetricCountUp() {
    document.querySelectorAll('[data-count]').forEach((el, idx) => {
      const raw = String(el.dataset.count || el.textContent).replace(/,/g, '').trim();
      const hasPlus = raw.endsWith('+');
      const num = parseInt(raw, 10);
      if (!isNaN(num)) animateValue(el, num, 1100 + idx * 110, hasPlus ? '+' : '');
    });
  }

  /* ---------- 6. Scholar Data Loader (Live JSON + Fallback) ---------- */
  const formatNum = (v) => (typeof v === 'number' ? v.toLocaleString('en-IN') : v);

  function renderScholarCards(container, pubs, limit) {
    if (!container || !Array.isArray(pubs) || !pubs.length) return;
    container.innerHTML = '';
    const slice = limit ? pubs.slice(0, limit) : pubs;
    slice.forEach((p) => {
      const card = document.createElement('article');
      card.className = 'pub-card reveal is-visible';
      const citeBadge = p.citations ? `<span class="naas-pill">Cited: ${p.citations}</span>` : '';
      card.innerHTML = `
        <div class="pub-year"><span>${p.year || 'PUBLICATION'}</span>${citeBadge}</div>
        <h3>${escapeHtml(p.title || 'Untitled paper')}</h3>
        <div class="pub-meta">${escapeHtml([p.authors, p.venue].filter(Boolean).join(' · '))}</div>
        ${p.url ? `<a class="pub-link" href="${p.url}" target="_blank" rel="noopener">Open in Google Scholar ↗</a>` : ''}
      `;
      container.appendChild(card);
    });
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  fetch('scholar_data.json', { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((data) => {
      const citEl = document.getElementById('scholar-citations');
      const hEl = document.getElementById('scholar-hindex');
      const i10El = document.getElementById('scholar-i10');
      if (citEl && data.citations) citEl.dataset.count = data.citations;
      if (hEl && data.h_index) hEl.dataset.count = data.h_index;
      if (i10El && data.i10_index) i10El.dataset.count = data.i10_index;

      const note = document.getElementById('dataUpdated');
      if (note && data.updated_at) {
        note.textContent = 'Google Scholar metrics synced: ' + data.updated_at.split('T')[0] + ' · President, ISWS (2025–27)';
      }
      renderScholarCards(document.getElementById('latest-publications'), data.publications, 3);
      window.SCHOLAR_PUBS = data.publications || [];
      if (typeof window.initPublicationsHub === 'function') window.initPublicationsHub();
      runMetricCountUp();
    })
    .catch(() => {
      runMetricCountUp();
      if (typeof window.initPublicationsHub === 'function') window.initPublicationsHub();
    });

  /* ---------- 7. Books & 89 Book Chapters Interactive Hub (books.html) ---------- */
  const booksContainer = document.getElementById('books-grid');
  const chaptersContainer = document.getElementById('chapters-grid');
  if (booksContainer && ARCHIVE.books) {
    function renderBooks(filterType = 'ALL', query = '') {
      const q = query.toLowerCase().trim();
      const filtered = ARCHIVE.books.filter((b) => {
        const matchType = filterType === 'ALL' || b.type === filterType;
        const matchQ = !q || (b.title || '').toLowerCase().includes(q) || (b.authors || '').toLowerCase().includes(q) || (b.details || '').toLowerCase().includes(q) || b.citation.toLowerCase().includes(q) || String(b.year).includes(q);
        return matchType && matchQ;
      });
      booksContainer.innerHTML = filtered.length
        ? filtered.map((b, i) => `
          <article class="book-card reveal is-visible" style="display:flex;flex-direction:column;gap:8px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;gap:8px;flex-wrap:wrap">
              <span class="badge-tag">#${i + 1} · ${escapeHtml(b.type)}</span>
              <span class="naas-pill">${escapeHtml(b.year)}</span>
            </div>
            <h3 style="margin:0;font-size:18.5px;line-height:1.35">${escapeHtml(b.title || b.citation)}</h3>
            <p style="margin:2px 0 0;font-size:13px;font-weight:600;color:var(--ink);line-height:1.5">${escapeHtml(b.authors || '')}</p>
            <p style="margin:auto 0 0;padding-top:6px;font-size:12.5px;color:var(--muted);line-height:1.55">${escapeHtml(b.details || b.citation)}</p>
          </article>`).join('')
        : '<p style="color:var(--muted)">No books matched your filter.</p>';
    }
    renderBooks();
    document.querySelectorAll('[data-book-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-book-filter]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        renderBooks(btn.dataset.bookFilter, document.getElementById('bookSearch')?.value || '');
      });
    });
    const bookSearch = document.getElementById('bookSearch');
    if (bookSearch) {
      bookSearch.addEventListener('input', () => {
        const active = document.querySelector('[data-book-filter].active')?.dataset.bookFilter || 'ALL';
        renderBooks(active, bookSearch.value);
      });
    }
  }

  if (chaptersContainer && ARCHIVE.book_chapters) {
    const chCountEl = document.getElementById('chapter-count-label');
    function renderChapters(query = '', yearFilter = 'ALL') {
      const q = query.toLowerCase().trim();
      const filtered = ARCHIVE.book_chapters.filter((c) => {
        const matchY = yearFilter === 'ALL' ||
          (yearFilter === '2021+' && parseInt(c.year, 10) >= 2021) ||
          (yearFilter === '2015-2020' && parseInt(c.year, 10) >= 2015 && parseInt(c.year, 10) <= 2020) ||
          (yearFilter === 'Pre-2015' && parseInt(c.year, 10) < 2015);
        const matchQ = !q || c.citation.toLowerCase().includes(q) || c.authors.toLowerCase().includes(q) || String(c.year).includes(q);
        return matchY && matchQ;
      });
      if (chCountEl) chCountEl.textContent = `Showing ${filtered.length} of ${ARCHIVE.book_chapters.length} Book Chapters`;
      chaptersContainer.innerHTML = filtered.map((c, idx) => `
        <article class="pub-card reveal is-visible" style="min-height:auto">
          <div class="pub-year">
            <span>CHAPTER #${idx + 1} · ${escapeHtml(c.year)}</span>
            <span class="badge-tag">Book Chapter</span>
          </div>
          <p style="font-size:14px;color:var(--ink);line-height:1.6"><strong>${escapeHtml(c.authors)} (${escapeHtml(c.year)}).</strong> ${escapeHtml(c.citation)}</p>
        </article>`).join('');
    }
    renderChapters();
    const chSearch = document.getElementById('chapterSearch');
    document.querySelectorAll('[data-ch-year]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-ch-year]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        renderChapters(chSearch?.value || '', btn.dataset.chYear);
      });
    });
    if (chSearch) {
      chSearch.addEventListener('input', () => {
        const activeY = document.querySelector('[data-ch-year].active')?.dataset.chYear || 'ALL';
        renderChapters(chSearch.value, activeY);
      });
    }
  }

  /* ---------- 8. Complete Publications Explorer (publications.html) ---------- */
  window.initPublicationsHub = function () {
    const pubContainer = document.getElementById('all-pubs-container');
    if (!pubContainer) return;
    const statusEl = document.getElementById('pub-status');
    let currentTab = 'research';
    let currentQuery = '';

    function getItems(tab) {
      if (tab === 'scholar') return (window.SCHOLAR_PUBS || []).map((p) => ({
        title: p.title, authors: p.authors, year: p.year, venue: p.venue,
        badge: p.citations ? `Cited: ${p.citations}` : 'Google Scholar', url: p.url
      }));
      if (tab === 'research') return (ARCHIVE.research_articles || [])
        .filter((a) => a.title && !a.title.startsWith('†'))
        .map((a) => ({
          title: a.title, authors: a.authors, year: a.year,
          venue: [a.journal, a.vol].filter(Boolean).join(', '),
          badge: a.naas ? `NAAS ${a.naas}` : (a.status || 'Journal Article'),
          url: `https://scholar.google.com/scholar?q=${encodeURIComponent(a.title)}`
        }));
      if (tab === 'reviews') return (ARCHIVE.review_articles || []).map((a) => ({
        title: a.title, authors: a.authors, year: a.year,
        venue: [a.journal, a.vol].filter(Boolean).join(', '),
        badge: a.naas ? `NAAS ${a.naas}` : 'Review Article',
        url: `https://scholar.google.com/scholar?q=${encodeURIComponent(a.title)}`
      }));
      if (tab === 'chapters') return (ARCHIVE.book_chapters || []).map((c) => ({
        title: c.citation, authors: c.authors, year: c.year,
        venue: 'Edited Volume / Book Chapter', badge: 'Book Chapter',
        url: `https://scholar.google.com/scholar?q=${encodeURIComponent(c.citation.slice(0, 120))}`
      }));
      if (tab === 'extension') {
        const pop = [
          ...(ARCHIVE.bulletins || []).map((x) => ({ ...x, tag: 'Technical Bulletin' })),
          ...(ARCHIVE.extension_folders || []).map((x) => ({ ...x, tag: 'Extension Folder' })),
          ...(ARCHIVE.popular_english || []).map((x) => ({ ...x, tag: 'Popular Article (EN)' })),
          ...(ARCHIVE.popular_hindi || []).map((x) => ({ ...x, tag: 'Popular Article (HI)' })),
          ...(ARCHIVE.scientific_news || []).map((x) => ({ ...x, tag: 'Scientific News' }))
        ];
        return pop.map((x) => ({
          title: x.title, authors: x.authors, year: x.year, venue: x.venue, badge: x.tag,
          url: `https://scholar.google.com/scholar?q=${encodeURIComponent(x.title)}`
        }));
      }
      return [];
    }

    function renderTab() {
      const items = getItems(currentTab);
      const q = currentQuery.toLowerCase().trim();
      const filtered = q
        ? items.filter((it) =>
            (it.title || '').toLowerCase().includes(q) ||
            (it.authors || '').toLowerCase().includes(q) ||
            (it.venue || '').toLowerCase().includes(q) ||
            String(it.year || '').includes(q))
        : items;

      if (statusEl) {
        statusEl.textContent = `Displaying ${filtered.length} records in this category (Total Portfolio: ~576 Publications)`;
      }

      const shown = filtered.slice(0, 150);
      pubContainer.innerHTML = shown.map((it, idx) => `
        <article class="pub-card reveal is-visible" style="min-height:auto">
          <div class="pub-year">
            <span>#${idx + 1} · ${escapeHtml(it.year || '—')}</span>
            <span class="naas-pill">${escapeHtml(it.badge)}</span>
          </div>
          <h3>${escapeHtml(it.title)}</h3>
          <div class="pub-meta">${escapeHtml([it.authors, it.venue].filter(Boolean).join(' · '))}</div>
          ${it.url ? `<a class="pub-link" href="${it.url}" target="_blank" rel="noopener">Locate record on Scholar ↗</a>` : ''}
        </article>`).join('') +
        (filtered.length > 150 ? `<div class="pub-card" style="grid-column:1/-1;min-height:auto;text-align:center"><p>Showing first 150 of ${filtered.length} matching records. Refine your search keyword above to narrow results.</p></div>` : '');
    }

    document.querySelectorAll('[data-pub-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-pub-tab]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        currentTab = btn.dataset.pubTab;
        renderTab();
      });
    });

    const pubSearch = document.getElementById('pubSearch');
    if (pubSearch) {
      pubSearch.addEventListener('input', () => {
        currentQuery = pubSearch.value;
        renderTab();
      });
    }
    renderTab();
  };

  /* ---------- 9. Profile Page Students & Career Renderer (about.html) ---------- */
  const chairmanBody = document.getElementById('chairman-students-body');
  if (chairmanBody && ARCHIVE.students_chairman) {
    function renderStudents(q = '') {
      const query = q.toLowerCase().trim();
      const rows = ARCHIVE.students_chairman.filter((s) =>
        !query || s.name.toLowerCase().includes(query) || s.thesis.toLowerCase().includes(query) ||
        s.country.toLowerCase().includes(query) || s.institution.toLowerCase().includes(query)
      );
      chairmanBody.innerHTML = rows.map((s, i) => `
        <tr>
          <td><strong>${i + 1}</strong></td>
          <td><strong>${escapeHtml(s.name)}</strong><br><small style="color:var(--muted)">${escapeHtml(s.degree_year)}</small></td>
          <td><span class="badge-tag">${escapeHtml(s.country)}</span><br><small>${escapeHtml(s.institution)}</small></td>
          <td>${escapeHtml(s.thesis)}</td>
        </tr>`).join('');
    }
    renderStudents();
    const stSearch = document.getElementById('studentSearch');
    if (stSearch) stSearch.addEventListener('input', () => renderStudents(stSearch.value));
  }

  /* ---------- 10. Scroll Reveal Observer ---------- */
  const targets = document.querySelectorAll('section, .metrics, .section-head, .research-card, .achievement-card, .book-card, .timeline-card');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    document.body.classList.add('reveal-ready');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    targets.forEach((el) => { el.classList.add('reveal'); obs.observe(el); });
    setTimeout(() => targets.forEach((el) => el.classList.add('is-visible')), 2400);
  }
})();
