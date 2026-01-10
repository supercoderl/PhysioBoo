import { BloodGroup } from "../enums/blood-group";
import { Gender } from "../enums/gender";
import { MaritalStatus } from "../enums/marital-status";
import { PreferredCommunication } from "../enums/preferred-communication";

export interface Profile {
    id: string;
    firstName: string;
    lastName: string;
    middleName: string;
    dateOfBirth: Date;
    gender: Gender;
    bloodGroup: BloodGroup;
    maritalStatus: MaritalStatus;
    nationality?: string | null;
    identificationType?: string | null;
    identificationNumber?: string | null;
    identificationExpiry?: Date | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    emergencyContactRelationship?: string | null;
    preferredCommunication: PreferredCommunication;
}