import type { SCLLevel } from './governance';

export type ProofType = 'complete' | 'github_pr';

export interface ProofPolicy {
  type: ProofType;
  requiredSCL?: SCLLevel;
  description: string;
}

export interface GitHubIssueLite {
  id: number;
  number: number;
  title: string;
  body?: string;
  url: string; // html_url
  repo: string; // owner/repo
  labels?: string[];
}

export interface QuestDTO {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'story';
  minimumSCL?: SCLLevel;
  proof: ProofPolicy;
  source?: { kind: 'github_issue'; repo: string; number: number; url: string };
}

export function mapIssueToQuest(issue: GitHubIssueLite): QuestDTO {
  return {
    id: `gh-${issue.repo}#${issue.number}`,
    title: issue.title,
    description: issue.body ?? `Issue #${issue.number} aus ${issue.repo}`,
    category: 'story',
    minimumSCL: 4 as SCLLevel,
    proof: {
      type: 'github_pr',
      requiredSCL: 4 as SCLLevel,
      description: 'Nachweis: PR wurde erfolgreich gereviewt und schließt das Issue.'
    },
    source: { kind: 'github_issue', repo: issue.repo, number: issue.number, url: issue.url },
  };
}
