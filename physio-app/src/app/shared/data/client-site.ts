// Public site chrome shared by the client header, footer and homepage.
// Contact details are placeholders until tenant Home settings are wired in.

export interface ClientNavItem {
    title: string;
    href: string;
    fragment?: string;
    /** Matches the first breadcrumb of the route (see client.routes.ts) to mark the link active. */
    key?: string;
}

export const CLIENT_TENANT = {
    name: 'PhysioBoo',
    tagline: '[Tenant tagline from Home settings]',
    address: '[Address]',
    phone: '[Contact phone]',
    email: '[Contact email]',
    showEmergency: false,
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
