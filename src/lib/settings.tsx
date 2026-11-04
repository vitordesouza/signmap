import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_SETTINGS, settingsSchema, type CalculationSettings } from "../schemas/chart";
const KEY = "mapa.settings.v1";
const SettingsContext = createContext<{
  settings: CalculationSettings;
  ready: boolean;
  save: (s: CalculationSettings) => void;
  storageError: string;
}>({ settings: DEFAULT_SETTINGS, ready: false, save: () => {}, storageError: "" });
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS),
    [ready, setReady] = useState(false),
    [storageError, setStorageError] = useState("");
  // Hydrate browser-local preferences after SSR; localStorage is an external system.
  /* oxlint-disable react/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = settingsSchema.safeParse(JSON.parse(raw));
        if (parsed.success) setSettings(parsed.data);
      }
    } catch {
      setStorageError("Your browser could not restore settings. Defaults are active.");
    }
    setReady(true);
  }, []);
  /* oxlint-enable react/set-state-in-effect */
  const save = (value: CalculationSettings) => {
    const next = settingsSchema.parse(value);
    setSettings(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      setStorageError("");
    } catch {
      setStorageError("Settings apply for this session, but your browser could not save them.");
    }
  };
  return (
    <SettingsContext.Provider value={{ settings, ready, save, storageError }}>
      {children}
    </SettingsContext.Provider>
  );
}
export const useSettings = () => useContext(SettingsContext);
