import type { Dictionary } from "./types";

export const en: Dictionary = {
  shell: {
    brand: "Atlas",
    brandTag: "Radvisor · Atlas",
    languageSwitcherLabel: "Language",
  },
  catalog: {
    kicker: "Radvisor · Atlas",
    title: "Radiology decision-support reports, under one roof.",
    subtitle:
      "Pick a decision-support form prepared for MRI and cross-sectional imaging. After you open a report, fill in the patient details and complete the assessment.",
    searchPlaceholder: "Search reports...",
    reportBadge: "Report",
    openReport: "Open report",
    emptyTitle: "No matching report",
    emptyHint: "Try a different search term.",
    totalReports: (n: number) => `${n} reports`,
    filteredReports: (m: number, n: number) => `${m} / ${n} reports`,
  },
  viewer: {
    backToCatalog: "Back to Catalog",
    backShort: "Back",
    openInNewTab: "Open in New Tab",
    openShort: "Open",
    changePatient: "Change Patient",
    patientUnknown: "No patient",
  },
  intake: {
    title: "Patient Information",
    subtitle: (reportTitle: string) =>
      `Enter patient details for the ${reportTitle} report.`,
    fields: {
      patientName: "First Name",
      patientSurname: "Last Name",
      gender: "Gender",
      patientType: "Patient Type",
      modality: "Modality",
      assignedDoctor: "Assigned Doctor",
      approvingDoctor: "Approving Doctor",
    },
    placeholders: {
      modality: "e.g. MRI, CT, US",
      assignedDoctor: "Doctor preparing the report",
      approvingDoctor: "Doctor approving the report",
    },
    gender: {
      MALE: "Male",
      FEMALE: "Female",
      OTHER: "Other",
    },
    patientType: {
      POLICLINIC: "Outpatient",
      SERVICE: "Inpatient",
      EMERGENCY: "Emergency",
      INTENSIVE_CARE: "Intensive Care",
      CONSULTATION: "Consultation",
    },
    genderPlaceholder: "Select",
    patientTypePlaceholder: "Select",
    cancel: "Cancel",
    submit: "Open Report",
    reset: "Clear Fields",
    keepLastToggle: "Don't ask again for the same patient on next report",
    errors: {
      required: "This field is required",
      minChars: (n: number) => `At least ${n} characters`,
    },
  },
  patientBar: {
    unknown: "—",
    genderShort: {
      MALE: "M",
      FEMALE: "F",
      OTHER: "O",
    },
  },
  notFound: {
    kicker: "404 · Report",
    title: "The report you're looking for was not found.",
    body: "The link may have changed or the report may have been removed. Please return to the catalog and select again.",
    cta: "Back to Catalog",
  },
};
