export type Gender = "MALE" | "FEMALE" | "OTHER";
export const genders: Gender[] = ["MALE", "FEMALE", "OTHER"];

export type PatientType =
  | "POLICLINIC"
  | "SERVICE"
  | "EMERGENCY"
  | "INTENSIVE_CARE"
  | "CONSULTATION";
export const patientTypes: PatientType[] = [
  "POLICLINIC",
  "SERVICE",
  "EMERGENCY",
  "INTENSIVE_CARE",
  "CONSULTATION",
];

export interface PatientSession {
  patientName: string;
  patientSurname: string;
  gender: Gender;
  patientType: PatientType;
  modality: string;
  assignedDoctor: string;
  approvingDoctor: string;
}

export const PATIENT_STORAGE_KEY = "radvisor-atlas-patient";
