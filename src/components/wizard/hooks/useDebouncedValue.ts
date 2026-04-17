// Source: CONTEXT D-13 (250ms debounce for estimate bar) + EST-07 + RESEARCH §Pattern 4
// (useWatch for estimate). Bounds update frequency per T-03-22 DoS mitigation.
import { useEffect, useState } from "react";

/**
 * Debounce a value by `delayMs` (default 250ms per D-13). Screen readers
 * announce the settled value, not every keystroke (A11Y-05).
 */
export function useDebouncedValue<T>(value: T, delayMs: number = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}
