import { Doctor } from "./medical-staff";
import { Patient } from "./patient";
import { Profile } from "./profile";

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
  doctor?: Doctor | null;
  patient?: Patient | null;
  profile?: Profile | null;
}