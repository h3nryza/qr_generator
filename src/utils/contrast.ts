/**
 * @fileoverview Colour contrast utilities for QR code accessibility.
 *
 * Implements the WCAG 2.x relative-luminance and contrast-ratio algorithms
 * so the application can warn users when their QR code colour choices may
 * result in poor scan-ability or accessibility issues.
 *
 * @module utils/contrast
 *
 * @see {@link https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio | WCAG 2.1 Contrast Ratio}
 * @see {@link https://www.w3.org/TR/WCAG21/#dfn-relative-luminance | WCAG 2.1 Relative Luminance}
 *
 * @example
 * ```ts
 * import { hasAdequateContrast, getContrastRatio } from '../utils/contrast';
 *
 * const ok = hasAdequateContrast('#000000', '#ffffff'); // true (21:1)
 * const ratio = getContrastRatio('#336699', '#ffffff');  // ~4.17
 * ```
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * An RGB colour represented as a three-element tuple in the range 0-255.
 */
export type RGB = [r: number, g: number, b: number];

// ---------------------------------------------------------------------------
// Hex ↔ RGB conversion
// ---------------------------------------------------------------------------

/**
 * Converts a CSS hex colour string to an {@link RGB} tuple.
 *
 * Supports both 3-digit shorthand (`'#abc'`) and 6-digit (`'#aabbcc'`)
 * formats, with or without a leading `#`.
 *
 * @param hex - The hex colour string (e.g. `'#ff0000'`, `'#f00'`, `'ff0000'`).
 * @returns An `[r, g, b]` tuple with values in the 0-255 range.
 * @throws {Error} If the input string is not a valid 3- or 6-digit hex colour.
 *
 * @example
 * ```ts
 * hexToRgb('#ff0000'); // [255, 0, 0]
 * hexToRgb('#abc');     // [170, 187, 204]
 * hexToRgb('000000');   // [0, 0, 0]
 * ```
 */
export function hexToRgb(hex: string): RGB {
  // Strip leading '#' if present
  let cleaned = hex.replace(/^#/, '');

  // Expand 3-digit shorthand to 6 digits
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map((c) => c + c)
      .join('');
  }

  if (cleaned.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    throw new Error(`Invalid hex colour: "${hex}". Expected 3 or 6 hex digits.`);
  }

  const num = parseInt(cleaned, 16);
  return [(num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff];
}

// ---------------------------------------------------------------------------
// Luminance
// ---------------------------------------------------------------------------

/**
 * Linearises a single sRGB channel value (0-255) to the linear-light scale
 * used in the WCAG relative-luminance formula.
 *
 * @param channel - An 8-bit sRGB channel value (0-255).
 * @returns The linearised value in the range 0-1.
 *
 * @see {@link https://www.w3.org/TR/WCAG21/#dfn-relative-luminance}
 *
 * @internal
 */
function linearise(channel: number): number {
  const s = channel / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/**
 * Calculates the **relative luminance** of a colour as defined by WCAG 2.1.
 *
 * The formula applies the sRGB gamma-expansion and then weights the channels
 * according to human perception: `L = 0.2126·R + 0.7152·G + 0.0722·B`.
 *
 * @param rgb - An `[r, g, b]` tuple with values in the 0-255 range.
 * @returns The relative luminance in the range 0 (darkest) to 1 (lightest).
 *
 * @example
 * ```ts
 * getLuminance([255, 255, 255]); // 1.0
 * getLuminance([0, 0, 0]);       // 0.0
 * ```
 */
export function getLuminance(rgb: RGB): number {
  const [r, g, b] = rgb.map(linearise);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// ---------------------------------------------------------------------------
// Contrast ratio
// ---------------------------------------------------------------------------

/**
 * Computes the **contrast ratio** between two colours as defined by WCAG 2.1.
 *
 * The ratio ranges from 1:1 (identical colours) to 21:1 (black vs. white).
 * The order of the arguments does not matter — the lighter colour is
 * automatically placed in the numerator.
 *
 * @param hexA - First colour as a CSS hex string (e.g. `'#000000'`).
 * @param hexB - Second colour as a CSS hex string (e.g. `'#ffffff'`).
 * @returns The contrast ratio as a number (e.g. `4.5`, `21`).
 *
 * @example
 * ```ts
 * getContrastRatio('#000000', '#ffffff'); // 21
 * getContrastRatio('#777777', '#ffffff'); // ~4.48
 * ```
 */
export function getContrastRatio(hexA: string, hexB: string): number {
  const lumA = getLuminance(hexToRgb(hexA));
  const lumB = getLuminance(hexToRgb(hexB));

  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);

  return (lighter + 0.05) / (darker + 0.05);
}

// ---------------------------------------------------------------------------
// Adequacy check
// ---------------------------------------------------------------------------

/**
 * Determines whether two colours have **adequate contrast** for QR code
 * scan-ability, based on WCAG AA guidelines.
 *
 * The default threshold is **4.5:1** (WCAG AA for normal text). For QR codes,
 * this threshold provides a good balance between visual style freedom and
 * reliable scanning across different devices and lighting conditions.
 *
 * @param foreground - Foreground (dots) colour as a CSS hex string.
 * @param background - Background colour as a CSS hex string.
 * @param threshold  - Minimum acceptable contrast ratio (defaults to `4.5`).
 * @returns `true` if the contrast ratio meets or exceeds the threshold.
 *
 * @example
 * ```ts
 * hasAdequateContrast('#000000', '#ffffff');          // true  (21:1)
 * hasAdequateContrast('#777777', '#ffffff');           // false (~4.48:1 < 4.5)
 * hasAdequateContrast('#777777', '#ffffff', 4.0);     // true  (~4.48:1 >= 4.0)
 * ```
 */
export function hasAdequateContrast(
  foreground: string,
  background: string,
  threshold: number = 4.5,
): boolean {
  return getContrastRatio(foreground, background) >= threshold;
}
