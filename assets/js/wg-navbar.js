/* Wild Gaze Safaris – global navbar + WhatsApp float */
(function () {
  'use strict';

  function toggleMob(el) {
    var sub = el.nextElementSibling;
    if (!sub) return;
    var isOpen = sub.classList.contains('open');
    document.querySelectorAll('.mob-sub').forEach(function (s) { s.classList.remove('open'); });
    document.querySelectorAll('.mob-top').forEach(function (t) { t.classList.remove('expanded'); });
    if (!isOpen) {
      sub.classList.add('open');
      el.classList.add('expanded');
    }
  }
  window.toggleMob = toggleMob;

  function clampMegaPanels() {
    document.querySelectorAll('.mega-panel').forEach(function (panel) {
      panel.style.left = '';
      panel.style.transform = '';
      var rect = panel.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        var overflow = rect.right - window.innerWidth + 16;
        var currentLeft = parseFloat(getComputedStyle(panel).left) || 0;
        panel.style.left = (currentLeft - overflow) + 'px';
        panel.style.transform = 'none';
      }
      if (rect.left < 0) {
        panel.style.left = '0';
        panel.style.transform = 'none';
      }
    });
  }

  function initDropdowns() {
    document.querySelectorAll('.nav-item').forEach(function (item) {
      var panel = item.querySelector('.dropdown-panel');
      if (!panel) return;
      var closeTimer;
      item.addEventListener('mouseenter', function () {
        clearTimeout(closeTimer);
        document.querySelectorAll('.nav-item.is-open').forEach(function (open) {
          if (open !== item) open.classList.remove('is-open');
        });
        item.classList.add('is-open');
        setTimeout(clampMegaPanels, 10);
      });
      item.addEventListener('mouseleave', function () {
        closeTimer = setTimeout(function () {
          item.classList.remove('is-open');
        }, 160);
      });
    });
  }

  function initNavbar() {
    var hamburger = document.getElementById('hamburger');
    var drawer = document.getElementById('mobileDrawer');
    if (hamburger && drawer) {
      hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('open');
        drawer.classList.toggle('open');
      });
    }

    initDropdowns();

    var navWrap = document.getElementById('navbarWrap');
    var heroEl = document.getElementById('wgHomeHero');

    function updateNav() {
      if (!navWrap) return;
      if (!heroEl) {
        navWrap.classList.add('nav-over-content');
        navWrap.classList.toggle('scrolled', false);
        return;
      }
      var heroBottom = heroEl.getBoundingClientRect().bottom;
      var pastHero = heroBottom <= 0;
      navWrap.classList.toggle('scrolled', window.scrollY > 24 && !pastHero);
      navWrap.classList.toggle('nav-over-content', pastHero);
    }

    updateNav();
    window.addEventListener('scroll', updateNav, { passive: true });
    window.addEventListener('resize', updateNav);

    var waFloat = document.getElementById('wgWaFloat');
    var waToggle = document.getElementById('wgWaToggle');
    if (waFloat && waToggle) {
      waToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = waFloat.classList.toggle('open');
        waToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        var icon = waToggle.querySelector('i');
        if (icon) icon.className = open ? 'fas fa-times' : 'fab fa-whatsapp';
      });
      document.addEventListener('click', function (e) {
        if (!waFloat.contains(e.target)) {
          waFloat.classList.remove('open');
          waToggle.setAttribute('aria-expanded', 'false');
          var icon = waToggle.querySelector('i');
          if (icon) icon.className = 'fab fa-whatsapp';
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
  } else {
    initNavbar();
  }
})();
