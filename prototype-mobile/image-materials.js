/* Editorial artwork is supplied as images, never recreated as HTML scenes. */
(() => {
  const root = document.querySelector('[data-image-material]');
  if (!root) return;
  const message = (text) => {
    const p = document.createElement('p');
    p.className = 'image-material__status';
    p.setAttribute('role', 'status');
    p.textContent = text;
    root.replaceChildren(p);
  };
  fetch('./image-materials.json').then(response => {
    if (!response.ok) throw new Error('Material data unavailable');
    return response.json();
  }).then(catalog => {
    const material = catalog[root.dataset.imageMaterial];
    if (!material?.images?.length) {
      message('Изображения для этого материала ещё не добавлены.');
      return;
    }
    const isSlider = material.format === 'slideshow';
    root.classList.toggle('image-material--slider', isSlider);
    const stage = document.createElement('div');
    stage.className = 'image-material__stage';
    const images = material.images.map((item, index) => {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt || `${material.title} — ${index + 1}`;
      img.decoding = 'async';
      img.hidden = isSlider && index !== 0;
      img.addEventListener('error', () => message('Изображение не удалось загрузить. Попробуй обновить страницу.'));
      stage.append(img);
      return img;
    });
    root.replaceChildren(stage);
    if (!isSlider || images.length < 2) return;
    root.setAttribute('aria-roledescription', 'слайдшоу');
    const nav = document.createElement('nav');
    nav.className = 'image-material__nav';
    nav.setAttribute('aria-label', 'Переключение слайдов');
    const dots = document.createElement('div');
    dots.className = 'image-material__dots';
    const status = document.createElement('p');
    status.className = 'image-material__count';
    status.setAttribute('aria-live', 'polite');
    let active = 0;
    const select = index => {
      active = (index + images.length) % images.length;
      images.forEach((img, i) => { img.hidden = i !== active; });
      [...dots.children].forEach((button, i) => button.setAttribute('aria-current', String(i === active)));
      status.textContent = `Слайд ${active + 1} из ${images.length}`;
    };
    const arrow = (name, direction) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'image-material__arrow';
      button.setAttribute('aria-label', name);
      const icon = document.createElement('img');
      icon.src = './assets/figma/material-arrow-right.svg';
      icon.alt = '';
      if (direction < 0) icon.style.transform = 'rotate(180deg)';
      button.append(icon);
      button.addEventListener('click', () => select(active + direction));
      return button;
    };
    images.forEach((_, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `Слайд ${i + 1}`);
      button.addEventListener('click', () => select(i));
      dots.append(button);
    });
    nav.append(arrow('Предыдущий слайд', -1), dots, arrow('Следующий слайд', 1));
    root.append(nav, status);
    root.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      select(active + (event.key === 'ArrowLeft' ? -1 : 1));
    });
    select(0);
  }).catch(() => message('Материал не удалось загрузить. Попробуй обновить страницу.'));
})();
