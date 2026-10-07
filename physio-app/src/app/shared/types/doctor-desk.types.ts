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
    arrivalTime: string;
    status: string;
    priority: string;
    allergies: string[];
    vitals?: QueuePatientVitals | null;
    consultationStartedAt?: string;
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