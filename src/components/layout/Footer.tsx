/**
 * @fileoverview Application footer component.
 *
 * Renders a footer bar containing copyright text and external links, both
 * sourced from the centralised branding configuration. This component
 * requires no props — it reads directly from `branding.footer`.
 *
 * @module components/layout/Footer
 *
 * @example
 * ```tsx
 * <Footer />
 * ```
 */

import { ExternalLink } from 'lucide-react';
import { branding } from '../../config/branding';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Application footer with copyright text and external links.
 *
 * **Design notes:**
 * - Uses CSS custom properties (`var(--color-*)`) for theme-aware colours.
 * - Links open in a new tab (`target="_blank"`) with `rel="noopener noreferrer"`
 *   for security.
 * - Each link is accompanied by a small {@link ExternalLink} icon to
 *   indicate external navigation.
 * - Fully responsive: on narrow viewports the links wrap below the
 *   copyright text; on wider viewports they sit side-by-side.
 *
 * **Accessibility:**
 * - The footer uses the semantic `<footer>` element.
 * - External-link icons are marked `aria-hidden` since the link text
 *   already conveys the destination.
 *
 * @returns The rendered footer element.
 */
export default function Footer() {
  return (
    <footer
      className="mt-auto w-full"
      style={{
        borderTop: '1px solid var(--color-border, #e5e7eb)',
        backgroundColor: 'var(--color-footer-bg, var(--color-surface, #f9fafb))',
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
        {/* ----------------------------------------------------------------
         * Left: copyright text
         * -------------------------------------------------------------- */}
        <p
          className="text-sm"
          style={{ color: 'var(--color-muted, #6b7280)' }}
        >
          {branding.footer.text}
        </p>

        {/* ----------------------------------------------------------------
         * Right: external links
         * -------------------------------------------------------------- */}
        {branding.footer.links.length > 0 && (
          <nav aria-label="Footer links" className="flex items-center gap-4">
            {branding.footer.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm transition-opacity duration-200 hover:opacity-70"
                style={{ color: 'var(--color-primary, #6366f1)' }}
              >
                {link.label}
                <ExternalLink size={14} strokeWidth={2} aria-hidden="true" />
              </a>
            ))}
          </nav>
        )}
      </div>
    </footer>
  );
}
