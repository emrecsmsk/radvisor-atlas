import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { locales, type Locale } from "@/i18n/config";
import type { LocalizedString, Report } from "./report-types";

export type { LocalizedString, Report } from "./report-types";
export { formatBytes, resolveLocalized } from "./report-types";

const REPORTS_ROOT = path.join(process.cwd(), "public", "reports");
const REPORT_FILE = "report.html";
const META_FILE = "meta.json";

interface RawMeta {
  title?: unknown;
  description?: unknown;
  requiresPatient?: unknown;
}

/**
 * Accepts either a plain string (treated as the Turkish value) or a
 * `{ tr?, en?, ... }` object. Returns a LocalizedString.
 */
function coerceLocalizedString(value: unknown): LocalizedString {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? { tr: trimmed } : {};
  }
  if (value && typeof value === "object") {
    const out: LocalizedString = {};
    for (const l of locales) {
      const v = (value as Record<string, unknown>)[l];
      if (typeof v === "string" && v.trim()) {
        out[l as Locale] = v.trim();
      }
    }
    return out;
  }
  return {};
}

function readMeta(slugDir: string): {
  titles: LocalizedString;
  descriptions: LocalizedString;
  requiresPatient: boolean;
} | null {
  const metaPath = path.join(slugDir, META_FILE);
  if (!fs.existsSync(metaPath)) return null;
  try {
    const raw = fs.readFileSync(metaPath, "utf8");
    const parsed = JSON.parse(raw) as RawMeta;

    const titles = coerceLocalizedString(parsed.title);
    if (Object.keys(titles).length === 0) return null;

    const descriptions = coerceLocalizedString(parsed.description);
    const requiresPatient = parsed.requiresPatient !== false; // default true
    return { titles, descriptions, requiresPatient };
  } catch {
    return null;
  }
}

function readReports(): Report[] {
  if (!fs.existsSync(REPORTS_ROOT)) return [];

  const entries = fs.readdirSync(REPORTS_ROOT, { withFileTypes: true });
  const reports: Report[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const slugDir = path.join(REPORTS_ROOT, slug);
    const htmlPath = path.join(slugDir, REPORT_FILE);
    if (!fs.existsSync(htmlPath)) continue;

    const meta = readMeta(slugDir);
    if (!meta) continue;

    const stat = fs.statSync(htmlPath);
    reports.push({
      slug,
      titles: meta.titles,
      descriptions: meta.descriptions,
      href: `/reports/${encodeURIComponent(slug)}/${REPORT_FILE}`,
      bytes: stat.size,
      requiresPatient: meta.requiresPatient,
    });
  }

  return reports;
}

export const getReports = cache((): Report[] => {
  const reports = readReports();
  return reports.sort((a, b) => {
    const at = a.titles.tr || a.titles.en || "";
    const bt = b.titles.tr || b.titles.en || "";
    return at.localeCompare(bt, "tr", { sensitivity: "base" });
  });
});

export const getReport = cache((slug: string): Report | null => {
  return getReports().find((r) => r.slug === slug) ?? null;
});
