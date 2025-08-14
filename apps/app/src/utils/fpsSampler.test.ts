import { describe, it, expect, vi } from 'vitest';
import { FpsSampler } from './fpsSampler';

describe('FpsSampler', () => {
  it('calls downgrade when avg fps below threshold', async () => {
    const cb = vi.fn();
    // Mock performance & RAF
    let time = 0;
    // @ts-ignore
    global.performance = { now: () => time };
  const rafCallbacks: Array<() => void> = [];
    // @ts-ignore
    global.requestAnimationFrame = (fn: any) => { rafCallbacks.push(fn); return rafCallbacks.length; };
    // @ts-ignore
    global.cancelAnimationFrame = () => {};
    const sampler = new FpsSampler({ downgradeThresholdFps: 50, onDowngrade: cb, sampleIntervalMs: 100, windowSize: 5 });
    sampler.start();
    // Simulate 10 frames at low FPS (e.g., 30fps -> delta ~33ms)
    for (let i = 0; i < 10; i++) {
      time += 33; // ~30 fps
      rafCallbacks.shift()?.();
      if (i % 2 === 0) await new Promise(r => setTimeout(r, 0));
    }
    expect(cb).toHaveBeenCalled();
    sampler.stop();
  });
});
