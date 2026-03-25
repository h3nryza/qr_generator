/**
 * @fileoverview Central registry for all 15 QR code types.
 *
 * Maps each {@link QRType} to its configuration: human-readable label,
 * description, Lucide icon name, category, format function, and validation
 * function. Consumers can look up a type in {@link QR_TYPE_REGISTRY} or
 * iterate over the pre-sorted {@link QR_TYPES_LIST} array.
 *
 * @module qr-types
 */

import type { QRType } from '../types';
import type { ValidationResult } from './validators';
import {
  validateUrl,
  validateText,
  validateEmail,
  validatePhone,
  validateSms,
  validateWifi,
  validateVcard,
  validateMecard,
  validateCalendar,
  validateGeo,
  validateCrypto,
  validateEpc,
  validateWhatsapp,
  validateSocial,
  validateAppstore,
} from './validators';
import {
  formatUrl,
  formatText,
  formatEmail,
  formatPhone,
  formatSms,
  formatWifi,
  formatVCard,
  formatMeCard,
  formatCalendar,
  formatGeo,
  formatCrypto,
  formatEpc,
  formatWhatsApp,
  formatSocialHub,
  formatAppStore,
} from './formatters';
import type {
  UrlData,
  TextData,
  EmailData,
  PhoneData,
  SmsData,
  WifiData,
  VCardData,
  MeCardData,
  CalendarData,
  GeoData,
  CryptoData,
  EpcData,
  WhatsAppData,
  SocialHubData,
  AppStoreData,
} from './formatters';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Category used to group QR types in the UI.
 *
 * - `links`   -- URL-based types (websites, social profiles, app stores)
 * - `contact` -- People-oriented types (phone, SMS, email, vCard, MeCard)
 * - `data`    -- Informational types (text, WiFi, calendar, geolocation)
 * - `payment` -- Financial types (cryptocurrency, EPC/SEPA)
 */
export type QRTypeCategory = 'links' | 'contact' | 'data' | 'payment';

/**
 * Complete configuration for a single QR code type.
 *
 * Bundles together the metadata (label, description, icon, category) with
 * the runtime functions (format, validate) needed to process that type.
 */
export interface QRTypeConfig {
  /** The QR type identifier, matching the {@link QRType} union. */
  type: QRType;
  /** Human-readable display label (e.g. "URL", "WiFi"). */
  label: string;
  /** Short description of what this QR type does. */
  description: string;
  /**
   * Name of the Lucide React icon to render for this type.
   *
   * Must match a valid export from `lucide-react` (e.g. `'Link'`, `'Wifi'`).
   */
  icon: string;
  /** Grouping category for UI organisation. */
  category: QRTypeCategory;
  /**
   * Encodes the user's data into the final QR code payload string.
   *
   * Accepts a loosely-typed record because form data arrives untyped.
   * The function internally casts to the strongly-typed formatter interface
   * after validation has already confirmed the shape is correct.
   *
   * @param data - The validated form data
   * @returns The encoded string to embed in the QR code
   */
  format: (data: Record<string, unknown>) => string;
  /**
   * Validates the user's data before formatting.
   *
   * @param data - The raw form data to check
   * @returns A {@link ValidationResult} with `valid` flag and any error messages
   */
  validate: (data: Record<string, unknown>) => ValidationResult;
}

// ---------------------------------------------------------------------------
// Adapter helpers
// ---------------------------------------------------------------------------

/**
 * Wraps a strongly-typed formatter function so it can accept
 * `Record<string, unknown>`. The cast is safe because callers are expected
 * to run the corresponding validator first.
 *
 * @typeParam T - The strongly-typed data interface the formatter expects
 * @param fn - The typed formatter function
 * @returns An untyped wrapper suitable for the {@link QRTypeConfig.format} slot
 */
