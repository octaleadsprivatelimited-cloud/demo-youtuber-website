
import { LocalizedElement } from '@/components/LocalizedElement';
export default function Loading(){return <main className="page-skeleton" aria-label="Loading content"><LocalizedElement as="span"/><LocalizedElement as="span"/><LocalizedElement as="div">{[1,2,3].map(item=><i key={item}/>)}</LocalizedElement></main>}
