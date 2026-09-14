
import { LocalizedElement } from '@/components/LocalizedElement';
export function SetupNotice({ message }: { message?: string }) {
  return <LocalizedElement as="div" className="setup-notice" role="status"><LocalizedElement as="span">FIREBASE CONNECTION REQUIRED</LocalizedElement><LocalizedElement as="h2">Connect the RJ Tractor Techs Firebase project</LocalizedElement><LocalizedElement as="p">{message ?? 'Add the Firebase web-app values to the environment to load live tractors, brands and accounts. No substitute database is being used.'}</LocalizedElement></LocalizedElement>;
}
