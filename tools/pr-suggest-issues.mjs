#!/usr/bin/env node
/* eslint-env node */
/**
 * PR Issue Suggestion Script (standalone)
 * Usage: node tools/pr-suggest-issues.mjs "feat: graph 3d performance downgrade" issues.json
 * issues.json format: [{"number":12,"title":"Graph 3D performance downgrade mechanism"}, ...]
 * NOTE: Logic duplicated (lightly) from prIssueMapping.ts to avoid runtime TS import.
 */
import fs from 'node:fs';
import path from 'node:path';

function tokenize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
}

function score(prTitle, issueTitle) {
  const prTokens = new Set(tokenize(prTitle));
  const issueTokens = tokenize(issueTitle);
  if (!prTokens.size || !issueTokens.length) return 0;
  let overlap = 0;
  for (const t of issueTokens) if (prTokens.has(t)) overlap++;
  return overlap / Math.max(prTokens.size, issueTokens.length);
}

function suggestIssues(prTitle, issues, threshold = 0.15, limit = 5) {
  return issues
    .map(issue => ({ issue, score: Number(score(prTitle, issue.title).toFixed(3)) }))
    .filter(r => r.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function main() {
  const [, , prTitleArg, issuesFile] = process.argv;
  if (!prTitleArg || !issuesFile) {
    console.error('Usage: pr-suggest-issues <prTitle> <issues.json>');
    process.exit(1);
  }
  const raw = fs.readFileSync(path.resolve(issuesFile), 'utf-8');
  let issues;
  try { issues = JSON.parse(raw); } catch { console.error('Invalid JSON'); process.exit(1); }
  const matches = suggestIssues(prTitleArg, issues, 0.15);
  if (!matches.length) { console.log('No relevant issues found (threshold=0.15).'); return; }
  for (const m of matches) console.log(`#${m.issue.number}\t${m.score}\t${m.issue.title}`);
}
main();
