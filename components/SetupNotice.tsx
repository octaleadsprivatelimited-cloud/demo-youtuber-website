export function SetupNotice({ message }: { message?: string }) {
  return <div className="setup-notice" role="status"><span>FIREBASE CONNECTION REQUIRED</span><h2>Connect the RJ Tractor Techs Firebase project</h2><p>{message ?? 'Add the Firebase web-app values to the environment to load live tractors, brands and accounts. No substitute database is being used.'}</p></div>;
}

