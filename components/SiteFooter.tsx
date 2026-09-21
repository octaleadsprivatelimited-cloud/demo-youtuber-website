'use client';
import { LocalizedElement as Text } from './LocalizedElement';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import './site-footer.css';

const groups = [
  { title: 'Explore tractors', links: [['New tractors', '/new-tractors'], ['Used tractors', '/tractors?condition=used'], ['Upcoming tractors', '/upcoming-tractors'], ['Tractor brands', '/brands'], ['Farm equipment', '/equipment']] },
  { title: 'Research & learn', links: [['Expert reviews', '/reviews'], ['Compare tractors', '/compare'], ['EMI calculator', '/emi-calculator'], ['Videos', '/videos'], ['News & updates', '/news']] },
  { title: 'Connect with us', links: [['About RJ Tractor Techs', '/about'], ['Find a showroom', '/dealers'], ['Farming guides', '/articles'], ['Contact us', '/contact']] },
];
export function SiteFooter() {
  const settings = useSiteSettings();
  const name = settings.websiteName || 'RJ Tractor Techs';
  const socials = [['YouTube', settings.youtube || 'https://www.youtube.com/@Rjtractortechs'], ['Instagram', settings.instagram], ['Facebook', settings.facebook]].filter(([, url]) => url);
  return <footer id="rj-footer" aria-label="Website footer">
    <div className="rjf-main">
      {groups.map(group => <nav className="rjf-column" key={group.title} aria-label={group.title}>
        <Text as="h2">{group.title}</Text>
        {group.links.map(([label, href]) => <Text as="a" href={href} key={href}>{label}</Text>)}
      </nav>)}
      <div className="rjf-connect">
        <a href="/" className="rjf-brand" aria-label={name}>{settings.logo && <img src={settings.logo} alt="" width="48" height="48"/>}<span>{name}</span></a>
        <Text as="p">{settings.footer || 'Independent tractor information and practical farming knowledge, made easier to explore.'}</Text>
        <Text as="a" className="rjf-cta" href="/contact">Get in touch <span aria-hidden="true">↗</span></Text>
        <nav className="rjf-socials" aria-label="Social media">{socials.map(([label, href]) => <Text as="a" href={href} target="_blank" rel="noreferrer" key={label}>{label} <span aria-hidden="true">↗</span></Text>)}</nav>
        {settings.email && <a className="rjf-contact" href={'mailto:' + settings.email}>{settings.email}</a>}
        {settings.phone && <a className="rjf-contact" href={'tel:' + settings.phone}>{settings.phone}</a>}
      </div>
    </div>
    <div className="rjf-bottom"><div className="rjf-bottom-inner">
      <nav aria-label="Legal information">{[['Privacy', '/privacy-policy'], ['Terms', '/terms-and-conditions'], ['Cookie policy', '/cookie-policy'], ['Disclaimer', '/disclaimer']].map(([label, href]) => <Text as="a" key={href} href={href}>{label}</Text>)}</nav>
      <Text as="span">{settings.copyright || `© ${new Date().getFullYear()} ${name}. All rights reserved.`}</Text>
      <a className="rjf-credit" href="https://www.octaleads.com/">Developed by <strong translate="no">Octaleads</strong> ↗</a>
    </div></div>
  </footer>;
}
