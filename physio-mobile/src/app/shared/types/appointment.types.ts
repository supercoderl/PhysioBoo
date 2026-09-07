/** Ported from physio-app's appointment.types.ts. */

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
    start?: string;
    end?: string;
    patientId?: string | null;
    doctorId?: string | null;
    status?: AppointmentStatus | null;
}

export interface CreateAppointmentRequest {
    patientId: string;
    doctorId: string;
    appointmentTypeId?: string | null;
    scheduledDate: string;
    scheduledTime: string;
    chiefComplaint?: string | null;
}
