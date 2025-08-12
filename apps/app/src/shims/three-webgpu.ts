// Stub module for 'three/webgpu' to satisfy downstream optional imports.
// Provide a minimal no-op WebGPURenderer class so tree-shaking / consumers don't crash.
export class WebGPURenderer {
	constructor(..._args: any[]) {
		// no-op
	}
	setSize() { /* no-op */ }
	render() { /* no-op */ }
	// any property accesses should be harmless
}
