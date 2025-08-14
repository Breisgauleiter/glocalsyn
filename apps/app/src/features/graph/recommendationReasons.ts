// Recommendation reason code -> i18n key mapping + helper
// Keeps explainability consistent between backend + client placeholder logic.

export type RecommendationReasonCode = 'bridge' | 'diversity' | 'continuation' | 'activity' | 'social_proof';

const CODE_TO_I18N: Record<RecommendationReasonCode, string> = {
  bridge: 'recs.reason.bridge',
  diversity: 'recs.reason.diversity',
  continuation: 'recs.reason.continuation',
  activity: 'recs.reason.activity',
  social_proof: 'recs.reason.social_proof'
};

export function reasonCodeToKey(code: string): string {
  if (code in CODE_TO_I18N) return CODE_TO_I18N[code as RecommendationReasonCode];
  return 'recs.reason.social_proof'; // fallback generic
}

export function mapExplanation(code: string, override?: string): { key: string; fallback: string } {
  if (override) return { key: reasonCodeToKey(code), fallback: override };
  const key = reasonCodeToKey(code);
  return { key, fallback: key };
}
