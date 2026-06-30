(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Scroll reveal ─────────────────────────────────────── */
  function initReveal() {
    if (reduced) {
      document.querySelectorAll('.wg-reveal, .wg-reveal-left, .wg-reveal-right, .wg-reveal-scale, [class*="-card"], .wg-shortcut-card')
        .forEach(function (el) {
          el.classList.add('wg-revealed', 'reveal');
        });
      return;
    }

    var selectors = [
      '.wg-reveal',
      '.wg-reveal-left',
      '.wg-reveal-right',
      '.wg-reveal-scale',
      '.wg-shortcut-card',
      '.wg-tzh-card',
      '.wg-tz-card',
      '.wg-zan-exp-card',
      '.wg-kili-card',
      '.wg-card',
      '.wg-pemba-exp-card',
      '[class*="-exp-card"]',
      '[class*="-info-card"]',
      '[class*="-stat-card"]',
      '[class*="-white-card"]',
      '[class*="-dark-card"]',
      '.wg-zan-highlight-item',
      '.wg-birding-park',
      '.wg-itin-day'
    ];

    var seen = new Set();
    var targets = [];

    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (el.classList.contains('no-reveal') || seen.has(el)) return;
        seen.add(el);
        if (!el.classList.contains('reveal') && !el.classList.contains('wg-revealed')) {
          targets.push(el);
        }
      });
    });

    if (!targets.length) return;

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var parent = el.closest('[class*="grid"], [class*="layout"], [class*="list"]');
        var siblings = parent
          ? Array.prototype.slice.call(parent.children).filter(function (c) { return targets.indexOf(c) !== -1; })
          : [];
        var idx = siblings.indexOf(el);
        var delay = idx >= 0 ? idx * 90 : 0;

        setTimeout(function () {
          el.classList.add('wg-revealed', 'reveal');
        }, delay);

        obs.unobserve(el);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ── Section heading reveal ────────────────────────────── */
  function initHeadingReveal() {
    if (reduced) return;

    var headings = document.querySelectorAll(
      '[class*="-heading"], [class*="-section-title"], [class*="-intro-title"], [class*="-section-header"]'
    );

    headings.forEach(function (el) {
      if (el.closest('[class*="hero"]')) return;
      el.classList.add('wg-reveal');
    });
  }

  /* ── Stat counter ──────────────────────────────────────── */
  function initCounters() {
    var counters = document.querySelectorAll('[data-wg-count]');
    if (!counters.length) return;

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseFloat(el.getAttribute('data-wg-count'));
        var suffix = el.getAttribute('data-wg-suffix') || '';
        var decimals = parseInt(el.getAttribute('data-wg-decimals') || '0', 10);
        var duration = reduced ? 0 : 1400;
        var start = 0;
        var startTime = null;

        function step(ts) {
          if (!startTime) startTime = ts;
          var progress = duration === 0 ? 1 : Math.min((ts - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var val = start + (target - start) * eased;
          el.textContent = val.toFixed(decimals) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (c) { observer.observe(c); });
  }

  /* ── Navbar scroll shrink ──────────────────────────────── */
  function initNavShrink() {
    var nav = document.querySelector('.navbar-wrap');
    if (!nav) return;

    function onScroll() {
      nav.classList.toggle('is-scrolled', window.scrollY > 60);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Smooth anchor scroll (in-page only; never block nav) ── */
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      if (a.closest('.navbar-wrap')) return;
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (!id || id === '#') return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var offset = 80;
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
      });
    });
  }

  /* ── Boot ──────────────────────────────────────────────── */
  function boot() {
    initHeadingReveal();
    initReveal();
    initCounters();
    initNavShrink();
    initSmoothAnchors();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
