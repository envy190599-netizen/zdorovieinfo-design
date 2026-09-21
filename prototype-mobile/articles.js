const articlesRoot = document.querySelector("[data-articles-root]");
const articles = window.ZI_ARTICLES || [];
const categories = window.ZI_CATEGORIES || [];
const params = new URLSearchParams(window.location.search);
const requestedCategory = params.get("category");
const requestedMaterial = params.get("material");
const materialCatalogs = window.ZI_MATERIAL_CATALOGS || {};
const searchQuery = (params.get("q") || "").trim();
const activeCategory = categories.find((category) => category.slug === requestedCategory);
const materialTypes = ["Статья", "Инфографика", "Слайдшоу"];

document.querySelectorAll(".search-input input[name='q']").forEach((input) => {
  input.value = searchQuery;
});

function formatDate(date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`)).replace(" г.", "");
}

function articleHref(slug) {
  return `./article.html?slug=${encodeURIComponent(slug)}`;
}

function toMixedMaterial(article, index) {
  return {
    ...article,
    href: articleHref(article.slug),
    type: materialTypes[index % materialTypes.length],
    meta: [article.categoryLabel, formatDate(article.date)].filter(Boolean).join(" · "),
  };
}

function currentDirectory() {
  if (requestedMaterial && materialCatalogs[requestedMaterial]) {
    const type = requestedMaterial === "infographic" ? "Инфографика" : "Слайдшоу";
    return materialCatalogs[requestedMaterial].map((item) => ({
      ...item,
      type,
      meta: item.meta || item.categoryLabel,
    }));
  }

  const normalizedQuery = searchQuery.toLocaleLowerCase("ru-RU");
  const source = articles
    .filter((article) => !activeCategory || article.category === activeCategory.slug)
    .filter((article) => !normalizedQuery || [
      article.title,
      article.displayTitle,
      article.categoryLabel,
      article.excerpt,
    ].filter(Boolean).some((value) => String(value).toLocaleLowerCase("ru-RU").includes(normalizedQuery)))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(a.slug).localeCompare(String(b.slug)));

  const visibleSource = !activeCategory && !searchQuery ? source.slice(0, 24) : source;
  const materials = visibleSource.map(toMixedMaterial);
  const illustrated = Object.values(materialCatalogs).flat()
    .filter(item => item.href && !item.href.startsWith('./articles.html'))
    .filter(item => !activeCategory || item.category === activeCategory.slug)
    .filter(item => !normalizedQuery || [item.title, item.categoryLabel, item.excerpt]
      .filter(Boolean).some(value => String(value).toLocaleLowerCase('ru-RU').includes(normalizedQuery)));
  materials.splice(Math.min(4, materials.length), 0, ...illustrated);
  return materials;
}

function updatePageTitle() {
  const heading = document.querySelector("[data-topic-page-title]");
  const materialTitle = requestedMaterial === "infographic" ? "Инфографики" : "Слайдшоу";
  let title = "Все материалы";

  if (searchQuery) {
    title = `Поиск: ${searchQuery}`;
  } else if (requestedMaterial && materialCatalogs[requestedMaterial]) {
    title = materialTitle;
  } else if (activeCategory) {
    title = activeCategory.label;
  }

  heading.textContent = title;
  document.querySelector(".articles-results")?.setAttribute("aria-label", `Материалы: ${title}`);
  document.title = `${title} — Здоровье Инфо`;
}

function renderMaterials() {
  const materials = currentDirectory();
  updatePageTitle();

  if (!materials.length) {
    articlesRoot.innerHTML = `<p class="empty-state empty-state--articles">По вашему запросу ничего не найдено. Попробуйте изменить формулировку.</p>`;
    return;
  }

  const cards = materials.map((item, index) => window.ZI_COMPONENTS[(index + 1) % 5 === 0 ? "createWideMaterialCard" : "createMaterialCard"](item));
  articlesRoot.replaceChildren(...cards);
}

renderMaterials();
