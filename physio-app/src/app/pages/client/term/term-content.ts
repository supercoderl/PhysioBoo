// Terms & Conditions copy (design: Terms Page / Terms Conditions).
// DRAFT: text in [square brackets] is a placeholder, <<label|/route>> is an internal link, and sections with
// `review: true` hold booking, liability, legal or account provisions that need legal and product approval.
// Set TERMS_IS_DRAFT to false once the copy is approved.

export const TERMS_IS_DRAFT = true;
export const TERMS_EFFECTIVE_DATE = '[Effective date]';
export const TERMS_LAST_UPDATED = '[Last updated date]';

/** Section that holds the full health disclaimer, linked from the notice under the page header. */
export const TERMS_DISCLAIMER_SECTION_ID = 's9';
export const TERMS_CONTACT_SECTION_ID = 's17';

export interface TermsListItem {
  text: string;
  sub?: string[];
}

export type TermsBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: (string | TermsListItem)[] }
  | { type: 'notice'; title: string; items: string[] }
  | { type: 'contact' };

export interface TermsSection {
  /** Stable anchor, so /term#s7 can be linked from forms and emails. */
  id: string;
  title: string;
  review?: boolean;
  blocks: TermsBlock[];
}

export const TERMS_CONTACT_ROWS: { label: string; value: string }[] = [
  { label: 'Organisation', value: '[Company legal name]' },
  { label: 'Email', value: '[Contact email]' },
  { label: 'Postal address', value: '[Postal address]' },
  { label: 'Business registration', value: '[Registration number, if applicable]' },
];

