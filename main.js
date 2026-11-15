// Site interactions: background grid, rotating role text, console intro,
// counters, scroll reveal, active nav, and mobile menu.
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Animated node-grid background ----
  const canvas = document.getElementById("grid-bg");
  const ctx = canvas.getContext("2d");
  let nodes = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.min(70, Math.floor((canvas.width * canvas.height) / 22000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d = Math.hypot(dx, dy);
        if (d < 140) {
          ctx.strokeStyle = `rgba(46, 230, 166, ${0.12 * (1 - d / 140)})`;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.fillStyle = "rgba(46, 230, 166, 0.35)";
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    if (!reduceMotion) requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  draw();

  // ---- Rotating role text ----
  const isJa = document.documentElement.lang === "ja";
  const roles = isJa
    ? ["ペネトレーションテスター", "レッドチーム・コンサルタント", "セキュリティアドバイザー", "パープルチーム・パートナー"]
    : ["Penetration Tester", "Red Team Consultant", "Security Advisor", "Purple Team Partner"];
  const roleEl = document.getElementById("role");
  let roleIdx = 0, charIdx = roles[0].length, deleting = true;

  function typeRole() {
    const word = roles[roleIdx];
    roleEl.textContent = word.slice(0, charIdx);
    if (deleting) {
      charIdx--;
      if (charIdx < 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        charIdx = 0;
      }
      setTimeout(typeRole, 45);
    } else {
      charIdx++;
      if (charIdx > roles[roleIdx].length) {
        deleting = true;
        charIdx = roles[roleIdx].length;
        setTimeout(typeRole, 2200);
        return;
      }
      setTimeout(typeRole, 80);
    }
  }
  if (!reduceMotion) setTimeout(typeRole, 2200);

  // ---- Console intro (profile summary) ----
  const lines = isJa ? [
    ["p", "$ "], ["", "whoami\n"],
    ["k", "  name   "], ["", "パパシェル\n"],
    ["k", "  role   "], ["", "ペンテスター / レッドチーム\n"],
    ["k", "  based  "], ["", "リモート · 世界対応\n\n"],
    ["p", "$ "], ["", "cat focus.txt\n"],
    ["", "  ネットワーク · Web · クラウド · ワイヤレス\n\n"],
    ["p", "$ "], ["", "cat principles.txt\n"],
    ["", "  1. 必ず書面による許可を得る\n"],
    ["", "  2. 明確で実行可能な報告\n"],
    ["", "  3. 来た時よりも良い状態に\n"],
  ] : [
    ["p", "$ "], ["", "whoami\n"],
    ["k", "  name   "], ["", "papashell\n"],
    ["k", "  role   "], ["", "Pentester / Red Team\n"],
    ["k", "  based  "], ["", "Remote · Worldwide\n\n"],
    ["p", "$ "], ["", "cat focus.txt\n"],
    ["", "  network · web · cloud · wireless\n\n"],
    ["p", "$ "], ["", "cat principles.txt\n"],
    ["", "  1. written authorization, always\n"],
    ["", "  2. clear, actionable reporting\n"],
    ["", "  3. leave it better than I found it\n"],
  ];
  const consoleEl = document.getElementById("console");

  function renderConsole(instant) {
    let seg = 0, ch = 0;
    let span = null;
    function step() {
      if (seg >= lines.length) return;
      const [cls, text] = lines[seg];
      if (ch === 0) {
        span = document.createElement("span");
        if (cls) span.className = cls;
        consoleEl.appendChild(span);
      }
      if (instant) {
        span.textContent = text;
        seg++; ch = 0;
        step();
        return;
      }
      span.textContent += text[ch++];
      if (ch >= text.length) { seg++; ch = 0; }
      setTimeout(step, cls === "p" ? 120 : 22);
    }
    step();
  }
  renderConsole(reduceMotion);

  // ---- Stat counters ----
  function animateCount(el) {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "+";
    const start = performance.now();
    const dur = 1400;
    function tick(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const counterObs = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        animateCount(e.target);
        counterObs.unobserve(e.target);
      }
    }
  });
  document.querySelectorAll("[data-count]").forEach((el) => counterObs.observe(el));

  // ---- Scroll reveal ----
  const revealObs = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        revealObs.unobserve(e.target);
      }
    }
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));

  // ---- Active nav link ----
  const navLinks = Array.from(document.querySelectorAll('#nav-links a[href^="#"]'));
  const sections = navLinks.map((a) => document.querySelector(a.getAttribute("href")));
  window.addEventListener("scroll", () => {
    const y = window.scrollY + 120;
    let current = -1;
    sections.forEach((s, i) => { if (s && s.offsetTop <= y) current = i; });
    navLinks.forEach((a, i) => a.classList.toggle("active", i === current));
  }, { passive: true });

  // ---- Mobile menu ----
  const menuBtn = document.getElementById("menu-btn");
  const navList = document.getElementById("nav-links");
  menuBtn.addEventListener("click", () => navList.classList.toggle("open"));
  navLinks.forEach((a) => a.addEventListener("click", () => navList.classList.remove("open")));

  // ---- Footer year ----
  document.getElementById("year").textContent = new Date().getFullYear();
})();
