import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, ElementRef, HostListener, OnDestroy, OnInit, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subject, catchError, map, merge, of, switchMap, tap } from 'rxjs';
import { ArticleCardComponent } from '../../../../components/layout/client/article/article-card.component';
import { PublicArticleService } from '../../../../services/public/public-article.service';
import { ArticleCategory } from '../../../../shared/enums/article';
import { SharedModule } from '../../../../shared/shared-imports';
import { PublicArticle } from '../../../../shared/types/public-article.types';
import { ArticleBlock, ArticleHeading, TOC_MIN_HEADINGS, articleHeadings, parseArticleContent } from './article-content';

type PageState = 'loading' | 'live' | 'notfound' | 'error';
type RelatedState = 'loading' | 'live' | 'error';

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SITE = 'PhysioBoo';
const META_LENGTH = 155;
const COPIED_MS = 1400;
const TOAST_MS = 4000;
/** A section counts as current once its heading is this far from the top of the viewport (below the sticky header). */
const SPY_OFFSET = 120;
const OG_TAGS = ['og:title', 'og:description', 'og:image', 'og:type'];

/**
 * Public article (design: Article Page / Article Detail, route /blog/:id).
 * GET /api/articles/{id} returns Data: null for drafts and archived articles, so null and 404 both show
 * "This article isn't available". Related articles are the latest others in the same category.
 */
