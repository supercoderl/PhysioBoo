import { isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, ElementRef, OnInit, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, catchError, map, of, startWith, switchMap } from 'rxjs';
import { BooButtonComponent, BooEmptyStateComponent, BooInlineErrorComponent, BooInlineErrorState } from '@physioboo/ui';
import { ArticleCardComponent } from '../../../components/layout/client/article/article-card.component';
import { DoctorCardComponent } from '../../../components/layout/client/doctor/doctor-card.component';
import { ClinicCardComponent } from '../../../components/layout/client/hospital/clinic-card.component';
import { PublicArticleService } from '../../../services/public/public-article.service';
import { PublicDoctorService } from '../../../services/public/public-doctor.service';
import { PublicHospitalService } from '../../../services/public/public-hospital.service';
import { PublicSiteService } from '../../../services/public/public-site.service';
import { CLIENT_TENANT } from '../../../shared/data/client-site';
import { SharedModule } from '../../../shared/shared-imports';
import { PagedResponse, PaginationData } from '../../../shared/types/common';
import { PublicArticle } from '../../../shared/types/public-article.types';
import { PublicDoctor, PublicOption } from '../../../shared/types/public-doctor.types';
import { PublicHospital } from '../../../shared/types/public-hospital.types';
import { PublicSiteProfile } from '../../../shared/types/public-site.types';
import { telHref } from '../../../shared/utils/contact.utils';
import { HomeHeroMediaComponent } from './home-hero-media.component';
import { HomeRequestStripComponent } from './home-request-strip.component';
import {
  HOME_ARTICLE_COUNT,
  HOME_CLINIC_COUNT,
  HOME_DOCTOR_COUNT,
  HOME_FAQS,
  HOME_POPULAR_COUNT,
  HOME_REASONS,
  HOME_SPECIALTY_COUNT,
  HOME_STEPS,
  HOME_TESTIMONIALS,
  specialtyIcon,
} from './home.data';

const MAX_SEARCH_LENGTH = 100;

/** One API-backed section. `error` keeps the section with a retry; it never turns into an empty state. */
export interface HomeSection<T> {
  state: 'loading' | 'results' | 'empty' | 'error';
  items: T[];
  /** State of the section's InlineError while it is in `error`. */
  retry: BooInlineErrorState;
}

export interface HomeSpecialty extends PublicOption {
  icon: string;
}

export type HomeSectionKey = 'specialties' | 'doctors' | 'clinics' | 'articles';

