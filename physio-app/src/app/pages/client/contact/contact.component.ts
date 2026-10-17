import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, ElementRef, OnInit, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClinicCardComponent } from '../../../components/layout/client/hospital/clinic-card.component';
import { PublicContactService } from '../../../services/public/public-contact.service';
import { PublicHospitalService } from '../../../services/public/public-hospital.service';
import { CLIENT_TENANT, ClientTenant } from '../../../shared/data/client-site';
import { SharedModule } from '../../../shared/shared-imports';
import { PublicHospital } from '../../../shared/types/public-hospital.types';
import { CONTACT_FIELDS, CONTACT_TOPICS, ContactField, ContactForm, EMPTY_CONTACT, MESSAGE_MAX, validateContact } from './contact-form';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';
/** Which banner a failed send shows; 'server' means a field was rejected and is marked inline. */
type FailKind = 'server' | 'ratelimit' | 'network' | 'unavailable' | 'other';
type ClinicState = 'loading' | 'live' | 'error';

interface InfoCard {
  icon: string;
  title: string;
  lines: string[];
  rows?: { days: string; time: string }[];
  action?: { label: string; href: string; external?: boolean };
}

// Server wording for a rejected field → the field it belongs to.
const SERVER_FIELD_ERRORS: Record<string, ContactField> = {
  'Enter your full name.': 'name',
  'Enter a phone number so we can reply.': 'phone',
  'Enter a valid phone number, for example 0901 234 567.': 'phone',
  'Enter a valid email address, or leave it blank.': 'email',
  'Choose a clinic from the list, or leave it as No preference.': 'clinic',
  'Enter your message.': 'message',
  'Keep your message under 1,500 characters.': 'message',
  'Tick the box to agree to the Privacy Policy so we can reply.': 'consent',
};

// Enough for the select; the cards show the first few.
const CLINIC_PAGE_SIZE = 50;
const CLINIC_CARDS = 3;

/**
 * Public contact page (design: Contact Page / Contact).
 * Contact details come from the tenant settings the footer uses; each card hides when its value is missing.
 * The message is sent to `/api/public/contact-messages` and stored as a CRM lead.
 */
