import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router, UrlTree } from '@angular/router';
import { Subject, catchError, map, merge, of, switchMap, tap } from 'rxjs';
import { BooButtonComponent } from '../../../../components/button/boo-button/boo-button.component';
import { DoctorCardComponent } from '../../../../components/layout/client/doctor/doctor-card.component';
import { PublicDoctorService } from '../../../../services/public/public-doctor.service';
import { PublicHospitalService } from '../../../../services/public/public-hospital.service';
import { hospitalTypeLabel } from '../../../../shared/enums/hospital-type';
import { SharedModule } from '../../../../shared/shared-imports';
import { PublicDoctor } from '../../../../shared/types/public-doctor.types';
import { PublicHospitalDetail } from '../../../../shared/types/public-hospital.types';

type PageState = 'loading' | 'live' | 'notfound' | 'error';

interface InfoRow {
  icon: string;
  label: string;
  value: string;
  href?: string;
}

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SITE = 'PhysioBoo';
// The section is a preview; "View All Doctors" opens the full filtered listing.
const DOCTOR_PREVIEW = 4;

/**
 * Public clinic profile (design: Clinic Detail Page, follows /hospitals and /doctor).
 * Appointment requests are per doctor, so "Request Appointment" opens the doctor listing filtered to this clinic,
 * and a doctor card's request link preselects this clinic in that doctor's form. Sections without data are hidden.
 */
@Component({
  selector: 'app-hospital-detail',
  standalone: true,
  imports: [BooButtonComponent, SharedModule, DoctorCardComponent],
  templateUrl: './hospital-detail.component.html',
  styles: `
    .ph-stripes { background: repeating-linear-gradient(135deg, #F3EAED 0 10px, #F9F4F6 10px 20px); }
  `
})
export class HospitalDetailComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly hospitalSrv = inject(PublicHospitalService);
  private readonly doctorSrv = inject(PublicDoctorService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Back to the listing the visitor came from, with its search, filters and page; else the plain listing. */
  readonly backLink: UrlTree = this.listingUrl();
  /** `routerLink` in Angular 17 takes commands, not a UrlTree, so the template binds the listing's query separately. */
  readonly backQuery: Params = this.backLink.queryParams;

  state: PageState = 'loading';
  clinic: PublicHospitalDetail | null = null;
  doctors: PublicDoctor[] = [];
  doctorTotal = 0;
  imageFailed = false;
  logoFailed = false;

  private clinicId = '';
  private readonly reload$ = new Subject<void>();

  ngOnInit(): void {
    // Server render shows the skeleton; the clinic is fetched in the browser only.
    if (!this.isBrowser) return;

    merge(
      this.route.paramMap.pipe(
        map(p => p.get('id') ?? ''),
        tap(id => {
          if (this.clinicId && id !== this.clinicId) window.scrollTo({ top: 0 });
          this.clinicId = id;
        })
      ),
      this.reload$.pipe(map(() => this.clinicId))
    ).pipe(
      switchMap(id => this.load(id)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.title.setTitle(SITE);
    this.meta.removeTag('name="description"');
  }

  retry(): void {
    this.reload$.next();
  }

  // #region View
  get typeLabel(): string {
    return hospitalTypeLabel(this.clinic?.hospitalType);
  }

  get addressLine(): string {
    const c = this.clinic;
    return c ? [c.address, c.city, c.stateProvince].filter(Boolean).join(', ') : '';
  }

  get infoRows(): InfoRow[] {
    const c = this.clinic;
    if (!c) return [];
    const rows: InfoRow[] = [];
    if (this.addressLine) rows.push({ icon: 'map-pin', label: 'Address', value: this.addressLine });
    if (c.phone) rows.push({ icon: 'phone', label: 'Phone', value: c.phone, href: this.tel(c.phone) });
    if (c.email) rows.push({ icon: 'email', label: 'Email', value: c.email, href: 'mailto:' + c.email });
    if (c.website) rows.push({ icon: 'globe', label: 'Website', value: c.website.replace(/^https?:\/\//, '').replace(/\/$/, ''), href: c.website });
    rows.push({ icon: 'building-2', label: 'Facility type', value: this.typeLabel });
    if (c.is24Hours) rows.push({ icon: 'clock', label: 'Hours', value: 'Open 24 hours' });
    if (c.languages.length) rows.push({ icon: 'languages', label: 'Languages', value: c.languages.join(', ') });
    return rows;
  }

  get doctorNote(): string {
    return this.doctorTotal > this.doctors.length
      ? `Showing ${this.doctors.length} of ${this.doctorTotal} doctors with a current schedule here`
      : 'Doctors with a current schedule at this clinic';
  }

  tel(phone: string): string {
    return 'tel:' + phone.replace(/[^\d+]/g, '');
  }

  trackById(_: number, d: PublicDoctor): string {
    return d.id;
  }
  // #endregion

  // #region Data
  private load(id: string) {
    this.clinic = null;
    this.doctors = [];
    this.doctorTotal = 0;
    this.imageFailed = false;
    this.logoFailed = false;

    if (!GUID.test(id)) {
      this.showNotFound();
      return of(null);
    }

    this.state = 'loading';
    return this.hospitalSrv.getById(id).pipe(
      tap(res => {
        if (!res.success || !res.data) {
          this.showNotFound();
          return;
        }
        this.clinic = res.data;
        this.state = 'live';
        this.setMeta(res.data);
        this.loadDoctors(id);
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) this.showNotFound();
        else this.state = 'error';
        return of(null);
      })
    );
  }

  private loadDoctors(id: string): void {
    // Reuses the public doctor search, so the same listing and schedule rules apply. Optional: on failure the
    // section is simply not shown.
    this.doctorSrv.search({ pageNumber: 1, pageSize: DOCTOR_PREVIEW, filter: { hospitalId: id } }).pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(res => {
      if (!res?.success || !res.data || this.clinic?.id !== id) return;
      this.doctors = res.data.items;
      this.doctorTotal = res.data.totalCount;
    });
  }

  private listingUrl(): UrlTree {
    const prev = this.router.getCurrentNavigation()?.previousNavigation?.finalUrl;
    const path = prev?.root.children['primary']?.segments.map(s => s.path).join('/');
    return prev && path === 'hospitals' ? prev : this.router.createUrlTree(['/hospitals']);
  }

  private showNotFound(): void {
    this.state = 'notfound';
    this.title.setTitle(`Clinic not found · ${SITE}`);
    this.meta.removeTag('name="description"');
  }

  private setMeta(c: PublicHospitalDetail): void {
    this.title.setTitle(`${c.name} · ${hospitalTypeLabel(c.hospitalType)} · ${SITE}`);
    const description = c.description ?? `${c.name}${this.addressLine ? ', ' + this.addressLine : ''}. Find a doctor here and request an appointment.`;
    this.meta.updateTag({ name: 'description', content: description });
  }
  // #endregion

  /** Rows are rebuilt by a getter on every check; tracking by label keeps the same DOM nodes. */
  trackByLabel(_: number, item: { label: string }): string {
    return item.label;
  }
}
