import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getReport } from "@/lib/reports";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/r/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const report = getReport(slug);
  if (!report) return { title: "Rapor bulunamadı" };
  return { title: report.title };
}

export default async function ReportPage(props: PageProps<"/r/[slug]">) {
  const { slug } = await props.params;
  const report = getReport(slug);
  if (!report) notFound();

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[var(--color-bg)]">
      <header className="flex-none border-b border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="mx-auto flex h-[var(--shell-topbar-h)] w-full max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link
            href="/"
            aria-label="Kataloğa Dön"
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
            <span className="hidden sm:inline">Kataloğa Dön</span>
            <span className="sm:hidden">Geri</span>
          </Link>

          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Image
              src="/brand/logo.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Radvisor · Atlas
              </p>
              <h1 className="truncate text-[0.98rem] font-medium leading-tight text-[var(--color-ink)] sm:text-[1.08rem]">
                {report.title}
              </h1>
            </div>
          </div>

          <a
            href={report.href}
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
            <span className="hidden sm:inline">Yeni Sekmede Aç</span>
            <span className="sm:hidden">Aç</span>
          </a>
        </div>
      </header>

      <main className="flex-1 bg-white">
        <iframe
          src={report.href}
          title={report.title}
          className="h-full w-full border-0"
        />
      </main>
    </div>
  );
}
