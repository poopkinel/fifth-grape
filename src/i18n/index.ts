import * as Localization from "expo-localization";
import * as Updates from "expo-updates";
import i18n from "i18next";
import { I18nManager } from "react-native";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import he from "./locales/he.json";

export type AppLanguage = "en" | "he";

const SUPPORTED: readonly AppLanguage[] = ["en", "he"] as const;

export function detectDeviceLanguage(): AppLanguage {
  const code = (Localization.getLocales()[0]?.languageCode ?? "en").toLowerCase();
  if (code === "he" || code === "iw") return "he";
  return "en";
}

export function isRtlLanguage(lang: AppLanguage): boolean {
  return lang === "he";
}

let initialized = false;

export function initI18n(language: AppLanguage): void {
  if (initialized) {
    if (i18n.language !== language) {
      void i18n.changeLanguage(language);
    }
    return;
  }
  initialized = true;
  void i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      he: { translation: he },
    },
    lng: language,
    fallbackLng: "en",
    supportedLngs: SUPPORTED as unknown as string[],
    interpolation: { escapeValue: false },
    returnNull: false,
  });
}

export async function applyLanguageAndReload(language: AppLanguage): Promise<void> {
  const wantRtl = isRtlLanguage(language);
  await i18n.changeLanguage(language);
  if (I18nManager.isRTL !== wantRtl) {
    I18nManager.allowRTL(wantRtl);
    I18nManager.forceRTL(wantRtl);
    try {
      await Updates.reloadAsync();
    } catch {
      // In dev/Expo Go, Updates.reloadAsync may not be available; the next
      // full reload will pick up the direction change. Caller can no-op.
    }
  }
}

export default i18n;
