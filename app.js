/* ============================================================
   SONSOH NIGHT — interactions
   ============================================================ */
(() => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- preloader ---------- */
  const pre = document.getElementById("preloader");
  const word = pre.querySelector(".word");
  "SONSOH".split("").forEach((ch, i) => {
    const s = document.createElement("span");
    s.textContent = ch;
    s.style.animationDelay = `${i * 0.07}s`;
    word.appendChild(s);
  });
  window.addEventListener("load", () => {
    setTimeout(() => pre.classList.add("done"), reduced ? 0 : 1200);
  });
  setTimeout(() => pre.classList.add("done"), 2600); // failsafe

  /* ---------- cursor glow ---------- */
  const glow = document.getElementById("cursor-glow");
  document.addEventListener("mousemove", (e) => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  });

  /* ---------- header state ---------- */
  const header = document.querySelector("header");
  const clock = document.getElementById("night-clock");
  const clockT = clock.querySelector(".t");

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 40);
    clock.classList.toggle("on", y > window.innerHeight * 0.5);

    // night clock: 23:30 -> 07:00 across the page
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(y / max, 1) : 0;
    const start = 23.5 * 60, end = (24 + 7) * 60; // minutes
    const t = start + (end - start) * p;
    const h = Math.floor(t / 60) % 24;
    const m = Math.floor(t % 60);
    clockT.textContent = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

    // campaign parallax (stays within the 1.08 scale margin so edges never show)
    if (campaignImg) {
      const r = campaignSection.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) {
        const maxShift = r.height * 0.035;
        const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        const shift = Math.max(-maxShift, Math.min(maxShift, p * maxShift * 2));
        campaignImg.style.transform = `scale(1.08) translateY(${shift}px)`;
      }
    }
  };
  const campaignSection = document.getElementById("campaign");
  const campaignImg = document.getElementById("campaign-img");
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  const burger = document.getElementById("hamburger");
  const menu = document.getElementById("mobile-menu");
  burger.addEventListener("click", () => menu.classList.toggle("open"));
  menu.querySelectorAll("a, button").forEach((el) =>
    el.addEventListener("click", () => menu.classList.remove("open"))
  );

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        io.unobserve(en.target);
      }
    }),
    { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------- count-up stats ---------- */
  const cio = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      cio.unobserve(en.target);
      const el = en.target;
      const to = parseFloat(el.dataset.to);
      const dec = parseInt(el.dataset.dec || "0", 10);
      const dur = 1400;
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (to * eased).toFixed(dec);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }),
    { threshold: 0.6 }
  );
  document.querySelectorAll(".count").forEach((el) => cio.observe(el));

  /* ---------- starfield ---------- */
  const canvas = document.getElementById("starfield");
  if (canvas && !reduced) {
    const ctx = canvas.getContext("2d");
    let stars = [], w, h, mx = 0.5, my = 0.5;
    const resize = () => {
      w = canvas.width = canvas.offsetWidth * devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * devicePixelRatio;
      stars = Array.from({ length: Math.min(180, (w * h) / 18000) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random() * 0.5 + 0.15,
        tw: Math.random() * 0.02 + 0.004,
        p: Math.random() * Math.PI * 2,
        d: Math.random() * 0.6 + 0.2, // depth for parallax
      }));
    };
    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("mousemove", (e) => {
      mx = e.clientX / window.innerWidth;
      my = e.clientY / window.innerHeight;
    });
    const draw = (t) => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const tw = s.a + Math.sin(t * s.tw * 0.06 + s.p) * s.a * 0.6;
        const ox = (mx - 0.5) * 24 * s.d * devicePixelRatio;
        const oy = (my - 0.5) * 16 * s.d * devicePixelRatio;
        ctx.beginPath();
        ctx.arc(s.x + ox, s.y + oy, s.r * devicePixelRatio, 0, Math.PI * 2);
        const gold = s.r > 1.2;
        ctx.fillStyle = gold
          ? `rgba(232, 205, 154, ${tw})`
          : `rgba(242, 234, 217, ${tw * 0.8})`;
        ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  /* ---------- core particles (gold dust) ---------- */
  const cp = document.getElementById("core-particles");
  if (cp && !reduced) {
    const ctx = cp.getContext("2d");
    let parts = [], w, h;
    const resize = () => {
      w = cp.width = cp.offsetWidth * devicePixelRatio;
      h = cp.height = cp.offsetHeight * devicePixelRatio;
      parts = Array.from({ length: 46 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        vy: -(Math.random() * 0.18 + 0.05) * devicePixelRatio,
        vx: (Math.random() - 0.5) * 0.08 * devicePixelRatio,
        a: Math.random() * 0.35 + 0.08,
      }));
    };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.y += p.vy; p.x += p.vx;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * devicePixelRatio, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 169, 106, ${p.a})`;
        ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  /* ---------- tilt on product frame ---------- */
  document.querySelectorAll(".js-tilt").forEach((el) => {
    if (reduced) return;
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "perspective(900px) rotateY(0) rotateX(0)";
      el.style.transition = "transform 0.6s cubic-bezier(0.16,1,0.3,1)";
      setTimeout(() => (el.style.transition = ""), 600);
    });
  });

  /* ---------- variant toggle ---------- */
  const design = document.getElementById("design");
  const vImgs = design.querySelectorAll(".variant-stage img");
  design.querySelectorAll(".variant-toggle button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target;
      design.querySelectorAll(".variant-toggle button").forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });
      vImgs.forEach((img) => img.classList.toggle("active", img.dataset.variant === target));
      design.classList.toggle("cloud", target === "cloud");
    });
  });

  /* ---------- LED strip animation ---------- */
  const ledStrip = document.querySelector(".led-strip");
  if (ledStrip) {
    const leds = ledStrip.querySelectorAll("i");
    const lio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        lio.unobserve(en.target);
        leds.forEach((led, i) => setTimeout(() => led.classList.add("on"), 200 + i * 140));
      });
    }, { threshold: 0.5 });
    lio.observe(ledStrip);
  }

  /* ---------- modal ---------- */
  const backdrop = document.getElementById("modal-backdrop");
  const modal = backdrop.querySelector(".modal");
  const variantBtns = modal.querySelectorAll(".variant-pick button");

  const openModal = (variant) => {
    modal.classList.remove("success");
    if (variant) {
      variantBtns.forEach((b) => b.classList.toggle("active", b.dataset.v === variant));
    }
    backdrop.classList.add("open");
    document.body.style.overflow = "hidden";
    setTimeout(() => document.getElementById("r-name").focus(), 350);
  };
  const closeModal = () => {
    backdrop.classList.remove("open");
    document.body.style.overflow = "";
  };

  document.querySelectorAll(".js-open-modal").forEach((b) =>
    b.addEventListener("click", () => openModal(b.dataset.variant))
  );
  modal.querySelector(".close").addEventListener("click", closeModal);
  document.querySelectorAll(".js-close-modal").forEach((b) => b.addEventListener("click", closeModal));
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  variantBtns.forEach((b) =>
    b.addEventListener("click", () => {
      variantBtns.forEach((x) => x.classList.toggle("active", x === b));
    })
  );

  document.getElementById("reserve-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const entry = {
      name: document.getElementById("r-name").value,
      email: document.getElementById("r-email").value,
      variant: modal.querySelector(".variant-pick .active")?.dataset.v || "Midnight",
      at: new Date().toISOString(),
    };
    try {
      const list = JSON.parse(localStorage.getItem("sonsoh-reservations") || "[]");
      list.push(entry);
      localStorage.setItem("sonsoh-reservations", JSON.stringify(list));
    } catch (_) { /* storage unavailable — demo only */ }
    modal.classList.add("success");
  });

  /* ---------- nightlist form ---------- */
  document.getElementById("nightlist-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = e.target.querySelector("input");
    try {
      const list = JSON.parse(localStorage.getItem("sonsoh-nightlist") || "[]");
      list.push({ email: input.value, at: new Date().toISOString() });
      localStorage.setItem("sonsoh-nightlist", JSON.stringify(list));
    } catch (_) {}
    input.value = "";
    const btn = e.target.querySelector("button");
    const old = btn.textContent;
    btn.textContent = "✓";
    setTimeout(() => (btn.textContent = old), 2200);
  });
})();
