import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

describe('useLocalStorage', () => {
  it('returns initial value when empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-empty', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('updates state with direct value', () => {
    const { result } = renderHook(() => useLocalStorage('test-direct', 'a'));
    act(() => { result.current[1]('b'); });
    expect(result.current[0]).toBe('b');
  });

  it('supports updater function', () => {
    const { result } = renderHook(() => useLocalStorage('test-updater', 0));
    act(() => { result.current[1]((p) => p + 1); });
    expect(result.current[0]).toBe(1);
  });

  it('still updates state when setItem throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded');
    });
    const { result } = renderHook(() => useLocalStorage('test-throw', 'a'));
    act(() => { result.current[1]('b'); });
    expect(result.current[0]).toBe('b');
    spy.mockRestore();
  });

  it('handles sequential updates', () => {
    const { result } = renderHook(() => useLocalStorage('test-seq', 0));
    act(() => { result.current[1](1); });
    act(() => { result.current[1](2); });
    act(() => { result.current[1](3); });
    expect(result.current[0]).toBe(3);
  });
});
