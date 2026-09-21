const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const heroDots = qsa(".hero-progress span");
const hero = qs(".hero-slider");
const heroPreviousButton = qs("[data-hero-prev]");
const heroNextButton = qs("[data-hero-next]");
const heroTimeoutProgress = qs(".hero-timeout span");
const heroCopy = qs(".hero-copy");
const heroCopyFirst = qs("[data-hero-copy-first]");
const heroCopySecond = qs("[data-hero-copy-second]");
const heroCopySubtitle = qs("[data-hero-copy-subtitle]");
const heroMaterialLink = qs("[data-hero-material-link]");
const heroTabs = qsa("[data-hero-tab]");
const heroPreviewRail = qs('.hero-preview-tabs');
const heroPreviewShell = qs('.hero-preview-shell');
const heroOriginalSlides = qsa("[data-slider='hero'] [data-slide]");
const heroCount = heroOriginalSlides.length;
const modulo = (value, divisor) => ((value % divisor) + divisor) % divisor;
const reduceHeroMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const immersiveHero = document.body.classList.contains("wow-page");

heroOriginalSlides.forEach((slide, index) => {
  slide.dataset.heroIndex = String(index);
});

const heroBeforeSlides = immersiveHero ? [] : heroOriginalSlides.map((slide) => {
  const clone = slide.cloneNode(true);
  clone.dataset.heroClone = "true";
  clone.classList.remove("is-active");
  clone.setAttribute("aria-hidden", "true");
  return clone;
});

const heroAfterSlides = immersiveHero ? [] : heroBeforeSlides.map((slide) => slide.cloneNode(true));
if (!immersiveHero) {
  hero.prepend(...heroBeforeSlides);
  hero.append(...heroAfterSlides);
}

const heroSlides = qsa("[data-slider='hero'] [data-slide]");
let heroIndex = 0;
let heroPhysicalIndex = heroCount;
let heroTimer;
let heroLoopTimer;
let heroInteracting = false;
let heroAutoScrolling = false;
let heroScrollAnimation;
let heroPointerStartX = 0;
let heroPointerCurrentX = 0;
let finishHeroPreviewMove;

function alignActiveHeroPreview(animate = true) {
  if (!heroPreviewRail || !document.body.classList.contains('fullscreen-home')) return;
  finishHeroPreviewMove?.();
  const selected = heroTabs[heroIndex];
  const ordered = Array.from(heroPreviewRail.children);
  const preceding = ordered.slice(0, ordered.indexOf(selected));
  const padding = parseFloat(getComputedStyle(heroPreviewRail).paddingLeft) || 0;
  const target = selected.offsetLeft - padding;
  // Temporary inert copies fill the right edge during the move, including last → first.
  const fillers = preceding.map(tab => {
    const copy = tab.cloneNode(true);
    copy.removeAttribute('data-hero-tab');
    copy.classList.remove('is-active');
    copy.removeAttribute('aria-selected');
    copy.setAttribute('aria-hidden', 'true');
    copy.tabIndex = -1;
    copy.inert = true;
    copy.querySelector('.hero-timeout')?.remove();
    return copy;
  });
  heroPreviewRail.append(...fillers);
  let timer;
  const finish = () => {
    clearTimeout(timer);
    heroPreviewRail.removeEventListener('scrollend', onScrollEnd);
    const focused = document.activeElement;
    fillers.forEach(copy => copy.remove());
    heroPreviewRail.append(...heroTabs.slice(heroIndex), ...heroTabs.slice(0, heroIndex));
    heroPreviewRail.scrollTo({ left: 0, behavior: 'instant' });
    if (heroTabs.includes(focused)) focused.focus({ preventScroll: true });
    finishHeroPreviewMove = undefined;
  };
  const onScrollEnd = () => {
    if (Math.abs(heroPreviewRail.scrollLeft - target) < 2) finish();
  };
  if (!animate || reduceHeroMotion.matches || Math.abs(heroPreviewRail.scrollLeft - target) < 1) {
    finish();
    return;
  }
  finishHeroPreviewMove = finish;
  heroPreviewRail.addEventListener('scrollend', onScrollEnd);
  heroPreviewRail.scrollTo({ left: target, behavior: 'smooth' });
  timer = setTimeout(finish, 1000);
}

