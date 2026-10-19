import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, ElementRef, OnDestroy, OnInit, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subject, catchError, filter, map, merge, of, switchMap, tap } from 'rxjs';
import { BooButtonComponent } from '../../../../components/button/boo-button/boo-button.component';
import { DoctorCardComponent } from '../../../../components/layout/client/doctor/doctor-card.component';
import { PublicDoctorService } from '../../../../services/public/public-doctor.service';
import { SharedModule } from '../../../../shared/shared-imports';
import { PublicDoctor, PublicDoctorDetail, PublicFacility } from '../../../../shared/types/public-doctor.types';
import { EMPTY_REQUEST, REQUEST_FIELDS, RequestField, RequestForm, WRONG_FACILITY, validateRequest } from './request-form';

type PageState = 'loading' | 'live' | 'notfound' | 'error';
type SubmitState = 'idle' | 'submitting' | 'success' | 'error';
/** Why the last send failed: `network` keeps the details and offers a retry, `server` points at a field. */
type FailKind = 'network' | 'ratelimit' | 'server' | 'other';

interface Fact {
  icon: string;
  label: string;
}

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SITE = 'PhysioBoo';

/** Server validation messages (RequestPublicAppointmentCommandHandler) that belong to one form field. */
const SERVER_FIELD_ERRORS: Record<string, { field: RequestField; message: string }> = {
  'Choose the facility you want to visit.': { field: 'facility', message: 'Choose the facility you want to visit.' },
  'Choose a service.': { field: 'service', message: 'This service isn’t offered by the selected doctor. Choose one of their services.' },
  "This service isn't offered at the chosen facility. Choose another service or facility.": { field: 'service', message: WRONG_FACILITY },
};

/**
 * Public doctor profile with an appointment request (design: Doctor Detail Page, follows the listing).
 * The request is sent as a call-back request (stored as a CRM lead); it never claims a booked time.
 * Unknown, other-tenant and unlisted doctors all show the same not-found view.
 */
