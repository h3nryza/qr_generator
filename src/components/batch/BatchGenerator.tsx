/**
 * @fileoverview Batch QR code generation component.
 *
 * Allows users to upload a CSV file (via file picker or drag-and-drop),
 * preview the parsed rows in a table, generate QR codes for every valid
 * row using shared customization settings, and download the results as a
 * single ZIP archive.
 *
 * @module components/batch/BatchGenerator
 *
 * @example
 * ```tsx
 * <BatchGenerator customization={currentCustomization} />
 * ```
 */

import { useState, useRef, useCallback } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Loader2,
  Trash2,
} from 'lucide-react';
import type { QRCustomization } from '../../types';
import type { QRType } from '../../types';
import { parseCSV, generateBatchZip } from '../../utils/batch';
import type { CSVRow } from '../../utils/batch';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Props accepted by the {@link BatchGenerator} component.
 */
interface BatchGeneratorProps {
  /**
   * Shared visual customization applied to every QR code in the batch.
   */
  customization: QRCustomization;
}

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

/**
 * Represents the current phase of the batch workflow.
 *
 * - `idle`       — Waiting for a CSV upload.
 * - `preview`    — CSV has been parsed; rows are displayed for review.
 * - `generating` — QR codes are being generated.
 * - `complete`   — Generation finished; ZIP is ready for download.
 */
type BatchPhase = 'idle' | 'preview' | 'generating' | 'complete';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Batch QR code generator with CSV upload, preview table, progress bar,
 * and ZIP download.
 *
 * **Workflow:**
 * 1. The user uploads a CSV file (drag-and-drop or file picker).
 * 2. The CSV is parsed with {@link parseCSV} and any errors are displayed.
 * 3. Valid items are shown in a scrollable preview table.
 * 4. The user clicks "Generate All" to start generation.
 * 5. A progress bar tracks completion.
 * 6. When done, a "Download ZIP" button triggers {@link generateBatchZip}.
 *
 * **Accessibility:**
 * - The drop zone is keyboard-accessible via a hidden `<input>`.
 * - Progress is conveyed with an ARIA progressbar role.
 * - Error messages are displayed with an alert icon for visual emphasis.
 *
 * @param props - Component props.
 * @returns The rendered batch generator panel.
 */
