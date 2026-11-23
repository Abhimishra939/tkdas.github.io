/* Shared site behaviour — nav, Scholar metrics, count-up, reveal */
(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile nav ---------- */
  const menuBtn = document.getElementById('menuBtn');
  const nav = document.getElementById('navLinks');
  if (menuBtn && nav) {
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      menuBtn.textContent = open ? '✕' : '☰';
    });
    nav.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-label', 'Open navigation');
        menuBtn.textContent = '☰';
      })
    );
  }

  /* ---------- Sticky nav state ---------- */
  const navBar = document.querySelector('.nav');
  const updateNav = () => {
    if (navBar) navBar.classList.toggle('scrolled', window.scrollY > 12);
  };
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  /* ---------- Active page highlight ---------- */
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-links a').forEach((a) => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (
      href === path ||
      (path === '' && (href === 'index.html' || href === './')) ||
      (path === 'index.html' && (href === 'index.html' || href === './' || href === '/'))
    ) {
      a.classList.add('active');
    }
  });

  /* ---------- Number count-up ---------- */
  function animateValue(el, end, duration) {
    if (reduceMotion || end == null || isNaN(end)) {
      el.textContent = typeof end === 'number' ? end.toLocaleString('en-IN') : end;
      return;
    }
    const start = 0;
    const startTime = performance.now();
    el.classList.add('counting');
    function frame(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(start + (end - start) * eased);
      el.textContent = current.toLocaleString('en-IN');
      if (t < 1) requestAnimationFrame(frame);
      else el.classList.remove('counting');
    }
    requestAnimationFrame(frame);
  }

  function parseMetric(text) {
    if (text == null) return null;
    const s = String(text).replace(/,/g, '').trim();
    if (s.endsWith('+')) {
      const n = parseInt(s, 10);
      return isNaN(n) ? null : n;
    }
    const n = parseInt(s, 10);
    return isNaN(n) ? null : n;
  }

  function runMetricCountUp() {
    const ids = ['scholar-citations', 'scholar-hindex', 'scholar-i10', 'scholar-pubs'];
    ids.forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      const end = parseMetric(el.textContent);
      if (end == null) return;
      const hadPlus = String(el.textContent).includes('+');
      animateValue(el, end, 1100 + i * 120);
      if (hadPlus) {
        setTimeout(() => {
          if (!el.textContent.includes('+')) el.textContent = el.textContent + '+';
        }, 1200 + i * 120);
      }
    });
  }

  /* ---------- Scholar data ---------- */
  const formatNum = (v) => (typeof v === 'number' ? v.toLocaleString('en-IN') : v);

  const hasMetrics =
    document.getElementById('scholar-citations') ||
    document.getElementById('latest-publications') ||
    document.getElementById('pub-list-full');

  function renderPubCards(container, pubs, limit) {
    if (!container || !Array.isArray(pubs) || !pubs.length) return;
    container.innerHTML = '';
    const slice = limit ? pubs.slice(0, limit) : pubs;
    slice.forEach((p) => {
      const card = document.createElement('article');
      card.className = 'pub-card reveal is-visible';
      const year = document.createElement('div');
      year.className = 'pub-year';
      year.textContent = p.year || 'PUBLICATION';
      const title = document.createElement('h3');
      title.textContent = p.title || 'Untitled paper';
      const meta = document.createElement('div');
      meta.className = 'pub-meta';
      meta.textContent = [p.authors, p.venue].filter(Boolean).join(' · ');
      card.append(year, title, meta);
      if (p.url) {
        const a = document.createElement('a');
        a.className = 'pub-link';
        a.href = p.url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = limit ? 'Read paper ↗' : 'Open publication ↗';
        card.append(a);
      }
      container.append(card);
    });
  }

  if (hasMetrics) {
    fetch('scholar_data.json', { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('data unavailable');
        return r.json();
      })
      .then((data) => {
        const set = (id, v) => {
          const el = document.getElementById(id);
          if (el && v !== null && v !== undefined && v !== '') {
            el.textContent = formatNum(v);
          }
        };
        set('scholar-citations', data.citations);
        set('scholar-hindex', data.h_index);
        set('scholar-i10', data.i10_index);
        set('scholar-pubs', data.publication_count);

        const note = document.getElementById('dataUpdated');
        if (note && data.updated_at) {
          note.textContent = 'Metrics last updated: ' + data.updated_at;
        }

        const status = document.getElementById('pub-status');
        if (status) {
          status.textContent =
            (data.publication_count ?? data.publications?.length ?? 0) +
            ' publications · Last updated: ' +
            (data.updated_at || '—') +
            ' · Source: Google Scholar (SerpApi snapshot)';
        }

        renderPubCards(document.getElementById('latest-publications'), data.publications, 3);
        renderPubCards(document.getElementById('pub-list-full'), data.publications, null);

        runMetricCountUp();
      })
      .catch((err) => {
        console.warn('Scholar snapshot not loaded; fallback metrics retained.', err);
        const status = document.getElementById('pub-status');
        if (status) {
          status.textContent =
            'Scholar data could not be loaded. Visit Google Scholar for the live record.';
        }
        runMetricCountUp();
      });
  }

  /* ---------- Scroll reveal ---------- */
  const targets = document.querySelectorAll(
    'section, .metrics, .section-head, .research-card, .pub-card, .top50-card, .contact-box, .focus-panel, .achievement-card, .page-hero'
  );
  if (!reduceMotion && 'IntersectionObserver' in window) {
    document.body.classList.add('reveal-ready');
  }
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    if (i % 5 === 1) el.classList.add('reveal-delay-1');
    if (i % 5 === 2) el.classList.add('reveal-delay-2');
    if (i % 5 === 3) el.classList.add('reveal-delay-3');
    if (i % 5 === 4) el.classList.add('reveal-delay-4');
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  targets.forEach((el) => observer.observe(el));
  window.setTimeout(() => targets.forEach((el) => el.classList.add('is-visible')), 2800);
})();
