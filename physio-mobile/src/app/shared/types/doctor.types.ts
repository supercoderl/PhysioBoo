/** Ported (trimmed to the fields the mobile Guest/Patient screens display) from physio-app's medical-staff.types.ts. */

export interface MedicalSpecialty {
    id: string;
    name: string;
    code?: string | null;
    category?: string | null;
    description?: string | null;
    iconUrl?: string | null;
}

export interface Doctor {
    id: string;
    fullName: string;
    avatar: string | null;
    bio: string | null;
    about: string | null;
    languagesSpoken: string[];
    isAvailableOnline: boolean;
    isAvailableHomeVisit: boolean;
    isFeature: boolean;
    isVerified: boolean;
    primarySpecialtyId: string | null;
    primarySpecialtyName?: string | null;
    yearsOfExperience: number;
    consultationFeeMin: number;
    consultationFeeMax?: number | null;
    hospitalId?: string | null;
    hospitalName?: string | null;
    departmentId?: string | null;
    departmentName?: string | null;
    ratingAverage?: number | null;
    ratingCount?: number | null;
}

export interface DoctorFilter {
    start?: string;
    end?: string;
    specialtyId?: string | null;
    hospitalId?: string | null;
    isAvailableOnline?: boolean | null;
}
