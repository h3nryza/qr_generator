# QR Generator

A fully-featured, client-side QR code generator with 15 QR types, extensive visual customization, and white-label support — all running entirely in the browser.

## Features

### 15 QR Code Types

| Type | Description |
|---|---|
| URL | Links with UTM parameter builder |
| Text | Multi-line plain text |
| Email | mailto: with CC/BCC/subject/body |
| Phone | tel: with country code selector |
| SMS | SMSTO: with pre-filled message |
| WiFi | SSID, password, encryption, hidden network |
| vCard | Full business card (RFC 6350) |
| MeCard | Compact contact format |
| Calendar | iCal events with timezone and reminders |
| Geo Location | Lat/lng with Google/Apple Maps fallback |
| Cryptocurrency | Bitcoin, Ethereum, Litecoin payments |
| EPC/SEPA | European credit transfers (EPC069-12) |
| WhatsApp | Phone + pre-filled message |
| Social Media Hub | Multi-platform links (12+ platforms) |
| App Store Links | iOS/Android smart routing |

### Design Customization

- **Colors** — Solid + gradients (linear/radial) with contrast warnings
- **Dot Shapes** — Square, rounded, dots, diamond, star, heart, classy variants
- **Corner Shapes** — Square, rounded, extra-rounded, circle
- **Logo Overlay** — Upload with size control, background shapes, auto error correction
- **Frames & CTA** — 6+ templates with custom text and styling
- **Error Correction** — L/M/Q/H levels with capacity indicators

### Export

- PNG, SVG, PDF, JPEG (with quality slider)
- Copy to clipboard
- Batch ZIP export (up to 500 QR codes)

### Additional Features

- Step-by-step wizard with live preview
- Template gallery with 10+ pre-designed styles
- Batch generation via CSV upload
- History (last 50 generations, localStorage-backed)
- Dark mode
- Fully responsive (mobile, tablet, desktop)

## Tech Stack

| Tool | Purpose |
|---|---|
| React + TypeScript | UI framework |
| Vite | Build tool |
| Tailwind CSS v4 | Styling |
| qr-code-styling | QR generation with shapes, gradients, logos |
| jsPDF | PDF export |
| Papa Parse | CSV parsing for batch generation |
| Lucide React | Icons |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

This site is deployed to **GitHub Pages** via GitHub Actions. Pushes to `main` trigger an automatic build and deploy of the `dist/` directory.

## White-Label Support

The app is designed for white-labeling from day one. A single config file (`src/config/branding.ts`) controls:

- App name, logo, favicon
- Color palette and fonts
- Footer text and links
- Meta tags

All UI consumes CSS custom properties — no hardcoded colors.

## Performance Targets

- Lighthouse: Performance >90, Accessibility >95, Best Practices >95, SEO >90
- First Contentful Paint: <1.5s
- Bundle size: <300KB gzipped
- WCAG 2.1 AA compliant

## Project Structure

```
src/
  config/         # Branding and app configuration
  components/     # React components (wizard, preview, forms)
  types/          # QR type definitions and interfaces
  utils/          # Formatters, validators, export helpers
  hooks/          # Custom React hooks
public/           # Static assets
tests/            # Unit and E2E tests
```

## Security

- Dependabot for dependency scanning (weekly)
- CodeQL static analysis (on push, PR, weekly)
- Secret scanning enabled

## License

MIT
