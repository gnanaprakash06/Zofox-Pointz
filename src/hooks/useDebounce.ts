import { useEffect, useRef, useState } from "react";

/**
 * Custom hook to debounce a value by a specified delay.
 * @param value - The input value to debounce.
 * @param delay - The debounce delay in milliseconds (default: 100ms).
 * @returns The debounced value.
 */
const useDebounce = <T>(value: T, delay: number = 100): T => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Set a new timeout to update the debounced value
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timeout on unmount or before next effect runs
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
