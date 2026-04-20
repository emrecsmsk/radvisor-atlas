"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  PATIENT_STORAGE_KEY,
  type PatientSession,
  genders,
  patientTypes,
} from "./patient-types";

interface PatientContextValue {
  patient: PatientSession | null;
  setPatient: (p: PatientSession) => void;
  clearPatient: () => void;
  hydrated: boolean;
}

const PatientContext = createContext<PatientContextValue | null>(null);

function parse(raw: string | null): PatientSession | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Partial<PatientSession>;
    if (!p || typeof p !== "object") return null;
    if (typeof p.patientName !== "string" || !p.patientName.trim()) return null;
    if (typeof p.patientSurname !== "string" || !p.patientSurname.trim())
      return null;
    if (!p.gender || !genders.includes(p.gender)) return null;
    if (!p.patientType || !patientTypes.includes(p.patientType)) return null;
    return {
      patientName: p.patientName,
      patientSurname: p.patientSurname,
      gender: p.gender,
      patientType: p.patientType,
      modality: typeof p.modality === "string" ? p.modality : "",
      assignedDoctor:
        typeof p.assignedDoctor === "string" ? p.assignedDoctor : "",
      approvingDoctor:
        typeof p.approvingDoctor === "string" ? p.approvingDoctor : "",
    };
  } catch {
    return null;
  }
}

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const [patient, setPatientState] = useState<PatientSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(PATIENT_STORAGE_KEY);
      const parsed = parse(raw);
      if (parsed) setPatientState(parsed);
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  const setPatient = useCallback((p: PatientSession) => {
    setPatientState(p);
    try {
      window.sessionStorage.setItem(PATIENT_STORAGE_KEY, JSON.stringify(p));
    } catch {
      // ignore
    }
  }, []);

  const clearPatient = useCallback(() => {
    setPatientState(null);
    try {
      window.sessionStorage.removeItem(PATIENT_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo<PatientContextValue>(
    () => ({ patient, setPatient, clearPatient, hydrated }),
    [patient, setPatient, clearPatient, hydrated],
  );

  return (
    <PatientContext.Provider value={value}>{children}</PatientContext.Provider>
  );
}

export function usePatient(): PatientContextValue {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error("usePatient must be used within PatientProvider");
  return ctx;
}