@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [SharedModule, ArticleCardComponent],
  templateUrl: './article-detail.component.html',
})
export class ArticleDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly articleSrv = inject(PublicArticleService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  @ViewChild('shareBox') private shareBox?: ElementRef<HTMLElement>;
  @ViewChild('shareButton') private shareButton?: ElementRef<HTMLButtonElement>;

  readonly nextLinks = [
    { icon: 'activity', label: 'Explore our services', href: '/services' },
    { icon: 'stethoscope', label: 'Find a doctor', href: '/doctor' },
    { icon: 'building-2', label: 'Find a clinic', href: '/hospitals' },
  ];

  state: PageState = 'loading';
  article: PublicArticle | null = null;
  blocks: ArticleBlock[] = [];
  /** Section headings for the contents list; empty when there are too few to need one. */
  toc: ArticleHeading[] = [];
  tags: string[] = [];
  imageFailed = false;

  related: PublicArticle[] = [];
  relatedState: RelatedState = 'loading';

  activeId: string | null = null;
  tocOpen = false;
  shareOpen = false;
  copied = false;
  /** Web Share API ("More options…"), mostly on phones. */
  readonly canNativeShare = this.isBrowser && typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  toast = '';

  private articleId = '';
  private copiedTimer?: ReturnType<typeof setTimeout>;
  private toastTimer?: ReturnType<typeof setTimeout>;
  private spyFrame = 0;
  private readonly reload$ = new Subject<void>();

  ngOnInit(): void {
    // Server render shows the skeleton; the article is fetched in the browser only.
    if (!this.isBrowser) return;

    merge(
      this.route.paramMap.pipe(
        map(p => p.get('id') ?? ''),
        tap(id => {
          if (this.articleId && id !== this.articleId) window.scrollTo({ top: 0 });
          this.articleId = id;
        })
      ),
      this.reload$.pipe(map(() => this.articleId))
    ).pipe(
      switchMap(id => this.load(id)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  ngOnDestroy(): void {
    clearTimeout(this.copiedTimer);
    clearTimeout(this.toastTimer);
    if (this.spyFrame) cancelAnimationFrame(this.spyFrame);
    this.title.setTitle(SITE);
    this.clearMeta();
    this.meta.removeTag('name="robots"');
  }

  retry(): void {
    this.reload$.next();
  }

  // #region View
  get categoryLabel(): string {
    return this.article ? ArticleCategory[this.article.category] ?? '' : '';
  }

  get initials(): string {
    return (this.article?.author ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  /** The update date is shown only when it falls on a later day than the publish date. */
  get updatedDate(): string | null {
    const a = this.article;
    if (!a?.updatedAt || !a.publishDate) return null;
    return dayOf(a.updatedAt) > dayOf(a.publishDate) ? a.updatedAt : null;
  }

  get hasToc(): boolean {
    return this.toc.length > 0;
  }

  trackByIndex(i: number): number {
    return i;
  }
  // #endregion

  // #region Contents
  goToSection(event: Event, id: string): void {
    event.preventDefault();
    const heading = document.getElementById(id);
    if (!heading) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    heading.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    heading.focus({ preventScroll: true });
    this.activeId = id;
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.hasToc || this.spyFrame) return;
    this.spyFrame = requestAnimationFrame(() => {
      this.spyFrame = 0;
      this.activeId = this.currentSection();
    });
  }

  /** The last heading that has scrolled past the offset; the first one before any has. */
  private currentSection(): string | null {
    let current = this.toc[0]?.id ?? null;
    for (const t of this.toc) {
      const el = document.getElementById(t.id);
      if (el && el.getBoundingClientRect().top <= SPY_OFFSET) current = t.id;
    }
    return current;
  }
  // #endregion

  // #region Share
  toggleShare(): void {
    this.shareOpen = !this.shareOpen;
    this.copied = false;
  }

  closeShare(returnFocus = false): void {
    if (!this.shareOpen) return;
    this.shareOpen = false;
    this.copied = false;
    clearTimeout(this.copiedTimer);
    if (returnFocus) this.shareButton?.nativeElement.focus();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.shareOpen && !this.shareBox?.nativeElement.contains(event.target as Node)) this.closeShare();
  }

  async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.shareUrl());
      this.copied = true;
      clearTimeout(this.copiedTimer);
      this.copiedTimer = setTimeout(() => this.closeShare(), COPIED_MS);
    } catch {
      this.closeShare(true);
      this.say("We couldn't copy the link. You can copy it from your browser's address bar.");
    }
  }

  /** Email carries only the title and the link. */
  shareByEmail(): void {
    const a = this.article;
    if (!a) return;
    const url = this.shareUrl();
    this.closeShare(true);
    window.location.href = `mailto:?subject=${encodeURIComponent(a.title)}&body=${encodeURIComponent(`${a.title}\n\n${url}`)}`;
  }

  shareNative(): void {
    const a = this.article;
    if (!a) return;
    this.closeShare(true);
    // Rejects when the visitor dismisses the sheet; nothing to report.
    navigator.share({ title: a.title, url: this.shareUrl() }).catch(() => { });
  }

  private shareUrl(): string {
    return `${window.location.origin}/blog/${this.articleId}`;
  }

  private say(message: string): void {
    clearTimeout(this.toastTimer);
    this.toast = message;
    this.toastTimer = setTimeout(() => this.toast = '', TOAST_MS);
  }
  // #endregion

  // #region Data
  private load(id: string) {
    this.article = null;
    this.blocks = [];
    this.toc = [];
    this.tags = [];
    this.related = [];
    this.imageFailed = false;
    this.activeId = null;
    this.tocOpen = false;
    this.closeShare();

    if (!GUID.test(id)) {
      this.showNotFound();
      return of(null);
    }

    this.state = 'loading';
    return this.articleSrv.getById(id).pipe(
      tap(res => {
        if (!res.success || !res.data) {
          this.showNotFound();
          return;
        }
        const a = res.data;
        this.article = a;
        this.blocks = parseArticleContent(a.content);
        const headings = articleHeadings(this.blocks);
        this.toc = headings.length >= TOC_MIN_HEADINGS ? headings : [];
        this.activeId = this.toc[0]?.id ?? null;
        this.tags = (a.tags ?? '').split(',').map(t => t.trim()).filter(Boolean);
        this.state = 'live';
        this.setMeta(a);
      }),
      switchMap(() => this.article ? this.loadRelated(this.article) : of(null)),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) this.showNotFound();
        else this.state = 'error';
        return of(null);
      })
    );
  }

  private loadRelated(article: PublicArticle) {
    this.relatedState = 'loading';
    return this.articleSrv.related(article).pipe(
      tap(items => {
        this.related = items;
        this.relatedState = 'live';
      }),
      catchError(() => {
        this.relatedState = 'error';
        return of(null);
      })
    );
  }

  private showNotFound(): void {
    this.state = 'notfound';
    this.title.setTitle(`Article not available | ${SITE}`);
    this.clearMeta();
    this.meta.updateTag({ name: 'robots', content: 'noindex' });
  }

  private setMeta(a: PublicArticle): void {
    this.title.setTitle(`${a.title} | ${SITE}`);
    this.meta.removeTag('name="robots"');
    const text = (a.excerpt?.trim() || a.content || '').replace(/\s+/g, ' ').trim();
    const description = text.length > META_LENGTH ? text.slice(0, META_LENGTH - 1).trimEnd() + '…' : text;
    if (description) {
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ property: 'og:description', content: description });
    } else {
      this.meta.removeTag('name="description"');
      this.meta.removeTag('property="og:description"');
    }
    this.meta.updateTag({ property: 'og:title', content: a.title });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    if (a.coverImageUrl) this.meta.updateTag({ property: 'og:image', content: a.coverImageUrl });
    else this.meta.removeTag('property="og:image"');
  }

  private clearMeta(): void {
    this.meta.removeTag('name="description"');
    for (const tag of OG_TAGS) this.meta.removeTag(`property="${tag}"`);
  }
  // #endregion
}

/** Calendar day of an ISO date-time, for comparing publish and update dates. */
function dayOf(iso: string): string {
  return iso.slice(0, 10);
}
