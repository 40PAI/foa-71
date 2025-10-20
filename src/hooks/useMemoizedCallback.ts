/**
 * Performance utility for memoizing expensive callbacks and computations
 */

import { useCallback, useRef, useMemo } from 'react';

/**
 * Deep comparison for dependency arrays
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(key => deepEqual(a[key], b[key]));
  }
  return false;
}

/**
 * Memoized callback that only recreates when dependencies actually change (deep comparison)
 */
export function useDeepCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: any[]
): T {
  const ref = useRef<{ deps: any[]; callback: T }>();

  if (!ref.current || !deepEqual(ref.current.deps, dependencies)) {
    ref.current = { deps: dependencies, callback };
  }

  return useCallback(callback, [ref.current.callback]);
}

/**
 * Memoized computation with deep comparison
 */
export function useDeepMemo<T>(factory: () => T, dependencies: any[]): T {
  const ref = useRef<{ deps: any[]; value: T }>();

  if (!ref.current || !deepEqual(ref.current.deps, dependencies)) {
    ref.current = { deps: dependencies, value: factory() };
  }

  return ref.current.value;
}

/**
 * Debounced value hook - useful for search inputs
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

import { useEffect, useState } from 'react';

/**
 * Throttled value hook - useful for scroll/resize events
 */
export function useThrottledValue<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdated.current;

    if (timeSinceLastUpdate >= interval) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, interval - timeSinceLastUpdate);

      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}
