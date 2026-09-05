'use client';
import { LocalizedElement } from '@/components/LocalizedElement';


import { useState } from 'react';
import { PublicShell } from '@/components/SiteChrome';
import { EditorialReviewCard, useEditorialReviews } from '@/components/EditorialReviews';
import { reviewTimestamp } from '@/lib/editorial-review';

export default function ReviewsPage() {
  const { items, loading, error } = useEditorialReviews();
  const [search, setSearch] = useState('');
  const [tractor, setTractor] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const filtered = items
    .filter((item) =>
      (!tractor || item.tractorId === tractor) &&
      [item.title, item.tractorName, item.excerpt].join(' ').toLowerCase().includes(search.trim().toLowerCase()),
    )
    .sort((a, b) =>
      sort === 'score'
        ? (b.score ?? -1) - (a.score ?? -1)
        : reviewTimestamp(b.publishedAt) - reviewTimestamp(a.publishedAt),
    );

  const models = [...new Map(items.filter((item) => item.tractorId).map((item) => [item.tractorId, item.tractorName])).entries()];

  return (
    <PublicShell>
      <main className="editorial-hub">
        <header className="page-hero">
          <LocalizedElement as="p">RJ TRACTOR TECHS EDITORIAL</LocalizedElement>
          <LocalizedElement as="h1">Find your next tractor.<br />Read the full review.</LocalizedElement>
          <LocalizedElement as="span">Our editorial team's verdicts, scores and practical buying advice, with the assessment method explained in every review.</LocalizedElement>
        </header>
        <section className="editorial-section">
          <LocalizedElement as="div" className="editorial-filters">
            <LocalizedElement as="label">
              Search reviews
              <LocalizedElement as="input"
                type="search"
                placeholder="Tractor, model or keyword"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </LocalizedElement>
            <LocalizedElement as="label">
              Tractor
              <LocalizedElement as="select"
                value={tractor}
                onChange={(event) => {
                  setTractor(event.target.value);
                  setPage(1);
                }}
              >
                <LocalizedElement as="option" value="">All tractors</LocalizedElement>
                {models.map(([id, name]) => (
                  <LocalizedElement as="option" value={id} key={id}>{name}</LocalizedElement>
                ))}
              </LocalizedElement>
            </LocalizedElement>
            <LocalizedElement as="label">
              Sort by
              <LocalizedElement as="select"
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  setPage(1);
                }}
              >
                <LocalizedElement as="option" value="newest">Newest reviews</LocalizedElement>
                <LocalizedElement as="option" value="score">Highest score</LocalizedElement>
              </LocalizedElement>
            </LocalizedElement>
          </LocalizedElement>
          {loading ? (
            <LocalizedElement as="p" role="status">Loading editorial reviews…</LocalizedElement>
          ) : error ? (
            <LocalizedElement as="div" role="alert" className="editorial-empty">
              <LocalizedElement as="h2">Unable to load reviews</LocalizedElement>
              <LocalizedElement as="p">{error}</LocalizedElement>
              <LocalizedElement as="button" onClick={() => window.location.reload()}>Try again</LocalizedElement>
            </LocalizedElement>
          ) : (
            <>
              <LocalizedElement as="p" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'review' : 'reviews'}</LocalizedElement>
              {filtered.length ? (
                <>
                  <LocalizedElement as="div" className="editorial-grid">
                    {filtered.slice(0, page * 9).map((review) => (
                      <EditorialReviewCard review={review} key={review.id} />
                    ))}
                  </LocalizedElement>
                  {filtered.length > page * 9 && (
                    <LocalizedElement as="button" className="editorial-more" onClick={() => setPage(page + 1)}>Show more reviews</LocalizedElement>
                  )}
                </>
              ) : (
                <LocalizedElement as="div" className="editorial-empty">
                  <LocalizedElement as="h2">{items.length ? 'No matching reviews' : 'No reviews published yet'}</LocalizedElement>
                  <LocalizedElement as="p">{items.length ? 'Try another model or clear your filters.' : 'Browse the tractor catalog while our editorial team prepares its first reviews.'}</LocalizedElement>
                  {items.length ? (
                    <LocalizedElement as="button" onClick={() => { setSearch(''); setTractor(''); }}>Clear filters</LocalizedElement>
                  ) : (
                    <LocalizedElement as="a" href="/tractors">Explore tractors →</LocalizedElement>
                  )}
                </LocalizedElement>
              )}
            </>
          )}
          <aside className="editorial-policy">
            <LocalizedElement as="h2">What is behind a review?</LocalizedElement>
            <LocalizedElement as="p">Reviews are written and published by our editorial team. Each published review explains how the tractor was assessed, its strengths and limitations, and the final verdict. Scores are editorial assessments on a ten-point scale, not customer ratings.</LocalizedElement>
            <LocalizedElement as="a" href="/contact">Send a correction or suggest a tractor →</LocalizedElement>
          </aside>
        </section>
      </main>
    </PublicShell>
  );
}
