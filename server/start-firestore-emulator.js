const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectId = 'demo-digital-vistara';
const exportDirectory = path.join(__dirname, '.firestore-data');
const exportMetadata = path.join(exportDirectory, 'firebase-export-metadata.json');
const firebaseCli = require.resolve('firebase-tools/lib/bin/firebase.js');
const args = ['emulators:start', '--only', 'firestore', '--project', projectId];

if (fs.existsSync(exportMetadata)) args.push('--import', exportDirectory);
args.push('--export-on-exit', exportDirectory);

const emulator = spawn(process.execPath, [firebaseCli, ...args], {
  cwd: __dirname,
  env: { ...process.env, FIREBASE_CLI_DISABLE_TELEMETRY: '1' },
  stdio: 'inherit'
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => emulator.kill(signal));
}

emulator.on('error', (error) => {
  console.error('Could not start Firestore Emulator:', error.message);
  process.exitCode = 1;
});

emulator.on('exit', (code) => {
  process.exitCode = code ?? 0;
});