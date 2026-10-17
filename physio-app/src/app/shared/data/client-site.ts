// Public site chrome shared by the client header, footer and homepage.
// Contact details are placeholders until tenant Home settings are wired in.

export interface ClientNavItem {
    title: string;
    href: string;
    fragment?: string;
    /** Matches the first breadcrumb of the route (see client.routes.ts) to mark the link active. */
    key?: string;
}

export interface ClientTenant {
    name: string;
    tagline: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    showEmergency: boolean;
    /** Verified map link for the address; "Get directions" is hidden without it. */
    mapUrl: string | null;
    /** One-line hours under the phone number, e.g. "Mon–Fri, 08:00–18:00". */
    hoursShort: string | null;
    /** Structured opening hours; the contact page's hours card is hidden without them. */
    hours: { days: string; time: string }[] | null;
    /** Notice on the contact page (approved wording only); hidden when null. */
    notice: { title: string; body: string; phone: string | null } | null;
}

export const CLIENT_TENANT: ClientTenant = {
    name: 'PhysioBoo',
    tagline: '[Tenant tagline from Home settings]',
    address: '[Address]',
    phone: '[Contact phone]',
    email: '[Contact email]',
    showEmergency: false,
    mapUrl: null,
    hoursShort: null,
    hours: null,
    notice: null,
};

export const CLIENT_NAV: ClientNavItem[] = [
    { title: 'Home', href: '/', key: 'home' },
    { title: 'Doctors', href: '/doctor', key: 'doctor' },
    { title: 'Hospitals', href: '/hospitals', key: 'hospitals' },
    { title: 'Services', href: '/services', key: 'services' },
    { title: 'Blog', href: '/blog', key: 'blog' },
    { title: 'About us', href: '/about-us', key: 'about-us' },
    { title: 'Contact', href: '/contact', key: 'contact' },
];

export const CLIENT_FOOTER_COLS: { title: string; items: ClientNavItem[] }[] = [
    {
        title: 'Find care',
        items: [
            { title: 'Doctors', href: '/doctor' },
            { title: 'Hospitals & clinics', href: '/hospitals' },
            { title: 'Services', href: '/services' },
            { title: 'Specialties', href: '/', fragment: 'specialties' },
        ],
    },
    {
        title: 'Company',
        items: [
            { title: 'About us', href: '/about-us' },
            { title: 'Contact', href: '/contact' },
            { title: 'Health articles', href: '/blog' },
        ],
    },
    {
        title: 'Account',
        items: [
            { title: 'Log in', href: '/auth/login' },
            { title: 'Sign up', href: '/auth/register' },
            { title: 'My appointments', href: '/patient' },
        ],
    },
];
