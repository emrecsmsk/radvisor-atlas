import fs from 'node:fs'
import path from 'node:path'
import { cache } from 'react'
import type { Report } from './report-types'

export type { Report } from './report-types'
export { formatBytes } from './report-types'

const REPORTS_ROOT = path.join(process.cwd(), 'public', 'reports')
const REPORT_FILE = 'report.html'
const META_FILE = 'meta.json'

interface MetaShape {
  title?: unknown
  description?: unknown
}

function readMeta(slugDir: string): { title: string; description: string } | null {
  const metaPath = path.join(slugDir, META_FILE)
  if (!fs.existsSync(metaPath)) return null
  try {
    const raw = fs.readFileSync(metaPath, 'utf8')
    const parsed = JSON.parse(raw) as MetaShape
    const title = typeof parsed.title === 'string' ? parsed.title.trim() : ''
    const description =
      typeof parsed.description === 'string' ? parsed.description.trim() : ''
    if (!title) return null
    return { title, description }
  } catch {
    return null
  }
}

function readReports(): Report[] {
  if (!fs.existsSync(REPORTS_ROOT)) return []

  const entries = fs.readdirSync(REPORTS_ROOT, { withFileTypes: true })
  const reports: Report[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const slug = entry.name
    const slugDir = path.join(REPORTS_ROOT, slug)
    const htmlPath = path.join(slugDir, REPORT_FILE)
    if (!fs.existsSync(htmlPath)) continue

    const meta = readMeta(slugDir)
    if (!meta) continue

    const stat = fs.statSync(htmlPath)
    reports.push({
      slug,
      title: meta.title,
      description: meta.description,
      href: `/reports/${encodeURIComponent(slug)}/${REPORT_FILE}`,
      bytes: stat.size,
    })
  }

  return reports
}

export const getReports = cache((): Report[] => {
  const collator = new Intl.Collator('tr', { sensitivity: 'base' })
  return readReports().sort((a, b) => collator.compare(a.title, b.title))
})

export const getReport = cache((slug: string): Report | null => {
  return getReports().find((r) => r.slug === slug) ?? null
})
