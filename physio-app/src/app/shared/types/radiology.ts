export interface RadiologyExam {
    id: string;
    patientName: string;
    patientId: string;
    examType: string;
    modality: 'X-Ray' | 'CT' | 'MRI' | 'Ultrasound' | 'Mammography' | 'PET';
    examDate: Date;
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'reported';
    priority: 'routine' | 'urgent' | 'stat';
    referringPhysician: string;
    bodyPart: string;
    technician?: string;
    radiologist?: string;
    report?: string;
}