function loadingSection<T>(): HomeSection<T> {
  return { state: 'loading', items: [], retry: 'default' };
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    SharedModule,
    BooButtonComponent,
    BooInlineErrorComponent,
    BooEmptyStateComponent,
    DoctorCardComponent,
    ClinicCardComponent,
    ArticleCardComponent,
    HomeHeroMediaComponent,
    HomeRequestStripComponent,
  ],
  templateUrl: './home.component.html',
  styles: `
    .ph-stripes { background: repeating-linear-gradient(135deg, #F3EAED 0 10px, #F9F4F6 10px 20px); }
    .no-scrollbar { scrollbar-width: none; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
  `
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly doctorSrv = inject(PublicDoctorService);
  private readonly hospitalSrv = inject(PublicHospitalService);
  private readonly articleSrv = inject(PublicArticleService);
  private readonly siteSrv = inject(PublicSiteService);

  @ViewChild('searchInput') private searchInput?: ElementRef<HTMLInputElement>;

  readonly tenant = CLIENT_TENANT;
  /** Contact details and hero photo; the static defaults until the tenant profile loads, and if it fails. */
  profile: PublicSiteProfile = { phone: CLIENT_TENANT.phone, email: CLIENT_TENANT.email, hero: null };
  readonly steps = HOME_STEPS;
  readonly reasons = HOME_REASONS;
  readonly faqs = HOME_FAQS;
  readonly testimonials = HOME_TESTIMONIALS;
  readonly maxSearchLength = MAX_SEARCH_LENGTH;
  readonly doctorSkeletons = Array.from({ length: HOME_DOCTOR_COUNT });
  readonly clinicSkeletons = Array.from({ length: HOME_CLINIC_COUNT });
  readonly articleSkeletons = Array.from({ length: HOME_ARTICLE_COUNT });
  readonly specialtySkeletons = Array.from({ length: HOME_SPECIALTY_COUNT });

  specialties: HomeSection<HomeSpecialty> = loadingSection();
  doctors: HomeSection<PublicDoctor> = loadingSection();
  clinics: HomeSection<PublicHospital> = loadingSection();
  articles: HomeSection<PublicArticle> = loadingSection();

  q = '';
  /** Set when Search is pressed with nothing typed; cleared once the visitor types. */
  emptySubmit = false;
  openFaq = 0;

  private readonly reload: Record<HomeSectionKey, Subject<void>> = {
    specialties: new Subject<void>(),
    doctors: new Subject<void>(),
    clinics: new Subject<void>(),
    articles: new Subject<void>(),
  };

  ngOnInit(): void {
    // The router has no anchor scrolling, so links like /#specialties are handled here.
    this.route.fragment
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(fragment => {
        if (!this.isBrowser || !fragment) return;
        setTimeout(() => document.getElementById(fragment)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      });

    // Server render shows the skeletons; data is fetched in the browser only, like the listing pages.
    if (!this.isBrowser) return;

    // A failed profile leaves the defaults in place: the page then shows the motif and the contact-page link.
    this.siteSrv.getProfile()
      .pipe(takeUntilDestroyed(this.destroyRef), catchError(() => of(null)))
      .subscribe(profile => { if (profile) this.profile = profile; });

    this.track('specialties', () => this.doctorSrv.getFilterOptions().pipe(
      map(res => this.unwrap(res).specialties.slice(0, HOME_SPECIALTY_COUNT).map(s => ({ ...s, icon: specialtyIcon(s.name) })))
    ));
    this.track('doctors', () => this.doctorSrv.search({ pageNumber: 1, pageSize: HOME_DOCTOR_COUNT }).pipe(
      map(res => this.page(res))
    ));
    this.track('clinics', () => this.hospitalSrv.search({ pageNumber: 1, pageSize: HOME_CLINIC_COUNT }).pipe(
      map(res => this.page(res))
    ));
    this.track('articles', () => this.articleSrv.search({
      pageNumber: 1,
      pageSize: HOME_ARTICLE_COUNT,
      sort: '-publishDate',
      filter: { start: '', end: '', category: null, status: null },
    }).pipe(
      map(res => this.page(res))
    ));
  }

  get phoneHref(): string {
    return this.profile.phone ? telHref(this.profile.phone) : '';
  }

  // #region Search
  /** First specialties from the API; hidden while they load or if the request failed. */
  get popular(): string[] {
    return this.specialties.state === 'results' ? this.specialties.items.slice(0, HOME_POPULAR_COUNT).map(s => s.name) : [];
  }

  onQueryChange(value: string): void {
    this.q = value;
    if (value.trim()) this.emptySubmit = false;
  }

  /** Hands the keyword to the Search page, which looks across doctors, services, clinics and articles. */
  submitSearch(event: Event): void {
    event.preventDefault();
    const q = this.q.trim().slice(0, MAX_SEARCH_LENGTH);
    if (!q) {
      this.emptySubmit = true;
      this.searchInput?.nativeElement.focus();
      return;
    }
    this.router.navigate(['/search'], { queryParams: { q } });
  }

  searchFor(term: string): void {
    this.router.navigate(['/search'], { queryParams: { q: term } });
  }
  // #endregion

  retry(section: HomeSectionKey): void {
    this[section].retry = 'retrying';
    this.reload[section].next();
  }

  toggleFaq(index: number) {
    this.openFaq = this.openFaq === index ? -1 : index;
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }

  // #region Data
  /** Runs a section's request now and again on each retry; a newer request cancels an older one. */
  private track<K extends HomeSectionKey>(key: K, request: () => Observable<HomeComponent[K]['items']>): void {
    this.reload[key].pipe(
      startWith(undefined),
      switchMap(() => request().pipe(
        map(items => ({ ok: true as const, items })),
        catchError(() => of({ ok: false as const, items: [] }))
      )),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(result => {
      const section = this[key] as HomeSection<unknown>;
      if (result.ok) {
        section.items = result.items;
        section.state = result.items.length ? 'results' : 'empty';
        section.retry = 'default';
      } else {
        // A second failure after Try again says so, instead of looking unchanged.
        section.retry = section.state === 'error' ? 'failed' : 'default';
        section.state = 'error';
      }
    });
  }

  /** A response the API marks unsuccessful is a failure, never an empty result. */
  private unwrap<T>(res: PagedResponse<T>): T {
    if (!res?.success || !res.data) throw new Error('Request was not successful');
    return res.data;
  }

  private page<T>(res: PagedResponse<PaginationData<T>>): T[] {
    return this.unwrap(res).items ?? [];
  }
  // #endregion
}
