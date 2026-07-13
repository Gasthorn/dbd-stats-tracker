import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { de } from "./locales/de";
import { en } from "./locales/en";
import { es } from "./locales/es";
import { fr } from "./locales/fr";
import { it } from "./locales/it";

export const SUPPORTED_LANGUAGES = ["fr", "en", "de", "it", "es"] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const LANGUAGE_STORAGE_KEY = "app-language";

const DATE_LOCALES: Record<AppLanguage, string> = {
  fr: "fr-FR",
  en: "en-US",
  de: "de-DE",
  it: "it-IT",
  es: "es-ES",
};

/** Device-local preference (not per-account): it must also apply on the login screen, before any auth. */
export function loadInitialLanguage(): AppLanguage {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return SUPPORTED_LANGUAGES.includes(stored as AppLanguage) ? (stored as AppLanguage) : "fr";
}

export function persistLanguage(language: AppLanguage) {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
}

/** Locale tag for toLocaleDateString/toLocaleString call sites. */
export function getDateLocale(): string {
  return DATE_LOCALES[i18n.language as AppLanguage] ?? DATE_LOCALES.fr;
}

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
    de: { translation: de },
    it: { translation: it },
    es: { translation: es },
  },
  lng: loadInitialLanguage(),
  fallbackLng: "fr",
  interpolation: {
    // React already escapes rendered strings.
    escapeValue: false,
  },
});

export { i18n };
