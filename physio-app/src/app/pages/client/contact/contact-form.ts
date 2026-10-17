/** Contact form on the contact page. Same rules and wording as the server-side validator. */
export interface ContactForm {
    name: string;
    phone: string;
    email: string;
    topic: string;
    clinic: string;
    message: string;
    consent: boolean;
    /** Honeypot, visually hidden. */
    website: string;
}

export type ContactField = 'name' | 'phone' | 'email' | 'clinic' | 'message' | 'consent';

/** Order the fields appear in, used for the error summary and to focus the first invalid one. */
export const CONTACT_FIELDS: ContactField[] = ['name', 'phone', 'email', 'clinic', 'message', 'consent'];

export const EMPTY_CONTACT: ContactForm = { name: '', phone: '', email: '', topic: '', clinic: '', message: '', consent: false, website: '' };

/** The lead's notes column leaves this much room for the visitor's text. */
export const MESSAGE_MAX = 1500;

export const CONTACT_TOPICS = [
    { value: 'general', label: 'General question' },
    { value: 'appointment', label: 'Appointment enquiry' },
    { value: 'service', label: 'Service information' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'complaint', label: 'Complaint' },
];

export function validateContact(f: ContactForm): Partial<Record<ContactField, string>> {
    const e: Partial<Record<ContactField, string>> = {};

    if (f.name.trim().length < 2) {
        e.name = 'Enter your full name.';
    }

    const phone = f.phone.trim();
    const digits = phone.replace(/\D/g, '');
    if (!phone) {
        e.phone = 'Enter a phone number so we can reply.';
    } else if (!/^\+?[\d\s().-]+$/.test(phone) || digits.length < 9 || digits.length > 15 || phone.length > 32) {
        e.phone = 'Enter a valid phone number, for example 0901 234 567.';
    }

    const email = f.email.trim();
    if (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254)) {
        e.email = 'Enter a valid email address, or leave it blank.';
    }

    if (!f.message.trim()) {
        e.message = 'Enter your message.';
    } else if (f.message.length > MESSAGE_MAX) {
        e.message = 'Keep your message under 1,500 characters.';
    }

    if (!f.consent) {
        e.consent = 'Tick the box to agree to the Privacy Policy so we can reply.';
    }

    return e;
}