export default function BatchGenerator({ customization }: BatchGeneratorProps) {
  // -----------------------------------------------------------------------
  // State
  // -----------------------------------------------------------------------

  /** Current phase of the batch workflow. */
  const [phase, setPhase] = useState<BatchPhase>('idle');

  /** Parsed CSV rows. */
  const [rows, setRows] = useState<CSVRow[]>([]);

  /** Detected QR type from CSV columns. */
  const [detectedType, setDetectedType] = useState<QRType>('url');

  /** CSV column headers. */
  const [headers, setHeaders] = useState<string[]>([]);

  /** Error messages from parsing or generation. */
  const [errors, setErrors] = useState<string[]>([]);

  /** Generation progress as a percentage (0-100). */
  const [progress, setProgress] = useState(0);

  /** Whether the user is currently dragging a file over the drop zone. */
  const [isDragOver, setIsDragOver] = useState(false);

  /** The generated ZIP blob, available once generation completes. */
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  /** Name of the uploaded CSV file (displayed in the UI). */
  const [fileName, setFileName] = useState<string>('');

  /** Ref to the hidden file input element. */
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -----------------------------------------------------------------------
  // File handling
  // -----------------------------------------------------------------------

  /**
   * Process a selected or dropped CSV file.
   *
   * Reads the file contents as text, passes them through {@link parseCSV},
   * separates valid items from errors, and advances to the preview phase.
   *
   * @param file - The CSV {@link File} to process.
   */
  const handleFile = useCallback(async (file: File) => {
    try {
      const result = await parseCSV(file);
      setRows(result.rows);
      setDetectedType(result.detectedType);
      setHeaders(result.headers);
      setErrors([]);
      setFileName(file.name);
      setPhase('preview');
      setProgress(0);
      setZipBlob(null);
    } catch (err) {
      setErrors([
        err instanceof Error ? err.message : 'Failed to parse the CSV file. Please check the format.',
      ]);
    }
  }, []);

  /**
   * Handle the `change` event on the hidden file input.
   *
   * @param e - The change event from the file input.
   */
  const onFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  // -----------------------------------------------------------------------
  // Drag-and-drop handlers
  // -----------------------------------------------------------------------

  /**
   * Handle `dragover` — prevent default to allow dropping and set the
   * visual drag-over highlight.
   */
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  /**
   * Handle `dragleave` — remove the drag-over highlight.
   */
  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  /**
   * Handle `drop` — extract the first CSV file from the drop payload.
   */
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  // -----------------------------------------------------------------------
  // Generation
  // -----------------------------------------------------------------------

  /**
   * Start batch QR code generation.
   *
   * Iterates through all valid items, updates progress incrementally,
   * and produces a ZIP archive via {@link generateBatchZip}.
   */
  const handleGenerate = useCallback(async () => {
    if (rows.length === 0) return;

    setPhase('generating');
    setProgress(0);

    try {
      const blob = await generateBatchZip(rows, detectedType, customization, (pct: number) => {
        setProgress(Math.round(pct));
      });

      setZipBlob(blob);
      setProgress(100);
      setPhase('complete');
    } catch {
      setErrors((prev) => [
        ...prev,
        'An error occurred during batch generation.',
      ]);
      setPhase('preview');
    }
  }, [rows, detectedType, customization]);

  /**
   * Trigger a browser download of the generated ZIP file.
   */
  const handleDownloadZip = useCallback(() => {
    if (!zipBlob) return;

    const url = URL.createObjectURL(zipBlob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'qr-codes.zip';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, [zipBlob]);

  /**
   * Reset the component back to the idle state so the user can upload
   * a new CSV file.
   */
  const handleReset = useCallback(() => {
    setPhase('idle');
    setRows([]);
    setHeaders([]);
    setErrors([]);
    setProgress(0);
    setZipBlob(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // -----------------------------------------------------------------------
  // Render helpers
  // -----------------------------------------------------------------------

  /**
   * Truncate a string to a maximum length with an ellipsis.
   *
   * @param str    - The string to truncate.
   * @param maxLen - Maximum character count before truncation (default 40).
   * @returns The possibly-truncated string.
   */
  const truncate = (str: string, maxLen = 40): string =>
    str.length > maxLen ? `${str.slice(0, maxLen)}...` : str;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-6">
      {/* -----------------------------------------------------------------
       * Phase: idle — CSV upload area
       * --------------------------------------------------------------- */}
      {phase === 'idle' && (
        <div
          role="button"
          tabIndex={0}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors duration-200"
          style={{
            borderColor: isDragOver
              ? 'var(--color-primary, #6366f1)'
              : 'var(--color-border, #e5e7eb)',
            backgroundColor: isDragOver
              ? 'var(--color-primary-light, rgba(99, 102, 241, 0.05))'
              : 'var(--color-surface, #f9fafb)',
          }}
        >
          <Upload
            size={40}
            strokeWidth={1.5}
            style={{ color: 'var(--color-muted, #9ca3af)' }}
            aria-hidden="true"
          />
          <p
            className="mt-4 text-center text-sm font-medium"
            style={{ color: 'var(--color-text, #111827)' }}
          >
            Drag &amp; drop a CSV file here, or click to browse
          </p>
          <p
            className="mt-1 text-center text-xs"
            style={{ color: 'var(--color-muted, #9ca3af)' }}
          >
            CSV should have columns: type, data (JSON or plain value)
          </p>

          {/* Hidden file input that handles the actual selection. */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={onFileInputChange}
            className="hidden"
            aria-label="Upload CSV file"
          />
        </div>
      )}

      {/* -----------------------------------------------------------------
       * Phase: preview / generating / complete — file info + controls
       * --------------------------------------------------------------- */}
      {phase !== 'idle' && (
        <>
          {/* File name badge with reset button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet
                size={18}
                strokeWidth={2}
                style={{ color: 'var(--color-primary, #6366f1)' }}
                aria-hidden="true"
              />
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--color-text, #111827)' }}
              >
                {fileName}
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: 'var(--color-primary-light, rgba(99, 102, 241, 0.1))',
                  color: 'var(--color-primary, #6366f1)',
                }}
              >
                {rows.length} row{rows.length !== 1 ? 's' : ''} &middot; {detectedType}
              </span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              aria-label="Remove file and reset"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-muted, #6b7280)' }}
            >
              <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
              Reset
            </button>
          </div>

          {/* ----- Error display ---------------------------------------- */}
          {errors.length > 0 && (
            <div
              className="flex flex-col gap-2 rounded-lg p-4"
              style={{
                backgroundColor: 'var(--color-error-bg, #fef2f2)',
                border: '1px solid var(--color-error-border, #fecaca)',
              }}
            >
              <div className="flex items-center gap-2">
                <AlertCircle
                  size={18}
                  strokeWidth={2}
                  style={{ color: 'var(--color-error, #dc2626)' }}
                  aria-hidden="true"
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--color-error, #dc2626)' }}
                >
                  {errors.length} invalid item{errors.length !== 1 ? 's' : ''} skipped
                </span>
              </div>
              <ul className="ml-6 list-disc text-xs" style={{ color: 'var(--color-error, #dc2626)' }}>
                {errors.slice(0, 5).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {errors.length > 5 && (
                  <li>...and {errors.length - 5} more</li>
                )}
              </ul>
            </div>
          )}

          {/* ----- Preview table ---------------------------------------- */}
          {rows.length > 0 && (
            <div
              className="max-h-64 overflow-auto rounded-lg border"
              style={{ borderColor: 'var(--color-border, #e5e7eb)' }}
            >
              <table className="w-full text-left text-sm">
                <thead>
                  <tr
                    style={{
                      backgroundColor: 'var(--color-surface, #f9fafb)',
                      borderBottom: '1px solid var(--color-border, #e5e7eb)',
                    }}
                  >
                    <th
                      className="px-4 py-2 text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'var(--color-muted, #6b7280)' }}
                    >
                      #
                    </th>
                    {headers.slice(0, 4).map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2 text-xs font-medium uppercase tracking-wider"
                        style={{ color: 'var(--color-muted, #6b7280)' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 50).map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid var(--color-border, #e5e7eb)',
                      }}
                    >
                      <td
                        className="px-4 py-2 text-xs"
                        style={{ color: 'var(--color-muted, #6b7280)' }}
                      >
                        {idx + 1}
                      </td>
                      {headers.slice(0, 4).map((h) => (
                        <td
                          key={h}
                          className="max-w-[200px] truncate px-4 py-2 text-xs"
                          style={{ color: 'var(--color-text, #111827)' }}
                        >
                          {truncate(row[h] || '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ----- Progress bar ----------------------------------------- */}
          {phase === 'generating' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Loader2
                  size={16}
                  strokeWidth={2}
                  className="animate-spin"
                  style={{ color: 'var(--color-primary, #6366f1)' }}
                  aria-hidden="true"
                />
                <span
                  className="text-sm"
                  style={{ color: 'var(--color-text, #111827)' }}
                >
                  Generating... {progress}%
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Batch generation progress"
                className="h-2 w-full overflow-hidden rounded-full"
                style={{ backgroundColor: 'var(--color-border, #e5e7eb)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: 'var(--color-primary, #6366f1)',
                  }}
                />
              </div>
            </div>
          )}

          {/* ----- Action buttons --------------------------------------- */}
          <div className="flex items-center gap-3">
            {phase === 'preview' && rows.length > 0 && (
              <button
                type="button"
                onClick={handleGenerate}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--color-primary, #6366f1)' }}
              >
                Generate All ({rows.length})
              </button>
            )}

            {phase === 'complete' && zipBlob && (
              <button
                type="button"
                onClick={handleDownloadZip}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--color-success, #16a34a)' }}
              >
                <Download size={16} strokeWidth={2} aria-hidden="true" />
                Download ZIP
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
