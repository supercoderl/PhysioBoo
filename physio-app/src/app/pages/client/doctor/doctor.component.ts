import { isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, ElementRef, OnInit, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { Subject, catchError, debounceTime, distinctUntilChanged, map, merge, of, switchMap, tap } from 'rxjs';
import { BooBreadcrumbComponent, BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent, BooFilterChipsComponent, BooPaginationComponent, BooSearchFieldComponent, BooSheetComponent } from '@physioboo/ui';
import { DoctorCardComponent } from '../../../components/layout/client/doctor/doctor-card.component';
import { PublicDoctorService } from '../../../services/public/public-doctor.service';
import { SharedModule } from '../../../shared/shared-imports';
import { GENERIC_PUBLIC_FAILURE, PublicFailure, describePublicFailure } from '../../../shared/utils/http.utils';
import { PublicDoctor, PublicOption } from '../../../shared/types/public-doctor.types';

type ListState = 'loading' | 'results' | 'empty' | 'error';

interface Query {
  q: string;
  specialty: string;
  facility: string;
  online: boolean;
  homeVisit: boolean;
  page: number;
}

interface Chip {
  label: string;
  remove: Partial<Query>;
}

// 12 fills the 3-, 2- and 1-column grids evenly.
const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 300;
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMPTY_QUERY: Query = { q: '', specialty: '', facility: '', online: false, homeVisit: false, page: 1 };

/**
 * Public doctor listing (design: Doctors Page / Doctor Listing, Direction A).
 * The URL is the single source of truth for search, filters and page, so refresh, back/forward and
 * shared links all restore the same results.
 */
@Component({
  selector: 'app-doctor',
  standalone: true,
  imports: [
    SharedModule, BooButtonComponent, DoctorCardComponent, BooEmptyStateComponent, BooErrorStateComponent, BooBreadcrumbComponent,
    BooSearchFieldComponent, BooFilterChipsComponent, BooPaginationComponent, BooSheetComponent
  ],
  templateUrl: './doctor.component.html'
})
export class DoctorComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly doctorSrv = inject(PublicDoctorService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  @ViewChild('filterButton', { read: ElementRef }) private filterButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('results') private results?: ElementRef<HTMLElement>;

  query: Query = { ...EMPTY_QUERY };
  qInput = '';
  state: ListState = 'loading';
  failure: PublicFailure = GENERIC_PUBLIC_FAILURE;
  doctors: PublicDoctor[] = [];
  total = 0;
  totalPages = 1;
  specialties: PublicOption[] = [];
  facilities: PublicOption[] = [];
  drawerOpen = false;

  readonly skeletons = Array.from({ length: 6 });

  /** True between a keystroke and its debounced search, so URL updates don't overwrite the input. */
  private typing = false;
  private readonly search$ = new Subject<string>();
  private readonly reload$ = new Subject<void>();

  ngOnInit(): void {
    // Server render shows the loading skeleton; data is fetched in the browser only.
    if (!this.isBrowser) return;

    this.doctorSrv.getFilterOptions().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        if (!res.success || !res.data) return;
        this.specialties = res.data.specialties;
        this.facilities = res.data.facilities;
      },
      // Without options the selects only offer "All"; the listing itself still works.
      error: () => { }
    });

    this.search$.pipe(
      map(v => v.trim()),
      debounceTime(SEARCH_DEBOUNCE_MS),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(q => {
      this.typing = false;
      if (q !== this.query.q) this.navigate({ q, page: 1 }, true);
    });

    // Every URL change (filters, paging, back/forward) and every retry runs one request; a newer one cancels the older.
    merge(
      this.route.queryParamMap.pipe(
        map(params => this.parse(params)),
        tap(q => {
          this.query = q;
          // Keep what the visitor is still typing; otherwise mirror the URL (e.g. after back/forward).
          if (!this.typing && this.qInput.trim() !== q.q) this.qInput = q.q;
        })
      ),
      this.reload$.pipe(map(() => this.query))
    ).pipe(
      switchMap(q => this.fetch(q)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  // #region Search and filters
  get searching(): boolean {
    return this.qInput.trim() !== this.query.q;
  }

  onSearchInput(value: string): void {
    this.qInput = value;
    this.typing = true;
    this.search$.next(value);
  }

  clearSearch(): void {
    this.qInput = '';
    this.typing = false;
    this.search$.next('');
    this.navigate({ q: '', page: 1 }, true);
  }

  setSpecialty(id: string): void {
    this.navigate({ specialty: id, page: 1 });
  }

  setFacility(id: string): void {
    this.navigate({ facility: id, page: 1 });
  }

  toggleOnline(): void {
    this.navigate({ online: !this.query.online, page: 1 });
  }

  toggleHomeVisit(): void {
    this.navigate({ homeVisit: !this.query.homeVisit, page: 1 });
  }

  clearAll(): void {
    this.qInput = '';
    this.typing = false;
    this.search$.next('');
    this.navigate({ ...EMPTY_QUERY });
  }

  get chips(): Chip[] {
    const q = this.query;
    const chips: Chip[] = [];
    if (q.q) chips.push({ label: `“${q.q}”`, remove: { q: '' } });
    if (q.specialty) chips.push({ label: this.nameOf(this.specialties, q.specialty, 'Selected specialty'), remove: { specialty: '' } });
    if (q.facility) chips.push({ label: this.nameOf(this.facilities, q.facility, 'Selected facility'), remove: { facility: '' } });
    if (q.online) chips.push({ label: 'Online consultation', remove: { online: false } });
    if (q.homeVisit) chips.push({ label: 'Home visit', remove: { homeVisit: false } });
    return chips;
  }

  removeChip(chip: Chip): void {
    if (chip.remove.q !== undefined) {
      this.qInput = '';
      this.typing = false;
      this.search$.next('');
    }
    this.navigate({ ...chip.remove, page: 1 });
  }

  retry(): void {
    this.reload$.next();
  }
  // #endregion

  // #region Labels
  get countLabel(): string {
    if (this.state === 'loading') return 'Loading doctors…';
    if (this.state === 'error') return 'Results unavailable';
    return this.plural(this.state === 'results' ? this.total : 0);
  }

  get showLabel(): string {
    return `Show ${this.plural(this.state === 'results' ? this.total : 0)}`;
  }

  get filterButtonLabel(): string {
    const n = this.chips.length;
    return n ? `Filters (${n})` : 'Filters';
  }

  private plural(n: number): string {
    return `${n} ${n === 1 ? 'doctor' : 'doctors'}`;
  }
  // #endregion

  // #region Pagination
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.query.page) return;
    this.navigate({ page });
    this.results?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  // #endregion

  // #region Mobile filter drawer
  /** The sheet returns focus here when it closes. */
  get filterButtonElement(): HTMLElement | undefined {
    return this.filterButton?.nativeElement;
  }

  openDrawer(): void {
    this.drawerOpen = true;
  }

  closeDrawer(): void {
    this.drawerOpen = false;
  }
  // #endregion

  // #region Data
  private fetch(q: Query) {
    this.state = 'loading';
    return this.doctorSrv.search({
      pageNumber: q.page,
      pageSize: PAGE_SIZE,
      search: q.q || undefined,
      filter: {
        specialtyId: q.specialty || undefined,
        hospitalId: q.facility || undefined,
        online: q.online || undefined,
        homeVisit: q.homeVisit || undefined,
      }
    }).pipe(
      tap(res => {
        if (!res.success || !res.data) {
          this.failure = GENERIC_PUBLIC_FAILURE;
          this.state = 'error';
          return;
        }
        this.doctors = res.data.items;
        this.total = res.data.totalCount;
        this.totalPages = Math.max(1, Math.ceil(res.data.totalCount / PAGE_SIZE));
        this.state = this.doctors.length ? 'results' : 'empty';
        // A page past the end (e.g. an old link) falls back to the last page that has results.
        if (!this.doctors.length && q.page > 1 && this.total > 0) this.navigate({ page: this.totalPages }, true);
      }),
      catchError(err => {
        this.failure = describePublicFailure(err, 'doctor search');
        this.state = 'error';
        return of(null);
      })
    );
  }

  private parse(params: ParamMap): Query {
    const id = (key: string) => {
      const v = params.get(key) ?? '';
      return GUID.test(v) ? v : '';
    };
    const page = Number.parseInt(params.get('page') ?? '1', 10);
    return {
      q: (params.get('q') ?? '').trim().slice(0, 100),
      specialty: id('specialty'),
      facility: id('facility'),
      online: params.get('online') === '1',
      homeVisit: params.get('homeVisit') === '1',
      page: Number.isFinite(page) && page > 0 ? page : 1,
    };
  }

  /** Writes the query to the URL; the queryParamMap subscription then loads the results. */
  private navigate(patch: Partial<Query>, replaceUrl = false): void {
    const q = { ...this.query, ...patch };
    const queryParams: Params = {
      q: q.q || null,
      specialty: q.specialty || null,
      facility: q.facility || null,
      online: q.online ? '1' : null,
      homeVisit: q.homeVisit ? '1' : null,
      page: q.page > 1 ? q.page : null,
    };
    this.router.navigate([], { relativeTo: this.route, queryParams, replaceUrl });
  }

  trackById(_: number, d: PublicDoctor): string {
    return d.id;
  }

  private nameOf(options: PublicOption[], id: string, fallback: string): string {
    return options.find(o => o.id === id)?.name ?? fallback;
  }
  // #endregion
}
