(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var nav = document.getElementById("nav");
  var toggle = document.getElementById("nav-toggle");
  var links = document.querySelectorAll(".nav-links a");

  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  links.forEach(function (a) {
    a.addEventListener("click", function () {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    });
  });

  var sections = Array.prototype.map.call(links, function (a) {
    return document.querySelector(a.getAttribute("href"));
  });
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { if (s) spy.observe(s); });
  }

  var words = ["Bedrock servers", "Marketplace add-ons", "server networks", "Discord bots", "admin dashboards", "anti-cheat systems"];
  var rot = document.querySelector("#rotator .word");
  if (rot && !reduce) {
    var wi = 0;
    setInterval(function () {
      rot.classList.add("out");
      setTimeout(function () {
        wi = (wi + 1) % words.length;
        rot.textContent = words[wi];
        rot.classList.remove("out");
        rot.classList.add("in");
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { rot.classList.remove("in"); });
        });
      }, 450);
    }, 2600);
  }

  var canvas = document.getElementById("blocks");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, cubes = [], mx = 0, my = 0, tx = 0, ty = 0, running = true;

    function resize() {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(Math.min(46, Math.max(16, (W * H) / 26000)));
      cubes = [];
      for (var i = 0; i < count; i++) cubes.push(makeCube(true));
    }
    function makeCube(anywhere) {
      var z = Math.random();
      return {
        x: Math.random() * W,
        y: anywhere ? Math.random() * H : H + 40,
        s: 8 + z * 22,
        z: z,
        v: 0.08 + z * 0.22,
        copper: Math.random() < 0.18
      };
    }
    function drawCube(c) {
      var px = c.x + tx * (0.2 + c.z) * 18;
      var py = c.y + ty * (0.2 + c.z) * 18;
      var s = c.s, k = s * 0.866;
      var alpha = 0.06 + c.z * 0.16;
      var col = c.copper ? "212,137,90" : "92,179,160";
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(" + col + "," + alpha + ")";
      ctx.fillStyle = "rgba(" + col + "," + alpha * 0.22 + ")";
      ctx.beginPath();
      ctx.moveTo(px, py - s);
      ctx.lineTo(px + k, py - s / 2);
      ctx.lineTo(px, py);
      ctx.lineTo(px - k, py - s / 2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(px, py - s);
      ctx.lineTo(px + k, py - s / 2);
      ctx.lineTo(px + k, py + s / 2);
      ctx.lineTo(px, py + s);
      ctx.lineTo(px - k, py + s / 2);
      ctx.lineTo(px - k, py - s / 2);
      ctx.closePath();
      ctx.moveTo(px - k, py - s / 2);
      ctx.lineTo(px, py);
      ctx.lineTo(px + k, py - s / 2);
      ctx.moveTo(px, py);
      ctx.lineTo(px, py + s);
      ctx.stroke();
    }
    function frame() {
      if (!running) return;
      tx += (mx - tx) * 0.04;
      ty += (my - ty) * 0.04;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < cubes.length; i++) {
        var c = cubes[i];
        if (!reduce) {
          c.y -= c.v;
          if (c.y < -60) cubes[i] = makeCube(false);
        }
        drawCube(c);
      }
      if (!reduce) requestAnimationFrame(frame);
    }
    window.addEventListener("resize", function () { resize(); if (reduce) frame(); });
    window.addEventListener("pointermove", function (e) {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });
    if ("IntersectionObserver" in window && !reduce) {
      new IntersectionObserver(function (entries) {
        var vis = entries[0].isIntersecting;
        if (vis && !running) { running = true; requestAnimationFrame(frame); }
        else if (!vis) running = false;
      }).observe(canvas);
    }
    resize();
    frame();
  }

  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (reduce) { el.textContent = target; return; }
    var start = null, dur = 1400;
    function step(t) {
      if (start === null) start = t;
      var p = Math.min(1, (t - start) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var revealObs = "IntersectionObserver" in window ? new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("shown");
      e.target.querySelectorAll("[data-count]").forEach(countUp);
      obs.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }) : null;

  function watch(el) {
    if (revealObs) revealObs.observe(el);
    else { el.classList.add("shown"); el.querySelectorAll("[data-count]").forEach(countUp); }
  }
  document.querySelectorAll(".reveal").forEach(watch);

  document.querySelectorAll(".platform").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  var arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M8 7h9v9"/></svg>';
  var statusText = { released: "Released", approval: "Awaiting approval", development: "In development" };

  function parseProject(p) {
    var title = String(p.title || "");
    var type = "";
    var m = title.match(/^\[([^\]]+)\]\s*/);
    if (m) { type = m[1]; title = title.slice(m[0].length); }
    var status = "released";
    var s = title.match(/\s+-\s+(Awaiting Mojang Approval|In Development)\s*$/i);
    if (s) {
      status = /develop/i.test(s[1]) ? "development" : "approval";
      title = title.slice(0, s.index);
    } else if (!p.link) {
      status = "development";
    }
    return { title: title, type: type, status: status, studio: String(p.description || ""), thumb: p.thumbnail, link: p.link };
  }

  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function tile(canvasEl, seedText) {
    var c = canvasEl.getContext("2d");
    var w = 320, h = 180, n = 16;
    canvasEl.width = w; canvasEl.height = h;
    var seed = hash(seedText);
    function rnd() { seed = (Math.imul(seed ^ (seed >>> 15), 2246822507) + 0x9e3779b9) >>> 0; return seed / 4294967296; }
    var palettes = [
      ["#16201f", "#1c2b29", "#24413b", "#2f5a50", "#5cb3a0"],
      ["#1d1a17", "#2a221c", "#3d2c22", "#6b4630", "#d4895a"],
      ["#151b22", "#1b2530", "#22344a", "#2f4d6e", "#7fa7d9"]
    ];
    var pal = palettes[hash(seedText + "p") % palettes.length];
    var size = w / n;
    for (var y = 0; y < Math.ceil(h / size); y++) {
      for (var x = 0; x < n; x++) {
        var depth = y / (h / size);
        var r = rnd() * 0.6 + depth * 0.5;
        var idx = Math.min(3, Math.floor(r * 3));
        if (rnd() > 0.965) idx = 4;
        c.fillStyle = pal[idx];
        c.fillRect(x * size, y * size, size + 1, size + 1);
      }
    }
    var g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "rgba(13,17,20,0.05)");
    g.addColorStop(1, "rgba(13,17,20,0.55)");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
  }

  var grid = document.getElementById("projects-grid");
  var filterBtns = document.querySelectorAll(".filter");
  var cards = [];

  var order = { released: 0, approval: 1, development: 2 };

  function render(list) {
    list = list.slice().sort(function (a, b) { return order[parseProject(a).status] - order[parseProject(b).status]; });
    grid.innerHTML = "";
    cards = [];
    var counts = { all: list.length, released: 0, approval: 0, development: 0 };
    list.forEach(function (raw, i) {
      var p = parseProject(raw);
      counts[p.status]++;
      var card = document.createElement(p.link ? "a" : "article");
      card.className = "project reveal";
      card.style.setProperty("--d", ((i % 3) * 0.06) + "s");
      card.dataset.status = p.status;
      if (p.link) { card.href = p.link; card.target = "_blank"; card.rel = "noopener"; }

      var media = document.createElement("div");
      media.className = "project-media";
      if (p.thumb && p.thumb !== "default") {
        var img = document.createElement("img");
        img.src = p.thumb; img.alt = p.title; img.loading = "lazy";
        media.appendChild(img);
      } else {
        var cv = document.createElement("canvas");
        cv.setAttribute("aria-hidden", "true");
        tile(cv, p.title);
        media.appendChild(cv);
      }
      var badge = document.createElement("span");
      badge.className = "badge " + p.status;
      badge.textContent = statusText[p.status];
      media.appendChild(badge);
      if (p.type) {
        var type = document.createElement("span");
        type.className = "type";
        type.textContent = p.type;
        media.appendChild(type);
      }

      var body = document.createElement("div");
      body.className = "project-body";
      var h3 = document.createElement("h3");
      h3.textContent = p.title;
      var studio = document.createElement("div");
      studio.className = "studio";
      studio.textContent = p.studio;
      var more = document.createElement("span");
      more.className = "more" + (p.link ? "" : " muted");
      if (p.link) more.innerHTML = "View on Marketplace " + arrow;
      else more.textContent = p.status === "approval" ? "Coming soon to the Marketplace" : "Work in progress";
      body.appendChild(h3); body.appendChild(studio); body.appendChild(more);

      card.appendChild(media); card.appendChild(body);
      grid.appendChild(card);
      cards.push(card);
      watch(card);
    });
    Object.keys(counts).forEach(function (k) {
      var el = document.querySelector('[data-n="' + k + '"]');
      if (el) el.textContent = counts[k];
    });
    filterBtns.forEach(function (b) {
      if (b.dataset.filter !== "all" && !counts[b.dataset.filter]) b.hidden = true;
    });
    var pc = document.getElementById("project-count");
    if (pc) {
      pc.setAttribute("data-count", list.length);
      if (pc.closest(".shown")) pc.textContent = list.length;
    }
  }

  filterBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var f = b.dataset.filter;
      filterBtns.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      cards.forEach(function (c) {
        var show = f === "all" || c.dataset.status === f;
        c.classList.toggle("hide", !show);
        if (show) c.classList.add("shown");
      });
    });
  });

  fetch("projects.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
    .then(function (list) { if (Array.isArray(list)) render(list); })
    .catch(function () {});

  var quotes = [
    { q: "The best way to predict the future is to invent it.", a: "Alan Kay" },
    { q: "Any sufficiently advanced technology is indistinguishable from magic.", a: "Arthur C. Clarke" },
    { q: "First, solve the problem. Then, write the code.", a: "John Johnson" },
    { q: "Code is like humor. When you have to explain it, it's bad.", a: "Cory House" },
    { q: "Programs must be written for people to read, and only incidentally for machines to execute.", a: "Harold Abelson" },
    { q: "The only way to do great work is to love what you do.", a: "Steve Jobs" },
    { q: "In the middle of difficulty lies opportunity.", a: "Albert Einstein" }
  ];
  var qi = 0;
  var qBox = document.getElementById("quote");
  var qText = document.getElementById("quote-text");
  var qAuthor = document.getElementById("quote-author");

  function showQuote(i) {
    if (!quotes.length) return;
    qBox.classList.add("fading");
    setTimeout(function () {
      qText.textContent = quotes[i].q;
      qAuthor.textContent = quotes[i].a;
      qBox.classList.remove("fading");
    }, reduce ? 0 : 450);
  }
  function nextQuote() { qi = (qi + 1) % quotes.length; showQuote(qi); }
  document.getElementById("quote-next").addEventListener("click", nextQuote);
  setInterval(nextQuote, 30000);

  fetch("https://zenquotes.io/api/quotes/")
    .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
    .then(function (data) {
      var list = (data || []).map(function (x) { return { q: x.q, a: x.a }; })
        .filter(function (x) { return x.q && x.a && x.q !== "..." && !/Too many requests/i.test(x.q); });
      if (list.length) { quotes = list; qi = 0; showQuote(0); }
    })
    .catch(function () {});

  var clock = document.getElementById("clock");
  function tick() {
    var d = new Date();
    clock.textContent = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }
  tick();
  setInterval(tick, 1000);
  document.getElementById("year").textContent = new Date().getFullYear();
})();
