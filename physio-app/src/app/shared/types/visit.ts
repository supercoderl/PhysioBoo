import { Prescription } from "./prescription";
import { Vitals } from "./vital";

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