export interface Patient {
  id: number;
  queueNumber?: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  allergies: string[];
  dateOfBirth: string;
  bloodType: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  chronicConditions: string[];
}

export interface PaymentSummary {
  method: string;
  amount: number;
  count: number;
  percentage: number;
}