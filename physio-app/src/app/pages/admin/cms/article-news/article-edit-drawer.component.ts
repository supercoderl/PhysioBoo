import { NgIf } from '@angular/common';
import { Component, DestroyRef, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BooButtonComponent, BooIconComponent, BooInputComponent } from '@physioboo/ui';
import { Observable } from 'rxjs';
import { finalize, map, switchMap } from 'rxjs/operators';
import { BooDatepickerComponent } from '../../../../components/date-picker/boo-date-picker.component';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { BooSelectComponent } from '../../../../components/select/boo-select/boo-select.component';
import { BooTextareaComponent } from '../../../../components/textarea/boo-textarea/boo-textarea.component';
import { BooUploadComponent } from '../../../../components/upload/boo-upload/boo-upload.component';
import { ArticleService } from '../../../../services/admin/article.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { LocalLoadingService } from '../../../../services/common/local-loading.service';
import { CustomScrollbarDirective } from '../../../../shared/directives/scrollbar.directive';
import { ArticleCategory, ArticleStatus } from '../../../../shared/enums/article';
import { Article } from '../../../../shared/types/article.types';
import { environment } from '../../../../../environments/environment';
import { ArticleWriteBody, CATEGORY_OPTIONS, STATUS_OPTIONS, publishDateFor, readTimeFor, slugify } from './article.utils';

/** Column limits from the article table and the server validators. */
const MAX = { title: 200, slug: 250, author: 200, tags: 500, excerpt: 300, readTime: 50, content: 100_000 };

/**
 * Write a new article (POST /api/articles) or edit one (PATCH /api/articles/{id}, which replaces every field).
 * The slug follows the title on new articles and the reading time follows the content, until either is typed in by
 * hand. Failures are reported by the global HTTP error toast and the form keeps what was entered.
 */
