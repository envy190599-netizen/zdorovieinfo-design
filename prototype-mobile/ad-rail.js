document.querySelectorAll("[data-ad-rail]").forEach((rail) => {
  let pointerId;
  let startX = 0;
  let startScrollLeft = 0;

  const stopDragging = () => {
    if (pointerId === undefined) return;
    const activePointerId = pointerId;
    pointerId = undefined;
    if (rail.hasPointerCapture?.(activePointerId)) rail.releasePointerCapture(activePointerId);
    rail.classList.remove("is-dragging");
  };

  rail.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch" || event.button !== 0) return;
    pointerId = event.pointerId;
    startX = event.clientX;
    startScrollLeft = rail.scrollLeft;
    rail.setPointerCapture?.(pointerId);
    rail.classList.add("is-dragging");
  });

  rail.addEventListener("pointermove", (event) => {
    if (event.pointerId !== pointerId) return;
    rail.scrollLeft = startScrollLeft - (event.clientX - startX);
    event.preventDefault();
  });

  rail.addEventListener("pointerup", stopDragging);
  rail.addEventListener("pointercancel", stopDragging);
  rail.addEventListener("lostpointercapture", stopDragging);

  rail.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    rail.scrollBy({
      left: rail.clientWidth * (event.key === "ArrowRight" ? 0.8 : -0.8),
      behavior: "smooth",
    });
  });
});

document.querySelectorAll(".desktop-ad-rail").forEach((rail) => {
  const page = rail.closest(".has-desktop-ad");
  const footer = page?.querySelector(":scope > .footer");
  const creatives = Array.from(rail.querySelectorAll(".desktop-ad-rail__creative"));

  if (!page || !footer || !creatives.length) return;

  const stage = document.createElement("div");
  stage.className = "desktop-ad-rail__stage";
  stage.setAttribute("aria-live", "off");
  creatives[0].before(stage);
  creatives.forEach((creative) => stage.append(creative));

  let layoutFrame;
  let activeIndex = 0;

  const showCreative = () => {
    stage.style.aspectRatio = creatives[activeIndex].dataset.adRatio || "300 / 250";
    creatives.forEach((creative, index) => {
      const isActive = index === activeIndex;
      creative.classList.toggle("is-active", isActive);
      creative.setAttribute("aria-hidden", String(!isActive));
      if (isActive) creative.removeAttribute("tabindex");
      else creative.setAttribute("tabindex", "-1");

      const video = creative.querySelector("video");
      if (!video) return;
      if (isActive) video.play().catch(() => {});
      else {
        video.pause();
        video.currentTime = 0;
      }
    });
  };

  const updateDesktopRail = () => {
    layoutFrame = undefined;

    if (!window.matchMedia("(min-width: 1280px)").matches) {
      rail.style.removeProperty("--desktop-ad-rail-height");
      showCreative();
      return;
    }

    const railHeight = Math.max(stage.offsetHeight, footer.offsetTop - rail.offsetTop);
    rail.style.setProperty("--desktop-ad-rail-height", `${railHeight}px`);
    showCreative();
  };

  const scheduleDesktopRailUpdate = () => {
    if (!layoutFrame) layoutFrame = requestAnimationFrame(updateDesktopRail);
  };

  window.addEventListener("resize", scheduleDesktopRailUpdate, { passive: true });
  window.addEventListener("load", scheduleDesktopRailUpdate, { once: true });

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(scheduleDesktopRailUpdate);
    observer.observe(page);
    observer.observe(footer);
  }

  document.fonts?.ready.then(scheduleDesktopRailUpdate);
  window.setInterval(() => {
    if (document.hidden || !window.matchMedia("(min-width: 1280px)").matches) return;
    activeIndex = (activeIndex + 1) % creatives.length;
    showCreative();
  }, 15000);

  showCreative();
  scheduleDesktopRailUpdate();
});

document.querySelectorAll("[data-wow-ad-rail]").forEach((rail) => {
  const creatives = Array.from(rail.querySelectorAll(".wow-desktop-ad-creative"));
  const stage = rail.querySelector(".advertisement-rail__stage");
  if (creatives.length < 2) return;

  let activeIndex = Math.max(0, creatives.findIndex((creative) => creative.classList.contains("is-active")));

  const showCreative = () => {
    stage.style.aspectRatio = creatives[activeIndex].dataset.adRatio || "300 / 250";
    creatives.forEach((creative, index) => {
      const isActive = index === activeIndex;
      creative.classList.toggle("is-active", isActive);
      creative.setAttribute("aria-hidden", String(!isActive));
      if (isActive) creative.removeAttribute("tabindex");
      else creative.setAttribute("tabindex", "-1");

      const video = creative.querySelector("video");
      if (!video) return;
      if (isActive) video.play().catch(() => {});
      else {
        video.pause();
        video.currentTime = 0;
      }
    });
  };

  window.setInterval(() => {
    if (document.hidden || !window.matchMedia("(min-width: 1280px)").matches) return;
    activeIndex = (activeIndex + 1) % creatives.length;
    showCreative();
  }, 15000);

  showCreative();
});

