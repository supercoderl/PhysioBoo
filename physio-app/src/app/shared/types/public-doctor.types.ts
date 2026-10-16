/** Public website doctor contracts (`/api/public/doctors/*`). Public fields only. */

export interface PublicDoctor {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    specialty: string | null;
    facilities: string[];
    bio: string | null;
    isVerified: boolean;
    /** Only set for verified doctors. */
    yearsOfExperience: number | null;
    isAvailableOnline: boolean;
    isAvailableHomeVisit: boolean;
}

export interface PublicDoctorFilter {
    specialtyId?: string;
    hospitalId?: string;
    online?: boolean;
    homeVisit?: boolean;
}

export interface PublicOption {
    id: string;
    name: string;
}

export interface PublicDoctorFilterOptions {
    specialties: PublicOption[];
    facilities: PublicOption[];
}

export interface PublicFacility {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
}

export interface PublicDoctorDetail {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    specialty: string | null;
    isVerified: boolean;
    bio: string | null;
    about: string | null;
    researchInterests: string | null;
    /** Only set for verified doctors. */
    achievements: string | null;
    /** Only set for verified doctors. */
    yearsOfExperience: number | null;
    languages: string[];
    isAvailableOnline: boolean;
    isAvailableHomeVisit: boolean;
    services: string[];
    facilities: PublicFacility[];
}

/** Call-back request from an anonymous visitor; stored as a CRM lead, not a booking. */
export interface PublicAppointmentRequest {
    facilityId: string | null;
    service: string | null;
    fullName: string;
    phone: string;
    email: string | null;
    /** Honeypot; must stay empty. */
    website: string;
}

export interface PublicAppointmentRequestResult {
    reference: string;
}
