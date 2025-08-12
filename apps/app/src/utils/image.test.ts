import { computeResizeDimensions } from './image';

// Unit tests are deterministic and pure for dimension math.

describe('computeResizeDimensions', () => {
  it('returns original size when within maxDim', () => {
    const r = computeResizeDimensions(400, 300, 800);
    expect(r).toEqual({ width: 400, height: 300, scale: 1 });
  });
  it('scales down landscape proportionally', () => {
    const r = computeResizeDimensions(4000, 2000, 800);
    expect(r).toEqual({ width: 800, height: 400, scale: 0.2 });
  });
  it('scales down portrait proportionally', () => {
    const r = computeResizeDimensions(1000, 3000, 1000);
    expect(r).toEqual({ width: 333, height: 1000, scale: 1/3 });
  });
  it('handles zero/invalid', () => {
    const r = computeResizeDimensions(0, 0, 800);
    expect(r).toEqual({ width: 0, height: 0, scale: 0 });
  });
});
