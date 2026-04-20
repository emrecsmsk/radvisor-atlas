export const locales = ["tr", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "tr";

export const localeNames: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
};

export const localeShortLabels: Record<Locale, string> = {
  tr: "TR",
  en: "EN",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

export const LOCALE_STORAGE_KEY = "radvisor-atlas-locale";
