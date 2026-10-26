import { DatePipe, NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { BooButtonComponent, BooIconComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { CustomScrollbarDirective } from '../../../../shared/directives/scrollbar.directive';
import { ArticleStatus } from '../../../../shared/enums/article';
import { Article } from '../../../../shared/types/article.types';
import { ArticleBlock, parseArticleContent } from '../../../client/blog/detail/article-content';
import { ArticleTransition, categoryOf, publicUrlOf, statusOf, tagsOf, transitionsOf } from './article.utils';

/**
 * Read view of one article, laid out the way readers will see it: cover, title, standfirst and body, parsed with the
 * public blog's own content rules. Status moves, edits and deletes are handed to the list, which owns the requests.
 */
@Component({
    selector: 'cms-article-detail-drawer',
    standalone: true,
    imports: [NgIf, NgFor, NgClass, NgSwitch, NgSwitchCase, DatePipe, DrawerComponent, BooButtonComponent, BooIconComponent, BooStatusBadgeComponent, CustomScrollbarDirective],
    template: `
        <drawer [isOpen]="!!article" (close)="close.emit()">
            <div
                *ngIf="article as a"
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="article-detail-title"
                [attr.aria-busy]="busy"
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <boo-status-badge dotted [label]="status(a).label" [tone]="status(a).tone" />
                        <span class="text-xs text-secondary">
                            <ng-container *ngIf="a.status === ArticleStatus.Published && a.publishDate">Live on the blog since {{ a.publishDate | date: 'd MMM y' }}</ng-container>
                            <ng-container *ngIf="a.status === ArticleStatus.Draft">Not visible on the blog</ng-container>
                            <ng-container *ngIf="a.status === ArticleStatus.Archived">Hidden from the blog</ng-container>
                        </span>
                    </div>
                    <button boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close article preview" (click)="close.emit()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <!-- Publishing -->
                <div *ngIf="canUpdate && moves(a).length" class="flex-none px-6 py-3 border-b border-rowDivider bg-body/60">
                    <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Change publishing status">
                        <button
                            *ngFor="let t of moves(a); let first = first"
                            type="button"
                            boo-button
                            size="sm"
                            [variant]="first && !t.danger ? 'primary' : t.danger ? 'ghost' : 'secondary'"
                            [ngClass]="t.danger ? '!text-danger ml-auto' : ''"
                            [disabled]="busy"
                            [loading]="busy && pendingStatus === t.to"
                            (click)="transition.emit(t)"
                        >
                            <physio-icon *ngIf="!(busy && pendingStatus === t.to)" [name]="t.icon" [size]="15" aria-hidden="true" />{{ t.label }}
                        </button>
                    </div>
                </div>

                <div class="flex-1 min-h-0 overflow-y-auto" custom-scrollbar>
                    <!-- The story, as readers see it -->
                    <article class="px-6 pt-5 pb-6" aria-labelledby="article-detail-title">
                        <p class="m-0 text-xs font-semibold uppercase tracking-wide text-primaryDeep">
                            {{ category(a) }}<ng-container *ngIf="a.readTime"><span class="text-secondary font-medium normal-case tracking-normal"> · {{ a.readTime }}</span></ng-container>
                        </p>
                        <h2 id="article-detail-title" class="m-0 mt-1.5 text-2xl leading-8 font-semibold tracking-tight text-regular break-words">{{ a.title }}</h2>
                        <p class="m-0 mt-2 text-sm text-secondary">By <span class="font-medium text-regular">{{ a.author }}</span></p>

                        <div class="mt-4 aspect-[16/9] w-full rounded-xl overflow-hidden bg-body border border-rowDivider flex items-center justify-center">
                            <img
                                *ngIf="a.coverImageUrl && !coverFailed; else noCoverTpl"
                                [src]="a.coverImageUrl"
                                alt=""
                                class="w-full h-full object-cover"
                                (error)="coverFailed = true"
                            />
                            <ng-template #noCoverTpl>
                                <div class="flex flex-col items-center gap-1.5 text-placeholder">
                                    <physio-icon name="image" [size]="24" aria-hidden="true" />
                                    <span class="text-xs">{{ a.coverImageUrl ? "The cover image couldn't be loaded" : 'No cover image' }}</span>
                                </div>
                            </ng-template>
                        </div>

                        <p class="m-0 mt-5 text-[15px] leading-6 font-medium text-regular break-words">{{ a.excerpt }}</p>

                        <div class="mt-4 flex flex-col gap-3 text-sm leading-6 text-regular break-words">
                            <ng-container *ngFor="let b of blocks" [ngSwitch]="b.kind">
                                <p *ngSwitchCase="'p'" class="m-0 whitespace-pre-line">{{ text(b) }}</p>
                                <h3 *ngSwitchCase="'h2'" class="m-0 mt-2 text-base font-semibold text-regular">{{ text(b) }}</h3>
                                <h4 *ngSwitchCase="'h3'" class="m-0 mt-1 text-sm font-semibold text-regular">{{ text(b) }}</h4>
                                <ul *ngSwitchCase="'ul'" class="m-0 pl-5 list-disc flex flex-col gap-1"><li *ngFor="let i of items(b)">{{ i }}</li></ul>
                                <ol *ngSwitchCase="'ol'" class="m-0 pl-5 list-decimal flex flex-col gap-1"><li *ngFor="let i of items(b)">{{ i }}</li></ol>
                                <div *ngSwitchCase="'takeaway'" class="px-4 py-3 rounded-lg bg-primarySoft">
                                    <p class="m-0 text-xs font-semibold uppercase tracking-wide text-primaryDeep">Key takeaway</p>
                                    <p class="m-0 mt-1 whitespace-pre-line">{{ text(b) }}</p>
                                </div>
                                <div *ngSwitchCase="'callout'" class="px-4 py-3 rounded-lg border border-rowDivider bg-body">
                                    <p *ngIf="calloutTitle(b)" class="m-0 font-semibold">{{ calloutTitle(b) }}</p>
                                    <p class="m-0 whitespace-pre-line">{{ text(b) }}</p>
                                </div>
                            </ng-container>
                        </div>

                        <ul *ngIf="tags(a).length" class="m-0 mt-5 p-0 list-none flex flex-wrap gap-1.5" aria-label="Tags">
                            <li *ngFor="let t of tags(a)" class="px-2 py-0.5 rounded-full bg-body border border-rowDivider text-xs text-secondary">{{ t }}</li>
                        </ul>
                    </article>

                    <!-- Record details -->
                    <section aria-labelledby="ad-record" class="mx-6 py-5 border-t border-rowDivider">
                        <h3 id="ad-record" class="m-0 mb-3 text-xs font-semibold uppercase tracking-wide text-secondary">Record</h3>
                        <dl class="m-0 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div class="col-span-2 min-w-0">
                                <dt class="text-xs text-secondary">Slug</dt>
                                <dd class="m-0 font-medium text-regular break-all">{{ a.slug }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Publish date</dt>
                                <dd class="m-0 font-medium" [class.text-regular]="a.publishDate" [class.text-placeholder]="!a.publishDate">{{ (a.publishDate | date: 'd MMM y') || 'Not set' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Created</dt>
                                <dd class="m-0 font-medium text-regular">{{ a.createdAt | date: 'd MMM y, HH:mm' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Last updated</dt>
                                <dd class="m-0 font-medium" [class.text-regular]="a.updatedAt" [class.text-placeholder]="!a.updatedAt">{{ (a.updatedAt | date: 'd MMM y, HH:mm') || 'Never edited' }}</dd>
                            </div>
                        </dl>
                    </section>
                </div>

                <footer class="flex-none px-6 py-4 border-t border-rowDivider flex flex-wrap items-center justify-end gap-2">
                    <button *ngIf="canDelete" boo-button variant="ghost" size="sm" class="!text-danger mr-auto" [disabled]="busy" (click)="remove.emit(a)">
                        <physio-icon name="trash" [size]="15" aria-hidden="true" />Delete
                    </button>
                    <a
                        *ngIf="a.status === ArticleStatus.Published"
                        boo-button
                        variant="secondary"
                        size="sm"
                        [href]="publicUrl(a)"
                        target="_blank"
                        rel="noopener"
                    ><physio-icon name="external-link" [size]="15" aria-hidden="true" />View on site<span class="sr-only"> (opens in a new tab)</span></a>
                    <button *ngIf="canUpdate" boo-button variant="primary" size="sm" aria-haspopup="dialog" [disabled]="busy" (click)="edit.emit(a)">
                        <physio-icon name="pencil" [size]="15" aria-hidden="true" />Edit article
                    </button>
                </footer>
            </div>
        </drawer>
    `,
})
export class CmsArticleDetailDrawerComponent implements OnChanges {
    @Input() article: Article | null = null;
    @Input() canUpdate = false;
    @Input() canDelete = false;
    /** A status change or delete of this article is in flight. */
    @Input() busy = false;
    /** The status being applied, to show progress on its button. */
    @Input() pendingStatus: ArticleStatus | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() edit = new EventEmitter<Article>();
    @Output() remove = new EventEmitter<Article>();
    @Output() transition = new EventEmitter<ArticleTransition>();

    readonly ArticleStatus = ArticleStatus;
    readonly status = statusOf;
    readonly category = categoryOf;
    readonly moves = transitionsOf;
    readonly tags = tagsOf;
    readonly publicUrl = publicUrlOf;

    blocks: ArticleBlock[] = [];
    coverFailed = false;
    private parsedContent: string | null = null;

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes['article']) return;
        const prev = changes['article'].previousValue as Article | null;
        if (prev?.coverImageUrl !== this.article?.coverImageUrl) this.coverFailed = false;
        const content = this.article?.content ?? null;
        if (content !== this.parsedContent) {
            this.parsedContent = content;
            this.blocks = parseArticleContent(content);
        }
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.article) this.close.emit();
    }

    text(b: ArticleBlock): string {
        return 'text' in b ? b.text : '';
    }

    items(b: ArticleBlock): string[] {
        return 'items' in b ? b.items : [];
    }

    calloutTitle(b: ArticleBlock): string | null {
        return b.kind === 'callout' ? b.title : null;
    }
}
