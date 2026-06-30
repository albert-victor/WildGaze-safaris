(function () {
  'use strict';

  /* ── Animated stat counters ─────────────────────────── */
  function animateCounter(el) {
    var target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;

    var suffix = el.dataset.suffix || '';
    var duration = 1800;
    var start = 0;
    var startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(start + (target - start) * eased);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function initCounters() {
    var stats = document.querySelectorAll('.wg-about-stat-val[data-count]');
    if (!stats.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      stats.forEach(function (el) {
        el.textContent = el.dataset.count + (el.dataset.suffix || '');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    stats.forEach(function (el) { observer.observe(el); });
  }

  /* ── Promise tabs ───────────────────────────────────── */
  function initTabs() {
    var tabs = document.querySelectorAll('.wg-about-tab');
    var panels = document.querySelectorAll('.wg-about-tab-panel');
    if (!tabs.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var id = tab.dataset.tab;
        tabs.forEach(function (t) {
          t.classList.toggle('is-active', t === tab);
          t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        });
        panels.forEach(function (p) {
          var active = p.dataset.panel === id;
          p.classList.toggle('is-active', active);
          p.hidden = !active;
        });
      });
    });
  }

  /* ── Gallery filters ────────────────────────────────── */
  function initGalleryFilters() {
    var btns = document.querySelectorAll('.wg-about-gf-btn');
    var items = document.querySelectorAll('.wg-about-gallery-item');
    if (!btns.length || !items.length) return;

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.dataset.filter;

        btns.forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });

        items.forEach(function (item) {
          var cat = item.dataset.category || '';
          var show = filter === 'all' || cat.split(' ').indexOf(filter) !== -1;
          item.classList.toggle('is-hidden', !show);
        });
      });
    });
  }

  function init() {
    initCounters();
    initTabs();
    initGalleryFilters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
