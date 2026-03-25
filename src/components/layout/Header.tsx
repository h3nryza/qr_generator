/**
 * @fileoverview Application header component.
 *
 * Renders a sticky, backdrop-blurred header bar containing the application
 * name (sourced from the centralised branding configuration), a QR code
 * icon, and a dark-mode toggle button.
 *
 * @module components/layout/Header
 *
 * @example
 * ```tsx
 * <Header isDark={isDarkMode} onToggleDark={() => setIsDarkMode((d) => !d)} />
 * ```
 */

import { QrCode, Sun, Moon } from 'lucide-react';
import { branding } from '../../config/branding';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Props accepted by the {@link Header} component.
 */
interface HeaderProps {
  /** Whether dark mode is currently active. */
  isDark: boolean;

  /**
   * Callback invoked when the user clicks the dark-mode toggle.
   *
   * The parent component is responsible for persisting the preference
   * (e.g. in localStorage) and applying the appropriate class / CSS
   * custom property overrides.
   */
  onToggleDark: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Sticky application header with branding and dark-mode toggle.
 *
 * **Layout details:**
 * - Sticky-positioned at the top of the viewport with `z-50`.
 * - Semi-transparent background with `backdrop-blur` for a frosted-glass
 *   effect that lets underlying content bleed through when scrolled.
 * - A subtle bottom border visually separates the header from page content.
 *
 * **Accessibility:**
 * - The dark-mode toggle button has an `aria-label` that reflects the
 *   current state so screen readers announce the correct action.
 * - The branding icon is decorative and marked `aria-hidden`.
 *
 * @param props - Component props.
 * @returns The rendered header element.
 */
export default function Header({ isDark, onToggleDark }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-50 w-full backdrop-blur-md"
      style={{
        backgroundColor: 'var(--color-header-bg, rgba(255, 255, 255, 0.8))',
        borderBottom: '1px solid var(--color-border, #e5e7eb)',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* ----------------------------------------------------------------
         * Left: brand icon + application name
         * -------------------------------------------------------------- */}
        <div className="flex items-center gap-2">
          <QrCode
            size={28}
            strokeWidth={2}
            style={{ color: 'var(--color-primary, #6366f1)' }}
            aria-hidden="true"
          />
          <span
            className="text-lg font-semibold tracking-tight sm:text-xl"
            style={{ color: 'var(--color-text, #111827)' }}
          >
            {branding.appName}
          </span>
        </div>

        {/* ----------------------------------------------------------------
         * Right: dark-mode toggle
         * -------------------------------------------------------------- */}
        <button
          type="button"
          onClick={onToggleDark}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="inline-flex items-center justify-center rounded-lg p-2 transition-colors duration-200 hover:opacity-80"
          style={{
            color: 'var(--color-text, #111827)',
            backgroundColor: 'var(--color-toggle-bg, rgba(0, 0, 0, 0.05))',
          }}
        >
          {isDark ? (
            <Sun size={20} strokeWidth={2} aria-hidden="true" />
          ) : (
            <Moon size={20} strokeWidth={2} aria-hidden="true" />
          )}
        </button>
      </div>
    </header>
  );
}
