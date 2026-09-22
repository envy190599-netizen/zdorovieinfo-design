(() => {
  // Hover is a desktop pointer enhancement, never a sticky touch state.
  const hoverCapability = matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)');
  const syncHoverCapability = () => document.documentElement.toggleAttribute('data-hover-enabled', hoverCapability.matches);
  syncHoverCapability();
  hoverCapability.addEventListener('change', syncHoverCapability);
  // Keep the originating list entry and its exact position when a slideshow closes.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
    const destination = new URL(link.href, location.href);
    if (destination.origin !== location.origin || !destination.pathname.endsWith('/slideshow.html')) return;
    history.replaceState({ ...history.state, slideshowReturnY: window.scrollY }, '', location.href);
  });
  window.addEventListener('pageshow', () => {
    if (Number.isFinite(history.state?.slideshowReturnY)) {
      requestAnimationFrame(() => window.scrollTo({ top: history.state.slideshowReturnY, behavior: 'instant' }));
    }
  });

  const useSidebarNavigation = true;
  document.body.classList.toggle("is-sidebar-navigation", useSidebarNavigation);

  const componentSettings = {
    wowHeaderLayout: "flush",
    showMascot: !document.body.classList.contains("component-library-page"),
  };
  document.body.classList.add("is-secondary-header-hidden");
  let componentSequence = 0;

  const specialProjectColumns = [
    [
      ["Служба боли", "./index.html#materials", true],
      ["Близко к сердцу", "./index.html#materials", true],
      ["Мое давление – моя ответственность", "https://ru.mybpapp.com/", true, true],
      ["Всё о варикозе", "./index.html#materials"],
      ["Вся правда о соках", "./index.html#materials"],
      ["Выпадение волос", "./index.html#materials"],
      ["Гиперактивный мочевой пузырь и цистит", "./index.html#materials"],
      ["Глазные болезни", "./index.html#materials"],
      ["Дышать легко", "./index.html#materials"],
      ["Секс и отношения", "./index.html#materials"],
      ["Жизнь без антибиотиков", "./index.html#materials"],
      ["Менопауза", "./index.html#materials"],
      ["Запору нет!", "./index.html#materials"],
    ],
    [
      ["Заботься о печени", "./index.html#materials"],
      ["Здоровые зубы", "./index.html#materials"],
      ["Здоровый сон", "./index.html#materials"],
      ["Как не умереть от коронавируса", "./index.html#materials"],
      ["Как победить грибок стопы", "./index.html#materials"],
      ["Как сохранить память?", "./index.html#materials"],
      ["Красота с командой профессора Пухова", "./index.html#materials"],
      ["Мужское здоровье", "./index.html#materials"],
      ["Насколько опасен мой дом?", "./index.html#materials"],
      ["Наша кожа", "./index.html#materials"],
      ["Недержание – не приговор", "./index.html#materials"],
      ["Онко-Дозор", "./index.html#materials"],
    ],
    [
      ["Изжога: в чем причина и как от неё избавиться", "./index.html#materials"],
      ["Правильное питание", "./index.html#materials"],
      ["Прощайте, прыщи!", "./index.html#materials"],
      ["Профилактика гриппа и простуды", "./index.html#materials"],
      ["Хочу быть красивой", "./index.html#materials"],
      ["Сахарный диабет", "./index.html#materials"],
      ["Геморрой не приговор", "./index.html#materials"],
      ["Суставы не болят", "./index.html#materials"],
      ["«Царская болезнь»: гемофилия", "./index.html#materials"],
      ["Чистая вода", "./index.html#materials"],
      ["Я – мама", "./index.html#materials"],
      ["Болезнь Дюшенна: мышечная дистрофия у детей", "./index.html#materials"],
    ],
  ];

  const socialLinks = [
    ["MAX", "https://max.ru/zdorovie_info", "max.svg?v=20260917-02"],
    ["Telegram", "https://t.me/malyshevalives", "telegram.svg"],
    ["Дзен", "https://dzen.ru/zdorovieinfo", "dzen.svg"],
    ["YouTube", "https://www.youtube.com/channel/UC1qrf9BcKDKY4IJYZuIf1JA", "youtube.svg"],
    ["VK", "https://vk.com/zdorovie_info", "vk.svg"],
    ["Одноклассники", "https://ok.ru/zdorovieinfo", "ok.svg"],
  ];

  const resolveVariant = () => "wow";

  const routeMap = () => {
    const home = "./index.html";
    return {
      home,
      week: `${home}#week`,
      projects: `${home}#materials`,
      articles: "./articles.html",
      television: "./television.html",
      encyclopedia: `${home}#encyclopedia`,
      slides: `${home}#slides`,
      infographics: `${home}#infographics`,
    };
  };

  const externalAttributes = (isExternal) => (
    isExternal ? ' target="_blank" rel="noopener noreferrer"' : ""
  );

  const logoMarkup = (href, extraClass = "") => `
    <a class="logo${extraClass ? ` ${extraClass}` : ""}" href="${href}" aria-label="Здоровье с Еленой Малышевой">
      <img class="logo__word" src="./assets/figma/logo-main-word.svg" alt="" />
      <img class="logo__subline logo__subline--a" src="./assets/figma/logo-main-subline-a.svg" alt="" />
      <img class="logo__subline logo__subline--b" src="./assets/figma/logo-main-subline-b.svg" alt="" />
      <img class="logo__mark logo__mark--a" src="./assets/figma/logo-main-mark-a.svg" alt="" />
      <img class="logo__mark logo__mark--b" src="./assets/figma/logo-main-mark-b.svg" alt="" />
    </a>
  `;

  const rubricIconNames = [
    "food", "weight", "mother-child", "relationships", "myths", "symptoms",
    "beauty", "fitness", "science", "women-health", "lifestyle",
  ];
  const rubricIconStyle = (iconIndex = 0) => (
    `--rubric-icon-image:url('./assets/local/navigation-3d-v2/${rubricIconNames[iconIndex] || rubricIconNames[0]}.png')`
  );

  const rubricNavMarkup = (categories, active) => `
    <div class="rubric-nav-shell">
      <nav class="rubric-nav" aria-label="Темы здоровья" data-rubric-nav>
        ${categories.map((category) => {
          const current = category.slug === active;
          return `
            <a class="navigation-item${current ? " is-current" : ""}" href="./articles.html?category=${encodeURIComponent(category.slug)}" data-rubric="${category.slug}"${current ? ' aria-current="page"' : ""}>
              <span class="rubric-nav__icon-frame" aria-hidden="true"><span class="rubric-nav__icon" style="${rubricIconStyle(category.iconIndex)}" data-rubric-icon></span></span>
              <span>${category.label}</span>
            </a>
          `;
        }).join("")}
      </nav>
    </div>
  `;

  const socialMarkup = (className) => `
    <div class="social-links ${className}" aria-label="Социальные сети">
      ${(useSidebarNavigation || className === "social-links--footer") ? `<a class="social-button social-television" href="./television.html" aria-label="Телевидение" title="Телевидение"><span aria-hidden="true"></span></a>` : ""}
      ${socialLinks.map(([label, href, icon]) => `<a class="social-button" href="${href}" aria-label="${label}" target="_blank" rel="noopener noreferrer"><img src="./assets/local/${icon}" alt="${className === "social-links--footer" ? label : ""}" /></a>`).join("")}
    </div>
  `;

  const newsletterMarkup = (id) => {
    return `
      <section class="newsletter" aria-label="Подписка на рассылку">
        <div class="newsletter-copy"><h3>Будьте здоровы!</h3><p>Подпишитесь на нашу рассылку<br>и получайте советы о здоровье</p></div>
        <form class="newsletter-input" novalidate>
          <label for="${id}"><span class="sr-only">Электронная почта</span><input id="${id}" name="footer-email" type="email" required aria-describedby="${id}-status" placeholder="Электронная почта" autocomplete="email" enterkeyhint="send" /></label>
          <button type="submit" aria-label="Подписаться"></button>
        </form>
        <p class="newsletter-status sr-only" id="${id}-status" role="status" aria-live="polite"></p>
      </section>
    `;
  };

  const specialProjectsMarkup = () => `
    <div class="special-projects" id="special-projects" role="dialog" aria-modal="true" aria-label="Спецпроекты" aria-hidden="true" inert data-site-component="special-projects">
      <div class="special-projects__heading">
        <h2>Спецпроекты</h2>
        <button class="special-projects__close" type="button" aria-label="Закрыть спецпроекты"><span class="close-icon" aria-hidden="true"></span></button>
      </div>
      <div class="special-projects__list" id="special-project-results">
      ${specialProjectColumns.map((column) => `
        <div class="special-projects__column">
          ${column.map(([label, href, accent, external]) => `<a class="${accent ? "special-projects__accent" : ""}" href="${href}"${externalAttributes(external)}>${label}</a>`).join("")}
        </div>
      `).join("")}
      </div>
    </div>
    <button class="header-specials-scrim" type="button" aria-label="Закрыть каталог спецпроектов" tabindex="-1"></button>
  `;

  const headerSections = [
    { label: "Сбрось лишнее", href: "https://www.zdorovieinfo.ru/sbros-lishnee/" },
    { label: "Остеопороз", href: "https://www.zdorovieinfo.ru/osteoporoz-tixaya-ugroza-vashim-kostyam/" },
    { label: "Моё давление", href: "https://ru.mybpapp.com/" },
    { label: "Телевидение", href: "./television.html" },
  ];

  const sidebarProjectsMarkup = () => `
    <nav class="sidebar-projects" aria-label="Избранные спецпроекты">
      ${headerSections.slice(0, 3).map(({label, href}, index) => `<a class="navigation-item special-navigation-item" href="${href}"><span class="rubric-nav__icon-frame" aria-hidden="true"><span class="rubric-nav__icon${index ? ` sidebar-projects__icon--${index === 1 ? "bone" : "pressure"}` : ""}"${index === 0 ? ` style="${rubricIconStyle(1)}"` : ""}></span></span><span>${label}</span></a>`).join("")}
    </nav>
  `;

  const headerMarkup = (variant, active, instanceId) => {
    const routes = routeMap(variant);
    const wow = variant === "wow";
    const contextualWow = wow && !document.body.classList.contains("wow-page");
    const layoutClass = wow ? ` header--${componentSettings.wowHeaderLayout}` : "";
    return `
      <header class="header header--${variant}${layoutClass}${contextualWow ? " is-scrolled is-after-hero" : ""}" data-site-component="header" data-site-variant="${variant}" data-header-layout="${wow ? componentSettings.wowHeaderLayout : "standard"}">
        ${logoMarkup(routes.home)}
        <form id="site-search-${instanceId}" class="search-input search-input--always-open" action="${routes.articles}" method="get" role="search">
          <label>
            <img class="search-input__icon" src="./assets/figma/search-desktop.svg" alt="" />
            <input name="q" type="search" enterkeyhint="search" placeholder="Найти на Здоровье Инфо" aria-label="Найти на Здоровье Инфо" />
          </label>
          <button class="sr-only search-input__submit" type="submit">Найти</button>
          <button class="icon-button search-input__close" type="button" aria-label="Закрыть поиск"><span class="close-icon" aria-hidden="true"></span></button>
        </form>
        ${socialMarkup("social-links--header")}
        ${wow ? `
          <button class="special-button" type="button" aria-expanded="false" aria-controls="special-projects">
            <span class="special-button__pulse" aria-hidden="true"></span>
            <span>Спецпроекты</span>
          </button>
        ` : ""}
        <div class="header-actions">
          <button class="icon-button mobile-search-button" type="button" aria-label="Открыть поиск" aria-expanded="false" aria-controls="site-search-${instanceId}"><img class="search-input__icon" src="./assets/figma/search-desktop.svg" alt="" /></button>
          <button class="icon-button menu-toggle" type="button" aria-label="Открыть меню" aria-expanded="false" aria-controls="menu-panel-${instanceId}"><svg class="menu-icon" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="12" x2="21" y2="12"/></svg></button>
        </div>
      </header>
      ${wow ? specialProjectsMarkup() : ""}
      <button class="menu-scrim" type="button" aria-label="Закрыть меню" tabindex="-1"></button>
      <aside class="burger-menu" id="menu-panel-${instanceId}" aria-label="Меню" data-site-component="menu">
        ${logoMarkup(routes.home, "desktop-sidebar-brand")}
        ${wow ? `<button class="special-button special-button--menu" type="button" aria-expanded="false" aria-controls="special-projects">
          <span class="special-button__pulse" aria-hidden="true"></span>
          <span>Спецпроекты</span>
        </button>` : ""}
        ${socialMarkup("social-links--menu")}
        <div class="menu-topic-list">
          ${useSidebarNavigation ? sidebarProjectsMarkup() : ""}
          ${rubricNavMarkup(window.ZI_CATEGORIES || [], active)}
        </div>
      </aside>
    `;
  };

  const footerMarkup = (variant, instanceId) => {
    const routes = routeMap(variant);
    const utilityLinks = [
      ["О проекте", routes.home],
      ["Редакционная политика", routes.home],
      ["Политика конфиденциальности", routes.home],
      ["Реклама на сайте", routes.projects],
      ["Контакты", routes.home],
      ["Правила пользования сайтом", routes.home],
    ];
    return `
      <footer class="footer footer--${variant} reveal" data-site-component="footer" data-site-variant="${variant}">
        <div class="footer-content">
          <div class="footer-about">
            ${logoMarkup(routes.home, "footer-logo")}
            <p class="footer-note">© 2026 Здоровье Инфо. Материалы сайта носят информационный характер и не заменяют консультацию врача.</p>
            ${socialMarkup("social-links--footer")}
          </div>
          ${newsletterMarkup(`footer-newsletter-email-${instanceId}`)}
        </div>
        <div class="footer-divider" aria-hidden="true"></div>
        <nav class="footer-nav" aria-label="Служебная навигация">${utilityLinks.map(([label, href]) => `<a href="${href}">${label}</a>`).join("")}</nav>
      </footer>
    `;
  };

  const rightRailMarkup = () => `<aside class="home-right-rail" aria-label="Библиотека, рекомендации и реклама">
        <div class="home-right-rail__inner">
        <div class="home-right-rail__materials" data-sidebar-materials></div>
        <div class="advertisement-rail" data-wow-ad-rail aria-label="Реклама">
          <span class="advertisement-rail__label">Реклама</span>
          <div class="advertisement-rail__stage">
            <a class="wow-desktop-ad-creative is-active" data-ad-creative="enterosgel"></a>
            <a class="wow-desktop-ad-creative" data-ad-creative="beeline"></a>
            <a class="wow-desktop-ad-creative" data-ad-creative="agusha"></a>
          </div>
        </div>
        </div>
        </aside>`;

  const sidebarMarkup = (variant, active, scrollMode = "hover") => {
    const categories = window.ZI_CATEGORIES || [];
    return `
      <aside class="sidebar" data-wow-sidebar data-sidebar-scroll="${scrollMode === "auto" ? "auto" : "hover"}" aria-label="Темы здоровья" data-site-component="sidebar" data-site-variant="${variant}">
        ${useSidebarNavigation ? sidebarProjectsMarkup() : ""}
        ${rubricNavMarkup(categories, active)}
      </aside>
    `;
  };

  const replacePlaceholder = (placeholder, markup) => {
    const template = document.createElement("template");
    template.innerHTML = markup.trim();
    placeholder.replaceWith(template.content);
  };

  const setMenuOpen = (header, isOpen) => {
    const toggle = document.querySelector(".menu-toggle");
    const panel = document.querySelector(".burger-menu");
    const scrim = document.querySelector(".menu-scrim");
    if (!toggle || !panel || !scrim) return;
    if (isOpen && matchMedia('(max-width: 1279px)').matches) {
      document.documentElement.style.setProperty('--zi-menu-top', `${header.getBoundingClientRect().bottom}px`);
    }
    document.documentElement.classList.toggle('is-site-menu-open', isOpen && matchMedia('(max-width: 1279px)').matches);
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
    panel.classList.toggle("is-open", isOpen);
    panel.toggleAttribute("inert", !isOpen);
    scrim.classList.toggle("is-open", isOpen);
    header?.classList.toggle("is-menu-open", isOpen);
    header?.dispatchEvent(new CustomEvent("zi:menu-change", { detail: { open: isOpen } }));
  };

  let activeHeaderTrigger = null;
  const setSpecialsOpen = (isOpen) => {
    const header = document.querySelector(".header");
    const toggle = document.querySelector(".special-button");
    const panel = document.querySelector(".special-projects");
    const scrim = document.querySelector(".header-specials-scrim");
    if (!header || !toggle || !panel) return;
    if (isOpen) {
      setMenuOpen(header, false);
    }
    document.documentElement.style.setProperty(
      "--wow-header-viewport-bottom",
      `${Math.max(0, header.getBoundingClientRect().bottom).toFixed(2)}px`,
    );
    header.classList.toggle("is-specials-open", isOpen);
    header.toggleAttribute("inert", isOpen);
    document.querySelectorAll(".special-button").forEach(button => button.setAttribute("aria-expanded", String(isOpen)));
    panel.setAttribute("aria-hidden", String(!isOpen));
    panel.toggleAttribute("inert", !isOpen);
    scrim?.classList.toggle("is-open", isOpen);
    document.documentElement.classList.toggle("is-specials-overlay-open", isOpen);
    if (isOpen) {
      panel.scrollTop = 0;
      panel.querySelector(".special-projects__list").scrollTop = 0;
      panel.querySelector(".special-projects__close").focus({ preventScroll: true });
    }
    if (isOpen) header.classList.remove("is-search-open");
  };

  const bindChrome = () => {
    const header = document.querySelector('[data-site-component="header"]');
    const menuToggle = document.querySelector(".menu-toggle");
    const menuPanel = document.querySelector(".burger-menu");
    const menuScrim = document.querySelector(".menu-scrim");
    const specialsToggle = document.querySelector(".special-button");
    const specialsPanel = document.querySelector(".special-projects");
    const specialsScrim = document.querySelector(".header-specials-scrim");
    const closeSpecialsAndRestoreFocus = () => {
      setSpecialsOpen(false);
      if (activeHeaderTrigger?.classList.contains("special-button--menu")) setMenuOpen(header, true);
      (activeHeaderTrigger || specialsToggle)?.focus();
    };

    menuToggle?.addEventListener("click", () => {
      setSpecialsOpen(false);
      setMenuOpen(header, !menuToggle.classList.contains("is-open"));
    });
    menuScrim?.addEventListener("click", () => setMenuOpen(header, false));
    menuPanel?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenuOpen(header, false)));

    document.querySelectorAll(".special-button").forEach(button => button.addEventListener("click", () => {
      activeHeaderTrigger = button;
      setSpecialsOpen(!header?.classList.contains("is-specials-open"));
    }));
    specialsScrim?.addEventListener("click", closeSpecialsAndRestoreFocus);
    specialsPanel?.querySelector(".special-projects__close")?.addEventListener("click", closeSpecialsAndRestoreFocus);
    specialsPanel?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setSpecialsOpen(false)));

    document.addEventListener("pointerdown", (event) => {
      if (!header?.classList.contains("is-specials-open")) return;
      if (event.target.closest?.(".special-button") || specialsPanel?.contains(event.target) || specialsScrim?.contains(event.target)) return;
      setSpecialsOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Tab" && header?.classList.contains("is-specials-open")) {
        const targets = [...specialsPanel.querySelectorAll("a[href]:not([hidden]), input, button:not(.sr-only)")];
        const first = targets[0], last = targets[targets.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
      if (event.key !== "Escape") return;
      if (menuToggle?.classList.contains("is-open")) {
        setMenuOpen(header, false);
        menuToggle.focus();
      }
      if (header?.classList.contains("is-specials-open")) {
        closeSpecialsAndRestoreFocus();
      }
    });
    window.addEventListener("resize", () => {
      setSpecialsOpen(false);
      setMenuOpen(header, false);
    });

    document.querySelectorAll(".newsletter-input").forEach((form) => {
      const input = form.querySelector("input[type='email']");
      const button = form.querySelector('button');
      const status = form.parentElement.querySelector('[role="status"]');
      input?.addEventListener('input', () => {
        input.removeAttribute('aria-invalid');
        form.classList.remove('is-sent');
        if (status) status.textContent = '';
      });
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (form.classList.contains('is-sent')) return;
        if (!input?.checkValidity()) {
          input?.setAttribute('aria-invalid', 'true');
          if (status) status.textContent = 'Укажи корректный адрес электронной почты.';
          input?.focus();
          return;
        }
        input.removeAttribute('aria-invalid');
        // Prototype-only success: no request is sent and the address is not stored.
        form.classList.add('is-sent');
        input.type = 'text';
        input.value = 'Готово! Спасибо за подписку.';
        input.readOnly = true;
        button.hidden = true;
        if (status) status.textContent = 'Готово! Демонстрация подписки — адрес не отправлен и не сохранён.';
      });
    });
  };

  const mount = () => {
    // Artwork remains unchanged; the shared feed module adds its accessible trigger.
    if (componentSettings.showMascot && !document.querySelector(".site-mascot")) {
      const mascot = document.createElement("div");
      mascot.className = "site-mascot";
      if (document.querySelector('.hero') && document.querySelector('#week')) {
        mascot.classList.add('site-mascot--scroll-gated');
        mascot.inert = true;
      }
      mascot.setAttribute("aria-hidden", "true");
      const picture = document.createElement("picture");
      const motion = document.createElement("source");
      motion.type = "image/webp";
      motion.media = "(prefers-reduced-motion: no-preference)";
      motion.srcset = "./assets/mascot/malysheva-idle-v1.webp";
      const image = document.createElement("img");
      image.src = "./assets/mascot/malysheva-v3.png";
      image.alt = "";
      image.width = 1024;
      image.height = 1536;
      image.draggable = false;
      picture.append(motion, image);
      mascot.append(picture);
      document.body.append(mascot);
    }

    document.querySelectorAll("[data-site-header]").forEach((placeholder) => {
      const variant = resolveVariant(placeholder.dataset.variant);
      const active = placeholder.dataset.active || "home";
      const instanceId = ++componentSequence;
      if (variant === "wow") {
        document.body.classList.toggle("wow-header-layout-flush", componentSettings.wowHeaderLayout === "flush");
        document.body.classList.toggle("wow-header-layout-floating", componentSettings.wowHeaderLayout === "floating");
      }
      replacePlaceholder(placeholder, headerMarkup(variant, active, instanceId));
    });

    document.querySelectorAll("[data-site-footer]").forEach((placeholder) => {
      const variant = resolveVariant(placeholder.dataset.variant);
      replacePlaceholder(placeholder, footerMarkup(variant, ++componentSequence));
    });
    // Directories previously kept the footer outside their primary column.
    const primary = document.querySelector('.topic-page-content');
    const footer = document.querySelector('.footer');
    if (primary && footer && !primary.contains(footer)) primary.append(footer);

    document.querySelectorAll("[data-site-right-rail]").forEach((placeholder) => {
      replacePlaceholder(placeholder, rightRailMarkup());
    });

    document.querySelectorAll("[data-site-sidebar]").forEach((placeholder) => {
      const variant = resolveVariant(placeholder.dataset.variant);
      const params = new URLSearchParams(window.location.search);
      const requestedCategory = params.get("category")
        || (window.ZI_ARTICLES || []).find((article) => article.slug === params.get("slug"))?.category;
      const active = placeholder.dataset.active === "auto"
        ? requestedCategory
        : placeholder.dataset.active || "home";
      replacePlaceholder(placeholder, sidebarMarkup(variant, active, placeholder.dataset.sidebarScroll));
    });

    // Header/sidebar and bounded editorial columns share CSS layout tokens.
    bindChrome();
  };

  const createCompactCard = (item, options = {}) => {
    const card = document.createElement("a");
    const image = document.createElement("img");
    const imageFrame = document.createElement("div");
    imageFrame.className = "card-photo-frame";
    image.className = "card-photo";
    imageFrame.append(image);
    const title = document.createElement("h3");
    const meta = document.createElement("span");

    card.className = "compact-card";
    if (options.sidebar) card.classList.add("sidebar-material-card", `sidebar-material-card--${options.sidebar}`);
    card.href = item.href;
    card.draggable = false;
    image.src = item.image;
    image.alt = item.imageAlt || "";
    image.loading = "lazy";
    image.draggable = false;
    title.textContent = item.displayTitle || item.title;
    meta.textContent = options.sidebar ? (item.meta || item.type || "") : [item.categoryLabel, item.meta].filter(Boolean).join(" · ");
    card.append(imageFrame, title, meta);
    return card;
  };

  const createMoreArrow = () => {
    const arrow = document.createElement("span");
    arrow.className = "text-action__arrow";
    arrow.setAttribute("aria-hidden", "true");
    return arrow;
  };

  const createTextAction = (label, href, contextClass) => {
    const link = document.createElement(href ? "a" : "button");
    link.className = `text-action ${contextClass}`;
    if (href) link.href = href;
    else link.type = "button";
    const text = document.createElement("span");
    text.textContent = label;
    const arrow = createMoreArrow();
    link.append(text, arrow);
    return link;
  };

  const createDiseaseLibrary = () => {
    // Pair shorter labels with longer ones to reduce wrapping at sidebar widths.
    const systems = [
      ["immune", "Иммунная", "is_immunnaya_sistema"],
      ["liver", "Печень", "is_pechen_i_zhelchevyvodyaschie_puti"],
      ["respiratory", "Дыхательная", "is_organy_dyhaniya"],
      ["blood", "Кровь", "is_sistema_krovi"],
      ["nervous", "Нервная", "is_nervnaya_sistema"],
      ["endocrine", "Эндокринная", "is_endokrinologiya"],
      ["ent", "ЛОР", "is_uho_gorlo_nos"],
      ["digestive", "Пищеварительная", "is_organy_pischevareniya"],
      ["musculoskeletal", "Опорно-двигательная", "is_oporno-dvigatelnyy_apparat_i_soedinitelnoy_tkani"],
      ["cardiovascular", "Сердечно-сосудистая", "is_serdechno-sosudistaya_sistema"],
    ];
    const section = document.createElement("section");
    section.id = "encyclopedia";
    section.className = "reading-sidebar disease-library";
    section.setAttribute("aria-labelledby", "disease-library-title");
    section.innerHTML = `<h2 id="disease-library-title">Библиотека заболеваний</h2><div class="disease-library__links"></div>`;
    const list = section.querySelector(".disease-library__links");
    systems.forEach(([icon, label, path]) => {
      const link = document.createElement("a");
      link.className = `disease-pill disease-pill--${icon}`;
      link.href = `https://www.zdorovieinfo.ru/${path}/bolezni/`;
      link.innerHTML = `<span class="disease-pill__icon" aria-hidden="true"></span><span>${label}</span>`;
      list.append(link);
    });
    section.append(createTextAction("Все заболевания", "https://www.zdorovieinfo.ru/bolezni/", "reading-sidebar__more"));
    return section;
  };

  const createReadingSidebar = (items, options = {}) => {
    const section = document.createElement("section");
    const title = document.createElement("h2");
    const list = document.createElement("div");
    const headingId = `sidebar-materials-${++componentSequence}`;
    section.className = "reading-sidebar";
    section.setAttribute("aria-labelledby", headingId);
    title.id = headingId;
    title.textContent = options.title;
    list.className = "reading-sidebar__list";
    section.append(title, list);

    const pageSize = 4;
    const pageCount = Math.ceil(items.length / pageSize);
    let pageIndex = 0;
    const controls = document.createElement("div");
    const previous = document.createElement("button");
    const next = document.createElement("button");
    const status = document.createElement("span");
    controls.className = "reading-sidebar__controls";
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");
    [previous, next].forEach((button, index) => {
      button.type = "button";
      button.className = "reading-sidebar__arrow";
      button.setAttribute("aria-label", `${index ? "Следующие" : "Предыдущие"} материалы: ${options.title}`);
      button.title = button.getAttribute("aria-label");
      const icon = document.createElement("span");
      icon.className = index ? "reading-sidebar__chevron" : "reading-sidebar__chevron reading-sidebar__chevron--previous";
      icon.setAttribute("aria-hidden", "true");
      button.append(icon);
    });

    const render = () => {
      list.replaceChildren(...items.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize).map((item, index) =>
        createCompactCard(item, { sidebar: options.thumbnails ? "thumbnail" : index === 0 ? "featured" : "text" }),
      ));
      previous.disabled = pageIndex === 0;
      next.disabled = pageIndex === pageCount - 1;
      status.textContent = `${pageIndex + 1} / ${pageCount}`;
    };
    previous.addEventListener("click", () => { pageIndex -= 1; render(); });
    next.addEventListener("click", () => { pageIndex += 1; render(); });
    if (pageCount > 1) {
      controls.append(previous, status, next);
      section.append(controls);
    }
    section.append(createTextAction(options.moreLabel || "Все материалы", options.moreHref || "./articles.html", "reading-sidebar__more"));
    render();
    return section;
  };

  const createMaterialCard = (item) => {
    const card = document.createElement("a");
    const image = document.createElement("img");
    const imageFrame = document.createElement("div");
    imageFrame.className = "card-photo-frame";
    image.className = "card-photo";
    imageFrame.append(image);
    const type = document.createElement("span");
    const content = document.createElement("div");
    const title = document.createElement("h3");
    const meta = document.createElement("p");

    card.className = "material-card";
    card.href = item.href;
    card.draggable = false;
    imageFrame.classList.add("material-card__image");
    image.src = item.image;
    image.alt = item.imageAlt || "";
    image.loading = "lazy";
    image.draggable = false;
    type.className = "content-badge";
    type.textContent = item.type;
    content.className = "material-card__content";
    title.textContent = item.displayTitle || item.title;
    meta.className = "material-card__meta";
    meta.textContent = item.meta || item.categoryLabel || "";
    // Some catalogs pass a category-only meta string; keep their source date visible too.
    if (item.date && !/\d{4}/.test(meta.textContent)) {
      const date = new Date(`${item.date}T12:00:00`);
      if (!Number.isNaN(date.getTime())) {
        const dateText = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
          .format(date).replace(' г.', '');
        meta.textContent = [meta.textContent, dateText].filter(Boolean).join(' · ');
      }
    }
    if (item.dateIsDemo) {
      meta.dataset.demoDate = '';
      meta.title = 'Условная дата публикации для прототипа';
      meta.setAttribute('aria-label', `${meta.textContent}. Условная дата публикации для прототипа`);
    }
    content.append(title);
    if (item.showMeta !== false) content.append(meta);
    card.append(imageFrame);
    if (item.showType !== false) card.append(type);
    card.append(content);
    return card;
  };

  const createWideMaterialCard = (item) => {
    const card = createMaterialCard(item);
    card.classList.add("wide-material-card");
    return card;
  };

  const createMixedMaterialFeed = (options = {}) => {
    const section = document.createElement("section");
    const grid = document.createElement("div");
    section.id = options.id || "materials";
    section.className = "section mixed-material-feed-section reveal";
    section.setAttribute("aria-label", options.title || "Материалы");
    grid.className = "mixed-material-feed__grid editorial-material-grid";
    grid.dataset.mixedMaterialGrid = "";
    section.append(grid);
    return section;
  };

  // Horizontal recommendations reuse the compact editorial card anatomy.
  const createRelatedMaterials = (items, options = {}) => {
    const section = document.createElement("section");
    section.className = "related-materials";
    const heading = document.createElement("h2");
    heading.textContent = options.title || "Специально для вас";
    section.setAttribute("aria-label", heading.textContent);
    const viewport = document.createElement("div");
    viewport.className = "related-materials__viewport";
    const rail = document.createElement("div");
    rail.className = "related-materials__rail";
    rail.tabIndex = 0;
    rail.setAttribute("role", "region");
    rail.setAttribute("aria-label", "Похожие материалы — прокручиваемая подборка");
    rail.append(...items.map((item) => { const card = createCompactCard({ ...item, meta: "" }); card.classList.add("related-card"); return card; }));
    const controls = [-1, 1].map((direction) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `related-materials__arrow related-materials__arrow--${direction < 0 ? "previous" : "next"}`;
      button.setAttribute("aria-label", direction < 0 ? "Предыдущие материалы" : "Следующие материалы");
      const icon = document.createElement("span");
      icon.setAttribute("aria-hidden", "true");
      button.append(icon);
      button.addEventListener("click", () => scroll(direction));
      return button;
    });
    const scroll = (direction) => {
      const gap = Number.parseFloat(getComputedStyle(rail).gap) || 0;
      rail.scrollBy({ left: direction * (rail.firstElementChild.getBoundingClientRect().width + gap),
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    };
    const update = () => {
      controls[0].disabled = rail.scrollLeft <= 1;
      controls[1].disabled = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 1;
    };
    rail.addEventListener("scroll", update, { passive: true });
    rail.addEventListener("keydown", (event) => {
      if (event.target !== rail || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      scroll(event.key === "ArrowLeft" ? -1 : 1);
    });
    new ResizeObserver(update).observe(rail);
    viewport.append(rail, ...controls);
    section.append(heading, viewport);
    requestAnimationFrame(update);
    return section;
  };

  const createSourceReference = (title, references) => {
    const row = document.createElement("span");
    row.className = "source-reference";
    const label = document.createElement("span");
    label.className = "source-reference__title";
    label.textContent = title;
    const actions = document.createElement("span");
    actions.className = "source-reference__actions";
    references.forEach(({ href }, index) => {
      const link = document.createElement("a");
      link.className = "article-source-button";
      link.href = href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", `Открыть источник: ${title}${references.length > 1 ? ` (${index + 1})` : ""}`);
      link.title = "Открыть источник";
      const icon = document.createElement("img");
      icon.src = "./assets/figma/article-external-link.svg";
      icon.alt = "";
      link.append(icon);
      actions.append(link);
    });
    row.append(label, actions);
    return row;
  };

  const createWeekDigest = (items, options = {}) => {
    const panel = document.createElement("div");
    const header = document.createElement("div");
    const title = document.createElement("h2");
    const list = document.createElement("div");
    const initialCount = 5;
    const visibleItems = items.slice(0, initialCount * 2);
    const hasMore = visibleItems.length > initialCount;
    const more = createTextAction(hasMore ? "Показать ещё" : "Смотреть все", hasMore ? null : options.href || "./articles.html", "week-digest__more");

    panel.className = "week-digest__panel";
    header.className = "week-digest__header";
    title.textContent = options.title || "Главное за неделю";
    list.className = "week-digest__list";
    list.id = `week-digest-list-${++componentSequence}`;
    visibleItems.forEach((item, index) => {
      const link = document.createElement("a");
      const itemTitle = document.createElement("h3");
      const meta = document.createElement("span");
      link.className = "week-row";
      link.hidden = index >= initialCount;
      link.href = item.href;
      itemTitle.textContent = item.displayTitle || item.title;
      meta.className = "week-digest__meta";
      meta.textContent = [item.categoryLabel, item.meta].filter(Boolean).join(" · ");
      const text = document.createElement("div");
      text.className = "week-digest__text";
      text.append(itemTitle, meta);
      link.append(text);
      if (item.image) {
        const imageFrame = document.createElement("span");
        imageFrame.className = "card-photo-frame week-digest__thumbnail";
        const image = document.createElement("img");
        image.className = "card-photo";
        image.src = item.image;
        image.alt = "";
        image.loading = "lazy";
        image.width = 88;
        image.height = 66;
        imageFrame.append(image);
        link.prepend(imageFrame);
      }
      list.append(link);
    });

    const arrow = more.lastElementChild;
    arrow.classList.add("week-digest__arrow");
    if (hasMore) {
      more.type = "button";
      more.setAttribute("aria-expanded", "false");
      more.setAttribute("aria-controls", list.id);
      more.addEventListener("click", () => {
        list.querySelectorAll("[hidden]").forEach(item => { item.hidden = false; });
        const all = createTextAction("Смотреть все", options.href || "./articles.html", "week-digest__more");
        all.lastElementChild.classList.add("week-digest__arrow");
        more.replaceWith(all);
        all.focus({ preventScroll: true });
      }, { once: true });
    } else {
      more.href = options.href || "./articles.html";
    }
    header.append(title);
    panel.append(header, list, more);
    return panel;
  };

  window.ZI_COMPONENTS = {
    createMixedMaterialFeed,
    createMaterialCard,
    createWideMaterialCard,
    createReadingSidebar,
    createDiseaseLibrary,
    createTextAction,
    createWeekDigest,
    createSourceReference,
    createRelatedMaterials,
    mount,
    settings: componentSettings,
    setSpecialsOpen,
  };

  const adCreatives = {
    zeekr: {
      name: "ZEEKR 001",
      href: "https://www.zeekr.eu/models/001",
      src: "./assets/ads/zeekr-001-desktop.mp4",
      poster: "./assets/ads/zeekr-001-desktop.jpg",
      ratio: "16 / 9",
      portrait: {
        src: "./assets/ads/zeekr-001-mobile.mp4",
        poster: "./assets/ads/zeekr-001-mobile.jpg",
        ratio: "9 / 16",
      },
    },
    aravia: {
      name: "ARAVIA",
      href: "https://aravia.ru/",
      type: "image",
      src: "./assets/ads/aravia-desktop.webp",
      alt: "Начните знакомство с ARAVIA с детоксицирующего тоника. За покупками",
      ratio: "16 / 5",
      mobile: {
        src: "./assets/ads/aravia-mobile.webp",
        ratio: "1 / 1",
        position: "center bottom",
      },
    },
    enterosgel: {
      name: "Энтеросгель",
      href: "https://www.enterosgel.ru/",
      src: "https://www.enterosgel.ru/upload/iblock/ae7/422mvzvdehhk8zsx5uoka0uvoj0vcr4k.mp4",
      ratio: "1000 / 648",
      // The source has 43px letterboxing; one extra pixel avoids edge bleed.
      crop: { width: 1000, height: 648, top: 44, bottom: 44 },
    },
    beeline: {
      name: "Билайн",
      href: "https://beeline.ru/",
      src: "https://st.fl.ru/users/mi/mikhailbektyash/portfolio/f_735695240f42a561.mp4",
      ratio: "962 / 1920",
      crop: { width: 1080, height: 1920, left: 62, right: 56 },
    },
    agusha: {
      name: "Агуша",
      href: "https://agusha.ru/",
      src: "https://st.fl.ru/users/mi/mikhailbektyash/portfolio/f_780695241eb6b21d.mp4",
      ratio: "297 / 600",
      crop: { width: 300, height: 600, left: 2, right: 1, top: 2, bottom: 1 },
    },
  };

  // Mount shared rails before discovering their advertising slots.
  mount();

  // Shared onboarding is loaded once for every route using the mascot or feed.
  if (!document.querySelector('[data-page-scroll]')) {
    const scrolling = document.createElement('script');
    scrolling.src = './page-scroll.js?v=20260921-component-names';
    scrolling.dataset.pageScroll = '';
    document.body.append(scrolling);
  }

  if ((componentSettings.showMascot || document.querySelector('[data-personal-feed]')) && !document.querySelector('[data-feed-assistant]')) {
    const styles = document.createElement('link');
    styles.rel = 'stylesheet';
    styles.href = './feed-assistant.css?v=20260922-unified-icons';
    document.head.append(styles);
    const assistant = document.createElement('script');
    assistant.type = 'module';
    assistant.src = './feed-assistant.js?v=20260922-unified-icons';
    assistant.dataset.feedAssistant = '';
    document.body.append(assistant);
  }

  document.querySelectorAll("[data-ad-creative]").forEach((link) => {
    const creative = adCreatives[link.dataset.adCreative];
    if (!creative) return;
    link.href = creative.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `Реклама: ${creative.name}`);
    link.dataset.adRatio = creative.ratio;
    link.style.setProperty("--ad-aspect-ratio", creative.ratio);
    if (creative.type === "image") {
      const image = document.createElement("img");
      image.alt = creative.alt;
      image.decoding = "async";
      const mobile = window.matchMedia("(max-width: 1279px)");
      const setImageSource = () => {
        const selected = mobile.matches && creative.mobile ? creative.mobile : creative;
        image.src = selected.src;
        image.style.objectFit = "cover";
        image.style.objectPosition = selected.position || "center";
        link.dataset.adRatio = selected.ratio;
        link.style.setProperty("--ad-aspect-ratio", selected.ratio);
      };
      setImageSource();
      mobile.addEventListener("change", setImageSource);
      link.replaceChildren(image);
      return;
    }
    const video = document.createElement("video");
    const orientation = creative.portrait ? window.matchMedia("(orientation: portrait)") : null;
    const setSource = () => {
      const selected = orientation?.matches ? creative.portrait : creative;
      const resume = !video.paused && Boolean(link.closest(".opening-ad.is-open"));
      video.src = selected.src;
      if (selected.poster) video.poster = selected.poster;
      link.dataset.adRatio = selected.ratio;
      link.style.setProperty("--ad-aspect-ratio", selected.ratio);
      if (resume) video.play().catch(() => {});
    };
    setSource();
    orientation?.addEventListener("change", setSource);
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.autoplay = Boolean(creative.autoplay);
    video.setAttribute("aria-label", `Рекламный ролик: ${creative.name}`);
    video.style.objectFit = "cover";
    link.replaceChildren(video);
    if (creative.crop) {
      // Remove baked-in source edges, then cover the slot with a centered crop.
      const { width, height, left = 0, right = 0, top = 0, bottom = 0 } = creative.crop;
      const visibleWidth = width - left - right;
      const visibleHeight = height - top - bottom;
      const frame = document.createElement("span");
      frame.className = "ad-video-frame";
      video.style.cssText = `position:absolute;top:${-top / visibleHeight * 100}%;left:${-left / visibleWidth * 100}%;width:${width / visibleWidth * 100}%;height:${height / visibleHeight * 100}%;max-width:none;object-fit:fill;`;
      frame.append(video);
      link.replaceChildren(frame);
      const fitFrame = () => {
        const { width: linkWidth, height: linkHeight } = link.getBoundingClientRect();
        const frameWidth = Math.max(linkWidth, linkHeight * visibleWidth / visibleHeight);
        frame.style.width = `${frameWidth}px`;
        frame.style.height = `${frameWidth * visibleHeight / visibleWidth}px`;
      };
      new ResizeObserver(fitFrame).observe(link);
      fitFrame();
    }
  });

})();
