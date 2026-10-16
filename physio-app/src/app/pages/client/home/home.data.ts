// Static content for the public homepage (design: Homepage Direction A, "Clinical calm").
// Doctors, hospitals and articles are sample cards until the public doctor, schedule and CMS APIs exist.

export interface HomeSpecialty { name: string; icon: string; }
export interface HomeDoctor { name: string; spec: string; clinic: string; day: string; slots: string[]; }
export interface HomeHospital { name: string; addr: string; tags: string[]; }
export interface HomeStep { n: string; t: string; d: string; }
export interface HomeReason { icon: string; t: string; d: string; }
export interface HomeFaq { q: string; a: string; }
export interface HomeArticle { t: string; d: string; }
export interface HomeTestimonial { text: string; name: string; location: string; }

export const HOME_POPULAR = ['Orthopedics', 'Pediatrics', 'Cardiology', 'Dental'];

export const HOME_SPECIALTIES: HomeSpecialty[] = [
    { name: 'Orthopedics', icon: 'bone' },
    { name: 'Cardiology', icon: 'heart-pulse' },
    { name: 'Pediatrics', icon: 'baby' },
    { name: 'Dental', icon: 'smile' },
    { name: 'Oncology', icon: 'ribbon' },
    { name: 'Gynecology', icon: 'venus' },
    { name: 'Neurology', icon: 'brain' },
    { name: 'General practice', icon: 'stethoscope' },
];

export const HOME_DOCTORS: HomeDoctor[] = [
    { name: '[Doctor name]', spec: '[Specialty]', clinic: '[Clinic name]', day: 'Today', slots: ['09:00', '10:30', '14:00'] },
    { name: '[Doctor name]', spec: '[Specialty]', clinic: '[Clinic name]', day: 'Today', slots: ['11:00', '15:30', '16:00'] },
    { name: '[Doctor name]', spec: '[Specialty]', clinic: '[Clinic name]', day: 'Tomorrow', slots: ['08:30', '09:00', '13:30'] },
    { name: '[Doctor name]', spec: '[Specialty]', clinic: '[Clinic name]', day: 'Tomorrow', slots: ['10:00', '14:30', '17:00'] },
];

export const HOME_HOSPITALS: HomeHospital[] = [
    { name: '[Hospital or clinic name]', addr: '[District, City]', tags: ['[Department]', '[Department]', '[Department]'] },
    { name: '[Hospital or clinic name]', addr: '[District, City]', tags: ['[Department]', '[Department]'] },
    { name: '[Hospital or clinic name]', addr: '[District, City]', tags: ['[Department]', '[Department]', '[Department]'] },
];

export const HOME_STEPS: HomeStep[] = [
    { n: '01', t: 'Search', d: 'Find a doctor by specialty, clinic or location.' },
    { n: '02', t: 'Pick a time', d: 'Choose from the open slots shown on each doctor’s schedule.' },
    { n: '03', t: 'Confirm', d: 'Log in or create an account to confirm. Manage it later from your account.' },
];

export const HOME_GUIDANCE = ['[Tenant guidance item 1]', '[Tenant guidance item 2]', '[Tenant guidance item 3]'];

export const HOME_REASONS: HomeReason[] = [
    { icon: 'square-user', t: 'Follow-Up Care', d: 'We ensure continuity of care through regular follow-ups and communication, helping you stay on track with health goals.' },
    { icon: 'audio-lines', t: 'Patient-Centered Approach', d: 'We prioritize your comfort and preferences, tailoring our services to meet your individual needs and Care from Our Experts' },
    { icon: 'briefcase-medical', t: 'Convenient Access', d: 'Easily book appointments online or through our dedicated customer service team, with flexible hours to fit your schedule.' },
];

export const HOME_FAQS: HomeFaq[] = [
    { q: 'How do I book an appointment with a doctor?', a: 'Yes, simply visit our website and log in or create an account. Search for a doctor based on specialization, location, or availability & confirm your booking.' },
    { q: 'Can I request a specific doctor when booking my appointment?', a: 'Yes, you can usually request a specific doctor when booking your appointment, though availability may vary based on their schedule.' },
    { q: 'What should I do if I need to cancel or reschedule my appointment?', a: 'If you need to cancel or reschedule your appointment, contact the doctor as soon as possible to inform them and to reschedule for another available time slot.' },
    { q: "What if I'm running late for my appointment?", a: "If you know you will be late, it's courteous to call the doctor's office and inform them. Depending on their policy and schedule, they may be able to accommodate you or reschedule your appointment." },
    { q: 'Can I book appointments for family members or dependents?', a: 'Yes, in many cases, you can book appointments for family members or dependents. However, you may need to provide their personal information and consent to do so.' },
];

export const HOME_ARTICLES: HomeArticle[] = [
    { t: '10 Tips for Maintaining a Healthy Lifestyle Year-Round', d: 'Discover practical, everyday tips to help you stay healthy throughout the year.' },
    { t: 'Understanding Common Symptoms: When to See a Doctor', d: "Learn how to identify common symptoms and when it's important to seek medical attention." },
    { t: 'Nutrition and Wellness: A Guide to Balanced Eating', d: 'Good nutrition is the foundation of wellness. Explore tips for creating a balanced diet' },
];

// The section renders only when the tenant has published testimonials (CMS → Home configuration).
export const HOME_TESTIMONIALS: HomeTestimonial[] = [];
