export interface FpsSamplerOptions {
  sampleIntervalMs?: number;
  windowSize?: number;
  downgradeThresholdFps: number;
  onDowngrade: (avgFps: number) => void;
}

export class FpsSampler {
  private opts: FpsSamplerOptions;
  private frames: number[] = [];
  private lastTime = performance.now();
  private rafId: number | null = null;
  private stopped = false;
  private lastEval = 0;

  constructor(opts: FpsSamplerOptions) {
    this.opts = { sampleIntervalMs: 2000, windowSize: 60, ...opts };
  }

  start() {
    if (this.rafId !== null) return;
    this.loop();
  }
  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.stopped = true;
  }
  private loop = () => {
    if (this.stopped) return;
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;
    if (delta > 0 && delta < 1000) {
      const fps = 1000 / delta;
      this.frames.push(fps);
      if (this.frames.length > (this.opts.windowSize || 60)) this.frames.shift();
    }
    if (now - this.lastEval >= (this.opts.sampleIntervalMs || 2000)) {
      this.lastEval = now;
      const avg = this.frames.reduce((a, b) => a + b, 0) / (this.frames.length || 1);
      if (avg < this.opts.downgradeThresholdFps) {
        try { this.opts.onDowngrade(avg); } catch { /* noop */ }
      }
    }
    this.rafId = requestAnimationFrame(this.loop);
  };
}

export function createAutoDowngradeSampler(flagSetter: () => void, threshold = 45) {
  return new FpsSampler({ downgradeThresholdFps: threshold, onDowngrade: () => flagSetter() });
}
