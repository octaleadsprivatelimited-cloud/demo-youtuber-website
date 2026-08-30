export function comparisonSelection(values: string[]): string[] {
  const seen = new Set<string>();
  return Array.from({ length: 3 }, (_, index) => {
    const value = (values[index] ?? '').trim();
    if (!value || seen.has(value) || value.length > 200) return '';
    seen.add(value); return value;
  });
}
export function chooseComparisonTractor(current: string[], index: number, value: string) {
  if (index < 0 || index > 2 || value && current.some((id, slot) => slot !== index && id === value)) return current;
  return comparisonSelection(Array.from({ length: 3 }, (_, slot) => slot === index ? value : current[slot] ?? ''));
}
export function comparisonUrl(values: string[]) {
  const slots = comparisonSelection(values);
  while (slots.length && !slots.at(-1)) slots.pop();
  const params = new URLSearchParams(); slots.forEach(id => params.append('tractor', id));
  return '/compare' + (slots.length ? '?' + params.toString() : '');
}