@Component({
    selector: 'cms-article-edit-drawer',
    standalone: true,
    imports: [
        NgIf,
        ReactiveFormsModule,
        DrawerComponent,
        BooButtonComponent,
        BooIconComponent,
        BooInputComponent,
        BooSelectComponent,
        BooDatepickerComponent,
        BooTextareaComponent,
        BooUploadComponent,
        CustomScrollbarDirective,
    ],
    template: `
        <drawer [isOpen]="open" [isShowDialog]="form.dirty && !submitting" (close)="discard()">
            <form
                *ngIf="open"
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="article-edit-title"
                [formGroup]="form"
                (ngSubmit)="submit()"
                novalidate
                [attr.aria-busy]="submitting"
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="m-0 text-xs font-medium text-secondary">{{ article ? 'Edit article' : 'New article' }}</p>
                        <h2 id="article-edit-title" class="m-0 mt-0.5 text-lg font-semibold leading-tight text-regular break-words">
                            {{ article ? article.title : 'Write an article' }}
                        </h2>
                        <p class="m-0 mt-0.5 text-xs text-secondary">Fields marked <span class="text-danger">*</span> are required.</p>
                    </div>
                    <button type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close article form" (click)="requestClose()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-6" custom-scrollbar>
                    <!-- Story -->
                    <fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Story</legend>
                        <div class="flex flex-col gap-4">
                            <div>
                                <label for="ae-title" class="block mb-1 text-[13px] font-medium text-regular">Title <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-input name="ae-title" formControlName="title" label="e.g. Five stretches for lower back pain" [maxlength]="max.title" />
                            </div>
                            <div>
                                <div class="flex items-baseline justify-between gap-3 mb-1">
                                    <label for="ae-excerpt" class="text-[13px] font-medium text-regular">Excerpt <span class="text-danger" aria-hidden="true">*</span></label>
                                    <span class="text-xs text-secondary tabular-nums" aria-live="polite">{{ form.controls.excerpt.value.length }} / {{ max.excerpt }}</span>
                                </div>
                                <boo-textarea id="ae-excerpt" formControlName="excerpt" label="One or two sentences shown on the blog cards and under the title" [rows]="3" [maxlength]="max.excerpt" />
                            </div>
                            <div>
                                <div class="flex items-baseline justify-between gap-3 mb-1">
                                    <label for="ae-content" class="text-[13px] font-medium text-regular">Content <span class="text-danger" aria-hidden="true">*</span></label>
                                    <span class="text-xs text-secondary tabular-nums">{{ wordCount }} {{ wordCount === 1 ? 'word' : 'words' }}</span>
                                </div>
                                <boo-textarea id="ae-content" formControlName="content" label="Write the full article…" [rows]="14" [maxlength]="max.content" />
                                <p id="ae-content-hint" class="m-0 mt-1.5 text-xs leading-5 text-secondary">
                                    Leave a blank line between paragraphs. Start a line with <code class="px-1 rounded bg-body">##</code> for a heading,
                                    <code class="px-1 rounded bg-body">-</code> or <code class="px-1 rounded bg-body">1.</code> for a list, and
                                    <code class="px-1 rounded bg-body">&gt; [!TIP]</code> for a key takeaway.
                                </p>
                            </div>
                        </div>
                    </fieldset>

                    <!-- Presentation -->
                    <div class="pt-6 border-t border-rowDivider"><fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Presentation</legend>
                        <div class="flex flex-col gap-4">
                            <div>
                                <span class="block mb-1 text-[13px] font-medium text-regular">Cover image</span>
                                <boo-upload formControlName="coverImageUrl" width="100%" height="200px" [radius]="12" accept="image/jpeg,image/png,image/webp" [folder]="coverFolder" />
                                <div class="mt-1.5 flex items-center justify-between gap-3">
                                    <p class="m-0 text-xs text-secondary">JPG, PNG or WebP. Shown at 16:9 on the blog.</p>
                                    <button *ngIf="form.controls.coverImageUrl.value" type="button" boo-button variant="link" size="sm" (click)="removeCover()">Remove image</button>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label for="ae-category" class="block mb-1 text-[13px] font-medium text-regular">Category <span class="text-danger" aria-hidden="true">*</span></label>
                                    <boo-select id="ae-category" formControlName="category" label="Category" required [options]="categoryOptions" />
                                </div>
                                <div>
                                    <label for="ae-tags" class="block mb-1 text-[13px] font-medium text-regular">Tags</label>
                                    <boo-input name="ae-tags" formControlName="tags" label="e.g. Posture, Back pain" [maxlength]="max.tags" />
                                    <p class="m-0 mt-1 text-xs text-secondary">Separate with commas. Tags are searchable.</p>
                                </div>
                            </div>
                        </div>
                    </fieldset></div>

                    <!-- Byline and publishing -->
                    <div class="pt-6 border-t border-rowDivider"><fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Byline and publishing</legend>
                        <div class="flex flex-col gap-4">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label for="ae-author" class="block mb-1 text-[13px] font-medium text-regular">Author <span class="text-danger" aria-hidden="true">*</span></label>
                                    <boo-input name="ae-author" formControlName="author" label="e.g. Dr. Linh Tran" [maxlength]="max.author" />
                                </div>
                                <div>
                                    <label for="ae-read" class="block mb-1 text-[13px] font-medium text-regular">Reading time</label>
                                    <boo-input name="ae-read" formControlName="readTime" label="e.g. 5 min read" [maxlength]="max.readTime" />
                                    <p class="m-0 mt-1 text-xs text-secondary">{{ readTimeManual ? 'Set by hand.' : 'Worked out from the content.' }}</p>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label for="ae-status" class="block mb-1 text-[13px] font-medium text-regular">Status <span class="text-danger" aria-hidden="true">*</span></label>
                                    <boo-select id="ae-status" formControlName="status" label="Status" required [options]="statusOptions" />
                                    <p class="m-0 mt-1 text-xs text-secondary">{{ statusHint }}</p>
                                </div>
                                <div>
                                    <label for="ae-date" class="block mb-1 text-[13px] font-medium text-regular">Publish date</label>
                                    <boo-datepicker id="ae-date" formControlName="publishDate" label="Publish date" />
                                    <p *ngIf="isPublishing && !form.controls.publishDate.value" class="m-0 mt-1 text-xs text-secondary">Today's date is used when left empty.</p>
                                </div>
                            </div>
                            <div>
                                <label for="ae-slug" class="block mb-1 text-[13px] font-medium text-regular">Slug <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-input name="ae-slug" formControlName="slug" label="five-stretches-for-lower-back-pain" [maxlength]="max.slug" />
                                <p class="m-0 mt-1 text-xs text-secondary">
                                    Must be unique across articles.<ng-container *ngIf="!article && !slugManual"> Follows the title until you change it.</ng-container>
                                </p>
                            </div>
                        </div>
                    </fieldset></div>
                </div>

                <footer class="flex-none px-6 py-4 border-t border-rowDivider flex items-center justify-end gap-2">
                    <button type="button" boo-button variant="secondary" size="sm" [disabled]="submitting" (click)="requestClose()">Cancel</button>
                    <button type="submit" boo-button variant="primary" size="sm" [loading]="submitting" [disabled]="uploading || (!!article && !form.dirty)">
                        {{ submitLabel }}
                    </button>
                </footer>
            </form>
        </drawer>
    `,
})
export class CmsArticleEditDrawerComponent implements OnInit, OnChanges {
    /** Open the drawer; with no article it creates a new one. */
    @Input() open = false;
    /** The article being edited, or null to write a new one. */
    @Input() article: Article | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<{ article: Article; created: boolean }>();

