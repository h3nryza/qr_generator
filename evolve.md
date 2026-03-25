# Phase 1 Evolution

Future possibilities for the static QR code generator beyond the core V1 feature set.

---

## AI-Powered QR Art Generation

- Integrate Stable Diffusion or similar models to generate artistic QR codes that embed data within visually rich images.
- Offer a "style transfer" mode: the user uploads a reference image and the QR code adapts to match the aesthetic while remaining scannable.
- Run inference client-side via WebGPU/ONNX Runtime for privacy, or offer an optional cloud endpoint for higher quality.
- Include a scannability confidence score so users know whether their art QR will actually work.
- Pre-built art styles: watercolour, pixel art, geometric, typographic, photo-realistic.

## Browser Extension

- A lightweight Chrome/Firefox/Safari extension that generates a QR code for the current page URL with one click.
- Popup UI reuses the same React components from the main app, keeping the codebase unified.
- Right-click context menu: "Generate QR code for this link / image / selected text".
- Options page for default style preferences (colours, shape, logo).
- Publish to Chrome Web Store, Firefox Add-ons, and Safari Extensions Gallery.

## Desktop App (Tauri)

- Wrap the existing Vite + React app in Tauri for a native desktop experience on macOS, Windows, and Linux.
- Benefits over Electron: ~10 MB binary size vs ~150 MB, lower memory usage, native webview.
- Additional desktop features:
  - System tray icon with quick-generate from clipboard.
  - Global hotkey (e.g., `Ctrl+Shift+Q`) to generate a QR code from clipboard content.
  - Drag-and-drop QR code directly from the app into other applications.
  - File system integration for batch processing local CSV/JSON files.
  - Auto-update via Tauri's built-in updater.

## Mobile App (React Native)

- Share core logic (QR generation config, template system, colour utilities) via a shared TypeScript package.
- Native camera integration for scanning QR codes (dual-purpose app: generate and scan).
- Share sheet integration: generate a QR code from any app's share menu.
- Widget support: iOS home screen widget showing a favourite QR code, Android quick settings tile.
- Offline-first by design, matching the static web app's philosophy.

## Template Marketplace

- A curated library of QR code style templates: colour schemes, dot shapes, corner styles, logo placements.
- Free tier with community-contributed templates, premium tier with designer-crafted templates.
- Template format: JSON config files that can be imported/exported.
- Categories: business, social media, events, retail, restaurant, personal.
- Preview thumbnails auto-generated in CI from template configs.
- Revenue model: 70/30 split with template creators, or fully free and open source.

## QR Scanner / Reader

- Add a "Scan" tab alongside the "Generate" tab.
- Use the device camera via `getUserMedia` with a real-time scanning library (e.g., `jsQR` or `zxing-js`).
- Also support uploading an image file containing a QR code.
- Display decoded content with smart actions: open URL, copy text, connect to WiFi, add contact.
- Scan history stored locally with timestamps.
- Makes the app a complete QR code toolkit rather than just a generator.

## Print Layouts

- Pre-designed print templates for common use cases:
  - Business cards with QR code placement guides.
  - Table tent cards for restaurants (menu QR codes).
  - Event badges and lanyards.
  - Product labels (various sizes: 25mm, 50mm, 100mm).
  - Poster layouts with QR code and call-to-action text.
- Export as print-ready PDF with crop marks and bleed areas.
- Support for standard label sheet formats (Avery templates).
- CMYK colour output option for professional printing.

## Design Tool Plugins

### Figma Plugin
- Insert QR codes directly onto Figma frames.
- QR code updates live when the user changes the linked content.
- Respects Figma's colour styles and auto-layout.
- Publish to the Figma Community plugin directory.

### Canva Integration
- Canva Apps SDK integration for embedding the QR generator inside Canva's editor.
- Users select a QR style, enter content, and the QR code appears as a draggable element.
- Syncs with Canva's brand kit colours.

### Other Integrations
- Adobe XD plugin.
- Sketch plugin.
- PowerPoint / Google Slides add-on for presentations.

## Offline PWA

- Full Progressive Web App with service worker caching (see `recommendations.md` for implementation details).
- Works entirely offline after first visit since all generation is client-side.
- Background sync for saving preferences or templates when connectivity returns.
- App-like experience: no browser chrome, splash screen, native-feeling navigation.
- Target Lighthouse PWA score of 100.

## White-Label SaaS Kit

- Package the static generator as a self-contained, embeddable widget that any business can drop into their site.
- Configuration via a single `<script>` tag with data attributes or a JS config object:
  ```html
  <div id="qr-widget"
       data-brand-color="#6366f1"
       data-logo="/logo.png"
       data-default-type="url">
  </div>
  <script src="https://cdn.example.com/qr-widget.js"></script>
  ```
- Customisable: brand colours, logo, allowed QR types, export formats, UI language.
- No backend required for the basic kit (stays true to Phase 1 philosophy).
- Monetisation: free for personal use, paid licence for commercial embedding.
- Upgrade path: connect to the Phase 2 backend for dynamic QR codes and analytics.
