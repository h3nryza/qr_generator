/**
 * @fileoverview Validation functions for all 15 QR code types.
 *
 * Each validator accepts a loosely-typed `Record<string, unknown>` (the shape
 * coming from the form / batch CSV import) and returns a {@link ValidationResult}
 * indicating whether the data is valid and, if not, which fields failed and why.
 *
 * Validators are intentionally run **before** the corresponding formatter so
 * that formatters can safely cast their input to the strongly-typed interfaces
 * defined in `formatters.ts`.
 *
 * @module validators
 */

// ---------------------------------------------------------------------------
// Result type
// ---------------------------------------------------------------------------

/**
 * The outcome of a QR data validation pass.
 *
 * When `valid` is `true`, `errors` is guaranteed to be an empty array.
 * When `valid` is `false`, `errors` contains one or more human-readable
 * messages describing which fields failed validation and why.
 */
export interface ValidationResult {
  /** Whether the data passed all validation checks. */
  valid: boolean;
  /** List of human-readable error messages (empty when valid). */
  errors: string[];
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Creates a passing {@link ValidationResult} with no errors.
 *
 * @returns A ValidationResult where `valid` is `true` and `errors` is `[]`
 */
function pass(): ValidationResult {
  return { valid: true, errors: [] };
}

/**
 * Creates a failing {@link ValidationResult} from a list of error messages.
 *
 * @param errors - One or more error strings describing what failed
 * @returns A ValidationResult where `valid` is `false`
 */
function fail(errors: string[]): ValidationResult {
  return { valid: false, errors };
}

/**
 * Type-guard that checks whether a value is a non-empty string.
 *
 * @param value - The value to test
 * @returns `true` if the value is a string with at least one non-whitespace character
 */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Type-guard that checks whether a value is a finite number.
 *
 * @param value - The value to test
 * @returns `true` if the value is a number and is finite (not NaN / Infinity)
 */
function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Regex pattern for a basic email address check.
 *
 * Intentionally permissive -- catches the most common malformed addresses
 * without rejecting valid ones that use unusual TLDs or sub-addressing.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Regex pattern for a basic URL check.
 *
 * Accepts URLs with or without a protocol prefix. The formatter will
 * auto-prepend `https://` when the protocol is missing.
 */
const URL_REGEX = /^(https?:\/\/)?[\w][\w.-]*\.[a-z]{2,}(\/\S*)?$/i;

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------

/**
 * Validates data for a **URL** QR code.
 *
 * Rules:
 * - `url` field must exist and be a non-empty string.
 * - `url` must look like a plausible URL (domain with TLD, optional protocol).
 *
 * @param data - The loosely-typed form data to validate
 * @returns A {@link ValidationResult} indicating success or listing errors
 *
 * @example
 * ```ts
 * validateUrl({ url: 'https://example.com' });
 * // => { valid: true, errors: [] }
 *
 * validateUrl({ url: '' });
 * // => { valid: false, errors: ['URL is required.'] }
 * ```
 */
export function validateUrl(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!isNonEmptyString(data.url)) {
    errors.push('URL is required.');
  } else if (!URL_REGEX.test(data.url.trim())) {
    errors.push('URL does not appear to be valid. Include a domain with a TLD (e.g. example.com).');
  }

  return errors.length > 0 ? fail(errors) : pass();
}

/**
 * Validates data for a **plain text** QR code.
 *
 * Rules:
 * - `text` field must exist and be a non-empty string.
 *
 * @param data - The loosely-typed form data to validate
 * @returns A {@link ValidationResult} indicating success or listing errors
 *
 * @example
 * ```ts
 * validateText({ text: 'Hello, world!' });
 * // => { valid: true, errors: [] }
 * ```
 */
export function validateText(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!isNonEmptyString(data.text)) {
    errors.push('Text content is required.');
  }

  return errors.length > 0 ? fail(errors) : pass();
}

