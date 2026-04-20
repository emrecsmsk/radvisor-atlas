import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ReportViewerShell } from "@/components/ReportViewerShell";
import { getReport } from "@/lib/reports";
import { resolveLocalized } from "@/lib/report-types";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/r/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const report = getReport(slug);
  if (!report) return { title: "Rapor bulunamadı" };
  return { title: resolveLocalized(report.titles, "tr") };
}

export default async function ReportPage(props: PageProps<"/r/[slug]">) {
  const { slug } = await props.params;
  const report = getReport(slug);
  if (!report) notFound();

  return <ReportViewerShell report={report} />;
}
