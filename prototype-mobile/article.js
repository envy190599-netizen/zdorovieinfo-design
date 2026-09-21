const articleParams = new URLSearchParams(window.location.search);
const articleSlug = articleParams.get("slug");
const articleData = (window.ZI_ARTICLES || []).find((item) => item.slug === articleSlug);
const articleRoot = document.querySelector("[data-article-root]");

function articleDate(date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`)).replace(" г.", "");
}

function escapeArticleHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Sanitized, complete publisher content preserves each material's own structure.
function renderArticle(articleData) {
  const content = window.ZI_ARTICLE_CONTENT?.[articleData.slug];
  const body = content?.html || `<p>${escapeArticleHtml(articleData.excerpt)}</p>`;
  const reviewer = typeof articleData.reviewer === "object"
    ? articleData.reviewer
    : window.ZI_REVIEWERS.frolova;

  return `
    <article class="article-layout material-reader-card" data-material-slug="${escapeArticleHtml(articleData.slug)}" aria-labelledby="material-title">
      <div class="article-main">
        <header class="article-heading">
          <div class="article-detail__meta">${articleData.categoryLabel}, ${articleDate(articleData.date)}</div>
          <h1 class="article-title" id="material-title">${escapeArticleHtml(articleData.title)}</h1>
        </header>
        <details class="reviewer">
          <summary>
            <span class="reviewer__avatar" role="img" aria-label="Фотография рецензента ${reviewer.name}" style="background-image: url('${reviewer.image}'); background-position: ${reviewer.imagePosition || "0% 0%"}"></span>
            <span><strong>${reviewer.name}</strong><small>${reviewer.role}</small></span>
            <img class="reviewer__chevron" src="./assets/figma/reviewer-chevron-up.svg" alt="" />
          </summary>
          <div class="reviewer__body">
            <div class="reviewer__field"><p><strong>Образование:</strong> ${reviewer.education}</p></div>
            <div class="reviewer__field"><p><strong>Квалификация:</strong> ${reviewer.qualification}</p></div>
            <div class="reviewer__field"><p><strong>Стаж:</strong> ${reviewer.experience}</p></div>
          </div>
        </details>
        <div class="article-body article-prose">${body}</div>
      </div>
      <div class="author-credit">Автор: ${articleData.author}</div>
    </article>
  `;

}

function formatArticleSources(prose) {
  let inSources = false;
  let pendingTitle = null;
  const sourceHeading = /^(?:(?:исследования и|использованные|научные)\s+)?(?:источники?(?:\s+исследований)?|список (?:литературы|источников)|литература|references|sources)\s*:?[\s.]*$/i;
  const urlPattern = /(?:https?:\/\/|www\.)[^\s<>"“”«»\u200B-\u200D\u2060\uFEFF]+/gi;
  const readReference = (item) => {
    const copy = item.cloneNode(true);
    const references = [...item.querySelectorAll("a[href]")].map(link => ({ href: link.href }));
    copy.querySelectorAll("br").forEach(br => br.replaceWith(document.createTextNode(" ")));
    copy.querySelectorAll("a").forEach(link => {
      const text = link.textContent.trim();
      link.replaceWith(document.createTextNode(/^(?:https?:\/\/|www\.|(?:ссылка|источник|читать|подробнее|link|read more)\s*$)/i.test(text) ? "" : text));
    });
    const title = copy.textContent.replace(urlPattern, raw => {
      let url = raw.replace(/[.,;:!?]+$/, "");
      // Sentence punctuation is not part of the address; balanced URL parentheses are.
      while (url.endsWith(")") && (url.match(/\)/g)?.length || 0) > (url.match(/\(/g)?.length || 0)) url = url.slice(0, -1);
      try {
        const href = new URL(/^www\./i.test(url) ? `https://${url}` : url).href;
        if (!references.some(reference => reference.href === href)) references.push({ href });
      } catch { return raw; }
      return "";
    }).replace(/[\u200B-\u200D\u2060\uFEFF]/g, "").replace(/\s+/g, " ").trim();
    return { title, references };
  };
  const renderReference = (item, { title, references }) => {
    if (!title && !references.length) return;
    item.classList.add("article-source-item");
    item.replaceChildren(window.ZI_COMPONENTS.createSourceReference(title || new URL(references[0].href).hostname, references));
  };
  for (const block of [...prose.children]) {
    if (sourceHeading.test(block.textContent.trim())) {
      inSources = true;
      pendingTitle = null;
      continue;
    }
    if (block.matches("h1, h2, h3, h4, h5, h6")) {
      inSources = false;
      pendingTitle = null;
    }
    if (!inSources) continue;
    const items = block.matches("ol, ul") ? [...block.children].filter((item) => item.matches("li")) : [block];
    for (const item of items) {
      if (item.classList.contains("article-source-item")) { pendingTitle = null; continue; }
      const reference = readReference(item);
      if (!reference.title && !reference.references.length) continue;
      // Publishers often put the citation title and its URL in adjacent paragraphs.
      if (pendingTitle && item.matches("p") && !reference.title && reference.references.length) {
        renderReference(pendingTitle.item, { title: pendingTitle.title, references: reference.references });
        item.remove();
        pendingTitle = null;
      } else {
        pendingTitle = !reference.references.length && item.matches("p") ? { item, title: reference.title } : null;
        // Leave unlinked prose intact; bibliography list entries still share the row component.
        if (reference.references.length || item.matches("li")) renderReference(item, reference);
      }
    }
  }
}

if (!articleData) {
  document.title = "Материал не найден — Здоровье Инфо";
  articleRoot.innerHTML = `
    <section class="article-not-found">
      <span>404</span>
      <h1>Материал не найден</h1>
      <p>Возможно, ссылка устарела. Вернитесь в каталог и выберите другую статью.</p>
      <a class="topic-more" href="./articles.html">Все статьи</a>
    </section>
  `;
} else {
  document.title = `${articleData.title} — Здоровье Инфо`;
  articleRoot.innerHTML = renderArticle(articleData);
  formatArticleSources(articleRoot.querySelector(".article-prose"));

  const source = window.ZI_ARTICLE_CONTENT?.[articleData.slug];
  const titleWords = (value) => new Set(value.toLowerCase().match(/[а-яёa-z]{5,}/g)?.map((word) => word.slice(0, 5)) || []);
  const words = titleWords(articleData.title);
  const common = (a = [], b = []) => a.filter((value) => b.includes(value)).length;
  const related = (window.ZI_ARTICLES || [])
    .filter((item) => item.slug !== articleData.slug)
    .map((item) => {
      const candidate = window.ZI_ARTICLE_CONTENT?.[item.slug];
      const sharedTags = common(source?.tags, candidate?.tags);
      const sharedWords = common([...words], [...titleWords(item.title)]);
      return { item, score: Number(item.category === articleData.category) * 10 + sharedTags * 4 + sharedWords * 3 };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.item.date.localeCompare(a.item.date))
    .slice(0, 8)
    .map(({ item }) => ({ ...item, displayTitle: item.title, meta: articleDate(item.date), href: `./article.html?slug=${encodeURIComponent(item.slug)}` }));
  if (related.length) articleRoot.append(window.ZI_COMPONENTS.createRelatedMaterials(related));
  const weekly = document.createElement("section");
  weekly.className = "week-digest";
  weekly.dataset.weekDigest = "";
  weekly.setAttribute("aria-label", "Главное за неделю");
  articleRoot.append(weekly);
}
