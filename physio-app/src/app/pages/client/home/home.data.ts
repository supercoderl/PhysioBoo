// Static copy for the public homepage (design: Homepage Direction A, "Clinical calm").
// Specialties, doctors, clinics and articles come from the public APIs (see HomeComponent); nothing here
// describes a real doctor, clinic, article or time slot.

export interface HomeStep { n: string; t: string; d: string; }
export interface HomeReason { icon: string; t: string; d: string; }
export interface HomeFaq { q: string; a: string; }
export interface HomeTestimonial { text: string; name: string; location: string; }

/** Specialty name (lower case) → icon. Specialties come from the API; unknown ones use the fallback. */
export const HOME_SPECIALTY_ICONS: Record<string, string> = {
    orthopedics: 'bone',
    orthopaedics: 'bone',
    cardiology: 'heart-pulse',
    pediatrics: 'baby',
    paediatrics: 'baby',
    dental: 'smile',
    dentistry: 'smile',
    oncology: 'ribbon',
    gynecology: 'venus',
    neurology: 'brain',
    'general practice': 'stethoscope',
};
export const HOME_SPECIALTY_FALLBACK_ICON = 'stethoscope';

/** Specialty cards shown (8 on desktop, the first 6 on mobile) and popular-search chips under the hero. */
export const HOME_SPECIALTY_COUNT = 8;
export const HOME_POPULAR_COUNT = 4;
export const HOME_DOCTOR_COUNT = 3;
export const HOME_CLINIC_COUNT = 3;
export const HOME_ARTICLE_COUNT = 3;

// The public flow is a call-back request (stored as a CRM lead), not an instant booking: no step may promise
// a confirmed time slot.
export const HOME_STEPS: HomeStep[] = [
    { n: '01', t: 'Find a doctor', d: 'Search by name or specialty, or browse clinics and services.' },
    { n: '02', t: 'Send a request', d: 'On the doctor’s profile, choose a facility and service and leave your phone number.' },
    { n: '03', t: 'Get a call back', d: 'The clinic contacts you to agree a time. Your appointment is confirmed only then.' },
];

export const HOME_REASONS: HomeReason[] = [
    { icon: 'square-user', t: 'Follow-up care', d: 'We keep in touch after your visit with follow-ups that help you stay on track with your recovery goals.' },
    { icon: 'audio-lines', t: 'Patient-centred approach', d: 'We put your comfort and preferences first and tailor care to your individual needs.' },
    { icon: 'briefcase-medical', t: 'Convenient access', d: 'Send an appointment request from any doctor’s profile, or contact the team directly.' },
];

export const HOME_FAQS: HomeFaq[] = [
    { q: 'How do I book an appointment with a doctor?', a: 'Open the doctor’s profile and send an appointment request with your name and phone number. The clinic then contacts you to agree a time; the request is not a confirmed appointment until they do.' },
    { q: 'Can I request a specific doctor?', a: 'Yes. Requests are sent from a doctor’s profile, so they go to that doctor first. The clinic confirms availability when it calls you back.' },
    { q: 'What should I do if I need to cancel or reschedule my appointment?', a: 'Contact the clinic as soon as possible so they can free the time and offer you another one.' },
    { q: "What if I'm running late for my appointment?", a: "Call the clinic to let them know. Depending on their schedule, they may still be able to see you or will help you reschedule." },
    { q: 'Can I request appointments for family members or dependents?', a: 'Yes. Enter their name and a phone number the clinic can call. The clinic may ask for their details and consent when it calls back.' },
];

// The section renders only when the tenant has published testimonials (CMS → Home configuration).
export const HOME_TESTIMONIALS: HomeTestimonial[] = [];

export function specialtyIcon(name: string): string {
    return HOME_SPECIALTY_ICONS[name.trim().toLowerCase()] ?? HOME_SPECIALTY_FALLBACK_ICON;
}
