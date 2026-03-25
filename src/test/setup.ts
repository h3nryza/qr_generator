/**
 * @fileoverview Vitest / Testing Library setup.
 *
 * This file is loaded before every test suite via the `setupFiles` option in
 * `vite.config.ts`. It bootstraps `@testing-library/jest-dom` which provides
 * custom DOM matchers such as `toBeInTheDocument()`, `toHaveTextContent()`,
 * `toBeVisible()`, etc.
 *
 * @module test/setup
 */

import '@testing-library/jest-dom';
