import { describe, it, expect } from 'vitest';
import { parseClosingIssueReferences } from './proofSemantics';

describe('parseClosingIssueReferences', () => {
  it('returns empty when no keywords present', () => {
    expect(parseClosingIssueReferences('Ref #12 only')).toEqual({ issues: [] });
  });
  it('parses simple refs with keyword', () => {
    const r = parseClosingIssueReferences('This PR closes #42 and fixes #7');
    const nums = r.issues.map(i => i.number).sort((a,b)=>a-b);
    expect(nums).toEqual([7, 42]);
  });
  it('parses cross repo refs', () => {
    const r = parseClosingIssueReferences('Resolve ownerX/repoY#99 plus closes #1');
    expect(r.issues.find(i => i.number === 99)?.owner).toBe('ownerX');
  });
  it('is conservative: keyword needed', () => {
    const r = parseClosingIssueReferences('Implements #5 but not auto close');
    expect(r.issues.length).toBe(0);
  });
});
