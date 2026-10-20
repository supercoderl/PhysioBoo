import { isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, ElementRef, OnDestroy, OnInit, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';
import { Subject, catchError, map, merge, of, switchMap, tap } from 'rxjs';
import { ArticleCardComponent } from '../../../components/layout/client/article/article-card.component';
import { PublicArticleService } from '../../../services/public/public-article.service';
import { ArticleCategory } from '../../../shared/enums/article';
import { BooBreadcrumbComponent, BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent, BooPaginationComponent } from '@physioboo/ui';
import { SharedModule } from '../../../shared/shared-imports';
import { PublicArticle } from '../../../shared/types/public-article.types';

type ListState = 'loading' | 'results' | 'empty' | 'error';

interface Query {
  q: string;
  category: ArticleCategory | null;
  page: number;
}

interface CategoryChip {
  label: string;
  value: ArticleCategory | null;
}

// 6 fills the 3-, 2- and 1-column grids evenly.
const PAGE_SIZE = 6;
const MAX_SEARCH_LENGTH = 100;
const TITLE = 'Health Insights & Advice | PhysioBoo';
const SITE = 'PhysioBoo';

/** "Community" exists in the enum but has no chip yet (see docs/blog-redesign.md). */
const CATEGORIES: CategoryChip[] = [
  { label: 'All Articles', value: null },
  { label: 'Medical', value: ArticleCategory.Medical },
  { label: 'Research', value: ArticleCategory.Research },
  { label: 'Technology', value: ArticleCategory.Technology },
  { label: 'Wellness', value: ArticleCategory.Wellness },
];

/**
 * Public blog listing (design: Blog Page / Blog Listing, route /blog).
 * The URL is the single source of truth for search, category and page, so refresh, back/forward and
 * shared links all restore the same results. The newest article is featured on page 1 of the unfiltered
 * list and takes one slot of that page, which keeps page sizes aligned with the API.
 */
@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [SharedModule, BooButtonComponent, ArticleCardComponent, BooEmptyStateComponent, BooErrorStateComponent, BooBreadcrumbComponent, BooPaginationComponent],
  templateUrl: './blog.component.html'
})
export class BlogComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly articleSrv = inject(PublicArticleService);
  private readonly title = inject(Title);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  @ViewChild('listHeading') private listHeading?: ElementRef<HTMLElement>;

  readonly categories = CATEGORIES;
  readonly skeletons = Array.from({ length: PAGE_SIZE });

  query: Query = { q: '', category: null, page: 1 };
  qInput = '';
  state: ListState = 'loading';
  articles: PublicArticle[] = [];
  featured: PublicArticle | null = null;
  featuredImageFailed = false;
  total = 0;
  totalPages = 1;

  private readonly reload$ = new Subject<void>();

  ngOnInit(): void {
    this.title.setTitle(TITLE);

    // Server render shows the loading skeleton; data is fetched in the browser only.
    if (!this.isBrowser) return;

    // Every URL change (search, category, paging, back/forward) and every retry runs one request; a newer one cancels the older.
    merge(
      this.route.queryParamMap.pipe(
        map(params => this.parse(params)),
        tap(q => {
          this.query = q;
          this.qInput = q.q;
        })
      ),
      this.reload$.pipe(map(() => this.query))
    ).pipe(
      switchMap(q => this.fetch(q)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.title.setTitle(SITE);
  }

  // #region Search and filters
  submitSearch(event: Event): void {
    event.preventDefault();
    const q = this.qInput.trim().slice(0, MAX_SEARCH_LENGTH);
    if (q === this.query.q) return;
    this.navigate({ q, page: 1 });
  }

  clearInput(): void {
    this.qInput = '';
  }

  clearSearch(): void {
    this.qInput = '';
    this.navigate({ q: '', page: 1 });
  }

  clearAll(): void {
    this.qInput = '';
    this.navigate({ q: '', category: null, page: 1 });
  }

  setCategory(value: ArticleCategory | null): void {
    if (value === this.query.category) return;
    this.navigate({ category: value, page: 1 });
  }

  retry(): void {
    this.reload$.next();
  }
  // #endregion

  // #region View
  get hasQuery(): boolean {
    return !!this.query.q;
  }

  get categoryLabel(): string {
    return this.categoryName(this.query.category);
  }

  categoryName(category: ArticleCategory | null): string {
    return category === null ? '' : ArticleCategory[category] ?? '';
  }

  /** The featured article shows only on page 1 of All Articles with no search. */
  get isFeaturedMode(): boolean {
    return this.query.category === null && !this.query.q;
  }

  get showFeatured(): boolean {
    return this.isFeaturedMode && this.query.page === 1 && this.state !== 'error';
  }

  get listTitle(): string {
    if (this.hasQuery) return 'Search results';
    if (this.query.category !== null) return this.categoryLabel;
    return this.isFeaturedMode ? 'Latest articles' : 'All articles';
  }

  get summary(): string {
    if (this.state === 'loading') return 'Loading articles…';
    if (this.state !== 'results') return '';
    const q = this.query;
    if (q.q) {
      const noun = this.total === 1 ? 'result' : 'results';
      return `${this.total} ${noun} for “${q.q}”${q.category !== null ? ` in ${this.categoryLabel}` : ''}`;
    }
    // With a featured article the grid lists the rest: page 1 holds one fewer card than the other pages.
    const featured = this.isFeaturedMode;
    const count = featured ? this.total - 1 : this.total;
    if (count < 1) return '';
    const from = featured ? (q.page === 1 ? 1 : (q.page - 1) * PAGE_SIZE) : (q.page - 1) * PAGE_SIZE + 1;
    const to = from + this.articles.length - 1;
    return `Showing ${from}–${to} of ${count}${featured ? ' more' : ''} articles`;
  }

  get emptyIcon(): string {
    return this.hasQuery ? 'search-x' : 'newspaper';
  }

  get emptyTitle(): string {
    return this.hasQuery ? `No articles match “${this.query.q}”` : `No ${this.categoryLabel} articles yet`;
  }

  get emptyBody(): string {
    if (!this.hasQuery) return 'We haven’t published anything in this category yet. Browse all articles, or try another category.';
    return this.query.category !== null
      ? `Nothing in ${this.categoryLabel} matches your search. Try different words, or search all categories.`
      : 'Check the spelling or try a broader word, such as “knee” or “exercise”.';
  }

  get clearAllLabel(): string {
    if (!this.hasQuery) return 'View all articles';
    return this.query.category === null ? 'Show all articles' : 'Clear all filters';
  }

  get featuredInitials(): string {
    return (this.featured?.author ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  trackById(_: number, a: PublicArticle): string {
    return a.id;
  }
  // #endregion

  // #region Pagination
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.query.page) return;
    this.navigate({ page });
    const heading = this.listHeading?.nativeElement;
    if (!heading) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    heading.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    heading.focus({ preventScroll: true });
  }
  // #endregion

  // #region Data
  private fetch(q: Query) {
    this.state = 'loading';
    return this.articleSrv.search({
      pageNumber: q.page,
      pageSize: PAGE_SIZE,
      search: q.q || undefined,
      sort: '-publishDate',
      filter: { start: '', end: '', category: q.category, status: null }
    }).pipe(
      tap(res => {
        if (!res.success || !res.data) {
          this.state = 'error';
          return;
        }
        const items = res.data.items;
        this.total = res.data.totalCount;
        this.totalPages = Math.max(1, Math.ceil(res.data.totalCount / PAGE_SIZE));
        // A page past the end (e.g. an old link) falls back to the last page that has results.
        if (!items.length && q.page > 1 && this.total > 0) {
          this.navigate({ page: this.totalPages }, true);
          return;
        }
        const featured = this.isFeaturedMode && q.page === 1 && items.length > 0;
        this.featured = featured ? items[0] : null;
        this.featuredImageFailed = false;
        this.articles = featured ? items.slice(1) : items;
        this.state = items.length ? 'results' : 'empty';
      }),
      catchError(() => {
        this.state = 'error';
        return of(null);
      })
    );
  }

  private parse(params: ParamMap): Query {
    const page = Number.parseInt(params.get('page') ?? '1', 10);
    const named = CATEGORIES.find(c => c.value !== null && this.categoryName(c.value) === params.get('category'));
    return {
      q: (params.get('q') ?? '').trim().slice(0, MAX_SEARCH_LENGTH),
      category: named?.value ?? null,
      page: Number.isFinite(page) && page > 0 ? page : 1,
    };
  }

  /** Writes the query to the URL; the queryParamMap subscription then loads the results. */
  private navigate(patch: Partial<Query>, replaceUrl = false): void {
    const q = { ...this.query, ...patch };
    const queryParams: Params = {
      q: q.q || null,
      category: q.category === null ? null : this.categoryName(q.category),
      page: q.page > 1 ? q.page : null,
    };
    this.router.navigate([], { relativeTo: this.route, queryParams, replaceUrl });
  }
  // #endregion
}
