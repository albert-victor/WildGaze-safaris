(function () {
  'use strict';

  var overlay = null;
  var stageImg = null;
  var captionEl = null;
  var items = [];
  var current = 0;

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'wg-lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Image gallery');
    overlay.innerHTML =
      '<button type="button" class="wg-lightbox-close" aria-label="Close gallery">&times;</button>' +
      '<button type="button" class="wg-lightbox-prev" aria-label="Previous image">&#8249;</button>' +
      '<button type="button" class="wg-lightbox-next" aria-label="Next image">&#8250;</button>' +
      '<div class="wg-lightbox-stage">' +
        '<img src="" alt="">' +
        '<div class="wg-lightbox-caption"></div>' +
      '</div>';

    document.body.appendChild(overlay);

    stageImg = overlay.querySelector('.wg-lightbox-stage img');
    captionEl = overlay.querySelector('.wg-lightbox-caption');

    overlay.querySelector('.wg-lightbox-close').addEventListener('click', close);
    overlay.querySelector('.wg-lightbox-prev').addEventListener('click', prev);
    overlay.querySelector('.wg-lightbox-next').addEventListener('click', next);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    document.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    });
  }

  function collectItems() {
    items = [];

    document.querySelectorAll('a.wg-lightbox').forEach(function (a) {
      items.push({
        src: a.getAttribute('href') || a.querySelector('img')?.src,
        alt: a.querySelector('img')?.alt || a.getAttribute('aria-label') || '',
        el: a
      });
    });

    document.querySelectorAll('img.wg-lightbox, img[data-wg-lightbox]').forEach(function (img) {
      if (img.closest('a.wg-lightbox')) return;
      items.push({ src: img.src, alt: img.alt || '', el: img });
    });

    /* Auto-enhance content images in intro / experience sections */
    document.querySelectorAll(
      '.wg-zan-intro-img-main, .wg-zan-intro-img-accent, .wg-zan-exp-img img, ' +
      '.wg-kilipromo-img-wrap img, [class*="-intro-img"] img, [class*="-gallery"] img, ' +
      '.wg-about-mosaic-item img, .wg-about-team-card img, .wg-about-bts-main img, ' +
      '.wg-about-bts-stack-item img, .wg-about-director-frame img'
    ).forEach(function (img) {
      if (img.closest('a.wg-lightbox') || img.classList.contains('wg-lightbox-skip')) return;
      if (img.closest('.navbar-wrap') || img.closest('.site-footer')) return;
      if (img.closest('.logo-wrap')) return;
      img.classList.add('wg-lightbox');
      items.push({ src: img.src, alt: img.alt || '', el: img });
    });
  }

  function bindClicks() {
    items.forEach(function (item, i) {
      var el = item.el;
      if (!el || el.dataset.wgLbBound) return;
      el.dataset.wgLbBound = '1';
      el.style.cursor = 'zoom-in';

      el.addEventListener('click', function (e) {
        if (el.tagName === 'A') e.preventDefault();
        else e.preventDefault();
        open(i);
      });
    });
  }

  function show(idx) {
    current = (idx + items.length) % items.length;
    var item = items[current];
    stageImg.src = item.src;
    stageImg.alt = item.alt;
    captionEl.textContent = item.alt;
    overlay.querySelector('.wg-lightbox-prev').style.display = items.length > 1 ? '' : 'none';
    overlay.querySelector('.wg-lightbox-next').style.display = items.length > 1 ? '' : 'none';
  }

  function open(idx) {
    if (!overlay) buildOverlay();
    show(idx);
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    stageImg.src = '';
  }

  function prev() { show(current - 1); }
  function next() { show(current + 1); }

  function init() {
    collectItems();
    bindClicks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
