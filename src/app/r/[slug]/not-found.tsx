import Image from "next/image";
import Link from "next/link";

export default function ReportNotFound() {
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
        404 · Rapor
      </p>
      <h1 className="mt-4 text-[2rem] font-semibold leading-tight text-[var(--color-ink)]">
        Aradığınız rapor bulunamadı.
      </h1>
      <p className="mt-3 text-[var(--color-muted)]">
        Bağlantı değişmiş ya da rapor kaldırılmış olabilir. Lütfen
        kataloğa dönüp yeniden seçin.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-primary-hover)]"
      >
        Kataloğa Dön
      </Link>
    </div>
  );
}
