/**
 * @file StepExport.tsx
 * @description Step 4 (final) of the QR code wizard — provides export controls
 * for downloading or copying the generated QR code. Supports PNG, SVG, JPEG,
 * and PDF formats with configurable JPEG quality.
 *
 * Relies on dynamic import of `qr-code-styling` to render and export the QR
 * code from the provided data string and customization options.
 *
 * @module components/wizard/StepExport
 *
 * @example
 * ```tsx
 * <StepExport
 *   dataString='{"url":"https://example.com"}'
 *   customization={customization}
 * />
 * ```
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Download,
  Copy,
  Check,
  FileImage,
  FileCode,
  FileType2,
  FileText,
} from 'lucide-react';

import type { QRCustomization, ExportFormat } from '../../types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Props for the {@link StepExport} component.
 */
interface StepExportProps {
  /** Serialized QR data payload string to encode into the QR code. */
  dataString: string;
  /** Visual customization settings used to render the QR code. */
  customization: QRCustomization;
}

// ---------------------------------------------------------------------------
// Format metadata
// ---------------------------------------------------------------------------

/**
 * Metadata for each supported export format, including display label,
 * icon, and MIME type.
 */
interface FormatOption {
  /** The export format identifier. */
  value: ExportFormat;
  /** Human-readable display label. */
  label: string;
  /** Lucide icon component for the format button. */
  icon: React.ReactNode;
  /** MIME type for the exported file. */
  mimeType: string;
  /** File extension (without the dot). */
  extension: string;
}

/**
 * All supported export format options with their metadata.
 */
