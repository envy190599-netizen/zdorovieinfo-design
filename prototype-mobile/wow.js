const wowRoot = document.querySelector(".wow-page");

if (wowRoot) {
  const wowHeader = document.querySelector(".header");
  const wowHero = document.querySelector(".hero");
  const afterHeroShell = document.querySelector("[data-wow-after-hero]");
  const editorialHome = wowRoot.classList.contains("editorial-home");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let scrollFrame;
  let pointerFrame;
  let heroMotionMetrics = {
    insetX: 40,
    insetY: 24,
    radius: 32,
  };

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  const readPixelToken = (styles, name, fallback) => {
    const value = Number.parseFloat(styles.getPropertyValue(name));
    return Number.isFinite(value) ? value : fallback;
  };

  const syncHeroMotionMetrics = () => {
    if (!wowHero) return;
    const styles = getComputedStyle(wowRoot);
    heroMotionMetrics = {
      insetX: readPixelToken(styles, "--wow-hero-inset-x-max", 40),
      insetY: readPixelToken(styles, "--wow-hero-inset-y-max", 24),
      radius: readPixelToken(styles, "--wow-hero-radius-max", 32),
    };
  };

  const revealGroups = [
    ".newsletter > *",
    ".footer-content > *",
    ".footer-nav",
  ];

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  const resetToHero = () => window.scrollTo({ top: Number.isFinite(history.state?.slideshowReturnY) ? history.state.slideshowReturnY : 0, left: 0, behavior: "instant" });
  requestAnimationFrame(resetToHero);
  window.addEventListener("pageshow", resetToHero);

  const revealNodes = Array.from(document.querySelectorAll(revealGroups.join(",")));
  revealNodes.forEach((node, index) => {
    node.dataset.wowReveal = "";
    node.style.transitionDelay = `${(index % 4) * 70}ms`;
  });

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    revealNodes.forEach((node) => node.classList.add("is-wow-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-wow-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.12 },
    );

    revealNodes.forEach((node) => revealObserver.observe(node));
  }

  const updateScrollEffects = () => {
    scrollFrame = undefined;
    const scrollTop = window.scrollY;
    wowHeader?.classList.toggle("is-scrolled", scrollTop > 24);
    if (wowHeader) {
      document.documentElement.style.setProperty(
        "--wow-header-viewport-bottom",
        `${Math.max(0, wowHeader.getBoundingClientRect().bottom).toFixed(2)}px`,
      );
    }

    if (afterHeroShell) {
      const desktopSidebarEnabled = window.matchMedia("(min-width: 1280px)").matches;
      const headerTop = wowHeader ? Number.parseFloat(getComputedStyle(wowHeader).top) || 0 : 0;
      const stickyTop = headerTop + 24 + (wowHeader?.offsetHeight || 80);
      const afterHeroActive = desktopSidebarEnabled && afterHeroShell.getBoundingClientRect().top <= stickyTop;
      afterHeroShell.classList.toggle("is-sidebar-visible", desktopSidebarEnabled && (editorialHome || afterHeroActive));
      wowHeader?.classList.toggle("is-after-hero", afterHeroActive);
      if (afterHeroActive) wowHeader?.classList.remove("is-search-open");
    }

    if (wowHero) {
      const heroTravel = Math.max(1, wowHero.offsetHeight - window.innerHeight);
      const heroProgress = clamp((scrollTop - wowHero.offsetTop) / heroTravel);
      const desktopHero = window.matchMedia("(min-width: 768px)").matches && !reduceMotion.matches;
      wowHero.style.setProperty("--wow-hero-progress", heroProgress.toFixed(3));
      wowHero.style.setProperty("--wow-hero-scale", "1.03");
      wowHero.style.setProperty("--wow-hero-inset-x", `${desktopHero ? (heroProgress * heroMotionMetrics.insetX).toFixed(2) : 0}px`);
      wowHero.style.setProperty("--wow-hero-inset-y", `${desktopHero ? (heroProgress * heroMotionMetrics.insetY).toFixed(2) : 0}px`);
      wowHero.style.setProperty("--wow-hero-radius", `${desktopHero ? (heroProgress * heroMotionMetrics.radius).toFixed(2) : 0}px`);
    }

  };

  const scheduleScrollEffects = () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollEffects);
  };

  if (wowHero && !reduceMotion.matches) {
    wowHero.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch" || !document.documentElement.hasAttribute("data-hover-enabled")) return;
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      pointerFrame = requestAnimationFrame(() => {
        const bounds = wowHero.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 12;
        const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 8;
        wowHero.style.setProperty("--wow-pointer-x", `${x.toFixed(2)}px`);
        wowHero.style.setProperty("--wow-pointer-y", `${y.toFixed(2)}px`);
      });
    });

    wowHero.addEventListener("pointerleave", () => {
      wowHero.style.setProperty("--wow-pointer-x", "0px");
      wowHero.style.setProperty("--wow-pointer-y", "0px");
    });
  }

  window.addEventListener("scroll", scheduleScrollEffects, { passive: true });
  window.addEventListener("resize", () => {
    syncHeroMotionMetrics();
    scheduleScrollEffects();
  }, { passive: true });
  syncHeroMotionMetrics();
  updateScrollEffects();
}
