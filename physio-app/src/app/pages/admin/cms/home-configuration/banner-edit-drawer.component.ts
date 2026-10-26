import { NgIf } from '@angular/common';
import { Component, DestroyRef, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BooButtonComponent, BooCheckboxComponent, BooIconComponent, BooInputComponent } from '@physioboo/ui';
import { Observable } from 'rxjs';
import { finalize, map, switchMap } from 'rxjs/operators';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { BooUploadComponent } from '../../../../components/upload/boo-upload/boo-upload.component';
import { HomeBannerService } from '../../../../services/admin/home-banner.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { LocalLoadingService } from '../../../../services/common/local-loading.service';
import { CustomScrollbarDirective } from '../../../../shared/directives/scrollbar.directive';
import { Banner, SaveBannerRequest } from '../../../../shared/types/banner.types';
import { LIMITS, POSITION_PATTERN } from './home-config.utils';

/**
 * Add a hero banner (POST /api/home-banners) or edit one (PATCH /api/home-banners/{id}).
 * Every field is sent; an empty optional field clears the saved value. Failures are reported by the global HTTP
 * error toast and the form keeps what was entered.
 */
@Component({
    selector: 'home-banner-edit-drawer',
    standalone: true,
    imports: [NgIf, ReactiveFormsModule, DrawerComponent, BooButtonComponent, BooIconComponent, BooInputComponent, BooCheckboxComponent, BooUploadComponent, CustomScrollbarDirective],
    template: `
        <drawer [isOpen]="open" [isShowDialog]="form.dirty && !submitting" (close)="discard()">
            <form
                *ngIf="open"
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="banner-edit-title"
                [formGroup]="form"
                (ngSubmit)="submit()"
                novalidate
                [attr.aria-busy]="submitting"
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="m-0 text-xs font-medium text-secondary">{{ banner ? 'Edit hero banner' : 'New hero banner' }}</p>
                        <h2 id="banner-edit-title" class="m-0 mt-0.5 text-lg font-semibold leading-tight text-regular break-words">
                            {{ banner ? banner.title : 'Add a banner to the home page' }}
                        </h2>
                        <p class="m-0 mt-0.5 text-xs text-secondary">Fields marked <span class="text-danger">*</span> are required.</p>
                    </div>
                    <button type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close banner form" (click)="requestClose()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-6" custom-scrollbar>
                    <fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Message</legend>
                        <div class="flex flex-col gap-4">
                            <div>
                                <label for="hb-title" class="block mb-1 text-[13px] font-medium text-regular">Headline <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-input id="hb-title" name="hb-title" formControlName="title" label="Headline" [maxlength]="max.bannerTitle" />
                            </div>
                            <div>
                                <div class="flex items-baseline justify-between gap-3 mb-1">
                                    <label for="hb-subtitle" class="text-[13px] font-medium text-regular">Supporting text</label>
                                    <span class="text-xs text-secondary tabular-nums">{{ form.controls.subtitle.value.length }} / {{ max.bannerSubtitle }}</span>
                                </div>
                                <boo-input id="hb-subtitle" name="hb-subtitle" formControlName="subtitle" label="One line under the headline" [maxlength]="max.bannerSubtitle" />
                            </div>
                        </div>
                    </fieldset>

                    <div class="pt-6 border-t border-rowDivider"><fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-1 text-sm font-semibold text-regular">Image</legend>
                        <p class="m-0 mb-3 text-xs text-secondary">Optional. PNG, JPG or WebP. Click the box to upload or replace it.</p>
                        <boo-upload formControlName="imageUrl" accept="image/png,image/jpeg,image/webp" width="100%" height="180px" [radius]="12" />
                        <button
                            *ngIf="form.controls.imageUrl.value && form.enabled"
                            type="button"
                            boo-button
                            variant="link"
                            size="sm"
                            class="mt-2"
                            (click)="clearImage()"
                        >Remove image</button>
                    </fieldset></div>

                    <div class="pt-6 border-t border-rowDivider"><fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-1 text-sm font-semibold text-regular">Button</legend>
                        <p class="m-0 mb-3 text-xs text-secondary">Optional. Leave both empty for a banner without a button.</p>
                        <div class="grid grid-cols-1 sm:grid-cols-5 gap-4">
                            <div class="sm:col-span-2">
                                <label for="hb-btn-text" class="block mb-1 text-[13px] font-medium text-regular">Button text</label>
                                <boo-input id="hb-btn-text" name="hb-btn-text" formControlName="buttonText" label="e.g. Book a visit" [maxlength]="max.buttonText" />
                            </div>
                            <div class="sm:col-span-3">
                                <label for="hb-btn-link" class="block mb-1 text-[13px] font-medium text-regular">Button link</label>
                                <boo-input id="hb-btn-link" name="hb-btn-link" formControlName="buttonLink" label="e.g. /booking" [maxlength]="max.url" />
                            </div>
                        </div>
                        <p *ngIf="halfButton" class="m-0 mt-2 text-xs text-amber-700">{{ halfButton }}</p>
                    </fieldset></div>

                    <div class="pt-6 border-t border-rowDivider"><fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Display</legend>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                            <div>
                                <label for="hb-order" class="block mb-1 text-[13px] font-medium text-regular">Position <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-input id="hb-order" name="hb-order" type="number" formControlName="order" label="Position" />
                                <p class="m-0 mt-1 text-xs text-secondary">Whole number, 1 or more. Lower numbers come first.</p>
                            </div>
                            <div class="sm:pt-7">
                                <boo-checkbox name="hb-active" formControlName="active" label="Active" />
                                <p class="m-0 mt-1 pl-6 text-xs text-secondary">Inactive banners are kept but not shown.</p>
                            </div>
                        </div>
                    </fieldset></div>
                </div>

                <footer class="flex-none px-6 py-4 border-t border-rowDivider flex items-center gap-2">
                    <button
                        *ngIf="banner && canDelete"
                        type="button"
                        boo-button
                        variant="ghost"
                        size="sm"
                        class="!text-danger"
                        [disabled]="submitting"
                        (click)="remove.emit(banner)"
                    ><physio-icon name="trash" [size]="15" aria-hidden="true" />Delete</button>
                    <div class="ml-auto flex items-center gap-2">
                        <button type="button" boo-button variant="secondary" size="sm" [disabled]="submitting" (click)="requestClose()">Cancel</button>
                        <button type="submit" boo-button variant="primary" size="sm" [loading]="submitting" [disabled]="uploading || (!!banner && !form.dirty)">
                            {{ banner ? 'Save changes' : 'Add banner' }}
                        </button>
                    </div>
                </footer>
            </form>
        </drawer>
    `,
})
export class HomeBannerEditDrawerComponent implements OnChanges {
    @Input() open = false;
    /** The banner being edited, or null to add one. */
    @Input() banner: Banner | null = null;
    /** Position a new banner starts with, so it lands at the end. */
    @Input() nextOrder = 1;
    @Input() canDelete = false;
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<{ banner: Banner | null; created: boolean }>();
    @Output() remove = new EventEmitter<Banner>();

