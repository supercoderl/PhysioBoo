export interface Doctor {
  id: string;
  employeeId?: string | null;
  medicalLicenseNumber: string;
  medicalLicenseExpiry: Date;
  yearsOfExperience: number;
  averageRating: number;
  totalReviews: number;
  bio: string | null;
  about: string | null;
}