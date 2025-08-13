import '@testing-library/jest-dom';

// Filter noisy React Router future flag warnings during tests (until lib upgrade).
const origWarn = console.warn;
console.warn = (...args: any[]) => {
	const msg = args[0];
	if (typeof msg === 'string' && msg.includes('React Router Future Flag Warning')) return;
	origWarn(...args);
};

// Keep act() warnings visible (we address them in tests instead of suppressing).

// Lightweight mocks for canvas & image bitmap used in photo proof resizing
(global as any).createImageBitmap = async () => ({ width: 100, height: 50 });
if (typeof HTMLCanvasElement !== 'undefined') {
	const proto = HTMLCanvasElement.prototype as any;
	try { Object.defineProperty(proto, 'getContext', { value: () => ({ drawImage: () => {} }), configurable: true }); } catch { proto.getContext = () => ({ drawImage: () => {} }); }
	try { Object.defineProperty(proto, 'toDataURL', { value: () => 'data:image/png;base64,iVBORw==', configurable: true }); } catch { proto.toDataURL = () => 'data:image/png;base64,iVBORw=='; }
}
// Aggressive cleanup between tests to avoid OOM in CI (jsdom can leak detached DOM trees with large test suites)
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
afterEach(() => {
	// Unmount rendered trees first so JSDOM nodes can be GC'd
	try { cleanup(); } catch { /* ignore */ }
	try { localStorage.clear(); sessionStorage.clear(); } catch { /* ignore */ }
	if (typeof globalThis.gc === 'function') {
		try { (globalThis as any).gc(); } catch { /* ignore */ }
	}
});
