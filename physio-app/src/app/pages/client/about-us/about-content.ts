// About Us copy (design: About Us Page / About Us). All static; nothing here comes from the API.
// DRAFT: mission, vision and values are proposed copy. Set ABOUT_COPY_IS_DRAFT to false once they are approved,
// which removes the banner and the PROPOSED COPY tags.

export const ABOUT_COPY_IS_DRAFT = true;

/**
 * Hero photo. No suitable photo exists in assets yet, so the hero shows a neutral placeholder panel.
 * Use a real photo of PhysioBoo staff or a partner clinic (with permission), e.g. 'assets/images/about/hero.webp'.
 */
export const ABOUT_HERO_IMAGE: { src: string; alt: string } | null = null;

export interface AboutIconItem {
  icon: string;
  title: string;
  body: string;
}

export interface AboutExploreItem extends AboutIconItem {
  cta: string;
  href: string;
}

export const ABOUT_CAPABILITIES: { icon: string; label: string }[] = [
  { icon: 'stethoscope', label: 'Discover doctors' },
  { icon: 'heart-pulse', label: 'Explore healthcare services' },
  { icon: 'building-2', label: 'Find clinics and facilities' },
  { icon: 'calendar-plus', label: 'Submit appointment requests' },
];

export const ABOUT_MISSION_VISION: AboutIconItem[] = [
  {
    icon: 'target',
    title: 'Our mission',
    body: 'Make it easier for people to discover healthcare professionals, services, and facilities through a clear and accessible digital experience.',
  },
  {
    icon: 'telescope',
    title: 'Our vision',
    body: 'Build a more connected healthcare discovery experience that helps people make informed next-step decisions.',
  },
];

export const ABOUT_VALUES: AboutIconItem[] = [
  { icon: 'heart-handshake', title: 'Patient-centered', body: 'Put the visitor’s needs and clarity first.' },
  { icon: 'eye', title: 'Trust and transparency', body: 'Present information clearly and avoid unsupported claims.' },
  { icon: 'accessibility', title: 'Accessibility', body: 'Make healthcare discovery easier across devices and user needs.' },
  { icon: 'refresh-cw', title: 'Continuous improvement', body: 'Improve the digital experience based on feedback.' },
];

export const ABOUT_STEPS: { title: string; body: string }[] = [
  { title: 'Explore', body: 'Discover available doctors, services, and clinics.' },
  { title: 'Find a suitable option', body: 'Review available information to identify an appropriate healthcare option.' },
  { title: 'Take the next step', body: 'Open a profile or submit an appointment request where the feature is available.' },
];

export const ABOUT_EXPLORE: AboutExploreItem[] = [
  {
    icon: 'stethoscope', title: 'Find a doctor',
    body: 'Browse doctor profiles by specialty, and see their experience and where they practise.',
    cta: 'Browse doctors', href: '/doctor',
  },
  {
    icon: 'heart-pulse', title: 'Explore services',
    body: 'Read about the healthcare services offered on PhysioBoo and which providers offer them.',
    cta: 'View services', href: '/services',
  },
  {
    icon: 'building-2', title: 'Find a clinic',
    body: 'Look up clinics and hospitals, with their addresses, contact details and available services.',
    cta: 'Explore clinics', href: '/hospitals',
  },
];

export const ABOUT_TRUST: string[] = [
  'Healthcare information should be easy to understand, without jargon or unsupported claims.',
  'You can explore the providers and services that are currently listed before making contact.',
  'Whether a provider accepts appointment requests, and how they confirm them, is stated clearly.',
  'If something is unclear, you can contact the PhysioBoo team for help.',
];
