import {spawnSync} from 'node:child_process';
// Absolute Node path also works with the standalone Firebase CLI's bundled runtime.
const node = '"' + process.execPath.replaceAll('"', '\\"') + '"';
const result = spawnSync('firebase', ['emulators:exec', '--only', 'firestore', '--project', 'demo-rj-security', `${node} --test tests/firestore-rules.test.mjs`], {stdio:'inherit'});
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);
