/**
 * @fileoverview TypeScript type definitions for the QR Code Generator application.
 *
 * Defines all shared types including QR code data payloads for 15 supported types,
 * customization options, templates, history entries, batch processing, export
 * formats, wizard steps, and application state.
 *
 * @module types
 */

// ---------------------------------------------------------------------------
// QR Type Enum
// ---------------------------------------------------------------------------

/**
 * All 15 supported QR code content types.
 *
 * Each value maps to a dedicated data-entry form and a corresponding
 * payload encoder that produces the final QR string.
 */
export type QRType =
  | 'url'
  | 'text'
  | 'email'
  | 'phone'
  | 'sms'
  | 'wifi'
  | 'vcard'
  | 'mecard'
  | 'calendar'
  | 'geo'
  | 'crypto'
  | 'epc'
  | 'whatsapp'
  | 'social'
  | 'appstore';

// ---------------------------------------------------------------------------
// QR Data Payloads — one interface per QR type
// ---------------------------------------------------------------------------

/** Payload for a simple URL QR code. */
export interface URLData {
  url: string;
}

/** Payload for a plain-text QR code. */
export interface TextData {
  text: string;
}

/** Payload for a mailto: QR code. */
export interface EmailData {
  to: string;
  subject?: string;
  body?: string;
}

/** Payload for a tel: QR code. */
export interface PhoneData {
  number: string;
}

/** Payload for an SMS QR code (smsto:). */
export interface SMSData {
  number: string;
  message?: string;
}

/**
 * Payload for a WiFi network QR code.
 *
 * Follows the WIFI: URI scheme recognised by most camera apps.
 */
export interface WiFiData {
  ssid: string;
  password?: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}

/**
 * Payload for a vCard 3.0 contact QR code.
 *
 * Only `firstName` and `lastName` are required; all other fields are optional.
 */
export interface VCardData {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  organization?: string;
  title?: string;
  url?: string;
  address?: string;
  note?: string;
}

/**
 * Payload for a MeCard contact QR code.
 *
 * MeCard is a simpler alternative to vCard, primarily used by Android devices.
 */
export interface MeCardData {
  name: string;
  phone?: string;
  email?: string;
  url?: string;
  address?: string;
  note?: string;
}

/**
 * Payload for a calendar event QR code (vCalendar / iCal VEVENT).
 *
 * `startDate` and `endDate` should be ISO 8601 strings.
 */
export interface CalendarData {
  title: string;
  startDate: string;
  endDate?: string;
  location?: string;
  description?: string;
  allDay?: boolean;
}

/** Payload for a geo-location QR code (geo: URI). */
export interface GeoData {
  latitude: number;
  longitude: number;
  label?: string;
}

/**
 * Payload for a cryptocurrency payment QR code.
 *
 * Supports Bitcoin (BIP-21), Ethereum (EIP-681), and Litecoin URI schemes.
 */
export interface CryptoData {
  currency: 'bitcoin' | 'ethereum' | 'litecoin';
  address: string;
  amount?: number;
  label?: string;
  message?: string;
}

/**
 * Payload for a European Payments Council (EPC) QR code.
 *
 * Used for SEPA credit transfers within Europe.
 */
export interface EPCData {
  name: string;
  iban: string;
  bic?: string;
  amount?: number;
  reference?: string;
  text?: string;
}

/** Payload for a WhatsApp deep-link QR code (wa.me). */
export interface WhatsAppData {
  number: string;
  message?: string;
}

/** A single social-media profile link. */
export interface SocialLinkData {
  platform: string;
  url: string;
}

/** Payload for a multi-link social media QR code. */
export interface SocialData {
  links: SocialLinkData[];
}

/** Payload for an app-store download QR code (iOS / Android). */
export interface AppStoreData {
  appName: string;
  iosUrl?: string;
  androidUrl?: string;
}

// ---------------------------------------------------------------------------
// QR Data Union
// ---------------------------------------------------------------------------

/**
 * Mapping from each {@link QRType} to its corresponding payload interface.
 *
 * Used to provide strict type-safety when working with QR data discriminated
 * by the `type` field.
 */
