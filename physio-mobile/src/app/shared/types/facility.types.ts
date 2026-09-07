/** Ported (trimmed) from physio-app's support.types.ts / operation.types.ts. */

export interface Hospital {
    id: string;
    name: string;
    code: string | null;
    hospitalGroupId: string;
    hospitalGroupName: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    hasEmergencyServices: boolean;
    hasIcu: boolean;
    isActive: boolean;
    logoUrl?: string | null;
}

export interface HospitalFilter {
    start?: string;
    end?: string;
    hospitalGroupId?: string | null;
    isActive?: boolean | null;
    hasEmergencyServices?: boolean | null;
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
    isEmergency: boolean;
    isCriticalCare: boolean;
    isOutPatient: boolean;
}

export interface DepartmentFilter {
    start?: string;
    end?: string;
    hospitalId?: string | null;
}
