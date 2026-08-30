import type { Tractor } from '@/types/content';
import { tractorSpecifications, specificationSource, missingSpecification } from '@/lib/tractor-specifications';
import { tractorSpecFields } from '@/config/tractor-specifications';
import '@/app/tractor-specifications.css';
export function SpecificationValue({ value, list }: { value: string; list?: boolean }) {
  if (value === missingSpecification) return <span className="spec-unavailable">{value}</span>;
  return list ? <ul className="spec-value-list">{value.split('\n').map((line, index) => <li key={index}>{line}</li>)}</ul> : <span className="spec-value">{value}</span>;
}
export function TractorSpecifications({ tractor }: { tractor: Tractor }) {
  const groups = tractorSpecifications(tractor);
  const known = new Set(tractorSpecFields.flatMap(field => [field.key, field.readKey ?? field.key, field.label]).map(key => key.toLowerCase()));
  const extra = Object.entries(tractor.specifications ?? {}).filter(([label, value]) => !known.has(label.toLowerCase()) && value !== '');
  const source = specificationSource(tractor);
  return <div className="tractor-specifications"><p className="spec-guidance">Specifications are for the listed variant. Optional equipment and manufacturer updates may change the figures.</p>{groups.map(group => <details key={group.key} open><summary>{group.title}</summary><table><tbody>{group.rows.map(row => <tr key={row.key}><th scope="row">{row.label}</th><td><SpecificationValue value={row.value} list={row.list} /></td></tr>)}</tbody></table></details>)}{extra.length > 0 && <details open><summary>Additional published specifications</summary><table><tbody>{extra.map(([label, value]) => <tr key={label}><th scope="row">{label}</th><td>{String(value)}</td></tr>)}</tbody></table></details>}{source && <a className="spec-source-link" href={source} target="_blank" rel="noreferrer">View manufacturer specification source ↗</a>}</div>;
}
