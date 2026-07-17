export interface AppointmentType {
    id: string;
    name: string;
    code: string | null;
    description: string | null;
    defaultDuration: number;
    bufferTime: number;
    isEmergency: boolean;
    requiresPreparation: boolean;
    preparationInstructions: string | null;
    isFollowUp: boolean;
    consultationFee: number;
    colorCode: string | null;
    isActive: boolean;
    createdAt: Date;
}

export interface Department {
    id: string;
    hospitalId: string;
    name: string;
    departmentCode: string | null;
    description: string | null;
    headOfDepartment: string | null;
    floorNumber: number | null;
    wing: string | null;
    phone: string | null;
    email: string | null;
    budgetAllocated: string | null;
    bedCount: number;
    isEmergency: boolean;
    isCriticalCare: boolean;
    isOutPatient: boolean;
    isInPatient: boolean;
    operationHours: string | null;
    equipmentList: string | null;
    isActive: boolean;
}