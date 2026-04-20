"use client";

import Image from "next/image";
import Link from "next/link";
import { useT } from "@/i18n/I18nProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { PatientBadge } from "./PatientBadge";
import { ReportCatalog } from "./ReportCatalog";
import type { Report } from "@/lib/report-types";

interface Props {
  reports: Report[];
}

export function HomeShell({ reports }: Props) {
  const t = useT();

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-[var(--color-line)] bg-[var(--color-surface)]/90 backdrop-blur">
        <div className="mx-auto flex h-[var(--shell-topbar-h)] w-full max-w-7xl items-center justify-between gap-4 px-6 sm:px-10">
          <Link
            href="/"
            aria-label={t.shell.brandTag}
            className="flex items-center gap-3 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--color-bg)]"
          >
            <Image
              src="/brand/logo-expanded.png"
              alt="Radvisor"
              width={180}
              height={54}
              priority
              className="h-9 w-auto"
            />
            <span className="hidden h-6 w-px bg-[var(--color-line-strong)] sm:inline-block" />
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--color-muted)] sm:inline">
              {t.shell.brand}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <PatientBadge />
            <LanguageSwitcher />
            <span className="hidden text-xs tabular-nums text-[var(--color-muted)] sm:inline">
              {t.catalog.totalReports(reports.length)}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-col px-6 pb-24 pt-12 sm:px-10">
        <section className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]">
            {t.catalog.kicker}
          </p>
          <h1 className="mt-5 text-[2.35rem] font-semibold leading-[1.12] tracking-tight text-[var(--color-ink)] sm:text-[2.8rem]">
            {t.catalog.title}
          </h1>
          <p className="mt-5 max-w-xl text-[0.98rem] leading-relaxed text-[var(--color-muted)]">
            {t.catalog.subtitle}
          </p>
        </section>

        <ReportCatalog reports={reports} />
      </div>
    </div>
  );
}
