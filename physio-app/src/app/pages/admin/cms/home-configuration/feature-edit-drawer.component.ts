import { NgIf } from '@angular/common';
import { Component, DestroyRef, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BooButtonComponent, BooCheckboxComponent, BooIconComponent, BooInputComponent } from '@physioboo/ui';
import { Observable } from 'rxjs';
import { finalize, map, switchMap } from 'rxjs/operators';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { BooIconSelectComponent } from '../../../../components/select/boo-icon-select/boo-icon-select.component';
import { BooTextareaComponent } from '../../../../components/textarea/boo-textarea/boo-textarea.component';
import { HomeFeatureService } from '../../../../services/admin/home-feature.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { CustomScrollbarDirective } from '../../../../shared/directives/scrollbar.directive';
import { Feature, SaveFeatureRequest } from '../../../../shared/types/feature.types';
import { FEATURE_ICON_NAMES, LIMITS, POSITION_PATTERN } from './home-config.utils';

/**
 * Add a home page feature (POST /api/home-features) or edit one (PATCH /api/home-features/{id}).
 * Every field is sent; an empty optional field clears the saved value.
 */
@Component({
    selector: 'home-feature-edit-drawer',
    standalone: true,
    imports: [NgIf, ReactiveFormsModule, DrawerComponent, BooButtonComponent, BooIconComponent, BooInputComponent, BooCheckboxComponent, BooIconSelectComponent, BooTextareaComponent, CustomScrollbarDirective],
    template: `
        <drawer [isOpen]="open" [isShowDialog]="form.dirty && !submitting" (close)="discard()">
            <form
                *ngIf="open"
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="feature-edit-title"
                [formGroup]="form"
                (ngSubmit)="submit()"
                novalidate
                [attr.aria-busy]="submitting"
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="m-0 text-xs font-medium text-secondary">{{ feature ? 'Edit feature' : 'New feature' }}</p>
                        <h2 id="feature-edit-title" class="m-0 mt-0.5 text-lg font-semibold leading-tight text-regular break-words">
                            {{ feature ? feature.title : 'Add a feature to the home page' }}
                        </h2>
                        <p class="m-0 mt-0.5 text-xs text-secondary">Fields marked <span class="text-danger">*</span> are required.</p>
                    </div>
                    <button type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close feature form" (click)="requestClose()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-6" custom-scrollbar>
                    <fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Content</legend>
                        <div class="flex flex-col gap-4">
                            <div>
                                <label for="hf-icon" class="block mb-1 text-[13px] font-medium text-regular">Icon</label>
                                <div class="flex items-center gap-3">
                                    <span class="flex-none w-10 h-10 rounded-lg bg-primarySoft text-primary flex items-center justify-center" aria-hidden="true">
                                        <physio-icon [name]="form.controls.icon.value || 'circle'" [size]="20" />
                                    </span>
                                    <boo-icon-select class="flex-1 min-w-0" inputId="hf-icon" formControlName="icon" label="Icon" [icons]="iconNames" />
                                </div>
                                <button *ngIf="form.controls.icon.value && form.enabled" type="button" boo-button variant="link" size="sm" class="mt-1" (click)="clearIcon()">No icon</button>
                            </div>
                            <div>
                                <label for="hf-title" class="block mb-1 text-[13px] font-medium text-regular">Title <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-input id="hf-title" name="hf-title" formControlName="title" label="Title" [maxlength]="max.featureTitle" />
                            </div>
                            <div>
                                <div class="flex items-baseline justify-between gap-3 mb-1">
                                    <label for="hf-desc" class="text-[13px] font-medium text-regular">Description</label>
                                    <span class="text-xs text-secondary tabular-nums">{{ form.controls.description.value.length }} / {{ max.featureDescription }}</span>
                                </div>
                                <boo-textarea id="hf-desc" formControlName="description" label="A sentence or two about this feature" [rows]="3" [maxlength]="max.featureDescription" />
                            </div>
                        </div>
                    </fieldset>

                    <div class="pt-6 border-t border-rowDivider"><fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Display</legend>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                            <div>
                                <label for="hf-order" class="block mb-1 text-[13px] font-medium text-regular">Position <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-input id="hf-order" name="hf-order" type="number" formControlName="order" label="Position" />
                                <p class="m-0 mt-1 text-xs text-secondary">Whole number, 1 or more. Lower numbers come first.</p>
                            </div>
                            <div class="sm:pt-7">
                                <boo-checkbox name="hf-active" formControlName="active" label="Active" />
                                <p class="m-0 mt-1 pl-6 text-xs text-secondary">Inactive features are kept but not shown.</p>
                            </div>
                        </div>
                    </fieldset></div>
                </div>

                <footer class="flex-none px-6 py-4 border-t border-rowDivider flex items-center gap-2">
                    <button
                        *ngIf="feature && canDelete"
                        type="button"
                        boo-button
                        variant="ghost"
                        size="sm"
                        class="!text-danger"
                        [disabled]="submitting"
                        (click)="remove.emit(feature)"
                    ><physio-icon name="trash" [size]="15" aria-hidden="true" />Delete</button>
                    <div class="ml-auto flex items-center gap-2">
                        <button type="button" boo-button variant="secondary" size="sm" [disabled]="submitting" (click)="requestClose()">Cancel</button>
                        <button type="submit" boo-button variant="primary" size="sm" [loading]="submitting" [disabled]="!!feature && !form.dirty">
                            {{ feature ? 'Save changes' : 'Add feature' }}
                        </button>
                    </div>
                </footer>
            </form>
        </drawer>
    `,
})
export class HomeFeatureEditDrawerComponent implements OnChanges {
    @Input() open = false;
    @Input() feature: Feature | null = null;
    @Input() nextOrder = 1;
    @Input() canDelete = false;
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<{ feature: Feature | null; created: boolean }>();
    @Output() remove = new EventEmitter<Feature>();

