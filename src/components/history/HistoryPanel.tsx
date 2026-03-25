/**
 * @fileoverview History sidebar component.
 *
 * Displays a scrollable list of previously generated QR codes, stored as
 * {@link HistoryEntry} objects. Each entry shows a type badge, a truncated
 * data preview, and a relative timestamp. Users can click an entry to
 * restore it, delete individual entries, or clear the entire history.
 *
 * @module components/history/HistoryPanel
 *
 * @example
 * ```tsx
 * <HistoryPanel
 *   entries={history}
 *   onRestore={(entry) => loadEntry(entry)}
 *   onDelete={(id) => removeEntry(id)}
 *   onClear={() => clearHistory()}
 * />
 * ```
 */

import { useState } from 'react';
import {
  Clock,
  Trash2,
  RotateCcw,
  AlertTriangle,
  History,
} from 'lucide-react';
import type { HistoryEntry } from '../../types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Props accepted by the {@link HistoryPanel} component.
 */
interface HistoryPanelProps {
  /** Ordered list of history entries (most recent first). */
  entries: HistoryEntry[];

  /**
   * Called when the user clicks an entry to restore its data and
   * customization settings.
   *
   * @param entry - The history entry to restore.
   */
  onRestore: (entry: HistoryEntry) => void;

  /**
   * Called when the user deletes a single history entry.
   *
   * @param id - The unique ID of the entry to remove.
   */
  onDelete: (id: string) => void;

  /**
   * Called when the user confirms the "Clear all" action.
   */
  onClear: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Format a Unix epoch timestamp into a human-readable relative string.
 *
 * Produces output such as "just now", "5 min ago", "2 hours ago",
 * "3 days ago", or a locale date string for anything older than 30 days.
 *
 * @param timestamp - Unix epoch time in milliseconds.
 * @returns A relative time string.
 */
function relativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
  if (diffDay < 30) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;

  return new Date(timestamp).toLocaleDateString();
}

/**
 * Truncate a string to a maximum length, appending an ellipsis when
 * the string exceeds the limit.
 *
 * @param str    - The string to truncate.
 * @param maxLen - Maximum allowed length (default 35).
 * @returns The truncated string.
 */
function truncate(str: string, maxLen = 35): string {
  return str.length > maxLen ? `${str.slice(0, maxLen)}...` : str;
}

/**
 * Produce a short human-readable data preview from a history entry's
 * serialised payload.
 *
 * Attempts to extract the most meaningful field (e.g. `url`, `text`,
 * `ssid`, `firstName`) from the data object.
 *
 * @param data - The serialised payload record.
 * @returns A preview string, or `"(no data)"` as a fallback.
 */
