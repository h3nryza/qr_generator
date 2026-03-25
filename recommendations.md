# V1 Recommendations

Practical improvements for the Phase 1 static QR code generator, organised by category.

---

## Performance Optimisation

### Lazy Loading Heavy Components
- **Batch generator**: The batch import/generation module (`PapaParse`, bulk QR rendering) should be lazy-loaded behind `React.lazy()` and `Suspense`. Most users generate a single QR code per visit.
- **Export engine**: `jsPDF` is ~200 KB gzipped. Defer it until the user actually clicks an export button.
- **QR styling library**: Load `qr-code-styling` on demand after the user has entered content, not on initial page load.

### Code Splitting
- Split the app into three chunks: **core** (input + preview), **customisation** (colours, shapes, logo upload), and **export** (download, batch, PDF).
- Use Vite's `manualChunks` in `rollup` config to enforce chunk boundaries.
- Target a first-load bundle under **120 KB** gzipped.

### Service Worker
- Register a service worker via `vite-plugin-pwa` for asset caching.
- Cache the app shell, fonts, and static assets with a **cache-first** strategy.
- Use **network-first** for any future API calls or template fetches.
- This also lays the groundwork for full PWA support (see below).

### Image Optimisation
- Serve any raster assets in WebP/AVIF with `<picture>` fallbacks.
- Inline critical SVGs (like the favicon and UI icons) to avoid extra network requests.

---

## Accessibility

### ARIA Improvements
- Add `role="img"` and `aria-label` to the QR code canvas/SVG output so screen readers announce "Generated QR code for [content]".
- Mark the customisation panel as `role="region"` with `aria-label="QR code customisation options"`.
- Use `aria-live="polite"` on the preview area so screen readers announce when a new QR code is rendered.
- Ensure all colour pickers have associated `<label>` elements and announce selected values.

### Keyboard Navigation
- All interactive controls must be reachable via `Tab` in a logical order.
- Add `Escape` to close any modals or expanded panels.
- Implement keyboard shortcuts:
  - `Ctrl/Cmd + Enter` — Generate / refresh QR code
  - `Ctrl/Cmd + S` — Download current QR code
  - `Ctrl/Cmd + Shift + S` — Open export options
  - `Ctrl/Cmd + Z` / `Ctrl/Cmd + Shift + Z` — Undo / Redo (see UX section)

### Screen Reader Testing
- Test with VoiceOver (macOS/iOS), NVDA (Windows), and TalkBack (Android).
- Validate against WCAG 2.1 AA using `axe-core` in CI.
- Add a skip-to-main-content link for keyboard users.

### Colour Contrast
- Ensure all UI text meets a **4.5:1** contrast ratio minimum.
- Warn users if their chosen QR code foreground/background colour combination results in poor scannability (contrast below 3:1).

---

## SEO

