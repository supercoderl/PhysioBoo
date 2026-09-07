/**
 * Ported (trimmed) from physio-app's patient.types.ts.
 * Field spellings (incl. the "Inssurance" typo) follow the server contract — do not "fix" the typo, it must match the API.
 */
export interface Patient {
    id: string;
    patientNumber: string;

    primaryDoctorId: string;
    preferredDoctorId: string | null;
    preferredHospitalId: string | null;

    inssuranceProvider: string | null;
    inssurancePolicyNumber: string | null;
    inssuranceExpiryDate: string | null;

    isVip: boolean;
    isChronicPatient: boolean;

    allergyInformation: string | null;
    currentMedications: string | null;

    registrationDate: string | null;
    lastVisitDate: string | null;
    nextFollowUpDate: string | null;

    totalVisits: number;
    totalAmountSpent: number;
    outstandingBalance: number;
    loyaltyPoints: number;
}

export interface UpdatePatientRequest {
    preferredDoctorId?: string | null;
    preferredHospitalId?: string | null;
    inssuranceProvider?: string | null;
    inssurancePolicyNumber?: string | null;
    allergyInformation?: string | null;
    currentMedications?: string | null;
}