@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [SharedModule, ClinicCardComponent],
  templateUrl: './contact.component.html',
})
export class ContactComponent implements OnInit {
  private readonly contactSrv = inject(PublicContactService);
  private readonly hospitalSrv = inject(PublicHospitalService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  @ViewChild('summaryBox') private summaryEl?: ElementRef<HTMLElement>;

  readonly tenant: ClientTenant = CLIENT_TENANT;
  readonly topics = CONTACT_TOPICS;
  readonly messageMax = MESSAGE_MAX;
  readonly skeletons = Array.from({ length: CLINIC_CARDS });
  readonly infoCards = buildInfoCards(CLIENT_TENANT);

  form: ContactForm = { ...EMPTY_CONTACT };
  touched: Partial<Record<ContactField, boolean>> = {};
  submitted = false;
  submitState: SubmitState = 'idle';
  failKind: FailKind | null = null;
  /** Field errors returned by the server (400), shown on the field until it is edited. */
  serverErrors: Partial<Record<ContactField, string>> = {};
  /** Shown only when the server returns one. */
  reference = '';

  clinicState: ClinicState = 'loading';
  clinics: PublicHospital[] = [];
  clinicTotal = 0;

  ngOnInit(): void {
    // Server render shows the loading skeleton; data is fetched in the browser only.
    if (this.isBrowser) this.loadClinics();
  }

  // #region Contact details
  get noticePhoneHref(): string | null {
    return telHref(this.tenant.notice?.phone ?? null);
  }

  get infoCols(): string {
    // One row of up to four cards on desktop.
    return ['lg:grid-cols-1', 'lg:grid-cols-2', 'lg:grid-cols-3', 'lg:grid-cols-4'][Math.max(0, Math.min(4, this.infoCards.length) - 1)];
  }
  // #endregion

  // #region Form
  get errors(): Partial<Record<ContactField, string>> {
    return validateContact(this.form);
  }

  /** Errors show after a field is left once, or after a submit attempt. */
  errorFor(field: ContactField): string {
    return this.serverErrors[field] || (this.submitted || this.touched[field] ? this.errors[field] ?? '' : '');
  }

  /** The error summary lists every problem after a submit attempt. */
  get summary(): { field: ContactField; message: string }[] {
    if (!this.submitted || this.submitState === 'submitting' || this.failKind === 'server') return [];
    const e = this.errors;
    return CONTACT_FIELDS.filter(f => e[f]).map(f => ({ field: f, message: e[f]! }));
  }

  get summaryTitle(): string {
    const n = this.summary.length;
    return n === 1 ? 'There is 1 problem with your message' : `There are ${n} problems with your message`;
  }

  get banner(): { title: string; text: string; icon: string; tone: 'danger' | 'warning' } | null {
    if (this.submitState !== 'error') return null;
    switch (this.failKind) {
      case 'server':
        return { title: 'Please check the highlighted field', text: 'Your message wasn’t sent. Everything you entered is still here.', icon: 'circle-alert', tone: 'danger' };
      case 'ratelimit':
        return { title: 'Too many messages in a short time', text: 'Please wait a few minutes before trying again. Your message is still here.', icon: 'timer', tone: 'warning' };
      case 'network':
        return { title: 'Your message couldn’t be sent', text: 'There was a problem with the connection. Your details are still here. Check your connection and try again.', icon: 'cloud-off', tone: 'danger' };
      case 'unavailable':
        return {
          title: 'Messages can’t be sent right now',
          text: 'Our contact form is temporarily unavailable. Please try again later' + (this.tenant.phone ? `, or call us on ${this.tenant.phone}.` : '.'),
          icon: 'pause',
          tone: 'warning',
        };
      default:
        return { title: 'Your message couldn’t be sent', text: 'Something went wrong. Your details are still here, so you can try again.', icon: 'circle-alert', tone: 'danger' };
    }
  }

  get submitDisabled(): boolean {
    return this.submitState === 'submitting' || this.failKind === 'unavailable';
  }

  get submitLabel(): string {
    if (this.submitState === 'submitting') return 'Sending message…';
    return this.failKind === 'network' ? 'Try again' : 'Send message';
  }

  get submitIcon(): string {
    if (this.submitState === 'submitting') return 'loader-circle';
    return this.failKind === 'network' ? 'rotate-cw' : 'send';
  }

  touch(field: ContactField): void {
    this.touched = { ...this.touched, [field]: true };
  }

  /** Editing a field clears the server's error on it and the banner that went with it. */
  onEdit(field: ContactField): void {
    if (!this.serverErrors[field]) return;
    const { [field]: _, ...rest } = this.serverErrors;
    this.serverErrors = rest;
    if (this.failKind === 'server' && !Object.keys(rest).length) {
      this.submitState = 'idle';
      this.failKind = null;
    }
  }

  focusField(field: ContactField, event?: Event): void {
    event?.preventDefault();
    this.host.nativeElement.querySelector<HTMLElement>(`#ct-${field}`)?.focus();
  }

  submit(event?: Event): void {
    event?.preventDefault();
    if (this.submitDisabled) return;

    this.submitted = true;
    this.serverErrors = {};
    if (this.failKind === 'server') this.failKind = null;
    if (CONTACT_FIELDS.some(f => this.errors[f])) {
      // Keep a rate-limit banner up; anything else is replaced by the summary.
      if (this.failKind !== 'ratelimit') {
        this.submitState = 'idle';
        this.failKind = null;
      }
      setTimeout(() => this.summaryEl?.nativeElement.focus({ preventScroll: false }));
      return;
    }

    this.submitState = 'submitting';
    const f = this.form;
    this.contactSrv.send({
      fullName: f.name.trim(),
      phone: f.phone.trim(),
      email: f.email.trim() || null,
      topic: f.topic || null,
      clinicId: f.clinic || null,
      message: f.message.trim(),
      consent: f.consent,
      website: f.website,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        if (!res.success) {
          this.fail(null);
          return;
        }
        this.reference = res.data?.reference ?? '';
        this.submitState = 'success';
        this.failKind = null;
      },
      error: (err: HttpErrorResponse) => this.fail(err),
    });
  }

