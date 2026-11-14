import { useSyncExternalStore } from "react";

let dark = false;
const listeners = new Set<() => void>();

export function setDarkMode(value: boolean) {
  dark = value;
  document.documentElement.classList.toggle("dark", value);
  listeners.forEach(listener => listener());
}

export function useDarkMode() {
  return useSyncExternalStore(cb => { listeners.add(cb); return () => { listeners.delete(cb); }; }, () => dark, () => false);
}