function dataPreview(data: Record<string, unknown>): string {
  const candidates = ['url', 'text', 'ssid', 'number', 'name', 'firstName', 'to', 'address', 'appName'];
  for (const key of candidates) {
    if (data[key] && typeof data[key] === 'string') {
      return data[key] as string;
    }
  }
  return JSON.stringify(data).slice(0, 50) || '(no data)';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * History sidebar panel showing previously generated QR codes.
 *
 * **Features:**
 * - Each entry shows a coloured type badge, a truncated data preview,
 *   and a relative timestamp (e.g. "5 min ago").
 * - Clicking the entry body triggers {@link HistoryPanelProps.onRestore}.
 * - A per-entry delete button removes individual entries.
 * - A "Clear all" button (with a confirmation step) wipes the full history.
 * - An empty state is shown when there are no entries.
 *
 * **Accessibility:**
 * - Restore and delete actions are separate interactive elements with
 *   clear `aria-label` attributes.
 * - The confirmation dialog for "Clear all" uses inline UI rather than
 *   `window.confirm()` for a consistent experience.
 *
 * @param props - Component props.
 * @returns The rendered history panel.
 */
export default function HistoryPanel({
  entries,
  onRestore,
  onDelete,
  onClear,
}: HistoryPanelProps) {
  /**
   * Whether the "Clear all" confirmation prompt is currently visible.
   */
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // -----------------------------------------------------------------------
  // Empty state
  // -----------------------------------------------------------------------

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <History
          size={48}
          strokeWidth={1.5}
          style={{ color: 'var(--color-muted, #9ca3af)' }}
          aria-hidden="true"
        />
        <p
          className="mt-4 text-center text-sm"
          style={{ color: 'var(--color-muted, #9ca3af)' }}
        >
          No QR codes generated yet
        </p>
        <p
          className="mt-1 text-center text-xs"
          style={{ color: 'var(--color-muted, #9ca3af)' }}
        >
          Your history will appear here
        </p>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Populated state
  // -----------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-3">
      {/* Header row with entry count and clear button */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: 'var(--color-muted, #6b7280)' }}
        >
          Recent ({entries.length})
        </span>

        {!showClearConfirm ? (
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-error, #dc2626)' }}
          >
            <Trash2 size={12} strokeWidth={2} aria-hidden="true" />
            Clear all
          </button>
        ) : (
          /* Confirmation inline prompt */
          <div className="flex items-center gap-2">
            <AlertTriangle
              size={14}
              strokeWidth={2}
              style={{ color: 'var(--color-warning, #d97706)' }}
              aria-hidden="true"
            />
            <span
              className="text-xs"
              style={{ color: 'var(--color-text, #111827)' }}
            >
              Delete all?
            </span>
            <button
              type="button"
              onClick={() => {
                onClear();
                setShowClearConfirm(false);
              }}
              className="rounded px-2 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: 'var(--color-error, #dc2626)' }}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setShowClearConfirm(false)}
              className="rounded px-2 py-0.5 text-xs font-medium"
              style={{
                color: 'var(--color-muted, #6b7280)',
                backgroundColor: 'var(--color-surface, #f3f4f6)',
              }}
            >
              No
            </button>
          </div>
        )}
      </div>

      {/* Entry list */}
      <ul className="flex flex-col gap-2">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="group flex items-start gap-3 rounded-lg p-3 transition-colors duration-150"
            style={{
              backgroundColor: 'var(--color-surface, #f9fafb)',
              border: '1px solid var(--color-border, #e5e7eb)',
            }}
          >
            {/* Clickable body — restores the entry */}
            <button
              type="button"
              onClick={() => onRestore(entry)}
              className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left"
              aria-label={`Restore ${entry.type} QR code`}
            >
              {/* Type badge */}
              <span
                className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: 'var(--color-primary-light, rgba(99, 102, 241, 0.1))',
                  color: 'var(--color-primary, #6366f1)',
                }}
              >
                {entry.type}
              </span>

              {/* Data preview */}
              <span
                className="w-full truncate text-sm"
                style={{ color: 'var(--color-text, #111827)' }}
              >
                {truncate(dataPreview(entry.data))}
              </span>

              {/* Relative timestamp */}
              <span
                className="flex items-center gap-1 text-xs"
                style={{ color: 'var(--color-muted, #9ca3af)' }}
              >
                <Clock size={12} strokeWidth={2} aria-hidden="true" />
                {relativeTime(entry.timestamp)}
              </span>
            </button>

            {/* Delete button */}
            <button
              type="button"
              onClick={() => onDelete(entry.id)}
              aria-label={`Delete ${entry.type} QR code from history`}
              className="mt-1 flex-shrink-0 rounded p-1 opacity-0 transition-opacity duration-150 hover:opacity-100 group-hover:opacity-70"
              style={{ color: 'var(--color-error, #dc2626)' }}
            >
              <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      {/* Restore hint */}
      <p
        className="flex items-center gap-1 text-center text-xs"
        style={{ color: 'var(--color-muted, #9ca3af)' }}
      >
        <RotateCcw size={12} strokeWidth={2} aria-hidden="true" />
        Click an entry to restore it
      </p>
    </div>
  );
}
