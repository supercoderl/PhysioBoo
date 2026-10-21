/** Lower-cased appointment status as the snapshot API returns it (only these three are listed). */
export type DeskVisitStatus = 'checkedin' | 'inprogress' | 'completed';

export interface QueuePatient {
    id: string;
    patientId: string;
    appointmentId: string;
    queueNumber: string;
    name: string;
    age: number;
    gender: string;
    reason: string;
    appointmentTime: string;
    /** HH:mm the patient was checked in. */
    arrivalTime: string;
    status: DeskVisitStatus | string;
    priority: 'urgent' | 'normal' | string;
    allergies: string[];
    vitals?: QueuePatientVitals | null;
}

export interface QueuePatientVitals {
    bloodPressure: string | null;
    heartRate: number | null;
    temperature: number | null;
    spo2: number | null;
}

export interface DoctorDeskContext {
    doctorName: string;
    avatarUrl?: string | null;
    department: string;
    room: string;
}

export interface DoctorDeskSnapshot {
    context: DoctorDeskContext;
    patients: QueuePatient[];
}

export type StatTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
