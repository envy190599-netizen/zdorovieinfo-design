export function archiveYears(records) {
  return [...new Set(records.map(item => item.date.slice(0, 4)))].sort().reverse();
}

export function normalizeArchiveFilters(params, records) {
  const program = params.get('program');
  const year = params.get('year');
  return {
    program: ['health', 'live-healthy'].includes(program) ? program : 'all',
    year: archiveYears(records).includes(year) ? year : 'all',
    order: params.get('order') === 'oldest' ? 'oldest' : 'newest',
    q: (params.get('q') || '').trim().replace(/\s+/g, ' ').slice(0, 160),
  };
}

export function selectArchive(records, {program = 'all', year = 'all', order = 'newest', q = ''} = {}) {
  const normalize = text => String(text || '').toLocaleLowerCase('ru').replace(/ё/g, 'е');
  const terms = normalize(q).trim().split(/\s+/).filter(Boolean);
  const matchesQuery = item => {
    const haystack = normalize([item.title, item.sourceTitle,
      ...(item.topics || []).flatMap(topic => [topic.keyword, topic.text]),
      ...(item.participants || []).flatMap(person => [person.name, person.role, ...(person.aliases || [])])
    ].join(' '));
    return terms.every(term => haystack.includes(term));
  };
  return records.filter(item => (program === 'all' || item.program === program)
    && (year === 'all' || item.date.startsWith(year + '-')) && matchesQuery(item))
    .sort((a, b) => (order === 'oldest' ? 1 : -1) * a.date.localeCompare(b.date) || a.id - b.id);
}
