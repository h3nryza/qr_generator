/**
 * @fileoverview Application entry point.
 *
 * Responsibilities:
 * 1. Read the persisted dark-mode preference from `localStorage` and apply
 *    the `.dark` class to `<html>` before React renders, preventing a flash
 *    of incorrect theme.
 * 2. Mount the root React component inside `<div id="root">`.
 *
 * @module main
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';

// ---------------------------------------------------------------------------
// Dark-mode initialisation
// ---------------------------------------------------------------------------

/**
 * LocalStorage key used to persist the user's dark-mode preference.
 *
 * Possible stored values:
 * - `'true'`  — dark mode explicitly enabled
 * - `'false'` — dark mode explicitly disabled
 * - absent    — follow system preference (via `prefers-color-scheme`)
 */
const DARK_MODE_KEY = 'qr-generator-dark-mode';

/**
 * Determine the initial dark-mode state and apply it to `<html>`.
 *
 * Priority:
 * 1. Explicit user preference stored in localStorage.
 * 2. System-level `prefers-color-scheme: dark` media query.
 */
function applyInitialDarkMode(): void {
  const stored = localStorage.getItem(DARK_MODE_KEY);
  const prefersDark =
    stored !== null
      ? stored === 'true'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (prefersDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

applyInitialDarkMode();

// ---------------------------------------------------------------------------
// React mount
// ---------------------------------------------------------------------------

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Root element not found. Ensure index.html contains <div id="root"></div>.',
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
