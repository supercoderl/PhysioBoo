import { NgIf } from '@angular/common';
import { Component, DestroyRef, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BooButtonComponent, BooCheckboxComponent, BooIconComponent, BooInputComponent } from '@physioboo/ui';
import { Observable } from 'rxjs';
import { finalize, map, switchMap } from 'rxjs/operators';
import { BooDatepickerComponent } from '../../../../components/date-picker/boo-date-picker.component';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { BooSelectComponent } from '../../../../components/select/boo-select/boo-select.component';
import { BooTextareaComponent } from '../../../../components/textarea/boo-textarea/boo-textarea.component';
import { HomeTestimonialService } from '../../../../services/admin/home-testimonial.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { CustomScrollbarDirective } from '../../../../shared/directives/scrollbar.directive';
import { SaveTestimonialRequest, Testimonial } from '../../../../shared/types/testimonial.types';
import { LIMITS, RATING_OPTIONS } from './home-config.utils';

/**
 * Add a testimonial (POST /api/home-testimonials) or edit one (PATCH /api/home-testimonials/{id}).
 * Every field is sent, the date included: the update endpoint always writes it.
 */
@Component({
    selector: 'home-testimonial-edit-drawer',
    standalone: true,
    imports: [NgIf, ReactiveFormsModule, DrawerComponent, BooButtonComponent, BooIconComponent, BooInputComponent, BooCheckboxComponent, BooSelectComponent, BooTextareaComponent, BooDatepickerComponent, CustomScrollbarDirective],
    template: `
        <drawer [isOpen]="open" [isShowDialog]="form.dirty && !submitting" (close)="discard()">
            <form
                *ngIf="open"
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="testimonial-edit-title"
                [formGroup]="form"
                (ngSubmit)="submit()"
                novalidate
                [attr.aria-busy]="submitting"
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="m-0 text-xs font-medium text-secondary">{{ testimonial ? 'Edit testimonial' : 'New testimonial' }}</p>
                        <h2 id="testimonial-edit-title" class="m-0 mt-0.5 text-lg font-semibold leading-tight text-regular break-words">
                            {{ testimonial ? testimonial.patientName : 'Add a patient testimonial' }}
                        </h2>
                        <p class="m-0 mt-0.5 text-xs text-secondary">Fields marked <span class="text-danger">*</span> are required.</p>
                    </div>
                    <button type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close testimonial form" (click)="requestClose()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-6" custom-scrollbar>
                    <fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Testimonial</legend>
                        <div class="flex flex-col gap-4">
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div class="sm:col-span-2">
                                    <label for="ht-name" class="block mb-1 text-[13px] font-medium text-regular">Patient name <span class="text-danger" aria-hidden="true">*</span></label>
                                    <boo-input id="ht-name" name="ht-name" formControlName="patientName" label="As it should appear" [maxlength]="max.patientName" />
                                </div>
                                <div>
                                    <label for="ht-rating" class="block mb-1 text-[13px] font-medium text-regular">Rating <span class="text-danger" aria-hidden="true">*</span></label>
                                    <boo-select id="ht-rating" formControlName="rating" label="Rating" required [options]="ratingOptions" />
                                </div>
                            </div>
                            <div>
                                <div class="flex items-baseline justify-between gap-3 mb-1">
                                    <label for="ht-comment" class="text-[13px] font-medium text-regular">What they said</label>
                                    <span class="text-xs text-secondary tabular-nums">{{ form.controls.comment.value.length }} / {{ max.comment }}</span>
                                </div>
                                <boo-textarea id="ht-comment" formControlName="comment" label="The patient’s words" [rows]="5" [maxlength]="max.comment" />
                            </div>
                            <div class="sm:w-1/2 sm:pr-2">
                                <label for="ht-date" class="block mb-1 text-[13px] font-medium text-regular">Date</label>
                                <boo-datepicker id="ht-date" name="ht-date" formControlName="date" label="Pick a date" />
                                <p class="m-0 mt-1 text-xs text-secondary">Optional. The list is sorted by this date, newest first.</p>
                            </div>
                        </div>
                    </fieldset>

                    <div class="pt-6 border-t border-rowDivider"><fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Display</legend>
                        <boo-checkbox name="ht-active" formControlName="active" label="Active" />
                        <p class="m-0 mt-1 pl-6 text-xs text-secondary">Inactive testimonials are kept but not shown.</p>
                    </fieldset></div>
                </div>

                <footer class="flex-none px-6 py-4 border-t border-rowDivider flex items-center gap-2">
                    <button
                        *ngIf="testimonial && canDelete"
                        type="button"
                        boo-button
                        variant="ghost"
                        size="sm"
                        class="!text-danger"
                        [disabled]="submitting"
                        (click)="remove.emit(testimonial)"
                    ><physio-icon name="trash" [size]="15" aria-hidden="true" />Delete</button>
                    <div class="ml-auto flex items-center gap-2">
                        <button type="button" boo-button variant="secondary" size="sm" [disabled]="submitting" (click)="requestClose()">Cancel</button>
                        <button type="submit" boo-button variant="primary" size="sm" [loading]="submitting" [disabled]="!!testimonial && !form.dirty">
                            {{ testimonial ? 'Save changes' : 'Add testimonial' }}
                        </button>
                    </div>
                </footer>
            </form>
        </drawer>
    `,
})
export class HomeTestimonialEditDrawerComponent implements OnChanges {
    @Input() open = false;
    @Input() testimonial: Testimonial | null = null;
    @Input() canDelete = false;
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<{ testimonial: Testimonial | null; created: boolean }>();
    @Output() remove = new EventEmitter<Testimonial>();