    private readonly fb = inject(FormBuilder);
    private readonly srv = inject(HomeFeatureService);
    private readonly dialogSrv = inject(DialogService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly host: HTMLElement = inject(ElementRef).nativeElement;

    readonly max = LIMITS;
    readonly iconNames = FEATURE_ICON_NAMES;
    readonly form = this.fb.group({
        icon: this.fb.control<string | null>(null, Validators.maxLength(60)),
        title: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(LIMITS.featureTitle)]),
        description: this.fb.nonNullable.control('', Validators.maxLength(LIMITS.featureDescription)),
        order: this.fb.control<number | string | null>(1, [Validators.required, Validators.pattern(POSITION_PATTERN)]),
        active: this.fb.nonNullable.control(true),
    });

    submitting = false;

    get dirty(): boolean {
        return this.open && this.form.dirty;
    }

    ngOnChanges(changes: SimpleChanges): void {
        const opened = changes['open']?.currentValue === true && !changes['open'].previousValue;
        const prev = changes['feature']?.previousValue as Feature | null | undefined;
        const swapped = !!changes['feature'] && this.feature?.id !== prev?.id;
        if (this.open && (opened || swapped)) this.fill(this.feature);
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.open) this.requestClose();
    }

    clearIcon(): void {
        this.form.controls.icon.setValue(null);
        this.form.controls.icon.markAsDirty();
    }

    submit(): void {
        if (!this.open || this.submitting) return;
        this.form.markAllAsTouched();
        if (this.form.invalid) {
            setTimeout(() => this.host.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
            return;
        }

        const existing = this.feature;
        const body = this.buildBody();
        const save$: Observable<string> = existing
            ? this.srv.update(existing.id, body).pipe(map(() => existing.id))
            : this.srv.create(body).pipe(map(res => {
                if (!res?.success || !res.data) throw new Error('Feature was not created');
                return res.data;
            }));

        this.submitting = true;
        save$
            .pipe(
                switchMap(id => this.srv.search_by_id(id)),
                finalize(() => this.submitting = false),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: res => {
                    this.form.markAsPristine();
                    this.saved.emit({ feature: res?.success ? res.data : null, created: !existing });
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

    private fill(f: Feature | null): void {
        this.form.reset({
            icon: f ? f.icon : null,
            title: f?.title ?? '',
            description: f?.description ?? '',
            order: f?.order ?? this.nextOrder,
            active: f?.active ?? true,
        });
    }

    private buildBody(): SaveFeatureRequest {
        const v = this.form.getRawValue();
        return {
            // An empty string clears a saved icon; null would leave it unchanged.
            icon: v.icon ?? '',
            title: v.title.trim(),
            description: v.description.trim(),
            order: Number(v.order),
            active: v.active,
        };
    }
}
