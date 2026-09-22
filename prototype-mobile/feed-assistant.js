import { normalizeProfile, selectFeed } from './feed-preferences.js?v=20260921-component-names';

const mascot = document.querySelector('.site-mascot');
const feedRoot = document.querySelector('[data-personal-feed]');
const gatedMascot = mascot?.classList.contains('site-mascot--scroll-gated');
// Demo mode: answers last only for this visit. A one-use handoff carries
// a completed questionnaire to its results page without asking twice.
const HANDOFF_KEY = 'zi-feed-handoff-v1';
let profile = null;
if (feedRoot) {
  try {
    const handoff = JSON.parse(sessionStorage.getItem(HANDOFF_KEY));
    sessionStorage.removeItem(HANDOFF_KEY);
    if (handoff && Date.now() - handoff.createdAt >= 0 && Date.now() - handoff.createdAt < 60000) {
      profile = normalizeProfile(handoff.profile);
    }
  } catch { /* Without a handoff, ask the questions again. */ }
}
let draft = { sex: '', age: '35' };
let returnFocus;
let autoTimer;
const blocked = () => document.documentElement.matches('.is-opening-ad-open, .is-specials-overlay-open, .is-site-menu-open');

const panel = document.createElement('section');
panel.className = 'feed-dialog';
panel.id = 'feed-dialog';
panel.hidden = true;
panel.setAttribute('role', 'dialog');
panel.setAttribute('aria-labelledby', 'feed-dialog-title');
panel.innerHTML = `
  <button class="feed-dialog__close" type="button" aria-label="Закрыть настройку ленты"><span class="close-icon" aria-hidden="true"></span></button>
  <h2 id="feed-dialog-title">Настроим вашу ленту</h2>
  <p class="feed-dialog__intro">Расскажите немного о себе, чтобы я могла подобрать интересные материалы.</p>
  <p class="feed-dialog__step" aria-live="polite"></p>
  <form class="feed-form">
    <fieldset data-feed-sex>
      <legend>Ваш пол</legend>
      <div class="feed-choices">
        <label class="feed-choice"><input type="radio" name="sex" value="female" required><span>Женский</span></label>
        <label class="feed-choice"><input type="radio" name="sex" value="male"><span>Мужской</span></label>
      </div>
    </fieldset>
    <fieldset data-feed-age hidden disabled>
      <div class="feed-age-heading">
        <label for="feed-age">Ваш возраст</label>
        <output for="feed-age" class="feed-age-value" aria-live="off">35 лет</output>
      </div>
      <div class="age-slider">
        <input id="feed-age" name="age" type="range" min="18" max="100" step="1" value="35" aria-valuetext="35 лет">
        <div class="feed-age-limits" aria-hidden="true"><span>18</span><span>100</span></div>
      </div>
    </fieldset>
    <p class="feed-form__error" role="alert" hidden></p>
    <div class="feed-dialog__actions">
      <button class="feed-back" type="button" hidden>Назад</button>
      <button class="feed-action" type="submit">Далее</button>
    </div>
  </form>`;
document.body.append(panel);

const form = panel.querySelector('form');
const sexFields = panel.querySelector('[data-feed-sex]');
const ageFields = panel.querySelector('[data-feed-age]');
const ageInput = panel.querySelector('[name=age]');
const ageOutput = panel.querySelector('.feed-age-value');
const agePlural = new Intl.PluralRules('ru');
function updateAgeDisplay() {
  const age = Number(ageInput.value);
  const unit = { one: 'год', few: 'года', many: 'лет', other: 'лет' }[agePlural.select(age)];
  const label = `${age} ${unit}`;
  ageOutput.value = label;
  ageInput.setAttribute('aria-valuetext', label);
  ageInput.style.setProperty('--age-progress', `${(age - 18) / 82 * 100}%`);
}
ageInput.addEventListener('input', updateAgeDisplay);
const next = panel.querySelector('[type=submit]');
const back = panel.querySelector('.feed-back');
const error = panel.querySelector('[role=alert]');
let step = 'sex';

