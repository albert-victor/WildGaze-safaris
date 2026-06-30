/* Wild Gaze Safaris – global footer */
(function () {
  'use strict';

  function initFooterNav() {
    document.querySelectorAll('.wg-footer-nav-toggle').forEach(function (btn) {
      var nav = btn.closest('.wg-footer-nav');
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!nav || !panel) return;

      btn.addEventListener('click', function () {
        var open = nav.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });

    function resetPanels() {
      if (window.innerWidth > 640) {
        document.querySelectorAll('.wg-footer-nav').forEach(function (nav) {
          nav.classList.remove('is-open');
          var btn = nav.querySelector('.wg-footer-nav-toggle');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
      }
    }

    window.addEventListener('resize', resetPanels);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFooterNav);
  } else {
    initFooterNav();
  }
})();
