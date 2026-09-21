const names = {health: 'Здоровье', 'live-healthy': 'Жить здорово!'};
const dateFormat = new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'long', year: 'numeric'});
export function tvTitle(item) {
  const date = dateFormat.format(new Date(item.date + 'T12:00:00')).replace(' г.', '');
  const story = /^Выпуск от\s/i.test(item.title || '') ? '' : (item.title || '');
  const topic = story ? `. ${story}` : '';
  return `${names[item.program]} — ${date}${topic}`;
}
export function findEpisode(id, archive) {
  return archive.find(item => String(item.id) === id) || null;
}
export function tvCardData(item) {
  return {...item, image: item.detailImage || item.image,
    displayTitle: tvTitle(item),
    href: `./television-episode.html?id=${item.id}`, showType: false, showMeta: false};
}
