export type FilterType = 'select' | 'range-number' | 'boolean' | 'color';

export interface FilterOption {
    label: string;
    value: any;
    colorCode?: string;
}

export interface FilterConfig {
    key: string;
    label: string;
    type: FilterType;
    trueLabel?: string;
    falseLabel?: string;
    options?: FilterOption[];
    min?: number;
    max?: number;
    step?: number;
    value?: any;
}

export interface MedicalSpecialtyFilter {
    start: string,
    end: string,
    isSurgical?: boolean
}

export interface AppointmentTypeFilter {
    start: string,
    end: string,
    isEmergency: boolean | null,
    requiresPreparation: boolean | null,
    isFollowUp: boolean | null,
    isActive: boolean | null
}

export interface ImagingModalityFilter {
    start: string,
    end: string,
    requiresContrast: boolean | null,
    preparationRequired: boolean | null,
    isActive: boolean | null
}

export interface InsuranceCompanyFilter {
    start: string,
    end: string,
}

export interface ManufacturerFilter {
    start: string,
    end: string,
}

export interface MedicineCategoryFilter {
    start: string,
    end: string,
}

export interface SupplierFilter {
    start: string,
    end: string,
}

export interface LabTestCategoryFilter {
    start: string,
    end: string,
}

export interface LabTestFilter {
    start: string,
    end: string,
}

export interface SequenceTrackerFilter {
    start: string,
    end: string,
}

export interface DoctorFilter {
    start: string,
    end: string,
}

export interface PatientFilter {
    start: string,
    end: string,
    patientType: number | null,
    riskLevel: number | null,
    isVip: boolean | null,
    isChronicPatient: boolean | null,
}

export interface HospitalGroupFilter {
    start: string,
    end: string,
    isActive: boolean | null,
    subscriptionPlan: number | null,
}

export interface HospitalFilter {
    start: string,
    end: string,
    hospitalGroupId: string | null,
    type: number | null,
    isActive: boolean | null,
    hasEmergencyServices: boolean | null,
}

export interface DepartmentFilter {
    start: string,
    end: string
}

export interface UserFilter {
    isActive: boolean | null
}

export interface RoleFilter {
    start: string,
    end: string,
    isActive: boolean | null,
    isSystemRole: boolean | null,
}

export interface PermissionFilter {
    start: string,
    end: string,
    category: string | null,
    isActive: boolean | null,
}