export interface MedicalSpecialty {
    id: string;
    name: string;
    code?: string | null;
    category?: string | null;
    description?: string | null;
    requiredQualifications?: string | null;
    averageConsultationDuration: number;
    isSurgical: boolean;
    isDiagnostic: boolean;
    parentSpecialtyId?: string | null;
    iconUrl?: string | null;
    createdAt: Date;
}