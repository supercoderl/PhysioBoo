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