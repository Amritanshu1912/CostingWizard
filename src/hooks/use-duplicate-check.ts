// hooks/use-duplicate-check.ts
import { findSimilarItems } from "@/lib/text-utils";
import { useCallback, useEffect, useRef, useState } from "react";

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

  // Use refs to maintain stable references to changing values
  const itemsRef = useRef(items);
  const currentIdRef = useRef(currentId);
  const thresholdRef = useRef(threshold);
  const minLengthRef = useRef(minLength);

  // Update refs when values change
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    currentIdRef.current = currentId;
  }, [currentId]);

  useEffect(() => {
    thresholdRef.current = threshold;
  }, [threshold]);

  useEffect(() => {
    minLengthRef.current = minLength;
  }, [minLength]);

  // Create a stable checkDuplicate function
  const checkDuplicate = useDebouncedCallback((searchTerm: string) => {
    if (!searchTerm || searchTerm.length < minLengthRef.current) {
      setWarning(null);
      return;
    }

    const similar = findSimilarItems(
      searchTerm,
      itemsRef.current,
      currentIdRef.current,
      thresholdRef.current
    );

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
