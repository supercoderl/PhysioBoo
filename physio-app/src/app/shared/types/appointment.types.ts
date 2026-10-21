export interface Appointment {
  id: string;
  date: string;
  time: string;
  doctor: string;
  department: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  reason: string;
}

export type AppointmentStatus =
  | 'Scheduled'
  | 'Confirmed'
  | 'CheckedIn'
  | 'InProgress'
  | 'Completed'
  | 'Cancelled'
  | 'NoShow'
  | 'Rescheduled';

export interface AppointmentRecord {
  id: string;
  appointmentNumber: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientMRN: string;
  doctorId: string;
  doctorName: string;
  scheduledDate: string;
  scheduledTime: string;
  scheduledEndTime: string | null;
  status: AppointmentStatus;
  chiefComplaint: string | null;
  appointmentTypeName: string | null;
  durationMinutes: number | null;
}

export interface AppointmentFilter {
  start: string;
  end: string;
}

/** Body of POST /api/appointments (CreateAppointmentViewModel); omitted fields take the server defaults. */
export interface CreateAppointmentRequest {
  patientId: string;
  doctorId: string;
  hospitalId: string;
  departmentId: string;
  appointmentTypeId: string;
  /** YYYY-MM-DD */
  scheduledDate: string;
  /** HH:mm:ss */
  scheduledTime: string;
  scheduledEndTime: string | null;
  durationMinutes: number;
  chiefComplaint: string | null;
  reasonForVisit: string | null;
  preAppointmentNotes: string | null;
}

export interface CompleteConsultationRequest {
  diagnosis: string;
  treatmentPlan: string;
  followUpDate: string;
  doctorNotes: string;
}