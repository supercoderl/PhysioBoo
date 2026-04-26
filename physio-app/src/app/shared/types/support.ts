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

export interface Hospital {
    id: string;
    name: string;
    code: string | null;
    hospitalGroupId: string;
    hospitalGroupName: string | null;
    type: HospitalType;
    address: string | null;
    city: string | null;
    country: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    totalBeds: number;
    operatingRooms: number;
    hasEmergencyServices: boolean;
    hasIcu: boolean;
    accreditationNumber: string | null;
    licenseNumber: string | null;
    isActive: boolean;
    createdAt: Date;
}