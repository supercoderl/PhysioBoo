/** Ported verbatim from physio-app/src/app/shared/enums/role.ts — must stay in sync with PhysioBoo.Domain.Enums.Role. */
export enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    NURSE = "NURSE",
    PHAMACIST = "PHAMACIST",
    CASHIER = "CASHIER",
    LAB_TECHNICIAN = "LAB_TECHNICIAN",
    RADIOLOGIST = "RADIOLOGIST",
    RECEPTIONIST = "RECEPTIONIST",
    ACCOUNTANT = "ACCOUNTANT",
    INVENTORY_MANAGER = "INVENTORY_MANAGER",
    IT_SUPPORT = "IT_SUPPORT",
    DOCTOR = "DOCTOR",
    PATIENT = "PATIENT"
}

/** Roles this mobile sub-project (Foundation + Guest + Patient) serves. Staff/manager/admin roles route to a "use the desktop app" notice for now. */
export const MOBILE_SUPPORTED_ROLES: readonly Role[] = [Role.PATIENT];
