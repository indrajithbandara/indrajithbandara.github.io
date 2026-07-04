/* =========================================================
   Indrajith Bandara — Portfolio
   Vanilla JS only. No dependencies.
   ========================================================= */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    setYear();
    hidePreloader();
    initNav();
    initThemeToggle();
    initBackToTop();
    initTypingEffect();
    initNetworkCanvas();
    initScrollReveal();
    initSkillBars();
    initCounters();
    initLiveGithubStats();
    initBadges();
    initContactForm();
  }

  /* ---------- footer year ---------- */
  function setYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- preloader ---------- */
  function hidePreloader() {
    var pre = document.getElementById("preloader");
    if (!pre) return;
    window.addEventListener("load", function () {
      setTimeout(function () { pre.classList.add("is-hidden"); }, 400);
    });
  }

  /* ---------- nav: scrolled state + mobile toggle ---------- */
  function initNav() {
    var nav = document.getElementById("nav");
    var toggle = document.getElementById("navToggle");
    var links = document.getElementById("navLinks");

    function onScroll() {
      if (window.scrollY > 12) nav.classList.add("is-scrolled");
      else nav.classList.remove("is-scrolled");
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (toggle && links) {
      toggle.addEventListener("click", function () {
        var isOpen = links.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
      links.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          links.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  /* ---------- back to top ---------- */
  function initBackToTop() {
    var btn = document.getElementById("backToTop");
    if (!btn) return;
    window.addEventListener("scroll", function () {
      if (window.scrollY > 480) btn.classList.add("is-visible");
      else btn.classList.remove("is-visible");
    }, { passive: true });
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- theme toggle ---------- */
  function initThemeToggle() {
    var toggle = document.getElementById("themeToggle");
    var root = document.documentElement;
    if (!toggle) return;
    var saved = null;
    try { saved = window.localStorage.getItem("ib-theme"); } catch (e) {}
    if (saved === "light") root.setAttribute("data-theme", "light");
    toggle.addEventListener("click", function () {
      var isLight = root.getAttribute("data-theme") === "light";
      if (isLight) root.removeAttribute("data-theme");
      else root.setAttribute("data-theme", "light");
      try { window.localStorage.setItem("ib-theme", isLight ? "dark" : "light"); } catch (e) {}
    });
  }

  /* ---------- hero terminal typing effect ---------- */
  function initTypingEffect() {
    var nameEl = document.getElementById("typedName");
    var roleEl = document.getElementById("typedRole");
    if (!nameEl || !roleEl) return;
    var name = "Indrajith Bandara";
    var roles = [
      "Cybersecurity Advisor",
      "Cisco Instructor Trainer",
      "Networking Specialist",
      "Cloud Computing Trainer",
      "Open Source Developer"
    ];
    typeText(nameEl, name, 55, function () { cycleRoles(roleEl, roles, 0); });
  }

  function typeText(el, text, speed, onDone) {
    var i = 0;
    (function step() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(step, speed);
      } else if (onDone) { onDone(); }
    })();
  }

  function cycleRoles(el, roles, index) {
    var current = roles[index % roles.length];
    var i = 0;
    var typing = true;
    (function step() {
      if (typing) {
        el.textContent = current.slice(0, i);
        i++;
        if (i <= current.length) {
          setTimeout(step, 45);
        } else {
          setTimeout(function () { typing = false; step(); }, 1400);
        }
      } else {
        el.textContent = current.slice(0, i);
        i--;
        if (i >= 0) {
          setTimeout(step, 25);
        } else {
          setTimeout(function () { cycleRoles(el, roles, index + 1); }, 200);
        }
      }
    })();
  }

  /* ---------- network-node canvas ---------- */
  function initNetworkCanvas() {
    var canvas = document.getElementById("netCanvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var hero = canvas.closest(".hero");
    var nodes = [];
    var W, H;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resize() {
      W = canvas.width = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
      var count = Math.max(18, Math.floor((W * H) / 60000));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(0, 224, 143, 0.10)";
      ctx.lineWidth = 1;
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        if (!reduceMotion) {
          a.x += a.vx; a.y += a.vy;
          if (a.x < 0 || a.x > W) a.vx *= -1;
          if (a.y < 0 || a.y > H) a.vy *= -1;
        }
        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.globalAlpha = 1 - dist / 150;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(0, 224, 143, 0.45)";
      for (var k = 0; k < nodes.length; k++) {
        ctx.beginPath(); ctx.arc(nodes[k].x, nodes[k].y, 1.6, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    resize();
    window.addEventListener("resize", resize);
    draw();
  }

  /* ---------- scroll reveal ---------- */
  function initScrollReveal() {
    var items = document.querySelectorAll("[data-aos]");
    if (!("IntersectionObserver" in window) || items.length === 0) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.15 });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- skill bars ---------- */
  function initSkillBars() {
    var skills = document.querySelectorAll(".skill");
    if (skills.length === 0 || !("IntersectionObserver" in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var fill = entry.target.querySelector(".skill__fill");
          var level = entry.target.getAttribute("data-level") || "0";
          if (fill) fill.style.width = level + "%";
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    skills.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- animated counters ---------- */
  function initCounters() {
    var counters = document.querySelectorAll(".stat__num, .badge-stat__num");
    if (counters.length === 0 || !("IntersectionObserver" in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCounter(entry.target); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { observer.observe(el); });
  }

  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var startTime = null;
    (function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / 1200, 1);
      el.textContent = Math.floor((1 - Math.pow(1 - progress, 3)) * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    })(performance.now());
  }

  /* ---------- live GitHub follower count ---------- */
  function initLiveGithubStats() {
    var el = document.getElementById("ghFollowers");
    if (!el) return;
    fetch("https://api.github.com/users/indrajithbandara")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (data && typeof data.followers === "number") {
          el.setAttribute("data-count", String(data.followers));
        }
      })
      .catch(function () {});
  }

  /* ---------- digital badges — loaded from badges.json ---------- */
  function initBadges() {
    var container = document.getElementById("badges-container");
    var loading = document.getElementById("badges-loading");
    if (!container) return;

    fetch("badges.json")
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (badges) {
        if (loading) loading.remove();
        badges.forEach(function (b) {
          var card = document.createElement("article");
          card.className = "badge-card-pro";
          card.setAttribute("data-aos", "");
          card.innerHTML =
            '<div class="badge-card-pro__img-wrap">' +
              '<img src="' + b.image + '" alt="' + b.title + '" loading="lazy" ' +
              'onerror="this.onerror=null;this.src=\'assets/icons/favicon.svg\'">' +
            '</div>' +
            '<div class="badge-card-pro__body">' +
              '<h3 class="badge-card-pro__title">' + b.title + '</h3>' +
              '<p class="badge-card-pro__issuer">' + b.issuer + '</p>' +
              '<a href="' + b.url + '" target="_blank" rel="noopener" class="badge-card-pro__btn">' +
                'View Badge ' +
                '<svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
              '</a>' +
            '</div>';
          container.appendChild(card);
        });
        /* trigger scroll reveal on newly added cards */
        var newItems = container.querySelectorAll("[data-aos]");
        if ("IntersectionObserver" in window) {
          var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
              if (e.isIntersecting) { e.target.classList.add("is-visible"); obs.unobserve(e.target); }
            });
          }, { threshold: 0.1 });
          newItems.forEach(function (el) { obs.observe(el); });
        } else {
          newItems.forEach(function (el) { el.classList.add("is-visible"); });
        }
      })
      .catch(function () {
        if (loading) loading.textContent = "Could not load badges.";
      });
  }

  /* ---------- contact form ---------- */
  function initContactForm() {
    var form = document.getElementById("contactForm");
    var note = document.getElementById("formNote");
    if (!form || !note) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        note.textContent = "Please fill in all fields correctly.";
        note.style.color = "var(--danger)";
        return;
      }
      note.style.color = "";
      note.textContent = "Message ready — connect a form backend (e.g. Formspree) to deliver it.";
      form.reset();
    });
  }

})();
