/** Public website contact form contract (`/api/public/contact-messages`). */

export interface PublicContactMessage {
    fullName: string;
    phone: string;
    email: string | null;
    /** One of CONTACT_TOPICS' values, or null. */
    topic: string | null;
    clinicId: string | null;
    message: string;
    consent: boolean;
    /** Honeypot; must stay empty. */
    website: string;
}

export interface PublicContactMessageResult {
    reference: string;
}
