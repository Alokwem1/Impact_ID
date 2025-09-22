#!/usr/bin/env node
/**
 * Simple release preflight script.
 * Checks: required PWA icons, frontend build, (placeholder) test reminders.
 * Extend as needed (Lighthouse, backend migrations, etc.).
 */
import fs from 'fs';
import { execSync } from 'child_process';

const ICONS = [
  'frontend/public/android-chrome-192x192.png',
  'frontend/public/android-chrome-512x512.png',
  'frontend/public/android-chrome-512x512-maskable.png'
];

function assert(condition, message) {
  if (!condition) {
    console.error(`✖ ${message}`);
    process.exit(1);
  }
  console.log(`✔ ${message}`);
}

function fileExists(p) { return fs.existsSync(p); }

function run(cmd, opts = {}) {
  console.log(`→ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', ...opts });
}

(function main(){
  console.log('== Impact ID Release Preflight ==');

  // 1. Icon presence
  ICONS.forEach(icon => assert(fileExists(icon), `Icon present: ${icon}`));

  // 2. Frontend tests (quick run)
  run('npm --prefix frontend test -- --run');

  // 3. Frontend build
  run('npm --prefix frontend run build');
  assert(fs.existsSync('frontend/dist/index.html'), 'Frontend build output exists');

  console.log('\nAll checks passed. Ready for tagging & deployment.');
})();
