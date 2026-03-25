/**
 * @fileoverview Custom React hook for managing dark-mode state.
 *
 * Persists the user's preference to `localStorage` under the key
 * `'qr-generator-dark-mode'`. On the very first visit (no stored value)
 * the hook respects the operating system's `prefers-color-scheme` media query.
 *
 * The hook synchronises the `'dark'` CSS class on `document.documentElement`
 * so Tailwind CSS dark-mode utilities (e.g. `dark:bg-gray-900`) work
 * out of the box.
 *
 * @module hooks/useDarkMode
 *
 * @example
 * ```tsx
 * function Header() {
 *   const [isDark, toggleDark] = useDarkMode();
 *   return (
 *     <button onClick={toggleDark}>
 *       {isDark ? 'Switch to Light' : 'Switch to Dark'}
 *     </button>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react';

/** localStorage key used to persist dark-mode preference. */
const STORAGE_KEY = 'qr-generator-dark-mode';

/** CSS class toggled on `<html>` to activate Tailwind dark mode. */
const DARK_CLASS = 'dark';

/**
 * Reads the initial dark-mode value.
 *
 * Priority order:
 * 1. Explicit value in `localStorage` (user previously toggled).
 * 2. OS-level preference via `prefers-color-scheme: dark`.
 * 3. Defaults to `false` (light mode).
 *
 * @returns `true` if dark mode should be active on initial load.
 */
function getInitialValue(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      return stored === 'true';
    }
  } catch {
    // localStorage unavailable — fall through to media query.
  }

  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  return false;
}

/**
 * Applies or removes the `'dark'` class on the root `<html>` element.
 *
 * @param isDark - Whether dark mode is currently active.
 */
function applyClass(isDark: boolean): void {
  const root = document.documentElement;
  if (isDark) {
    root.classList.add(DARK_CLASS);
  } else {
    root.classList.remove(DARK_CLASS);
  }
}

/**
 * Persists the dark-mode preference to `localStorage`.
 *
 * Fails silently when storage is unavailable (e.g. private browsing quota
 * exceeded).
 *
 * @param isDark - The value to persist.
 */
function persistValue(isDark: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(isDark));
  } catch {
    // Storage full or unavailable — preference lives only in memory.
  }
}

/**
 * React hook that manages the application's dark-mode state.
 *
 * **Behaviour:**
 * - On mount, reads the stored preference (or infers from OS settings).
 * - Synchronises the `'dark'` CSS class on `<html>` whenever the value changes.
 * - Persists every toggle to `localStorage` so it survives page reloads.
 * - Listens to the OS `prefers-color-scheme` media query; if the user has
 *   never explicitly toggled, the hook tracks OS changes in real time.
 *
 * @returns A tuple `[isDark, toggleDark]`:
 *  - `isDark`     — `true` when dark mode is active.
 *  - `toggleDark` — Callback that flips the current value.
 */
export function useDarkMode(): [boolean, () => void] {
  const [isDark, setIsDark] = useState<boolean>(getInitialValue);

  // Apply class + persist whenever isDark changes
  useEffect(() => {
    applyClass(isDark);
    persistValue(isDark);
  }, [isDark]);

  // Listen for OS-level theme changes (only applies when no explicit choice stored)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');

    /**
     * Handles OS-level colour-scheme changes.
     *
     * Only updates state if the user has not previously made an explicit choice
     * (i.e. no value in localStorage).
     *
     * @param e - The MediaQueryListEvent from the colour-scheme query.
     */
    const handler = (e: MediaQueryListEvent) => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) return; // User made an explicit choice — ignore OS changes
      } catch {
        // localStorage unavailable — track OS preference
      }
      setIsDark(e.matches);
    };

    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  /**
   * Toggles dark mode on/off and persists the new value.
   */
  const toggleDark = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  return [isDark, toggleDark];
}
