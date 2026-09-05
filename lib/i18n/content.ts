export const translatedCollections = ['tractors','brands','articles','articleCategories','videos','equipment','dealers','expertReviews','banners','heroSlides','partners','homepageSections'];
export function contentDictionary(rows: Record<string, unknown>[]) {
  const result: Record<string,string> = {};
  for (const row of rows) for (const [key, value] of Object.entries(row)) {
    if (!key.endsWith('Te') || !value) continue;
    const base = key.slice(0,-2);
    const rawOriginal = row[base] ?? (base === 'content' ? row.body : base === 'title' ? row.name : undefined);
    const original = Array.isArray(rawOriginal) ? rawOriginal.join('\n') : rawOriginal;
    if (typeof original === 'string' && typeof value === 'string' && value.trim()) {
      result[original.trim().replace(/\s+/g,' ')] = value.trim();
      // Reading pages render paragraphs separately.
      const en = original.split(/\n+/).filter(Boolean), te = value.split(/\n+/).filter(Boolean);
      if (en.length === te.length) en.forEach((paragraph,index) => { result[paragraph.trim().replace(/\s+/g,' ')] = te[index].trim(); });
    }
  }
  return result;
}
