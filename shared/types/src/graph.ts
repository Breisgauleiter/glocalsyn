// Syntopia TAO-style Social Graph Model (ArangoDB)
// MIT License

export type GraphObjectType = 'user' | 'hub' | 'quest';

export interface GraphNodeMeta {
  diversityTags?: string[];
  bridgeScore?: number;
  activityScore?: number;
  [key: string]: any;
}

export interface GraphObject extends GraphNodeMeta {
  _key: string;
  type: GraphObjectType;
  name: string;
  [key: string]: any;
}

export type GraphEdgeType =
  | 'follows'
  | 'joins'
  | 'recommends'
  | 'bridge'
  | 'belongs_to'
  | 'continues'
  | 'reviewed';

export interface GraphEdge {
  _from: string; // ArangoDB _id (e.g. user/123)
  _to: string;   // ArangoDB _id (e.g. hub/456)
  type: GraphEdgeType;
  createdAt: number; // timestamp
  // Optional metadata
  [key: string]: any;
}

export type RecommendationReasonCode = 'bridge' | 'diversity' | 'continuation' | 'activity' | 'social_proof';
export interface RecommendationReason { code: RecommendationReasonCode; weight?: number; explanation?: string; meta?: Record<string, any>; }
export interface GraphRecommendation { node: GraphObject; reasons: RecommendationReason[]; }

export function createGraphObject(type: GraphObjectType, key: string, name: string, meta: Partial<GraphObject> = {}): GraphObject {
  return { _key: key, type, name, diversityTags: meta.diversityTags ?? [], bridgeScore: meta.bridgeScore ?? 0, activityScore: meta.activityScore ?? 0, ...meta };
}

export function isGraphEdge(value: any): value is GraphEdge {
  return !!value && typeof value === 'object' && typeof value._from === 'string' && typeof value._to === 'string' && typeof value.type === 'string' && typeof value.createdAt === 'number';
}
// Example: create a user node
// { _key: 'u123', type: 'user', name: 'Alice' }

// Example: create a follows edge
// { _from: 'user/u123', _to: 'user/u456', type: 'follows', createdAt: Date.now() }

// For backend: use arangojs to query and mutate these collections

// Utility: get recommendations for a user

// Utility: get recommended objects for a user (TAO-style)
export function getRecommendations(objects: GraphObject[], edges: GraphEdge[], userKey: string): GraphObject[] {
  const recommendedIds = edges
    .filter(e => e._from === `user/${userKey}` && (e.type === 'recommends' || e.type === 'follows' || e.type === 'continues'))
    .map(e => e._to);
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const id of recommendedIds) { if (!seen.has(id)) { seen.add(id); ordered.push(id); } }
  return objects.filter(obj => ordered.includes(`${obj.type}/${obj._key}`));
}

// Utility: get connected objects for a user (TAO-style)
export function getConnections(objects: GraphObject[], edges: GraphEdge[], userKey: string): GraphObject[] {
  const connectedIds = edges
    .filter(e => e._from === `user/${userKey}` && (e.type === 'follows' || e.type === 'joins'))
    .map(e => e._to);
  return objects.filter(obj => connectedIds.includes(`${obj.type}/${obj._key}`));
}
