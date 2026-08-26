import {isLocalDemo} from '@/lib/firebase/client';
export function SetupNotice({ message }: { message?: string }) {
  if(isLocalDemo)return <div className="setup-notice local-demo" role="status"><span>LOCAL DEMO MODE</span><h2>Firebase is bypassed on localhost</h2><p>Browse the interface without credentials. Live records and account actions remain disabled until Firebase is connected.</p></div>;
  return <div className="setup-notice" role="status"><span>FIREBASE CONNECTION REQUIRED</span><h2>Connect the RJ Tractor Techs Firebase project</h2><p>{message ?? 'Add the Firebase web-app values to the environment to load live tractors, brands and accounts. No substitute database is being used.'}</p></div>;
}
