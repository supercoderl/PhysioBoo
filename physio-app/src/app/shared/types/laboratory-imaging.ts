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

export interface LabTestCategory {
    id: string;
    name: string;
    code: string | null;
    description: string | null;
    department: string | null;
    isActive: boolean;
    createdAt: Date;
}

export interface LabTest {
    id: string;
    testName: string;
    testCode: string | null;
    categoryId: string;
    description: string | null;
    sampleType: string | null;
    sampleVolume: string | null;
    collectionInstructions: string | null;
    preparationRequired: boolean;
    preparationInstructions: string | null;
    fastingRequired: boolean;
    fastingHours: number;
    normalRangeMale: string | null;
    normalRangeFemale: string | null;
    normalPediatric: string | null;
    unitOfMeasurement: string | null;
    methodology: string | null;
    reportingTimeHours: number;
    cost: number;
    isProfile: boolean;
    isUrgentAvailable: boolean;
    urgentCost: number;
    urgentReportingTimeHours: number;
    isHomeCollectionAvailable: boolean;
    homeCollectionCharge: number;
    requiresAppoinment: boolean;
    isActive: boolean;
    createdAt: Date
}