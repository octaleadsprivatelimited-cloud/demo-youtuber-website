'use client';

import { FormEvent, useState } from 'react';
import { Newsletter } from '@/components/Newsletter';

const nav = ['Home', 'Tractors', 'Brands', 'Reviews', 'Compare', 'Prices', 'Equipment', 'Agriculture', 'Videos', 'Dealers'];
const searches = ['Mahindra 575 DI', 'John Deere 5310', 'Swaraj 744 FE', 'Sonalika 745', 'New Holland 3630'];
const tractors = [
  { name: 'Mahindra 575 DI XP Plus', hp: '47 HP', price: '₹7.20–7.60 Lakh', image: 'https://images.unsplash.com/photo-1605338198618-d6c221ecb40a?auto=format&fit=crop&w=900&q=80' },
  { name: 'John Deere 5310', hp: '57 HP', price: '₹11.15–12.00 Lakh', image: 'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=900&q=80' },
  { name: 'Swaraj 744 FE', hp: '48 HP', price: '₹7.31–7.84 Lakh', image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=900&q=80' },
];
const brands = ['Mahindra', 'Swaraj', 'John Deere', 'Sonalika', 'New Holland', 'Massey Ferguson'];
const editorial = [
  { tag: 'BUYING GUIDE', title: 'How to choose the right tractor horsepower for your farm', image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=1000&q=80' },
  { tag: 'FARMING', title: 'Preparing your tractor for the next crop season', image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1000&q=80' },
  { tag: 'EXPLAINER', title: 'Understanding PTO power and implement compatibility', image: 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1000&q=80' },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const value = query.trim();
    if (value) window.location.href = `/tractors?search=${encodeURIComponent(value)}`;
  }

  return (
    <main>
      <div className="topbar">
        <p>India&apos;s independent tractor research &amp; farming media platform</p>
        <a href="https://www.youtube.com/@Rjtractortechs" target="_blank" rel="noreferrer">Watch on YouTube <span>↗</span></a>
      </div>
      <header className="site-header">
        <a className="brand" href="/" aria-label="RJ Tractor Techs home">
          <span className="brand-mark">RJ</span>
          <span className="brand-copy"><strong>Tractor Techs</strong><small>Reviews · Specs · Farming</small></span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {nav.map((item) => <a className={item === 'Home' ? 'active' : ''} key={item} href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}>{item}</a>)}
        </nav>
        <div className="header-actions">
          <button aria-label="Search">⌕</button>
          <button className="desktop-only" aria-label="Favourites">♡</button>
          <button aria-label="Menu" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </div>
      </header>
      {menuOpen && <nav className="mobile-nav" aria-label="Mobile navigation">{nav.map((item) => <a key={item} href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}>{item}<span>→</span></a>)}</nav>}

      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow"><span /> Research before you buy</p>
          <h1>India&apos;s Tractor Reviews, Specs &amp; <em>Farming Information</em></h1>
          <p className="hero-copy">Explore tractor specifications, prices, expert reviews, comparisons, new launches and farming insights.</p>
          <form className="search-panel" onSubmit={submitSearch}>
            <div className="search-field"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tractor, brand or model" aria-label="Search tractor, brand or model" /></div>
            <button type="submit">Search Tractor <span>→</span></button>
          </form>
          <div className="quick-searches"><span>Popular:</span>{searches.slice(0, 3).map((item) => <button key={item} onClick={() => setQuery(item)}>{item}</button>)}</div>
          <div className="hero-actions"><a className="primary-link" href="/compare">Compare Tractors <span>↗</span></a><a className="video-link" href="https://www.youtube.com/@Rjtractortechs" target="_blank" rel="noreferrer"><i>▶</i> Watch RJ Tractor Techs</a></div>
        </div>
        <aside className="hero-note"><span>EDITOR&apos;S PICK</span><strong>What to check before buying a tractor</strong><a href="/articles/tractor-buying-guide">Read the guide →</a></aside>
        <div className="hero-stats" aria-label="Platform topics"><div><strong>Reviews</strong><span>Real-world insights</span></div><div><strong>Specifications</strong><span>Clear model data</span></div><div><strong>Farming</strong><span>Practical knowledge</span></div></div>
      </section>

      <section className="intro-strip">
        <div><span>01</span><p><strong>Find your tractor</strong>Search by brand, power or budget.</p></div>
        <div><span>02</span><p><strong>Compare the details</strong>See important specifications side by side.</p></div>
        <div><span>03</span><p><strong>Make an informed choice</strong>Watch reviews and estimate ownership costs.</p></div>
      </section>

      <section className="content-section">
        <div className="section-head"><div><p>TRACTOR RESEARCH</p><h2>Popular tractors</h2></div><a href="/tractors">Explore all tractors →</a></div>
        <div className="tractor-grid">
          {tractors.map((tractor, index) => <article className="tractor-card" key={tractor.name}>
            <div className="card-image" style={{ backgroundImage: `url(${tractor.image})` }}><span>{index === 0 ? 'POPULAR' : 'FEATURED'}</span><button aria-label={`Favourite ${tractor.name}`}>♡</button></div>
            <div className="card-body"><p>{tractor.hp} · Diesel</p><h3>{tractor.name}</h3><strong>{tractor.price}<small>Estimated price</small></strong><div><a href={`/tractor/${tractor.name.toLowerCase().replaceAll(' ', '-')}`}>View details</a><a href="/compare">+ Compare</a></div></div>
          </article>)}
        </div>
      </section>

      <section className="brand-section">
        <div className="section-head"><div><p>EXPLORE THE MARKET</p><h2>Popular tractor brands</h2></div><a href="/brands">View every brand →</a></div>
        <div className="brand-grid">{brands.map((brand, index) => <a href={`/brand/${brand.toLowerCase().replaceAll(' ', '-')}`} key={brand}><span>{brand.split(' ').map(word => word[0]).join('')}</span><strong>{brand}</strong><small>{index + 5} models →</small></a>)}</div>
      </section>

      <section className="compare-banner">
        <div><p>SMARTER DECISIONS</p><h2>Compare tractors, side by side.</h2><span>Evaluate power, transmission, hydraulics, dimensions, features and price in one clear view.</span></div>
        <div className="compare-cards"><div><small>TRACTOR 01</small><strong>Choose a tractor</strong><button>＋</button></div><b>VS</b><div><small>TRACTOR 02</small><strong>Choose a tractor</strong><button>＋</button></div></div>
        <a href="/compare">Start comparing →</a>
      </section>

      <section className="content-section editorial-section">
        <div className="section-head"><div><p>KNOWLEDGE FOR THE FIELD</p><h2>Latest insights &amp; reviews</h2></div><a href="/articles">Read all stories →</a></div>
        <div className="editorial-grid">{editorial.map((item, index) => <article className={index === 0 ? 'feature-story' : ''} key={item.title}><div className="story-image" style={{ backgroundImage:`url(${item.image})` }} /><div><p>{item.tag} · 6 MIN READ</p><h3>{item.title}</h3><a href="/articles">Read article →</a></div></article>)}</div>
      </section>

      <section className="youtube-band">
        <div className="youtube-icon">▶</div><div><p>WATCH. LEARN. DECIDE.</p><h2>RJ Tractor Techs on YouTube</h2><span>Video reviews, field demonstrations and clear tractor explainers from the official RJ Tractor Techs channel.</span></div><a href="https://www.youtube.com/@Rjtractortechs" target="_blank" rel="noreferrer">Visit the channel ↗</a>
      </section>

      <Newsletter />
      <footer>
        <div className="footer-main"><div className="footer-brand"><a className="brand" href="/"><span className="brand-mark">RJ</span><span className="brand-copy"><strong>Tractor Techs</strong><small>Reviews · Specs · Farming</small></span></a><p>Independent tractor information and practical farming knowledge, made easier to explore.</p></div>
        <div><h4>Research</h4>{['Tractors','Brands','Reviews','Compare','Prices','Dealers'].map(link => <a key={link} href={`/${link.toLowerCase()}`}>{link}</a>)}</div>
        <div><h4>Learn</h4>{['Equipment','Agriculture','News','Articles','Videos'].map(link => <a key={link} href={`/${link.toLowerCase()}`}>{link}</a>)}</div>
        <div><h4>RJ Tractor Techs</h4>{['About','Contact','Privacy Policy','Terms & Conditions','Disclaimer'].map(link => <a key={link} href={`/${link.toLowerCase().replaceAll(' ','-').replace('&','and')}`}>{link}</a>)}</div></div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} RJ Tractor Techs. All rights reserved.</span><a href="https://www.youtube.com/@Rjtractortechs" target="_blank" rel="noreferrer">Subscribe on YouTube ↗</a></div>
      </footer>
    </main>
  );
}