    private readonly fb = inject(FormBuilder);
    private readonly srv = inject(HomeTestimonialService);
    private readonly dialogSrv = inject(DialogService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly host: HTMLElement = inject(ElementRef).nativeElement;

    readonly max = LIMITS;
    readonly ratingOptions = RATING_OPTIONS;
    readonly form = this.fb.group({
        patientName: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(LIMITS.patientName)]),
        rating: this.fb.nonNullable.control(5, [Validators.required, Validators.min(1), Validators.max(5)]),
        comment: this.fb.nonNullable.control('', Validators.maxLength(LIMITS.comment)),
        /** yyyy-MM-dd, or empty for no date. */
        date: this.fb.nonNullable.control(''),
        active: this.fb.nonNullable.control(true),
    });

    submitting = false;

    get dirty(): boolean {
        return this.open && this.form.dirty;
    }

    ngOnChanges(changes: SimpleChanges): void {
        const opened = changes['open']?.currentValue === true && !changes['open'].previousValue;
        const prev = changes['testimonial']?.previousValue as Testimonial | null | undefined;
        const swapped = !!changes['testimonial'] && this.testimonial?.id !== prev?.id;
        if (this.open && (opened || swapped)) this.fill(this.testimonial);
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.open) this.requestClose();
    }

    submit(): void {
        if (!this.open || this.submitting) return;
        this.form.markAllAsTouched();
        if (this.form.invalid) {
            setTimeout(() => this.host.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
            return;
        }

        const existing = this.testimonial;
        const body = this.buildBody();
        const save$: Observable<string> = existing
            ? this.srv.update(existing.id, body).pipe(map(() => existing.id))
            : this.srv.create(body).pipe(map(res => {
                if (!res?.success || !res.data) throw new Error('Testimonial was not created');
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
                    this.saved.emit({ testimonial: res?.success ? res.data : null, created: !existing });
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

    private fill(t: Testimonial | null): void {
        this.form.reset({
            patientName: t?.patientName ?? '',
            rating: t?.rating ?? 5,
            comment: t?.comment ?? '',
            date: t?.date ? t.date.slice(0, 10) : '',
            active: t?.active ?? true,
        });
    }

    private buildBody(): SaveTestimonialRequest {
        const v = this.form.getRawValue();
        return {
            patientName: v.patientName.trim(),
            rating: Number(v.rating),
            comment: v.comment.trim(),
            date: v.date || null,
            active: v.active,
        };
    }
}
