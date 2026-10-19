import { isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, ElementRef, HostListener, OnDestroy, OnInit, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { Subject, catchError, debounceTime, distinctUntilChanged, map, merge, of, switchMap, tap } from 'rxjs';
import { ClinicCardComponent } from '../../../components/layout/client/hospital/clinic-card.component';
import { PublicHospitalService } from '../../../services/public/public-hospital.service';
import { HOSPITAL_TYPE_LABELS, HospitalType } from '../../../shared/enums/hospital-type';
import { BooButtonComponent } from '../../../components/button/boo-button/boo-button.component';
import { EmptyStateComponent } from '../../../components/ui/empty-state.component';
import { ErrorStateComponent } from '../../../components/ui/error-state.component';
import { SharedModule } from '../../../shared/shared-imports';
import { PublicHospital } from '../../../shared/types/public-hospital.types';

type ListState = 'loading' | 'results' | 'empty' | 'error';

interface Query {
  q: string;
  /** HospitalType as a string ('' = all), so it binds to the select directly. */
  type: string;
  page: number;
}

interface Chip {
  label: string;
  remove: Partial<Query>;
}

// 12 fills the 3-, 2- and 1-column grids evenly.
const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 300;
const EMPTY_QUERY: Query = { q: '', type: '', page: 1 };

// The facility types a physiotherapy network lists most, in the design's order.
const TYPE_OPTIONS = [HospitalType.Rehabilitation, HospitalType.Clinic, HospitalType.Specialty, HospitalType.General]
  .map(v => ({ value: String(v), label: HOSPITAL_TYPE_LABELS[v] }));

/**
 * Public clinic listing (design: Clinics Page / Clinic Listing).
 * Same model as the doctor listing: the URL is the single source of truth for search, type and page.
 */
@Component({
  selector: 'app-hospital',
  standalone: true,
  imports: [SharedModule, BooButtonComponent, ClinicCardComponent, EmptyStateComponent, ErrorStateComponent],
  templateUrl: './hospital.component.html'
})
export class HospitalComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly hospitalSrv = inject(PublicHospitalService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  @ViewChild('drawerClose', { read: ElementRef }) private drawerClose?: ElementRef<HTMLButtonElement>;
  @ViewChild('filterButton', { read: ElementRef }) private filterButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('results') private results?: ElementRef<HTMLElement>;

  query: Query = { ...EMPTY_QUERY };
  qInput = '';
  state: ListState = 'loading';
  hospitals: PublicHospital[] = [];
  total = 0;
  totalPages = 1;
  drawerOpen = false;

  readonly typeOptions = TYPE_OPTIONS;
  readonly skeletons = Array.from({ length: 6 });

  /** True between a keystroke and its debounced search, so URL updates don't overwrite the input. */
  private typing = false;
  private readonly search$ = new Subject<string>();
  private readonly reload$ = new Subject<void>();

  ngOnInit(): void {
    // Server render shows the loading skeleton; data is fetched in the browser only.
    if (!this.isBrowser) return;

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

  ngOnDestroy(): void {
    this.lockScroll(false);
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

  setType(type: string): void {
    this.navigate({ type, page: 1 });
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
    if (q.type) chips.push({ label: HOSPITAL_TYPE_LABELS[Number(q.type) as HospitalType], remove: { type: '' } });
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
    if (this.state === 'loading') return 'Loading clinics…';
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
    return `${n} ${n === 1 ? 'clinic' : 'clinics'}`;
  }
  // #endregion

  // #region Pagination
  /** Page numbers to render; `null` is an ellipsis. Short lists show every page. */
  get pages(): (number | null)[] {
    const total = this.totalPages, current = this.query.page;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const set = new Set([1, total, current - 1, current, current + 1].filter(p => p >= 1 && p <= total));
    const sorted = [...set].sort((a, b) => a - b);
    const out: (number | null)[] = [];
    sorted.forEach((p, i) => {
      if (i > 0 && p - sorted[i - 1] > 1) out.push(null);
      out.push(p);
    });
    return out;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.query.page) return;
    this.navigate({ page });
    this.results?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  // #endregion

  // #region Mobile filter drawer
  openDrawer(): void {
    this.drawerOpen = true;
    this.lockScroll(true);
    setTimeout(() => this.drawerClose?.nativeElement.focus());
  }

  @HostListener('document:keydown.escape')
  closeDrawer(): void {
    if (!this.drawerOpen) return;
    this.drawerOpen = false;
    this.lockScroll(false);
    setTimeout(() => this.filterButton?.nativeElement.focus());
  }

  private lockScroll(lock: boolean): void {
    if (this.isBrowser) document.body.style.overflow = lock ? 'hidden' : '';
  }
  // #endregion

  // #region Data
  private fetch(q: Query) {
    this.state = 'loading';
    return this.hospitalSrv.search({
      pageNumber: q.page,
      pageSize: PAGE_SIZE,
      search: q.q || undefined,
      filter: { type: q.type ? Number(q.type) as HospitalType : undefined }
    }).pipe(
      tap(res => {
        if (!res.success || !res.data) {
          this.state = 'error';
          return;
        }
        this.hospitals = res.data.items;
        this.total = res.data.totalCount;
        this.totalPages = Math.max(1, Math.ceil(res.data.totalCount / PAGE_SIZE));
        this.state = this.hospitals.length ? 'results' : 'empty';
        // A page past the end (e.g. an old link) falls back to the last page that has results.
        if (!this.hospitals.length && q.page > 1 && this.total > 0) this.navigate({ page: this.totalPages }, true);
      }),
      catchError(() => {
        this.state = 'error';
        return of(null);
      })
    );
  }

  private parse(params: ParamMap): Query {
    const type = params.get('type') ?? '';
    const page = Number.parseInt(params.get('page') ?? '1', 10);
    return {
      q: (params.get('q') ?? '').trim().slice(0, 100),
      type: Object.prototype.hasOwnProperty.call(HOSPITAL_TYPE_LABELS, type) ? type : '',
      page: Number.isFinite(page) && page > 0 ? page : 1,
    };
  }

  /** Writes the query to the URL; the queryParamMap subscription then loads the results. */
  private navigate(patch: Partial<Query>, replaceUrl = false): void {
    const q = { ...this.query, ...patch };
    const queryParams: Params = {
      q: q.q || null,
      type: q.type || null,
      page: q.page > 1 ? q.page : null,
    };
    this.router.navigate([], { relativeTo: this.route, queryParams, replaceUrl });
  }

  trackById(_: number, h: PublicHospital): string {
    return h.id;
  }
  // #endregion

  /** Rows are rebuilt by a getter on every check; tracking by label keeps the same DOM nodes. */
  trackByLabel(_: number, item: { label: string }): string {
    return item.label;
  }
}
