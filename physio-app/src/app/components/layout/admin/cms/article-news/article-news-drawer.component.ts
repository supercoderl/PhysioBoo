import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { finalize, firstValueFrom } from "rxjs";
import { ArticleService } from "../../../../../services/admin/article.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING, SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING } from "../../../../../shared/constants/error.constant";
import { ArticleCategory, ArticleStatus } from "../../../../../shared/enums/article";
import { SharedModule } from "../../../../../shared/shared-imports";
import { Article } from "../../../../../shared/types/article.types";
import { convertEnumToSelection } from "../../../../../shared/utils/common";
import { BooButtonAdminComponent } from "../../../../button/boo-button-admin/boo-button-admin.component";
import { DrawerComponent } from "../../../../drawer/drawer.component";
import { BooIconComponent } from "../../../../icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../textarea/boo-textarea/boo-textarea.component";
import { BooUploadComponent } from "../../../../upload/boo-upload/boo-upload.component";

@Component({
    selector: 'cms-article-news-drawer',
    standalone: true,
    imports: [
        SharedModule,
        DrawerComponent,
        BooInputComponent,
        BooIconComponent,
        BooTextareaComponent,
        BooButtonAdminComponent,
        BooSelectComponent,
        BooUploadComponent
    ],
    template: `
        <drawer [isOpen]="isOpen" [isShowDialog]="true" [width]="720" (close)="onClose()">
            <div class="flex flex-col h-full bg-surface relative">
                <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-surface z-10 sticky top-0">
                    <div>
                        <h2 class="text-xl font-bold text-primary leading-none mb-1">
                            {{ currentId ? 'Edit Article' : 'New Article' }}
                        </h2>
                        <p class="text-sm text-secondary m-0">Author and publish news & articles for the public site</p>
                    </div>
                    <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                        <boo-icon name="x" [size]="20"></boo-icon>
                    </button>
                </div>

                <div #scrollContainer class="flex-1 overflow-y-auto bg-surface" custom-scrollbar [formGroup]="form">
                    <div *ngIf="loadingSrv.isLoading('search-by-id') && currentId" class="absolute inset-0 bg-surface/80 z-50 flex items-center justify-center backdrop-blur-sm">
                        <boo-icon name="loader" class="animate-spin text-primary" [size]="32"></boo-icon>
                    </div>

                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-1">Basic Info</h3>
                        <boo-input label="Title" formControlName="title" placeholder="Ex: Revolutionary AI Technology..."></boo-input>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-input label="Slug" formControlName="slug" placeholder="revolutionary-ai-technology"></boo-input>
                            <boo-input label="Author" formControlName="author" placeholder="Dr. Sarah Johnson"></boo-input>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-select label="Category" formControlName="category" [options]="categoryOptions"></boo-select>
                            <boo-input label="Tags" formControlName="tags" placeholder="AI, Diagnosis, Technology"></boo-input>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Media</h3>
                        <boo-upload label="Cover Image" formControlName="coverImageUrl" width="100%" height="160px" [radius]="12"></boo-upload>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-1">Content</h3>
                        <boo-textarea label="Excerpt" formControlName="excerpt" [rows]="3" placeholder="Short summary shown on cards..."></boo-textarea>
                        <boo-textarea label="Content" formControlName="content" [rows]="10" placeholder="Full article body..."></boo-textarea>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6 pb-10">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Publishing</h3>
                        <div class="grid grid-cols-3 gap-4">
                            <boo-select label="Status" formControlName="status" [options]="statusOptions"></boo-select>
                            <boo-input type="date" label="Publish Date" formControlName="publishDate"></boo-input>
                            <boo-input label="Read Time" formControlName="readTime" placeholder="5 min read"></boo-input>
                        </div>
                    </div>
                </div>

                <div class="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between z-20 sticky bottom-0">
                    <button *ngIf="currentId" (click)="onDelete()" class="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1.5">
                        <boo-icon name="trash-2" [size]="16"></boo-icon>
                        Delete
                    </button>
                    <div class="flex gap-3 ml-auto">
                        <boo-button-admin background="transparent" (click)="onClose()">Cancel</boo-button-admin>
                        <boo-button-admin textColor="white" (click)="onSave()" [loading]="loadingSrv.isLoading('update')">
                            Save Changes
                        </boo-button-admin>
                    </div>
                </div>
            </div>
        </drawer>
    `
})