function updateHero(index) {
  finishHeroPreviewMove?.();
  heroIndex = modulo(index, heroCount);
  const activeSlide = heroOriginalSlides[heroIndex];
  heroSlides.forEach((slide) => {
    const isOriginal = slide.dataset.heroClone !== "true";
    const isActive = Number(slide.dataset.heroIndex) === heroIndex;
    slide.classList.toggle("is-active", isActive);
    slide.setAttribute("aria-hidden", String(!isOriginal || !isActive));
  });
  heroDots.forEach((dot, i) => {
    dot.classList.remove("is-active");
    if (i === heroIndex) {
      void dot.offsetWidth;
      dot.classList.add("is-active");
    }
  });
  heroTabs.forEach((tab, i) => {
    const isActive = i === heroIndex;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });
  // Keep the existing autoplay clock attached to the selected fullscreen preview.
  if (document.body.classList.contains("fullscreen-home") && heroTimeoutProgress) {
    heroTabs[heroIndex]?.append(heroTimeoutProgress.parentElement);
  }
  if (document.body.classList.contains('fullscreen-home')) {
    alignActiveHeroPreview();
  } else if (heroPreviewRail && !(document.documentElement.hasAttribute('data-hover-enabled') && heroPreviewShell?.matches(':hover'))) {
    const tab = heroTabs[heroIndex];
    const left = tab.offsetLeft;
    const right = left + tab.offsetWidth;
    if (left < heroPreviewRail.scrollLeft) heroPreviewRail.scrollLeft = left;
    else if (right > heroPreviewRail.scrollLeft + heroPreviewRail.clientWidth) heroPreviewRail.scrollLeft = right - heroPreviewRail.clientWidth;
  }
  if (activeSlide && heroCopy && heroCopyFirst && heroCopySecond && heroCopySubtitle) {
    heroCopyFirst.textContent = activeSlide.dataset.heroTitleFirst || "";
    heroCopySecond.textContent = activeSlide.dataset.heroTitleSecond || "";
    heroCopySubtitle.textContent = activeSlide.dataset.heroSubtitle || "";
    heroCopySubtitle.hidden = !heroCopySubtitle.textContent;
    if (heroMaterialLink) heroMaterialLink.href = activeSlide.dataset.heroHref || "./articles.html";
    heroCopy.classList.remove("is-updating");
    void heroCopy.offsetWidth;
    heroCopy.classList.add("is-updating");
  }
}

function jumpHeroTo(physicalIndex) {
  if (immersiveHero) return;
  const previousBehavior = hero.style.scrollBehavior;
  hero.style.scrollBehavior = "auto";
  heroPhysicalIndex = physicalIndex;
  hero.scrollLeft = physicalIndex * hero.clientWidth;
  hero.style.scrollBehavior = previousBehavior;
}

function settleHeroLoop() {
  if (immersiveHero) return;
  if (heroInteracting) return;
  const physicalIndex = Math.round(hero.scrollLeft / Math.max(hero.clientWidth, 1));
  if (physicalIndex < heroCount || physicalIndex >= heroCount * 2) {
    jumpHeroTo(heroCount + modulo(physicalIndex, heroCount));
  }
}

function scheduleHeroSettle() {
  clearTimeout(heroLoopTimer);
  heroLoopTimer = setTimeout(settleHeroLoop, 140);
}

function animateHeroScroll(targetLeft, duration = 760) {
  if (immersiveHero) return;
  cancelAnimationFrame(heroScrollAnimation);
  const startLeft = hero.scrollLeft;
  const distance = targetLeft - startLeft;
  if (reduceHeroMotion.matches || Math.abs(distance) < 1) {
    hero.scrollLeft = targetLeft;
    heroAutoScrolling = false;
    return;
  }

  const startedAt = performance.now();
  const previousSnap = hero.style.scrollSnapType;
  hero.style.scrollSnapType = "none";
  heroAutoScrolling = true;

  const tick = (time) => {
    const progress = Math.min((time - startedAt) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    hero.scrollLeft = startLeft + distance * eased;
    if (progress < 1) {
      heroScrollAnimation = requestAnimationFrame(tick);
      return;
    }
    hero.style.scrollSnapType = previousSnap;
    heroAutoScrolling = false;
    scheduleHeroSettle();
  };

  heroScrollAnimation = requestAnimationFrame(tick);
}

function setHero(index, behavior = "smooth") {
  if (immersiveHero) {
    updateHero(index);
    return;
  }
  const direction = Math.sign(index - heroIndex);
  if (!direction) return;
  heroPhysicalIndex = Math.round(hero.scrollLeft / Math.max(hero.clientWidth, 1));
  const targetIndex = heroPhysicalIndex + direction;
  const targetLeft = targetIndex * hero.clientWidth;
  if (behavior === "smooth") animateHeroScroll(targetLeft);
  else hero.scrollTo({ left: targetLeft, behavior });
}

function restartHeroTimeoutProgress() {
  if (!heroTimeoutProgress) return;
  heroTimeoutProgress.style.animationPlayState = "running";
  heroTimeoutProgress.classList.remove("is-running");
  void heroTimeoutProgress.offsetWidth;
  heroTimeoutProgress.classList.add("is-running");
}

function startHero() {
  clearTimeout(heroTimer);
  if (reduceHeroMotion.matches) {
    if (heroTimeoutProgress) heroTimeoutProgress.style.animationPlayState = 'paused';
    return;
  }
  if ((document.documentElement.hasAttribute('data-hover-enabled') && heroPreviewShell?.matches(':hover')) || heroPreviewShell?.querySelector(':focus-visible')) {
    if (heroTimeoutProgress) heroTimeoutProgress.style.animationPlayState = 'paused';
    return;
  }
  restartHeroTimeoutProgress();
  heroTimer = setTimeout(() => {
    setHero(heroIndex + 1);
    startHero();
  }, 4600);
}

// Reduced motion keeps an actual decoded frame of the current video, not an animation.
const syncHeroVideoMotion = () => {
  hero?.querySelectorAll('video').forEach(video => {
    if (reduceHeroMotion.matches) {
      video.autoplay = false;
      video.pause();
      const freeze = () => { if (video.currentTime === 0 && Number.isFinite(video.duration)) video.currentTime = Math.min(0.1, video.duration / 2); };
      if (video.readyState >= 1) freeze();
      else video.addEventListener('loadedmetadata', freeze, {once:true});
    } else {
      video.autoplay = true;
      video.play().catch(() => {});
    }
  });
  startHero();
};
reduceHeroMotion.addEventListener('change', syncHeroVideoMotion);
syncHeroVideoMotion();

hero.addEventListener("pointerdown", (event) => {
  cancelAnimationFrame(heroScrollAnimation);
  hero.style.scrollSnapType = "";
  heroPointerStartX = event.clientX;
  heroPointerCurrentX = event.clientX;
  heroInteracting = true;
  heroAutoScrolling = false;
  clearTimeout(heroTimer);
  clearTimeout(heroLoopTimer);
}, { passive: true });

hero.addEventListener("pointermove", (event) => {
  if (!heroInteracting || !immersiveHero) return;
  heroPointerCurrentX = event.clientX;
}, { passive: true });

hero.addEventListener("pointerup", (event) => {
  heroPointerCurrentX = event.clientX;
  if (immersiveHero) {
    const distance = heroPointerCurrentX - heroPointerStartX;
    if (Math.abs(distance) > 42) setHero(heroIndex + (distance < 0 ? 1 : -1));
  }
  heroInteracting = false;
  scheduleHeroSettle();
  startHero();
}, { passive: true });

hero.addEventListener("pointercancel", () => {
  heroInteracting = false;
  scheduleHeroSettle();
  startHero();
}, { passive: true });

hero.addEventListener("scroll", () => {
  if (immersiveHero) return;
  heroPhysicalIndex = Math.round(hero.scrollLeft / Math.max(hero.clientWidth, 1));
  const nextIndex = modulo(heroPhysicalIndex, heroCount);
  if (nextIndex !== heroIndex) updateHero(nextIndex);
  if (!heroInteracting) scheduleHeroSettle();
  if (!heroInteracting && !heroAutoScrolling) startHero();
}, { passive: true });

hero.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  setHero(heroIndex + (event.key === "ArrowRight" ? 1 : -1));
  startHero();
});

