import Image from "next/image";
import Link from "next/link";
import { ReportCatalog } from "@/components/ReportCatalog";
import { getReports } from "@/lib/reports";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const reports = getReports();

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-[var(--color-line)] bg-[var(--color-surface)]/90 backdrop-blur">
        <div className="mx-auto flex h-[var(--shell-topbar-h)] w-full max-w-7xl items-center justify-between gap-4 px-6 sm:px-10">
          <Link
            href="/"
            aria-label="Radvisor Atlas"
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
              Atlas
            </span>
          </Link>
          <span className="hidden text-xs tabular-nums text-[var(--color-muted)] sm:inline">
            {reports.length} rapor
          </span>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-col px-6 pb-24 pt-12 sm:px-10">
        <section className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]">
            Radvisor · Atlas
          </p>
          <h1 className="mt-5 text-[2.35rem] font-semibold leading-[1.12] tracking-tight text-[var(--color-ink)] sm:text-[2.8rem]">
            Radyoloji karar destek raporları, tek bir çatı altında.
          </h1>
          <p className="mt-5 max-w-xl text-[0.98rem] leading-relaxed text-[var(--color-muted)]">
            MR ve kesitsel görüntüleme için hazırlanmış karar destek
            formlarını buradan seçin. Raporu açtığınızda ilgili forma geçer,
            hastaya özel değerlendirmeyi tamamlayabilirsiniz.
          </p>
        </section>

        <ReportCatalog reports={reports} />
      </div>
    </div>
  );
}
