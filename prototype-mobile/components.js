// This showcase mounts the same factories as product pages; no demo card copies.
(() => {
  const components = window.ZI_COMPONENTS;
  const tokens = [
    ['Brand', '--blue'], ['Accent', '--pink'], ['Canvas', '--bg'], ['Surface', '--panel'],
    ['Text / Primary', '--ink'], ['Text / Secondary', '--muted'],
    ['Border / Neutral', '--zi-color-border-neutral-default'],
    ['Border / Subtle', '--zi-color-border-default-subtle'],
  ];
  const styles = getComputedStyle(document.documentElement);
  const palette = document.querySelector('[data-library-tokens]');
  tokens.forEach(([label, token]) => {
    const card = document.createElement('article');
    card.className = 'token-card';
    card.dataset.token = token;
    const swatch = document.createElement('i');
    swatch.style.setProperty('--swatch', `var(${token})`);
    const name = document.createElement('strong');
    name.textContent = label;
    const value = document.createElement('span');
    value.textContent = `${token}: ${styles.getPropertyValue(token).trim()}`;
    card.append(swatch, name, value);
    palette.append(card);
  });
  const roles = ['panel-heading', 'section-heading', 'body-medium', 'small', 'compact-title', 'action', 'caption', 'caption-medium', 'newsletter-heading', 'symbol'];
  roles.forEach(role => {
    const sample = document.createElement('p');
    const token = `--zi-type-${role}`;
    sample.style.font = `var(${token})`;
    sample.textContent = `${role} — Здоровье Инфо`;
    document.querySelector('[data-library-type]').append(sample);
  });
  document.querySelector('[data-library-actions]').append(
    components.createTextAction('Все материалы', './articles.html', ''),
  );
  const items = window.ZI_ARTICLES.slice(0, 10).map(article => ({
    ...article, href: `./article.html?slug=${encodeURIComponent(article.slug)}`, type: 'Статья',
  }));
  document.querySelector('[data-library-cards]').append(...items.slice(0, 5).map((item, index) => components[(index + 1) % 5 === 0 ? "createWideMaterialCard" : "createMaterialCard"](item)));
  document.querySelector('[data-library-panels]').append(
    components.createWeekDigest(items, { title: 'Главное за неделю', href: './articles.html' }),
    components.createDiseaseLibrary(),
    components.createReadingSidebar(items.slice(0, 4), { title: 'Сейчас читают', thumbnails: true }),
  );
  document.querySelector('[data-library-related]').append(components.createRelatedMaterials(items.slice(0, 8)));
})();
