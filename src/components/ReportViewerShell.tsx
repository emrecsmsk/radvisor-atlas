"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useT } from "@/i18n/I18nProvider";
import { usePatient } from "@/state/PatientProvider";
import type { PatientSession } from "@/state/patient-types";
import { resolveLocalized, type Report } from "@/lib/report-types";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { PatientIntakeModal } from "./PatientIntakeModal";

interface Props {
  report: Report;
}

function buildIframeSrc(
  href: string,
  locale: string,
  patient: PatientSession | null,
): string {
  const params = new URLSearchParams();
  params.set("locale", locale);
  if (patient) {
    params.set("patient", encodeURIComponent(JSON.stringify(patient)));
  }
  return `${href}?${params.toString()}`;
}

export function ReportViewerShell({ report }: Props) {
  const t = useT();
  const { locale } = useLocale();
  const { patient, setPatient, hydrated } = usePatient();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  // If report requires patient and we're hydrated without one, prompt
  useEffect(() => {
    if (!hydrated) return;
    if (report.requiresPatient && !patient && !editOpen) {
      setEditOpen(true);
    }
  }, [hydrated, patient, report.requiresPatient, editOpen]);

  const title = resolveLocalized(report.titles, locale);
  const iframeSrc = useMemo(
    () => buildIframeSrc(report.href, locale, patient),
    [report.href, locale, patient],
  );

  const patientReady = !report.requiresPatient || !!patient;

  const handleEditSubmit = (p: PatientSession) => {
    setPatient(p);
    setEditOpen(false);
  };

  const handleEditCancel = () => {
    setEditOpen(false);
    // If we never had a patient for a required report, send user back to catalog
    if (report.requiresPatient && !patient) {
      router.push("/");
    }
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[var(--color-bg)]">
      <header className="flex-none border-b border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="mx-auto flex h-[var(--shell-topbar-h)] w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link
            href="/"
            aria-label={t.viewer.backToCatalog}
            className="inline-flex shrink-0 items-center gap-2 rounded-md border border-[var(--color-line-strong)] bg-transparent px-3 py-1.5 text-sm font-medium text-[var(--color-ink-soft)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <svg
              aria-hidden
              viewBox="0 0 20 20"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path
                d="M12 15l-5-5 5-5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="hidden sm:inline">{t.viewer.backToCatalog}</span>
            <span className="sm:hidden">{t.viewer.backShort}</span>
          </Link>

          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Image
              src="/brand/logo.png"
              alt=""
              width={32}
              height={32}
              className="hidden h-8 w-8 shrink-0 rounded sm:block"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                {t.shell.brandTag}
              </p>
              <h1 className="truncate text-[0.98rem] font-medium leading-tight text-[var(--color-ink)] sm:text-[1.08rem]">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <a
              href={iframeSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-md bg-[var(--color-primary)] px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-[var(--color-primary-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
            >
              <svg
                aria-hidden
                viewBox="0 0 20 20"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path
                  d="M11 4h5v5M16 4l-8 8M10 5H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="hidden sm:inline">{t.viewer.openInNewTab}</span>
              <span className="sm:hidden">{t.viewer.openShort}</span>
            </a>
          </div>
        </div>

        {patient ? <PatientBar patient={patient} onEdit={() => setEditOpen(true)} /> : null}
      </header>

      <main className="flex-1 bg-white">
        {patientReady && hydrated ? (
          <iframe
            key={iframeSrc}
            src={iframeSrc}
            title={title}
            className="h-full w-full border-0"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[var(--color-bg)] text-sm text-[var(--color-muted)]">
            {t.viewer.patientUnknown}
          </div>
        )}
      </main>

      <PatientIntakeModal
        open={editOpen}
        reportTitle={title}
        initial={patient}
        onCancel={handleEditCancel}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}

function PatientBar({
  patient,
  onEdit,
}: {
  patient: PatientSession;
  onEdit: () => void;
}) {
  const t = useT();
  const genderShort = t.patientBar.genderShort[patient.gender];
  const ptLabel = t.intake.patientType[patient.patientType];

  return (
    <div className="border-t border-[var(--color-line)] bg-[var(--color-surface-raised)]/60">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2 text-xs sm:px-6">
        <span className="font-semibold text-[var(--color-ink)]">
          {patient.patientName} {patient.patientSurname}
        </span>
        <Meta label={t.intake.fields.gender} value={genderShort} />
        <Meta label={t.intake.fields.patientType} value={ptLabel} />
        <Meta label={t.intake.fields.modality} value={patient.modality} />
        <Meta
          label={t.intake.fields.assignedDoctor}
          value={patient.assignedDoctor}
        />
        <Meta
          label={t.intake.fields.approvingDoctor}
          value={patient.approvingDoctor}
        />
        <button
          type="button"
          onClick={onEdit}
          className="ml-auto inline-flex items-center gap-1 text-[var(--color-primary)] transition hover:underline"
        >
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              d="M10.5 2.5l3 3L5 14H2v-3l8.5-8.5z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t.viewer.changePatient}
        </button>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-[10px] uppercase tracking-wider text-[var(--color-muted-soft)]">
        {label}
      </span>
      <span className="text-[var(--color-ink-soft)]">{value}</span>
    </span>
  );
}