heroPreviousButton?.addEventListener("click", () => {
  setHero(heroIndex - 1);
  startHero();
});

heroNextButton?.addEventListener("click", () => {
  setHero(heroIndex + 1);
  startHero();
});

heroTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    setHero(index);
    startHero();
  });
  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const nextIndex = modulo(index + (event.key === "ArrowRight" ? 1 : -1), heroCount);
    heroTabs[nextIndex]?.focus({ preventScroll: true });
    setHero(nextIndex);
    startHero();
  });
});

if (heroPreviewRail && heroPreviewShell) {
  const previous = qs('[data-preview-prev]');
  const next = qs('[data-preview-next]');
  const updateEdges = () => {
    previous.hidden = heroPreviewRail.scrollLeft < 2;
    next.hidden = heroPreviewRail.scrollLeft >= heroPreviewRail.scrollWidth - heroPreviewRail.clientWidth - 2;
  };
  const pauseHero = () => {
    clearTimeout(heroTimer);
    if (heroTimeoutProgress) heroTimeoutProgress.style.animationPlayState = 'paused';
  };
  heroPreviewShell.addEventListener('pointerenter', () => {
    if (document.documentElement.hasAttribute('data-hover-enabled')) pauseHero();
  });
  heroPreviewShell.addEventListener('pointerleave', () => {
    if (document.documentElement.hasAttribute('data-hover-enabled')) startHero();
  });
  heroPreviewShell.addEventListener('focusin', event => {
    if (event.target.matches(':focus-visible')) pauseHero();
  });
  heroPreviewShell.addEventListener('focusout', event => {
    if (!heroPreviewShell.contains(event.relatedTarget)) startHero();
  });
  [previous, next].forEach((button, index) => button.addEventListener('click', () => {
    const gap = parseFloat(getComputedStyle(heroPreviewRail).columnGap) || 0;
    heroPreviewRail.scrollBy({left: (heroTabs[0].offsetWidth + gap) * (index ? 1 : -1), behavior: reduceHeroMotion.matches ? 'instant' : 'smooth'});
  }));
  heroPreviewRail.addEventListener('scroll', updateEdges, { passive: true });
  new ResizeObserver(updateEdges).observe(heroPreviewRail);
  updateEdges();
}

window.addEventListener("resize", () => {
  alignActiveHeroPreview(false);
  if (!immersiveHero) requestAnimationFrame(() => jumpHeroTo(heroCount + heroIndex));
}, { passive: true });

updateHero(0);
if (!immersiveHero) requestAnimationFrame(() => jumpHeroTo(heroCount));
startHero();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

qsa(".reveal").forEach((node) => observer.observe(node));
