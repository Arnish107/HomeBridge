"use client";

import { useCallback, useSyncExternalStore } from "react";

// Same-tab writes don't fire the browser's "storage" event, so we broadcast our own.
const EVENT = "homebridge:storage";

// Parsed values cached by raw string, so React gets a stable snapshot between reads.
const cache = new Map<string, { raw: string | null; value: unknown }>();

function read<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    // storage blocked (private mode): use whatever this visit has written so far
    return (cache.get(key)?.value as T | undefined) ?? fallback;
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  try {
    value = raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    // corrupt entry: fall back to the default
  }
  cache.set(key, { raw, value });
  return value;
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

/**
 * State persisted in localStorage for this browser only.
 * Renders `fallback` on the server and during hydration, then the saved value.
 */
export function useStoredState<T extends object>(key: string, fallback: T) {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback
  );

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === "function" ? (next as (p: T) => T)(read(key, fallback)) : next;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // storage unavailable; keep working for this visit via the cache
        cache.set(key, { raw: JSON.stringify(resolved), value: resolved });
      }
      window.dispatchEvent(new Event(EVENT));
    },
    [key, fallback]
  );

  return [value, setValue] as const;
}
