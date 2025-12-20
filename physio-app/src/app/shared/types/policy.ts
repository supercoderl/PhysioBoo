export interface PolicyVerification {
    policyNumber: string;
    patientName: string;
    provider: string;
    coverageAmount: number;
    usedAmount: number;
    availableAmount: number;
    validUntil: Date;
    status: 'active' | 'expired' | 'suspended';
}