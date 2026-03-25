/**
 * @fileoverview Custom React hook for managing QR code generation history.
 *
 * Persists history entries to `localStorage` via {@link useLocalStorage} and
 * enforces a configurable maximum entry count ({@link MAX_HISTORY_ENTRIES}).
 * Entries are stored newest-first; the oldest entries are evicted when the
 * limit is reached.
 *
 * @module hooks/useHistory
 *
 * @example
 * ```tsx
 * const { entries, addEntry, removeEntry, clearHistory } = useHistory();
 *
 * // Save current QR code to history
 * addEntry({ type: 'url', data: { url: 'https://example.com' }, customization });
 *
 * // Remove a specific entry
 * removeEntry(entries[0].id);
 *
 * // Wipe all history
 * clearHistory();
 * ```
 */

import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { HistoryEntry } from '../types';
import { MAX_HISTORY_ENTRIES } from '../config/defaults';

/** localStorage key used for persisting history data. */
const STORAGE_KEY = 'qr-generator-history';

/**
 * React hook that provides CRUD-like operations over the QR code generation
 * history stored in `localStorage`.
 *
 * **Storage behaviour:**
 * - Entries are serialised as JSON under the key `'qr-generator-history'`.
 * - The list is capped at {@link MAX_HISTORY_ENTRIES}; adding a new entry
 *   when the list is full removes the oldest entry automatically.
 * - Each entry is assigned a UUID v4 `id` and a `Date.now()` timestamp on
 *   creation.
 *
 * @returns An object with:
 *  - `entries`      — The current list of history entries (newest first).
 *  - `addEntry`     — Prepend a new entry (id and timestamp are auto-generated).
 *  - `removeEntry`  — Remove a single entry by its `id`.
 *  - `clearHistory` — Remove all entries.
 */
export function useHistory() {
  const [entries, setEntries] = useLocalStorage<HistoryEntry[]>(STORAGE_KEY, []);

  /**
   * Adds a new history entry to the top of the list.
   *
   * The caller supplies all fields except `id` and `timestamp`, which are
   * generated automatically. If the history exceeds {@link MAX_HISTORY_ENTRIES},
   * the oldest entries are dropped.
   *
   * @param entry - Partial history entry (without `id` and `timestamp`).
   */
  const addEntry = useCallback(
    (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
      const newEntry: HistoryEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      setEntries((prev) => [newEntry, ...prev].slice(0, MAX_HISTORY_ENTRIES));
    },
    [setEntries],
  );

  /**
   * Removes a single history entry by its unique identifier.
   *
   * No-op if the `id` does not match any existing entry.
   *
   * @param id - UUID of the entry to remove.
   */
  const removeEntry = useCallback(
    (id: string) => {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    },
    [setEntries],
  );

  /**
   * Removes **all** history entries, resetting the list to an empty array.
   */
  const clearHistory = useCallback(() => {
    setEntries([]);
  }, [setEntries]);

  return { entries, addEntry, removeEntry, clearHistory };
}
