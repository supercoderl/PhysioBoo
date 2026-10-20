import { formatDate, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, ElementRef, LOCALE_ID, OnInit, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { EMPTY, Observable, Subject, catchError, map, merge, mergeMap, of, switchMap, takeUntil, tap, throwError } from 'rxjs';
import { BooBreadcrumbComponent, BooButtonComponent, BooFilterChipsComponent, BooInlineErrorComponent, BooInlineErrorState, BooPaginationComponent, BooSheetComponent } from '@physioboo/ui';
import { PublicArticleService } from '../../../services/public/public-article.service';
import { PublicDoctorService } from '../../../services/public/public-doctor.service';
import { PublicHospitalService } from '../../../services/public/public-hospital.service';
import { PublicServiceService } from '../../../services/public/public-service.service';
import { ArticleCategory } from '../../../shared/enums/article';
import { HOSPITAL_TYPE_LABELS, HospitalType, hospitalTypeLabel } from '../../../shared/enums/hospital-type';
import { PagedResponse, PaginationData } from '../../../shared/types/common';
import { PublicArticle } from '../../../shared/types/public-article.types';
import { PublicDoctor, PublicOption } from '../../../shared/types/public-doctor.types';
import { PublicHospital } from '../../../shared/types/public-hospital.types';
import { PublicService } from '../../../shared/types/public-service.types';
import { SharedModule } from '../../../shared/shared-imports';
import { SearchResultComponent, SearchResultRow } from './search-result.component';

type Kind = 'doctors' | 'services' | 'clinics' | 'articles';
type Tab = 'all' | Kind;
type TabState = 'loading' | 'results' | 'empty' | 'error';

interface Filters {
  specialty: string;
  clinic: string;
  online: boolean;
  home: boolean;
  type: string;
  category: string;
}

interface Query extends Filters {
  q: string;
  tab: Tab;
  page: number;
}

/** One type's slice of the All tab. A failed section keeps `status: 'error'` while it retries. */
interface Section {
  status: 'loading' | 'ok' | 'error';
  total: number;
  rows: SearchResultRow[];
  retry: BooInlineErrorState;
}

interface Chip {
  label: string;
  remove: Partial<Filters>;
}

interface Page {
  total: number;
  rows: SearchResultRow[];
}

const KINDS: Kind[] = ['doctors', 'services', 'clinics', 'articles'];
const TITLES: Record<Kind, string> = { doctors: 'Doctors', services: 'Services', clinics: 'Clinics', articles: 'Articles' };
const NOUN: Record<Kind, [string, string]> = {
  doctors: ['doctor', 'doctors'],
  services: ['service', 'services'],
  clinics: ['clinic', 'clinics'],
  articles: ['article', 'articles'],
};
/** Which filters each tab owns; changing tab drops the others. */
const TAB_FILTERS: Record<Kind, (keyof Filters)[]> = {
  doctors: ['specialty', 'clinic', 'online', 'home'],
  services: ['clinic'],
  clinics: ['type'],
  articles: ['category'],
};

// The All tab shows the first few of each type; category tabs page like the Blog page.
const ALL_PAGE_SIZE = 3;
const PAGE_SIZE = 12;
const MAX_SEARCH_LENGTH = 100;
const POPULAR_COUNT = 3;
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NO_FILTERS: Filters = { specialty: '', clinic: '', online: false, home: false, type: '', category: '' };
const TYPE_OPTIONS = [HospitalType.Rehabilitation, HospitalType.Clinic, HospitalType.Specialty, HospitalType.General]
  .map(v => ({ id: String(v), name: HOSPITAL_TYPE_LABELS[v] }));
const CATEGORY_OPTIONS = Object.keys(ArticleCategory).filter(k => Number.isNaN(Number(k))).map(k => ({ id: k, name: k }));

/**
 * Public site-wide search (design: Search Page / Search, frames 13a–13e).
 * There is no unified search API: the All tab calls the four existing search endpoints in parallel
 * and each section fails on its own. The URL is the single source of truth for query, tab, filters and page.
 */
@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    BooButtonComponent, SharedModule, SearchResultComponent, BooInlineErrorComponent, BooBreadcrumbComponent,
    BooFilterChipsComponent, BooPaginationComponent, BooSheetComponent
  ],
  templateUrl: './search.component.html',
})
export class SearchComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly doctorSrv = inject(PublicDoctorService);
  private readonly serviceSrv = inject(PublicServiceService);
  private readonly hospitalSrv = inject(PublicHospitalService);
  private readonly articleSrv = inject(PublicArticleService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly locale = inject(LOCALE_ID);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  @ViewChild('searchInput') private searchInput?: ElementRef<HTMLInputElement>;
  @ViewChild('filterButton', { read: ElementRef }) private filterButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('results') private results?: ElementRef<HTMLElement>;

  readonly kinds = KINDS;
  readonly titles = TITLES;
  readonly tabs: { key: Tab; label: string }[] = [{ key: 'all', label: 'All' }, ...KINDS.map(k => ({ key: k as Tab, label: TITLES[k] }))];
  readonly typeOptions = TYPE_OPTIONS;
  readonly categoryOptions = CATEGORY_OPTIONS;
  readonly skeletons = Array.from({ length: 4 });
  readonly browse = [
    { label: 'Doctors', icon: 'stethoscope', link: '/doctor' },
    { label: 'Services', icon: 'heart-pulse', link: '/services' },
    { label: 'Clinics and hospitals', icon: 'building-2', link: '/hospitals' },
    { label: 'Health articles', icon: 'newspaper', link: '/blog' },
  ];

  query: Query = { ...NO_FILTERS, q: '', tab: 'all', page: 1 };
  qInput = '';
  /** Shown after pressing Search with nothing typed. */
  hint = false;

  overview: Record<Kind, Section> = this.blankOverview();
  tabState: TabState = 'loading';
  tabRows: SearchResultRow[] = [];
  tabTotal = 0;
  totalPages = 1;

  specialties: PublicOption[] = [];
  facilities: PublicOption[] = [];
  serviceClinics: PublicOption[] = [];

  sheetOpen = false;
  /** Mobile sheet edits a copy; the URL only changes on "Show results". */
  draft: Filters = { ...NO_FILTERS };

  /** The keyword the overview was last loaded for; changing tab or filters reuses it. */
  private overviewQ = '';
  private readonly overview$ = new Subject<string>();
  private readonly sectionRetry$ = new Subject<Kind>();
  private readonly tab$ = new Subject<Query | null>();

  ngOnInit(): void {
    // Server render shows the initial or loading state; data is fetched in the browser only.
    if (!this.isBrowser) {
      this.query = this.parse(this.route.snapshot.queryParamMap);
      this.qInput = this.query.q;
      return;
    }

    this.loadFilterOptions();

    this.overview$.pipe(
      tap(q => this.overviewQ = q),
      switchMap(q => q ? this.loadOverview(q) : EMPTY),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();

    // A section retry is dropped if a new keyword starts loading meanwhile.
    this.sectionRetry$.pipe(
      mergeMap(k => this.loadSection(k, this.overviewQ).pipe(takeUntil(this.overview$))),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();

    this.tab$.pipe(
      switchMap(q => q ? this.loadTab(q) : EMPTY),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();

    this.route.queryParamMap.pipe(
      map(params => this.parse(params)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(q => {
      this.query = q;
      this.qInput = q.q;
      this.hint = false;
      if (!q.q) {
        this.overview$.next('');
        this.tab$.next(null);
        return;
      }
      if (q.q !== this.overviewQ) this.overview$.next(q.q);
      this.tab$.next(q.tab === 'all' ? null : q);
    });
  }

  // #region Search
  get submitted(): boolean {
    return !!this.query.q;
  }

  submit(event?: Event): void {
    event?.preventDefault();
    const q = this.qInput.trim().slice(0, MAX_SEARCH_LENGTH);
    if (!q) {
      // Nothing typed: no navigation, no request. Focus stays in the field and the guidance shows.
      this.hint = true;
      this.searchInput?.nativeElement.focus();
      return;
    }
    if (q === this.query.q) {
      // Same keyword: nothing to navigate to, but a failed request is worth repeating.
      this.qInput = q;
      if (this.view === 'error') this.retry();
      return;
    }
    // A new keyword keeps the tab but not its filters, which may not apply to the new results.
    this.navigate({ ...NO_FILTERS, q, tab: this.query.tab, page: 1 });
  }

  searchFor(term: string): void {
    this.navigate({ ...NO_FILTERS, q: term.slice(0, MAX_SEARCH_LENGTH), tab: 'all', page: 1 });
  }

  onInput(value: string): void {
    this.qInput = value;
    this.hint = false;
  }

  /** "Clear search" and the × in the field both reset to the initial state. */
  clear(): void {
    this.qInput = '';
    this.hint = false;
    if (this.query.q) this.navigate({ ...NO_FILTERS, q: '', tab: 'all', page: 1 });
    setTimeout(() => this.searchInput?.nativeElement.focus());
  }

  get popular(): string[] {
    return this.specialties.slice(0, POPULAR_COUNT).map(s => s.name);
  }
  // #endregion

  // #region Tabs
  selectTab(tab: Tab): void {
    if (tab === this.query.tab) return;
    this.navigate({ ...NO_FILTERS, q: this.query.q, tab, page: 1 });
  }

  /** Arrow keys move between tabs (and select them, since each tab is its own URL). */
  onTabKey(event: KeyboardEvent): void {
    const i = this.tabs.findIndex(t => t.key === this.query.tab);
    const next = event.key === 'ArrowRight' ? i + 1 : event.key === 'ArrowLeft' ? i - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? this.tabs.length - 1 : -2;
    if (next === -2) return;
    event.preventDefault();
    const tab = this.tabs[(next + this.tabs.length) % this.tabs.length].key;
    this.selectTab(tab);
    setTimeout(() => document.getElementById('sr-tab-' + tab)?.focus());
  }

  seeAllParams(kind: Kind): Params {
    return { q: this.query.q, type: kind };
  }

  /** Null hides the badge: the count is unknown while loading or after a failure. */
  tabCount(tab: Tab): number | null {
    if (tab === 'all') {
      if (this.overviewLoading || this.overviewFailed) return null;
      return KINDS.reduce((n, k) => n + (this.overview[k].status === 'ok' ? this.overview[k].total : 0), 0);
    }
    if (tab === this.query.tab) return this.tabState === 'results' || this.tabState === 'empty' ? this.tabTotal : null;
    return this.overview[tab].status === 'ok' ? this.overview[tab].total : null;
  }
  // #endregion

  // #region All tab
  get overviewLoading(): boolean {
    return KINDS.some(k => this.overview[k].status === 'loading');
  }

  get overviewFailed(): boolean {
    return KINDS.every(k => this.overview[k].status === 'error');
  }

  get overviewPartial(): boolean {
    return !this.overviewFailed && KINDS.some(k => this.overview[k].status === 'error');
  }

  get overviewTotal(): number {
    return KINDS.reduce((n, k) => n + (this.overview[k].status === 'ok' ? this.overview[k].total : 0), 0);
  }

  /** Sections to render: failed ones (as InlineError) and ones with results. */
  get sections(): Kind[] {
    return KINDS.filter(k => this.overview[k].status === 'error' || this.overview[k].total > 0);
  }

  retrySection(kind: Kind): void {
    this.overview[kind].retry = 'retrying';
    this.sectionRetry$.next(kind);
  }
  // #endregion

  // #region State
  get view(): 'loading' | 'error' | 'empty' | 'results' {
    if (this.query.tab === 'all') {
      if (this.overviewLoading) return 'loading';
      if (this.overviewFailed) return 'error';
      return this.sections.length ? 'results' : 'empty';
    }
    return this.tabState;
  }

  retry(): void {
    if (this.query.tab === 'all') this.overview$.next(this.query.q);
    else this.tab$.next(this.query);
  }

  get summary(): string {
    const view = this.view;
    if (view === 'loading') return 'Searching…';
    if (view === 'error') return 'Results couldn’t be loaded';
    if (this.query.tab === 'all' && this.overviewPartial) return 'Some results couldn’t be loaded';
    const n = this.query.tab === 'all' ? this.overviewTotal : this.tabTotal;
    if (!n) return 'No results';
    return `${n} ${n === 1 ? 'result' : 'results'}${this.query.tab === 'all' ? '' : ' in ' + NOUN[this.query.tab][1]}`;
  }

  get tabCountLabel(): string {
    const tab = this.query.tab;
    if (tab === 'all' || this.tabState === 'loading') return '';
    return this.plural(tab, this.tabTotal);
  }

  get pagerLabel(): string {
    const from = (this.query.page - 1) * PAGE_SIZE + 1;
    const to = from + this.tabRows.length - 1;
    return `Showing ${from}–${to} of ${this.tabTotal}`;
  }

  /** On a category tab with no matches: other tabs that do have some, as shortcuts. */
  get otherTabs(): { kind: Kind; label: string }[] {
    if (this.query.tab === 'all') return [];
    return KINDS
      .filter(k => k !== this.query.tab && this.overview[k].status === 'ok' && this.overview[k].total > 0)
      .map(k => ({ kind: k, label: `${this.overview[k].total} in ${NOUN[k][1]}` }));
  }

  get emptyBody(): string {
    return this.chips.length
      ? 'Try removing a filter, using a different keyword, or explore our doctors and clinics.'
      : 'Try a different keyword or explore our doctors and clinics.';
  }

  plural(kind: Kind, n: number): string {
    return `${n} ${NOUN[kind][n === 1 ? 0 : 1]}`;
  }

  noun(tab: Tab): string {
    return tab === 'all' ? 'results' : NOUN[tab][1];
  }
  // #endregion

  // #region Filters
  get hasFilters(): boolean {
    return this.query.tab !== 'all';
  }

  setFilter(patch: Partial<Filters>): void {
    this.navigate({ ...this.query, ...patch, page: 1 });
  }

  get chips(): Chip[] {
    const tab = this.query.tab;
    if (tab === 'all') return [];
    const q = this.query;
    const clinics = tab === 'services' ? this.serviceClinics : this.facilities;
    const label: Record<keyof Filters, () => string> = {
      specialty: () => this.nameOf(this.specialties, q.specialty, 'Selected specialty'),
      clinic: () => this.nameOf(clinics, q.clinic, 'Selected clinic'),
      online: () => 'Online consultation',
      home: () => 'Home visits',
      type: () => hospitalTypeLabel(Number(q.type)),
      category: () => q.category,
    };
    return TAB_FILTERS[tab].filter(k => q[k]).map(k => ({ label: label[k](), remove: { [k]: NO_FILTERS[k] } }));
  }

  removeChip(chip: Chip): void {
    this.setFilter(chip.remove);
  }

  clearFilters(): void {
    this.setFilter({ ...NO_FILTERS });
  }

  get filterButtonLabel(): string {
    const n = this.chips.length;
    return n ? `Filters (${n})` : 'Filters';
  }
  // #endregion

  // #region Mobile filter sheet
  /** The sheet returns focus here when it closes. */
  get filterButtonElement(): HTMLElement | undefined {
    return this.filterButton?.nativeElement;
  }

  openSheet(): void {
    this.draft = this.pickFilters(this.query);
    this.sheetOpen = true;
  }

  closeSheet(): void {
    this.sheetOpen = false;
  }

  applySheet(): void {
    const draft = this.draft;
    this.closeSheet();
    this.setFilter(draft);
  }

  clearDraft(): void {
    this.draft = { ...NO_FILTERS };
  }
  // #endregion

  // #region Pagination
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.query.page) return;
    this.navigate({ ...this.query, page });
    this.results?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  // #endregion

  // #region Data
  private loadFilterOptions(): void {
    // Without options the selects only offer "All" and popular searches are hidden; search itself still works.
    this.doctorSrv.getFilterOptions().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        if (!res.success || !res.data) return;
        this.specialties = res.data.specialties;
        this.facilities = res.data.facilities;
      },
      error: () => { }
    });
    this.serviceSrv.getFilterOptions().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        if (res.success && res.data) this.serviceClinics = res.data.clinics;
      },
      error: () => { }
    });
  }

  private loadOverview(q: string): Observable<unknown> {
    this.overview = this.blankOverview();
    return merge(...KINDS.map(k => this.loadSection(k, q)));
  }

  private loadSection(kind: Kind, q: string): Observable<unknown> {
    return this.request(kind, { ...NO_FILTERS, q, tab: kind, page: 1 }, ALL_PAGE_SIZE).pipe(
      tap(p => this.overview[kind] = { status: 'ok', total: p.total, rows: p.rows, retry: 'default' }),
      catchError(() => {
        const retried = this.overview[kind].retry === 'retrying';
        this.overview[kind] = { status: 'error', total: 0, rows: [], retry: retried ? 'failed' : 'default' };
        return EMPTY;
      })
    );
  }

  private loadTab(q: Query): Observable<unknown> {
    this.tabState = 'loading';
    return this.request(q.tab as Kind, q, PAGE_SIZE).pipe(
      tap(p => {
        this.tabTotal = p.total;
        this.totalPages = Math.max(1, Math.ceil(p.total / PAGE_SIZE));
        // A page past the end (e.g. an old link) falls back to the last page that has results.
        if (!p.rows.length && q.page > 1 && p.total > 0) {
          this.navigate({ ...q, page: this.totalPages }, true);
          return;
        }
        this.tabRows = p.rows;
        this.tabState = p.rows.length ? 'results' : 'empty';
      }),
      catchError(() => {
        this.tabState = 'error';
        return of(null);
      })
    );
  }

  /** One page of one type, mapped to result rows. Errors (including `success: false`) are thrown. */
  private request(kind: Kind, q: Query, pageSize: number): Observable<Page> {
    const paging = { pageNumber: q.page, pageSize, search: q.q };
    const page = <T>(source: Observable<PagedResponse<PaginationData<T>>>, row: (x: T) => SearchResultRow) => source.pipe(
      switchMap(res => res.success && res.data
        ? of({ total: res.data.totalCount, rows: res.data.items.map(row) })
        : throwError(() => new Error('Search failed')))
    );
    switch (kind) {
      case 'doctors':
        return page(this.doctorSrv.search({
          ...paging,
          filter: {
            specialtyId: q.specialty || undefined,
            hospitalId: q.clinic || undefined,
            online: q.online || undefined,
            homeVisit: q.home || undefined,
          }
        }), d => this.doctorRow(d));
      case 'services':
        return page(this.serviceSrv.search({ ...paging, filter: { hospitalId: q.clinic || undefined } }), s => this.serviceRow(s));
      case 'clinics':
        return page(this.hospitalSrv.search({ ...paging, filter: { type: q.type ? Number(q.type) as HospitalType : undefined } }), h => this.clinicRow(h));
      case 'articles': {
        const category = q.category ? ArticleCategory[q.category as keyof typeof ArticleCategory] : null;
        return page(this.articleSrv.search({ ...paging, sort: '-publishDate', filter: { start: '', end: '', category, status: null } }), a => this.articleRow(a));
      }
    }
  }

  private doctorRow(d: PublicDoctor): SearchResultRow {
    const fac = d.facilities ?? [];
    return {
      kind: 'doctor', id: d.id, title: d.fullName, subtitle: d.specialty ?? '',
      lines: fac.length ? [fac[0] + (fac.length > 1 ? ` · +${fac.length - 1} more` : '')] : [],
      tags: [
        ...(d.isAvailableOnline ? [{ icon: 'video', label: 'Online consultation' }] : []),
        ...(d.isAvailableHomeVisit ? [{ icon: 'house', label: 'Home visits' }] : []),
      ],
      link: ['/doctor', d.id], imageUrl: d.avatarUrl,
    };
  }

  private serviceRow(s: PublicService): SearchResultRow {
    // Descriptions are paragraphs separated by blank lines; the first is the summary.
    const summary = (s.description ?? '').split(/\n\s*\n/)[0].trim();
    return {
      kind: 'service', id: s.id, title: s.name, subtitle: s.hospitalName ? `At ${s.hospitalName}` : '',
      lines: summary ? [summary] : [], tags: [], link: ['/services', s.id], imageUrl: s.coverImageUrl,
    };
  }

  private clinicRow(h: PublicHospital): SearchResultRow {
    const address = [h.address, h.city, h.stateProvince].filter(Boolean).join(', ');
    return {
      kind: 'clinic', id: h.id, title: h.name, subtitle: hospitalTypeLabel(h.hospitalType),
      lines: address ? [address] : [], tags: h.is24Hours ? [{ icon: 'clock', label: 'Open 24 hours' }] : [],
      link: ['/hospitals', h.id], imageUrl: h.imageUrl,
    };
  }

  private articleRow(a: PublicArticle): SearchResultRow {
    const date = a.publishDate ? formatDate(a.publishDate, 'd MMM y', this.locale) : '';
    return {
      kind: 'article', id: a.id, title: a.title, subtitle: ArticleCategory[a.category] ?? '',
      lines: [a.excerpt, date].filter(Boolean), tags: [], link: ['/blog', a.id], imageUrl: a.coverImageUrl,
    };
  }

  private parse(params: ParamMap): Query {
    const id = (key: string) => {
      const v = params.get(key) ?? '';
      return GUID.test(v) ? v : '';
    };
    const q = (params.get('q') ?? '').trim().slice(0, MAX_SEARCH_LENGTH);
    const type = params.get('type') as Kind;
    // A tab without a keyword has nothing to show, so it falls back to the initial state.
    const tab: Tab = q && KINDS.includes(type) ? type : 'all';
    const page = Number.parseInt(params.get('page') ?? '1', 10);
    const raw: Filters = {
      specialty: id('specialty'),
      clinic: id('clinic'),
      online: params.get('online') === 'true',
      home: params.get('home') === 'true',
      type: TYPE_OPTIONS.some(o => o.id === params.get('hospitalType')) ? params.get('hospitalType')! : '',
      category: CATEGORY_OPTIONS.some(o => o.id === params.get('category')) ? params.get('category')! : '',
    };
    return { ...this.pickFilters(raw, tab), q, tab, page: tab !== 'all' && Number.isFinite(page) && page > 0 ? page : 1 };
  }

  /** Keeps only the filters the tab owns. */
  private pickFilters(f: Filters, tab: Tab = this.query.tab): Filters {
    const out = { ...NO_FILTERS };
    if (tab !== 'all') for (const k of TAB_FILTERS[tab]) (out as any)[k] = f[k];
    return out;
  }

  /** Writes the query to the URL; the queryParamMap subscription then loads the results. */
  private navigate(next: Query, replaceUrl = false): void {
    const f = this.pickFilters(next, next.tab);
    const queryParams: Params = {
      q: next.q || null,
      type: next.q && next.tab !== 'all' ? next.tab : null,
      specialty: f.specialty || null,
      clinic: f.clinic || null,
      online: f.online ? 'true' : null,
      home: f.home ? 'true' : null,
      hospitalType: f.type || null,
      category: f.category || null,
      page: next.page > 1 ? next.page : null,
    };
    this.router.navigate([], { relativeTo: this.route, queryParams, replaceUrl });
  }

  private blankOverview(): Record<Kind, Section> {
    const blank = (): Section => ({ status: 'loading', total: 0, rows: [], retry: 'default' });
    return { doctors: blank(), services: blank(), clinics: blank(), articles: blank() };
  }

  private nameOf(options: PublicOption[], id: string, fallback: string): string {
    return options.find(o => o.id === id)?.name ?? fallback;
  }
  // #endregion

  /** Rows are rebuilt by a getter on every check; tracking by label keeps the same DOM nodes. */
  trackByLabel(_: number, item: { label: string }): string {
    return item.label;
  }
}
