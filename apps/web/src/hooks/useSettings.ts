import { useState } from "react";

const HAPTIC_KEY = "rolls_haptic";
const LANG_KEY   = "rolls_lang";

export type AppLang = "ru" | "en";

export function getHaptic(): boolean {
  return localStorage.getItem(HAPTIC_KEY) !== "false";
}

export function getLang(): AppLang {
  return (localStorage.getItem(LANG_KEY) as AppLang) || "ru";
}

/** Call this anywhere to trigger a haptic impulse (no-op if disabled or outside Telegram). */
export function triggerHaptic(type: "light" | "medium" | "heavy" = "light") {
  if (!getHaptic()) return;
  window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(type);
}

export function useSettings() {
  const [haptic, setHapticState] = useState<boolean>(getHaptic);
  const [lang,   setLangState]   = useState<AppLang>(getLang);

  function setHaptic(v: boolean) {
    localStorage.setItem(HAPTIC_KEY, String(v));
    setHapticState(v);
  }

  function setLang(v: AppLang) {
    localStorage.setItem(LANG_KEY, v);
    setLangState(v);
  }

  return { haptic, setHaptic, lang, setLang };
}