/**
 * Validates data for an **email** (mailto:) QR code.
 *
 * Rules:
 * - `to` field must exist and be a non-empty string.
 * - `to` field must match a basic email format.
 *
 * @param data - The loosely-typed form data to validate
 * @returns A {@link ValidationResult} indicating success or listing errors
 *
 * @example
 * ```ts
 * validateEmail({ to: 'user@example.com', subject: 'Hi' });
 * // => { valid: true, errors: [] }
 *
 * validateEmail({ to: 'not-an-email' });
 * // => { valid: false, errors: ['Recipient email address is not valid.'] }
 * ```
 */
export function validateEmail(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!isNonEmptyString(data.to)) {
    errors.push('Recipient email address (to) is required.');
  } else if (!EMAIL_REGEX.test(data.to.trim())) {
    errors.push('Recipient email address is not valid.');
  }

  return errors.length > 0 ? fail(errors) : pass();
}

/**
 * Validates data for a **phone** (tel:) QR code.
 *
 * Rules:
 * - `number` field must exist and be a non-empty string.
 *
 * @param data - The loosely-typed form data to validate
 * @returns A {@link ValidationResult} indicating success or listing errors
 *
 * @example
 * ```ts
 * validatePhone({ number: '+27123456789' });
 * // => { valid: true, errors: [] }
 * ```
 */
export function validatePhone(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!isNonEmptyString(data.number)) {
    errors.push('Phone number is required.');
  }

  return errors.length > 0 ? fail(errors) : pass();
}

/**
 * Validates data for an **SMS** (SMSTO:) QR code.
 *
 * Rules:
 * - `number` field must exist and be a non-empty string.
 *
 * @param data - The loosely-typed form data to validate
 * @returns A {@link ValidationResult} indicating success or listing errors
 *
 * @example
 * ```ts
 * validateSms({ number: '+27123456789', message: 'Hello' });
 * // => { valid: true, errors: [] }
 * ```
 */
export function validateSms(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!isNonEmptyString(data.number)) {
    errors.push('Phone number is required.');
  }

  return errors.length > 0 ? fail(errors) : pass();
}

/**
 * Validates data for a **WiFi** network QR code.
 *
 * Rules:
 * - `ssid` field must exist and be a non-empty string.
 * - `encryption` field must be one of `'WPA'`, `'WEP'`, or `'nopass'`.
 *
 * @param data - The loosely-typed form data to validate
 * @returns A {@link ValidationResult} indicating success or listing errors
 *
 * @example
 * ```ts
 * validateWifi({ ssid: 'MyNetwork', encryption: 'WPA', password: 'secret' });
 * // => { valid: true, errors: [] }
 *
 * validateWifi({ ssid: '', encryption: 'INVALID' });
 * // => { valid: false, errors: ['SSID is required.', 'Encryption must be WPA, WEP, or nopass.'] }
 * ```
 */
export function validateWifi(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const validEncryptions = ['WPA', 'WEP', 'nopass'];

  if (!isNonEmptyString(data.ssid)) {
    errors.push('SSID (network name) is required.');
  }

  if (!isNonEmptyString(data.encryption) || !validEncryptions.includes(data.encryption)) {
    errors.push('Encryption must be WPA, WEP, or nopass.');
  }

  return errors.length > 0 ? fail(errors) : pass();
}

/**
 * Validates data for a **vCard** (digital business card) QR code.
 *
 * Rules:
 * - At least one of `firstName` or `lastName` must be a non-empty string.
 *
 * @param data - The loosely-typed form data to validate
 * @returns A {@link ValidationResult} indicating success or listing errors
 *
 * @example
 * ```ts
 * validateVcard({ firstName: 'John', lastName: 'Doe' });
 * // => { valid: true, errors: [] }
 *
 * validateVcard({});
 * // => { valid: false, errors: ['At least a first name or last name is required.'] }
 * ```
 */
export function validateVcard(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  const hasFirst = isNonEmptyString(data.firstName);
  const hasLast = isNonEmptyString(data.lastName);

  if (!hasFirst && !hasLast) {
    errors.push('At least a first name or last name is required.');
  }

  return errors.length > 0 ? fail(errors) : pass();
}

