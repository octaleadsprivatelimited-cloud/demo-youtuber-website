import { tractorSpecFields } from '@/config/tractor-specifications';
import { parseSpecification, specificationLabel } from './tractor-specifications';

function csvRows(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let value = ''; let quoted = false; let closed = false;
  const input = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  for (let index = 0; index <= input.length; index++) {
    const char = input[index];
    if (quoted) {
      if (char === undefined) throw new Error('CSV contains an unclosed quoted value.');
      if (char === '"') { if (input[index + 1] === '"') { value += '"'; index++; } else { quoted = false; closed = true; } }
      else value += char;
    } else if (char === ',' || char === '\n' || char === undefined) {
      row.push(value); value = ''; closed = false;
      if (char !== ',') { if (row.some(cell => cell.trim())) rows.push(row); row = []; }
    } else if (char === '"') {
      if (value || closed) throw new Error('CSV quotes must surround the entire value.');
      quoted = true;
    } else { if (closed && char.trim()) throw new Error('Unexpected text after a quoted CSV value.'); if (!closed) value += char; }
  }
  return rows;
}
export function parseTractorSpecificationCsv(text: string) {
  if (new TextEncoder().encode(text).length > 65536) throw new Error('Use a specification CSV smaller than 64 KB.');
  const rows = csvRows(text);
  if (rows.length < 2 || rows[0].length !== 2 || rows[0][0].trim().toLowerCase() !== 'field' || rows[0][1].trim().toLowerCase() !== 'value') throw new Error('Use the template with two columns: field,value.');
  if (rows.length > 101) throw new Error('Use no more than 100 specification rows.');
  const values: Record<string, unknown> = {}; const seen = new Set<string>(); let skipped = 0;
  for (const [index, cells] of rows.slice(1).entries()) {
    if (cells.length !== 2) throw new Error('Row ' + (index + 2) + ': expected field and value. Quote values containing commas.');
    const name = cells[0].trim().toLowerCase();
    const field = tractorSpecFields.find(field => [field.key, field.readKey, field.label, specificationLabel(field)].some(label => label?.toLowerCase() === name));
    if (!field) throw new Error('Row ' + (index + 2) + ': unknown specification “' + cells[0].slice(0, 60) + '”. Use the template fields.');
    if (seen.has(field.key)) throw new Error('The CSV repeats ' + field.label + '.');
    seen.add(field.key);
    if (!cells[1].trim()) { skipped++; continue; }
    values[field.key] = parseSpecification(field, cells[1]);
  }
  if (!Object.keys(values).length) throw new Error('The CSV has no filled specification values. Fill the value column first.');
  return { values, skipped };
}
const quote = (value: string) => '"' + value.replaceAll('"', '""') + '"';
export function tractorSpecificationTemplate() {
  return '\uFEFFfield,value\r\n' + tractorSpecFields.map(field => quote(specificationLabel(field)) + ',""').join('\r\n') + '\r\n';
}
