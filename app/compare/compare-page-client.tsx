 'use client';
import { LocalizedElement } from '@/components/LocalizedElement';


import { Fragment, Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PublicShell } from '@/components/SiteChrome';
import { PageIntro } from '@/components/PublicPageParts';
import { SpecificationValue } from '@/components/TractorSpecifications';
import { comparisonGroups, specificationSource } from '@/lib/tractor-specifications';
import {
  comparisonSelection,
  chooseComparisonTractor,
  comparisonUrl,
} from '@/lib/tractor-comparison';
import { subscribeComparisonCatalog } from '@/services/comparison';
import type { Tractor } from '@/types/content';
import '@/app/tractor-specifications.css';

function CompareContent() {
  const params = useSearchParams();
  const router = useRouter();
  const query = params.toString();
  const [catalog, setCatalog] = useState<Tractor[]>([]);
  const [slots, setSlots] = useState(() => comparisonSelection(params.getAll('tractor')));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [filter, setFilter] = useState('');
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const [shared, setShared] = useState('');

  useEffect(() => {
    setSlots(comparisonSelection(new URLSearchParams(query).getAll('tractor')));
    setShared('');
  }, [query]);

  useEffect(() => {
    setLoading(true);
    setError('');
    return subscribeComparisonCatalog(
      (items) => {
        setCatalog(items);
        setError('');
        setLoading(false);
      },
      (reason) => {
        setError(reason.message);
        setLoading(false);
      },
    );
  }, [attempt]);

  function choose(index: number, id: string) {
    const next = chooseComparisonTractor(slots, index, id);
    setSlots(next);
    setShared('');
    router.replace(comparisonUrl(next), { scroll: false });
  }

  const tractors = slots.flatMap((id) => {
    const item = catalog.find((item) => item.id === id);
    return item ? [item] : [];
  });
  const groups = comparisonGroups(tractors, onlyDifferences);
  const tokens = filter.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const missing = slots.filter((id) => id && !catalog.some((item) => item.id === id));

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.origin + comparisonUrl(slots));
      setShared('Comparison link copied.');
    } catch {
      setShared('Copy the comparison URL from your address bar to share it.');
    }
  }

  return (
    <PublicShell>
      <main className="compare-page">
        <PageIntro
          eyebrow="SIDE-BY-SIDE RESEARCH"
          title="Compare the details. Find your fit."
          description="Choose two or three tractors and compare the specifications saved for each variant. No ratings or winner claims—just the listed information."
        />
        <section className="comparison-workspace">
          <LocalizedElement as="div" className="comparison-find">
            <LocalizedElement as="label" htmlFor="compare-model-filter">
              Find models
              <LocalizedElement as="input"
                id="compare-model-filter"
                type="search"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                placeholder="Search model or brand…"
              />
            </LocalizedElement>
            <LocalizedElement as="p">
              {loading ? 'Loading published models…' : `${catalog.length} published ${catalog.length === 1 ? 'model' : 'models'}`}
              <LocalizedElement as="span">Selections update automatically when the catalog changes.</LocalizedElement>
            </LocalizedElement>
          </LocalizedElement>
          {error && (
            <LocalizedElement as="div" className="error-state" role="alert">
              Unable to load the latest catalog. {error}
              <LocalizedElement as="button" type="button" onClick={() => setAttempt((value) => value + 1)}>Try again</LocalizedElement>
            </LocalizedElement>
          )}
          <LocalizedElement as="div" className="comparison-pickers">
            {[0, 1, 2].map((index) => {
              const selected = catalog.find((item) => item.id === slots[index]);
              const choices = catalog.filter(
                (item) =>
                  item.id === slots[index] ||
                  (!slots.includes(item.id) &&
                    tokens.every((token) =>
                      (item.name + ' ' + item.brandName + ' ' + (item.variant ?? ''))
                        .toLowerCase()
                        .includes(token),
                    )),
              );
              return (
                <LocalizedElement as="div" className="comparison-picker" key={index}>
                  <LocalizedElement as="div" className="comparison-picker-label">
                    <LocalizedElement as="label" htmlFor={`compare-tractor-${index}`}>
                      TRACTOR 0{index + 1}
                      {index === 2 ? ' · OPTIONAL' : ''}
                    </LocalizedElement>
                    {slots[index] && (
                      <LocalizedElement as="button" type="button" onClick={() => choose(index, '')} aria-label={'Remove tractor ' + (index + 1)}>×</LocalizedElement>
                    )}
                  </LocalizedElement>
                  <LocalizedElement as="select"
                    id={`compare-tractor-${index}`}
                    value={slots[index]}
                    disabled={loading || Boolean(error)}
                    onChange={(event) => choose(index, event.target.value)}
                  >
                    <LocalizedElement as="option" value="">Choose a tractor</LocalizedElement>
                    {!selected && slots[index] && <LocalizedElement as="option" value={slots[index]}>Model no longer available</LocalizedElement>}
                    {choices.map((item) => (
                      <LocalizedElement as="option" key={item.id} value={item.id}>
                        {item.name}
                        {item.variant && !item.name.includes(item.variant) ? ` · ${item.variant}` : ''}
                      </LocalizedElement>
                    ))}
                  </LocalizedElement>
                  {selected ? (
                    <LocalizedElement as="div" className="comparison-picked-model">
                      {selected.image ? <LocalizedElement as="img" src={selected.image} alt="" /> : <LocalizedElement as="span" aria-hidden="true">0{index + 1}</LocalizedElement>}
                      <LocalizedElement as="div">
                        <LocalizedElement as="strong">{selected.name}</LocalizedElement>
                        <LocalizedElement as="a" href={`/tractor/${encodeURIComponent(selected.brandSlug)}/${encodeURIComponent(selected.slug)}`}>View model ↗</LocalizedElement>
                      </LocalizedElement>
                    </LocalizedElement>
                  ) : (
                    <LocalizedElement as="p">
                      {!loading && filter && !choices.length ? 'No models match this search.' : index === 2 ? 'Add a third model to your shortlist.' : 'Choose a model to see its specifications.'}
                    </LocalizedElement>
                  )}
                </LocalizedElement>
              );
            })}
          </LocalizedElement>
          {!loading && !error && missing.length > 0 && (
            <LocalizedElement as="p" className="comparison-notice" role="status">
              A selected model was removed or is no longer published. Choose a replacement above.
            </LocalizedElement>
          )}
          {loading ? (
            <LocalizedElement as="p" role="status" className="detail-loading">Preparing comparison…</LocalizedElement>
          ) : error ? null : tractors.length < 2 ? (
            <LocalizedElement as="div" className="empty-state">
              <LocalizedElement as="h3">{catalog.length < 2 ? 'At least two published models are needed.' : 'Choose two tractors to start.'}</LocalizedElement>
              <LocalizedElement as="p">
                {catalog.length < 2
                  ? 'Models and their specifications appear here after they are saved in the tractor catalog.'
                  : 'Select a different model in each slot. Your selections are kept in the page link.'}
              </LocalizedElement>
              <LocalizedElement as="a" href="/tractors">Explore the catalog →</LocalizedElement>
            </LocalizedElement>
          ) : (
            <>
              <LocalizedElement as="div" className="comparison-toolbar">
                <LocalizedElement as="label">
                  <LocalizedElement as="input"
                    type="checkbox"
                    checked={onlyDifferences}
                    onChange={(event) => setOnlyDifferences(event.target.checked)}
                  />{' '}
                  Show only differences
                </LocalizedElement>
                <LocalizedElement as="div">
                  <LocalizedElement as="button" type="button" onClick={() => {
                    setSlots(['', '', '']);
                    router.replace('/compare', { scroll: false });
                  }}>Clear comparison</LocalizedElement>
                  <LocalizedElement as="button" type="button" onClick={() => void share()}>Copy comparison link ↗</LocalizedElement>
                </LocalizedElement>
              </LocalizedElement>
              {shared && <LocalizedElement as="p" className="comparison-notice" role="status">{shared}</LocalizedElement>}
              <LocalizedElement as="p" className="comparison-guidance">
                Highlighted cells contain different provided values. Missing information is not treated as a difference.{' '}
                <LocalizedElement as="span">On smaller screens, scroll the table sideways.</LocalizedElement>
              </LocalizedElement>
              <LocalizedElement as="div" className="comparison-table-scroll" role="region" aria-label="Tractor specification comparison" tabIndex={0}>
                <table className="tractor-comparison-table">
                  <LocalizedElement as="caption">Specifications for {tractors.map((item) => item.name).join(', ')}</LocalizedElement>
                  <thead>
                    <tr>
                      <LocalizedElement as="th" scope="col">Specification</LocalizedElement>
                      {tractors.map((item) => <LocalizedElement as="th" scope="col" key={item.id}>{item.name}<LocalizedElement as="small">{item.variant || item.brandName}</LocalizedElement></LocalizedElement>)}
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((group) => (
                      <Fragment key={group.key}>
                        <tr className="comparison-group-heading">
                          <LocalizedElement as="th" colSpan={tractors.length + 1} scope="rowgroup">
                            {group.title}
                          </LocalizedElement>
                        </tr>
                        {group.rows.map((row) => (
                          <tr key={row.key}>
                            <LocalizedElement as="th" scope="row">{row.label}</LocalizedElement>
                            {row.values.map((value, index) => (
                              <LocalizedElement as="td" key={tractors[index].id} className={row.different ? 'spec-different' : undefined}>
                                <SpecificationValue value={value} list={row.list} />
                              </LocalizedElement>
                            ))}
                          </tr>
                        ))}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </LocalizedElement>
              {!groups.length && (
                <LocalizedElement as="p" className="comparison-notice">
                  No differences were found in the provided specifications. Some values may be missing. Turn off the filter to see all fields.
                </LocalizedElement>
              )}
              <LocalizedElement as="div" className="comparison-source-cards">
                {tractors.map((item) => (
                  <LocalizedElement as="div" key={item.id}>
                    <LocalizedElement as="strong">{item.name}</LocalizedElement>
                    {specificationSource(item) ? (
                      <LocalizedElement as="a" href={specificationSource(item)} target="_blank" rel="noreferrer">Manufacturer specification source ↗</LocalizedElement>
                    ) : (
                      <LocalizedElement as="span">No source link provided.</LocalizedElement>
                    )}
                    <LocalizedElement as="a" href={`/tractor/${encodeURIComponent(item.brandSlug)}/${encodeURIComponent(item.slug)}`}>Full model details →</LocalizedElement>
                  </LocalizedElement>
                ))}
              </LocalizedElement>
              <LocalizedElement as="p" className="comparison-guidance">
                Confirm the exact variant, optional equipment, warranty terms and current prices with the manufacturer or dealer.
              </LocalizedElement>
            </>
          )}
        </section>
      </main>
    </PublicShell>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<LocalizedElement as="p" role="status">Loading comparison…</LocalizedElement>}>
      <CompareContent />
    </Suspense>
  );
}
