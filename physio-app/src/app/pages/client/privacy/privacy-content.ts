// Privacy Policy copy (design: Privacy Page / Privacy Policy).
// DRAFT: text in [square brackets] is a placeholder, and sections with `review: true` hold commitments, retention
// periods, laws or rights that need legal approval. Set PRIVACY_IS_DRAFT to false once the copy is approved.

export const PRIVACY_IS_DRAFT = true;
export const PRIVACY_LAST_UPDATED = '[Last updated date]';

export interface PrivacyListItem {
  text: string;
  sub?: string[];
}

export type PrivacyBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: (string | PrivacyListItem)[] }
  | { type: 'contact' };

export interface PrivacySection {
  /** Stable anchor, so /privacy#s4 can be linked from forms and emails. */
  id: string;
  title: string;
  review?: boolean;
  blocks: PrivacyBlock[];
}

export const PRIVACY_CONTACT_ROWS: { label: string; value: string }[] = [
  { label: 'Organisation', value: '[Company legal name]' },
  { label: 'Email', value: '[Privacy contact email]' },
  { label: 'Postal address', value: '[Postal address]' },
  { label: 'Data protection contact', value: '[Name or role, if applicable]' },
];

export const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    id: 's1', title: 'Introduction', review: true, blocks: [
      { type: 'p', text: 'This Privacy Policy explains how [Company legal name] (“PhysioBoo”, “we”, “us”) handles personal information when you use the website at [Website address]. This includes browsing doctors, clinics and services, sending an appointment request and contacting us.' },
      { type: 'p', text: 'This policy is intended to meet the requirements of [Applicable data protection law]. Please read it together with our Terms of Service.' },
    ],
  },
  {
    id: 's2', title: 'Information We Collect', blocks: [
      { type: 'p', text: 'Depending on how you use the website, we may collect the following information:' },
      {
        type: 'ul', items: [
          'Contact details you enter in a form, such as your name and, if you choose to give them, your email address and phone number.',
          'Appointment request details, such as the doctor, clinic and service you select, your preferred date and time, and any message you add.',
          'Messages you send through the contact form, including the clinic you choose.',
          'Technical information your browser sends when you visit, such as IP address, browser type and the pages you request. [Confirm what is logged]',
        ],
      },
      { type: 'p', text: 'Please don’t include detailed medical information in free-text messages. A clinician can discuss this with you directly. [Confirm wording with clinical and legal teams]' },
    ],
  },
  {
    id: 's3', title: 'How We Use Information', review: true, blocks: [
      { type: 'p', text: 'We use the information described above to:' },
      {
        type: 'ul', items: [
          'pass your appointment request to the clinic or doctor you selected, so they can contact you about it;',
          'reply to messages sent through the contact form;',
          {
            text: 'operate, maintain and protect the website, including:',
            sub: ['diagnosing technical problems', 'preventing misuse and spam submissions', 'keeping the website available and secure'],
          },
          'meet legal obligations that apply to us.',
        ],
      },
      { type: 'p', text: '[State the legal basis for each use, as required by applicable law]' },
    ],
  },
  {
    id: 's4', title: 'Appointment Requests and Contact Forms', blocks: [
      { type: 'p', text: 'An appointment request is a request, not a confirmed booking. When you send one, the details are shared with the clinic you selected so its staff can get in touch with you to arrange a time.' },
      { type: 'p', text: 'Email address and phone number are optional where marked. If you leave them out, the clinic may have fewer ways to reach you.' },
      { type: 'p', text: 'Messages sent through the contact form are received by [Recipient: PhysioBoo team or the selected clinic].' },
    ],
  },
  {
    id: 's5', title: 'How Information Is Shared', review: true, blocks: [
      { type: 'p', text: 'We may share personal information:' },
      {
        type: 'ul', items: [
          'with the clinic and doctor you select, to handle your appointment request;',
          'with service providers who host or support the website, under agreements that limit how they can use it [List providers once confirmed];',
          'where required by law, or to protect the rights and safety of our users and others.',
        ],
      },
      { type: 'p', text: '[Confirm and state whether personal information is ever sold or used for advertising]' },
    ],
  },
  {
    id: 's6', title: 'Cookies and Similar Technologies', review: true, blocks: [
      { type: 'p', text: 'The website may use cookies and similar technologies that it needs in order to work, such as keeping you signed in and remembering your language choice.' },
      { type: 'p', text: '[Confirm whether any analytics or other non-essential cookies are used. If so, list them here and explain how visitors can manage them.]' },
    ],
  },
  {
    id: 's7', title: 'Data Storage and Security', review: true, blocks: [
      { type: 'p', text: 'Personal information is stored on [Hosting provider and region].' },
      { type: 'p', text: 'We use technical and organisational measures intended to protect personal information against loss and unauthorised access. No method of transmission or storage is completely secure. [Describe measures once confirmed]' },
    ],
  },
  {
    id: 's8', title: 'Data Retention', review: true, blocks: [
      { type: 'p', text: 'We keep personal information only for as long as we need it for the purposes in this policy, unless a longer period is required by law.' },
      { type: 'ul', items: ['Appointment requests: [Retention period]', 'Contact form messages: [Retention period]', 'Technical logs: [Retention period]'] },
    ],
  },
  {
    id: 's9', title: 'Your Privacy Rights', review: true, blocks: [
      { type: 'p', text: 'Under [Applicable data protection law], you may have the right to:' },
      {
        type: 'ul', items: [
          'ask for a copy of the personal information we hold about you;',
          'ask us to correct information that is inaccurate;',
          'ask us to delete your information;',
          'object to, or ask us to restrict, certain uses;',
          'withdraw consent, where we rely on consent.',
        ],
      },
      { type: 'p', text: 'To make a request, use the contact details in section 13. We may need to confirm your identity first. [Confirm response time required by law]' },
    ],
  },
  {
    id: 's10', title: 'Third-Party Services and External Links', blocks: [
      { type: 'p', text: 'The website may link to clinic websites and other services that we don’t control. Their own privacy policies apply when you use them.' },
      { type: 'p', text: '[List any embedded third-party services, such as maps, once confirmed]' },
    ],
  },
  {
    id: 's11', title: 'Children’s Privacy', review: true, blocks: [
      { type: 'p', text: 'The website is intended for adults. Appointment requests for a child should be made by a parent or guardian. [Confirm age threshold under applicable law]' },
    ],
  },
  {
    id: 's12', title: 'Changes to This Policy', blocks: [
      { type: 'p', text: 'We may update this policy from time to time. The “Last updated” date at the top of the page shows when it last changed.' },
      { type: 'p', text: '[Describe how significant changes will be communicated]' },
    ],
  },
  {
    id: 's13', title: 'Contact Us', blocks: [
      { type: 'p', text: 'If you have questions about this policy or about your personal information, please contact:' },
      { type: 'contact' },
    ],
  },
];

export interface PrivacyTextSegment {
  text: string;
  /** True for a [bracketed] placeholder, which is highlighted until the final copy replaces it. */
  placeholder: boolean;
}

/** Splits copy into plain and [placeholder] segments. */
export function splitPlaceholders(text: string): PrivacyTextSegment[] {
  return text
    .split(/(\[[^\]]+\])/)
    .filter(Boolean)
    .map(part => ({ text: part, placeholder: part.startsWith('[') }));
}
