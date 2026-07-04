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
    initContactForm();
  }

  /* ---------- theme toggle (dark default, light optional) ---------- */
  function initThemeToggle() {
    var toggle = document.getElementById("themeToggle");
    var root = document.documentElement;
    if (!toggle) return;

    var saved = null;
    try {
      saved = window.localStorage.getItem("ib-theme");
    } catch (e) {
      saved = null;
    }
    if (saved === "light") root.setAttribute("data-theme", "light");

    toggle.addEventListener("click", function () {
      var isLight = root.getAttribute("data-theme") === "light";
      if (isLight) {
        root.removeAttribute("data-theme");
      } else {
        root.setAttribute("data-theme", "light");
      }
      try {
        window.localStorage.setItem("ib-theme", isLight ? "dark" : "light");
      } catch (e) {
        /* localStorage unavailable — theme just won't persist across reloads */
      }
    });
  }

  /* ---------- live GitHub stats (followers / stars) via public API ---------- */
  function initLiveGithubStats() {
    var followersEl = document.getElementById("ghFollowers");
    var starsEl = document.getElementById("ghStars");
    if (!followersEl && !starsEl) return;

    fetch("https://api.github.com/users/indrajithbandara")
      .then(function (res) {
        return res.ok ? res.json() : null;
      })
      .then(function (data) {
        if (data && followersEl && typeof data.followers === "number") {
          followersEl.setAttribute("data-count", String(data.followers));
        }
      })
      .catch(function () {
        /* network/API unavailable — static fallback count already in data-count stays */
      });

    // Stars require summing across repos; GitHub's API doesn't expose a
    // single "total stars" field, so this stays on the static fallback
    // unless you wire up a aggregator like github-readme-stats (already
    // embedded visually in the GitHub Statistics section above).
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
      setTimeout(function () {
        pre.classList.add("is-hidden");
      }, 400);
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
    window.addEventListener(
      "scroll",
      function () {
        if (window.scrollY > 480) btn.classList.add("is-visible");
        else btn.classList.remove("is-visible");
      },
      { passive: true }
    );
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
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

    typeText(nameEl, name, 55, function () {
      cycleRoles(roleEl, roles, 0);
    });
  }

  function typeText(el, text, speed, onDone) {
    var i = 0;
    (function step() {
      if (i <= text.length) {
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(step, speed);
      } else if (onDone) {
        onDone();
      }
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
          setTimeout(function () {
            typing = false;
            step();
          }, 1400);
        }
      } else {
        el.textContent = current.slice(0, i);
        i--;
        if (i >= 0) {
          setTimeout(step, 25);
        } else {
          setTimeout(function () {
            cycleRoles(el, roles, index + 1);
          }, 200);
        }
      }
    })();
  }

  /* ---------- ambient network-node canvas in hero ---------- */
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
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25
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
          a.x += a.vx;
          a.y += a.vy;
          if (a.x < 0 || a.x > W) a.vx *= -1;
          if (a.y < 0 || a.y > H) a.vy *= -1;
        }
        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j];
          var dx = a.x - b.x,
            dy = a.y - b.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.globalAlpha = 1 - dist / 150;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      ctx.fillStyle = "rgba(0, 224, 143, 0.45)";
      for (var k = 0; k < nodes.length; k++) {
        ctx.beginPath();
        ctx.arc(nodes[k].x, nodes[k].y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw();
  }

  /* ---------- scroll reveal for [data-aos] elements ---------- */
  function initScrollReveal() {
    var items = document.querySelectorAll("[data-aos]");
    if (!("IntersectionObserver" in window) || items.length === 0) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- animated skill progress bars ---------- */
  function initSkillBars() {
    var skills = document.querySelectorAll(".skill");
    if (skills.length === 0 || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var fill = entry.target.querySelector(".skill__fill");
            var level = entry.target.getAttribute("data-level") || "0";
            if (fill) fill.style.width = level + "%";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    skills.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- animated number counters ---------- */
  function initCounters() {
    var counters = document.querySelectorAll(".stat__num");
    if (counters.length === 0 || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach(function (el) {
      observer.observe(el);
    });
  }

  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var duration = 1200;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(step);
  }

  function initContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const originalText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = "Sending...";

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        alert("✅ Message sent successfully!");
        form.reset();
      } else {
        alert("❌ " + result.message);
      }
    } catch (err) {
      alert("❌ Failed to send message.");
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const originalText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = "Sending...";

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        alert("✅ Message sent successfully!");
        form.reset();
      } else {
        alert("❌ " + result.message);
      }
    } catch (err) {
      alert("❌ Failed to send message.");
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  });
});

