import { BloodGroup } from "../enums/blood-group";
import { Gender } from "../enums/gender";
import { MaritalStatus } from "../enums/marital-status";
import { PreferredCommunication } from "../enums/preferred-communication";
import { DoctorProfile } from "./medical-staff.types";
import { Patient, PatientProfile } from "./patient.types";
import { Role } from "./role.types";

export interface User {
    id: string;
    email: string;
    phone: string;
    alternatePhone?: string | null;
    isActive: boolean;
    isVerified: boolean;
    emailVerifiedAt?: Date | null;
    phoneVerifiedAt?: Date | null;
    lastLoginAt?: Date | null;
    failedLoginAttempts: number;
    accountLockedUntil?: Date | null;
    twoFactorEnabled: boolean;
    twoFactorSecret?: string | null;
    profilePicture?: string | null;
    preferredLanguage?: string | null;
    timeZone?: string | null;
    createdAt: Date;
    createdBy: string;
    updatedAt?: Date | null;
    updatedBy?: string | null;
    doctor?: Profile | null;
    patient?: Patient | null;
    profile?: Profile | null;
    roles?: Role[];
    /** Proposed backend addition: the hospital/tenant this user belongs to (cross-tenant view for superadmin). */
    hospital?: { id: string; name: string } | null;
}

export interface Profile {
    userId: string;
    firstName: string;
    lastName: string;
    middleName: string;
    fullName: string;
    dateOfBirth: Date;
    gender: Gender;
    bloodGroup: BloodGroup;
    maritalStatus: MaritalStatus;
    nationality?: string | null;
    identificationType?: string | null;
    identificationNumber?: string | null;
    identificationExpiry?: Date | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    emergencyContactRelationship?: string | null;
    preferredCommunication: PreferredCommunication;
}

export interface UserProfile {
    id: string;
    email: string;
    phone: string | null;
    isVerified: boolean;
    profilePicture: string | null;
    profile: Profile | null;
    doctor: DoctorProfile | null;
    patient: PatientProfile | null;
    roles: string[];
}

export interface UserProfileBase {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatarUrl?: string | null;
    fullName: string;
    isVerified: boolean;
}

export interface UserProfileSummary extends UserProfileBase {
    roles: string[];
    permissions: string[];
}

export interface PreferenceItem {
    key: string;
    value: string;
    group: string;
}