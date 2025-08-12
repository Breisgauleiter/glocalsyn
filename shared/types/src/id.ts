// ID generation utilities (no external deps)
// Monotonic-ish, URL-safe base36 string: <time><counter><rand>
let lastTs = 0;
let perMsCounter = 0;

function pad2(n: number) { return n.toString(36).padStart(2, '0'); }

export function generateId(): string {
  const now = Date.now();
  if (now === lastTs) perMsCounter++; else { lastTs = now; perMsCounter = 0; }
  const timePart = now.toString(36); // ~8-9 chars today
  const counterPart = pad2(perMsCounter % (36 * 36)); // 2 chars
  const randPart = Math.random().toString(36).slice(2, 8); // 6 chars entropy
  return `${timePart}${counterPart}${randPart}`; // ~16-17 chars
}

export function isLikelyId(id: string): boolean {
  return /^[0-9a-z]+$/.test(id) && id.length >= 12 && id.length <= 30;
}

export function compareIds(a: string, b: string): number { return a === b ? 0 : a < b ? -1 : 1; }
