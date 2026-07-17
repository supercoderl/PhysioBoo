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

export interface ServiceFilter {
    start?: string;
    end?: string;
    departmentIds?: string[];
    doctorIds?: string[];
    status?: ('Active' | 'Draft' | 'Inactive' | 'Archived')[];
    availability?: ('Available' | 'Limited' | 'Unavailable')[];
    priceMin?: number | null;
    priceMax?: number | null;
    durationMin?: number | null;
    durationMax?: number | null;
    hospitalId?: string | null;
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

export interface ArticleFilter {
    start: string,
    end: string,
    category: number | null,
    status: number | null,
}

export interface UserFilter {
    isActive: boolean | null
}

export interface BannerFilter {
    active: boolean | null
}

export interface FeatureFilter {
    active: boolean | null
}

export interface TestimonialFilter {
    active: boolean | null
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

export interface BedFilter {
    wardId?: string | null;
    status?: string | null;
    floor?: number | null;
    search?: string | null;
}

export interface CampaignFilter {
    start: string,
    end: string,
    type: number | null,
    status: number | null,
}

export interface LeadFilter {
    start: string | null;
    end: string | null;
    status: number | null;
    priority: number | null;
}

export interface ComplaintFilter {
    start: string | null;
    end: string | null;
    status: number | null;
    priority: number | null;
    category: number | null;
}

export type RevenueGranularity = 'day' | 'week' | 'month';

export interface RevenueReportFilter {
    start: string;
    end: string;
    granularity: RevenueGranularity;
    departmentIds?: string[];
    doctorIds?: string[];
    paymentMethods?: string[];
    insuranceProviderIds?: string[];
    search?: string | null;
}