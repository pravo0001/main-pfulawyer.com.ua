(function () {
  "use strict";

  gsap.registerPlugin(ScrollTrigger);

  const prm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const preloader = document.getElementById("preloader");
  const body = document.body;
  const yearEl = document.getElementById("year");

  body.classList.add("is-loading");

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function splitChars(el) {
    const text = el.textContent.trim();
    if (!text) return;
    const words = text.split(/\s+/);
    el.textContent = "";
    words.forEach((word, wi) => {
      const wordWrap = document.createElement("span");
      wordWrap.className = "word-chunk";
      wordWrap.style.whiteSpace = "nowrap";
      for (const ch of word) {
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = ch;
        wordWrap.appendChild(span);
      }
      el.appendChild(wordWrap);
      if (wi < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
  }

  function splitWords(el) {
    const raw = el.textContent.trim();
    if (!raw) return;
    const words = raw.split(/\s+/);
    el.textContent = "";
    words.forEach((word, i) => {
      if (i > 0) el.appendChild(document.createTextNode(" "));
      const span = document.createElement("span");
      span.className = "word";
      span.textContent = word;
      el.appendChild(span);
    });
  }

  document.querySelectorAll("[data-split]").forEach(splitChars);
  const preTitle = document.getElementById("preloader-title");
  if (preTitle) splitWords(preTitle);
  document.querySelectorAll("[data-word-reveal]").forEach(splitWords);

  function initLenis() {
    if (prm || typeof Lenis === "undefined") return null;
    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.documentElement.classList.add("lenis");
    return lenis;
  }

  function initCursor() {
    const dot = document.getElementById("cursor-dot");
    if (!dot || prm || coarse) return;
    const x = gsap.quickTo(dot, "x", { duration: 0.35, ease: "power3.out" });
    const y = gsap.quickTo(dot, "y", { duration: 0.35, ease: "power3.out" });
    window.addEventListener("pointermove", (e) => {
      x(e.clientX);
      y(e.clientY);
    });
  }

  function initGlobalFx() {
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.innerHTML = '<span class="scroll-progress__fill"></span>';
    body.appendChild(bar);

    const aurora = document.createElement("div");
    aurora.className = "fx-aurora";
    aurora.innerHTML =
      '<span class="fx-aurora__blob fx-aurora__blob--a"></span><span class="fx-aurora__blob fx-aurora__blob--b"></span><span class="fx-aurora__blob fx-aurora__blob--c"></span>';
    body.appendChild(aurora);

    const vignette = document.createElement("div");
    vignette.className = "fx-vignette";
    body.appendChild(vignette);

    const fill = bar.querySelector(".scroll-progress__fill");
    if (fill) {
      gsap.to(fill, {
        scaleX: 1,
        ease: "none",
        transformOrigin: "left center",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });
    }

    if (!prm) {
      const moveBlob = (sel, x, y, d) => {
        gsap.to(sel, {
          x,
          y,
          duration: d,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      };
      moveBlob(".fx-aurora__blob--a", 40, -30, 8);
      moveBlob(".fx-aurora__blob--b", -28, 24, 10);
      moveBlob(".fx-aurora__blob--c", 18, 20, 12);
    }
  }

  function initHeader() {
    const h = document.getElementById("site-header");
    if (!h) return;
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (s) => h.classList.toggle("is-scrolled", s.scroll() > 24),
    });
  }

  function initDrawer() {
    const btn = document.getElementById("nav-toggle");
    const d = document.getElementById("nav-drawer");
    if (!btn || !d) return;
    const set = (o) => {
      btn.setAttribute("aria-expanded", o ? "true" : "false");
      d.hidden = !o;
    };
    btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"));
    d.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
    document.addEventListener("keydown", (e) => e.key === "Escape" && set(false));
  }

  function initMagnetic() {
    if (prm) return;
    document.querySelectorAll("[data-mag]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - r.left - r.width / 2;
        const dy = e.clientY - r.top - r.height / 2;
        gsap.to(el, { x: dx * 0.15, y: dy * 0.15, duration: 0.35, ease: "power2.out" });
      });
      el.addEventListener("mouseleave", () =>
        gsap.to(el, { x: 0, y: 0, duration: 0.55, ease: "power3.out" })
      );
    });
  }

  function initHeroIntro() {
    if (prm) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(".hero__overline", { y: 20, opacity: 0, duration: 0.7 }, 0);
    tl.from(
      ".hero__h1-line .char",
      {
        yPercent: 118,
        rotateX: -72,
        opacity: 0,
        stagger: 0.022,
        duration: 0.85,
      },
      0.12
    );

    const words = document.querySelectorAll(".hero__deck .word");
    if (words.length) {
      tl.from(
        words,
        {
          y: 22,
          opacity: 0,
          filter: "blur(6px)",
          stagger: 0.028,
          duration: 0.45,
        },
        "-=0.35"
      );
    }

    tl.from(".hero__actions .btn", { y: 24, opacity: 0, stagger: 0.1, duration: 0.65 }, "-=0.25");
    tl.from(".hero__scroll", { opacity: 0, y: 10, duration: 0.5 }, "-=0.2");

    tl.from(
      "#hero-panel",
      {
        clipPath: "inset(12% 12% 12% 12% round 20px)",
        opacity: 0,
        duration: 1.1,
        ease: "power4.out",
      },
      0.15
    );

    tl.from(
      ".hero__rect",
      {
        y: 40,
        opacity: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: "power3.out",
      },
      "-=0.8"
    );
  }

  function initHeroFloat() {
    if (prm) return;
    gsap.to("[data-float]", {
      y: -10,
      duration: 3.5,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    gsap.utils.toArray(".hero__rect").forEach((rect, i) => {
      gsap.to(rect, {
        y: i % 2 ? -6 : 6,
        rotation: i % 2 ? 2 : -2,
        duration: 4 + i,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    });
  }

  function initHeroParallax() {
    if (prm) return;
    gsap.to("#hero-copy", {
      yPercent: -8,
      ease: "none",
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: 0.6,
      },
    });
    gsap.to("#hero-panel", {
      yPercent: 5,
      rotation: 0.5,
      ease: "none",
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: 0.45,
      },
    });
  }

  function initStripeSkew() {
    if (prm) return;
    const tr = document.querySelector("[data-stripe]");
    if (!tr) return;
    ScrollTrigger.create({
      onUpdate: (self) => {
        const v = self.getVelocity();
        const sk = gsap.utils.clamp(-6, 6, v / -400);
        gsap.to(tr, { skewX: sk, duration: 0.35, ease: "power3.out", overwrite: "auto" });
      },
    });
  }

  function initWorkItems() {
    if (prm) return;
    gsap.utils.toArray("[data-work-item]").forEach((row, i) => {
      gsap.from(row, {
        y: 48,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        delay: i * 0.06,
        scrollTrigger: {
          trigger: row,
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      });
    });
  }

  function initSectionDepth() {
    if (prm) return;
    gsap.utils.toArray("section").forEach((sec) => {
      gsap.from(sec, {
        y: 56,
        opacity: 0,
        filter: "blur(10px)",
        duration: 0.95,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sec,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });
    });
  }

  function initWorkHead() {
    if (prm) return;
    const t = document.querySelector(".work__title");
    if (t && t.querySelector(".char")) {
      gsap.from(t.querySelectorAll(".char"), {
        yPercent: 110,
        opacity: 0,
        stagger: 0.018,
        duration: 0.8,
        ease: "power4.out",
        scrollTrigger: { trigger: t, start: "top 85%", toggleActions: "play none none reverse" },
      });
    }
    const intro = document.querySelector(".work__intro");
    if (intro && intro.querySelector(".word")) {
      gsap.from(intro.querySelectorAll(".word"), {
        y: 20,
        opacity: 0,
        stagger: 0.02,
        duration: 0.45,
        scrollTrigger: { trigger: intro, start: "top 88%", toggleActions: "play none none reverse" },
      });
    }
  }

  function initTimeline() {
    if (prm) return;
    const rail = document.querySelector(".timeline__rail-fill");
    const sec = document.getElementById("timeline");
    if (rail && sec) {
      gsap.to(rail, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sec,
          start: "top 70%",
          end: "bottom 40%",
          scrub: 0.5,
        },
      });
    }

    gsap.utils.toArray("[data-step]").forEach((step, i) => {
      const h = step.querySelector("h3");
      const p = step.querySelector("p");
      gsap.from(step.querySelector(".timeline__n"), {
        scale: 0,
        opacity: 0,
        duration: 0.55,
        ease: "back.out(1.6)",
        scrollTrigger: { trigger: step, start: "top 86%", toggleActions: "play none none reverse" },
      });
      if (h && h.querySelector(".char")) {
        gsap.from(h.querySelectorAll(".char"), {
          yPercent: 100,
          opacity: 0,
          stagger: 0.02,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: { trigger: step, start: "top 84%", toggleActions: "play none none reverse" },
        });
      }
      if (p && p.querySelector(".word")) {
        gsap.from(p.querySelectorAll(".word"), {
          y: 16,
          opacity: 0,
          stagger: 0.018,
          duration: 0.4,
          scrollTrigger: { trigger: step, start: "top 80%", toggleActions: "play none none reverse" },
        });
      }
    });

    const tt = document.querySelector(".timeline-sec__title");
    if (tt && tt.querySelector(".char")) {
      gsap.from(tt.querySelectorAll(".char"), {
        yPercent: 120,
        opacity: 0,
        stagger: 0.02,
        duration: 0.9,
        scrollTrigger: { trigger: tt, start: "top 82%", toggleActions: "play none none reverse" },
      });
    }
  }

  function initMetrics() {
    document.querySelectorAll("[data-count]").forEach((el) => {
      const end = parseInt(el.getAttribute("data-count"), 10);
      const n = Number.isFinite(end) ? end : 0;
      const o = { v: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => {
          gsap.to(o, {
            v: n,
            duration: prm ? 0 : 2.2,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = String(Math.round(o.v));
            },
          });
        },
      });
    });

    if (prm) return;
    gsap.utils.toArray("[data-metric]").forEach((m, i) => {
      gsap.from(m, {
        y: 40,
        opacity: 0,
        duration: 0.85,
        ease: "power3.out",
        delay: i * 0.1,
        scrollTrigger: { trigger: m, start: "top 88%", toggleActions: "play none none reverse" },
      });
    });
  }

  function initContact() {
    if (prm) return;

    const sideText = document.querySelector(".contact-page__text");
    if (sideText && sideText.querySelector(".word")) {
      gsap.from(sideText.querySelectorAll(".word"), {
        y: 18,
        opacity: 0,
        stagger: 0.02,
        duration: 0.42,
        scrollTrigger: { trigger: sideText, start: "top 88%", toggleActions: "play none none reverse" },
      });
    }

    const pgList = document.querySelector(".contact-page__list");
    if (pgList) {
      gsap.from(".contact-page__list li", {
        x: -16,
        opacity: 0,
        stagger: 0.1,
        duration: 0.55,
        scrollTrigger: { trigger: pgList, start: "top 90%", toggleActions: "play none none reverse" },
      });
    }

    const pgForm = document.querySelector(".contact-page__form");
    if (pgForm) {
      gsap.from(pgForm, {
        y: 36,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: pgForm, start: "top 88%", toggleActions: "play none none reverse" },
      });
    }

    const mapFrame = document.querySelector(".contact-page__map-frame");
    if (mapFrame) {
      gsap.from(mapFrame, {
        y: 28,
        opacity: 0,
        duration: 0.85,
        ease: "power3.out",
        scrollTrigger: { trigger: mapFrame, start: "top 90%", toggleActions: "play none none reverse" },
      });
    }

    const lead = document.querySelector(".contact__lead");
    if (lead && lead.querySelector(".word")) {
      gsap.from(lead.querySelectorAll(".word"), {
        y: 18,
        opacity: 0,
        stagger: 0.02,
        duration: 0.42,
        scrollTrigger: { trigger: lead, start: "top 88%", toggleActions: "play none none reverse" },
      });
    }

    const legBullets = document.querySelector(".contact__bullets");
    if (legBullets) {
      gsap.from(".contact__bullets li", {
        x: -16,
        opacity: 0,
        stagger: 0.1,
        duration: 0.55,
        scrollTrigger: { trigger: legBullets, start: "top 90%", toggleActions: "play none none reverse" },
      });
    }

    const legForm = document.querySelector(".contact .contact__form");
    if (legForm) {
      gsap.from(legForm, {
        y: 36,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: legForm, start: "top 88%", toggleActions: "play none none reverse" },
      });
    }
  }

  function initContentHub() {
    if (prm) return;

    [".library__title", ".blog__title", ".faq__title", ".resources__title", ".contact__title"].forEach((sel) => {
      gsap.utils.toArray(sel).forEach((t) => {
        if (t.querySelector(".char")) {
          gsap.from(t.querySelectorAll(".char"), {
            yPercent: 110,
            opacity: 0,
            stagger: 0.02,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: { trigger: t, start: "top 86%", toggleActions: "play none none reverse" },
          });
        }
      });
    });

    gsap.utils.toArray("[data-doc-card], [data-blog-item], [data-faq-item], [data-res-chip]").forEach((el, i) => {
      gsap.from(el, {
        y: 24,
        opacity: 0,
        duration: 0.55,
        delay: i * 0.02,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 92%", toggleActions: "play none none reverse" },
      });
    });
  }

  function initFoot() {
    if (prm) return;
    gsap.from("[data-foot]", {
      y: 16,
      opacity: 0,
      stagger: 0.08,
      scrollTrigger: {
        trigger: "#site-footer",
        start: "top 95%",
        toggleActions: "play once",
      },
    });
  }

  function initForm() {
    const form = document.getElementById("cta-form");
    const note = document.getElementById("cta-note");
    if (!form || !note) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      note.textContent = "Дякуємо! Зв'яжуся з вами найближчим часом.";
      form.reset();
    });
  }

  function donePre() {
    // Keep initial render anchored to top to avoid post-preloader jump.
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    if (preloader) preloader.classList.add("is-done");
    body.classList.remove("is-loading");
    body.classList.add("is-ready");
  }

  function boot() {
    initGlobalFx();
    initLenis();
    initCursor();
    initHeader();
    initDrawer();
    initMagnetic();
    initHeroIntro();
    initHeroFloat();
    initHeroParallax();
    initStripeSkew();
    initSectionDepth();
    initWorkHead();
    initWorkItems();
    initTimeline();
    initMetrics();
    initContentHub();
    initContact();
    initFoot();
    initForm();
    ScrollTrigger.refresh();
  }

  if (prm) {
    donePre();
    boot();
    return;
  }

  const fill = document.querySelector(".preloader__rule-fill");
  const titleParts = preTitle ? preTitle.querySelectorAll(".word, .char") : [];

  const tl = gsap.timeline({
    onComplete: () => {
      donePre();
      boot();
    },
  });

  if (fill) tl.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: 1.05, ease: "power2.inOut" }, 0);
  if (titleParts.length) {
    tl.from(
      titleParts,
      { y: 26, opacity: 0, rotateX: -40, stagger: 0.03, duration: 0.65, ease: "power3.out" },
      0.1
    );
  }
  tl.to(preloader, { opacity: 0, duration: 0.45, ease: "power2.inOut" }, "+=0.2");
})();