  sendAnother(): void {
    this.form = { ...EMPTY_CONTACT };
    this.touched = {};
    this.submitted = false;
    this.submitState = 'idle';
    this.failKind = null;
    this.serverErrors = {};
    this.reference = '';
    setTimeout(() => this.focusField('name'));
  }

  private fail(err: HttpErrorResponse | null): void {
    this.submitState = 'error';
    if (err?.status === 429) {
      this.failKind = 'ratelimit';
    } else if (err?.status === 503) {
      this.failKind = 'unavailable';
    } else if (err?.status === 400 && Array.isArray(err.error?.errors)) {
      const fields: Partial<Record<ContactField, string>> = {};
      for (const m of err.error.errors as string[]) {
        const field = SERVER_FIELD_ERRORS[m];
        if (field) fields[field] = field === 'phone' && m.startsWith('Enter a valid') ? 'We couldn’t accept this phone number. Check it and try again.' : m;
      }
      this.failKind = Object.keys(fields).length ? 'server' : 'other';
      this.serverErrors = fields;
      const first = CONTACT_FIELDS.find(f => fields[f]);
      if (first) setTimeout(() => this.focusField(first));
    } else if (err && (err.status === 0 || err.status >= 500)) {
      this.failKind = 'network';
    } else {
      this.failKind = 'other';
    }
  }
  // #endregion

  // #region Clinics
  get clinicCards(): PublicHospital[] {
    return this.clinics.slice(0, CLINIC_CARDS);
  }

  loadClinics(): void {
    this.clinicState = 'loading';
    this.hospitalSrv.search({ pageNumber: 1, pageSize: CLINIC_PAGE_SIZE })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          if (!res.success || !res.data) {
            this.clinicState = 'error';
            return;
          }
          this.clinics = res.data.items;
          this.clinicTotal = res.data.totalCount;
          this.clinicState = 'live';
        },
        // The section shows its own retry; the clinic select stays hidden.
        error: () => this.clinicState = 'error',
      });
  }
  // #endregion
}

/** `tel:` link for a number, or null when the value has no digits (e.g. an unfilled placeholder). */
export function telHref(phone: string | null): string | null {
  const digits = (phone ?? '').replace(/[^\d+]/g, '');
  return /\d/.test(digits) ? 'tel:' + digits : null;
}

export function buildInfoCards(t: ClientTenant): InfoCard[] {
  const cards: InfoCard[] = [];
  if (t.phone) {
    const href = telHref(t.phone);
    cards.push({
      icon: 'phone', title: 'Call us', lines: [t.phone, ...(t.hoursShort ? [t.hoursShort] : [])],
      action: href ? { label: 'Call now', href } : undefined,
    });
  }
  if (t.email) {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t.email);
    cards.push({ icon: 'email', title: 'Email us', lines: [t.email], action: valid ? { label: 'Send an email', href: 'mailto:' + t.email } : undefined });
  }
  if (t.address) {
    cards.push({ icon: 'map-pin', title: 'Visit us', lines: [t.address], action: t.mapUrl ? { label: 'Get directions', href: t.mapUrl, external: true } : undefined });
  }
  if (t.hours?.length) {
    cards.push({ icon: 'clock', title: 'Opening hours', lines: [], rows: t.hours });
  }
  return cards;
}
