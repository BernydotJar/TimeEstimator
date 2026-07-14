"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const initialValueRef = useRef(initialValue);
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      setStoredValue(
        item ? (JSON.parse(item) as T) : initialValueRef.current,
      );
    } catch (error) {
      console.error("useLocalStorage read error:", error);
      setStoredValue(initialValueRef.current);
    } finally {
      setHydrated(true);
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      setStoredValue((current) => {
        const next = value instanceof Function ? value(current) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch (error) {
          console.error("useLocalStorage write error:", error);
        }
        return next;
      });
    },
    [key],
  );

  return [storedValue, setValue, hydrated] as const;
}
