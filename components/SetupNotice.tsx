
import { LocalizedElement } from '@/components/LocalizedElement';
import {isLocalDemo} from '@/lib/firebase/client';
export function SetupNotice({ message }: { message?: string }) {
  if(isLocalDemo)return <LocalizedElement as="div" className="setup-notice local-demo" role="status"><LocalizedElement as="span">LOCAL DEMO MODE</LocalizedElement><LocalizedElement as="h2">Firebase is bypassed on localhost</LocalizedElement><LocalizedElement as="p">Browse the interface without credentials. Live records and account actions remain disabled until Firebase is connected.</LocalizedElement></LocalizedElement>;
  return <LocalizedElement as="div" className="setup-notice" role="status"><LocalizedElement as="span">FIREBASE CONNECTION REQUIRED</LocalizedElement><LocalizedElement as="h2">Connect the RJ Tractor Techs Firebase project</LocalizedElement><LocalizedElement as="p">{message ?? 'Add the Firebase web-app values to the environment to load live tractors, brands and accounts. No substitute database is being used.'}</LocalizedElement></LocalizedElement>;
}
