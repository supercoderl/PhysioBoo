import { Prescription } from "./prescription.types";
import { Vitals } from "./vital.types";

export interface Visit {
  id: number;
  date: string;
  doctor: string;
  department: string;
  chiefComplaint: string;
  diagnosis: string[];
  prescriptions: Prescription[];
  vitals: Vitals;
  notes: string;
}