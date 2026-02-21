"use client";

import { useCallback, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      setStoredValue((current) => {
        const next = value instanceof Function ? value(current) : value;
        try {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(key, JSON.stringify(next));
          }
        } catch (error) {
          console.error("useLocalStorage write error:", error);
        }
        return next;
      });
    },
    [key],
  );

  return [storedValue, setValue] as const;
}
