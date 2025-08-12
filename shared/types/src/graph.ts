// Syntopia Social Graph Model
// MIT License

export type GraphNodeType = 'user' | 'hub';


// Syntopia TAO-style Social Graph Model (ArangoDB)
// MIT License

export type GraphObjectType = 'user' | 'hub' | 'quest';

export interface GraphObject {
  _key: string; // ArangoDB document key
  type: GraphObjectType;
  name: string;
  // Additional fields per type
  [key: string]: any;
}

export type GraphEdgeType = 'follows' | 'joins' | 'recommends';

export interface GraphEdge {
  _from: string; // ArangoDB _id (e.g. user/123)
  _to: string;   // ArangoDB _id (e.g. hub/456)
  type: GraphEdgeType;
  createdAt: number; // timestamp
  // Optional metadata
  [key: string]: any;
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
    .filter(e => e._from === `user/${userKey}` && (e.type === 'recommends' || e.type === 'follows'))
    .map(e => e._to);
  return objects.filter(obj => recommendedIds.includes(`${obj.type}/${obj._key}`));
}

// Utility: get connected objects for a user (TAO-style)
export function getConnections(objects: GraphObject[], edges: GraphEdge[], userKey: string): GraphObject[] {
  const connectedIds = edges
    .filter(e => e._from === `user/${userKey}` && (e.type === 'follows' || e.type === 'joins'))
    .map(e => e._to);
  return objects.filter(obj => connectedIds.includes(`${obj.type}/${obj._key}`));
}