/**
 * Validates data for a **MeCard** (compact contact card) QR code.
 *
 * Rules:
 * - At least one of `firstName`, `lastName`, or `name` must be a non-empty string.
 *   (`name` is accepted for compatibility with the types/index.ts MeCardData interface.)
 *
 * @param data - The loosely-typed form data to validate
 * @returns A {@link ValidationResult} indicating success or listing errors
 *
 * @example
 * ```ts
 * validateMecard({ firstName: 'John' });
 * // => { valid: true, errors: [] }
 *
 * validateMecard({ name: 'John Doe' });
 * // => { valid: true, errors: [] }
 * ```
 */
export function validateMecard(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  const hasFirst = isNonEmptyString(data.firstName);
  const hasLast = isNonEmptyString(data.lastName);
  const hasName = isNonEmptyString(data.name);

  if (!hasFirst && !hasLast && !hasName) {
    errors.push('At least a first name or last name is required.');
  }

  return errors.length > 0 ? fail(errors) : pass();
}

/**
 * Validates data for a **calendar event** (iCal VEVENT) QR code.
 *
 * Rules:
 * - `title` field must exist and be a non-empty string.
 * - `startDate` field must exist and be a non-empty string (ISO 8601 format expected).
 *
 * @param data - The loosely-typed form data to validate
 * @returns A {@link ValidationResult} indicating success or listing errors
 *
 * @example
 * ```ts
 * validateCalendar({ title: 'Meeting', startDate: '2026-03-25T14:00:00Z' });
 * // => { valid: true, errors: [] }
 * ```
 */
export function validateCalendar(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!isNonEmptyString(data.title)) {
    errors.push('Event title is required.');
  }

  if (!isNonEmptyString(data.startDate) && !(data.startDate instanceof Date)) {
    errors.push('Start date is required.');
  }

  return errors.length > 0 ? fail(errors) : pass();
}

/**
 * Validates data for a **geolocation** (geo:) QR code.
 *
 * Rules:
 * - `latitude` must be a finite number between -90 and 90 (inclusive).
 * - `longitude` must be a finite number between -180 and 180 (inclusive).
 *
 * @param data - The loosely-typed form data to validate
 * @returns A {@link ValidationResult} indicating success or listing errors
 *
 * @example
 * ```ts
 * validateGeo({ latitude: 37.7749, longitude: -122.4194 });
 * // => { valid: true, errors: [] }
 *
 * validateGeo({ latitude: 100, longitude: 0 });
 * // => { valid: false, errors: ['Latitude must be between -90 and 90.'] }
 * ```
 */
export function validateGeo(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!isFiniteNumber(data.latitude)) {
    errors.push('Latitude is required and must be a number.');
  } else if (data.latitude < -90 || data.latitude > 90) {
    errors.push('Latitude must be between -90 and 90.');
  }

  if (!isFiniteNumber(data.longitude)) {
    errors.push('Longitude is required and must be a number.');
  } else if (data.longitude < -180 || data.longitude > 180) {
    errors.push('Longitude must be between -180 and 180.');
  }

  return errors.length > 0 ? fail(errors) : pass();
}

/**
 * Validates data for a **cryptocurrency** payment QR code.
 *
 * Rules:
 * - `address` field must exist and be a non-empty string.
 * - `currency` (or legacy `type`) field must be one of `'bitcoin'`, `'ethereum'`, or `'litecoin'`.
 *
 * @param data - The loosely-typed form data to validate
 * @returns A {@link ValidationResult} indicating success or listing errors
 *
 * @example
 * ```ts
 * validateCrypto({ currency: 'bitcoin', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' });
 * // => { valid: true, errors: [] }
 * ```
 */
export function validateCrypto(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const validCurrencies = ['bitcoin', 'ethereum', 'litecoin'];

  if (!isNonEmptyString(data.address)) {
    errors.push('Wallet address is required.');
  }

  // Accept both `currency` (types/index.ts) and `type` (formatters.ts) field names
  const currency = data.currency ?? data.type;
  if (!isNonEmptyString(currency as unknown) || !validCurrencies.includes(currency as string)) {
    errors.push('Currency must be one of: bitcoin, ethereum, litecoin.');
  }

  return errors.length > 0 ? fail(errors) : pass();
}

