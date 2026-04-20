"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/i18n/I18nProvider";
import {
  genders,
  patientTypes,
  type Gender,
  type PatientSession,
  type PatientType,
} from "@/state/patient-types";

interface Props {
  open: boolean;
  reportTitle: string;
  initial?: PatientSession | null;
  onCancel: () => void;
  onSubmit: (patient: PatientSession) => void;
}

type Draft = Partial<PatientSession>;
type Errors = Partial<Record<keyof PatientSession, string>>;

const EMPTY_DRAFT: Draft = {
  patientName: "",
  patientSurname: "",
  gender: undefined,
  patientType: undefined,
  modality: "",
  assignedDoctor: "",
  approvingDoctor: "",
};

export function PatientIntakeModal({
  open,
  reportTitle,
  initial,
  onCancel,
  onSubmit,
}: Props) {
  const t = useT();
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<Errors>({});
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Reset / prefill when modal opens
  useEffect(() => {
    if (!open) return;
    setDraft(initial ? { ...initial } : { ...EMPTY_DRAFT });
    setErrors({});
    const handle = setTimeout(() => firstFieldRef.current?.focus(), 10);
    return () => clearTimeout(handle);
  }, [open, initial]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    if (errors[key]) {
      setErrors((e) => ({ ...e, [key]: undefined }));
    }
  };

  const validate = (d: Draft): Errors => {
    const errs: Errors = {};
    const requireMin3 = (k: keyof PatientSession, v: string | undefined) => {
      if (!v || !v.trim()) errs[k] = t.intake.errors.required;
      else if (v.trim().length < 3) errs[k] = t.intake.errors.minChars(3);
    };
    requireMin3("patientName", d.patientName);
    requireMin3("patientSurname", d.patientSurname);
    if (!d.gender) errs.gender = t.intake.errors.required;
    if (!d.patientType) errs.patientType = t.intake.errors.required;
    if (!d.modality || !d.modality.trim())
      errs.modality = t.intake.errors.required;
    if (!d.assignedDoctor || !d.assignedDoctor.trim())
      errs.assignedDoctor = t.intake.errors.required;
    if (!d.approvingDoctor || !d.approvingDoctor.trim())
      errs.approvingDoctor = t.intake.errors.required;
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(draft);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSubmit({
      patientName: draft.patientName!.trim(),
      patientSurname: draft.patientSurname!.trim(),
      gender: draft.gender!,
      patientType: draft.patientType!,
      modality: draft.modality!.trim(),
      assignedDoctor: draft.assignedDoctor!.trim(),
      approvingDoctor: draft.approvingDoctor!.trim(),
    });
  };

  const handleReset = () => {
    setDraft({ ...EMPTY_DRAFT });
    setErrors({});
    firstFieldRef.current?.focus();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="intake-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-2xl rounded-xl border border-[var(--color-line-strong)] bg-[var(--color-surface)] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-[var(--color-line)] px-6 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]">
            {t.shell.brandTag}
          </p>
          <h2
            id="intake-title"
            className="mt-2 text-[1.35rem] font-semibold text-[var(--color-ink)]"
          >
            {t.intake.title}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {t.intake.subtitle(reportTitle)}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
            <FormField
              label={t.intake.fields.patientName}
              error={errors.patientName}
            >
              <input
                ref={firstFieldRef}
                type="text"
                value={draft.patientName ?? ""}
                onChange={(e) => update("patientName", e.target.value)}
                className={fieldInput(!!errors.patientName)}
                autoComplete="off"
              />
            </FormField>

            <FormField
              label={t.intake.fields.patientSurname}
              error={errors.patientSurname}
            >
              <input
                type="text"
                value={draft.patientSurname ?? ""}
                onChange={(e) => update("patientSurname", e.target.value)}
                className={fieldInput(!!errors.patientSurname)}
                autoComplete="off"
              />
            </FormField>

            <FormField label={t.intake.fields.gender} error={errors.gender}>
              <select
                value={draft.gender ?? ""}
                onChange={(e) =>
                  update("gender", (e.target.value || undefined) as Gender)
                }
                className={fieldInput(!!errors.gender)}
              >
                <option value="">{t.intake.genderPlaceholder}</option>
                {genders.map((g) => (
                  <option key={g} value={g}>
                    {t.intake.gender[g]}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label={t.intake.fields.patientType}
              error={errors.patientType}
            >
              <select
                value={draft.patientType ?? ""}
                onChange={(e) =>
                  update(
                    "patientType",
                    (e.target.value || undefined) as PatientType,
                  )
                }
                className={fieldInput(!!errors.patientType)}
              >
                <option value="">{t.intake.patientTypePlaceholder}</option>
                {patientTypes.map((p) => (
                  <option key={p} value={p}>
                    {t.intake.patientType[p]}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label={t.intake.fields.modality}
              error={errors.modality}
            >
              <input
                type="text"
                placeholder={t.intake.placeholders.modality}
                value={draft.modality ?? ""}
                onChange={(e) => update("modality", e.target.value)}
                className={fieldInput(!!errors.modality)}
                autoComplete="off"
              />
            </FormField>

            <FormField
              label={t.intake.fields.assignedDoctor}
              error={errors.assignedDoctor}
            >
              <input
                type="text"
                placeholder={t.intake.placeholders.assignedDoctor}
                value={draft.assignedDoctor ?? ""}
                onChange={(e) => update("assignedDoctor", e.target.value)}
                className={fieldInput(!!errors.assignedDoctor)}
                autoComplete="off"
              />
            </FormField>

            <FormField
              label={t.intake.fields.approvingDoctor}
              error={errors.approvingDoctor}
              className="sm:col-span-2"
            >
              <input
                type="text"
                placeholder={t.intake.placeholders.approvingDoctor}
                value={draft.approvingDoctor ?? ""}
                onChange={(e) => update("approvingDoctor", e.target.value)}
                className={fieldInput(!!errors.approvingDoctor)}
                autoComplete="off"
              />
            </FormField>
          </div>

          <div className="flex flex-col-reverse items-stretch gap-2 border-t border-[var(--color-line)] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-ink)]"
            >
              {t.intake.reset}
            </button>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-md border border-[var(--color-line-strong)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--color-ink-soft)] transition hover:text-[var(--color-ink)]"
              >
                {t.intake.cancel}
              </button>
              <button
                type="submit"
                className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
              >
                {t.intake.submit}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  error,
  className = "",
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-[11px] font-medium text-[#ff6d6d]">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function fieldInput(hasError: boolean) {
  return [
    "w-full rounded-md border bg-[var(--color-input)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-muted-soft)]",
    hasError
      ? "border-[#ff6d6d]/60 focus:border-[#ff6d6d] focus:ring-2 focus:ring-[color-mix(in_oklab,#ff6d6d_30%,transparent)]"
      : "border-[var(--color-line)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_oklab,var(--color-primary)_30%,transparent)]",
  ].join(" ");
}
