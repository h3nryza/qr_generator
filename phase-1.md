# Phase 1: QR Code Generator — Static Site (GitHub Pages)

> A fully client-side QR code generator with 15 QR types, full visual customization, and white-label support. Hosted on GitHub Pages — no backend required.

---

## Table of Contents

- [Project Setup](#project-setup)
- [Tech Stack](#tech-stack)
- [QR Code Types](#qr-code-types)
- [Customization Engine](#customization-engine)
- [Export Options](#export-options)
- [UI/UX](#uiux)
- [White-Label Foundation](#white-label-foundation)
- [Performance & Quality](#performance--quality)
- [Deployment](#deployment)
- [Project Structure](#project-structure)

---

## Project Setup

- [x] Initialize Vite + React + TypeScript project
- [x] Configure Tailwind CSS v4
- [x] Set up ESLint + Prettier
- [x] Configure GitHub Actions for Pages deployment
- [x] Set up Dependabot (`.github/dependabot.yml`) — **DONE**
- [x] Set up CodeQL scanning (`.github/workflows/codeql.yml`) — **DONE**
- [x] Enable secret scanning in repo settings (manual: Settings > Code security and analysis)
- [x] Create white-label config file (`src/config/branding.ts`)
- [x] Set up CSS custom properties for theming
- [x] Install `qr-code-styling` library
- [x] Set up project directory structure (see below)

---

## Tech Stack

### Recommended Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Framework** | React + Vite + TypeScript | Largest ecosystem, fast HMR, easy GitHub Pages deploy, type safety |
| **QR Library** | [qr-code-styling](https://github.com/nicholasgillespie/qr-code-styling) | Only JS library supporting dot shapes, corner shapes, gradients, logos natively |
| **Styling** | Tailwind CSS v4 | Utility-first, CSS custom properties for white-labeling, small bundle |
| **PDF Export** | jsPDF | Client-side PDF generation |
| **CSV Parsing** | Papa Parse | Robust CSV parser for batch generation |
| **Icons** | Lucide React | Lightweight, tree-shakeable icon set |

### Alternatives Considered

| Layer | Alternative | Trade-off |
|-------|------------|-----------|
| Framework | Vue + Vite | Smaller ecosystem for QR libraries, fewer React-specific components |
| Framework | Next.js static export | Overkill for static site, image optimization disabled, no API routes |
| Framework | Vanilla JS + Web Components | No ecosystem, manual state management, slower development |
| QR Library | qrcode.js | No shape/gradient/logo support — basic squares only |
| QR Library | node-qrcode | Server-focused, no visual customization |
| Styling | CSS Modules | No utility classes, harder to theme dynamically |
| Styling | styled-components | Runtime CSS-in-JS overhead, harder white-label config |

---

## QR Code Types

### 1. URL

- [ ] URL input field with validation (must include protocol)
- [ ] Auto-prepend `https://` if missing
- [ ] UTM parameter builder:
  - [ ] `utm_source` input
  - [ ] `utm_medium` input
  - [ ] `utm_campaign` input
  - [ ] `utm_term` input (optional)
  - [ ] `utm_content` input (optional)
- [ ] Live URL preview with UTM params appended
- [ ] Copy generated URL to clipboard

**Format:** `https://example.com?utm_source=X&utm_medium=Y&utm_campaign=Z`

---

### 2. Text

- [ ] Multi-line text input (textarea)
- [ ] Character count display
- [ ] Max capacity warning based on selected error correction level
- [ ] Copy text to clipboard

**Format:** Raw text string
**Max capacity:** ~2,953 bytes (version 40, error correction L)

---

### 3. Email (mailto:)

- [ ] To field — email address with validation
- [ ] CC field (optional)
- [ ] BCC field (optional)
- [ ] Subject field
- [ ] Body field (multi-line)
- [ ] Generate `mailto:` URI with proper URL encoding

**Format:** `mailto:user@example.com?subject=Hello&body=Message%20here&cc=other@example.com`

---

### 4. Phone (tel:)

- [ ] Country code dropdown/selector (with flag icons)
- [ ] Phone number input with formatting
- [ ] Input validation (digits, spaces, dashes, parentheses)
- [ ] Generate `tel:` URI

**Format:** `tel:+27-123-456-7890`

---

### 5. SMS (SMSTO:)

- [ ] Phone number with country code selector
- [ ] Pre-filled message body (textarea)
- [ ] Character count (160 char SMS limit indicator)
- [ ] Generate `SMSTO:` URI

**Format:** `SMSTO:+27123456789:Your message here`

---

### 6. WiFi

- [ ] SSID input (required, case-sensitive)
- [ ] Password input with show/hide toggle
- [ ] Encryption type selector:
  - [ ] WPA/WPA2 (default)
  - [ ] WEP
  - [ ] None (open network)
- [ ] Hidden network toggle (boolean)
- [ ] Special character escaping (`\`, `;`, `,`, `"`, `:`)
- [ ] Generate WIFI string

**Format:** `WIFI:T:WPA;S:MyNetwork;P:MyPassword123;H:false;;`

---

### 7. vCard (Digital Business Card)

- [ ] Prefix (Mr., Mrs., Dr., etc.) — dropdown
- [ ] First name
- [ ] Last name
- [ ] Suffix (Jr., Sr., III, etc.)
- [ ] Multiple phone numbers with type selector:
  - [ ] Mobile
  - [ ] Work
  - [ ] Home
  - [ ] Fax
  - [ ] Add/remove phone rows
- [ ] Multiple email addresses:
  - [ ] Work
  - [ ] Personal
  - [ ] Add/remove email rows
- [ ] Company / Organization name
- [ ] Job title
- [ ] Department
- [ ] Full address:
  - [ ] Street address
  - [ ] City
  - [ ] State/Province
  - [ ] Postal/ZIP code
  - [ ] Country (dropdown)
- [ ] Website URL
- [ ] Birthday (date picker)
- [ ] Photo URL
- [ ] Notes field (textarea)
- [ ] Social media URLs (LinkedIn, Twitter, etc.) — add/remove rows
- [ ] Generate vCard 3.0 format (RFC 6350 compliant)

**Format:**
```
BEGIN:VCARD
VERSION:3.0
N:Doe;John;;Mr.;
FN:Mr. John Doe
ORG:Acme Corp
TITLE:Software Engineer
TEL;TYPE=CELL:+27123456789
TEL;TYPE=WORK:+27987654321
EMAIL;TYPE=WORK:john@acme.com
ADR;TYPE=WORK:;;123 Main St;Cape Town;WC;8001;South Africa
URL:https://johndoe.com
BDAY:19900101
NOTE:Important contact
END:VCARD
```

---

### 8. MeCard (Compact Contact)

- [ ] Name (Last;First format)
- [ ] Phone number
- [ ] Email
- [ ] Company name
- [ ] Website URL
- [ ] Address (single line)
- [ ] Notes
- [ ] Generate MECARD format

**Format:** `MECARD:N:Doe,John;TEL:+27123456789;EMAIL:john@example.com;ORG:Acme;URL:https://example.com;NOTE:Notes here;;`

**When to use:** When QR code size is critical and only basic contact info is needed (more compact than vCard).

---

### 9. Calendar Event (iCal)

- [ ] Event title / summary (required)
- [ ] Start date/time picker with timezone selector
- [ ] End date/time picker with timezone selector
- [ ] All-day event toggle (hides time pickers)
- [ ] Location field
- [ ] Description field (textarea)
- [ ] Reminder/alarm selector:
  - [ ] None
  - [ ] 5 minutes before
  - [ ] 15 minutes before
  - [ ] 30 minutes before
  - [ ] 1 hour before
  - [ ] 1 day before
- [ ] Generate VCALENDAR/VEVENT format

**Format:**
```
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Team Meeting
DTSTART:20260325T140000Z
DTEND:20260325T150000Z
LOCATION:Conference Room A
DESCRIPTION:Weekly sync
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR
```

---

### 10. Geo Location

- [ ] Latitude input (-90 to 90, decimal format) with validation
- [ ] Longitude input (-180 to 180, decimal format) with validation
- [ ] Location label/name (optional)
- [ ] Interactive map picker (optional enhancement — use Leaflet/OpenStreetMap, no API key)
- [ ] Generate `geo:` URI
- [ ] Include Google Maps fallback URL
- [ ] Include Apple Maps fallback URL

**Format:** `geo:37.7749,-122.4194?q=San+Francisco`
**Fallback:** `https://maps.google.com/?q=37.7749,-122.4194`

---

### 11. Cryptocurrency

- [ ] Currency selector:
  - [ ] Bitcoin
  - [ ] Ethereum
  - [ ] Litecoin
- [ ] Wallet address input with basic format validation
- [ ] Amount (optional, numeric)
- [ ] Label/message (optional)
- [ ] Generate cryptocurrency URI

**Formats:**
- Bitcoin: `bitcoin:1A1z7agoat7SfNNBrY6PsKafcstP5PnYqe?amount=0.5&message=Payment`
- Ethereum: `ethereum:0x...?value=1.0`
- Litecoin: `litecoin:L...?amount=5.0`

---

### 12. EPC/SEPA Payment (European Credit Transfer)

- [ ] Character encoding selector (UTF-8 default)
- [ ] BIC input (8 or 11 characters, validation)
- [ ] IBAN input with validation (country-specific format)
- [ ] Recipient name (max 70 characters)
- [ ] Amount in EUR (max 999,999,999.99)
- [ ] Payment reference / remittance info
- [ ] Unstructured reference / description
- [ ] Generate EPC069-12 format payload
- [ ] Note: Fixed error correction level M, max QR version 13

**Format:** 12-line structured payload per EPC069-12 standard
**Geographic scope note:** Primarily Austria, Belgium, Finland, Germany, Netherlands

---

### 13. WhatsApp

- [ ] Phone number with country code (international format)
- [ ] Pre-filled message (textarea)
- [ ] URL-encode the message
- [ ] Generate WhatsApp URL

**Format:** `https://wa.me/27123456789?text=Hello%20there`

---

### 14. Social Media Hub

- [ ] Platform selector with toggle for each:
  - [ ] Facebook — profile/page URL
  - [ ] Instagram — profile URL
  - [ ] Twitter/X — profile URL
  - [ ] TikTok — profile URL
  - [ ] LinkedIn — profile URL
  - [ ] YouTube — channel URL
  - [ ] GitHub — profile URL
  - [ ] Snapchat — profile URL
  - [ ] Pinterest — board URL
  - [ ] Threads — profile URL
  - [ ] Telegram — channel/user URL
  - [ ] Custom platform (label + URL)
- [ ] URL input per enabled platform with validation
- [ ] Preview: mini "link-in-bio" style landing page
- [ ] Generate approach:
  - [ ] Option A: Encode all links as JSON in QR (works offline, limited by QR capacity)
  - [ ] Option B: Generate a self-contained HTML data URI
  - [ ] Option C: Use a hosted micro-page (Phase 2 feature, placeholder in Phase 1)

---

### 15. App Store Links

- [ ] App name/label
- [ ] iOS App Store URL input
- [ ] Google Play Store URL input
- [ ] Fallback URL for other platforms (optional)
- [ ] Device detection approach:
  - [ ] Generate a small redirect HTML page (data URI or hosted)
  - [ ] User-agent based routing logic
- [ ] Generate smart link

---

## Customization Engine

### Colors

- [ ] Foreground (dots/modules) color picker — solid color
- [ ] Background color picker — solid color
- [ ] Transparent background toggle
- [ ] Gradient toggle (foreground only)
  - [ ] Gradient type: Linear / Radial
  - [ ] Gradient start color picker
  - [ ] Gradient end color picker
  - [ ] Gradient rotation angle slider (0-360, for linear)
- [ ] Color contrast warning (if foreground/background too similar — scan reliability)

### Dot / Module Shapes

- [ ] Square (default)
- [ ] Rounded
- [ ] Dots / Circles
- [ ] Diamond
- [ ] Star
- [ ] Heart
- [ ] Classy
- [ ] Classy-rounded
- [ ] Visual shape preview swatch for each option

### Corner Square Shapes (finder patterns — outer)

- [ ] Square (default)
- [ ] Rounded
- [ ] Extra-rounded
- [ ] Dot / Circle

### Corner Dot Shapes (finder patterns — inner)

- [ ] Square (default)
- [ ] Dot / Circle

### Logo / Image Overlay

- [ ] Image upload via:
  - [ ] Drag-and-drop zone
  - [ ] File picker button
- [ ] Supported formats: PNG, JPG, SVG, GIF, WebP
- [ ] Logo size slider (5% to 30% of QR code area)
- [ ] Logo margin / padding control
- [ ] Logo background shape:
  - [ ] None (transparent)
  - [ ] Square
  - [ ] Circle
  - [ ] Rounded square
- [ ] Logo background color picker
- [ ] Auto-switch to error correction H when logo added
- [ ] Logo removal button

### Frames & Call-to-Action (CTA)

- [ ] Frame template gallery (minimum 6 styles):
  - [ ] Bottom bar with text
  - [ ] Top bar with text
  - [ ] Full border with bottom text
  - [ ] Rounded badge below
  - [ ] Banner above
  - [ ] Minimal underline
- [ ] CTA text presets:
  - [ ] "Scan Me"
  - [ ] "Learn More"
  - [ ] "Visit Us"
  - [ ] "Download"
  - [ ] "Follow Us"
  - [ ] "Pay Here"
  - [ ] "Connect"
  - [ ] "Get the App"
- [ ] Custom CTA text input
- [ ] Frame color picker
- [ ] CTA text color picker
- [ ] CTA font size slider
- [ ] Frame preview in real-time

### Error Correction Level

- [ ] **L** — 7% recovery (max data capacity)
- [ ] **M** — 15% recovery (default, recommended for most uses)
- [ ] **Q** — 25% recovery (moderate damage tolerance)
- [ ] **H** — 30% recovery (required when using logos)
- [ ] Explanatory tooltip for each level
- [ ] Auto-recommend H when logo is uploaded
- [ ] Visual indicator showing data capacity at selected level

### Size & Margin

- [ ] QR code size slider: 256px — 2048px (step: 64px)
- [ ] Quiet zone / margin control: 0 — 50px (step: 5px)
- [ ] Output resolution multiplier: 1x, 2x, 3x, 4x
- [ ] Effective output size display (e.g., "1024 x 1024 px")

---

## Export Options

- [ ] **PNG** — raster, with resolution multiplier applied
- [ ] **SVG** — vector, scalable, ideal for print
- [ ] **PDF** — print-ready (via jsPDF), A4 centered or custom size
- [ ] **JPEG** — with quality slider (60%-100%)
- [ ] Filename customization (default: `qr-{type}-{timestamp}`)
- [ ] Batch export as ZIP (for batch generation feature)
- [ ] Copy QR to clipboard (as PNG)

### Export Format Guidance (displayed to user)

| Use Case | Recommended | Alternative |
|----------|-------------|-------------|
| Website / digital | PNG or SVG | — |
| Business cards | SVG or PDF | — |
| Large posters / banners | SVG | PDF |
| Email attachments | PNG | JPEG |
| Professional print | SVG or PDF | — |

---

## UI/UX

### Step-by-Step Wizard

- [ ] **Step 1: Choose QR Type** — grid of type cards with icons and labels
- [ ] **Step 2: Enter Data** — dynamic form rendered based on selected type
- [ ] **Step 3: Customize Design** — color, shapes, logo, frame, error correction
- [ ] **Step 4: Download** — format selection, final preview, download button(s)
- [ ] Progress indicator (step dots or bar)
- [ ] Back / Next navigation buttons
- [ ] Direct step access (click step number to jump — only to completed/current steps)
- [ ] Keyboard navigation (Tab, Enter)

### Live Preview

- [ ] Real-time QR preview panel (updates on every input change)
- [ ] Debounced rendering (200ms delay to avoid jank)
- [ ] Preview zoom / fullscreen modal
- [ ] Dark/light background toggle for preview area
- [ ] "QR is empty" placeholder state
- [ ] Mobile: preview as sticky bottom bar or expandable drawer

### Responsive Design

- [ ] Mobile-first layout (<640px): stacked, full-width form + collapsible preview
- [ ] Tablet (640-1024px): form on left, preview on right (50/50)
- [ ] Desktop (>1024px): wider form, larger sticky preview panel
- [ ] Touch-friendly controls (larger hit targets, swipe between steps)
- [ ] No horizontal scroll at any breakpoint

### Template Gallery

- [ ] Minimum 10 pre-designed style templates:
  - [ ] Classic (black on white, square dots)
  - [ ] Rounded Modern (dark blue, rounded dots)
  - [ ] Dots (circular modules, gradient)
  - [ ] Neon (bright colors on dark background)
  - [ ] Corporate (subtle blue/grey, square)
  - [ ] Creative (multi-color gradient, stars)
  - [ ] Minimal (thin, light grey)
  - [ ] Bold (thick modules, high contrast)
  - [ ] Elegant (classy shape, gold tones)
  - [ ] Playful (hearts/diamonds, bright colors)
- [ ] Template preview cards in a scrollable grid
- [ ] One-click apply (populates all customization fields)
- [ ] Category filter (Business, Social, Creative, Minimal)
- [ ] Template selection does not overwrite entered QR data

### Batch Generation

- [ ] CSV file upload (drag-and-drop + file picker)
- [ ] CSV template download (pre-filled example for each QR type)
- [ ] Column mapping UI (map CSV columns to QR type fields)
- [ ] Preview first 5 items before generating
- [ ] Progress bar during generation
- [ ] Apply same style/customization to all items in batch
- [ ] Download all as ZIP file
- [ ] Error report for invalid rows (row number + issue)
- [ ] Maximum batch size: 500 QR codes

### History (localStorage)

- [ ] Save last 50 generations automatically
- [ ] Each entry stores: QR type, input data, style config, timestamp, thumbnail
- [ ] Thumbnail preview in history list
- [ ] One-click re-edit (loads all data + style back into wizard)
- [ ] One-click re-download
- [ ] Delete individual entries
- [ ] Clear all history button (with confirmation)
- [ ] Export history as JSON
- [ ] Storage usage indicator

---

## White-Label Foundation

### Branding Config (`src/config/branding.ts`)

- [ ] Create single config file controlling all brand elements:
  ```typescript
  export const branding = {
    appName: "QR Generator",
    logo: "/logo.svg",
    favicon: "/favicon.ico",
    colors: {
      primary: "#3B82F6",
      secondary: "#1E40AF",
      accent: "#F59E0B",
      background: "#FFFFFF",
      surface: "#F8FAFC",
      text: "#0F172A",
      textMuted: "#64748B",
    },
    fonts: {
      heading: "Inter, system-ui, sans-serif",
      body: "Inter, system-ui, sans-serif",
    },
    footer: {
      text: "Built with QR Generator",
      links: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ],
    },
    meta: {
      title: "QR Code Generator — Create Custom QR Codes",
      description: "Generate beautiful, customizable QR codes for free.",
    },
  };
  ```
- [ ] CSS custom properties generated from config at runtime
- [ ] All components consume CSS variables (no hardcoded colors)
- [ ] No hardcoded brand name/logo in any component — always reference config
- [ ] Favicon and meta tags driven by config
- [ ] Documentation for forking and rebranding (README section)

### Theme System

- [ ] Light mode (default)
- [ ] Dark mode (toggle or system preference)
- [ ] Theme colors derived from branding config
- [ ] Smooth theme transition (CSS transitions on variables)

---

## Performance & Quality

### Targets

- [ ] Lighthouse Performance score > 90
- [ ] Lighthouse Accessibility score > 95
- [ ] Lighthouse Best Practices score > 95
- [ ] Lighthouse SEO score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Bundle size < 300KB gzipped (initial load)

### Code Quality

- [ ] Code splitting per QR type (lazy-loaded form components)
- [ ] Lazy loading for heavy modules (jsPDF, Papa Parse)
- [ ] Tree-shaking for icons and utilities
- [ ] Unit tests for all QR data formatters (vCard, WiFi, mailto, etc.)
- [ ] Unit tests for input validation logic
- [ ] E2E tests for wizard flow (Playwright or Cypress)
- [ ] Accessibility audit (WCAG 2.1 AA compliance)
- [ ] Keyboard-only navigation testing
- [ ] Screen reader testing

---

## Deployment

- [ ] GitHub Actions workflow for build + deploy to GitHub Pages
- [ ] Build step: `npm run build`
- [ ] Deploy step: upload `dist/` to `gh-pages` branch or use `actions/deploy-pages`
- [ ] `404.html` for SPA routing on GitHub Pages (copy of `index.html`)
- [ ] Custom domain configuration (optional — via CNAME file)
- [ ] Preview deployments on PRs (optional — via Netlify or Vercel preview)
- [ ] Environment variable for base path (if hosted under a subpath)

---

## Project Structure

```
qr_generator/
├── src/
│   ├── config/
│   │   ├── branding.ts              # White-label branding config
│   │   ├── qr-types.ts              # QR type registry (metadata, icons, form mappings)
│   │   └── templates.ts             # Pre-designed style templates
│   ├── components/
│   │   ├── wizard/
│   │   │   ├── WizardLayout.tsx     # Step container + navigation
│   │   │   ├── StepSelector.tsx     # Step 1: QR type grid
│   │   │   ├── StepData.tsx         # Step 2: Dynamic form loader
│   │   │   ├── StepCustomize.tsx    # Step 3: Design panel
│   │   │   └── StepDownload.tsx     # Step 4: Export panel
│   │   ├── qr-types/                # Form component per QR type
│   │   │   ├── UrlForm.tsx
│   │   │   ├── TextForm.tsx
│   │   │   ├── EmailForm.tsx
│   │   │   ├── PhoneForm.tsx
│   │   │   ├── SmsForm.tsx
│   │   │   ├── WifiForm.tsx
│   │   │   ├── VcardForm.tsx
│   │   │   ├── MecardForm.tsx
│   │   │   ├── CalendarForm.tsx
│   │   │   ├── GeoForm.tsx
│   │   │   ├── CryptoForm.tsx
│   │   │   ├── EpcForm.tsx
│   │   │   ├── WhatsappForm.tsx
│   │   │   ├── SocialHubForm.tsx
│   │   │   └── AppStoreForm.tsx
│   │   ├── customization/
│   │   │   ├── ColorPicker.tsx
│   │   │   ├── GradientPicker.tsx
│   │   │   ├── ShapeSelector.tsx
│   │   │   ├── LogoUpload.tsx
│   │   │   ├── FrameSelector.tsx
│   │   │   ├── ErrorCorrectionPicker.tsx
│   │   │   └── SizeMarginControl.tsx
│   │   ├── preview/
│   │   │   ├── QrPreview.tsx        # Live QR code preview
│   │   │   └── PreviewControls.tsx  # Zoom, background toggle
│   │   ├── export/
│   │   │   ├── ExportPanel.tsx      # Format buttons + download
│   │   │   └── BatchExport.tsx      # ZIP generation
│   │   ├── batch/
│   │   │   ├── CsvUpload.tsx
│   │   │   ├── ColumnMapper.tsx
│   │   │   └── BatchPreview.tsx
│   │   ├── history/
│   │   │   └── HistoryPanel.tsx
│   │   ├── templates/
│   │   │   └── TemplateGallery.tsx
│   │   └── ui/                      # Shared primitives
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Toggle.tsx
│   │       ├── Slider.tsx
│   │       ├── Tooltip.tsx
│   │       └── Modal.tsx
│   ├── lib/
│   │   ├── qr-formatters/           # Data formatters per QR type
│   │   │   ├── url.ts
│   │   │   ├── text.ts
│   │   │   ├── email.ts
│   │   │   ├── phone.ts
│   │   │   ├── sms.ts
│   │   │   ├── wifi.ts
│   │   │   ├── vcard.ts
│   │   │   ├── mecard.ts
│   │   │   ├── calendar.ts
│   │   │   ├── geo.ts
│   │   │   ├── crypto.ts
│   │   │   ├── epc.ts
│   │   │   ├── whatsapp.ts
│   │   │   ├── social-hub.ts
│   │   │   └── app-store.ts
│   │   ├── qr-renderer.ts           # Wrapper around qr-code-styling
│   │   ├── export.ts                # PNG/SVG/PDF/JPEG export logic
│   │   ├── csv-parser.ts            # Batch CSV parsing + validation
│   │   ├── history.ts               # localStorage history manager
│   │   └── validators.ts            # Input validators (email, phone, URL, IBAN, etc.)
│   ├── hooks/
│   │   ├── useQrGenerator.ts        # Main QR state + generation hook
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── useTheme.ts
│   ├── styles/
│   │   ├── globals.css              # CSS custom properties + base styles
│   │   └── themes.css               # Light/dark theme variables
│   ├── types/
│   │   ├── qr.ts                    # QR type definitions
│   │   ├── branding.ts              # Branding config types
│   │   └── export.ts                # Export option types
│   ├── App.tsx
│   └── main.tsx
├── public/
│   ├── templates/                   # Template preview images
│   ├── icons/                       # QR type icons
│   ├── logo.svg
│   └── favicon.ico
├── tests/
│   ├── unit/
│   │   └── qr-formatters/           # Tests per formatter
│   └── e2e/
│       └── wizard.spec.ts
├── .github/
│   ├── dependabot.yml
│   └── workflows/
│       ├── deploy.yml               # GitHub Pages deploy
│       └── codeql.yml               # CodeQL scanning
├── phase-1.md                       # This file
├── phase-2.md                       # Backend platform spec
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── README.md
```

---

## Implementation Priority

Recommended build order for Phase 1:

| Priority | Feature | Complexity | Dependencies |
|----------|---------|------------|-------------|
| 1 | Project scaffold + branding config | Low | None |
| 2 | Wizard shell (step nav, layout) | Medium | Scaffold |
| 3 | QR renderer wrapper (qr-code-styling) | Medium | Scaffold |
| 4 | Live preview component | Medium | QR renderer |
| 5 | URL type (simplest, validates full flow) | Low | Wizard + Preview |
| 6 | Text, Email, Phone, SMS types | Low | Wizard + Preview |
| 7 | WiFi, WhatsApp types | Low | Wizard + Preview |
| 8 | vCard, MeCard types | Medium | Wizard + Preview |
| 9 | Calendar, Geo types | Medium | Wizard + Preview |
| 10 | Customization panel (colors, shapes) | High | QR renderer |
| 11 | Logo upload | Medium | Customization |
| 12 | Frames + CTA | High | Customization |
| 13 | Export (PNG, SVG, PDF, JPEG) | Medium | QR renderer |
| 14 | Template gallery | Medium | Customization |
| 15 | Crypto, EPC, Social Hub, App Store types | Medium | Wizard + Preview |
| 16 | Batch generation | High | Export + CSV |
| 17 | History (localStorage) | Medium | All types |
| 18 | Dark mode | Low | Theme system |
| 19 | GitHub Pages deployment | Low | Build working |
| 20 | Tests + accessibility audit | Medium | All features |
