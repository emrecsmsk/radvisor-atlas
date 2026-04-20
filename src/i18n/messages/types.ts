import type { Gender, PatientType } from "@/state/patient-types";

export interface Dictionary {
  shell: {
    brand: string;
    brandTag: string;
    languageSwitcherLabel: string;
  };
  catalog: {
    kicker: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    reportBadge: string;
    openReport: string;
    emptyTitle: string;
    emptyHint: string;
    totalReports: (n: number) => string;
    filteredReports: (m: number, n: number) => string;
  };
  viewer: {
    backToCatalog: string;
    backShort: string;
    openInNewTab: string;
    openShort: string;
    changePatient: string;
    patientUnknown: string;
  };
  intake: {
    title: string;
    subtitle: (reportTitle: string) => string;
    fields: {
      patientName: string;
      patientSurname: string;
      gender: string;
      patientType: string;
      modality: string;
      assignedDoctor: string;
      approvingDoctor: string;
    };
    placeholders: {
      modality: string;
      assignedDoctor: string;
      approvingDoctor: string;
    };
    gender: Record<Gender, string>;
    patientType: Record<PatientType, string>;
    genderPlaceholder: string;
    patientTypePlaceholder: string;
    cancel: string;
    submit: string;
    reset: string;
    keepLastToggle: string;
    errors: {
      required: string;
      minChars: (n: number) => string;
    };
  };
  patientBar: {
    unknown: string;
    genderShort: Record<Gender, string>;
  };
  notFound: {
    kicker: string;
    title: string;
    body: string;
    cta: string;
  };
}
