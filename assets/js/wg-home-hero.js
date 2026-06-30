/* Wild Gaze Safaris – homepage hero typing + calm slideshow */
(function () {
  'use strict';

  var FADE_MS = 2000;
  var DELAY = 8000;
  var TYPE_DELAY = 400;
  var TYPE_CHAR_MS = 52;

  function initTyping() {
    var hero = document.getElementById('wgHomeHero');
    var titleEl = document.getElementById('wgHeroTypeTitle');
    var typeEl = document.getElementById('wgTypeText');
    var plain = 'Where the Wild Truly Begins';
    var finalHTML = 'Where the Wild <span class="wg-gold">Truly Begins</span>';

    function finish() {
      if (typeEl) typeEl.innerHTML = finalHTML;
      if (titleEl) titleEl.classList.add('typed-done');
      if (hero) hero.classList.add('hero-typed');
    }

    if (!typeEl || !titleEl) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }

    var i = 0;
    function tick() {
      i++;
      typeEl.textContent = plain.slice(0, i);
      if (i < plain.length) {
        setTimeout(tick, TYPE_CHAR_MS);
      } else {
        finish();
      }
    }
    setTimeout(tick, TYPE_DELAY);
  }

  function initSlideshow() {
    var hero = document.getElementById('wgHomeHero');
    var slides = document.querySelectorAll('#wgHomeSlides .wg-home-hero-slide');
    var dots = document.querySelectorAll('#wgHomeDots .wg-home-dot');
    var progressBar = document.getElementById('wgSlideProgressBar');
    var dotsWrap = document.getElementById('wgHomeDots');
    var current = 0;
    var timer = null;
    var progRaf = null;
    var leavingTimer = null;
    var transitionTimer = null;
    var paused = false;
    var slideStart = 0;

    if (!hero || !slides.length) return;

    requestAnimationFrame(function () {
      hero.classList.add('wg-slideshow-live');
      slides.forEach(function (s) { s.classList.remove('is-initial'); });
    });

    function beginTransition() {
      hero.classList.add('wg-hero-transitioning');
      clearTimeout(transitionTimer);
      transitionTimer = setTimeout(function () {
        hero.classList.remove('wg-hero-transitioning');
      }, FADE_MS);
    }

    function animateProgress() {
      if (!progressBar) return;
      cancelAnimationFrame(progRaf);
      slideStart = performance.now();
      function tick(now) {
        if (paused) return;
        var pct = Math.min((now - slideStart) / DELAY, 1);
        progressBar.style.width = (pct * 100) + '%';
        if (pct < 1) progRaf = requestAnimationFrame(tick);
      }
      progressBar.style.width = '0%';
      progRaf = requestAnimationFrame(tick);
    }

    function goTo(idx) {
      if (idx === current && slides[current].classList.contains('active')) return;

      beginTransition();

      var prev = current;
      slides[prev].classList.remove('active', 'is-initial');
      slides[prev].classList.add('leaving');
      if (dots[prev]) {
        dots[prev].classList.remove('active');
        dots[prev].setAttribute('aria-current', 'false');
      }

      clearTimeout(leavingTimer);
      leavingTimer = setTimeout(function () {
        slides[prev].classList.remove('leaving');
      }, FADE_MS);

      current = (idx + slides.length) % slides.length;

      slides[current].classList.add('active');
      slides[current].setAttribute('aria-hidden', 'false');
      if (slides[prev]) slides[prev].setAttribute('aria-hidden', 'true');
      if (dots[current]) {
        dots[current].classList.add('active');
        dots[current].setAttribute('aria-current', 'true');
      }
      animateProgress();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function start() {
      if (slides.length < 2 || paused) return;
      clearInterval(timer);
      animateProgress();
      timer = setInterval(next, DELAY);
    }

    function stop() {
      clearInterval(timer);
      cancelAnimationFrame(progRaf);
    }

    function pause() {
      paused = true;
      stop();
    }

    function resume() {
      paused = false;
      start();
    }

    function reset() {
      paused = false;
      start();
    }

    dots.forEach(function (d) {
      d.addEventListener('click', function () {
        goTo(parseInt(d.getAttribute('data-idx'), 10));
        reset();
      });
    });

    if (dotsWrap) {
      dotsWrap.addEventListener('mouseenter', pause);
      dotsWrap.addEventListener('mouseleave', resume);
      dotsWrap.addEventListener('focusin', pause);
      dotsWrap.addEventListener('focusout', function (e) {
        if (!dotsWrap.contains(e.relatedTarget)) resume();
      });
    }

    hero.addEventListener('mouseenter', pause);
    hero.addEventListener('mouseleave', resume);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pause(); else resume();
    });

    hero.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { next(); reset(); }
      if (e.key === 'ArrowLeft') { prev(); reset(); }
    });

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) resume(); else pause();
      }, { threshold: 0.12 });
      observer.observe(hero);
    }

    start();
  }

  function init() {
    initTyping();
    initSlideshow();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
