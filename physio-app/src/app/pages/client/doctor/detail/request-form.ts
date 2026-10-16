import { PublicDoctorDetail } from '../../../../shared/types/public-doctor.types';

/** Appointment request form on the doctor page. Same rules and wording as the server-side validator. */
export interface RequestForm {
    facility: string;
    service: string;
    name: string;
    phone: string;
    email: string;
    /** Honeypot, visually hidden. */
    website: string;
}

export type RequestField = 'facility' | 'service' | 'name' | 'phone' | 'email';

/** Order the fields appear in, used to focus the first invalid one. */
export const REQUEST_FIELDS: RequestField[] = ['facility', 'service', 'name', 'phone', 'email'];

export const EMPTY_REQUEST: RequestForm = { facility: '', service: '', name: '', phone: '', email: '', website: '' };

export function validateRequest(doctor: Pick<PublicDoctorDetail, 'facilities' | 'services'>, f: RequestForm): Partial<Record<RequestField, string>> {
    const e: Partial<Record<RequestField, string>> = {};

    if (doctor.facilities.length > 1 && !doctor.facilities.some(x => x.id === f.facility)) {
        e.facility = 'Choose the facility you want to visit.';
    }
    if (doctor.services.length && !doctor.services.includes(f.service)) {
        e.service = 'Choose a service.';
    }
    if (f.name.trim().length < 2) {
        e.name = 'Enter your full name.';
    }

    const phone = f.phone.trim();
    const digits = phone.replace(/\D/g, '');
    if (!phone) {
        e.phone = 'Enter a phone number so the clinic can call you back.';
    } else if (!/^\+?[\d\s().-]+$/.test(phone) || digits.length < 9 || digits.length > 15 || phone.length > 32) {
        e.phone = 'Enter a valid phone number, for example 0901 234 567.';
    }

    const email = f.email.trim();
    if (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254)) {
        e.email = 'Enter a valid email, or leave this blank.';
    }

    return e;
}