export interface QRDataMap {
  url: URLData;
  text: TextData;
  email: EmailData;
  phone: PhoneData;
  sms: SMSData;
  wifi: WiFiData;
  vcard: VCardData;
  mecard: MeCardData;
  calendar: CalendarData;
  geo: GeoData;
  crypto: CryptoData;
  epc: EPCData;
  whatsapp: WhatsAppData;
  social: SocialData;
  appstore: AppStoreData;
}

/**
 * Discriminated union of all QR data payloads.
 *
 * Every variant carries a `type` discriminant so consumers can narrow
 * the payload with a simple `switch` / `if` check.
 *
 * @example
 * ```ts
 * function encode(qr: QRData): string {
 *   switch (qr.type) {
 *     case 'url':   return qr.url;
 *     case 'phone': return `tel:${qr.number}`;
 *     // ...
 *   }
 * }
 * ```
 */
export type QRData = {
  [K in QRType]: { type: K } & QRDataMap[K];
}[QRType];

// ---------------------------------------------------------------------------
// Customization
// ---------------------------------------------------------------------------

/**
 * Gradient configuration for QR code dots or background.
 *
 * Supports both linear and radial gradients with arbitrary colour stops.
 */
export interface GradientConfig {
  /** Gradient interpolation type. */
  type: 'linear' | 'radial';
  /** Rotation angle in degrees (only used for linear gradients). */
  rotation?: number;
  /** Array of colour stops (offset 0-1, CSS colour string). */
  colorStops: { offset: number; color: string }[];
}

/**
 * Configuration for an optional decorative frame rendered around the QR code.
 */
export interface FrameConfig {
  /** Visual style of the frame. `'none'` disables the frame. */
  style:
    | 'none'
    | 'simple'
    | 'rounded'
    | 'badge'
    | 'banner-top'
    | 'banner-bottom'
    | 'speech-bubble';
  /** Call-to-action text displayed inside the frame. */
  text?: string;
  /** Colour of the frame text. */
  textColor?: string;
  /** Background colour of the frame. */
  backgroundColor?: string;
  /** Border colour of the frame. */
  borderColor?: string;
}

/**
 * Full set of visual customization options for a QR code.
 *
 * These map almost 1-to-1 to the `qr-code-styling` library options, with
 * added fields for frames and logos.
 */
export interface QRCustomization {
  /** QR code width in pixels. */
  width: number;
  /** QR code height in pixels. */
  height: number;
  /** Quiet-zone margin in pixels. */
  margin: number;

  // -- Dots (data modules) --------------------------------------------------
  /** Solid colour for data dots. Ignored when `dotsGradient` is set. */
  dotsColor: string;
  /** Optional gradient applied to data dots. */
  dotsGradient?: GradientConfig;
  /** Shape of individual data dots. */
  dotsType:
    | 'square'
    | 'rounded'
    | 'dots'
    | 'extra-rounded'
    | 'classy'
    | 'classy-rounded';

  // -- Corner squares (finder patterns) -------------------------------------
  /** Colour for the outer squares of finder patterns. */
  cornersSquareColor: string;
  /** Shape of the outer squares of finder patterns. */
  cornersSquareType: 'square' | 'extra-rounded' | 'dot';

  // -- Corner dots (finder-pattern centres) ---------------------------------
  /** Colour for the centre dots of finder patterns. */
  cornersDotColor: string;
  /** Shape of the centre dots of finder patterns. */
  cornersDotType: 'square' | 'dot';

  // -- Background -----------------------------------------------------------
  /** Solid background colour. Ignored when `backgroundGradient` is set. */
  backgroundColor: string;
  /** Optional gradient applied to the background. */
  backgroundGradient?: GradientConfig;

  // -- Error correction -----------------------------------------------------
  /** Reed-Solomon error correction level (L=7%, M=15%, Q=25%, H=30%). */
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';

