// Performance optimization utilities

import { useMemo, useCallback } from "react";

// Debounce function for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Throttle function for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memoized calculation hook
export function useMemoizedCalculation<T>(
  calculation: () => T,
  dependencies: React.DependencyList
): T {
  return useMemo(calculation, dependencies);
}

// Stable callback hook
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: React.DependencyList
): T {
  return useCallback(callback, dependencies);
}

// Virtual scrolling utilities
export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function calculateVirtualItems(
  scrollTop: number,
  totalItems: number,
  options: VirtualScrollOptions
) {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    totalItems - 1
  );
  
  const start = Math.max(0, visibleStart - overscan);
  const end = Math.min(totalItems - 1, visibleEnd + overscan);
  
  return {
    start,
    end,
    offsetY: start * itemHeight,
    totalHeight: totalItems * itemHeight,
  };
}

// Intersection observer hook for lazy loading
export function useIntersectionObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) {
  return useCallback((node: Element | null) => {
    if (!node) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(callback);
      },
      options
    );
    
    observer.observe(node);
    
    return () => observer.disconnect();
  }, [callback, options]);
}

// Batch updates for better performance
export class BatchProcessor<T> {
  private queue: T[] = [];
  private isProcessing = false;
  private processor: (items: T[]) => void;
  private delay: number;

  constructor(processor: (items: T[]) => void, delay = 100) {
    this.processor = processor;
    this.delay = delay;
  }

  add(item: T) {
    this.queue.push(item);
    this.scheduleProcess();
  }

  private scheduleProcess() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    setTimeout(() => {
      const items = [...this.queue];
      this.queue = [];
      this.isProcessing = false;
      
      if (items.length > 0) {
        this.processor(items);
      }
    }, this.delay);
  }
}

// Memory usage monitoring
export function measureMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1048576 * 100) / 100,
      total: Math.round(memory.totalJSHeapSize / 1048576 * 100) / 100,
      limit: Math.round(memory.jsHeapSizeLimit / 1048576 * 100) / 100,
    };
  }
  return null;
}

// Performance timing
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`${name} took ${end - start} milliseconds`);
  return result;
}