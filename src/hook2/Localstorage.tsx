import { useState } from "react";

export default function useLocalstorage<T>(key: string, initialValue: T): [T, (value: T | ((prevValue: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  const setValue = (value: T | ((prevValue: T) => T)) => {
    const newValue = typeof value === "function" ? (value as (prevValue: T) => T)(storedValue) : value;
    setStoredValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [storedValue, setValue];
}