### Structured Data
- Add `WebApplication` JSON-LD schema to the page head:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "QR Code Generator",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Any",
    "offers": { "@type": "Offer", "price": "0" }
  }
  ```

### Open Graph & Social Tags
- Set `og:title`, `og:description`, `og:image` (a branded preview image), and `og:url`.
- Add `twitter:card` as `summary_large_image`.
- Generate the OG image once and place it in `/public/og-image.png` (1200x630).

### Sitemap & Robots
- Create a `sitemap.xml` with the single-page URL and `lastmod` date.
- Add a `robots.txt` allowing all crawlers.
- Set a canonical URL in the `<head>`.

### Meta Tags
- Write a compelling `<meta name="description">` under 160 characters.
- Add a `<meta name="theme-color" content="#6366f1">` matching the brand.

---

## PWA (Progressive Web App)

### Manifest
- Create `manifest.json` with:
  - `name`, `short_name`, `description`
  - `start_url: "/"`
  - `display: "standalone"`
  - `theme_color: "#6366f1"`, `background_color: "#ffffff"`
  - Icons at 192x192 and 512x512 (generate from the SVG favicon).

### Offline Support
- The service worker (see Performance section) should cache all assets needed for offline generation.
- QR code generation is entirely client-side, so the app can work fully offline once cached.
- Show a subtle "You're offline — everything still works" banner when connectivity drops.

### Install Prompt
- Listen for the `beforeinstallprompt` event.
- Show a non-intrusive install banner after the user has generated at least one QR code (indicating engagement).
- Dismiss permanently if the user declines.

---

## UX Improvements

### Undo / Redo
- Maintain a history stack of QR code configurations (content, colours, shape, logo).
- Limit to 20 states to keep memory usage reasonable.
- Wire to `Ctrl/Cmd + Z` and `Ctrl/Cmd + Shift + Z`.
- Show undo/redo buttons in the toolbar with disabled state when the stack is empty.

### Keyboard Shortcuts
- Display a shortcut reference via `?` or `Ctrl/Cmd + /`.
- Keep shortcuts discoverable with tooltips on hover (e.g., "Download (Ctrl+S)").

### Drag-and-Drop
- Allow users to drag and drop a logo image directly onto the QR preview area.
- Support dragging a CSV file onto the batch panel to start bulk generation.
- Show a visual drop zone with a dashed border and icon when dragging over valid areas.

### Other UX Wins
- **Live preview**: Update the QR code as the user types (debounced at 300ms).
- **Recent history**: Store the last 10 generated QR codes in `localStorage` for quick access.
- **Quick copy**: One-click copy QR code as PNG to clipboard via the Clipboard API.
- **Preset themes**: Offer 5-8 curated colour/style presets (e.g., "Corporate", "Neon", "Minimal").
- **Mobile optimisation**: Ensure the customisation panel collapses into a bottom sheet on small screens.

---

## Internationalisation (i18n) Strategy

### Approach
- Use `react-i18next` with JSON translation files per locale.
- Start with **English** as the default and add community-contributed translations.
- Store locale preference in `localStorage`.

### Implementation
- Extract all user-facing strings into a `locales/en.json` file.
- Use namespace separation: `common`, `generator`, `export`, `batch`.
- Lazy-load non-default locale files to keep initial bundle small.
- Detect browser language via `navigator.language` for automatic locale selection.

### Priority Languages
- English (default)
- Spanish, French, German, Portuguese, Japanese, Chinese (Simplified)
- Accept community PRs for additional languages.

---

## Analytics (Privacy-Respecting)

### Recommended Options
| Tool | Privacy | Cost | Notes |
|---|---|---|---|
| **Plausible** | No cookies, GDPR-compliant | $9/mo or self-hosted free | Best balance of insight and privacy |
| **Umami** | No cookies, open source | Self-hosted free | Good if you already have a server |
| **Fathom** | No cookies, GDPR-compliant | $14/mo | Simple dashboard |
| **GoatCounter** | No cookies, open source | Free for non-commercial | Minimal, lightweight |

### What to Track
- Page views and unique visitors (no personal data).
- QR code generation events (content type: URL, text, WiFi, etc.).
- Export format usage (PNG, SVG, PDF).
- Feature engagement (batch mode, logo upload, colour customisation).
- Do **not** track QR code content itself.

### Implementation
- Add analytics as an optional, lazy-loaded script.
- Respect `Do Not Track` headers.
- No cookie banner needed if using a cookieless provider.

---

## Community Features

### Template Sharing
- Allow users to save QR code style configurations as shareable JSON templates.
- Encode templates as URL query parameters for zero-backend sharing (e.g., `?template=base64...`).
- Create a `/templates` gallery page with curated community submissions.

### Contribution Workflow
- Accept template submissions via GitHub PRs to a `templates/` directory.
- Each template is a JSON file with metadata: name, author, preview image, config.
- Automated validation in CI ensures templates render correctly.

### Future Community Ideas
- GitHub Discussions for feature requests and showcases.
- A "Made with QR Generator" showcase page.
- Badge/embed code so users can link back to the tool.
