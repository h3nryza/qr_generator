/**
 * @fileoverview Pre-designed QR code templates.
 *
 * Each template provides a partial {@link QRCustomization} override that is
 * merged on top of {@link DEFAULT_CUSTOMIZATION} when the user selects it.
 * Templates are grouped by category for easy browsing in the template picker.
 *
 * @module config/templates
 */

import type { QRTemplate } from '../types';

/**
 * Built-in collection of 12 QR code style templates.
 *
 * Templates cover five categories:
 * - **business** — Corporate Blue, Elegant Dark
 * - **social** — Social Media Pink, Neon Purple
 * - **payment** — Payment Gold, Ocean Teal
 * - **creative** — Sunset Gradient, Fire Red, Pastel Rainbow, Tech Grid
 * - **minimal** — Minimal Black, Nature Green
 */
export const TEMPLATES: readonly QRTemplate[] = [
  // ---------------------------------------------------------------------------
  // Business
  // ---------------------------------------------------------------------------
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    description: 'Professional blue tones suited for business cards and corporate materials.',
    category: 'business',
    customization: {
      dotsColor: '#1e40af',
      dotsType: 'classy-rounded',
      cornersSquareColor: '#1e3a8a',
      cornersSquareType: 'extra-rounded',
      cornersDotColor: '#2563eb',
      cornersDotType: 'dot',
      backgroundColor: '#f0f9ff',
    },
  },
  {
    id: 'elegant-dark',
    name: 'Elegant Dark',
    description: 'Sophisticated dark background with subtle warm-white dots.',
    category: 'business',
    customization: {
      dotsColor: '#fafaf9',
      dotsType: 'classy-rounded',
      cornersSquareColor: '#e7e5e4',
      cornersSquareType: 'extra-rounded',
      cornersDotColor: '#d6d3d1',
      cornersDotType: 'dot',
      backgroundColor: '#1c1917',
    },
  },

  // ---------------------------------------------------------------------------
  // Social
  // ---------------------------------------------------------------------------
  {
    id: 'social-media-pink',
    name: 'Social Media Pink',
    description: 'Vibrant pink gradient inspired by popular social platforms.',
    category: 'social',
    customization: {
      dotsColor: '#db2777',
      dotsGradient: {
        type: 'linear',
        rotation: 135,
        colorStops: [
          { offset: 0, color: '#ec4899' },
          { offset: 1, color: '#db2777' },
        ],
      },
      dotsType: 'dots',
      cornersSquareColor: '#be185d',
      cornersSquareType: 'extra-rounded',
      cornersDotColor: '#f472b6',
      cornersDotType: 'dot',
      backgroundColor: '#fff1f2',
    },
  },
  {
    id: 'neon-purple',
    name: 'Neon Purple',
    description: 'Eye-catching neon purple on a dark canvas.',
    category: 'social',
    customization: {
      dotsColor: '#a855f7',
      dotsGradient: {
        type: 'linear',
        rotation: 45,
        colorStops: [
          { offset: 0, color: '#7c3aed' },
          { offset: 1, color: '#c084fc' },
        ],
      },
      dotsType: 'extra-rounded',
      cornersSquareColor: '#7c3aed',
      cornersSquareType: 'extra-rounded',
      cornersDotColor: '#c084fc',
      cornersDotType: 'dot',
      backgroundColor: '#0f0720',
    },
  },

  // ---------------------------------------------------------------------------
  // Payment
  // ---------------------------------------------------------------------------
  {
    id: 'payment-gold',
    name: 'Payment Gold',
    description: 'Luxurious gold tones ideal for payment and crypto QR codes.',
    category: 'payment',
    customization: {
      dotsColor: '#b45309',
      dotsGradient: {
        type: 'linear',
        rotation: 180,
        colorStops: [
          { offset: 0, color: '#f59e0b' },
          { offset: 1, color: '#b45309' },
        ],
      },
      dotsType: 'classy',
      cornersSquareColor: '#92400e',
      cornersSquareType: 'square',
      cornersDotColor: '#d97706',
      cornersDotType: 'square',
      backgroundColor: '#fffbeb',
    },
  },
  {
    id: 'ocean-teal',
    name: 'Ocean Teal',
    description: 'Calm teal tones evoking trust and reliability.',
    category: 'payment',
    customization: {
      dotsColor: '#0d9488',
      dotsType: 'rounded',
      cornersSquareColor: '#115e59',
      cornersSquareType: 'extra-rounded',
      cornersDotColor: '#14b8a6',
      cornersDotType: 'dot',
      backgroundColor: '#f0fdfa',
    },
  },

  // ---------------------------------------------------------------------------
  // Creative
  // ---------------------------------------------------------------------------
  {
    id: 'sunset-gradient',
    name: 'Sunset Gradient',
    description: 'Warm orange-to-pink gradient reminiscent of a sunset sky.',
    category: 'creative',
    customization: {
      dotsColor: '#ea580c',
      dotsGradient: {
        type: 'linear',
        rotation: 135,
        colorStops: [
          { offset: 0, color: '#f97316' },
          { offset: 0.5, color: '#ef4444' },
          { offset: 1, color: '#ec4899' },
        ],
      },
      dotsType: 'dots',
      cornersSquareColor: '#dc2626',
      cornersSquareType: 'extra-rounded',
      cornersDotColor: '#f97316',
      cornersDotType: 'dot',
      backgroundColor: '#fff7ed',
    },
  },
  {
    id: 'fire-red',
    name: 'Fire Red',
    description: 'Bold red with high contrast for maximum visibility.',
    category: 'creative',
    customization: {
      dotsColor: '#dc2626',
      dotsType: 'square',
      cornersSquareColor: '#991b1b',
      cornersSquareType: 'square',
      cornersDotColor: '#ef4444',
      cornersDotType: 'square',
      backgroundColor: '#fef2f2',
    },
  },
  {
    id: 'pastel-rainbow',
    name: 'Pastel Rainbow',
    description: 'Playful pastel rainbow gradient for creative and fun use cases.',
    category: 'creative',
    customization: {
      dotsColor: '#8b5cf6',
      dotsGradient: {
        type: 'linear',
        rotation: 90,
        colorStops: [
          { offset: 0, color: '#f472b6' },
          { offset: 0.25, color: '#fb923c' },
          { offset: 0.5, color: '#facc15' },
          { offset: 0.75, color: '#4ade80' },
          { offset: 1, color: '#60a5fa' },
        ],
      },
      dotsType: 'dots',
      cornersSquareColor: '#8b5cf6',
      cornersSquareType: 'extra-rounded',
      cornersDotColor: '#ec4899',
      cornersDotType: 'dot',
      backgroundColor: '#fefce8',
    },
  },
  {
    id: 'tech-grid',
    name: 'Tech Grid',
    description: 'Sharp square modules on a dark grid — a cyberpunk / dev aesthetic.',
    category: 'creative',
    customization: {
      dotsColor: '#22d3ee',
      dotsType: 'square',
      cornersSquareColor: '#06b6d4',
      cornersSquareType: 'square',
      cornersDotColor: '#67e8f9',
      cornersDotType: 'square',
      backgroundColor: '#0c1222',
    },
  },

  // ---------------------------------------------------------------------------
  // Minimal
  // ---------------------------------------------------------------------------
  {
    id: 'minimal-black',
    name: 'Minimal Black',
    description: 'Clean black-on-white with rounded dots — simple and universally readable.',
    category: 'minimal',
    customization: {
      dotsColor: '#000000',
      dotsType: 'rounded',
      cornersSquareColor: '#000000',
      cornersSquareType: 'extra-rounded',
      cornersDotColor: '#000000',
      cornersDotType: 'dot',
      backgroundColor: '#ffffff',
    },
  },
  {
    id: 'nature-green',
    name: 'Nature Green',
    description: 'Earthy green tones for eco-friendly and organic branding.',
    category: 'minimal',
    customization: {
      dotsColor: '#15803d',
      dotsType: 'rounded',
      cornersSquareColor: '#166534',
      cornersSquareType: 'extra-rounded',
      cornersDotColor: '#22c55e',
      cornersDotType: 'dot',
      backgroundColor: '#f0fdf4',
    },
  },
] as const;

/**
 * Retrieve a template by its unique ID.
 *
 * @param id - The template ID to look up.
 * @returns The matching {@link QRTemplate}, or `undefined` if not found.
 */
export function getTemplateById(id: string): QRTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

/**
 * Filter templates by category.
 *
 * @param category - The category to filter on.
 * @returns An array of templates belonging to the given category.
 */
export function getTemplatesByCategory(
  category: QRTemplate['category'],
): QRTemplate[] {
  return TEMPLATES.filter((t) => t.category === category);
}
