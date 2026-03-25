/**
 * @fileoverview Export utilities for QR code images.
 *
 * Provides functions to export the current QR code as PNG, SVG, JPEG, or PDF,
 * as well as helpers for downloading arbitrary blobs and copying images to
 * the system clipboard.
 *
 * **Dependencies:**
 * - `jspdf` v4 — PDF generation.
 * - `file-saver` — Cross-browser file downloads.
 * - `qr-code-styling` — QR code instance (passed by the caller).
 *
 * @module utils/export
 *
 * @example
 * ```ts
 * import { exportAsPNG, exportAsPDF, copyToClipboard } from '../utils/export';
 *
 * // Download as PNG
 * await exportAsPNG(qrInstance, 'my-qr-code');
 *
 * // Generate a PDF
 * await exportAsPDF(qrInstance, 'my-qr-code', 300, 300);
 *
 * // Copy to clipboard
 * await copyToClipboard(qrInstance);
 * ```
 */

import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import type QRCodeStyling from 'qr-code-styling';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Extracts a raw {@link Blob} from a {@link QRCodeStyling} instance.
 *
 * @param qr     - The QR code styling instance to read from.
 * @param format - Desired image format.
 * @returns The image blob, or `null` if extraction fails.
 * @throws {Error} If the QR instance returns no data.
 *
 * @internal
 */
async function getBlob(
  qr: QRCodeStyling,
  format: 'png' | 'svg' | 'jpeg' | 'webp',
): Promise<Blob> {
  const result = await qr.getRawData(format);
  if (!result || !(result instanceof Blob)) {
    throw new Error(`Failed to generate QR code blob in "${format}" format.`);
  }
  return result;
}

/**
 * Converts a {@link Blob} to a data-URL string via {@link FileReader}.
 *
 * @param blob - The blob to convert.
 * @returns A `Promise` that resolves with the base-64 data URL.
 *
 * @internal
 */
function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('FileReader failed to read blob.'));
    reader.readAsDataURL(blob);
  });
}

// ---------------------------------------------------------------------------
// Public API — single-file exports
// ---------------------------------------------------------------------------

/**
 * Downloads the QR code as a **PNG** file.
 *
 * @param qr       - The QR code styling instance.
 * @param filename - Desired file name **without** extension (defaults to `'qr-code'`).
 */
export async function exportAsPNG(
  qr: QRCodeStyling,
  filename: string = 'qr-code',
): Promise<void> {
  const blob = await getBlob(qr, 'png');
  saveAs(blob, `${filename}.png`);
}

/**
 * Downloads the QR code as an **SVG** file.
 *
 * SVG export produces a resolution-independent vector file that can be
 * scaled to any size without quality loss.
 *
 * @param qr       - The QR code styling instance.
 * @param filename - Desired file name **without** extension (defaults to `'qr-code'`).
 */
export async function exportAsSVG(
  qr: QRCodeStyling,
  filename: string = 'qr-code',
): Promise<void> {
  const blob = await getBlob(qr, 'svg');
  saveAs(blob, `${filename}.svg`);
}

/**
 * Downloads the QR code as a **JPEG** file.
 *
 * @param qr       - The QR code styling instance.
 * @param filename - Desired file name **without** extension (defaults to `'qr-code'`).
 */
export async function exportAsJPEG(
  qr: QRCodeStyling,
  filename: string = 'qr-code',
): Promise<void> {
  const blob = await getBlob(qr, 'jpeg');
  saveAs(blob, `${filename}.jpeg`);
}

/**
 * Downloads the QR code as a **PDF** document.
 *
 * The PDF is generated with `jsPDF` v4. The QR code image is centred on
 * the page with a small margin. Page orientation is automatically chosen
 * to best fit the image dimensions.
 *
 * @param qr       - The QR code styling instance.
 * @param filename - Desired file name **without** extension (defaults to `'qr-code'`).
 * @param width    - QR code width in pixels (used for aspect-ratio calculations).
 * @param height   - QR code height in pixels (used for aspect-ratio calculations).
 *
 * @example
 * ```ts
 * await exportAsPDF(qrInstance, 'event-invite', 400, 400);
 * ```
 */
export async function exportAsPDF(
  qr: QRCodeStyling,
  filename: string = 'qr-code',
  width: number = 300,
  height: number = 300,
): Promise<void> {
  const blob = await getBlob(qr, 'png');
  const dataUrl = await blobToDataURL(blob);

  // Determine orientation from image aspect ratio
  const orientation = width > height ? 'landscape' : 'portrait';
  const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });

  // A4 dimensions in mm
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Scale QR image to fit page with 20mm margin on each side
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  const maxHeight = pageHeight - margin * 2;

  const aspectRatio = width / height;
  let imgWidth = maxWidth;
  let imgHeight = imgWidth / aspectRatio;

  if (imgHeight > maxHeight) {
    imgHeight = maxHeight;
    imgWidth = imgHeight * aspectRatio;
  }

  // Centre image on page
  const x = (pageWidth - imgWidth) / 2;
  const y = (pageHeight - imgHeight) / 2;

  doc.addImage(dataUrl, 'PNG', x, y, imgWidth, imgHeight);
  doc.save(`${filename}.pdf`);
}

// ---------------------------------------------------------------------------
// Public API — generic helpers
// ---------------------------------------------------------------------------

/**
 * Downloads an arbitrary {@link Blob} as a file using the `file-saver` library.
 *
 * This is a thin wrapper around `saveAs` exposed for convenience so callers
 * don't need to import `file-saver` directly.
 *
 * @param blob     - The blob to download.
 * @param filename - Full file name **including** extension (e.g. `'data.zip'`).
 */
export function downloadBlob(blob: Blob, filename: string): void {
  saveAs(blob, filename);
}

/**
 * Copies the current QR code image to the system clipboard as a PNG.
 *
 * Uses the {@link navigator.clipboard.write} API with a `ClipboardItem`.
 * This requires the page to be served over HTTPS (or localhost) and may
 * prompt the user for permission in some browsers.
 *
 * @param qr - The QR code styling instance.
 * @returns A `Promise` that resolves when the image has been written to the clipboard.
 * @throws {Error} If the Clipboard API is unavailable or the browser denies permission.
 *
 * @example
 * ```ts
 * try {
 *   await copyToClipboard(qrInstance);
 *   toast('Copied to clipboard!');
 * } catch (err) {
 *   toast('Clipboard access denied.');
 * }
 * ```
 */
export async function copyToClipboard(qr: QRCodeStyling): Promise<void> {
  if (!navigator.clipboard?.write) {
    throw new Error(
      'Clipboard API is not available. Ensure the page is served over HTTPS.',
    );
  }

  const blob = await getBlob(qr, 'png');
  const item = new ClipboardItem({ 'image/png': blob });
  await navigator.clipboard.write([item]);
}