    private readonly fb = inject(FormBuilder);
    private readonly srv = inject(HomeBannerService);
    private readonly dialogSrv = inject(DialogService);
    private readonly loadingSrv = inject(LocalLoadingService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly host: HTMLElement = inject(ElementRef).nativeElement;

    readonly max = LIMITS;
    readonly form = this.fb.group({
        title: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(LIMITS.bannerTitle)]),
        subtitle: this.fb.nonNullable.control('', Validators.maxLength(LIMITS.bannerSubtitle)),
        imageUrl: this.fb.nonNullable.control(''),
        buttonText: this.fb.nonNullable.control('', Validators.maxLength(LIMITS.buttonText)),
        buttonLink: this.fb.nonNullable.control('', Validators.maxLength(LIMITS.url)),
        order: this.fb.control<number | string | null>(1, [Validators.required, Validators.pattern(POSITION_PATTERN)]),
        active: this.fb.nonNullable.control(true),
    });

    submitting = false;

    /** An image is still uploading; saving now would drop it. */
    get uploading(): boolean {
        return this.loadingSrv.isLoading('upload');
    }

    get dirty(): boolean {
        return this.open && this.form.dirty;
    }

    /** Only one half of the button is filled in. */
    get halfButton(): string | null {
        const text = this.form.controls.buttonText.value.trim();
        const link = this.form.controls.buttonLink.value.trim();
        if (text && !link) return 'Add a link too, or the button has nowhere to go.';
        if (link && !text) return 'Add button text too, so visitors know what the button does.';
        return null;
    }

    ngOnChanges(changes: SimpleChanges): void {
        const opened = changes['open']?.currentValue === true && !changes['open'].previousValue;
        const prev = changes['banner']?.previousValue as Banner | null | undefined;
        const swapped = !!changes['banner'] && this.banner?.id !== prev?.id;
        if (this.open && (opened || swapped)) this.fill(this.banner);
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.open) this.requestClose();
    }

    clearImage(): void {
        this.form.controls.imageUrl.setValue('');
        this.form.controls.imageUrl.markAsDirty();
    }

    submit(): void {
        if (!this.open || this.submitting || this.uploading) return;
        this.form.markAllAsTouched();
        if (this.form.invalid) {
            setTimeout(() => this.host.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
            return;
        }

        const existing = this.banner;
        const body = this.buildBody();
        const save$: Observable<string> = existing
            ? this.srv.update(existing.id, body).pipe(map(() => existing.id))
            : this.srv.create(body).pipe(map(res => {
                if (!res?.success || !res.data) throw new Error('Banner was not created');
                return res.data;
            }));

        this.submitting = true;
        save$
            .pipe(
                // The write returns only the id; read the banner back so the list shows what the server stored.
                switchMap(id => this.srv.search_by_id(id)),
                finalize(() => this.submitting = false),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: res => {
                    this.form.markAsPristine();
                    this.saved.emit({ banner: res?.success ? res.data : null, created: !existing });
                },
                // The global HTTP error toast reports the failure; the form keeps its values.
                error: () => undefined,
            });
    }

    requestClose(): void {
        if (this.submitting) return;
        if (this.form.dirty) this.dialogSrv.confirmUnsavedChanges(() => this.discard());
        else this.discard();
    }

    discard(): void {
        if (this.submitting) return;
        this.form.markAsPristine();
        this.close.emit();
    }

    private fill(b: Banner | null): void {
        this.form.reset({
            title: b?.title ?? '',
            subtitle: b?.subtitle ?? '',
            imageUrl: b?.imageUrl ?? '',
            buttonText: b?.buttonText ?? '',
            buttonLink: b?.buttonLink ?? '',
            order: b?.order ?? this.nextOrder,
            active: b?.active ?? true,
        });
    }

    private buildBody(): SaveBannerRequest {
        const v = this.form.getRawValue();
        return {
            title: v.title.trim(),
            subtitle: v.subtitle.trim(),
            imageUrl: v.imageUrl.trim(),
            buttonText: v.buttonText.trim(),
            buttonLink: v.buttonLink.trim(),
            order: Number(v.order),
            active: v.active,
        };
    }
}
