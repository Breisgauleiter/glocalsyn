// Proof semantics helpers (SCL >= 4 GitHub PR close keywords)
// MIT License

/** Close keywords recognized by GitHub that auto-close issues when PR is merged. */
export const CLOSE_KEYWORDS = [
  'close', 'closes', 'closed',
  'fix', 'fixes', 'fixed',
  'resolve', 'resolves', 'resolved'
];

export interface ParsedPRIssueRefs {
  issues: Array<{ owner?: string; repo?: string; number: number }>; // supports cross-repo syntax owner/repo#num
}

const ISSUE_REF_RE = /([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)?#(\d+)/g; // optional owner/repo#123 or #123

/**
 * Extract issues referenced with closing keywords from PR title/body.
 * Conservative: only counts lines containing a close keyword followed by issue refs.
 */
export function parseClosingIssueReferences(text: string): ParsedPRIssueRefs {
  const issues: ParsedPRIssueRefs['issues'] = [];
  if (!text) return { issues };
  const lower = text.toLowerCase();
  const hasKeyword = CLOSE_KEYWORDS.some(k => lower.includes(k + ' '));
  if (!hasKeyword) return { issues };
  // Scan all refs
  let m: RegExpExecArray | null;
  while ((m = ISSUE_REF_RE.exec(text)) !== null) {
    const full = m[1];
    const num = parseInt(m[2], 10);
    if (!Number.isFinite(num)) continue;
    if (full) {
      const [owner, repo] = full.split('/');
      issues.push({ owner, repo, number: num });
    } else {
      issues.push({ number: num });
    }
  }
  return { issues };
}
