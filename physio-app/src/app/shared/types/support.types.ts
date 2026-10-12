import { HospitalType } from "../enums/hospital-type";
import { InsuranceType } from "../enums/insurance-type";
import { SubscriptionPlan } from "../enums/subscription-plan";
import { SupplierType } from "../enums/supplier-type";

export interface InsuranceCompany {
    id: string;
    name: string;
    code: string | null;
    type: InsuranceType;
    contactPerson: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    website: string | null;
    cashlessFacility: boolean;
    reimbursementFacility: boolean;
    networkHospitals: string | null;
    maximumCoverageAmount: number | null;
    claimSettlementRatio: number | null;
    averageClaimSettlementTime: number;
    requiredDocuments: string[];
    termAndConditions: string | null;
    isActive: boolean;
    createdAt: Date
}

export interface Manufacturer {
    id: string;
    name: string;
    companyCode: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postalCode: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    licenseNumber: string | null;
    gmpCertified: boolean;
    isoCertified: boolean;
    fdaApproved: boolean;
    establishedYear: number;
    isActive: boolean;
    createdAt: Date;
}

export interface Supplier {
    id: string;
    supplierName: string;
    supplierCode: string | null;
    type: SupplierType;
    contactPerson: string | null;
    phone: string | null;
    alternatePhone: string | null;
    email: string | null;
    website: string | null;
    address: string;
    city: string;
    stateProvince: string;
    postalCode: string | null;
    country: string;
    businessRegistrationNumber: string | null;
    taxIdentificationNumber: string | null;
    gstNumber: string | null;
    panNumber: string | null;
    drugLicenseNumber: string | null;
    drugLicenseExpiry: Date | null;
    fdaRegistrationNumber: string | null;
    isoCertification: string | null;
    gmpCertified: boolean;
    paymentTerms: string | null;
    creditLimit: number;
    currency: string;
    bankAccountDetails: string | null;
    leadTimeDays: number;
    minimumOrderValue: number;
    deliveryReliabilityScore: number;
    qualityRating: number;
    serviceRating: number;
    totalOrders: number;
    totalPurchaseValue: number;
    lastOrderDate: Date | null;
    createdAt: Date;
    updatedAt: Date | null;
}

export interface HospitalGroup {
    id: string;
    name: string;
    code: string | null;
    description: string | null;
    logoUrl: string | null;
    contactPerson: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    subscriptionPlan: SubscriptionPlan;
    hospitalCount: number;
    isActive: boolean;
    createdAt: Date;
}

/** Mirrors `HospitalViewModel` of `api/hospitals`; enums travel as numbers. */
export interface Hospital {
    id: string;
    name: string;
    hospitalCode: string | null;
    hospitalType: HospitalType;
    bedCapacity: number;
    icuCapacity: number;
    emergencyCapacity: number;
    operationTheaters: number;
    address: string;
    city: string;
    stateProvince: string;
    postalCode: string | null;
    country: string;
    phone: string | null;
    fax: string | null;
    email: string | null;
    website: string | null;
    emergencyPhone: string | null;
    ambulancePhone: string | null;
    latitude: number | null;
    longtitude: number | null;
    establishedDate: string | null;
    licenseNumber: string | null;
    licenseExpiry: string | null;
    accreditationBody: string;
    accreditationExpiry: string | null;
    insuranceAccepted: string[];
    languagesSupported: string[];
    facilities: string | null;
    operatingHours: string | null;
    is24Hours: boolean;
    isActive: boolean;
    logoUrl: string | null;
    images: string | null;
    description: string | null;
    missionStatement: string | null;
    visionStatement: string | null;
    createdAt: string;
}

/** Body of `PATCH api/hospitals/{id}` (`UpdateHospitalViewModel`); Create takes the same minus bed / ICU capacity, `is24Hours` and `isActive`. */
export type SaveHospitalRequest = Omit<Hospital, 'id' | 'hospitalCode' | 'createdAt'>;