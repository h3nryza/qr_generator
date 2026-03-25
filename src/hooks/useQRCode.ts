/**
 * @fileoverview Custom React hook for QR code generation using the qr-code-styling library.
 *
 * Creates a single {@link QRCodeStyling} instance on mount and uses `.update()` for
 * subsequent data or customization changes, avoiding unnecessary re-instantiation.
 *
 * @module hooks/useQRCode
 *
 * @example
 * ```tsx
 * function Preview({ data, customization }: Props) {
 *   const { containerRef, download, getRawData } = useQRCode(data, customization);
 *   return <div ref={containerRef} />;
 * }
 * ```
 */

import { useRef, useEffect, useCallback } from 'react';
import QRCodeStyling from 'qr-code-styling';
import type { QRCustomization } from '../types';

/** Placeholder data string used when the caller provides an empty value. */
const FALLBACK_DATA = 'https://example.com';

/**
 * Builds the full options object accepted by {@link QRCodeStyling} from our
 * application-level {@link QRCustomization} type and a data string.
 *
 * @param dataString    - The encoded QR payload (URL, vCard, etc.).
 * @param customization - Visual customization settings.
 * @returns A plain object compatible with the `qr-code-styling` constructor / `.update()`.
 */
function buildQROptions(dataString: string, customization: QRCustomization) {
  return {
    width: customization.width,
    height: customization.height,
    data: dataString || FALLBACK_DATA,
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
      crossOrigin: 'anonymous' as const,
      margin: customization.logoMargin ?? 5,
    },
    image: customization.logo || undefined,
    qrOptions: {
      errorCorrectionLevel: customization.errorCorrectionLevel,
    },
  };
}

/**
 * Safely removes all child nodes from a DOM element.
 *
 * Uses `removeChild` in a loop instead of `innerHTML` to avoid any potential
 * XSS surface, even though the content here is library-generated.
 *
 * @param element - The DOM element to clear.
 *
 * @internal
 */
function clearContainer(element: HTMLElement): void {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Custom hook that manages QR code generation via the `qr-code-styling` library.
 *
 * **Lifecycle:**
 * 1. On first render a {@link QRCodeStyling} instance is created and appended to
 *    the container referenced by `containerRef`.
 * 2. On subsequent renders the existing instance is updated in-place via
 *    `.update()`, avoiding DOM thrashing and flicker.
 * 3. On unmount the container is cleaned up.
 *
 * @param dataString    - The encoded QR payload string (e.g. a URL, vCard blob, etc.).
 *                        When empty, {@link FALLBACK_DATA} is used so the preview is
 *                        never blank.
 * @param customization - Full visual customization settings.
 *
 * @returns An object containing:
 *  - `containerRef` — Ref to attach to the host `<div>`.
 *  - `qrInstance`   — Ref to the underlying {@link QRCodeStyling} (advanced use).
 *  - `download`     — Trigger a browser file-download of the QR code.
 *  - `getRawData`   — Obtain the QR code as a raw {@link Blob}.
 *
 * @example
 * ```tsx
 * const { containerRef, download } = useQRCode(encodedData, customization);
 *
 * return (
 *   <>
 *     <div ref={containerRef} />
 *     <button onClick={() => download('png', 'my-qr')}>Download PNG</button>
 *   </>
 * );
 * ```
 */
export function useQRCode(dataString: string, customization: QRCustomization) {
  /** Holds the single QRCodeStyling instance across renders. */
  const qrRef = useRef<QRCodeStyling | null>(null);

  /** DOM element the QR canvas/SVG is appended to. */
  const containerRef = useRef<HTMLDivElement | null>(null);

  /** Tracks whether the instance has been created (to distinguish create vs. update). */
  const isInitialised = useRef(false);

  // --------------------------------------------------------------------------
  // Single effect: create on first run, update on subsequent runs
  // --------------------------------------------------------------------------

  useEffect(() => {
    const options = buildQROptions(dataString, customization);

    if (!isInitialised.current) {
      // --- First render: create the QRCodeStyling instance ---
      qrRef.current = new QRCodeStyling(options);

      if (containerRef.current) {
        clearContainer(containerRef.current);
        qrRef.current.append(containerRef.current);
      }

      isInitialised.current = true;
    } else if (qrRef.current) {
      // --- Subsequent renders: update in-place ---
      qrRef.current.update(options);
    }
  }, [dataString, customization]);

  // --------------------------------------------------------------------------
  // Cleanup on unmount
  // --------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      if (containerRef.current) {
        clearContainer(containerRef.current);
      }
      qrRef.current = null;
      isInitialised.current = false;
    };
  }, []);

  // --------------------------------------------------------------------------
  // Public helpers
  // --------------------------------------------------------------------------

  /**
   * Triggers a browser file-download of the current QR code.
   *
   * @param format   - Image format: `'png'`, `'svg'`, `'jpeg'`, or `'webp'`.
   * @param filename - Desired file name without extension (defaults to `'qr-code'`).
   */
  const download = useCallback(
    async (format: 'png' | 'svg' | 'jpeg' | 'webp', filename?: string) => {
      if (!qrRef.current) return;
      await qrRef.current.download({
        name: filename ?? 'qr-code',
        extension: format,
      });
    },
    [],
  );

  /**
   * Returns the current QR code as a raw {@link Blob}, suitable for further
   * processing (e.g. embedding in a PDF, copying to clipboard).
   *
   * @param format - Image format: `'png'`, `'svg'`, `'jpeg'`, or `'webp'`.
   * @returns A `Blob` containing the image data, or `null` if no instance exists.
   */
  const getRawData = useCallback(
    async (format: 'png' | 'svg' | 'jpeg' | 'webp'): Promise<Blob | null> => {
      if (!qrRef.current) return null;
      const result = await qrRef.current.getRawData(format);
      return (result instanceof Blob ? result : null);
    },
    [],
  );

  return { containerRef, qrInstance: qrRef, download, getRawData };
}
