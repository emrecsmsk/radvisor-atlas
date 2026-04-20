import type { Locale } from "@/i18n/config";

export type LocalizedString = Partial<Record<Locale, string>>;

export interface Report {
  slug: string;
  titles: LocalizedString;
  descriptions: LocalizedString;
  href: string;
  bytes: number;
  requiresPatient: boolean;
}

export function resolveLocalized(
  value: LocalizedString,
  locale: Locale,
  fallbackLocale: Locale = "tr",
): string {
  const primary = value[locale];
  if (primary && primary.trim()) return primary;
  const fallback = value[fallbackLocale];
  if (fallback && fallback.trim()) return fallback;
  // last resort: any non-empty entry
  for (const key of Object.keys(value) as Locale[]) {
    const v = value[key];
    if (v && v.trim()) return v;
  }
  return "";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
