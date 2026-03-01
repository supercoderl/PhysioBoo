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