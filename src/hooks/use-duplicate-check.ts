// hooks/use-duplicate-check.ts
import { useState, useCallback, useEffect } from "react";
import { findSimilarItems } from "@/lib/text-utils";

/**
 * useDebounce
 * Delays updating the value until a certain amount of time has passed
 * after the last change.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

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

/**
 * Debounced callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };
}

interface UseDuplicateCheckOptions {
  threshold?: number;
  debounceMs?: number;
  minLength?: number;
}

/**
 * Hook for checking duplicate items with fuzzy matching
 */
export function useDuplicateCheck<T extends { id: string; name: string }>(
  items: T[],
  currentId?: string,
  options: UseDuplicateCheckOptions = {}
) {
  const { threshold = 2, debounceMs = 300, minLength = 2 } = options;

  const [warning, setWarning] = useState<string | null>(null);

  const checkDuplicate = useDebouncedCallback((searchTerm: string) => {
    // Clear warning if search term is too short
    if (!searchTerm || searchTerm.length < minLength) {
      setWarning(null);
      return;
    }

    // Check for similar matches only (exact matches are handled by dropdown filtering)
    const similar = findSimilarItems(searchTerm, items, currentId, threshold);

    if (similar.length > 0) {
      const names = similar
        .slice(0, 2)
        .map((s) => `"${s.name}"`)
        .join(" or ");
      setWarning(`Similar item found: ${names}!`);
    } else {
      setWarning(null);
    }
  }, debounceMs);

  const clearWarning = useCallback(() => setWarning(null), []);
  return { warning, checkDuplicate, clearWarning };
}
