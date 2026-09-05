
import { LocalizedElement } from '@/components/LocalizedElement';
import type { Tractor } from '@/types/content';
import { tractorSpecifications, specificationSource, missingSpecification } from '@/lib/tractor-specifications';
import { tractorSpecFields } from '@/config/tractor-specifications';
import '@/app/tractor-specifications.css';
export function SpecificationValue({ value, list }: { value: string; list?: boolean }) {
  if (value === missingSpecification) return <LocalizedElement as="span" className="spec-unavailable">{value}</LocalizedElement>;
  return list ? <ul className="spec-value-list">{value.split('\n').map((line, index) => <LocalizedElement as="li" key={index}>{line}</LocalizedElement>)}</ul> : <LocalizedElement as="span" className="spec-value">{value}</LocalizedElement>;
}
export function TractorSpecifications({ tractor }: { tractor: Tractor }) {
  const groups = tractorSpecifications(tractor);
  const known = new Set(tractorSpecFields.flatMap(field => [field.key, field.readKey ?? field.key, field.label]).map(key => key.toLowerCase()));
  const extra = Object.entries(tractor.specifications ?? {}).filter(([label, value]) => !known.has(label.toLowerCase()) && value !== '');
  const source = specificationSource(tractor);
  return <LocalizedElement as="div" className="tractor-specifications"><LocalizedElement as="p" className="spec-guidance">Specifications are for the listed variant. Optional equipment and manufacturer updates may change the figures.</LocalizedElement>{groups.map(group => <details key={group.key} open><LocalizedElement as="summary">{group.title}</LocalizedElement><table><tbody>{group.rows.map(row => <tr key={row.key}><LocalizedElement as="th" scope="row">{row.label}</LocalizedElement><LocalizedElement as="td"><SpecificationValue value={row.value} list={row.list} /></LocalizedElement></tr>)}</tbody></table></details>)}{extra.length > 0 && <details open><LocalizedElement as="summary">Additional published specifications</LocalizedElement><table><tbody>{extra.map(([label, value]) => <tr key={label}><LocalizedElement as="th" scope="row">{label}</LocalizedElement><LocalizedElement as="td">{String(value)}</LocalizedElement></tr>)}</tbody></table></details>}{source && <LocalizedElement as="a" className="spec-source-link" href={source} target="_blank" rel="noreferrer">View manufacturer specification source ↗</LocalizedElement>}</LocalizedElement>;
}
