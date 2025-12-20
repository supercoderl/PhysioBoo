export interface Surgery {
    id: string;
    patientName: string;
    patientId: string;
    surgeryType: string;
    category: 'General' | 'Orthopedic' | 'Cardiac' | 'Neurosurgery' | 'Plastic' | 'ENT' | 'Ophthalmic' | 'Vascular';
    scheduledDate: Date;
    duration: number;
    status: 'scheduled' | 'pre-op' | 'in-progress' | 'post-op' | 'completed' | 'cancelled';
    priority: 'elective' | 'urgent' | 'emergency';
    surgeon: string;
    anesthesiologist?: string;
    operatingRoom: string;
    notes?: string;
    estimatedCost?: number;
}