export interface InsuranceProvider {
  id: string;
  name: string;
  contactNumber: string;
  email: string;
}

export interface InsuranceClaim {
  id: string;
  claimNumber: string;
  patientName: string;
  patientId: string;
  policyNumber: string;
  provider: string;
  claimAmount: number;
  approvedAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  submissionDate: Date;
  treatmentDate: Date;
  description: string;
}