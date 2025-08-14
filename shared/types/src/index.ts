export * from './governance';
export * from './quests';
export * from './graph';
// Telemetry event interfaces
export interface TelemetryEventBase { ts: number; type: string; }
export interface TelemetryGraphNodeFocus extends TelemetryEventBase { type: 'graph_node_focus'; nodeId: string; nodeType: string; method: 'click' | 'keyboard' | 'hover'; }
export interface TelemetryRecommendationExplained extends TelemetryEventBase { type: 'recommendation_explained'; nodeId: string; reasonCode: string; locale: string; }
export type TelemetryEvent = TelemetryGraphNodeFocus | TelemetryRecommendationExplained;
export * from './proofSemantics';
