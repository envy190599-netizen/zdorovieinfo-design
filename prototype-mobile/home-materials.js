(() => {
  const formatDate = (date) => new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`)).replace(" г.", "");

  const articleHref = (slug) => `./article.html?slug=${encodeURIComponent(slug)}`;

  const catalogs = {
    infographic: [{
      title: "Как устроено сердце",
      category: "symptoms-treatment",
      categoryLabel: "Сердце и сосуды",
      image: "./assets/local/stock-heart-stethoscope.jpg",
      imageAlt: "Стетоскоп на голубом фоне",
      href: "./infographic.html",
      date: "2025-03-19",
      type: "Инфографика",
      meta: "Сердце и сосуды · 19 марта 2025",

    },
      {"title": "Кто может стать донором", "category": "symptoms-treatment", "categoryLabel": "Здоровье", "image": "./assets/editorial/static-infographics/donor-eligibility-cover.webp?v=20260921-stock", "imageAlt": "Красное сердце в руке на светлом фоне", "href": "./infographic-donor-eligibility.html", "type": "Инфографика", "meta": "Здоровье"},
      {"title": "Сохранение здоровья между донациями", "category": "lifestyle", "categoryLabel": "Образ жизни", "image": "./assets/editorial/static-infographics/donor-health-cover.webp?v=20260921-stock", "imageAlt": "Пробежка по дорожке в зелёном парке", "href": "./infographic-donor-health.html", "type": "Инфографика", "meta": "Образ жизни"},
      {"title": "Рацион перед донацией", "category": "food", "categoryLabel": "Еда", "image": "./assets/editorial/static-infographics/donor-food-before-cover.webp?v=20260921-stock", "imageAlt": "Чай, тосты и джем на деревянном подносе", "href": "./infographic-donor-food-before.html", "type": "Инфографика", "meta": "Еда"},
      {"title": "Питание доноров между донациями", "category": "food", "categoryLabel": "Еда", "image": "./assets/editorial/static-infographics/donor-food-between-cover.webp?v=20260921-stock", "imageAlt": "Рыба, крупа и овощи на светлом столе", "href": "./infographic-donor-food-between.html", "type": "Инфографика", "meta": "Еда"},
      {"title": "Лейкоз: что такое рак крови", "category": "symptoms-treatment", "categoryLabel": "Симптомы и лечение", "image": "./assets/editorial/static-infographics/leukemia-cover.webp?v=20260921-stock", "imageAlt": "Микроскоп и лабораторные пробирки на белом фоне", "href": "./infographic-leukemia.html", "type": "Инфографика", "meta": "Симптомы и лечение"},
      {"title": "Как отсутствие сна влияет на мозг", "category": "lifestyle", "categoryLabel": "Образ жизни", "image": "./assets/editorial/static-infographics/sleep-brain-cover.webp?v=20260921-stock", "imageAlt": "Женщина спит на белой подушке", "href": "./infographic-sleep-brain.html", "type": "Инфографика", "meta": "Образ жизни"},
      {"title": "Нормы давления для разных возрастов", "category": "symptoms-treatment", "categoryLabel": "Сердце и сосуды", "image": "./assets/editorial/static-infographics/blood-pressure-cover.webp?v=20260921-stock", "imageAlt": "Электронный тонометр с манжетой на светлой поверхности", "href": "./infographic-blood-pressure.html", "type": "Инфографика", "meta": "Сердце и сосуды"}
    ],
    slideshow: [{
      title: "Идеальные совпадения неслучайны: как стать донором костного мозга",
      category: "symptoms-treatment",
      categoryLabel: "Здоровье",
      image: "./assets/editorial/donor/01bg.jpg",
      imageAlt: "Иллюстрация лекции о донорстве костного мозга",
      href: "./slideshow.html",
      date: "2025-10-15",
      type: "Слайдшоу",
      meta: "Здоровье · 15 октября 2025",
      excerpt: "Генетические близнецы, пересадка костного мозга, мифы и этапы донорства",
    }],
  };

  // Publisher dates verified on the source URLs recorded in static-infographics/sources.json.
  // Other imported posters have no confirmed date: the user approved an explicit demo date.
  const posterPublicationDates = {
    './infographic-sleep-brain.html': '2015-11-12',
    './infographic-blood-pressure.html': '2024-05-16',
  };
  catalogs.infographic.forEach(item => {
    if (item.date) return;
    item.date = posterPublicationDates[item.href] || '2026-09-17';
    item.dateIsDemo = !posterPublicationDates[item.href];
  });

  const articles = window.ZI_ARTICLES || [];
  const mixedArticles = [...articles]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(a.category).localeCompare(String(b.category)));

  window.ZI_MATERIAL_CATALOGS = catalogs;

  document.querySelectorAll("[data-sidebar-materials]").forEach((placeholder) => {
    const excludedCovers = /popugai|immunitet-dolgozhitelej|staryat-vash-mozg|magnitnye-buri/;
    const items = mixedArticles.filter((article) => !excludedCovers.test(article.slug)).slice(0, 12).map((article) => ({
      ...article,
      href: articleHref(article.slug),
      meta: "Статья",
    }));
    const library = window.ZI_COMPONENTS.createDiseaseLibrary();
    const panels = [library, window.ZI_COMPONENTS.createReadingSidebar(items.slice(8, 12), { title: "Сейчас читают", thumbnails: true })];
    placeholder.replaceChildren(...panels);
    const desktop = matchMedia("(min-width: 1280px)");
    const showMobilePanels = document.body.matches('.editorial-home, .personal-feed-page');
    let mobileSlot = document.querySelector("[data-disease-library-mobile]");
    if (!mobileSlot && showMobilePanels) {
      mobileSlot = document.createElement('div');
      mobileSlot.dataset.diseaseLibraryMobile = '';
      const weekly = document.querySelector('[data-week-digest]');
      const content = document.querySelector('.topic-page-content');
      if (weekly) weekly.after(mobileSlot);
      else if (content) {
        const footer = content.querySelector('.footer');
        content.insertBefore(mobileSlot, footer);
      }
    }
    const placeLibrary = () => {
      (desktop.matches || !showMobilePanels ? placeholder : mobileSlot).append(...panels);
    };
    desktop.addEventListener("change", placeLibrary);
    placeLibrary();
  });

  const heroSlides = document.querySelector('[data-slider="hero"]');
  const heroPreviews = document.querySelector('.hero-preview-tabs');
  if (heroSlides && heroPreviews) {
    mixedArticles.slice(0, 8).forEach((article) => {
      const index = heroSlides.children.length;
      const slide = document.createElement('article');
      slide.className = 'hero-slide';
      slide.dataset.slide = '';
      // An explicit editorial pair wins; otherwise split the supplied topic at its colon.
      // A topic without a subtitle stays whole instead of borrowing its category/type.
      const separator = article.title.indexOf(':');
      const heading = article.heroTitle || (separator > 0 ? article.title.slice(0, separator) : article.title);
      const continuation = separator > 0 ? article.title.slice(separator + 1).trim() : '';
      const subtitle = article.heroSubtitle ?? (continuation.charAt(0).toLocaleUpperCase('ru') + continuation.slice(1));
      slide.dataset.heroTitleFirst = heading;
      slide.dataset.heroTitleSecond = '';
      slide.dataset.heroSubtitle = subtitle;
      slide.dataset.heroHref = articleHref(article.slug);
      const image = document.createElement('img');
      image.src = article.image;
      image.alt = '';
      slide.append(image);
      heroSlides.append(slide);
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'hero-preview';
      tab.dataset.heroTab = index;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', 'false');
      tab.style.setProperty('--hero-tab-image', `url("${article.image}")`);
      const title = document.createElement('span');
      title.textContent = heading;
      const detail = document.createElement('small');
      detail.textContent = subtitle;
      tab.append(title);
      if (subtitle) tab.append(detail);
      heroPreviews.append(tab);
    });
  }

  const feed = document.querySelector("[data-home-material-sections]");
  // Mount before reveal observers initialize; the home-only module fills the catalog.
  if (feed) feed.replaceChildren(window.ZI_COMPONENTS.createMixedMaterialFeed());

  const weeklyArticles = [...articles]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(b.slug).localeCompare(String(a.slug)))
    .slice(0, 10)
    .map((article) => ({
      ...article,
      href: articleHref(article.slug),
      meta: formatDate(article.date),
    }));

  document.querySelectorAll("[data-week-digest]").forEach((placeholder) => {
    placeholder.append(window.ZI_COMPONENTS.createWeekDigest(weeklyArticles, {
      href: "./articles.html",
      title: "Главное за неделю",
      description: "Свежие материалы и советы врачей",
    }));
  });
})();
