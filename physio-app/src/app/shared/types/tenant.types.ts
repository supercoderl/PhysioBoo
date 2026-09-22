import { HospitalType } from "../enums/hospital-type";

export interface RegisterTenantCompany {
  name: string;
  description?: string | null;
  headquartersAddress?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  establishedDate?: string | null;
  licenseNumber?: string | null;
  accreditationDetails?: string | null;
}

export interface RegisterTenantBranch {
  name: string;
  hospitalType: HospitalType;
  emergencyCapacity: number;
  operationTheaters: number;
  address: string;
  city: string;
  stateProvince: string;
  postalCode?: string | null;
  country: string;
  phone?: string | null;
  fax?: string | null;
  email?: string | null;
  website?: string | null;
  emergencyPhone?: string | null;
  ambulancePhone?: string | null;
  latitude?: number | null;
  longtitude?: number | null;
  establishedDate?: string | null;
  licenseNumber?: string | null;
  licenseExpiry?: string | null;
  // Not surfaced in the wizard UI on purpose (registration shouldn't demand accreditation
  // paperwork) — always sent as empty string/arrays to satisfy the backend's non-nullable
  // constructor args without exposing the fields, since server-side validation intentionally
  // does not require them for this flow. See docs/tenant-onboarding-redesign.md.
  accreditationBody: string;
  accreditationExpiry?: string | null;
  insuranceAccepted: string[];
  languagesSupported: string[];
  facilities?: string | null;
  operatingHours?: string | null;
  logoUrl?: string | null;
  images?: string | null;
  description?: string | null;
  missionStatement?: string | null;
  visionStatement?: string | null;
}

export interface RegisterTenantOwner {
  email: string;
  phone: string;
  password: string;
}

export interface RegisterTenantRequest {
  company: RegisterTenantCompany;
  branches: RegisterTenantBranch[];
  owner: RegisterTenantOwner;
}
