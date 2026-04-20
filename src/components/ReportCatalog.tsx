"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Report } from "@/lib/report-types";

interface Props {
  reports: Report[];
}

function normalize(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i");
}

export function ReportCatalog({ reports }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return reports;
    return reports.filter(
      (r) =>
        normalize(r.title).includes(q) ||
        normalize(r.description).includes(q),
    );
  }, [reports, query]);

  return (
    <>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-soft)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <circle cx="9" cy="9" r="6" />
            <path d="m13.5 13.5 3.5 3.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rapor ara..."
            className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-input)] py-2.5 pl-10 pr-3 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-muted-soft)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_oklab,var(--color-primary)_30%,transparent)]"
            aria-label="Rapor ara"
          />
        </div>

        <p className="text-xs tabular-nums text-[var(--color-muted)]">
          {filtered.length === reports.length
            ? `${reports.length} rapor`
            : `${filtered.length} / ${reports.length} rapor`}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 rounded-[var(--radius-card)] border border-dashed border-[var(--color-line-strong)] px-6 py-16 text-center">
          <p className="text-lg font-medium text-[var(--color-ink)]">
            Eşleşen rapor bulunamadı
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Arama terimini değiştirmeyi deneyin.
          </p>
        </div>
      ) : (
        <ul
          role="list"
          className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((r) => (
            <li key={r.slug}>
              <Link
                href={`/r/${r.slug}`}
                className="group relative flex h-full flex-col rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 transition hover:-translate-y-0.5 hover:border-[var(--color-primary)]/60 hover:bg-[var(--color-surface-raised)] focus:outline-none focus-visible:border-[var(--color-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary-soft)] px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-[var(--color-primary)]">
                    Rapor
                  </span>
                </div>

                <h3 className="mt-4 text-[1.08rem] font-medium leading-snug text-[var(--color-ink)] transition group-hover:text-[var(--color-primary)]">
                  {r.title}
                </h3>

                {r.description ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--color-muted)]">
                    {r.description}
                  </p>
                ) : null}

                <div className="mt-auto flex items-center justify-between pt-6 text-xs font-medium text-[var(--color-muted)]">
                  <span className="transition group-hover:text-[var(--color-primary)]">
                    Raporu aç
                  </span>
                  <svg
                    aria-hidden
                    viewBox="0 0 20 20"
                    className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path
                      d="M5 10h10m0 0-4-4m4 4-4 4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