// Native sticky handles scroll frames. A flow spacer preserves position only
// when switching between the ad's top constraint and the library's bottom one.
document.querySelectorAll(".home-right-rail").forEach((rail) => {
  const content = document.querySelector(".wow-after-hero-content, .topic-page-content");
  const footer = content?.querySelector('[data-site-component="footer"]') || document.querySelector('.articles-page > [data-site-component="footer"]');
  const inner = rail.querySelector(".home-right-rail__inner");
  const ad = rail.querySelector("[data-wow-ad-rail]");
  if (!content || !inner || !ad) return;
  const spacer = document.createElement('div');
  spacer.setAttribute('aria-hidden', 'true');
  spacer.style.overflowAnchor = 'none';
  inner.before(spacer);
  let direction = 1;
  let previousScrollY = window.scrollY;
  let lowerTop = 0;
  let upperTop = 112;
  let frame;
  const applyInsets = () => {
    inner.style.top = direction > 0 ? `${lowerTop}px` : 'auto';
    inner.style.bottom = direction < 0 ? `${innerHeight - upperTop - inner.offsetHeight}px` : 'auto';
  };
  const updateRailBounds = () => {
    if (!matchMedia("(min-width: 1280px)").matches) {
      rail.style.removeProperty("height");
      inner.style.removeProperty('top');
      inner.style.removeProperty('bottom');
      spacer.style.height = '0px';
      return;
    }
    const railTop = rail.getBoundingClientRect().top;
    const contentEnd = footer
      ? footer.getBoundingClientRect().top - 24
      : content.getBoundingClientRect().bottom;
    const height = contentEnd - railTop;
    rail.style.height = `${Math.max(0, height)}px`;
    upperTop = document.querySelector('.header').getBoundingClientRect().height + 16;
    lowerTop = upperTop - ad.offsetTop;
    const offset = parseFloat(spacer.style.height) || 0;
    spacer.style.height = `${Math.max(0, Math.min(offset, height - inner.offsetHeight))}px`;
    applyInsets();
  };
  const scheduleUpdate = () => {
    if (!frame) frame = requestAnimationFrame(() => {
      frame = undefined;
      updateRailBounds();
    });
  };
  window.addEventListener('scroll', () => {
    const delta = window.scrollY - previousScrollY;
    previousScrollY = window.scrollY;
    if (!delta || !matchMedia('(min-width: 1280px)').matches) return;
    const nextDirection = Math.sign(delta);
    if (nextDirection === direction) return;
    const top = inner.getBoundingClientRect().top;
    const pinned = Math.abs(top - (direction > 0 ? lowerTop : upperTop)) < 2;
    const offset = top - rail.getBoundingClientRect().top - (pinned ? delta : 0);
    spacer.style.height = `${Math.max(0, Math.min(offset, rail.clientHeight - inner.offsetHeight))}px`;
    direction = nextDirection;
    applyInsets();
  }, { passive: true });
  window.addEventListener("resize", scheduleUpdate, { passive: true });
  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(content);
    observer.observe(inner);
  }
  scheduleUpdate();
});

document.querySelectorAll("[data-opening-ad]").forEach((overlay) => {
  const closeButtons = Array.from(overlay.querySelectorAll("[data-opening-ad-close]"));
  const dialog = overlay.querySelector('[role="dialog"]');
  const video = overlay.querySelector("video");
  const focusableElements = Array.from(overlay.querySelectorAll('button, a[href]'));
  let previousFocus;

  const setFocusable = (enabled) => {
    focusableElements.forEach((element) => {
      if (enabled) element.removeAttribute("tabindex");
      else element.setAttribute("tabindex", "-1");
    });
  };

  const close = () => {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    overlay.setAttribute("inert", "");
    document.documentElement.classList.remove("is-opening-ad-open");
    setFocusable(false);
    video?.pause();
    previousFocus?.focus?.();
  };

  const open = () => {
    if (matchMedia('(max-width: 1279px)').matches) return;
    previousFocus = document.activeElement;
    overlay.removeAttribute("inert");
    overlay.setAttribute("aria-hidden", "false");
    overlay.classList.add("is-open");
    document.documentElement.classList.add("is-opening-ad-open");
    setFocusable(true);
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
    dialog?.setAttribute("tabindex", "-1");
    dialog?.focus({ preventScroll: true });
    sessionStorage.setItem("zi-opening-ad-seen", "true");
  };

  closeButtons.forEach((button) => button.addEventListener("click", close));
  matchMedia('(max-width: 1279px)').addEventListener('change', event => { if (event.matches) close(); });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("is-open")) close();
    if (event.key !== "Tab" || !overlay.classList.contains("is-open") || !dialog) return;
    const focusable = Array.from(dialog.querySelectorAll('button:not([disabled]), a[href]'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  video?.pause();
  if (!Number.isFinite(history.state?.slideshowReturnY) && (overlay.dataset.openingAdFrequency === "always" || !sessionStorage.getItem("zi-opening-ad-seen"))) {
    window.setTimeout(open, 650);
  }
});
