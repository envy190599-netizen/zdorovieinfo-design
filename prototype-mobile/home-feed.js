import { TV_ARCHIVE } from './television-data.js?v=20260921-component-names';
import { tvCardData } from './television-model.js?v=20260921-component-names';

const grid = document.querySelector('[data-mixed-material-grid]');
if (grid) {
  const materials = [
    ...(window.ZI_ARTICLES || []).map(article => ({
      ...article,
      href: `./article.html?slug=${encodeURIComponent(article.slug)}`,
      type: 'Статья',
    })),
    ...Object.values(window.ZI_MATERIAL_CATALOGS || {}).flat(),
    ...TV_ARCHIVE.map(episode => ({
      ...tvCardData(episode),
      showType: true,
    })),
  ];
  const unique = [...new Map(materials.map(item => [item.href, item])).values()];
  unique.sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))
    || a.href.localeCompare(b.href));
  grid.replaceChildren(...unique.map((item, index) => window.ZI_COMPONENTS[(index + 1) % 5 === 0 ? "createWideMaterialCard" : "createMaterialCard"](item)));
}
