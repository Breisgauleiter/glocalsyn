import { describe, it, expect, vi } from 'vitest';
import { emit, getBuffer, clearBuffer, subscribe, configureFlush } from './telemetry';

describe('telemetry dispatcher', () => {
  it('buffers and notifies listeners', () => {
    clearBuffer();
    const listener = vi.fn();
    const unsub = subscribe(listener);
    emit({ ts: 1, type: 'recommendation_explained', nodeId: 'n1', reasonCode: 'bridge', locale: 'de' });
    emit({ ts: 2, type: 'graph_node_focus', nodeId: 'user/1', nodeType: 'user', method: 'hover' });
    unsub();
    expect(getBuffer().length).toBe(2);
    expect(listener).toHaveBeenCalledTimes(2);
  });
  it('caps buffer size', () => {
    clearBuffer();
    for (let i=0;i<600;i++) emit({ ts: i, type: 'recommendation_explained', nodeId: 'x', reasonCode: 'bridge', locale: 'de' });
    expect(getBuffer().length).toBeLessThanOrEqual(500);
  });
  it('flushes periodically', async () => {
    clearBuffer();
    const flushed: number[] = [];
    configureFlush(50, evs => { flushed.push(evs.length); });
    emit({ ts: 1, type: 'recommendation_explained', nodeId: 'n', reasonCode: 'bridge', locale: 'de' });
    await new Promise(r => setTimeout(r, 120));
    expect(flushed.length).toBeGreaterThan(0);
    configureFlush(0, () => {}); // disable
  });
});
