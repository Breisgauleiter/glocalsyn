import type { GitHubIssueLite } from '../../../../../shared/types/src';

export const MOCK_ISSUES: GitHubIssueLite[] = [
  {
    id: 1,
    number: 1,
    title: 'Fix copy on Home CTA',
    body: 'Change CTA text to be shorter and more action-oriented.',
    url: 'https://github.com/Breisgauleiter/glocalsyn/issues/1',
    repo: 'Breisgauleiter/glocalsyn',
    labels: ['good first issue']
  },
];