@Component({
  selector: 'app-doctor-detail',
  standalone: true,
  imports: [BooButtonComponent, SharedModule, DoctorCardComponent],
  templateUrl: './doctor-detail.component.html',
  styles: `
    .ph-stripes { background: repeating-linear-gradient(135deg, #F3EAED 0 10px, #F9F4F6 10px 20px); }
  `
})
export class DoctorDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly doctorSrv = inject(PublicDoctorService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  @ViewChild('requestCard') private requestCard?: ElementRef<HTMLElement>;

  state: PageState = 'loading';
  doctor: PublicDoctorDetail | null = null;
  related: PublicDoctor[] = [];
  imageFailed = false;

  form: RequestForm = { ...EMPTY_REQUEST };
  touched: Partial<Record<RequestField, boolean>> = {};
  submitted = false;
  submitState: SubmitState = 'idle';
  submitError = '';
  failKind: FailKind | null = null;
  /** Field errors returned by the server (400), shown on the field until it is edited. */
  serverErrors: Partial<Record<RequestField, string>> = {};
  /** Set when a ?facility= or ?service= link didn't fit this doctor; that field is left empty, never replaced. */
  paramNotice = '';
  reference = '';
  flash = false;

  private doctorId = '';
  private focusFormOnLoad = false;
  private flashTimer?: ReturnType<typeof setTimeout>;
  private readonly reload$ = new Subject<void>();

  ngOnInit(): void {
    // Server render shows the skeleton; the profile is fetched in the browser only.
    if (!this.isBrowser) return;

    this.focusFormOnLoad = this.route.snapshot.fragment === 'request';

    merge(
      this.route.paramMap.pipe(
        map(p => p.get('id') ?? ''),
        tap(id => {
          // Moving to another profile (e.g. a related doctor) reuses this component: start at the top.
          if (this.doctorId && id !== this.doctorId) window.scrollTo({ top: 0 });
          this.doctorId = id;
          this.resetForm();
        })
      ),
      this.reload$.pipe(map(() => this.doctorId))
    ).pipe(
      switchMap(id => this.load(id)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();

    // "Request appointment" from a listing card links here with #request.
    this.route.fragment.pipe(
      filter(f => f === 'request'),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      if (this.state === 'live') this.goToForm();
      else this.focusFormOnLoad = true;
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.flashTimer);
    this.title.setTitle(SITE);
    this.meta.removeTag('name="description"');
  }

  retry(): void {
    this.reload$.next();
  }

  // #region Profile view
  get facts(): Fact[] {
    const d = this.doctor;
    if (!d) return [];
    const facts: Fact[] = [];
    if (d.isVerified && d.yearsOfExperience) facts.push({ icon: 'briefcase-medical', label: `${d.yearsOfExperience} years of experience` });
    if (d.languages.length) facts.push({ icon: 'languages', label: d.languages.join(', ') });
    if (d.isAvailableOnline) facts.push({ icon: 'video', label: 'Online consultation' });
    if (d.isAvailableHomeVisit) facts.push({ icon: 'house', label: 'Home visit' });
    return facts;
  }

  /** The biography is stored as plain text; blank lines separate paragraphs. */
  get aboutParagraphs(): string[] {
    return (this.doctor?.about ?? '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  }

  get hasOverview(): boolean {
    const d = this.doctor;
    return !!d && !!(d.about || d.researchInterests || d.achievements);
  }

  get hasServices(): boolean {
    const d = this.doctor;
    return !!d && !!(d.specialty || d.services.length);
  }

  get contactFacility(): PublicFacility | null {
    return this.doctor?.facilities.find(f => f.phone) ?? null;
  }

  get initials(): string {
    const parts = (this.doctor?.fullName ?? '').trim().split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  }

  get relatedNote(): string {
    return this.doctor?.specialty
      ? `Other verified doctors in ${this.doctor.specialty} or at the same facility`
      : 'Other verified doctors at the same facility';
  }

  tel(phone: string): string {
    return 'tel:' + phone.replace(/[^\d+]/g, '');
  }

  trackById(_: number, d: PublicDoctor): string {
    return d.id;
  }
  // #endregion

  // #region Request form
  get errors(): Partial<Record<RequestField, string>> {
    return this.doctor ? validateRequest(this.doctor, this.form) : {};
  }

  /** Errors show after a field is left once, or after a submit attempt. */
  errorFor(field: RequestField): string {
    return this.serverErrors[field] || (this.submitted || this.touched[field] ? this.errors[field] ?? '' : '');
  }

  touch(field: RequestField): void {
    this.touched = { ...this.touched, [field]: true };
  }

  onEdit(field?: RequestField): void {
    // Editing after a failed send clears the message; the details stay.
    if (field && this.serverErrors[field]) {
      const { [field]: _, ...rest } = this.serverErrors;
      this.serverErrors = rest;
    }
    if (this.submitState === 'error') {
      this.submitState = 'idle';
      this.submitError = '';
      this.failKind = null;
    }
  }

  get singleFacility(): PublicFacility | null {
    return this.doctor?.facilities.length === 1 ? this.doctor.facilities[0] : null;
  }

  get successMessage(): string {
    const d = this.doctor;
    const chosen = d?.facilities.find(f => f.id === this.form.facility) ?? this.singleFacility;
    const service = d?.serviceOptions.find(s => s.id === this.form.service);
    return `Your request for ${d?.fullName ?? 'the doctor'}${chosen ? ' at ' + chosen.name : ''}${service ? ' (' + service.name + ')' : ''} has been received.`;
  }

  get submitLabel(): string {
    if (this.submitState === 'submitting') return 'Sending…';
    return this.failKind === 'network' ? 'Try again' : 'Send Appointment Request';
  }

  get submitIcon(): string {
    if (this.submitState === 'submitting') return 'loader-circle';
    return this.failKind === 'network' ? 'rotate-cw' : 'send';
  }

  goToForm(): void {
    const card = this.requestCard?.nativeElement;
    if (!card) return;
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.focusFirst(REQUEST_FIELDS);
    clearTimeout(this.flashTimer);
    this.flash = true;
    this.flashTimer = setTimeout(() => this.flash = false, 1200);
  }

  submit(event?: Event): void {
    event?.preventDefault();
    const d = this.doctor;
    if (!d || this.submitState === 'submitting') return;

    this.submitted = true;
    const errors = this.errors;
    const invalid = REQUEST_FIELDS.filter(f => errors[f]);
    if (invalid.length) {
      this.focusFirst(invalid);
      return;
    }

    this.submitState = 'submitting';
    this.submitError = '';
    this.serverErrors = {};
    const f = this.form;
    const service = d.serviceOptions.find(s => s.id === f.service) ?? null;
    this.doctorSrv.requestAppointment(d.id, {
      facilityId: d.facilities.length > 1 ? f.facility : this.singleFacility?.id ?? null,
      serviceId: service?.id ?? null,
      service: service?.name ?? null,
      fullName: f.name.trim(),
      phone: f.phone.trim(),
      email: f.email.trim() || null,
      website: f.website,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        if (!res.success || !res.data) {
          this.fail(null);
          return;
        }
        this.reference = res.data.reference;
        this.submitState = 'success';
        this.failKind = null;
      },
      error: (err: HttpErrorResponse) => this.fail(err)
    });
  }

  sendAnother(): void {
    this.resetForm();
    this.preselectFacility();
    setTimeout(() => this.focusFirst(REQUEST_FIELDS));
  }

  private fail(err: HttpErrorResponse | null): void {
    this.submitState = 'error';
    this.failKind = 'other';
    if (err?.status === 429) {
      this.failKind = 'ratelimit';
      this.submitError = 'Too many requests from this connection. Please wait a few minutes, then try again.';
    } else if (err?.status === 404) {
      this.submitError = 'This doctor is no longer taking requests online. Please call the clinic.';
    } else if (err?.status === 400 && Array.isArray(err.error?.errors) && err.error.errors.length) {
      // The server sends its own wording; the ones about a field are shown on that field instead.
      const errors: string[] = err.error.errors;
      const fields: Partial<Record<RequestField, string>> = {};
      for (const m of errors) {
        const hit = SERVER_FIELD_ERRORS[m];
        if (hit) fields[hit.field] = hit.message;
      }
      const rest = errors.filter(m => !SERVER_FIELD_ERRORS[m]);
      if (Object.keys(fields).length) {
        this.failKind = 'server';
        this.serverErrors = fields;
        this.submitError = rest.length ? rest.join(' ') : 'Please check the highlighted field.';
        this.focusFirst(REQUEST_FIELDS.filter(f => fields[f]));
      } else {
        this.submitError = errors.join(' ');
      }
    } else if (err && (err.status === 0 || err.status >= 500)) {
      this.failKind = 'network';
      this.submitError = 'We couldn’t reach the server. Your details are still here. Try sending again.';
    } else {
      this.submitError = 'We couldn’t send your request. Your details are still here, so you can try again. If it keeps failing, call the clinic.';
    }
  }

  private resetForm(): void {
    this.form = { ...EMPTY_REQUEST };
    this.touched = {};
    this.submitted = false;
    this.submitState = 'idle';
    this.submitError = '';
    this.failKind = null;
    this.serverErrors = {};
    this.paramNotice = '';
    this.reference = '';
  }

  /**
   * A clinic page links here with `?facility={id}` and a service page with `?service={id}` (older links: the name).
   * Each is kept only if the doctor practises there / delivers that service; otherwise the field stays empty
   * and a notice says why. A replacement is never picked automatically.
   */
  private preselectFacility(): void {
    const d = this.doctor;
    if (!d) return;
    const params = this.route.snapshot.queryParamMap;
    const notices: string[] = [];

    const facilityId = params.get('facility');
    if (facilityId) {
      if (d.facilities.some(f => f.id === facilityId)) this.form = { ...this.form, facility: facilityId };
      else if (d.facilities.length) notices.push(`The clinic you came from isn’t one where ${d.fullName} practises, so it wasn’t selected. Choose one of their facilities below.`);
    }

    const wanted = params.get('service');
    if (wanted) {
      const facility = this.form.facility || this.singleFacility?.id || null;
      const matches = d.serviceOptions.filter(s => s.id === wanted || s.name === wanted);
      const service = matches.find(s => !s.hospitalId || !facility || s.hospitalId === facility);
      if (service) {
        this.form = { ...this.form, service: service.id };
      } else if (d.serviceOptions.length) {
        // An id can't be shown to people; use the name when the link carried one.
        const label = GUID.test(wanted) ? 'The service you chose' : `“${wanted}”`;
        notices.push(matches.length
          ? `${label} isn’t offered at this facility by ${d.fullName}, so it wasn’t selected. Choose one of their services below.`
          : `${label} isn’t offered by ${d.fullName}, so it wasn’t selected. Choose one of their services below.`);
      }
    }

    this.paramNotice = notices.join(' ');
  }

  /** Focuses the first rendered field from the list (fields for absent facility/service choices aren't rendered). */
  private focusFirst(fields: RequestField[]): void {
    for (const f of fields) {
      const el = this.host.nativeElement.querySelector<HTMLElement>(`#rq-${f}`);
      if (el) {
        el.focus({ preventScroll: true });
        return;
      }
    }
  }
  // #endregion

  // #region Data
  private load(id: string) {
    this.doctor = null;
    this.related = [];
    this.imageFailed = false;

    if (!GUID.test(id)) {
      this.showNotFound();
      return of(null);
    }

    this.state = 'loading';
    return this.doctorSrv.getById(id).pipe(
      tap(res => {
        if (!res.success || !res.data) {
          this.showNotFound();
          return;
        }
        this.doctor = res.data;
        this.preselectFacility();
        this.state = 'live';
        this.setMeta(res.data);
        this.loadRelated(id);
        if (this.focusFormOnLoad) {
          this.focusFormOnLoad = false;
          setTimeout(() => this.goToForm());
        }
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) this.showNotFound();
        else this.state = 'error';
        return of(null);
      })
    );
  }

  private loadRelated(id: string): void {
    // Related doctors are optional: if they fail, the section is simply not shown.
    this.doctorSrv.getRelated(id).pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(res => {
      if (res?.success && res.data && this.doctor?.id === id) this.related = res.data;
    });
  }

  private showNotFound(): void {
    this.state = 'notfound';
    this.title.setTitle(`Doctor not found · ${SITE}`);
    this.meta.removeTag('name="description"');
  }

  private setMeta(d: PublicDoctorDetail): void {
    this.title.setTitle(`${d.fullName}${d.specialty ? ' · ' + d.specialty : ''} · ${SITE}`);
    const description = d.bio ?? `${d.fullName}${d.specialty ? ', ' + d.specialty : ''}. Request an appointment online.`;
    this.meta.updateTag({ name: 'description', content: description });
  }
  // #endregion

  /** Rows are rebuilt by a getter on every check; tracking by label keeps the same DOM nodes. */
  trackByLabel(_: number, item: { label: string }): string {
    return item.label;
  }
}
