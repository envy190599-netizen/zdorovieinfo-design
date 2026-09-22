document.querySelectorAll(".search-input").forEach((form) => {
  const header = form.closest(".header");
  const input = form.querySelector("input[name='q']");
  const toggle = header?.querySelector(".mobile-search-button");
  const actions = toggle?.parentElement;
  const menuToggle = actions?.querySelector(".menu-toggle");
  const close = form.querySelector(".search-input__close");
  const mobile = matchMedia("(max-width: 1279px)");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const desktopPlaceholder = input?.placeholder;
  let moving = false;
  let motion;

  const setOpen = (open, restoreFocus = false) => {
    const expanded = mobile.matches && open;
    const changed = header?.classList.contains("is-search-open") !== expanded;
    const previous = toggle?.getBoundingClientRect();
    moving = true;
    motion?.cancel();
    // Move the existing control: opening the field never creates another icon.
    if (expanded) form.prepend(toggle);
    else if (actions && toggle) actions.insertBefore(toggle, menuToggle);
    header?.classList.toggle("is-search-open", expanded);
    toggle?.setAttribute("aria-expanded", String(expanded));
    toggle?.setAttribute("aria-label", expanded ? "Найти" : "Открыть поиск");
    form.inert = mobile.matches && !expanded;
    if (expanded) input?.focus({ preventScroll: true });
    else if (restoreFocus && mobile.matches) toggle?.focus({ preventScroll: true });
    moving = false;
    if (changed && mobile.matches && previous?.width && toggle && !reducedMotion.matches) {
      const next = toggle.getBoundingClientRect();
      motion = toggle.animate([
        { transform: `translate(${previous.x - next.x}px, ${previous.y - next.y}px)` },
        { transform: "translate(0, 0)" },
      ], { duration: 220, easing: "cubic-bezier(0, 0, 0.2, 1)" });
    }
  };
  const syncViewport = () => {
    if (input) input.placeholder = mobile.matches ? "Поиск по сайту" : desktopPlaceholder;
    setOpen(false);
  };
  toggle?.addEventListener("click", () => {
    if (header.classList.contains("is-search-open")) {
      form.requestSubmit();
      return;
    }
    window.ZI_COMPONENTS?.setSpecialsOpen(false);
    setOpen(true);
  });
  close?.addEventListener("click", () => setOpen(false, true));
  header?.addEventListener("zi:menu-change", () => setOpen(false));
  form.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobile.matches) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false, true);
    }
  });
  document.addEventListener("pointerdown", (event) => {
    if (mobile.matches && !form.contains(event.target) && !toggle?.contains(event.target)) setOpen(false);
  });
  form.addEventListener("focusout", (event) => {
    // Keep the form open while moving its control or clicking submit/close in Safari.
    if (!moving && mobile.matches && event.relatedTarget && !form.contains(event.relatedTarget) && !toggle?.contains(event.relatedTarget)) setOpen(false);
  });
  mobile.addEventListener("change", syncViewport);
  syncViewport();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = input?.value.trim() || "";
    const target = new URL(form.action, window.location.href);
    if (query) target.searchParams.set("q", query);
    window.location.assign(target);
  });
});
