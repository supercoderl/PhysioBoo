export type ServiceStatus       = 'Active' | 'Draft' | 'Inactive' | 'Archived';
export type ServiceAvailability = 'Available' | 'Limited' | 'Unavailable';

/**
 * Medical service catalogue entry — the unit hospital admins manage,
 * patients book, and finance bills against.
 *
 * Lifecycle (`status`) and operational state (`availability`) are
 * orthogonal: a service can be Active + Limited (live but booked out),
 * or Draft + Available (operationally ready but not yet published).
 */
export interface MedicalService {
  id: string;
  code: string;                 // e.g. ECG-001
  name: string;
  shortName?: string | null;
  description?: string | null;
  coverImage?: string | null;

  // Classification
  departmentIds: string[];
  primaryDepartmentName?: string | null;   // denormalized for list view
  categoryId?: string | null;
  tags?: string[];

  // Lifecycle
  status: ServiceStatus;
  availability: ServiceAvailability;

  // Pricing
  basePrice: number;
  currency: string;                        // 'VND' | 'USD'
  vatIncluded: boolean;

  // Operational
  durationMinutes: number;
  requiresAppointment: boolean;
  requiresReferral: boolean;

  // Assignments
  primaryDoctorId?: string | null;
  primaryDoctorName?: string | null;       // denormalized
  doctorIds: string[];
  doctorCount?: number;                    // denormalized count
  hospitalId?: string | null;

  // Audit
  createdAt: string;
  createdBy?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
  archivedAt?: string | null;

  // Read-only stats from server
  popularity?: {
    totalAppointments: number;
    totalRevenue: number;
    lastBookedAt?: string | null;
  };
}

export interface ServiceStats {
  totalServices: number;
  activeServices: number;
  averagePrice: number;
  averagePriceCurrency: string;
  mostUsedDepartment: { id: string; name: string; serviceCount: number } | null;
}

export interface CreateServiceRequest {
  code: string;
  name: string;
  shortName?: string | null;
  description?: string | null;
  departmentIds: string[];
  categoryId?: string | null;
  tags?: string[];
  status: ServiceStatus;
  availability: ServiceAvailability;
  basePrice: number;
  currency: string;
  vatIncluded: boolean;
  durationMinutes: number;
  requiresAppointment: boolean;
  requiresReferral: boolean;
  primaryDoctorId?: string | null;
  doctorIds: string[];
  hospitalId?: string | null;
}

export type UpdateServiceRequest = Partial<CreateServiceRequest>;

/** Legacy alias — kept so old dummy data can still compile during transition. */
export type Service = MedicalService;
