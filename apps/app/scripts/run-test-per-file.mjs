#!/usr/bin/env node
/* eslint-env node */
import { execSync } from 'node:child_process';
import { readdirSync, mkdirSync, existsSync, renameSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const mode = process.argv[2] || 'fast';
const isCoverage = mode === 'coverage';
const routeDir = join(process.cwd(), 'src', 'routes');

function isTest(f) { return f.endsWith('.test.tsx') || f.endsWith('.test.ts'); }
let testFiles = [];

if (mode === 'fast' || mode === 'coverage') {
  const allRouteTests = readdirSync(routeDir).filter(isTest);
  const excluded = new Set([
    'QuestDetail.flows.test.tsx',
    'ReviewQueue.enhanced.test.tsx',
    'Badges.test.tsx',
    'QuestDetail.linkProof.test.tsx',
    'QuestDetail.peerConfirm.test.tsx',
    'QuestDetail.proofSubmission.test.tsx',
    'QuestDetail.textNote.test.tsx',
    'QuestDetail.photo.test.tsx'
  ]);
  testFiles = allRouteTests.filter(f => !excluded.has(f)).map(f => join('src','routes',f));
  testFiles.push(
    'src/features/quests/githubAdapter.test.ts',
    'src/features/quests/questStore.test.tsx',
    'src/features/profile/profileStore.test.tsx',
    'src/utils/image.test.ts',
    'src/i18n.test.ts'
  );
} else if (mode === 'integration') {
  testFiles = [
    'src/routes/QuestDetail.flows.test.tsx',
    'src/routes/ReviewQueue.enhanced.test.tsx',
    'src/routes/Badges.test.tsx'
  ];
} else {
  console.error('Unknown mode', mode);
  process.exit(1);
}

let failures = 0;
if (isCoverage) {
  const partialDir = join(process.cwd(), 'coverage', 'partials');
  try { mkdirSync(partialDir, { recursive: true }); } catch { /* ignore */ }
}

for (const file of testFiles) {
  try {
    console.log(`\n-- Running ${file} --`);
    const cmd = `./node_modules/.bin/vitest run ${file} --reporter=dot${isCoverage ? ' --coverage' : ''}`;
    execSync(cmd, {
      stdio: 'inherit',
      env: {
        ...process.env,
        VITEST_MAX_THREADS: '1',
        VITEST_MIN_THREADS: '1',
        NODE_OPTIONS: '--max_old_space_size=2048 --expose-gc',
        COVERAGE_STRICT: '0'
      }
    });
    if (isCoverage) {
      const partialDir = join(process.cwd(), 'coverage', 'partials');
      const source = join(process.cwd(), 'coverage', 'lcov.info');
      if (existsSync(source)) {
        const safeName = file.replace(/[\\/]/g, '__');
        const target = join(partialDir, safeName + '.info');
  try { renameSync(source, target); } catch { /* ignore */ }
      }
    }
  } catch (err) {
    const msg = (err && err.message) || '';
    if (/No test files found/i.test(msg)) {
      console.log(`Skipping (no tests): ${file}`);
      continue;
    }
    failures++;
  }
}

if (failures) {
  console.error(`\n${failures} test file(s) failed`);
  process.exit(1);
}
if (isCoverage) {
  const partialDir = join(process.cwd(), 'coverage', 'partials');
  const outFile = join(process.cwd(), 'coverage', 'lcov.info');
  try { mkdirSync(partialDir, { recursive: true }); } catch { /* ignore */ }
  const parts = readdirSync(partialDir)
    .filter(f => f.endsWith('.info'))
    .map(f => readFileSync(join(partialDir, f), 'utf8'));
  writeFileSync(outFile, parts.join('\n'), 'utf8');
  console.log(`\nCombined coverage written to ${outFile}`);
}
console.log('\nAll test files passed in mode:', mode);
