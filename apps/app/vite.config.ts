import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Workaround: dependency attempts to import 'three/webgpu' (not present in three 0.165)
      // Provide empty shim so Vite doesn't error; safe since we don't use WebGPU.
      'three/webgpu': path.resolve(__dirname, 'src/shims/three-webgpu.ts'),
    },
  },
});
