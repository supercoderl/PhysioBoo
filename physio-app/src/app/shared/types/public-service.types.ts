import { PublicDoctor, PublicOption } from "./public-doctor.types";
import { PublicHospital } from "./public-hospital.types";

/** Public website service contracts (`/api/public/services/*`). Public fields only: no price, duration or codes. */

export interface PublicService {
    id: string;
    name: string;
    description: string | null;
    /** Null shows a placeholder. */
    coverImageUrl: string | null;
    /** Set only when the clinic is public. */
    hospitalId: string | null;
    hospitalName: string | null;
    /** A publicly listed doctor who delivers the service; requests go to them first. */
    doctorId: string | null;
}

export interface PublicServiceFilter {
    hospitalId?: string;
}

export interface PublicServiceFilterOptions {
    /** Clinics with at least one published service. */
    clinics: PublicOption[];
}

export interface PublicServiceDetail {
    id: string;
    name: string;
    /** Paragraphs separated by blank lines; the first is the summary. */
    description: string | null;
    coverImageUrl: string | null;
    /** The one public clinic the service is listed at, if any. */
    clinic: PublicHospital | null;
    /** Publicly listed doctors who deliver it (at the clinic, when there is one). At most six. */
    doctors: PublicDoctor[];
}
