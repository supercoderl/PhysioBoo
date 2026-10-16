import { HospitalType } from "../enums/hospital-type";

/** Public website clinic contracts (`/api/public/hospitals/*`). Public fields only. */

export interface PublicHospital {
    id: string;
    name: string;
    hospitalType: HospitalType;
    address: string | null;
    city: string | null;
    stateProvince: string | null;
    phone: string | null;
    description: string | null;
    /** First photo, else the logo; null shows a placeholder. */
    imageUrl: string | null;
    is24Hours: boolean;
    /** At most three. */
    languages: string[];
}

export interface PublicHospitalFilter {
    type?: HospitalType;
}

export interface PublicHospitalDetail {
    id: string;
    name: string;
    hospitalType: HospitalType;
    address: string | null;
    city: string | null;
    stateProvince: string | null;
    phone: string | null;
    email: string | null;
    /** Absolute http(s) URL only. */
    website: string | null;
    description: string | null;
    logoUrl: string | null;
    /** First listed photo; the logo is shown separately. */
    imageUrl: string | null;
    is24Hours: boolean;
    languages: string[];
    /** Names of the services published at this clinic. */
    services: string[];
}