  // -- Logo / image ---------------------------------------------------------
  /** Data-URL or path to a logo image placed at the centre of the QR code. */
  logo?: string;
  /** Logo size as a fraction of the QR code width (0-1). */
  logoSize?: number;
  /** Margin around the logo in pixels. */
  logoMargin?: number;
  /** Padding inside the logo background shape in pixels. */
  logoPadding?: number;
  /** Background shape rendered behind the logo. */
  logoBackgroundShape?: 'square' | 'circle';

  // -- Frame ----------------------------------------------------------------
  /** Optional decorative frame around the QR code. */
  frame?: FrameConfig;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

/**
 * A pre-designed QR code template.
 *
 * Templates provide partial customization overrides that can be applied
 * on top of the default settings to quickly style a QR code.
 */
export interface QRTemplate {
  /** Unique identifier. */
  id: string;
  /** Human-readable display name. */
  name: string;
  /** Short description of the template's visual style. */
  description: string;
  /** Category for filtering in the template picker. */
  category: 'business' | 'social' | 'payment' | 'creative' | 'minimal';
  /** Partial customization overrides applied on top of defaults. */
  customization: Partial<QRCustomization>;
  /** Optional base-64 preview thumbnail (data-URL). */
  preview?: string;
}

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

/**
 * A single entry in the local QR code generation history.
 *
 * Persisted to `localStorage` so users can revisit and re-export past codes.
 */
export interface HistoryEntry {
  /** Unique identifier (UUID v4). */
  id: string;
  /** Unix epoch timestamp (milliseconds) when the code was generated. */
  timestamp: number;
  /** The QR type that was generated. */
  type: QRType;
  /** Serialised payload data. */
  data: Record<string, unknown>;
  /** Full customization snapshot at generation time. */
  customization: QRCustomization;
  /** Optional base-64 preview thumbnail (data-URL). */
  preview?: string;
}

// ---------------------------------------------------------------------------
// Batch Processing
// ---------------------------------------------------------------------------

/**
 * A single item within a {@link BatchJob}.
 */
export interface BatchItem {
  /** Unique identifier for this item. */
  id: string;
  /** Serialised payload data for this QR code. */
  data: Record<string, unknown>;
  /** The QR type for this item. */
  type: QRType;
  /** Current processing status. */
  status: 'pending' | 'completed' | 'error';
  /** Error message if status is `'error'`. */
  error?: string;
}

/**
 * Represents a batch QR-code generation job.
 *
 * Used when generating multiple QR codes at once (e.g. from a CSV import).
 */
export interface BatchJob {
  /** Unique identifier for the batch. */
  id: string;
  /** Ordered list of items to generate. */
  items: BatchItem[];
  /** Overall batch status. */
  status: 'pending' | 'processing' | 'completed' | 'error';
  /** Progress percentage (0-100). */
  progress: number;
  /** Shared customization applied to every item in the batch. */
  customization: QRCustomization;
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/** Supported image / document export formats. */
export type ExportFormat = 'png' | 'svg' | 'pdf' | 'jpeg';

/**
 * Options controlling how a QR code is exported to a file.
 */
export interface ExportOptions {
  /** Target file format. */
  format: ExportFormat;
  /** JPEG quality (0-1). Only used when `format` is `'jpeg'`. */
  quality?: number;
  /** Resolution multiplier (e.g. 2 for 2x / retina). */
  scale?: number;
}

// ---------------------------------------------------------------------------
// Wizard
// ---------------------------------------------------------------------------

/**
 * Steps in the QR code creation wizard.
 *
 * The wizard guides users through: choosing a type, entering data,
 * customizing the appearance, and finally exporting.
 */
export type WizardStep = 'type' | 'data' | 'customize' | 'export';

// ---------------------------------------------------------------------------
// Application State
// ---------------------------------------------------------------------------

/**
 * Top-level application state managed by the root component.
 */
export interface AppState {
  /** Current wizard step. */
  currentStep: WizardStep;
  /** Selected QR code type. */
  qrType: QRType;
  /** Current payload data (shape depends on `qrType`). */
  qrData: Record<string, unknown>;
  /** Current visual customization settings. */
  customization: QRCustomization;
  /** Whether dark mode is active. */
  isDarkMode: boolean;
}
