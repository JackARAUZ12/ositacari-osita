(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     BOTÓN "DESCUBRIR" -> scroll a la galería
  --------------------------------------------------------- */
  var scrollBtn = document.getElementById("scrollBtn");
  var gallery = document.getElementById("gallery");
  if (scrollBtn && gallery) {
    scrollBtn.addEventListener("click", function () {
      gallery.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* ---------------------------------------------------------
     TARJETAS "TE AMO PORQUE..." (flip al click / tap)
  --------------------------------------------------------- */
  var cards = document.querySelectorAll(".card");
  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      card.classList.toggle("is-flipped");
    });
  });

  /* ---------------------------------------------------------
     REVEAL ON SCROLL
  --------------------------------------------------------- */
  var revealTargets = document.querySelectorAll(
    ".gallery__item, .letter__wrap, .reasons .card, .closing__text, .closing__sign, .closing__nick, .section__title, .section__eyebrow"
  );
  revealTargets.forEach(function (el) { el.classList.add("reveal"); });

  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------------------------------------------------
     BRASAS FLOTANTES (canvas)
     Partículas suaves subiendo, como chispas de una fogata.
  --------------------------------------------------------- */
  function initEmbers(canvasId, opts) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var settings = Object.assign(
      { count: 34, colorA: "232,103,44", colorB: "212,162,78", maxSize: 3.4, speed: 1 },
      opts || {}
    );

    var particles = [];
    var w, h, dpr;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeParticle() {
      return {
        x: Math.random() * w,
        y: h + Math.random() * 80,
        size: 0.6 + Math.random() * settings.maxSize,
        speed: (0.25 + Math.random() * 0.55) * settings.speed,
        drift: (Math.random() - 0.5) * 0.4,
        life: 0,
        maxLife: 260 + Math.random() * 260,
        flicker: Math.random() * Math.PI * 2,
        color: Math.random() > 0.5 ? settings.colorA : settings.colorB
      };
    }

    function init() {
      resize();
      particles = [];
      for (var i = 0; i < settings.count; i++) {
        var p = makeParticle();
        p.life = Math.random() * p.maxLife;
        p.y = h - (p.life / p.maxLife) * (h + 120);
        particles.push(p);
      }
    }

    var lastTime = 0;
    function tick(t) {
      if (reduceMotion) return; // static, no animation loop
      var dt = Math.min(32, t - lastTime || 16);
      lastTime = t;

      ctx.clearRect(0, 0, w, h);

      particles.forEach(function (p) {
        p.life += dt / 16;
        p.y -= p.speed;
        p.x += p.drift + Math.sin((p.life + p.flicker) / 18) * 0.3;

        var lifeRatio = p.life / p.maxLife;
        var fadeIn = Math.min(1, p.life / 20);
        var fadeOut = 1 - Math.max(0, lifeRatio - 0.7) / 0.3;
        var alpha = Math.max(0, Math.min(fadeIn, fadeOut)) * 0.85;

        ctx.beginPath();
        ctx.fillStyle = "rgba(" + p.color + "," + alpha.toFixed(3) + ")";
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.life >= p.maxLife || p.y < -20) {
          Object.assign(p, makeParticle());
        }
      });

      requestAnimationFrame(tick);
    }

    init();
    if (!reduceMotion) {
      requestAnimationFrame(tick);
    } else {
      // Draw a single static soft frame for reduced-motion users
      ctx.clearRect(0, 0, w, h);
      particles.forEach(function (p) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(" + p.color + ",0.25)";
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(init, 150);
    });
  }

  initEmbers("embers", { count: 40, speed: 1 });
  initEmbers("embers2", { count: 20, speed: 0.7, maxSize: 2.6 });
})();
