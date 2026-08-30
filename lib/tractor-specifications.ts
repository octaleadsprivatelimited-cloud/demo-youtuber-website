import { tractorSpecFields, tractorSpecGroups, type TractorSpecField } from '@/config/tractor-specifications';
import type { Tractor } from '@/types/content';
export const missingSpecification = 'Not provided';
export function specificationLabel(field: TractorSpecField) { return field.label + (field.unit ? ' (' + field.unit + ')' : ''); }
export function parseSpecification(field: TractorSpecField, input: unknown): string | number | string[] {
  if (input === undefined || input === null || input === '') return field.type === 'lines' ? [] : '';
  if (field.type === 'lines') {
    const lines = Array.isArray(input) ? input : String(input).split(/\r?\n/);
    if (lines.some(value => typeof value !== 'string')) throw new Error(field.label + ' must contain text lines.');
    const result = [...new Set(lines.map(value => String(value).trim()).filter(Boolean))];
    if (result.length > 40 || result.some(value => value.length > 300)) throw new Error(field.label + ': use up to 40 lines of 300 characters.');
    return result;
  }
  const value = String(input).trim();
  if (!value) return '';
  if (field.type === 'number') {
    if (!/^\d+(?:\.\d+)?$/.test(value) || !Number.isFinite(Number(value))) throw new Error(specificationLabel(field) + ': enter a number without units or commas.');
    const number = Number(value);
    if (number < (field.min ?? 0) || field.integer && !Number.isInteger(number)) throw new Error(field.label + ': enter ' + (field.integer ? 'a whole number' : 'a number') + ((field.min ?? 0) > 0 ? ' greater than zero.' : ' of zero or more.'));
    return number;
  }
  if (field.options && !field.options.some(option => option.value === value)) throw new Error('Choose a valid ' + field.label.toLowerCase() + '.');
  if (value.length > (field.type === 'textarea' ? 4000 : 600)) throw new Error(field.label + ' is too long.');
  if (field.key === 'specificationSourceUrl') {
    try { const url = new URL(value); if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error(); }
    catch { throw new Error('Use an http:// or https:// manufacturer specification URL.'); }
  }
  return value;
}
export function prepareTractorSpecifications(input: Record<string, unknown>) {
  const result: Record<string, unknown> = {};
  for (const field of tractorSpecFields) {
    const key = field.key in input ? field.key : field.readKey && field.readKey in input ? field.readKey : undefined;
    if (key) result[field.key] = parseSpecification(field, key === 'hp' && input[key] === 0 ? '' : input[key]);
  }
  return result;
}
export function readSpecification(record: Record<string, unknown> | Tractor, field: TractorSpecField): string {
  const data = record as unknown as Record<string, unknown>;
  const value = data[field.readKey ?? field.key] ?? data[field.key];
  if (value === undefined || value === null || value === '' || value === 'Not specified') return missingSpecification;
  if (field.type === 'number') {
    const number = Number(value);
    if (!Number.isFinite(number) || number < (field.min ?? 0)) return missingSpecification;
    return number.toLocaleString('en-IN', { maximumFractionDigits: 3 }) + (field.unit ? ' ' + field.unit : '');
  }
  if (field.type === 'lines') {
    const lines = (Array.isArray(value) ? value : String(value).split(/\r?\n/)).map(String).map(line => line.trim()).filter(Boolean);
    return lines.length ? lines.join('\n') : missingSpecification;
  }
  return String(value).trim() || missingSpecification;
}
export function tractorPrice(tractor: Pick<Tractor, 'minPrice' | 'maxPrice'>) {
  if (!(tractor.minPrice > 0)) return missingSpecification;
  const format = (value: number) => value >= 100000 ? '₹' + (value / 100000).toFixed(2) + ' Lakh' : '₹' + value.toLocaleString('en-IN');
  return tractor.maxPrice > tractor.minPrice ? format(tractor.minPrice) + ' – ' + format(tractor.maxPrice) : format(tractor.minPrice);
}
export type SpecificationRow = { key: string; label: string; values: string[]; different: boolean; list?: boolean };
function row(key: string, label: string, values: string[], list = false): SpecificationRow {
  const normalize = (value: string) => (list ? value.split('\n').sort().join('\n') : value).trim().toLowerCase().replace(/\s+/g, ' ');
  return { key, label, values, list, different: values.length > 1 && values.every(value => value !== missingSpecification) && new Set(values.map(normalize)).size > 1 };
}
export function comparisonGroups(tractors: Tractor[], onlyDifferences = false) {
  const overview = { key: 'overview', title: 'Model & price', rows: [
    row('brand', 'Brand', tractors.map(item => item.brandName)), row('variant', 'Variant / trim', tractors.map(item => item.variant || missingSpecification)),
    row('condition', 'Condition', tractors.map(item => item.condition === 'used' ? 'Used' : 'New')),
    row('price', 'Estimated price', tractors.map(tractorPrice)),
  ] };
  const groups = tractorSpecGroups.map(group => ({ key: group.key, title: group.title, rows: group.fields.filter(field => field.key !== 'specificationSourceUrl').map(field => row(field.key, field.label, tractors.map(item => readSpecification(item, field)), field.type === 'lines')) }));
  return [overview, ...groups].map(group => ({ ...group, rows: group.rows.filter(item => !onlyDifferences || item.different) })).filter(group => group.rows.length);
}
export function tractorSpecifications(tractor: Tractor) {
  return tractorSpecGroups.map(group => ({ key: group.key, title: group.title, rows: group.fields.filter(field => field.key !== 'specificationSourceUrl').map(field => ({ key: field.key, label: field.label, value: readSpecification(tractor, field), list: field.type === 'lines' })) }));
}
export function specificationSource(tractor: Tractor) {
  const value = tractor.specificationSourceUrl;
  return typeof value === 'string' && /^https?:\/\//i.test(value) ? value : '';
}
