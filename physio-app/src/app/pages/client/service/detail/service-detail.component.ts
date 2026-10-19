import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, ElementRef, OnDestroy, OnInit, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router, UrlTree } from '@angular/router';
import { Subject, catchError, map, merge, of, switchMap, tap } from 'rxjs';
import { BooButtonComponent } from '../../../../components/button/boo-button/boo-button.component';
import { DoctorCardComponent } from '../../../../components/layout/client/doctor/doctor-card.component';
import { ClinicCardComponent } from '../../../../components/layout/client/hospital/clinic-card.component';
import { PublicServiceService } from '../../../../services/public/public-service.service';
import { SharedModule } from '../../../../shared/shared-imports';
import { PublicDoctor } from '../../../../shared/types/public-doctor.types';
import { PublicServiceDetail } from '../../../../shared/types/public-service.types';

type PageState = 'loading' | 'live' | 'notfound' | 'error';

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SITE = 'PhysioBoo';
const META_LENGTH = 155;
const FLASH_MS = 1400;

/**
 * Public service profile (design: Service Detail Page, follows /services, /hospitals/:id and /doctor/:id).
 * Requests are per doctor and reuse the doctor's request form: with one doctor "Request Appointment" opens their form
 * with the service (and clinic) preselected; with several it points to "Choose a doctor"; with none it is hidden.
 */
@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [BooButtonComponent, SharedModule, ClinicCardComponent, DoctorCardComponent],
  templateUrl: './service-detail.component.html',
  styles: `
    .ph-stripes { background: repeating-linear-gradient(135deg, #F3EAED 0 10px, #F9F4F6 10px 20px); }
  `
})
export class ServiceDetailComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly serviceSrv = inject(PublicServiceService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  @ViewChild('doctorsHeading') private doctorsHeading?: ElementRef<HTMLElement>;

  /** Back to the listing the visitor came from, with its search, filters and page; else the plain listing. */
  readonly backLink: UrlTree = this.listingUrl();
  /** `routerLink` in Angular 17 takes commands, not a UrlTree, so the template binds the listing's query separately. */
  readonly backQuery: Params = this.backLink.queryParams;

  state: PageState = 'loading';
  service: PublicServiceDetail | null = null;
  summary: string | null = null;
  /** Paragraphs after the summary, for "About this service". */
  paragraphs: string[] = [];
  /** Query params that preselect this service (and its clinic) in a doctor's request form. */
  requestParams: Record<string, string> = {};
  imageFailed = false;
  /** Briefly outlines the doctor list after "Request Appointment" points to it. */
  flashDoctors = false;

  private serviceId = '';
  private flashTimer?: ReturnType<typeof setTimeout>;
  private readonly reload$ = new Subject<void>();

  ngOnInit(): void {
    // Server render shows the skeleton; the service is fetched in the browser only.
    if (!this.isBrowser) return;

    merge(
      this.route.paramMap.pipe(
        map(p => p.get('id') ?? ''),
        tap(id => {
          if (this.serviceId && id !== this.serviceId) window.scrollTo({ top: 0 });
          this.serviceId = id;
        })
      ),
      this.reload$.pipe(map(() => this.serviceId))
    ).pipe(
      switchMap(id => this.load(id)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  ngOnDestroy(): void {
    clearTimeout(this.flashTimer);
    this.title.setTitle(SITE);
    this.meta.removeTag('name="description"');
    this.meta.removeTag('name="robots"');
  }

  retry(): void {
    this.reload$.next();
  }

  // #region View
  /** The doctor "Request Appointment" goes to directly; null when there are several (or none) to choose from. */
  get onlyDoctor(): PublicDoctor | null {
    return this.service?.doctors.length === 1 ? this.service.doctors[0] : null;
  }

  get requestNote(): string {
    const n = this.service?.doctors.length ?? 0;
    if (!n) return 'Online requests need a doctor who offers this service.';
    if (n === 1) return `Your request goes to ${this.onlyDoctor!.fullName}. The clinic contacts you to agree a time.`;
    return `Choose one of ${n} doctors who offer this service. The clinic contacts you to agree a time.`;
  }

  get doctorsTitle(): string {
    return (this.service?.doctors.length ?? 0) > 1 ? 'Choose a doctor' : 'Doctor for this service';
  }

  get doctorsNote(): string {
    const clinic = this.service?.clinic;
    return clinic
      ? `Publicly listed doctors linked to this service with a current schedule at ${clinic.name}`
      : 'Publicly listed doctors linked to this service';
  }

  /** Several doctors: scroll to the list, move focus to its heading and outline it briefly. */
  chooseDoctor(): void {
    const heading = this.doctorsHeading?.nativeElement;
    heading?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    heading?.focus({ preventScroll: true });
    clearTimeout(this.flashTimer);
    this.flashDoctors = true;
    this.flashTimer = setTimeout(() => this.flashDoctors = false, FLASH_MS);
  }

  trackById(_: number, d: PublicDoctor): string {
    return d.id;
  }
  // #endregion

  // #region Data
  private load(id: string) {
    this.service = null;
    this.summary = null;
    this.paragraphs = [];
    this.imageFailed = false;

    if (!GUID.test(id)) {
      this.showNotFound();
      return of(null);
    }

    this.state = 'loading';
    return this.serviceSrv.getById(id).pipe(
      tap(res => {
        if (!res.success || !res.data) {
          this.showNotFound();
          return;
        }
        const [summary, ...rest] = splitParagraphs(res.data.description);
        this.service = res.data;
        this.summary = summary ?? null;
        this.paragraphs = rest;
        this.requestParams = res.data.clinic ? { service: res.data.id, facility: res.data.clinic.id } : { service: res.data.id };
        this.state = 'live';
        this.setMeta(res.data);
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) this.showNotFound();
        else this.state = 'error';
        return of(null);
      })
    );
  }

  private listingUrl(): UrlTree {
    const prev = this.router.getCurrentNavigation()?.previousNavigation?.finalUrl;
    const path = prev?.root.children['primary']?.segments.map(s => s.path).join('/');
    return prev && path === 'services' ? prev : this.router.createUrlTree(['/services']);
  }

  private showNotFound(): void {
    this.state = 'notfound';
    this.title.setTitle(`Service not found · ${SITE}`);
    this.meta.removeTag('name="description"');
    this.meta.updateTag({ name: 'robots', content: 'noindex' });
  }

  private setMeta(s: PublicServiceDetail): void {
    this.title.setTitle(`${s.name} · ${SITE}`);
    this.meta.removeTag('name="robots"');
    const text = s.description?.replace(/\s+/g, ' ').trim();
    const description = text
      ? (text.length > META_LENGTH ? text.slice(0, META_LENGTH - 1).trimEnd() + '…' : text)
      : `${s.name}${s.clinic ? ' at ' + s.clinic.name : ''}. Find a doctor who offers it and request an appointment.`;
    this.meta.updateTag({ name: 'description', content: description });
  }
  // #endregion
}

/** The description is plain text; blank lines separate paragraphs. */
export function splitParagraphs(text: string | null): string[] {
  return (text ?? '').split(/\r?\n\s*\r?\n/).map(p => p.trim()).filter(Boolean);
}
