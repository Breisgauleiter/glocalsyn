import { describe, it, expect } from 'vitest';
import { suggestIssues } from './prIssueMapping';

describe('prIssueMapping', () => {
  it('ranks overlapping issues', () => {
    const issues = [
      { number: 12, title: 'Add diversity tags to graph snapshot' },
      { number: 18, title: 'Implement recommendation reason mapping i18n' },
      { number: 25, title: 'Graph 3D performance downgrade mechanism' },
    ];
    const prTitle = 'feat: graph 3d performance downgrade & reason mapping';
    const res = suggestIssues(prTitle, issues, 0.1);
    expect(res[0].issue.number).toBe(25);
    expect(res.map(r=>r.issue.number)).toContain(18);
  });
  it('returns empty when no overlap', () => {
    const res = suggestIssues('refactor: telemetry buffer', [{ number: 5, title: 'Quest acceptance flow' }]);
    expect(res.length).toBe(0);
  });
});
