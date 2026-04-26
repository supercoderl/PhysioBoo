import { BloodGroup } from "../enums/blood-group";
import { Gender } from "../enums/gender";
import { MaritalStatus } from "../enums/marital-status";
import { PreferredCommunication } from "../enums/preferred-communication";
import { DoctorProfile } from "./medical-staff";
import { Patient, PatientProfile } from "./patient";
import { Role } from "./role";

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