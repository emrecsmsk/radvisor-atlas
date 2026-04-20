"use client";

import { useT } from "@/i18n/I18nProvider";
import { usePatient } from "@/state/PatientProvider";

interface Props {
  onClear?: () => void;
}

export function PatientBadge({ onClear }: Props) {
  const t = useT();
  const { patient, clearPatient, hydrated } = usePatient();

  if (!hydrated || !patient) return null;

  const initial = patient.patientSurname.charAt(0).toUpperCase();
  const display = `${patient.patientName} ${initial}.`;

  const handleClear = () => {
    clearPatient();
    onClear?.();
  };

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-input)] px-3 py-1 text-xs">
      <span
        aria-hidden
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-bold text-white"
      >
        {patient.patientName.charAt(0).toUpperCase()}
      </span>
      <span className="font-medium text-[var(--color-ink)]">{display}</span>
      <span className="text-[var(--color-muted-soft)]">·</span>
      <span className="text-[var(--color-muted)]">
        {t.intake.gender[patient.gender]}
      </span>
      <button
        type="button"
        onClick={handleClear}
        aria-label={t.viewer.changePatient}
        title={t.viewer.changePatient}
        className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-[var(--color-muted)] transition hover:bg-[var(--color-line)] hover:text-[var(--color-ink)]"
      >
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path
            d="M3 3l6 6M9 3l-6 6"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
