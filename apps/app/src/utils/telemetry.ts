import type { TelemetryEvent } from '@syntopia/types';

// Simple in-memory telemetry dispatcher with ring buffer semantics.
const buffer: TelemetryEvent[] = [];
const MAX = 500;
type Listener = (e: TelemetryEvent) => void;
const listeners = new Set<Listener>();
let flushTimer: number | null = null;
let flushHandler: ((events: TelemetryEvent[]) => void) | null = null;

export function emit(event: TelemetryEvent) {
  buffer.push(event);
  if (buffer.length > MAX) buffer.splice(0, buffer.length - MAX);
  for (const l of listeners) { try { l(event); } catch { /* noop */ } }
  if ((import.meta as any).env?.DEV) console.log('[telemetry]', event);
}
export function getBuffer(): TelemetryEvent[] { return [...buffer]; }
export function clearBuffer() { buffer.length = 0; }
export function subscribe(fn: Listener) { listeners.add(fn); return () => listeners.delete(fn); }
export function configureFlush(intervalMs: number, handler: (events: TelemetryEvent[]) => void) {
  flushHandler = handler;
  if (flushTimer) clearInterval(flushTimer);
  if (intervalMs > 0) {
    flushTimer = setInterval(() => {
      if (!flushHandler || buffer.length === 0) return;
      const snapshot = buffer.splice(0, buffer.length);
      try { flushHandler(snapshot); } catch { /* noop */ }
    }, intervalMs) as unknown as number;
  }
}
