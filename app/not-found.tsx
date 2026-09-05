
import { LocalizedElement } from '@/components/LocalizedElement';
import {PublicShell} from '@/components/SiteChrome';
export default function NotFound(){return <PublicShell><main className="system-state"><LocalizedElement as="p">404 · FIELD NOT FOUND</LocalizedElement><LocalizedElement as="h1">This route has gone off track.</LocalizedElement><LocalizedElement as="span">The page may have moved, or the address may be incorrect.</LocalizedElement><LocalizedElement as="div"><LocalizedElement as="a" className="cta-primary" href="/">Return home</LocalizedElement><LocalizedElement as="a" className="cta-secondary" href="/tractors">Explore tractors</LocalizedElement></LocalizedElement></main></PublicShell>}
