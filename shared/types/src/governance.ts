export type SCLLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25;

export const COMMUNITY_ROLES = [
  'quest_designer',
  'proof_verifier',
  'reward_curator',
  'hub_steward',
  'community_ambassador',
  'cartographer',
  'graph_analyst',
  'profile_guide',
  'ux_maintainer',
  'infra_operator',
  'product_maintainer',
  'code_maintainer',
] as const;

export type CommunityRole = typeof COMMUNITY_ROLES[number];

export interface RoleDefinition {
  key: CommunityRole;
  minSCL: SCLLevel;
  descriptionDE: string;
  descriptionEN: string;
}

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  { key: 'quest_designer', minSCL: 3, descriptionDE: 'Erstellt und iteriert Quests', descriptionEN: 'Creates and iterates quests' },
  { key: 'proof_verifier', minSCL: 4, descriptionDE: 'Prüft Nachweise fair und zügig', descriptionEN: 'Reviews proofs fairly and promptly' },
  { key: 'reward_curator', minSCL: 4, descriptionDE: 'Pflegt XP/Badges und Balancing', descriptionEN: 'Maintains XP/badges and balancing' },
  { key: 'hub_steward', minSCL: 3, descriptionDE: 'Betreut lokale Hubs & Partner', descriptionEN: 'Stewards local hubs and partners' },
  { key: 'community_ambassador', minSCL: 2, descriptionDE: 'Onboarding und Moderation', descriptionEN: 'Onboarding and moderation' },
  { key: 'cartographer', minSCL: 3, descriptionDE: 'Pflegt Karten & Orte', descriptionEN: 'Maintains maps and places' },
  { key: 'graph_analyst', minSCL: 5, descriptionDE: 'Kuratiert Empfehlungsheuristik', descriptionEN: 'Curates recommendation heuristics' },
  { key: 'profile_guide', minSCL: 2, descriptionDE: 'Unterstützt Profil-Setup & I18n', descriptionEN: 'Supports profile setup & i18n' },
  { key: 'ux_maintainer', minSCL: 4, descriptionDE: 'A11y & Mobile-first Qualität', descriptionEN: 'A11y & mobile-first quality' },
  { key: 'infra_operator', minSCL: 6, descriptionDE: 'Ops/Backups/Rate-Limits', descriptionEN: 'Ops/backups/rate-limits' },
  { key: 'product_maintainer', minSCL: 5, descriptionDE: 'Pflegt Roadmap/DoR/DoD', descriptionEN: 'Maintains roadmap/DoR/DoD' },
  { key: 'code_maintainer', minSCL: 6, descriptionDE: 'Reviews/CI/Tests', descriptionEN: 'Reviews/CI/tests' },
];
