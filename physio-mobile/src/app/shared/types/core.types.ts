/** Ported (trimmed) from physio-app/src/app/shared/types/core.types.ts. */

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
    /** Present only when the logged-in user has a Patient profile (role = PATIENT). */
    patient?: { id: string } | null;
}
