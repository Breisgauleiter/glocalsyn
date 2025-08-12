export type ResizeOptions = {
  maxDim?: number;
  mime?: string; // e.g., 'image/jpeg'
  quality?: number; // 0..1
};

/**
 * Pure helper to compute target dimensions preserving aspect ratio.
 */
export function computeResizeDimensions(srcW: number, srcH: number, maxDim: number = 800) {
  if (srcW <= 0 || srcH <= 0) return { width: 0, height: 0, scale: 0 };
  const maxSrc = Math.max(srcW, srcH);
  const scale = maxSrc > maxDim ? maxDim / maxSrc : 1;
  const width = Math.round(srcW * scale);
  const height = Math.round(srcH * scale);
  return { width, height, scale };
}

/**
 * Browser helper: resize image file to DataURL using createImageBitmap + canvas.
 * Falls back to FileReader if bitmap/canvas fails.
 */
export async function fileToResizedDataURL(file: File, opts: ResizeOptions = {}): Promise<string> {
  const { maxDim = 800, mime = 'image/jpeg', quality = 0.8 } = opts;
  try {
    // @ts-ignore - global in browser
    const bitmap = await (globalThis as any).createImageBitmap(file);
    const { width, height } = computeResizeDimensions(bitmap.width, bitmap.height, maxDim);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.drawImage(bitmap as any, 0, 0, width, height);
    return canvas.toDataURL(mime, quality);
  } catch {
    // Fallback: no resize, just DataURL
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
}
