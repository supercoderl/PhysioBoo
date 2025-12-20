export interface LabTest {
    id: string;
    patientName: string;
    patientId: string;
    testType: string;
    testDate: Date;
    status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
    priority: 'routine' | 'urgent' | 'stat';
    orderedBy: string;
    department: string;
    results?: string;
}