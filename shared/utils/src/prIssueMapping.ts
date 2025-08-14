/** Semantic PR→Issue mapping stub.
 * Heuristic overlap scoring for future automation.
 */
export interface IssueRef { number: number; title: string; }
export interface MatchResult { issue: IssueRef; score: number; }

const STOP = new Set(['feat','fix','add','adds','update','for','with','and','the','into','from']);
function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(Boolean).filter(w => w.length>2 && !STOP.has(w));
}

export function suggestIssues(prTitle: string, issues: IssueRef[], minScore = 0.2): MatchResult[] {
  const prTokens = new Set(tokenize(prTitle));
  if (!prTokens.size) return [];
  const out: MatchResult[] = [];
  for (const issue of issues) {
    const it = new Set(tokenize(issue.title));
    if (!it.size) continue;
    let overlap = 0;
    for (const t of it) if (prTokens.has(t)) overlap++;
    const score = overlap / Math.max(it.size, prTokens.size);
    if (score >= minScore) out.push({ issue, score: Number(score.toFixed(3)) });
  }
  return out.sort((a,b)=> b.score - a.score);
}