    private readonly fb = inject(FormBuilder);
    private readonly articleSrv = inject(ArticleService);
    private readonly dialogSrv = inject(DialogService);
    private readonly loadingSrv = inject(LocalLoadingService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly host: HTMLElement = inject(ElementRef).nativeElement;

    readonly max = MAX;
    readonly categoryOptions = CATEGORY_OPTIONS;
    readonly statusOptions = STATUS_OPTIONS;
    readonly coverFolder = `${environment.CLOUDINARY.BASE_FOLDER}/articles`;

    readonly form = this.fb.group({
        title: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(MAX.title)]),
        slug: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(MAX.slug)]),
        author: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(MAX.author)]),
        category: this.fb.nonNullable.control<ArticleCategory>(ArticleCategory.Medical, Validators.required),
        tags: this.fb.nonNullable.control('', Validators.maxLength(MAX.tags)),
        coverImageUrl: this.fb.control<string | null>(null),
        excerpt: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(MAX.excerpt)]),
        content: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(MAX.content)]),
        status: this.fb.nonNullable.control<ArticleStatus>(ArticleStatus.Draft, Validators.required),
        publishDate: this.fb.control<string | null>(null),
        readTime: this.fb.nonNullable.control('', Validators.maxLength(MAX.readTime)),
    });

    submitting = false;
    slugManual = false;
    readTimeManual = false;
    /** Values are being loaded into the form, so changes are not the user's. */
    private filling = false;

    /** A cover image is still uploading; saving now would drop it. */
    get uploading(): boolean {
        return this.loadingSrv.isLoading('upload');
    }

    get wordCount(): number {
        return this.form.controls.content.value.trim().split(/\s+/).filter(Boolean).length;
    }

    get isPublishing(): boolean {
        return this.form.controls.status.value === ArticleStatus.Published;
    }

    get statusHint(): string {
        switch (this.form.controls.status.value) {
            case ArticleStatus.Published: return 'Visible on the public blog once saved.';
            case ArticleStatus.Archived: return 'Kept for the record, hidden from the blog.';
            default: return 'Only staff can see drafts.';
        }
    }

    get submitLabel(): string {
        if (this.article) return 'Save changes';
        return this.isPublishing ? 'Publish article' : 'Save article';
    }

    ngOnInit(): void {
        const c = this.form.controls;
        c.title.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(title => {
            if (this.filling || this.slugManual) return;
            c.slug.setValue(slugify(title), { emitEvent: false });
        });
        c.slug.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            if (!this.filling) this.slugManual = true;
        });
        c.content.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(content => {
            if (this.filling || this.readTimeManual) return;
            c.readTime.setValue(content.trim() ? readTimeFor(content) : '', { emitEvent: false });
        });
        c.readTime.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => {
            // Clearing the field hands it back to the automatic estimate.
            if (!this.filling) this.readTimeManual = !!value.trim();
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        const opened = changes['open']?.currentValue === true && !changes['open'].previousValue;
        const prev = changes['article']?.previousValue as Article | null | undefined;
        const swapped = !!changes['article'] && this.article?.id !== prev?.id;
        // Opening, or switching to another article, starts from its saved values (or a blank one).
        if (this.open && (opened || swapped)) this.fill(this.article);
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.open) this.requestClose();
    }

    removeCover(): void {
        this.form.controls.coverImageUrl.setValue(null);
        this.form.controls.coverImageUrl.markAsDirty();
    }

    submit(): void {
        if (!this.open || this.submitting || this.uploading) return;
        this.form.markAllAsTouched();
        if (this.form.invalid) {
            setTimeout(() => this.host.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')?.scrollIntoView({ block: 'center' }));
            return;
        }

        const existing = this.article;
        const body = this.buildBody();
        const save$: Observable<string> = existing
            ? this.articleSrv.update(existing.id, body).pipe(map(() => existing.id))
            : this.articleSrv.create(body).pipe(map(res => {
                if (!res?.success || !res.data) throw new Error('Article was not created');
                return res.data;
            }));

        this.submitting = true;
        save$
            .pipe(
                // The write returns only the id; read the record back so the list shows what the server stored.
                switchMap(id => this.articleSrv.search_by_id(id).pipe(map(res => ({ id, res })))),
                finalize(() => this.submitting = false),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: ({ id, res }) => {
                    this.form.markAsPristine();
                    const stored = res?.success && res.data ? res.data : null;
                    this.saved.emit({ article: stored ?? this.fallback(id, existing, body), created: !existing });
                },
                // The global HTTP error toast reports the failure; the form keeps what was entered.
                error: () => undefined,
            });
    }

    requestClose(): void {
        if (this.submitting) return;
        if (this.form.dirty) this.dialogSrv.confirmUnsavedChanges(() => this.discard());
        else this.discard();
    }

    /** Called once leaving is confirmed (the drawer backdrop asks itself when the form is dirty). */
    discard(): void {
        if (this.submitting) return;
        this.form.markAsPristine();
        this.close.emit();
    }

    private fill(a: Article | null): void {
        this.filling = true;
        this.form.reset({
            title: a?.title ?? '',
            slug: a?.slug ?? '',
            author: a?.author ?? '',
            category: a?.category ?? ArticleCategory.Medical,
            tags: a?.tags ?? '',
            coverImageUrl: a?.coverImageUrl || null,
            excerpt: a?.excerpt ?? '',
            content: a?.content ?? '',
            status: a?.status ?? ArticleStatus.Draft,
            publishDate: a?.publishDate?.slice(0, 10) ?? null,
            readTime: a?.readTime ?? '',
        });
        this.filling = false;
        // An existing slug is never rewritten from the title; a stored reading time that no longer matches the
        // estimate was typed by hand.
        this.slugManual = !!a;
        this.readTimeManual = !!a?.readTime && a.readTime !== readTimeFor(a.content ?? '');
    }

    private buildBody(): ArticleWriteBody {
        const v = this.form.getRawValue();
        const text = (s: string) => s.trim() || null;
        const tags = v.tags.split(',').map(t => t.trim()).filter(Boolean).join(', ');
        return {
            title: v.title.trim(),
            slug: v.slug.trim(),
            author: v.author.trim(),
            category: v.category,
            tags: tags || null,
            coverImageUrl: v.coverImageUrl || null,
            excerpt: v.excerpt.trim(),
            content: v.content,
            status: v.status,
            publishDate: publishDateFor(v.status, v.publishDate),
            readTime: text(v.readTime) ?? (v.content.trim() ? readTimeFor(v.content) : null),
        };
    }

    /** What was saved, for when the read-back failed. */
    private fallback(id: string, existing: Article | null, body: ArticleWriteBody): Article {
        const now = new Date().toISOString();
        return {
            ...body,
            id,
            tags: body.tags ?? '',
            coverImageUrl: body.coverImageUrl ?? '',
            readTime: body.readTime ?? '',
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
        };
    }
}
