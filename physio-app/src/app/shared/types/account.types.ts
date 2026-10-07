/** Settings > Account. Enum fields carry the enum name (e.g. "Female", "O_Positive"). */
export interface MyAccount {
  email: string;
  phone: string;
  alternatePhone: string | null;
  avatarUrl: string | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  dateOfBirth: string | null;
  gender: string | null;
  maritalStatus: string | null;
  nationality: string | null;
  bloodGroup: string | null;
  preferredCommunication: string | null;
  identificationType: string | null;
  identificationNumber: string | null;
  identificationExpiry: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelationship: string | null;
}

export type UpdateMyAccountRequest = Omit<MyAccount, 'email' | 'avatarUrl'>;