const trigger = document.createElement('button');
trigger.className = 'feed-launcher';
trigger.type = 'button';
trigger.setAttribute('aria-label', 'Настроить мою ленту');
trigger.setAttribute('aria-controls', panel.id);
trigger.setAttribute('aria-expanded', 'false');
trigger.innerHTML = '<span>Моя лента</span>';
const speech = document.createElement('div');
speech.className = 'feed-invitation';
speech.hidden = true;
speech.setAttribute('role', 'group');
speech.setAttribute('aria-labelledby', 'mascot-speech-title');
speech.innerHTML = '<div class="feed-invitation__header"><h2 id="mascot-speech-title">Умная лента</h2><button class="feed-invitation__close" type="button" aria-label="Закрыть предложение подбора"><span class="close-icon" aria-hidden="true"></span></button></div><p class="feed-invitation__subtitle">Давайте подберем интересные материалы для Вас?</p><button class="feed-action feed-invitation__action" type="button" aria-controls="feed-dialog">Подобрать</button>';
const pickButton = speech.querySelector('.feed-invitation__action');
if (mascot) {
  mascot.append(speech);
  if (!gatedMascot) mascot.removeAttribute('aria-hidden');
  mascot.querySelector('picture')?.setAttribute('aria-hidden', 'true');
  mascot.append(trigger);
}

function setStep(value, focus = false) {
  step = value;
  error.hidden = true;
  sexFields.hidden = sexFields.disabled = step !== 'sex';
  ageFields.hidden = ageFields.disabled = step !== 'age';
  back.hidden = step !== 'age';
  next.textContent = step === 'age' ? 'Моя лента' : 'Далее';
  panel.querySelector('.feed-dialog__step').textContent = `Вопрос ${step === 'sex' ? '1' : '2'} из 2`;
  for (const input of sexFields.querySelectorAll('input')) input.checked = input.value === draft.sex;
  ageInput.value = draft.age;
  updateAgeDisplay();
  if (focus) (step === 'age' ? ageInput : sexFields.querySelector('input:checked, input')).focus();
}

function markSeen() {
  prompted = true;
}

function openPanel() {
  if (blocked() || (gatedMascot && mascot.inert)) return;
  returnFocus = speech.contains(document.activeElement) ? trigger : document.activeElement;
  cancelPrompt();
  draft = { sex: '', age: '35' };
  panel.hidden = false;
  trigger.setAttribute('aria-expanded', 'true');
  setStep('sex', true);
  markSeen();
}

function closePanel() {
  panel.hidden = true;
  trigger.setAttribute('aria-expanded', 'false');
  markSeen();
  if (returnFocus?.isConnected && !returnFocus.closest('[inert]') && !blocked()) returnFocus.focus();
}

function dismissSpeech() {
  const hadFocus = speech.contains(document.activeElement);
  cancelPrompt();
  markSeen();
  if (hadFocus && !mascot?.inert && !blocked()) trigger.focus();
}
speech.querySelector('.feed-invitation__close').addEventListener('click', dismissSpeech);
pickButton.addEventListener('click', openPanel);
trigger.addEventListener('click', () => {
  if (!panel.hidden) { closePanel(); return; }
  introduceFeed();
  if (!speech.hidden) pickButton.focus();
});
panel.querySelector('.feed-dialog__close').addEventListener('click', closePanel);
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (!panel.hidden) { event.preventDefault(); closePanel(); }
  else if (!speech.hidden) { event.preventDefault(); dismissSpeech(); }
});
back.addEventListener('click', () => { draft.age = ageInput.value; setStep('sex', true); });
form.addEventListener('submit', event => {
  event.preventDefault();
  if (step === 'sex') {
    draft.sex = sexFields.querySelector('input:checked')?.value || '';
    if (draft.sex) setStep('age', true);
    return;
  }
  draft.age = ageInput.value;
  const result = normalizeProfile(draft);
  if (!result) { ageInput.focus(); return; }
  try {
    if (!feedRoot) sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({ profile: result, createdAt: Date.now() }));
  }
  catch {
    error.textContent = 'Не удалось сохранить ответы. Разрешите хранение данных сайта в браузере и попробуйте ещё раз.';
    error.hidden = false;
    return;
  }
  profile = result;
  closePanel();
  if (feedRoot) {
    renderFeed();
    document.querySelector('#personal-feed-title')?.focus();
  } else window.location.assign('./my-feed.html');
});

