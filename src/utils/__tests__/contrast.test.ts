import { describe, it, expect } from 'vitest';
import { hexToRgb, getLuminance, getContrastRatio, hasAdequateContrast } from '../contrast';

// ---------------------------------------------------------------------------
// hexToRgb
// ---------------------------------------------------------------------------
describe('hexToRgb', () => {
  it('converts a 6-digit hex with # prefix', () => {
    expect(hexToRgb('#ff0000')).toEqual([255, 0, 0]);
  });

  it('converts a 6-digit hex without # prefix', () => {
    expect(hexToRgb('00ff00')).toEqual([0, 255, 0]);
  });

  it('converts a 3-digit shorthand hex', () => {
    expect(hexToRgb('#abc')).toEqual([170, 187, 204]);
  });

  it('converts a 3-digit shorthand without #', () => {
    expect(hexToRgb('f00')).toEqual([255, 0, 0]);
  });

  it('converts black', () => {
    expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
  });

  it('converts white', () => {
    expect(hexToRgb('#ffffff')).toEqual([255, 255, 255]);
  });

  it('is case-insensitive', () => {
    expect(hexToRgb('#FF00FF')).toEqual([255, 0, 255]);
    expect(hexToRgb('#ff00ff')).toEqual([255, 0, 255]);
  });

  it('throws for invalid hex string', () => {
    expect(() => hexToRgb('#xyz')).toThrow('Invalid hex colour');
  });

  it('throws for wrong length', () => {
    expect(() => hexToRgb('#abcde')).toThrow('Invalid hex colour');
  });

  it('throws for empty string', () => {
    expect(() => hexToRgb('')).toThrow('Invalid hex colour');
  });
});

// ---------------------------------------------------------------------------
// getLuminance
// ---------------------------------------------------------------------------
describe('getLuminance', () => {
  it('returns 1 for white', () => {
    expect(getLuminance([255, 255, 255])).toBeCloseTo(1.0, 4);
  });

  it('returns 0 for black', () => {
    expect(getLuminance([0, 0, 0])).toBeCloseTo(0.0, 4);
  });

  it('returns correct luminance for pure red', () => {
    // Red coefficient is 0.2126
    const lum = getLuminance([255, 0, 0]);
    expect(lum).toBeGreaterThan(0);
    expect(lum).toBeLessThan(0.25);
  });

  it('returns correct luminance for pure green', () => {
    // Green coefficient is 0.7152 -- highest
    const lum = getLuminance([0, 255, 0]);
    expect(lum).toBeGreaterThan(0.7);
    expect(lum).toBeLessThan(0.75);
  });

  it('returns correct luminance for pure blue', () => {
    // Blue coefficient is 0.0722 -- lowest
    const lum = getLuminance([0, 0, 255]);
    expect(lum).toBeGreaterThan(0.05);
    expect(lum).toBeLessThan(0.08);
  });

  it('returns a value between 0 and 1 for mid-gray', () => {
    const lum = getLuminance([128, 128, 128]);
    expect(lum).toBeGreaterThan(0);
    expect(lum).toBeLessThan(1);
  });
});

// ---------------------------------------------------------------------------
// getContrastRatio
// ---------------------------------------------------------------------------
describe('getContrastRatio', () => {
  it('returns 21 for black vs white', () => {
    expect(getContrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
  });

  it('returns 1 for identical colours', () => {
    expect(getContrastRatio('#336699', '#336699')).toBeCloseTo(1, 2);
  });

  it('is symmetrical (order of arguments does not matter)', () => {
    const ratio1 = getContrastRatio('#000000', '#ffffff');
    const ratio2 = getContrastRatio('#ffffff', '#000000');
    expect(ratio1).toBeCloseTo(ratio2, 4);
  });

  it('returns a value between 1 and 21', () => {
    const ratio = getContrastRatio('#336699', '#ffffff');
    expect(ratio).toBeGreaterThanOrEqual(1);
    expect(ratio).toBeLessThanOrEqual(21);
  });

  it('computes approximately correct ratio for #777 vs white', () => {
    const ratio = getContrastRatio('#777777', '#ffffff');
    expect(ratio).toBeCloseTo(4.48, 1);
  });
});

// ---------------------------------------------------------------------------
// hasAdequateContrast
// ---------------------------------------------------------------------------
describe('hasAdequateContrast', () => {
  it('returns true for black on white (21:1)', () => {
    expect(hasAdequateContrast('#000000', '#ffffff')).toBe(true);
  });

  it('returns false for low-contrast pair', () => {
    // Light gray on white has very low contrast
    expect(hasAdequateContrast('#cccccc', '#ffffff')).toBe(false);
  });

  it('uses default threshold of 4.5', () => {
    // #777 vs white is ~4.48 which is just below 4.5
    expect(hasAdequateContrast('#777777', '#ffffff')).toBe(false);
  });

  it('accepts a custom threshold', () => {
    // Same pair passes at a lower threshold
    expect(hasAdequateContrast('#777777', '#ffffff', 4.0)).toBe(true);
  });

  it('returns true for identical colours at threshold 1', () => {
    expect(hasAdequateContrast('#abcdef', '#abcdef', 1)).toBe(true);
  });
});