/* =========================================================
   Digital Badges — Credly API live fetch
   ========================================================= */
(function() {
  var BADGE_IDS = [
    '5d3f2b7d-d16c-4138-94d5-099418588835',
    '873303f9-176a-48e8-bb9d-a5664aee75ac',
    '78a3a417-9217-45dd-8919-754853ba6f15',
    '60a3e6a2-b322-46e8-9a99-f5ecdb2cd910',
    'ee279fd4-78e2-493a-ab58-4e8f0e96740f',
    'b89c3626-4b78-4db2-9bd4-9dadc595a83c',
    '2eeb928f-2880-4618-9618-0c0540278717',
    'b0013760-4c7f-4320-90ff-42be2f42279d',
    '9f7a9b0a-d94a-494c-a4b6-581cc3411f14',
    '485f9368-c565-4d7c-b779-04f66c2c2fd9',
    '4c82909b-444a-486b-8b9d-a5664aee75ac',
    'f23a378d-bf7c-4279-be78-3a2bfcc2962e'
  ];

  var grid = document.getElementById('badgesGrid');
  var loading = document.getElementById('badgesLoading');
  if (!grid) return;

  var loaded = 0;
  var badges = new Array(BADGE_IDS.length).fill(null);

  function renderBadge(data, idx) {
    var card = document.createElement('article');
    card.className = 'badge-card-pro';
    card.setAttribute('data-aos', '');
    card.style.animationDelay = (idx * 0.07) + 's';

    var badgeUrl = 'https://www.credly.com/badges/' + BADGE_IDS[idx] + '/public_url';
    var img = data && data.image ? data.image.url || data.image : 'assets/icons/favicon.svg';
    var title = data && data.badge && data.badge.name ? data.badge.name : 'Digital Badge';
    var issuer = data && data.badge && data.badge.issuer && data.badge.issuer.entities
      ? data.badge.issuer.entities[0].entity.name
      : data && data.issuer ? data.issuer : 'Credly';

    card.innerHTML =
      '<div class="badge-card-pro__img-wrap">' +
        '<img src="' + img + '" alt="' + title + '" loading="lazy" onerror="this.src=\'assets/icons/favicon.svg\'">' +
      '</div>' +
      '<div class="badge-card-pro__body">' +
        '<h3 class="badge-card-pro__title">' + title + '</h3>' +
        '<p class="badge-card-pro__issuer">' + issuer + '</p>' +
        '<a href="' + badgeUrl + '" target="_blank" rel="noopener" class="badge-card-pro__btn">' +
          'View Badge' +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</a>' +
      '</div>';

    return card;
  }

  function checkDone() {
    loaded++;
    if (loaded === BADGE_IDS.length) {
      if (loading) loading.remove();
      badges.forEach(function(data, idx) {
        grid.appendChild(renderBadge(data, idx));
      });
      // trigger scroll reveal
      if (window.initScrollReveal) window.initScrollReveal();
    }
  }

  BADGE_IDS.forEach(function(id, idx) {
    fetch('https://api.credly.com/v1/obi/v3/badge_assertions/' + id, {
      headers: { 'Accept': 'application/json' }
    })
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(json) {
      if (json && json.result) {
        badges[idx] = json.result;
      }
      checkDone();
    })
    .catch(function() {
      checkDone();
    });
  });
})();
