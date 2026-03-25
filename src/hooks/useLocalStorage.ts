/**
 * @file useLocalStorage.ts
 * @description Generic, type-safe custom hook for reading and writing values
 * to `localStorage` with automatic JSON serialization/deserialization.
 *
 * Falls back to the provided initial value when `localStorage` is unavailable
 * (e.g. SSR, private browsing quota exceeded) or when the stored value cannot
 * be parsed.
 *
 * @module hooks/useLocalStorage
 *
 * @example
 * ```tsx
 * const [name, setName] = useLocalStorage<string>('user-name', 'Anonymous');
 * setName('Alice');
 * ```
 */

import { useState, useCallback } from 'react';

/**
 * Reads a JSON-serialized value from `localStorage`.
 *
 * @typeParam T - The expected shape of the stored value.
 * @param key - The `localStorage` key to read.
 * @param initialValue - Fallback returned when the key is missing or unparseable.
 * @returns The parsed value, or `initialValue` on failure.
 */
function readStorage<T>(key: string, initialValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return initialValue;
    return JSON.parse(raw) as T;
  } catch {
    return initialValue;
  }
}

/**
 * React hook that mirrors `useState` but persists the value in `localStorage`
 * under the given key.
 *
 * - On mount the hook reads the stored value (or uses `initialValue`).
 * - Every call to the setter writes the new value back to `localStorage`.
 * - Supports both direct values and updater functions, just like `useState`.
 * - Gracefully handles `localStorage` being unavailable or full.
 *
 * @typeParam T - The type of the stored value. Must be JSON-serializable.
 * @param key - The `localStorage` key.
 * @param initialValue - Value used when nothing is stored yet.
 * @returns A `[value, setValue]` tuple identical to the `useState` API.
 *
 * @example
 * ```tsx
 * const [count, setCount] = useLocalStorage<number>('counter', 0);
 * setCount((prev) => prev + 1);
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() =>
    readStorage(key, initialValue),
  );

  /**
   * Updates both React state and `localStorage` in a single call.
   *
   * Accepts either a direct value or an updater function `(prev) => next`,
   * mirroring the `useState` setter signature.
   *
   * @param value - The new value, or an updater that receives the previous value.
   */
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // Storage full or unavailable — state still updates in memory.
        }
        return next;
      });
    },
    [key],
  );

  return [storedValue, setValue];
}

export default useLocalStorage;
