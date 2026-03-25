/**
 * @fileoverview Batch QR code generation utilities.
 *
 * Provides functions to:
 * 1. Parse an uploaded CSV file into an array of QR data rows, auto-detecting
 *    the QR type from column names.
 * 2. Generate multiple QR codes from those rows and bundle them into a single
 *    ZIP archive for download.
 *
 * **Dependencies:**
 * - `papaparse` — CSV parsing.
 * - `jszip` — ZIP archive creation.
 * - `qr-code-styling` — QR code rendering.
 *
 * @module utils/batch
 *
 * @example
 * ```ts
 * import { parseCSV, generateBatchZip } from '../utils/batch';
 *
 * const file = inputRef.current.files[0];
 * const { rows, detectedType } = await parseCSV(file);
 *
 * const zipBlob = await generateBatchZip(rows, detectedType, customization, (p) => {
 *   setProgress(p);
 * });
 * saveAs(zipBlob, 'qr-codes.zip');
 * ```
 */

import Papa from 'papaparse';
import JSZip from 'jszip';
import QRCodeStyling from 'qr-code-styling';
import type { QRType, QRCustomization } from '../types';
import { MAX_BATCH_ITEMS } from '../config/defaults';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A single parsed row from a CSV file, represented as a string-keyed record.
 *
 * Column names are normalised to lowercase during parsing.
 */
export type CSVRow = Record<string, string>;

/**
 * Result returned by {@link parseCSV}.
 */
export interface ParseCSVResult {
  /** Parsed data rows (capped at {@link MAX_BATCH_ITEMS}). */
  rows: CSVRow[];
  /** The QR type inferred from column headers, or `'text'` if detection fails. */
  detectedType: QRType;
  /** The raw column headers found in the CSV. */
  headers: string[];
}

// ---------------------------------------------------------------------------
// Column-name → QR-type detection
// ---------------------------------------------------------------------------

/**
 * Mapping from known CSV column names (lowercase) to the QR type they imply.
 *
 * The first matching column wins, so the order matters. More specific column
 * names (e.g. `'ssid'`) are checked before generic ones (e.g. `'url'`).
 *
 * @internal
 */
const COLUMN_TYPE_MAP: ReadonlyArray<{ columns: string[]; type: QRType }> = [
  { columns: ['ssid', 'password', 'encryption'], type: 'wifi' },
  { columns: ['firstname', 'first_name', 'lastname', 'last_name', 'vcard'], type: 'vcard' },
  { columns: ['mecard', 'name', 'phone', 'email'], type: 'mecard' },
  { columns: ['iban', 'bic'], type: 'epc' },
  { columns: ['latitude', 'longitude', 'lat', 'lng', 'lon'], type: 'geo' },
  { columns: ['currency', 'address', 'bitcoin', 'ethereum'], type: 'crypto' },
  { columns: ['start_date', 'startdate', 'end_date', 'enddate', 'event'], type: 'calendar' },
  { columns: ['whatsapp'], type: 'whatsapp' },
  { columns: ['ios_url', 'android_url', 'app_name', 'appname'], type: 'appstore' },
  { columns: ['subject', 'body', 'to', 'email_to'], type: 'email' },
  { columns: ['sms', 'message', 'sms_number'], type: 'sms' },
  { columns: ['phone', 'tel', 'phone_number'], type: 'phone' },
  { columns: ['url', 'link', 'website'], type: 'url' },
  { columns: ['text', 'content', 'data'], type: 'text' },
];

/**
 * Attempts to infer the {@link QRType} from a set of CSV column headers.
 *
 * Iterates through {@link COLUMN_TYPE_MAP} and returns the first type whose
 * expected columns have at least one match in the provided headers.
 *
 * @param headers - Lowercased column header names from the CSV.
 * @returns The detected QR type, or `'text'` as a fallback.
 *
 * @internal
 */
function detectQRType(headers: string[]): QRType {
  const headerSet = new Set(headers);

  for (const mapping of COLUMN_TYPE_MAP) {
    const matchCount = mapping.columns.filter((col) => headerSet.has(col)).length;
    if (matchCount > 0) {
      return mapping.type;
    }
  }

  return 'text';
}

// ---------------------------------------------------------------------------
// Row → QR data-string encoding
// ---------------------------------------------------------------------------

