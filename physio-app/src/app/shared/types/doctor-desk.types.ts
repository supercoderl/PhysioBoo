export type QueuePatientStatus = 'waiting' | 'in-consultation' | 'completed';
export type QueuePriority = 'normal' | 'urgent';

export interface VitalSigns {
    bloodPressure?: string | null;
    heartRate?: number | null;
    temperature?: number | null;
    spo2?: number | null;
}

export interface QueuePatient {
    id: string;
    queueNumber: string;
    name: string;
    age: number;
    gender: string;
    reason: string;
    appointmentTime: string;
    arrivalTime: string;
    status: QueuePatientStatus;
    priority: QueuePriority;
    allergies: string[];
    vitals?: VitalSigns | null;
    consultationStartedAt?: string | null;
}

export interface DoctorDeskContext {
    doctorName: string;
    avatarUrl?: string | null;
    department: string;
    room: string;
    shift: string;
    isOnline: boolean;
}

export interface DoctorDeskSnapshot {
    context: DoctorDeskContext;
    patients: QueuePatient[];
}

export interface StatDef {
    label: string;
    icon: string;
    tone: StatTone;
    value: () => number;
}

export type StatTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';