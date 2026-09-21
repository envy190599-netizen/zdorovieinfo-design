import { TV_ARCHIVE } from './television-data.js?v=20260921-component-names';
import { findEpisode, tvTitle } from './television-model.js?v=20260921-component-names';
const root = document.querySelector('[data-tv-episode-root]');
const item = findEpisode(new URLSearchParams(location.search).get('id'), TV_ARCHIVE);
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}
const article = element('article', 'article-layout material-reader-card');
const main = element('div', 'article-main');
const header = element('header', 'article-heading');
const title = element('h1', 'article-title', item ? tvTitle(item) : 'Выпуск не найден');
title.id = 'tv-episode-title';
article.setAttribute('aria-labelledby', title.id);
header.append(title); main.append(header); article.append(main); root.append(article);
document.title = `${title.textContent} — Здоровье Инфо`;
if (item) {
  const media = element('div', 'video-player');
  const poster = element('img', 'video-player__poster');
  poster.src = item.detailImage;
  poster.alt = '';
  const notice = element('p', 'video-player__notice',
    item.playerStatus === 'permitted' ? 'Загружаем видео…' :
      'Этот выпуск пока недоступен для просмотра на сайте.');
  notice.setAttribute('role', 'status');
  media.append(poster, notice);
  main.append(media);
  if (item.playerStatus === 'permitted') {
    const player = element('iframe', 'tv-episode-player');
    player.title = `Видеоплеер: ${tvTitle(item)}`;
    player.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
    player.allowFullscreen = true;
    player.referrerPolicy = 'strict-origin-when-cross-origin';
    const timeout = window.setTimeout(() => {
      notice.textContent = 'Не удалось загрузить видео. Попробуйте обновить страницу.';
    }, 15000);
    player.addEventListener('load', () => {
      window.clearTimeout(timeout);
      media.classList.add('is-loaded');
      notice.hidden = true;
    }, { once: true });
    player.src = item.playerUrl;
    media.append(player);
  }
  const body = element('div', 'article-body article-prose episode-topics');
  body.append(element('h2', '', item.type === 'Сюжет' ? 'О сюжете' : 'В этом выпуске'));
  for (const topic of item.topics) {
    const keyword = topic.keyword + (/[.!?]$/.test(topic.keyword) ? '' : '.');
    body.append(element('p', '', keyword + (topic.text ? ' ' + topic.text : '')));
  }
  for (const [kind, label] of [['guest', 'Гости и эксперты'], ['host', 'Ведущие']]) {
    const people = (item.participants || []).filter(person => person.kind === kind);
    if (!people.length) continue;
    const section = element('section', 'episode-participants');
    section.append(element('h2', '', label));
    const list = element('ul', 'episode-participants__list');
    for (const person of people) {
      const entry = element('li');
      const link = element('a', 'tv-episode-person', person.name);
      link.href = `./television.html?q=${encodeURIComponent(person.name)}`;
      link.setAttribute('aria-label', `Выпуски с участием: ${person.name}`);
      entry.append(link);
      if (kind === 'guest') entry.append(element('span', 'tv-episode-person__role', person.role));
      list.append(entry);
    }
    section.append(list); body.append(section);
  }
  main.append(body);
} else {
  main.append(element('p', '', 'Выбери программу в архиве телевидения.'));
  const back = element('a', '', 'Все телепрограммы');
  back.href = './television.html'; main.append(back);
}