/**
 * Converts a single CSV row into the encoded string that will be embedded
 * in the QR code, based on the detected {@link QRType}.
 *
 * For types that require structured data (WiFi, vCard, etc.) the function
 * builds the appropriate URI or payload format. For simple types it returns
 * the first non-empty cell value.
 *
 * @param row  - The parsed CSV row (lowercase keys).
 * @param type - The QR type to encode as.
 * @returns The encoded data string for the QR code.
 *
 * @internal
 */
function encodeRow(row: CSVRow, type: QRType): string {
  switch (type) {
    case 'url':
      return row['url'] || row['link'] || row['website'] || '';

    case 'text':
      return row['text'] || row['content'] || row['data'] || Object.values(row)[0] || '';

    case 'email': {
      const to = row['to'] || row['email_to'] || row['email'] || '';
      const subject = row['subject'] || '';
      const body = row['body'] || '';
      return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    case 'phone':
      return `tel:${row['phone'] || row['tel'] || row['phone_number'] || ''}`;

    case 'sms': {
      const number = row['sms_number'] || row['phone'] || row['number'] || '';
      const message = row['message'] || row['sms'] || '';
      return `smsto:${number}:${message}`;
    }

    case 'wifi': {
      const ssid = row['ssid'] || '';
      const password = row['password'] || '';
      const encryption = row['encryption'] || 'WPA';
      const hidden = row['hidden'] === 'true' ? 'H:true;' : '';
      return `WIFI:T:${encryption};S:${ssid};P:${password};${hidden};`;
    }

    case 'vcard': {
      const fn = row['firstname'] || row['first_name'] || '';
      const ln = row['lastname'] || row['last_name'] || '';
      const phone = row['phone'] || '';
      const email = row['email'] || '';
      const org = row['organization'] || row['org'] || '';
      const title = row['title'] || '';
      const url = row['url'] || '';
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${ln};${fn};;;`,
        `FN:${fn} ${ln}`,
        phone ? `TEL:${phone}` : '',
        email ? `EMAIL:${email}` : '',
        org ? `ORG:${org}` : '',
        title ? `TITLE:${title}` : '',
        url ? `URL:${url}` : '',
        'END:VCARD',
      ]
        .filter(Boolean)
        .join('\n');
    }

    case 'mecard': {
      const name = row['name'] || '';
      const phone = row['phone'] || '';
      const email = row['email'] || '';
      const url = row['url'] || '';
      return `MECARD:N:${name};TEL:${phone};EMAIL:${email};URL:${url};;`;
    }

    case 'geo': {
      const lat = row['latitude'] || row['lat'] || '0';
      const lng = row['longitude'] || row['lng'] || row['lon'] || '0';
      const label = row['label'] || '';
      return label ? `geo:${lat},${lng}?q=${encodeURIComponent(label)}` : `geo:${lat},${lng}`;
    }

    case 'crypto': {
      const currency = (row['currency'] || 'bitcoin').toLowerCase();
      const address = row['address'] || '';
      const amount = row['amount'] || '';
      const amountParam = amount ? `?amount=${amount}` : '';
      return `${currency}:${address}${amountParam}`;
    }

    case 'epc': {
      const name = row['name'] || '';
      const iban = row['iban'] || '';
      const bic = row['bic'] || '';
      const amount = row['amount'] || '';
      const reference = row['reference'] || '';
      const text = row['text'] || '';
      return [
        'BCD', '002', '1', 'SCT',
        bic, name, iban,
        amount ? `EUR${amount}` : '',
        '', reference, text, '',
      ].join('\n');
    }

    case 'whatsapp': {
      const number = row['whatsapp'] || row['phone'] || row['number'] || '';
      const message = row['message'] || '';
      return `https://wa.me/${number.replace(/\D/g, '')}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    }

    case 'calendar': {
      const title = row['title'] || row['event'] || '';
      const start = row['start_date'] || row['startdate'] || '';
      const end = row['end_date'] || row['enddate'] || '';
      const location = row['location'] || '';
      const description = row['description'] || '';
      return [
        'BEGIN:VEVENT',
        `SUMMARY:${title}`,
        start ? `DTSTART:${start.replace(/[-:]/g, '')}` : '',
        end ? `DTEND:${end.replace(/[-:]/g, '')}` : '',
        location ? `LOCATION:${location}` : '',
        description ? `DESCRIPTION:${description}` : '',
        'END:VEVENT',
      ]
        .filter(Boolean)
        .join('\n');
    }

    case 'appstore': {
      // Default to iOS URL; fall back to Android URL
      return row['ios_url'] || row['android_url'] || row['url'] || '';
    }

    case 'social': {
      // For batch, just use the first URL-like column
      return row['url'] || row['link'] || Object.values(row)[0] || '';
    }

    default:
      return Object.values(row)[0] || '';
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parses an uploaded CSV file into typed rows and auto-detects the QR type
 * from column headers.
 *
 * **Column normalisation:** All header names are lowercased and trimmed.
 * Leading/trailing whitespace in cell values is also stripped.
 *
 * The resulting rows are capped at {@link MAX_BATCH_ITEMS} to prevent
 * excessively large batch jobs.
 *
 * @param file - A `File` object (typically from an `<input type="file">`).
 * @returns A promise resolving to {@link ParseCSVResult} with the parsed rows,
 *          detected QR type, and raw column headers.
 * @throws {Error} If the CSV contains no data rows or cannot be parsed.
 *
 * @example
 * ```ts
 * const file = event.target.files[0];
 * const { rows, detectedType, headers } = await parseCSV(file);
 * console.log(`Detected type: ${detectedType}, ${rows.length} rows`);
 * ```
 */
export function parseCSV(file: File): Promise<ParseCSVResult> {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim().toLowerCase(),
      transform: (value: string) => value.trim(),
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          reject(new Error('CSV file contains no data rows.'));
          return;
        }

        const headers = results.meta.fields?.map((f) => f.toLowerCase()) ?? [];
        const detectedType = detectQRType(headers);
        const rows = results.data.slice(0, MAX_BATCH_ITEMS);

        resolve({ rows, detectedType, headers });
      },
      error: (error: Error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}

/**
 * Generates multiple QR codes from an array of CSV rows and bundles them
 * into a single ZIP archive.
 *
 * Each QR code is rendered as a PNG using a temporary {@link QRCodeStyling}
 * instance with the provided customization settings. Files inside the ZIP are
 * named sequentially (e.g. `qr-001.png`, `qr-002.png`, ...).
 *
 * @param rows          - Parsed CSV rows (from {@link parseCSV}).
 * @param type          - The QR type to encode each row as.
 * @param customization - Visual customization applied to every QR code.
 * @param onProgress    - Optional callback invoked after each code is generated,
 *                        receiving the completion percentage (0-100).
 * @returns A `Promise` that resolves to a ZIP {@link Blob} ready for download.
 * @throws {Error} If any individual QR code fails to render.
 *
 * @example
 * ```ts
 * const zipBlob = await generateBatchZip(rows, 'url', customization, (pct) => {
 *   progressBar.value = pct;
 * });
 * saveAs(zipBlob, 'batch-qr-codes.zip');
 * ```
 */
export async function generateBatchZip(
  rows: CSVRow[],
  type: QRType,
  customization: QRCustomization,
  onProgress?: (percent: number) => void,
): Promise<Blob> {
  const zip = new JSZip();
  const total = rows.length;

  for (let i = 0; i < total; i++) {
    const row = rows[i];
    const dataString = encodeRow(row, type);

    // Create a temporary QR instance for this row
    const qr = new QRCodeStyling({
      width: customization.width,
      height: customization.height,
      data: dataString || 'https://example.com',
      margin: customization.margin,
      dotsOptions: {
        color: customization.dotsColor,
        type: customization.dotsType,
        ...(customization.dotsGradient ? { gradient: customization.dotsGradient } : {}),
      },
      cornersSquareOptions: {
        color: customization.cornersSquareColor,
        type: customization.cornersSquareType,
      },
      cornersDotOptions: {
        color: customization.cornersDotColor,
        type: customization.cornersDotType,
      },
      backgroundOptions: {
        color: customization.backgroundColor,
        ...(customization.backgroundGradient
          ? { gradient: customization.backgroundGradient }
          : {}),
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: customization.logoMargin ?? 5,
      },
      image: customization.logo || undefined,
      qrOptions: {
        errorCorrectionLevel: customization.errorCorrectionLevel,
      },
    });

    const blob = await qr.getRawData('png');
    if (!blob) {
      throw new Error(`Failed to generate QR code for row ${i + 1}.`);
    }

    // Zero-padded sequential filename
    const padded = String(i + 1).padStart(String(total).length, '0');
    zip.file(`qr-${padded}.png`, blob);

    // Report progress
    if (onProgress) {
      onProgress(Math.round(((i + 1) / total) * 100));
    }
  }

  return zip.generateAsync({ type: 'blob' });
}
