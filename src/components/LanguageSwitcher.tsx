"use client";

import { useLocale, useT } from "@/i18n/I18nProvider";
import { locales, localeShortLabels, type Locale } from "@/i18n/config";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const t = useT();

  return (
    <div
      role="group"
      aria-label={t.shell.languageSwitcherLabel}
      className="inline-flex items-center gap-0.5 rounded-md border border-[var(--color-line)] bg-[var(--color-input)] p-0.5 text-xs font-semibold tracking-wider"
    >
      {locales.map((l: Locale) => {
        const active = locale === l;
        return (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            aria-pressed={active}
            className={[
              "rounded px-2.5 py-1 transition",
              active
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-muted)] hover:text-[var(--color-ink)]",
            ].join(" ")}
          >
            {localeShortLabels[l]}
          </button>
        );
      })}
    </div>
  );
}