/**
 * Validates data for an **EPC/SEPA** payment QR code.
 *
 * Rules:
 * - `name` field must exist and be a non-empty string (max 70 characters).
 * - `iban` field must exist and be a non-empty string.
 *
 * @param data - The loosely-typed form data to validate
 * @returns A {@link ValidationResult} indicating success or listing errors
 *
 * @example
 * ```ts
 * validateEpc({ name: 'Red Cross', iban: 'DE89370400440532013000' });
 * // => { valid: true, errors: [] }
 * ```
 */
export function validateEpc(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!isNonEmptyString(data.name)) {
    errors.push('Recipient name is required.');
  } else if ((data.name as string).trim().length > 70) {
    errors.push('Recipient name must be 70 characters or fewer.');
  }

  if (!isNonEmptyString(data.iban)) {
    errors.push('IBAN is required.');
  }

  return errors.length > 0 ? fail(errors) : pass();
}

/**
 * Validates data for a **WhatsApp** deep-link QR code.
 *
 * Rules:
 * - `number` field must exist and be a non-empty string.
 *
 * @param data - The loosely-typed form data to validate
 * @returns A {@link ValidationResult} indicating success or listing errors
 *
 * @example
 * ```ts
 * validateWhatsapp({ number: '+27123456789' });
 * // => { valid: true, errors: [] }
 * ```
 */
export function validateWhatsapp(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!isNonEmptyString(data.number)) {
    errors.push('WhatsApp phone number is required.');
  }

  return errors.length > 0 ? fail(errors) : pass();
}

/**
 * Validates data for a **social media hub** (multi-link) QR code.
 *
 * Rules:
 * - `links` field must be a non-empty array.
 * - At least one link entry must have a non-empty `url` property.
 *
 * @param data - The loosely-typed form data to validate
 * @returns A {@link ValidationResult} indicating success or listing errors
 *
 * @example
 * ```ts
 * validateSocial({
 *   links: [
 *     { platform: 'Instagram', url: 'https://instagram.com/example' },
 *   ],
 * });
 * // => { valid: true, errors: [] }
 *
 * validateSocial({ links: [] });
 * // => { valid: false, errors: ['At least one social link with a URL is required.'] }
 * ```
 */
export function validateSocial(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!Array.isArray(data.links) || data.links.length === 0) {
    errors.push('At least one social link is required.');
    return fail(errors);
  }

  const hasValidLink = (data.links as Array<Record<string, unknown>>).some(
    (link) => isNonEmptyString(link.url),
  );

  if (!hasValidLink) {
    errors.push('At least one social link with a non-empty URL is required.');
  }

  return errors.length > 0 ? fail(errors) : pass();
}

/**
 * Validates data for an **App Store** download QR code.
 *
 * Rules:
 * - `appName` field must exist and be a non-empty string.
 * - At least one of `iosUrl` or `androidUrl` must be a non-empty string.
 *
 * @param data - The loosely-typed form data to validate
 * @returns A {@link ValidationResult} indicating success or listing errors
 *
 * @example
 * ```ts
 * validateAppstore({
 *   appName: 'My App',
 *   iosUrl: 'https://apps.apple.com/app/my-app/id123456',
 * });
 * // => { valid: true, errors: [] }
 *
 * validateAppstore({ appName: 'My App' });
 * // => { valid: false, errors: ['At least one store URL (iOS or Android) is required.'] }
 * ```
 */
export function validateAppstore(data: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  if (!isNonEmptyString(data.appName)) {
    errors.push('App name is required.');
  }

  const hasIos = isNonEmptyString(data.iosUrl);
  const hasAndroid = isNonEmptyString(data.androidUrl);

  if (!hasIos && !hasAndroid) {
    errors.push('At least one store URL (iOS or Android) is required.');
  }

  return errors.length > 0 ? fail(errors) : pass();
}