function adaptFormatter<T>(fn: (data: T) => string): (data: Record<string, unknown>) => string {
  return (data: Record<string, unknown>) => fn(data as unknown as T);
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

/**
 * Authoritative registry mapping every {@link QRType} to its full
 * {@link QRTypeConfig} definition.
 *
 * Use this when you need to look up a specific type by key:
 *
 * @example
 * ```ts
 * const config = QR_TYPE_REGISTRY['wifi'];
 * const result = config.validate(formData);
 * if (result.valid) {
 *   const payload = config.format(formData);
 * }
 * ```
 */
export const QR_TYPE_REGISTRY: Record<QRType, QRTypeConfig> = {
  // -------------------------------------------------------------------------
  // Category: links
  // -------------------------------------------------------------------------

  /** URL QR code -- encodes a website link with optional UTM parameters. */
  url: {
    type: 'url',
    label: 'URL',
    description: 'Link to a website or web page with optional UTM tracking parameters.',
    icon: 'Link',
    category: 'links',
    format: adaptFormatter<UrlData>(formatUrl),
    validate: validateUrl,
  },

  /** Social media hub -- encodes multiple social profile links as JSON. */
  social: {
    type: 'social',
    label: 'Social Media',
    description: 'Share multiple social media profile links in a single QR code.',
    icon: 'Share2',
    category: 'links',
    format: adaptFormatter<SocialHubData>(formatSocialHub),
    validate: validateSocial,
  },

  /** App Store links -- smart redirect to iOS or Android store. */
  appstore: {
    type: 'appstore',
    label: 'App Store',
    description: 'Link to your app on the Apple App Store and/or Google Play Store.',
    icon: 'Download',
    category: 'links',
    format: adaptFormatter<AppStoreData>(formatAppStore),
    validate: validateAppstore,
  },

  /** WhatsApp deep link -- opens a chat with a pre-filled message. */
  whatsapp: {
    type: 'whatsapp',
    label: 'WhatsApp',
    description: 'Open a WhatsApp chat with a specific number and optional message.',
    icon: 'MessageCircle',
    category: 'links',
    format: adaptFormatter<WhatsAppData>(formatWhatsApp),
    validate: validateWhatsapp,
  },

  // -------------------------------------------------------------------------
  // Category: contact
  // -------------------------------------------------------------------------

  /** Phone call -- encodes a tel: URI. */
  phone: {
    type: 'phone',
    label: 'Phone',
    description: 'Trigger a phone call to a specific number when scanned.',
    icon: 'Phone',
    category: 'contact',
    format: adaptFormatter<PhoneData>(formatPhone),
    validate: validatePhone,
  },

  /** SMS message -- encodes an SMSTO: URI with optional message body. */
  sms: {
    type: 'sms',
    label: 'SMS',
    description: 'Pre-fill an SMS message to a specific phone number.',
    icon: 'MessageSquare',
    category: 'contact',
    format: adaptFormatter<SmsData>(formatSms),
    validate: validateSms,
  },

  /** Email -- encodes a mailto: URI with optional subject and body. */
  email: {
    type: 'email',
    label: 'Email',
    description: 'Compose an email with a pre-filled recipient, subject, and body.',
    icon: 'Mail',
    category: 'contact',
    format: adaptFormatter<EmailData>(formatEmail),
    validate: validateEmail,
  },

  /** vCard 3.0 -- full digital business card with rich contact details. */
  vcard: {
    type: 'vcard',
    label: 'vCard',
    description: 'Share a full digital business card (vCard 3.0) with contact details.',
    icon: 'Contact',
    category: 'contact',
    format: adaptFormatter<VCardData>(formatVCard),
    validate: validateVcard,
  },

  /** MeCard -- compact contact card (smaller QR code than vCard). */
  mecard: {
    type: 'mecard',
    label: 'MeCard',
    description: 'Share a compact contact card (smaller QR code than vCard).',
    icon: 'UserRound',
    category: 'contact',
    format: adaptFormatter<MeCardData>(formatMeCard),
    validate: validateMecard,
  },

  // -------------------------------------------------------------------------
  // Category: data
  // -------------------------------------------------------------------------

  /** Plain text -- raw text content encoded directly in the QR code. */
  text: {
    type: 'text',
    label: 'Text',
    description: 'Encode arbitrary plain text directly into the QR code.',
    icon: 'Type',
    category: 'data',
    format: adaptFormatter<TextData>(formatText),
    validate: validateText,
  },

  /** WiFi credentials -- auto-connect to a wireless network on scan. */
  wifi: {
    type: 'wifi',
    label: 'WiFi',
    description: 'Share WiFi network credentials for one-scan auto-connect.',
    icon: 'Wifi',
    category: 'data',
    format: adaptFormatter<WifiData>(formatWifi),
    validate: validateWifi,
  },

  /** Calendar event -- iCal VEVENT with optional reminder. */
  calendar: {
    type: 'calendar',
    label: 'Calendar Event',
    description: 'Add a calendar event with date, time, location, and reminder.',
    icon: 'CalendarDays',
    category: 'data',
    format: adaptFormatter<CalendarData>(formatCalendar),
    validate: validateCalendar,
  },

  /** Geolocation -- geo: URI for map pin drop. */
  geo: {
    type: 'geo',
    label: 'Location',
    description: 'Share a geographic location (latitude and longitude) on a map.',
    icon: 'MapPin',
    category: 'data',
    format: adaptFormatter<GeoData>(formatGeo),
    validate: validateGeo,
  },

  // -------------------------------------------------------------------------
  // Category: payment
  // -------------------------------------------------------------------------

  /** Cryptocurrency payment -- Bitcoin, Ethereum, or Litecoin URI. */
  crypto: {
    type: 'crypto',
    label: 'Cryptocurrency',
    description: 'Generate a cryptocurrency payment request (Bitcoin, Ethereum, Litecoin).',
    icon: 'Bitcoin',
    category: 'payment',
    format: adaptFormatter<CryptoData>(formatCrypto),
    validate: validateCrypto,
  },

  /** EPC/SEPA payment -- European bank transfer QR code (EPC069-12). */
  epc: {
    type: 'epc',
    label: 'EPC / SEPA Payment',
    description: 'Generate a SEPA bank transfer QR code (European Payments Council standard).',
    icon: 'Landmark',
    category: 'payment',
    format: adaptFormatter<EpcData>(formatEpc),
    validate: validateEpc,
  },
};

// ---------------------------------------------------------------------------
// Sorted list
// ---------------------------------------------------------------------------

/**
 * Display order of categories in the UI.
 *
 * Types within each category appear in the order they are defined in
 * {@link QR_TYPE_REGISTRY}.
 */
const CATEGORY_ORDER: readonly QRTypeCategory[] = ['links', 'contact', 'data', 'payment'];

/**
 * All QR type configurations as a flat array, sorted by category.
 *
 * Categories appear in the order: links, contact, data, payment.
 * Within each category the types appear in the order they were registered.
 *
 * Use this when rendering a list or grid of all available QR types:
 *
 * @example
 * ```tsx
 * {QR_TYPES_LIST.map((config) => (
 *   <TypeCard key={config.type} config={config} />
 * ))}
 * ```
 */
export const QR_TYPES_LIST: QRTypeConfig[] = CATEGORY_ORDER.flatMap((category) =>
  Object.values(QR_TYPE_REGISTRY).filter((config) => config.category === category),
);

// ---------------------------------------------------------------------------
// Re-exports for convenience
// ---------------------------------------------------------------------------

export type { ValidationResult } from './validators';
export * as validators from './validators';
export * as formatters from './formatters';
