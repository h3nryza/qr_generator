/**
 * @fileoverview Default customization values for QR code generation.
 *
 * These defaults are used as the initial state for every new QR code and as
 * the base layer that template overrides are merged onto.
 *
 * @module config/defaults
 */

import type { QRCustomization } from '../types';

/**
 * Sensible default customization for a new QR code.
 *
 * Produces a clean black-on-white QR code at 300x300 px with rounded dots
 * and medium error correction — a good balance between density and
 * scan-reliability for most use cases.
 *
 * @example
 * ```ts
 * import { DEFAULT_CUSTOMIZATION } from '../config/defaults';
 *
 * // Merge template overrides on top of defaults
 * const merged = { ...DEFAULT_CUSTOMIZATION, ...template.customization };
 * ```
 */
export const DEFAULT_CUSTOMIZATION: QRCustomization = {
  /* Dimensions */
  width: 300,
  height: 300,
  margin: 10,

  /* Dots (data modules) */
  dotsColor: '#000000',
  dotsType: 'rounded',

  /* Corner squares (finder-pattern outer ring) */
  cornersSquareColor: '#000000',
  cornersSquareType: 'extra-rounded',

  /* Corner dots (finder-pattern centre) */
  cornersDotColor: '#000000',
  cornersDotType: 'dot',

  /* Background */
  backgroundColor: '#ffffff',

  /* Error correction — M (15%) is a good default */
  errorCorrectionLevel: 'M',
};

/**
 * Maximum number of history entries stored in localStorage.
 *
 * Older entries are evicted on a FIFO basis when this limit is reached.
 */
export const MAX_HISTORY_ENTRIES = 50;

/**
 * Maximum number of items allowed in a single batch job.
 */
export const MAX_BATCH_ITEMS = 100;

/**
 * Supported QR code sizes (width/height in pixels) offered in the UI.
 */
export const SIZE_PRESETS: readonly number[] = [
  200, 300, 400, 500, 600, 800, 1000, 1200,
] as const;

/**
 * Supported error-correction levels with human-readable labels.
 */
export const ERROR_CORRECTION_OPTIONS = [
  { value: 'L' as const, label: 'Low (7%)', description: 'Smallest QR code, least damage tolerance' },
  { value: 'M' as const, label: 'Medium (15%)', description: 'Good balance of size and reliability' },
  { value: 'Q' as const, label: 'Quartile (25%)', description: 'Better damage tolerance, slightly larger' },
  { value: 'H' as const, label: 'High (30%)', description: 'Best damage tolerance, recommended with logos' },
] as const;