export class CmsArticleNewsDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Input() currentId: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saveSuccess = new EventEmitter<Article>();
    @Output() delete = new EventEmitter<string>();
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;
    form: FormGroup;

    categoryOptions = convertEnumToSelection(ArticleCategory);
    statusOptions = convertEnumToSelection(ArticleStatus);
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private fb: FormBuilder,
        private toastSrv: ToastService,
        private articleSrv: ArticleService,
        protected loadingSrv: LocalLoadingService
    ) {
        this.form = this.initForm();
        this.wireDerivedFields();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.isOpen) return;

        if (changes['currentId'] && this.currentId) {
            this.loadDetail(this.currentId);
        } else if (!this.currentId) {
            this.resetForm();
        }
    }
    // #endregion

    // #region Methods
    private initForm(): FormGroup {
        return this.fb.group({
            title: ['', [Validators.required, Validators.maxLength(200)]],
            slug: ['', [Validators.required]],
            author: ['', [Validators.required]],
            category: [ArticleCategory.Medical, [Validators.required]],
            tags: [''],
            coverImageUrl: [''],
            excerpt: ['', [Validators.required, Validators.maxLength(300)]],
            content: ['', [Validators.required]],
            status: [ArticleStatus.Draft, [Validators.required]],
            publishDate: [null],
            readTime: ['']
        });
    }

    loadDetail(id: string) {
        this.form.disable();

        this.articleSrv.search_by_id(id)
            .pipe(
                finalize(() => this.form.enable())
            )
            .subscribe(_res => {
                if (_res.success) {
                    this.form.patchValue({
                        title: _res.data?.title ?? '',
                        slug: _res.data?.slug ?? '',
                        author: _res.data?.author ?? '',
                        category: _res.data?.category ?? ArticleCategory.Medical,
                        tags: _res.data?.tags ?? '',
                        coverImageUrl: _res.data?.coverImageUrl ?? '',
                        excerpt: _res.data?.excerpt ?? '',
                        content: _res.data?.content ?? '',
                        status: _res.data?.status ?? ArticleStatus.Draft,
                        publishDate: _res.data?.publishDate,
                        readTime: _res.data?.readTime ?? ''
                    });
                    this.form.get('slug')?.markAsPristine();
                    this.form.get('readTime')?.markAsPristine();
                }
            })
    }

    private wireDerivedFields() {
        const titleControl = this.form.get('title');
        const slugControl = this.form.get('slug');
        titleControl?.valueChanges.subscribe((title: string) => {
            if (slugControl?.dirty) return;

            const slug = (title ?? '')
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
            slugControl?.setValue(slug, { emitEvent: false });
        });
        slugControl?.valueChanges.subscribe(() => slugControl.markAsDirty());

        const contentControl = this.form.get('content');
        const readTimeControl = this.form.get('readTime');
        contentControl?.valueChanges.subscribe((content: string) => {
            if (readTimeControl?.dirty) return;

            const words = (content ?? '').trim().split(/\s+/).filter(Boolean).length;
            const minutes = Math.max(1, Math.round(words / 200));
            readTimeControl?.setValue(`${minutes} min read`, { emitEvent: false });
        });
        readTimeControl?.valueChanges.subscribe(() => readTimeControl.markAsDirty());
    }

    async onSave() {
        if (this.form.invalid) {
            this.toastSrv.error('Please check required fields');
            this.form.markAllAsTouched();
            return;
        }

        const formData = { ...this.form.getRawValue() }

        try {
            let id: string;
            if (this.currentId) {
                await firstValueFrom(this.articleSrv.update(this.currentId, formData));
                id = this.currentId;
            } else {
                const createRes = await firstValueFrom(this.articleSrv.create(formData));
                if (!createRes.success || !createRes.data) {
                    this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
                    return;
                }
                id = createRes.data;
            }

            const response = await firstValueFrom(this.articleSrv.search_by_id(id));
            if (response.success && response.data) {
                this.saveSuccess.emit(response.data);
            } else this.toastSrv.error(SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING);
        } catch (err) {
            this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
            return;
        }
    }

    resetForm() {
        this.form.reset({
            title: '',
            slug: '',
            author: '',
            category: ArticleCategory.Medical,
            tags: '',
            coverImageUrl: '',
            excerpt: '',
            content: '',
            status: ArticleStatus.Draft,
            publishDate: null,
            readTime: ''
        });
        this.form.get('slug')?.markAsPristine();
        this.form.get('readTime')?.markAsPristine();
    }

    onClose() {
        if (this.scrollContainer) {
            this.scrollContainer.nativeElement.scrollTop = 0;
        }

        this.close.emit();
    }

    onDelete() {
        if (this.currentId) this.delete.emit(this.currentId);
    }
}
