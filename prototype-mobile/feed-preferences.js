// Editorial ordering for the prototype, not clinical or diagnostic advice.
export const PROFILE_KEY = 'zi-feed-profile-v1';

export function normalizeProfile(value) {
  if (!value || !['female', 'male', 'unspecified'].includes(value.sex)) return null;
  const age = Number(value.age);
  if (!Number.isInteger(age) || age < 1 || age > 120) return null;
  return { sex: value.sex, age };
}

export function selectFeed(articles, profile, limit = 20) {
  if (!normalizeProfile(profile)) return [];
  const priorities = { food: 3, lifestyle: 3, myths: 2, science: 1 };
  if (profile.age < 18) priorities['mother-child'] = 6;
  else if (profile.age < 40) priorities['sport-fitness'] = 6;
  else {
    priorities['symptoms-treatment'] = 6;
    priorities['sport-fitness'] = 4;
  }
  if (profile.sex === 'female' && profile.age >= 18) priorities['women-health'] = 7;
  const score = (article) => {
    const copy = article.title.toLocaleLowerCase('ru');
    const maleTopic = profile.sex === 'male' && article.category !== 'women-health'
      && /простат|мужское здоровье|здоровье мужчин/.test(copy) ? 7 : 0;
    const ageTopic = profile.age >= 50 && /памят|сустав|давлен|после 50/.test(copy) ? 2 : 0;
    return (priorities[article.category] || 0) + maleTopic + ageTopic;
  };
  const ranked = [...articles].sort((a, b) => score(b) - score(a)
    || String(b.date).localeCompare(String(a.date)) || a.slug.localeCompare(b.slug));
  const counts = new Map();
  const seen = new Set();
  return ranked.filter(article => {
    if (seen.has(article.slug) || (counts.get(article.category) || 0) >= 4) return false;
    seen.add(article.slug);
    counts.set(article.category, (counts.get(article.category) || 0) + 1);
    return true;
  }).slice(0, limit);
}
