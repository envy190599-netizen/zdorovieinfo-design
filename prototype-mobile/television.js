import { tvCardData, tvTitle } from './television-model.js?v=20260921-component-names';
import { TV_ARCHIVE } from './television-data.js?v=20260921-component-names';
import { archiveYears, normalizeArchiveFilters, selectArchive } from './television-filters.js?v=20260921-component-names';

const form = document.querySelector('.tv-filters');
const grid = document.querySelector('[data-tv-grid]');
const count = document.querySelector('[data-tv-count]');
const empty = document.querySelector('[data-tv-empty]');
const yearSelect = form.elements.year;
const queryInput = form.elements.q;
const clearQuery = form.querySelector('[data-tv-clear]');
let searchTimer;
for (const year of archiveYears(TV_ARCHIVE)) yearSelect.add(new Option(year, year));
let filters = normalizeArchiveFilters(new URLSearchParams(location.search), TV_ARCHIVE);
let matching = [];
function syncView() {
  const view = new URLSearchParams(location.search).get('view') === 'list' ? 'list' : 'grid';
  form.elements.view.value = view;
  grid.dataset.view = view;
  grid.querySelectorAll(".material-card").forEach(card => {
    card.classList.toggle("tv-list-card", view === "list");
    card.classList.toggle("tv-tile-card", view === "grid");
  });
}

function syncControls(updateQuery = true) {
  syncView();
  form.elements.program.value = filters.program;
  yearSelect.value = filters.year;
  form.elements.order.value = filters.order;
  if (updateQuery) queryInput.value = filters.q;
  clearQuery.hidden = !filters.q;
}
function makeCard(item) {
  const card = window.ZI_COMPONENTS.createMaterialCard(tvCardData(item));
  card.classList.add(grid.dataset.view === "list" ? "tv-list-card" : "tv-tile-card");
  card.dataset.program = item.program;
  card.dataset.date = item.date;
  card.setAttribute('aria-label', tvTitle(item));
  return card;
}
function updateStatus() {
  count.textContent = `Найдено: ${matching.length}`;
  empty.hidden = matching.length > 0;
}
function render() {
  matching = selectArchive(TV_ARCHIVE, filters);
  grid.replaceChildren(...matching.map(makeCard));
  updateStatus();
}
function setFilters(next, replace = false) {
  clearTimeout(searchTimer);
  filters = next;
  const url = new URL(location.href);
  for (const key of ['program', 'year', 'order', 'q']) {
    const value = filters[key];
    if (!value || (key !== 'q' && (value === 'all' || value === 'newest'))) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  if (url.href !== location.href) history[replace ? 'replaceState' : 'pushState'](null, '', url);
  syncControls(!replace);
  render();
}
const readFilters = () => normalizeArchiveFilters(new URLSearchParams(new FormData(form)), TV_ARCHIVE);
form.addEventListener('submit', event => { event.preventDefault(); setFilters(readFilters()); });
form.addEventListener('change', event => {
  if (event.target.name === 'view') {
    const url = new URL(location.href);
    if (event.target.value === 'list') url.searchParams.set('view', 'list');
    else url.searchParams.delete('view');
    if (url.href !== location.href) history.pushState(null, '', url);
    syncView();
    return;
  }
  if (event.target !== queryInput) setFilters(readFilters());
});
queryInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  clearQuery.hidden = !queryInput.value;
  // Keep the typed value and caret intact while filtering; avoid a history entry per letter.
  searchTimer = setTimeout(() => setFilters(readFilters(), true), 200);
});
clearQuery.addEventListener('click', () => {
  queryInput.value = '';
  setFilters(readFilters());
  queryInput.focus({preventScroll:true});
});
document.querySelector('[data-tv-reset]').addEventListener('click', () => {
  setFilters({program:'all', year:'all', order:'newest', q:''});
  form.querySelector('input:checked').focus({preventScroll:true});
});
window.addEventListener('popstate', () => {
  clearTimeout(searchTimer);
  filters = normalizeArchiveFilters(new URLSearchParams(location.search), TV_ARCHIVE);
  syncControls();
  render();
});
syncControls();
render();
