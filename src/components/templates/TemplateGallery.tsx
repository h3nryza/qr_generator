/**
 * @fileoverview Template gallery component for browsing and applying
 * pre-designed QR code styles.
 *
 * Displays a filterable grid of template cards. Each card shows a coloured
 * preview swatch representing the template's dot and background colours,
 * along with the template name and description. Clicking a card applies
 * the template's partial customization overrides.
 *
 * @module components/templates/TemplateGallery
 *
 * @example
 * ```tsx
 * <TemplateGallery
 *   onApply={(overrides) => setCustomization((prev) => ({ ...prev, ...overrides }))}
 * />
 * ```
 */

import { useState, useMemo } from 'react';
import { Palette } from 'lucide-react';
import { TEMPLATES, getTemplatesByCategory } from '../../config/templates';
import type { QRCustomization, QRTemplate } from '../../types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Props accepted by the {@link TemplateGallery} component.
 */
interface TemplateGalleryProps {
  /**
   * Called when the user clicks a template card to apply it.
   *
   * Receives a partial customization object that should be merged onto the
   * current customization state.
   *
   * @param customization - Partial overrides from the selected template.
   */
  onApply: (customization: Partial<QRCustomization>) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Category filter options displayed as tabs above the template grid.
 *
 * `'all'` is a virtual category that shows every template regardless of
 * its actual category.
 */
const CATEGORY_TABS = [
  { key: 'all', label: 'All' },
  { key: 'business', label: 'Business' },
  { key: 'social', label: 'Social' },
  { key: 'payment', label: 'Payment' },
  { key: 'creative', label: 'Creative' },
  { key: 'minimal', label: 'Minimal' },
] as const;

/** Union type of valid category filter keys. */
type CategoryKey = (typeof CATEGORY_TABS)[number]['key'];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * Props for the internal {@link TemplateCard} component.
 */
interface TemplateCardProps {
  /** The template to render. */
  template: QRTemplate;
  /** Callback invoked when the card is clicked. */
  onApply: (customization: Partial<QRCustomization>) => void;
}

/**
 * A single template card in the gallery grid.
 *
 * Displays:
 * - A coloured preview swatch composed of a background rectangle and a
 *   smaller foreground (dots colour) square centred inside it.
 * - The template name.
 * - A short description.
 *
 * The entire card is clickable and applies the template on click.
 *
 * @param props - Card props.
 * @returns The rendered template card.
 */
function TemplateCard({ template, onApply }: TemplateCardProps) {
  /** Extract the most representative colours from the template. */
  const bgColor = template.customization.backgroundColor ?? '#ffffff';
  const dotsColor = template.customization.dotsColor ?? '#000000';
  const cornerColor = template.customization.cornersSquareColor ?? dotsColor;

  return (
    <button
      type="button"
      onClick={() => onApply(template.customization)}
      className="group flex flex-col overflow-hidden rounded-xl text-left transition-all duration-200 hover:shadow-md"
      style={{
        border: '1px solid var(--color-border, #e5e7eb)',
        backgroundColor: 'var(--color-surface, #ffffff)',
      }}
      aria-label={`Apply ${template.name} template`}
    >
      {/* ----------------------------------------------------------------
       * Colour preview swatch
       * -------------------------------------------------------------- */}
      <div
        className="relative flex h-28 w-full items-center justify-center"
        style={{ backgroundColor: bgColor }}
      >
        {/* Simulated QR dot pattern — three small squares arranged to
            hint at finder patterns and a data region. */}
        <div className="flex items-center gap-1.5">
          {/* Top-left finder pattern representative */}
          <div
            className="h-6 w-6 rounded-sm"
            style={{ backgroundColor: cornerColor }}
          />
          {/* Centre dots area */}
          <div className="grid grid-cols-3 gap-0.5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-[1px]"
                style={{
                  backgroundColor: dotsColor,
                  opacity: [0, 2, 4, 6, 8].includes(i) ? 1 : 0.5,
                }}
              />
            ))}
          </div>
          {/* Bottom-right finder pattern representative */}
          <div
            className="h-6 w-6 rounded-sm"
            style={{ backgroundColor: cornerColor }}
          />
        </div>
      </div>

      {/* ----------------------------------------------------------------
       * Text content
       * -------------------------------------------------------------- */}
      <div className="flex flex-col gap-1 p-3">
        <span
          className="text-sm font-semibold"
          style={{ color: 'var(--color-text, #111827)' }}
        >
          {template.name}
        </span>
        <span
          className="line-clamp-2 text-xs leading-relaxed"
          style={{ color: 'var(--color-muted, #6b7280)' }}
        >
          {template.description}
        </span>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * Template picker grid with category filter tabs.
 *
 * **Layout:**
 * - A horizontal row of category filter tabs at the top.
 * - A responsive CSS grid of {@link TemplateCard} components below.
 *
 * **Filtering:**
 * - Selecting "All" shows every template.
 * - Selecting a specific category filters the list via
 *   {@link getTemplatesByCategory}.
 *
 * **Performance:**
 * - The filtered template list is memoised to avoid unnecessary
 *   re-computation on re-renders that don't change the active category.
 *
 * @param props - Component props.
 * @returns The rendered template gallery.
 */
export default function TemplateGallery({ onApply }: TemplateGalleryProps) {
  /** Currently selected category filter tab. */
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');

  /**
   * The filtered list of templates based on the active category.
   *
   * When `'all'` is selected the full {@link TEMPLATES} array is used;
   * otherwise {@link getTemplatesByCategory} performs the filtering.
   */
  const filteredTemplates: readonly QRTemplate[] = useMemo(() => {
    if (activeCategory === 'all') return TEMPLATES;
    return getTemplatesByCategory(activeCategory);
  }, [activeCategory]);

  return (
    <div className="flex flex-col gap-5">
      {/* ---------------------------------------------------------------
       * Section header
       * ------------------------------------------------------------- */}
      <div className="flex items-center gap-2">
        <Palette
          size={20}
          strokeWidth={2}
          style={{ color: 'var(--color-primary, #6366f1)' }}
          aria-hidden="true"
        />
        <h2
          className="text-base font-semibold"
          style={{ color: 'var(--color-text, #111827)' }}
        >
          Templates
        </h2>
      </div>

      {/* ---------------------------------------------------------------
       * Category filter tabs
       * ------------------------------------------------------------- */}
      <nav
        aria-label="Template categories"
        className="flex flex-wrap gap-2"
      >
        {CATEGORY_TABS.map((tab) => {
          const isActive = activeCategory === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveCategory(tab.key)}
              aria-pressed={isActive}
              className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200"
              style={{
                backgroundColor: isActive
                  ? 'var(--color-primary, #6366f1)'
                  : 'var(--color-surface, #f3f4f6)',
                color: isActive
                  ? '#ffffff'
                  : 'var(--color-text, #374151)',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* ---------------------------------------------------------------
       * Template grid
       * ------------------------------------------------------------- */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onApply={onApply}
            />
          ))}
        </div>
      ) : (
        /* Empty state for a category with no templates. */
        <div className="flex flex-col items-center justify-center py-10">
          <Palette
            size={40}
            strokeWidth={1.5}
            style={{ color: 'var(--color-muted, #9ca3af)' }}
            aria-hidden="true"
          />
          <p
            className="mt-3 text-sm"
            style={{ color: 'var(--color-muted, #9ca3af)' }}
          >
            No templates in this category
          </p>
        </div>
      )}
    </div>
  );
}
