"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { usePatient } from "@/state/PatientProvider";
import type { PatientSession } from "@/state/patient-types";
import { resolveLocalized, type Report } from "@/lib/report-types";
import { PatientIntakeModal } from "./PatientIntakeModal";

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
  const t = useT();
  const { locale } = useLocale();
  const { patient, setPatient, hydrated } = usePatient();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<Report | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const resolved = useMemo(
    () =>
      reports.map((r) => ({
        ...r,
        _title: resolveLocalized(r.titles, locale),
        _description: resolveLocalized(r.descriptions, locale),
      })),
    [reports, locale],
  );

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return resolved;
    return resolved.filter(
      (r) =>
        normalize(r._title).includes(q) || normalize(r._description).includes(q),
    );
  }, [resolved, query]);

  const handleOpen = (report: Report) => {
    if (!hydrated) return; // wait for session hydration
    if (!report.requiresPatient) {
      router.push(`/r/${report.slug}`);
      return;
    }
    if (patient) {
      router.push(`/r/${report.slug}`);
      return;
    }
    setPending(report);
    setModalOpen(true);
  };

  const handleSubmit = (p: PatientSession) => {
    setPatient(p);
    setModalOpen(false);
    if (pending) {
      const slug = pending.slug;
      setPending(null);
      router.push(`/r/${slug}`);
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
    setPending(null);
  };

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
            placeholder={t.catalog.searchPlaceholder}
            className="w-full rounded-md border border-[var(--color-line)] bg-[var(--color-input)] py-2.5 pl-10 pr-3 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-muted-soft)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_oklab,var(--color-primary)_30%,transparent)]"
            aria-label={t.catalog.searchPlaceholder}
          />
        </div>

        <p className="text-xs tabular-nums text-[var(--color-muted)]">
          {filtered.length === reports.length
            ? t.catalog.totalReports(reports.length)
            : t.catalog.filteredReports(filtered.length, reports.length)}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 rounded-[var(--radius-card)] border border-dashed border-[var(--color-line-strong)] px-6 py-16 text-center">
          <p className="text-lg font-medium text-[var(--color-ink)]">
            {t.catalog.emptyTitle}
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {t.catalog.emptyHint}
          </p>
        </div>
      ) : (
        <ul
          role="list"
          className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((r) => (
            <li key={r.slug}>
              <button
                type="button"
                onClick={() => handleOpen(r)}
                className="group relative flex h-full w-full flex-col rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-5 text-left transition hover:-translate-y-0.5 hover:border-[var(--color-primary)]/60 hover:bg-[var(--color-surface-raised)] focus:outline-none focus-visible:border-[var(--color-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary-soft)] px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-[var(--color-primary)]">
                    {t.catalog.reportBadge}
                  </span>
                </div>

                <h3 className="mt-4 text-[1.08rem] font-medium leading-snug text-[var(--color-ink)] transition group-hover:text-[var(--color-primary)]">
                  {r._title}
                </h3>

                {r._description ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--color-muted)]">
                    {r._description}
                  </p>
                ) : null}

                <div className="mt-auto flex items-center justify-between pt-6 text-xs font-medium text-[var(--color-muted)]">
                  <span className="transition group-hover:text-[var(--color-primary)]">
                    {t.catalog.openReport}
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
              </button>
            </li>
          ))}
        </ul>
      )}

      <PatientIntakeModal
        open={modalOpen}
        reportTitle={pending ? resolveLocalized(pending.titles, locale) : ""}
        initial={null}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </>
  );
}