function renderFeed() {
  if (!feedRoot) return;
  const description = document.querySelector('[data-feed-description]');
  description.textContent = profile
    ? 'Материалы по вашим ответам — о здоровье, привычках и качестве жизни. Настройте подборку, если ваши интересы изменились.'
    : 'Два коротких вопроса — и здесь появятся материалы для вас.';
  const formatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  const cards = selectFeed(window.ZI_ARTICLES || [], profile).map((article, index) => window.ZI_COMPONENTS[(index + 1) % 5 === 0 ? "createWideMaterialCard" : "createMaterialCard"]({
    ...article,
    type: 'Статья',
    href: `./article.html?slug=${encodeURIComponent(article.slug)}`,
    meta: `${article.categoryLabel} · ${formatter.format(new Date(`${article.date}T12:00:00`)).replace(' г.', '')}`,
  }));
  feedRoot.replaceChildren(...cards);
}

document.querySelector('#personal-feed-title')?.setAttribute('tabindex', '-1');
renderFeed();

let prompted = false;
let promptFrame = 0;
function cancelPrompt() {
  clearTimeout(autoTimer);
  autoTimer = undefined;
  speech.hidden = true;
  mascot?.classList.remove('is-speaking');
}
function introduceFeed() {
  if (blocked() || (gatedMascot && mascot.inert)) { cancelPrompt(); return; }
  if (!mascot) return;
  speech.hidden = false;
  mascot.classList.add('is-speaking');
}
function schedulePrompt() {
  const weekly = document.querySelector('#week, .week-digest');
  const headerBottom = Math.max(0, document.querySelector('.header')?.getBoundingClientRect().bottom || 0);
  const homeFeed = document.querySelector('[data-home-material-sections]');
  const fourthCard = homeFeed?.querySelectorAll('[data-mixed-material-grid] > .material-card')[3];
  // On the homepage, let readers pass four full material cards before prompting.
  const reachedPrompt = Boolean(window.scrollY && (homeFeed
    ? fourthCard && fourthCard.getBoundingClientRect().bottom <= headerBottom
    : weekly && weekly.getBoundingClientRect().top <= headerBottom + 40));
  if (gatedMascot) {
    const heroVisible = document.querySelector('.hero').getBoundingClientRect().bottom > headerBottom + 40;
    // Once revealed, keep the mascot until the reader returns to the hero.
    const visible = !heroVisible && (reachedPrompt || mascot.classList.contains('is-scroll-visible'));
    mascot.classList.toggle('is-scroll-visible', visible);
    mascot.inert = !visible;
    if (visible) mascot.removeAttribute('aria-hidden');
    else mascot.setAttribute('aria-hidden', 'true');
    if (!visible) {
      cancelPrompt();
      if (!panel.hidden) closePanel();
      return;
    }
  }
  if (blocked()) {
    cancelPrompt();
    if (!panel.hidden) closePanel();
    return;
  }
  if (prompted || profile || (!feedRoot && !mascot)) return;
  if (!feedRoot && !reachedPrompt) { cancelPrompt(); return; }
  // Scroll events must not restart the delay while the user keeps moving down.
  if (autoTimer !== undefined || !speech.hidden) return;
  autoTimer = setTimeout(() => {
    autoTimer = undefined;
    if (panel.hidden) introduceFeed();
  }, feedRoot ? 0 : gatedMascot ? 650 : 0);
}
function requestPromptCheck() {
  if (promptFrame) return;
  promptFrame = requestAnimationFrame(() => { promptFrame = 0; schedulePrompt(); });
}
window.addEventListener('scroll', requestPromptCheck, { passive: true });
window.addEventListener('resize', requestPromptCheck, { passive: true });
window.addEventListener('pageshow', requestPromptCheck);
new MutationObserver(requestPromptCheck).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
schedulePrompt();
