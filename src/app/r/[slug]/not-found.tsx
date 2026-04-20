"use client";

import Image from "next/image";
import Link from "next/link";
import { useT } from "@/i18n/I18nProvider";

export default function ReportNotFound() {
  const t = useT();
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-6 py-24 text-center">
      <Image
        src="/brand/logo.png"
        alt=""
        width={48}
        height={48}
        className="h-12 w-12 rounded"
      />
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]">
        {t.notFound.kicker}
      </p>
      <h1 className="mt-4 text-[2rem] font-semibold leading-tight text-[var(--color-ink)]">
        {t.notFound.title}
      </h1>
      <p className="mt-3 text-[var(--color-muted)]">{t.notFound.body}</p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-primary-hover)]"
      >
        {t.notFound.cta}
      </Link>
    </div>
  );
}