export const TERMS_SECTIONS: TermsSection[] = [
  {
    id: 's1', title: 'Introduction and Acceptance of Terms', review: true, blocks: [
      { type: 'p', text: 'These Terms & Conditions (“Terms”) apply to your use of the website at [Website address], operated by [Company legal name] (“PhysioBoo”, “we”, “us”).' },
      { type: 'p', text: 'By using the website, you agree to these Terms. If you don’t agree, please don’t use the website. [Confirm acceptance wording under applicable law]' },
    ],
  },
  {
    id: 's2', title: 'About PhysioBoo', blocks: [
      { type: 'p', text: 'PhysioBoo is a website that helps you find doctors, clinics and physiotherapy services, and send appointment requests to them.' },
      { type: 'p', text: 'Clinics and healthcare professionals listed on the website provide their own services. [Confirm whether PhysioBoo operates any clinics directly]' },
    ],
  },
  {
    id: 's3', title: 'Website Use', blocks: [
      { type: 'p', text: 'You may use the website for personal, lawful purposes. When using it, you agree not to:' },
      {
        type: 'ul', items: [
          'submit false, misleading or someone else’s information;',
          {
            text: 'interfere with the website’s operation or security, including by:',
            sub: ['attempting to access areas or data you’re not authorised to access', 'introducing malicious code', 'sending automated or bulk form submissions'],
          },
          'copy or reuse website content in a way these Terms don’t allow (see section 11).',
        ],
      },
    ],
  },
  {
    id: 's4', title: 'User Responsibilities', blocks: [
      { type: 'p', text: 'You’re responsible for making sure the information you give in forms, such as your name and contact details, is accurate, so clinics can reach you about your request.' },
      { type: 'p', text: 'If you send a request on behalf of someone else, you should have their permission to share their details.' },
    ],
  },
  {
    id: 's5', title: 'Accounts and Account Security', review: true, blocks: [
      { type: 'p', text: '[Include this section only if public user accounts are offered. Product to confirm.]' },
      { type: 'p', text: 'If you create an account, keep your login details private and let us know if you think someone else has used your account.' },
    ],
  },
  {
    id: 's6', title: 'Clinics, Healthcare Professionals, and Services', review: true, blocks: [
      { type: 'p', text: 'Information about clinics, doctors and services, such as specialties, locations and service descriptions, is provided for general guidance and may change.' },
      { type: 'p', text: 'Each clinic and healthcare professional is responsible for the care they provide. [Confirm how listing information is supplied and checked]' },
    ],
  },
  {
    id: 's7', title: 'Appointment Requests and Confirmations', review: true, blocks: [
      { type: 'p', text: 'Sending an appointment request through the website does not confirm a booking. Your request is passed to the clinic you selected, and an appointment is only confirmed when the clinic contacts you to arrange it.' },
      { type: 'p', text: 'Preferred dates and times are not guaranteed. [Product to confirm how and when clinics respond to requests]' },
    ],
  },
  {
    id: 's8', title: 'Cancellations and Changes', review: true, blocks: [
      { type: 'p', text: 'To change or cancel an appointment request or a confirmed appointment, contact the clinic you selected.' },
      { type: 'p', text: '[Product and legal to confirm: whether requests can be withdrawn online, and whether any clinic cancellation terms apply. Do not state fees or refunds unless confirmed.]' },
    ],
  },
  {
    id: 's9', title: 'Health Information Disclaimer', blocks: [
      {
        type: 'notice', title: 'IMPORTANT', items: [
          'Content on this website, including articles and service descriptions, is for general information only.',
          'It doesn’t replace professional medical advice, diagnosis or treatment.',
          'For advice about your own health, speak to a qualified healthcare professional.',
          'This website is not an emergency service. In an emergency, call [Local emergency number] or go to the nearest emergency department.',
        ],
      },
      { type: 'p', text: 'Don’t delay seeking professional advice because of something you’ve read on this website.' },
    ],
  },
  {
    id: 's10', title: 'Third-Party Links and Services', blocks: [
      { type: 'p', text: 'The website may link to clinic websites and other services that we don’t control. We aren’t responsible for their content, and their own terms and privacy policies apply.' },
    ],
  },
  {
    id: 's11', title: 'Website Content and Intellectual Property', review: true, blocks: [
      { type: 'p', text: 'The website’s design, text, graphics and logos belong to [Company legal name] or its licensors, unless stated otherwise.' },
      { type: 'p', text: 'You may view and print pages for personal use. Other uses need our written permission. [Confirm permitted uses]' },
    ],
  },
  {
    id: 's12', title: 'Availability and Changes to the Website', blocks: [
      { type: 'p', text: 'We aim to keep the website available, but it may sometimes be unavailable for maintenance or for reasons outside our control. We may change, add or remove features at any time.' },
    ],
  },
  {
    id: 's13', title: 'Limitation of Liability', review: true, blocks: [
      { type: 'p', text: '[Liability wording to be drafted and approved by legal counsel under applicable law. Do not publish placeholder text in this section.]' },
    ],
  },
  {
    id: 's14', title: 'Privacy and Personal Information', blocks: [
      { type: 'p', text: 'Our <<Privacy Policy|/privacy>> explains how we collect and use personal information, including the details you give in appointment requests and contact forms.' },
    ],
  },
  {
    id: 's15', title: 'Changes to These Terms', review: true, blocks: [
      { type: 'p', text: 'We may update these Terms from time to time. The “Last updated” date at the top of this page shows when they last changed.' },
      { type: 'p', text: '[Describe how significant changes will be communicated]' },
    ],
  },
  {
    id: 's16', title: 'Governing Law and Dispute Resolution', review: true, blocks: [
      { type: 'p', text: 'These Terms are governed by [Governing law]. [Dispute resolution process and jurisdiction to be confirmed by legal counsel]' },
    ],
  },
  {
    id: 's17', title: 'Contact Information', blocks: [
      { type: 'p', text: 'If you have questions about these Terms, please contact:' },
      { type: 'contact' },
    ],
  },
];

export interface TermsTextSegment {
  text: string;
  /** True for a [bracketed] placeholder, which is highlighted until the final copy replaces it. */
  placeholder: boolean;
  /** Set for a <<label|/route>> internal link. */
  href?: string;
}

/** Splits copy into plain, [placeholder] and <<link|/route>> segments. */
export function splitTermsCopy(text: string): TermsTextSegment[] {
  return text
    .split(/(\[[^\]]+\]|<<[^>]+>>)/)
    .filter(Boolean)
    .map(part => {
      if (part.startsWith('<<')) {
        const [label, href] = part.slice(2, -2).split('|');
        return { text: label, placeholder: false, href };
      }
      return { text: part, placeholder: part.startsWith('[') };
    });
}