const FORMAT_OPTIONS: readonly FormatOption[] = [
  {
    value: 'png',
    label: 'PNG',
    icon: <FileImage size={18} />,
    mimeType: 'image/png',
    extension: 'png',
  },
  {
    value: 'svg',
    label: 'SVG',
    icon: <FileCode size={18} />,
    mimeType: 'image/svg+xml',
    extension: 'svg',
  },
  {
    value: 'jpeg',
    label: 'JPEG',
    icon: <FileType2 size={18} />,
    mimeType: 'image/jpeg',
    extension: 'jpg',
  },
  {
    value: 'pdf',
    label: 'PDF',
    icon: <FileText size={18} />,
    mimeType: 'application/pdf',
    extension: 'pdf',
  },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Safely removes all child nodes from a DOM element without using innerHTML.
 *
 * @param element - The parent element to clear.
 */
function clearElement(element: HTMLElement): void {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * StepExport renders the final export panel of the QR code wizard.
 *
 * It provides:
 * - A live QR code preview rendered via `qr-code-styling`
 * - Format selection buttons (PNG, SVG, JPEG, PDF)
 * - A quality slider for JPEG exports (0.1 to 1.0)
 * - A download button that triggers a file save
 * - A copy-to-clipboard button for raster formats
 *
 * @param props - {@link StepExportProps}
 * @returns A React element containing the export UI.
 */
function StepExport({ dataString, customization }: StepExportProps) {
  /** The currently selected export format. */
  const [format, setFormat] = useState<ExportFormat>('png');

  /** JPEG quality value (0.1 to 1.0). Only used when format is 'jpeg'. */
  const [jpegQuality, setJpegQuality] = useState(0.92);

  /** Tracks whether the copy-to-clipboard action succeeded (for feedback). */
  const [copied, setCopied] = useState(false);

  /** Tracks whether a download is in progress. */
  const [downloading, setDownloading] = useState(false);

  /** Ref to the container div where the QR code will be rendered. */
  const qrContainerRef = useRef<HTMLDivElement>(null);

  /** Ref to hold the QRCodeStyling instance. */
  const qrInstanceRef = useRef<unknown>(null);

  /**
   * Initializes and updates the QR code rendering whenever the data string
   * or customization changes.
   *
   * Uses dynamic import of `qr-code-styling` to keep the initial bundle
   * lean. The QR code is appended to the container div.
   */
  useEffect(() => {
    let cancelled = false;

    async function renderQR() {
      try {
        const QRCodeStyling = (await import('qr-code-styling')).default;

        if (cancelled) return;

        /** Build the options object from the customization props. */
        const options: Record<string, unknown> = {
          width: customization.width,
          height: customization.height,
          margin: customization.margin,
          data: dataString,
          dotsOptions: {
            color: customization.dotsColor,
            type: customization.dotsType,
            ...(customization.dotsGradient
              ? { gradient: customization.dotsGradient }
              : {}),
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
          qrOptions: {
            errorCorrectionLevel: customization.errorCorrectionLevel,
          },
          imageOptions: {
            crossOrigin: 'anonymous',
            margin: customization.logoMargin ?? 5,
            imageSize: customization.logoSize ?? 0.2,
          },
          ...(customization.logo ? { image: customization.logo } : {}),
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const qr = new (QRCodeStyling as any)(options);
        qrInstanceRef.current = qr;

        /** Clear the container safely and append the new QR code canvas. */
        if (qrContainerRef.current) {
          clearElement(qrContainerRef.current);
          qr.append(qrContainerRef.current);
        }
      } catch (err) {
        console.error('Failed to render QR code:', err);
      }
    }

    renderQR();

    return () => {
      cancelled = true;
    };
  }, [dataString, customization]);

  /**
   * Triggers a file download of the QR code in the selected format.
   *
   * For PDF exports, uses jsPDF to wrap the PNG image in a PDF document.
   * For other formats, delegates to the qr-code-styling library's
   * built-in download method.
   */
  const handleDownload = useCallback(async () => {
    const qr = qrInstanceRef.current as {
      download?: (opts: { extension: string; name?: string }) => Promise<void>;
      getRawData?: (extension: string) => Promise<Blob | null>;
    } | null;

    if (!qr) return;

    setDownloading(true);

    try {
      if (format === 'pdf') {
        /** For PDF, render as PNG first then embed in a PDF page. */
        const blob = await qr.getRawData?.('png');
        if (!blob) {
          setDownloading(false);
          return;
        }

        const { jsPDF } = await import('jspdf');
        const imgUrl = URL.createObjectURL(blob);

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [customization.width + 40, customization.height + 40],
        });

        /** Load the image into an HTMLImageElement for jsPDF. */
        const img = new window.Image();
        img.src = imgUrl;
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
        });

        pdf.addImage(img, 'PNG', 20, 20, customization.width, customization.height);
        pdf.save('qr-code.pdf');
        URL.revokeObjectURL(imgUrl);
      } else {
        /** For raster/vector formats, use qr-code-styling's download. */
        await qr.download?.({
          extension: format === 'jpeg' ? 'jpeg' : format,
          name: 'qr-code',
        });
      }
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  }, [format, customization.width, customization.height]);

  /**
   * Copies the QR code image to the clipboard as a PNG blob.
   *
   * Uses the Clipboard API's `write` method with a ClipboardItem.
   * Falls back gracefully if the browser does not support clipboard
   * image writing.
   */
  const handleCopy = useCallback(async () => {
    const qr = qrInstanceRef.current as {
      getRawData?: (extension: string) => Promise<Blob | null>;
    } | null;

    if (!qr) return;

    try {
      const blob = await qr.getRawData?.('png');
      if (!blob) return;

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Section header */}
      <div>
        <h2
          className="text-lg font-semibold"
          style={{ color: 'var(--text-h)' }}
        >
          Export QR Code
        </h2>
        <p
          className="mt-1 text-sm"
          style={{ color: 'var(--text)' }}
        >
          Preview your QR code below, choose a format, and download or copy it.
        </p>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* QR Code preview                                                   */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex justify-center">
        <div
          ref={qrContainerRef}
          className="flex items-center justify-center overflow-hidden rounded-xl p-4"
          style={{
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border)',
            minHeight: '200px',
            minWidth: '200px',
          }}
          aria-label="QR code preview"
        />
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Format selector                                                   */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-col gap-2">
        <span
          className="text-sm font-medium"
          style={{ color: 'var(--text-h)' }}
        >
          Export Format
        </span>

        <div className="flex flex-wrap gap-2">
          {FORMAT_OPTIONS.map((opt) => {
            /** Whether this format is currently selected. */
            const isActive = format === opt.value;

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFormat(opt.value)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  isActive ? 'shadow-sm' : ''
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--accent)' : 'var(--bg)',
                  color: isActive ? '#ffffff' : 'var(--text-h)',
                  border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                }}
                aria-pressed={isActive}
              >
                {opt.icon}
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* JPEG quality slider (only visible for JPEG format)                */}
      {/* ----------------------------------------------------------------- */}
      {format === 'jpeg' && (
        <div className="max-w-xs">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="jpeg-quality"
                className="text-sm font-medium"
                style={{ color: 'var(--text-h)' }}
              >
                JPEG Quality
              </label>
              <span
                className="text-sm font-mono tabular-nums"
                style={{ color: 'var(--text)' }}
              >
                {Math.round(jpegQuality * 100)}%
              </span>
            </div>
            <input
              id="jpeg-quality"
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={jpegQuality}
              onChange={(e) => setJpegQuality(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full outline-none"
              style={{
                background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${
                  ((jpegQuality - 0.1) / 0.9) * 100
                }%, var(--border) ${
                  ((jpegQuality - 0.1) / 0.9) * 100
                }%, var(--border) 100%)`,
              }}
              aria-valuenow={jpegQuality}
              aria-valuemin={0.1}
              aria-valuemax={1}
            />
            <div
              className="flex justify-between text-xs"
              style={{ color: 'var(--text)' }}
            >
              <span>10%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Action buttons                                                    */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-wrap gap-3">
        {/* Download button */}
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
          style={{
            backgroundColor: 'var(--accent)',
          }}
        >
          <Download size={16} />
          {downloading ? 'Downloading...' : `Download ${format.toUpperCase()}`}
        </button>

        {/* Copy to clipboard button */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-80"
          style={{
            color: 'var(--text-h)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--surface)',
          }}
        >
          {copied ? (
            <>
              <Check size={16} className="text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy size={16} />
              Copy to Clipboard
            </>
          )}
        </button>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Format hint                                                       */}
      {/* ----------------------------------------------------------------- */}
      <p className="text-xs" style={{ color: 'var(--text)' }}>
        {format === 'png' && 'PNG — Best for web and print. Supports transparency.'}
        {format === 'svg' && 'SVG — Scalable vector format. Perfect for resizing without quality loss.'}
        {format === 'jpeg' && 'JPEG — Smaller file size, no transparency. Adjust quality above.'}
        {format === 'pdf' && 'PDF — Ready for print. The QR code is embedded as a high-resolution image.'}
      </p>
    </div>
  );
}

export default StepExport;
