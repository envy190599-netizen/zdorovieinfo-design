document.querySelectorAll(".search-input").forEach((form) => {
  const header = form.closest(".header");
  const input = form.querySelector("input[name='q']");
  const toggle = header?.querySelector(".mobile-search-button");
  const close = form.querySelector(".search-input__close");
  const mobile = matchMedia("(max-width: 1279px)");
  const desktopPlaceholder = input?.placeholder;

  const setOpen = (open, restoreFocus = false) => {
    const expanded = mobile.matches && open;
    const menuOpen = header?.classList.contains("is-menu-open");
    header?.classList.toggle("is-search-open", expanded && !menuOpen);
    toggle?.setAttribute("aria-expanded", String(expanded));
    form.inert = mobile.matches && !expanded && !menuOpen;
    if (expanded) input?.focus({ preventScroll: true });
    else if (restoreFocus && mobile.matches) toggle?.focus({ preventScroll: true });
  };
  const syncViewport = () => {
    if (input) input.placeholder = mobile.matches ? "Поиск по сайту" : desktopPlaceholder;
    setOpen(false);
  };
  toggle?.addEventListener("click", () => {
    header.querySelector(".menu-toggle.is-open")?.click();
    window.ZI_COMPONENTS?.setSpecialsOpen(false);
    setOpen(true);
  });
  close?.addEventListener("click", () => setOpen(false, true));
  header?.addEventListener("zi:menu-change", () => setOpen(false));
  form.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobile.matches) {
      event.preventDefault();
      setOpen(false, true);
    }
  });
  document.addEventListener("pointerdown", (event) => {
    if (mobile.matches && !form.contains(event.target) && !toggle?.contains(event.target)) setOpen(false);
  });
  form.addEventListener("focusout", (event) => {
    // Do not collapse between pointerdown and click on submit/close (Safari).
    if (mobile.matches && event.relatedTarget && !form.contains(event.relatedTarget)) setOpen(false);
  });
  mobile.addEventListener("change", syncViewport);
  syncViewport();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = form.querySelector("input[name='q']");
    const query = input?.value.trim() || "";
    const target = new URL(form.action, window.location.href);

    if (query) target.searchParams.set("q", query);
    window.location.assign(target);
  });
});
