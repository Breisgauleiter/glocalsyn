import { describe, it, expect } from 'vitest';
import type { TelemetryEvent, TelemetryGraphNodeFocus, TelemetryRecommendationExplained } from './index';

describe('telemetry types', () => {
  it('accepts graph_node_focus event shape', () => {
    const ev: TelemetryGraphNodeFocus = { ts: Date.now(), type: 'graph_node_focus', nodeId: 'n1', nodeType: 'quest', method: 'click' };
    const cast: TelemetryEvent = ev;
    expect(cast.type).toBe('graph_node_focus');
  });
  it('accepts recommendation_explained event shape', () => {
    const ev: TelemetryRecommendationExplained = { ts: Date.now(), type: 'recommendation_explained', nodeId: 'q1', reasonCode: 'bridge', locale: 'de' };
    const cast: TelemetryEvent = ev;
    expect(cast.type).toBe('recommendation_explained');
  });
});
