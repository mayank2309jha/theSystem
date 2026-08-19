import { useEffect, useRef, useState } from "react";

function readStorage(key, initialValue) {
  try {
    const stored = window.localStorage.getItem(key);
    return stored !== null ? JSON.parse(stored) : initialValue;
  } catch {
    return initialValue;
  }
}

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStorage(key, initialValue));
  const lastKeyRef = useRef(key);
  const skipNextWriteRef = useRef(false);

  // The lazy initializer above only runs once, at mount — if `key` changes
  // later (e.g. a different user logs in and the namespaced key changes),
  // this re-reads from the NEW key's storage slot instead of silently
  // continuing to read/write the previous key's data.
  useEffect(() => {
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;
    skipNextWriteRef.current = true; // don't let the write-effect below re-persist the outgoing key's stale value under the new key
    setValue(readStorage(key, initialValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (skipNextWriteRef.current) {
      skipNextWriteRef.current = false;
      return;
    }
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
