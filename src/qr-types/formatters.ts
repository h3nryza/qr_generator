/**
 * @module formatters
 * @description QR code data formatter functions for all 15 QR types.
 *
 * Each formatter takes a typed data object and returns the string payload
 * that gets encoded into the QR code. All output strings follow their
 * respective standards (RFC 6350 for vCard, EPC069-12 for SEPA, etc.).
 */

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/**
 * Escapes special characters for WiFi and MeCard QR formats.
 * Characters that must be escaped: `\`, `;`, `,`, `"`, `:`
 *
 * @param value - The raw string to escape
 * @returns The escaped string safe for WiFi/MeCard payloads
 */
function escapeSpecial(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/"/g, '\\"')
    .replace(/:/g, '\\:');
}

/**
 * Formats a Date object into an iCal-compatible datetime string.
 * Produces the format `YYYYMMDDTHHmmssZ` for UTC datetimes,
 * or `YYYYMMDD` for all-day events.
 *
 * @param date - The date to format
 * @param allDay - Whether this is an all-day event (omits time component)
 * @returns The iCal-formatted date string
 */
function formatICalDate(date: Date | string, allDay = false): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');

  if (allDay) {
    return `${year}${month}${day}`;
  }

  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  const seconds = String(d.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

// ---------------------------------------------------------------------------
// Type definitions for formatter inputs
// ---------------------------------------------------------------------------

/** Data for a URL QR code, optionally including UTM parameters. */
export interface UrlData {
  /** The target URL (protocol will be auto-prepended if missing) */
  url: string;
  /** UTM source parameter */
  utmSource?: string;
  /** UTM medium parameter */
  utmMedium?: string;
  /** UTM campaign parameter */
  utmCampaign?: string;
  /** UTM term parameter */
  utmTerm?: string;
  /** UTM content parameter */
  utmContent?: string;
}

/** Data for a plain text QR code. */
export interface TextData {
  /** The raw text content to encode */
  text: string;
}

/** Data for a mailto: QR code. */
export interface EmailData {
  /** Primary recipient email address */
  to: string;
  /** CC recipients (comma-separated) */
  cc?: string;
  /** BCC recipients (comma-separated) */
  bcc?: string;
  /** Email subject line */
  subject?: string;
  /** Email body text */
  body?: string;
}

/** Data for a tel: QR code. */
export interface PhoneData {
  /** Full phone number including country code (e.g., +27123456789) */
  number: string;
}

/** Data for an SMS QR code. */
export interface SmsData {
  /** Full phone number including country code */
  number: string;
  /** Pre-filled SMS message body */
  message?: string;
}

/** Supported WiFi encryption types. */
export type WifiEncryption = 'WPA' | 'WEP' | 'nopass';

/** Data for a WiFi QR code. */
export interface WifiData {
  /** The network SSID (case-sensitive) */
  ssid: string;
  /** The network password (omit for open networks) */
  password?: string;
  /** Encryption type: WPA, WEP, or nopass */
  encryption: WifiEncryption;
  /** Whether the network is hidden */
  hidden?: boolean;
}

/** A single phone entry in a vCard with its type label. */
export interface VCardPhone {
  /** Phone number string */
  number: string;
  /** Phone type label (CELL, WORK, HOME, FAX) */
  type: 'CELL' | 'WORK' | 'HOME' | 'FAX';
}

/** A single email entry in a vCard with its type label. */
export interface VCardEmail {
  /** Email address */
  address: string;
  /** Email type label (WORK, HOME, INTERNET) */
  type: 'WORK' | 'HOME' | 'INTERNET';
}

/** Structured address for vCard. */
export interface VCardAddress {
  /** Street address */
  street?: string;
  /** City name */
  city?: string;
  /** State or province */
  state?: string;
  /** Postal or ZIP code */
  postalCode?: string;
  /** Country name */
  country?: string;
}

/** Data for a vCard 3.0 QR code (digital business card). */
export interface VCardData {
  /** Name prefix (Mr., Mrs., Dr., etc.) */
  prefix?: string;
  /** First name */
  firstName?: string;
  /** Last name */
  lastName?: string;
  /** Name suffix (Jr., Sr., III, etc.) */
  suffix?: string;
  /** List of phone numbers with types */
  phones?: VCardPhone[];
  /** List of email addresses with types */
  emails?: VCardEmail[];
  /** Company or organization name */
  organization?: string;
  /** Job title */
  title?: string;
  /** Department within the organization */
  department?: string;
  /** Structured address */
  address?: VCardAddress;
  /** Website URL */
  url?: string;
  /** Birthday in YYYY-MM-DD or YYYYMMDD format */
  birthday?: string;
  /** URL to a photo */
  photoUrl?: string;
  /** Free-form notes */
  note?: string;
  /** Social media profile URLs */
  socialUrls?: { platform: string; url: string }[];
}

/** Data for a MeCard QR code (compact contact format). */
export interface MeCardData {
  /** Last name */
  lastName?: string;
  /** First name */
  firstName?: string;
  /** Phone number */
  phone?: string;
  /** Email address */
  email?: string;
  /** Organization / company name */
  organization?: string;
  /** Website URL */
  url?: string;
  /** Single-line address */
  address?: string;
  /** Free-form notes */
  note?: string;
}

/** Data for a calendar event QR code (iCal VEVENT format). */
export interface CalendarData {
  /** Event title / summary (required) */
  title: string;
  /** Event start date/time (ISO 8601 string or Date) */
  startDate: string | Date;
  /** Event end date/time (ISO 8601 string or Date) */
  endDate?: string | Date;
  /** Whether this is an all-day event */
  allDay?: boolean;
  /** Event location */
  location?: string;
  /** Event description */
  description?: string;
  /** Reminder trigger in minutes before the event (e.g., 15 = 15 min before) */
  reminder?: number;
}

/** Data for a geo location QR code. */
export interface GeoData {
  /** Latitude (-90 to 90) */
  latitude: number;
  /** Longitude (-180 to 180) */
  longitude: number;
  /** Human-readable location label */
  label?: string;
}

/** Supported cryptocurrency types. */
export type CryptoType = 'bitcoin' | 'ethereum' | 'litecoin';

/** Data for a cryptocurrency payment QR code. */
export interface CryptoData {
  /** Cryptocurrency type */
  type: CryptoType;
  /** Wallet address */
  address: string;
  /** Payment amount (optional) */
  amount?: number;
  /** Label or name for the payment */
  label?: string;
  /** Human-readable message or memo */
  message?: string;
}

/** Data for an EPC/SEPA payment QR code (EPC069-12 standard). */
export interface EpcData {
  /** Recipient name (max 70 characters) */
  name: string;
  /** IBAN (International Bank Account Number) */
  iban: string;
  /** BIC / SWIFT code (8 or 11 characters, optional for domestic) */
  bic?: string;
  /** Payment amount in EUR (max 999,999,999.99) */
  amount?: number;
  /** Structured payment reference (e.g., invoice number) */
  reference?: string;
  /** Unstructured remittance text */
  text?: string;
}

/** Data for a WhatsApp QR code. */
export interface WhatsAppData {
  /** Phone number in international format (digits only, no + prefix needed) */
  number: string;
  /** Pre-filled message text */
  message?: string;
}

/** A single social media platform entry. */
export interface SocialLink {
  /** Platform name (e.g., "Facebook", "Instagram", "Custom") */
  platform: string;
  /** Profile or page URL */
  url: string;
}

/** Data for a Social Media Hub QR code. */
export interface SocialHubData {
  /** Display title for the hub */
  title?: string;
  /** List of social platform links */
  links: SocialLink[];
}

/** Data for an App Store links QR code. */
export interface AppStoreData {
  /** App name or label */
  appName: string;
  /** iOS App Store URL */
  iosUrl?: string;
  /** Google Play Store URL */
  androidUrl?: string;
  /** Fallback URL for other platforms */
  fallbackUrl?: string;
}

// ---------------------------------------------------------------------------
// Formatter functions
// ---------------------------------------------------------------------------

/**
 * Formats URL data into a QR code payload string.
 *
 * Auto-prepends `https://` if no protocol is present. Appends any
 * provided UTM parameters as query string values.
 *
 * @param data - The URL data including optional UTM parameters
 * @returns The fully-formed URL string with UTM params appended
 *
 * @example
 * ```ts
 * formatUrl({ url: 'example.com', utmSource: 'flyer' })
 * // => "https://example.com?utm_source=flyer"
 * ```
 */
export function formatUrl(data: UrlData): string {
  let url = data.url.trim();

  // Auto-prepend protocol if missing
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  // Build UTM params
  const utmParams: Record<string, string> = {};
  if (data.utmSource) utmParams['utm_source'] = data.utmSource;
  if (data.utmMedium) utmParams['utm_medium'] = data.utmMedium;
  if (data.utmCampaign) utmParams['utm_campaign'] = data.utmCampaign;
  if (data.utmTerm) utmParams['utm_term'] = data.utmTerm;
  if (data.utmContent) utmParams['utm_content'] = data.utmContent;

  const utmString = new URLSearchParams(utmParams).toString();
  if (utmString) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}${utmString}`;
  }

  return url;
}

/**
 * Formats plain text data into a QR code payload string.
 *
 * Returns the text as-is. QR codes natively support raw text payloads.
 *
 * @param data - The text data to encode
 * @returns The raw text string
 *
 * @example
 * ```ts
 * formatText({ text: 'Hello, world!' })
 * // => "Hello, world!"
 * ```
 */
export function formatText(data: TextData): string {
  return data.text;
}

/**
 * Formats email data into a `mailto:` URI string.
 *
 * Constructs an RFC 6068-compliant mailto URI with optional CC, BCC,
 * subject, and body parameters. All values are properly URI-encoded.
 *
 * @param data - The email data (to, cc, bcc, subject, body)
 * @returns A `mailto:` URI string
 *
 * @example
 * ```ts
 * formatEmail({ to: 'user@example.com', subject: 'Hello', body: 'Hi there' })
 * // => "mailto:user@example.com?subject=Hello&body=Hi%20there"
 * ```
 */
export function formatEmail(data: EmailData): string {
  const params: string[] = [];

  if (data.cc) params.push(`cc=${encodeURIComponent(data.cc)}`);
  if (data.bcc) params.push(`bcc=${encodeURIComponent(data.bcc)}`);
  if (data.subject) params.push(`subject=${encodeURIComponent(data.subject)}`);
  if (data.body) params.push(`body=${encodeURIComponent(data.body)}`);

  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return `mailto:${data.to.trim()}${query}`;
}

/**
 * Formats phone data into a `tel:` URI string.
 *
 * Strips all non-essential characters (spaces, dashes, parentheses)
 * from the number but preserves the leading `+` for international format.
 *
 * @param data - The phone data containing the number
 * @returns A `tel:` URI string
 *
 * @example
 * ```ts
 * formatPhone({ number: '+27 123-456-7890' })
 * // => "tel:+271234567890"
 * ```
 */
export function formatPhone(data: PhoneData): string {
  const cleaned = data.number.trim().replace(/[\s\-()]/g, '');
  return `tel:${cleaned}`;
}

/**
 * Formats SMS data into an `SMSTO:` URI string.
 *
 * Uses the `SMSTO:number:message` format which has the widest
 * compatibility across mobile devices and QR readers.
 *
 * @param data - The SMS data (phone number and optional message)
 * @returns An `SMSTO:` URI string
 *
 * @example
 * ```ts
 * formatSms({ number: '+27123456789', message: 'Hello!' })
 * // => "SMSTO:+27123456789:Hello!"
 * ```
 */
export function formatSms(data: SmsData): string {
  const cleaned = data.number.trim().replace(/[\s\-()]/g, '');
  if (data.message) {
    return `SMSTO:${cleaned}:${data.message}`;
  }
  return `SMSTO:${cleaned}`;
}

/**
 * Formats WiFi data into the standard WiFi QR code string.
 *
 * Follows the `WIFI:T:type;S:ssid;P:password;H:hidden;;` format.
 * Special characters in SSID and password are properly escaped.
 *
 * @param data - The WiFi network data (SSID, password, encryption, hidden)
 * @returns A WiFi configuration string
 *
 * @example
 * ```ts
 * formatWifi({ ssid: 'MyNetwork', password: 'pass123', encryption: 'WPA', hidden: false })
 * // => "WIFI:T:WPA;S:MyNetwork;P:pass123;H:false;;"
 * ```
 */
export function formatWifi(data: WifiData): string {
  const ssid = escapeSpecial(data.ssid);
  const password = data.password ? escapeSpecial(data.password) : '';
  const hidden = data.hidden ? 'true' : 'false';

  return `WIFI:T:${data.encryption};S:${ssid};P:${password};H:${hidden};;`;
}

/**
 * Formats vCard data into a vCard 3.0 compliant string.
 *
 * Generates a full vCard 3.0 payload (per RFC 6350) with all supported
 * fields: name, organization, title, phones, emails, address, URL,
 * birthday, photo, notes, and social media URLs (as X-SOCIALPROFILE).
 *
 * @param data - The vCard data with all contact fields
 * @returns A vCard 3.0 formatted string
 *
 * @example
 * ```ts
 * formatVCard({
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   prefix: 'Mr.',
 *   organization: 'Acme Corp',
 *   phones: [{ number: '+27123456789', type: 'CELL' }],
 *   emails: [{ address: 'john@acme.com', type: 'WORK' }],
 * })
 * // => "BEGIN:VCARD\nVERSION:3.0\nN:Doe;John;;Mr.;\nFN:Mr. John Doe\n..."
 * ```
 */
export function formatVCard(data: VCardData): string {
  const lines: string[] = [];
  lines.push('BEGIN:VCARD');
  lines.push('VERSION:3.0');

  // N: Last;First;Middle;Prefix;Suffix
  const lastName = data.lastName || '';
  const firstName = data.firstName || '';
  const prefix = data.prefix || '';
  const suffix = data.suffix || '';
  lines.push(`N:${lastName};${firstName};;${prefix};${suffix}`);

  // FN: Formatted full name
  const fnParts = [prefix, firstName, lastName, suffix].filter(Boolean);
  lines.push(`FN:${fnParts.join(' ')}`);

  // Organization and title
  if (data.organization) {
    const orgValue = data.department
      ? `${data.organization};${data.department}`
      : data.organization;
    lines.push(`ORG:${orgValue}`);
  }
  if (data.title) lines.push(`TITLE:${data.title}`);

  // Phone numbers
  if (data.phones) {
    for (const phone of data.phones) {
      lines.push(`TEL;TYPE=${phone.type}:${phone.number}`);
    }
  }

  // Email addresses
  if (data.emails) {
    for (const email of data.emails) {
      lines.push(`EMAIL;TYPE=${email.type}:${email.address}`);
    }
  }

  // Address: ADR;TYPE=type:PO Box;Extended;Street;City;State;Postal;Country
  if (data.address) {
    const addr = data.address;
    const street = addr.street || '';
    const city = addr.city || '';
    const state = addr.state || '';
    const postal = addr.postalCode || '';
    const country = addr.country || '';
    lines.push(`ADR;TYPE=WORK:;;${street};${city};${state};${postal};${country}`);
  }

  // URL
  if (data.url) lines.push(`URL:${data.url}`);

  // Birthday (YYYYMMDD format)
  if (data.birthday) {
    const bday = data.birthday.replace(/-/g, '');
    lines.push(`BDAY:${bday}`);
  }

  // Photo URL
  if (data.photoUrl) {
    lines.push(`PHOTO;VALUE=URI:${data.photoUrl}`);
  }

  // Note
  if (data.note) lines.push(`NOTE:${data.note}`);

  // Social media URLs as X-SOCIALPROFILE
  if (data.socialUrls) {
    for (const social of data.socialUrls) {
      lines.push(`X-SOCIALPROFILE;TYPE=${social.platform.toLowerCase()}:${social.url}`);
    }
  }

  lines.push('END:VCARD');
  return lines.join('\n');
}

/**
 * Formats MeCard data into the MECARD QR code string.
 *
 * MeCard is a more compact alternative to vCard, using the format
 * `MECARD:N:name;TEL:phone;EMAIL:email;...;;`. Best used when QR
 * code size is a constraint and only basic contact info is needed.
 * Special characters in values are escaped.
 *
 * @param data - The MeCard contact data
 * @returns A MECARD formatted string
 *
 * @example
 * ```ts
 * formatMeCard({ lastName: 'Doe', firstName: 'John', phone: '+27123456789' })
 * // => "MECARD:N:Doe,John;TEL:+27123456789;;"
 * ```
 */
export function formatMeCard(data: MeCardData): string {
  const parts: string[] = [];

  // Name: Last,First
  const nameParts = [data.lastName, data.firstName].filter(Boolean);
  if (nameParts.length > 0) {
    parts.push(`N:${escapeSpecial(nameParts.join(','))}`);
  }

  if (data.phone) parts.push(`TEL:${data.phone}`);
  if (data.email) parts.push(`EMAIL:${data.email}`);
  if (data.organization) parts.push(`ORG:${escapeSpecial(data.organization)}`);
  if (data.url) parts.push(`URL:${data.url}`);
  if (data.address) parts.push(`ADR:${escapeSpecial(data.address)}`);
  if (data.note) parts.push(`NOTE:${escapeSpecial(data.note)}`);

  return `MECARD:${parts.join(';')};;`;
}

/**
 * Formats calendar event data into a VCALENDAR/VEVENT iCal string.
 *
 * Produces a standards-compliant iCalendar payload containing a single
 * VEVENT. Supports all-day events, location, description, and optional
 * VALARM reminders. Dates are formatted in UTC.
 *
 * @param data - The calendar event data
 * @returns A VCALENDAR formatted string with an embedded VEVENT
 *
 * @example
 * ```ts
 * formatCalendar({
 *   title: 'Team Meeting',
 *   startDate: '2026-03-25T14:00:00Z',
 *   endDate: '2026-03-25T15:00:00Z',
 *   location: 'Conference Room A',
 *   reminder: 15,
 * })
 * // => "BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:Team Meeting\n..."
 * ```
 */
export function formatCalendar(data: CalendarData): string {
  const lines: string[] = [];
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('BEGIN:VEVENT');

  lines.push(`SUMMARY:${data.title}`);

  const isAllDay = data.allDay ?? false;

  if (isAllDay) {
    lines.push(`DTSTART;VALUE=DATE:${formatICalDate(data.startDate, true)}`);
    if (data.endDate) {
      lines.push(`DTEND;VALUE=DATE:${formatICalDate(data.endDate, true)}`);
    }
  } else {
    lines.push(`DTSTART:${formatICalDate(data.startDate)}`);
    if (data.endDate) {
      lines.push(`DTEND:${formatICalDate(data.endDate)}`);
    }
  }

  if (data.location) lines.push(`LOCATION:${data.location}`);
  if (data.description) lines.push(`DESCRIPTION:${data.description}`);

  // Alarm / reminder
  if (data.reminder != null && data.reminder > 0) {
    lines.push('BEGIN:VALARM');
    lines.push(`TRIGGER:-PT${data.reminder}M`);
    lines.push('ACTION:DISPLAY');
    lines.push('END:VALARM');
  }

  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');
  return lines.join('\n');
}

/**
 * Formats geolocation data into a `geo:` URI string.
 *
 * Follows RFC 5870 format: `geo:lat,lon`. If a human-readable label
 * is provided, it is appended as `?q=label` for map applications
 * that support query labels.
 *
 * @param data - The geolocation data (latitude, longitude, optional label)
 * @returns A `geo:` URI string
 *
 * @example
 * ```ts
 * formatGeo({ latitude: 37.7749, longitude: -122.4194, label: 'San Francisco' })
 * // => "geo:37.7749,-122.4194?q=San+Francisco"
 * ```
 */
export function formatGeo(data: GeoData): string {
  let uri = `geo:${data.latitude},${data.longitude}`;
  if (data.label) {
    uri += `?q=${encodeURIComponent(data.label).replace(/%20/g, '+')}`;
  }
  return uri;
}

/**
 * Formats cryptocurrency payment data into the appropriate URI scheme.
 *
 * Supports Bitcoin (`bitcoin:`), Ethereum (`ethereum:`), and Litecoin
 * (`litecoin:`) URI schemes. Optional amount, label, and message are
 * appended as query parameters. For Ethereum, the amount parameter
 * uses `value` instead of `amount` per EIP-681.
 *
 * @param data - The cryptocurrency payment data
 * @returns A cryptocurrency URI string
 *
 * @example
 * ```ts
 * formatCrypto({
 *   type: 'bitcoin',
 *   address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
 *   amount: 0.5,
 *   message: 'Payment',
 * })
 * // => "bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.5&message=Payment"
 * ```
 */
export function formatCrypto(data: CryptoData): string {
  const params: string[] = [];

  if (data.amount != null) {
    // Ethereum uses "value" param; Bitcoin/Litecoin use "amount"
    const amountKey = data.type === 'ethereum' ? 'value' : 'amount';
    params.push(`${amountKey}=${data.amount}`);
  }
  if (data.label) params.push(`label=${encodeURIComponent(data.label)}`);
  if (data.message) params.push(`message=${encodeURIComponent(data.message)}`);

  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return `${data.type}:${data.address.trim()}${query}`;
}

/**
 * Formats EPC/SEPA payment data into the EPC069-12 QR code standard.
 *
 * Produces a 12-line structured payload per the European Payments Council
 * EPC069-12 specification. The format uses:
 * - BCD (service tag)
 * - Version 002
 * - Character set 1 (UTF-8)
 * - SCT (SEPA Credit Transfer identification)
 *
 * Used primarily in Austria, Belgium, Finland, Germany, and the Netherlands.
 *
 * @param data - The EPC/SEPA payment data
 * @returns An EPC069-12 formatted multi-line string
 *
 * @example
 * ```ts
 * formatEpc({
 *   name: 'Red Cross',
 *   iban: 'DE89370400440532013000',
 *   bic: 'COBADEFFXXX',
 *   amount: 50.00,
 *   reference: 'INV-2026-001',
 * })
 * // => "BCD\n002\n1\nSCT\nCOBADEFFXXX\nRed Cross\nDE89370400440532013000\nEUR50.00\n\nINV-2026-001\n\n"
 * ```
 */
export function formatEpc(data: EpcData): string {
  const lines: string[] = [];

  // Line 1: Service tag (fixed)
  lines.push('BCD');
  // Line 2: Version (002)
  lines.push('002');
  // Line 3: Character set (1 = UTF-8)
  lines.push('1');
  // Line 4: Identification (SCT = SEPA Credit Transfer)
  lines.push('SCT');
  // Line 5: BIC of the beneficiary bank (optional)
  lines.push(data.bic?.trim() || '');
  // Line 6: Name of the beneficiary (max 70 chars)
  lines.push(data.name.trim().substring(0, 70));
  // Line 7: IBAN
  lines.push(data.iban.replace(/\s/g, '').toUpperCase());
  // Line 8: Amount in EUR (format: EUR#.##)
  lines.push(data.amount != null ? `EUR${data.amount.toFixed(2)}` : '');
  // Line 9: Purpose code (empty — optional, rarely used)
  lines.push('');
  // Line 10: Structured remittance reference
  lines.push(data.reference?.trim() || '');
  // Line 11: Unstructured remittance text
  lines.push(data.text?.trim() || '');
  // Line 12: Beneficiary-to-originator information (empty)
  lines.push('');

  return lines.join('\n');
}

/**
 * Formats WhatsApp data into a `wa.me` click-to-chat URL.
 *
 * Generates a WhatsApp deep link using the `https://wa.me/` format.
 * The phone number is cleaned to digits only (leading + is removed
 * as wa.me expects pure digits). The message is URL-encoded.
 *
 * @param data - The WhatsApp data (phone number and optional message)
 * @returns A WhatsApp URL string
 *
 * @example
 * ```ts
 * formatWhatsApp({ number: '+27123456789', message: 'Hello there' })
 * // => "https://wa.me/27123456789?text=Hello%20there"
 * ```
 */
export function formatWhatsApp(data: WhatsAppData): string {
  // wa.me expects digits only, no +, spaces, or dashes
  const cleaned = data.number.trim().replace(/[^\d]/g, '');
  let url = `https://wa.me/${cleaned}`;
  if (data.message) {
    url += `?text=${encodeURIComponent(data.message)}`;
  }
  return url;
}

/**
 * Formats social media hub data into a JSON payload string.
 *
 * Encodes all social platform links as a JSON object. This approach
 * works offline and keeps all data self-contained within the QR code.
 * The JSON structure includes an optional title and an array of
 * platform/URL pairs.
 *
 * Note: QR code capacity limits apply (~2,953 bytes at max version).
 * For many links, consider using a hosted micro-page (Phase 2).
 *
 * @param data - The social media hub data with platform links
 * @returns A JSON string containing all social links
 *
 * @example
 * ```ts
 * formatSocialHub({
 *   title: 'Follow Us',
 *   links: [
 *     { platform: 'Instagram', url: 'https://instagram.com/example' },
 *     { platform: 'Twitter', url: 'https://twitter.com/example' },
 *   ],
 * })
 * // => '{"title":"Follow Us","links":[{"platform":"Instagram","url":"https://instagram.com/example"},...]}'
 * ```
 */
export function formatSocialHub(data: SocialHubData): string {
  const payload: { title?: string; links: { platform: string; url: string }[] } = {
    links: data.links
      .filter((link) => link.url.trim().length > 0)
      .map((link) => ({
        platform: link.platform,
        url: link.url.trim(),
      })),
  };

  if (data.title?.trim()) {
    payload.title = data.title.trim();
  }

  return JSON.stringify(payload);
}

/**
 * Formats App Store data into a smart redirect HTML data URI.
 *
 * Generates a self-contained HTML page (encoded as a data URI) that
 * performs user-agent-based platform detection and redirects to the
 * appropriate app store. Falls back to a generic URL if no platform
 * match is found.
 *
 * If only one store URL is provided, returns that URL directly
 * without the redirect page wrapper.
 *
 * @param data - The app store data (app name, iOS URL, Android URL, fallback)
 * @returns A data URI containing a redirect page, or a direct store URL
 *
 * @example
 * ```ts
 * formatAppStore({
 *   appName: 'My App',
 *   iosUrl: 'https://apps.apple.com/app/my-app/id123456',
 *   androidUrl: 'https://play.google.com/store/apps/details?id=com.example.myapp',
 * })
 * // => "data:text/html;charset=utf-8,..." (a redirect HTML page)
 * ```
 */
export function formatAppStore(data: AppStoreData): string {
  const urls = [data.iosUrl, data.androidUrl, data.fallbackUrl].filter(Boolean);

  // If only one URL, return it directly — no redirect page needed
  if (urls.length === 1) {
    return urls[0]!;
  }

  // Build a self-contained HTML redirect page
  const fallback = data.fallbackUrl || data.iosUrl || data.androidUrl || '#';

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${data.appName}</title>
<script>
(function(){
  var ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) {
    ${data.iosUrl ? `window.location.replace("${data.iosUrl}");` : ''}
  } else if (/Android/i.test(ua)) {
    ${data.androidUrl ? `window.location.replace("${data.androidUrl}");` : ''}
  } else {
    window.location.replace("${fallback}");
  }
})();
</script>
</head>
<body><p>Redirecting to ${data.appName}...</p></body>
</html>`;

  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}
