/**
 * @fileoverview Live QR code preview component.
 *
 * Renders a QR code in real time using the `qr-code-styling` library. The
 * preview automatically updates whenever the encoded data string or visual
 * customization options change. When no data is available, a placeholder
 * icon is displayed instead.
 *
 * @module components/common/QRPreview
 *
 * @example
 * ```tsx
 * <QRPreview
 *   dataString="https://example.com"
 *   customization={currentCustomization}
 * />
 * ```
 */

import { useRef, useEffect, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { QrCode } from 'lucide-react';
import type { QRCustomization } from '../../types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Props accepted by the {@link QRPreview} component.
 */
interface QRPreviewProps {
  /**
   * The fully-encoded data string to embed in the QR code.
   *
   * When this value is an empty string the component renders a placeholder
   * icon instead of a QR code.
   */
  dataString: string;

  /**
   * Visual customization options controlling the appearance of the QR code.
   *
   * Maps almost 1-to-1 to the options accepted by `qr-code-styling`.
   */
  customization: QRCustomization;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build the `qr-code-styling` options object from the application's
 * {@link QRCustomization} interface.
 *
 * This function translates application-level property names into the shape
 * expected by the library, including optional gradient and logo settings.
 *
 * @param data           - The encoded QR data string.
 * @param customization  - Application customization settings.
 * @returns A configuration object suitable for `new QRCodeStyling(...)`.
 */
function buildQROptions(
  data: string,
  customization: QRCustomization,
): ConstructorParameters<typeof QRCodeStyling>[0] {
  const options: ConstructorParameters<typeof QRCodeStyling>[0] = {
    width: customization.width,
    height: customization.height,
    margin: customization.margin,
    data,
    qrOptions: {
      errorCorrectionLevel: customization.errorCorrectionLevel,
    },
    dotsOptions: {
      color: customization.dotsColor,
      type: customization.dotsType,
      ...(customization.dotsGradient && {
        gradient: {
          type: customization.dotsGradient.type,
          rotation: customization.dotsGradient.rotation ?? 0,
          colorStops: customization.dotsGradient.colorStops,
        },
      }),
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
      ...(customization.backgroundGradient && {
        gradient: {
          type: customization.backgroundGradient.type,
          rotation: customization.backgroundGradient.rotation ?? 0,
          colorStops: customization.backgroundGradient.colorStops,
        },
      }),
    },
  };

  /* Attach logo / image options when a logo is provided. */
  if (customization.logo) {
    options.image = customization.logo;
    options.imageOptions = {
      crossOrigin: 'anonymous',
      margin: customization.logoMargin ?? 5,
      imageSize: customization.logoSize ?? 0.4,
    };
  }

  return options;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Live QR code preview panel.
 *
 * Internally manages a single {@link QRCodeStyling} instance that is created
 * on mount, appended to a container `<div>`, and updated reactively whenever
 * the `dataString` or `customization` props change.
 *
 * **Responsive behaviour:** The container constrains itself to a maximum
 * width of 280 px and centres horizontally. On smaller viewports the QR
 * code scales down gracefully via the library's internal SVG/canvas sizing.
 *
 * @param props - Component props.
 * @returns The rendered QR preview or an empty-state placeholder.
 */
export default function QRPreview({
  dataString,
  customization,
}: QRPreviewProps) {
  /**
   * Ref attached to the container `<div>` into which the QR code canvas /
   * SVG element is injected by `qr-code-styling`.
   */
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Stable reference to the `QRCodeStyling` instance so we can call
   * `.update()` on subsequent renders instead of recreating the instance.
   */
  const qrInstanceRef = useRef<QRCodeStyling | null>(null);

  /**
   * Tracks whether the QR code has been appended to the DOM at least once.
   * Prevents duplicate `.append()` calls which would add extra canvases.
   */
  const [isAppended, setIsAppended] = useState(false);

  /*
   * Effect: create a fresh QRCodeStyling instance whenever the encoded data
   * or customization changes, then append or update the DOM element.
   *
   * We recreate the instance (rather than just calling `.update()`) because
   * `qr-code-styling` does not reliably apply all option changes through
   * `.update()` — for example, gradient changes require a new instance.
   */
  useEffect(() => {
    if (!dataString || !containerRef.current) return;

    const options = buildQROptions(dataString, customization);

    /* If no instance exists yet, create and append. */
    if (!qrInstanceRef.current) {
      qrInstanceRef.current = new QRCodeStyling(options);
      /* Clear any stale children before appending. */
      containerRef.current.innerHTML = '';
      qrInstanceRef.current.append(containerRef.current);
      setIsAppended(true);
    } else {
      /*
       * Update the existing instance. For most option changes `.update()`
       * is sufficient and avoids a flash of blank content.
       */
      qrInstanceRef.current.update(options);
    }
  }, [dataString, customization, isAppended]);

  /*
   * Cleanup: when the component unmounts, dispose of the QR instance and
   * clear any DOM children it injected.
   */
  useEffect(() => {
    return () => {
      qrInstanceRef.current = null;
    };
  }, []);

  // -----------------------------------------------------------------------
  // Empty state — show a placeholder icon when there is no data to encode.
  // -----------------------------------------------------------------------

  if (!dataString) {
    return (
      <div
        className="mx-auto flex max-w-[280px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-10"
        style={{
          borderColor: 'var(--color-border, #e5e7eb)',
          backgroundColor: 'var(--color-surface, #f9fafb)',
          aspectRatio: '1 / 1',
        }}
      >
        <QrCode
          size={64}
          strokeWidth={1.5}
          style={{ color: 'var(--color-muted, #9ca3af)' }}
          aria-hidden="true"
        />
        <p
          className="mt-4 text-center text-sm"
          style={{ color: 'var(--color-muted, #9ca3af)' }}
        >
          Enter data to preview your QR code
        </p>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Active preview — the container div is populated by qr-code-styling.
  // -----------------------------------------------------------------------

  return (
    <div
      className="mx-auto flex max-w-[280px] items-center justify-center overflow-hidden rounded-xl"
      style={{ backgroundColor: 'var(--color-surface, #ffffff)' }}
    >
      <div ref={containerRef} className="flex items-center justify-center" />
    </div>
  );
}
