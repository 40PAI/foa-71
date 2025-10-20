// Performance monitoring utilities
import React from "react";

interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  type: 'component' | 'query' | 'mutation' | 'navigation';
}

class PerformanceMonitor {
  private entries: PerformanceEntry[] = [];
  private observers: ((entry: PerformanceEntry) => void)[] = [];

  logEntry(entry: PerformanceEntry) {
    this.entries.push(entry);
    
    // Warn about slow operations
    if (entry.duration > 100) {
      console.warn(`🐌 Slow ${entry.type}: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
    }

    // Notify observers
    this.observers.forEach(observer => observer(entry));
    
    // Keep only last 100 entries
    if (this.entries.length > 100) {
      this.entries = this.entries.slice(-100);
    }
  }

  getEntries(type?: string): PerformanceEntry[] {
    return type 
      ? this.entries.filter(entry => entry.type === type)
      : this.entries;
  }

  getAverageDuration(type?: string): number {
    const relevantEntries = this.getEntries(type);
    if (relevantEntries.length === 0) return 0;
    
    const total = relevantEntries.reduce((sum, entry) => sum + entry.duration, 0);
    return total / relevantEntries.length;
  }

  getSlowestOperations(limit = 10): PerformanceEntry[] {
    return [...this.entries]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  subscribe(observer: (entry: PerformanceEntry) => void): () => void {
    this.observers.push(observer);
    
    // Return unsubscribe function
    return () => {
      const index = this.observers.indexOf(observer);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  clear() {
    this.entries = [];
  }

  // Helper to measure function execution
  measure<T>(name: string, type: PerformanceEntry['type'], fn: () => T): T {
    const startTime = performance.now();
    
    try {
      const result = fn();
      
      if (result instanceof Promise) {
        return result.finally(() => {
          const duration = performance.now() - startTime;
          this.logEntry({ name, startTime, duration, type });
        }) as T;
      }
      
      const duration = performance.now() - startTime;
      this.logEntry({ name, startTime, duration, type });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.logEntry({ name: `${name} (ERROR)`, startTime, duration, type });
      throw error;
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// React Query wrapper with performance monitoring
export function withPerformanceMonitoring<T>(
  queryFn: () => Promise<T>,
  queryKey: string
): () => Promise<T> {
  return async () => {
    return performanceMonitor.measure(
      `Query: ${queryKey}`,
      'query',
      queryFn
    );
  };
}

// Component performance HOC
export function withComponentPerformance<P extends object>(
  Component: React.ComponentType<P>,
  displayName?: string
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => {
    const startTime = performance.now();
    
    React.useEffect(() => {
      const duration = performance.now() - startTime;
      performanceMonitor.logEntry({
        name: displayName || Component.displayName || Component.name || 'Anonymous',
        startTime,
        duration,
        type: 'component',
      });
    });

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withPerformance(${displayName || Component.displayName || Component.name})`;
  
  return WrappedComponent;
}
