export interface ImagingModality {
    id: string;
    name: string;
    code: string | null;
    description: string | null;
    category: string | null;
    requiresContrast: boolean;
    preparationRequired: boolean;
    preparationInstructions: string | null;
    averageDurationMinutes: number;
    radiationDose: number;
    isActive: boolean;
    createdAt: Date;
}