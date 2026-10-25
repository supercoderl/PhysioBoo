import { InsuranceType } from "../enums/insurance-type";
import { InsuranceCompany } from "./support.types";

export type InsuranceLoadState = 'loading' | 'ready' | 'error';

/** Body of POST / PATCH /api/insurance-companies. `isActive` is only accepted by PATCH. */
export interface InsuranceCompanyPayload {
    name: string;
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
    isActive?: boolean;
}

export const INSURANCE_TYPE_OPTIONS: { label: string; value: InsuranceType }[] = [
    { label: 'Health', value: InsuranceType.Health },
    { label: 'Life', value: InsuranceType.Life },
    { label: 'General', value: InsuranceType.General },
    { label: 'Government', value: InsuranceType.Government },
];

export function insuranceTypeLabel(type: InsuranceType): string {
    return INSURANCE_TYPE_OPTIONS.find(o => o.value === type)?.label ?? 'Unknown';
}

export const INSURANCE_SORT_OPTIONS: { label: string; value: string }[] = [
    { label: 'Newest first', value: '-createdAt' },
    { label: 'Oldest first', value: '+createdAt' },
    { label: 'Name (A–Z)', value: '+name' },
    { label: 'Name (Z–A)', value: '-name' },
    { label: 'Code (A–Z)', value: '+code' },
];

/** What the signed-in user may do with insurers; the route itself only guarantees read. */
export interface InsuranceCompanyPermissions {
    create: boolean;
    update: boolean;
    delete: boolean;
}

/**
 * `networkHospitals` is stored as a jsonb column. The form edits it as one hospital per line and writes a JSON array
 * of strings. A stored value in any other shape is not representable as lines, so it is flagged `editable: false`
 * and the form sends it back untouched rather than overwriting it.
 */
export interface NetworkHospitalsView {
    names: string[];
    editable: boolean;
}

export function parseNetworkHospitals(raw: string | null | undefined): NetworkHospitalsView {
    if (!raw || !raw.trim()) return { names: [], editable: true };
    try {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.every(x => typeof x === 'string')) {
            return { names: parsed as string[], editable: true };
        }
    } catch {
        // not JSON: handled below
    }
    return { names: [], editable: false };
}

export function serializeNetworkHospitals(lines: string): string | null {
    const names = lines.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    return names.length ? JSON.stringify(names) : null;
}

export function networkHospitalCount(company: InsuranceCompany): number | null {
    const view = parseNetworkHospitals(company.networkHospitals);
    return view.editable ? view.names.length : null;
}

export function splitRequiredDocuments(text: string): string[] {
    return text.split(/[\n,]/).map(d => d.trim()).filter(d => d.length > 0);
}
