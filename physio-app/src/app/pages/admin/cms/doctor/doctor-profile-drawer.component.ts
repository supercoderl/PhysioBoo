import { NgIf } from '@angular/common';
import { Component, DestroyRef, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BooButtonComponent, BooIconComponent, BooInputComponent } from '@physioboo/ui';
import { finalize, map, switchMap } from 'rxjs/operators';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { BooTextareaComponent } from '../../../../components/textarea/boo-textarea/boo-textarea.component';
import { DoctorService } from '../../../../services/admin/doctor.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { ToastService } from '../../../../services/common/toast.service';
import { CustomScrollbarDirective } from '../../../../shared/directives/scrollbar.directive';
import { Doctor } from '../../../../shared/types/medical-staff.types';
import { displayName, initials } from './doctor.utils';

const MAX = { text: 2000, languages: 300 };
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const WHOLE = [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)];

/**
 * Edits the public side of a doctor's record: photo, bio, background and languages.
 *
 * PATCH /api/doctors/{id} replaces every field it accepts, including fees, booking rules and payroll details this
 * screen doesn't own. The record is read fresh just before saving and those values are sent back unchanged;
 * employment status is left out, which the server treats as "keep". Specialty and licence can't be changed by the
 * endpoint and are shown read-only. Photo changes go through their own endpoints and apply straight away.
 */
@Component({
    selector: 'cms-doctor-profile-drawer',
    standalone: true,
    imports: [NgIf, ReactiveFormsModule, DrawerComponent, BooButtonComponent, BooIconComponent, BooInputComponent, BooTextareaComponent, CustomScrollbarDirective],
    template: `
        <drawer [isOpen]="!!doctor" [isShowDialog]="form.dirty && !submitting" (close)="discard()">
            <form
                *ngIf="doctor as d"
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="doctor-edit-title"
                [formGroup]="form"
                (ngSubmit)="submit()"
                novalidate
                [attr.aria-busy]="submitting || !!photoBusy"
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="m-0 text-xs font-medium text-secondary">Edit public profile</p>
                        <h2 id="doctor-edit-title" class="m-0 mt-0.5 text-lg font-semibold leading-tight text-regular break-words">{{ name(d) }}</h2>
                        <p class="m-0 mt-0.5 text-xs text-secondary">What patients read about this doctor. Fields marked <span class="text-danger">*</span> are required.</p>
                    </div>
                    <button type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close profile form" (click)="requestClose()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-6" custom-scrollbar>
                    <!-- Photo: saved on its own, straight away -->
                    <fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Photo</legend>
                        <div class="flex items-center gap-4">
                            <span class="flex-none w-16 h-16 rounded-full overflow-hidden bg-primarySoft text-primaryDeep text-lg font-semibold flex items-center justify-center" aria-hidden="true">
                                <img *ngIf="photoUrl && !photoFailed; else initialsTpl" [src]="photoUrl" alt="" class="w-full h-full object-cover" (error)="photoFailed = true" />
                                <ng-template #initialsTpl>{{ initials(d) }}</ng-template>
                            </span>
                            <div class="min-w-0">
                                <div class="flex flex-wrap items-center gap-2">
                                    <button type="button" boo-button variant="secondary" size="sm" [disabled]="!!photoBusy || submitting" [loading]="photoBusy === 'upload'" (click)="photoInput.click()">
                                        <physio-icon *ngIf="photoBusy !== 'upload'" name="upload" [size]="15" aria-hidden="true" />{{ photoUrl ? 'Replace photo' : 'Upload photo' }}
                                    </button>
                                    <button *ngIf="photoUrl" type="button" boo-button variant="ghost" size="sm" class="!text-danger" [disabled]="!!photoBusy || submitting" [loading]="photoBusy === 'remove'" (click)="confirmRemovePhoto()">Remove</button>
                                </div>
                                <p class="m-0 mt-1.5 text-xs text-secondary">JPEG, PNG or WebP, up to 5 MB. Photo changes are saved right away.</p>
                                <input #photoInput type="file" class="hidden" accept="image/jpeg,image/png,image/webp" tabindex="-1" aria-hidden="true" (change)="onPhotoPicked($event)" />
                            </div>
                        </div>
                    </fieldset>

                    <!-- Fixed at registration -->
                    <div class="pt-6 border-t border-rowDivider">
                        <p class="m-0 mb-3 text-sm font-semibold text-regular">Specialty and licence</p>
                        <dl class="m-0 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div>
                                <dt class="text-xs text-secondary">Primary specialty</dt>
                                <dd class="m-0 mt-0.5 font-medium" [class.text-regular]="specialtyName" [class.text-placeholder]="!specialtyName">{{ specialtyName || (d.primarySpecialtyId ? 'Specialty unavailable' : 'No specialty set') }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Licence number</dt>
                                <dd class="m-0 mt-0.5 font-mono font-medium text-regular break-all">{{ d.medicalLicenseNumber || '—' }}</dd>
                            </div>
                        </dl>
                        <p class="m-0 mt-2 text-xs text-secondary">These are set when the doctor is registered and can't be changed from this page.</p>
                    </div>

                    <!-- Profile text -->
                    <div class="pt-6 border-t border-rowDivider"><fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Introduction</legend>
                        <div class="flex flex-col gap-4">
                            <div>
                                <div class="flex items-baseline justify-between gap-3 mb-1">
                                    <label for="de-bio" class="text-[13px] font-medium text-regular">Short bio</label>
                                    <span class="text-xs text-secondary tabular-nums" aria-live="polite">{{ form.controls.bio.value.length }} / {{ max.text }}</span>
                                </div>
                                <boo-textarea id="de-bio" formControlName="bio" label="One or two sentences shown on doctor cards" [rows]="3" [maxlength]="max.text" />
                            </div>
                            <div>
                                <div class="flex items-baseline justify-between gap-3 mb-1">
                                    <label for="de-about" class="text-[13px] font-medium text-regular">About</label>
                                    <span class="text-xs text-secondary tabular-nums" aria-live="polite">{{ form.controls.about.value.length }} / {{ max.text }}</span>
                                </div>
                                <boo-textarea id="de-about" formControlName="about" label="Background, approach to care and what patients can expect" [rows]="6" [maxlength]="max.text" />
                            </div>
                            <div>
                                <label for="de-langs" class="block mb-1 text-[13px] font-medium text-regular">Languages spoken</label>
                                <boo-input name="de-langs" formControlName="languages" label="e.g. Vietnamese, English" [maxlength]="max.languages" />
                                <p class="m-0 mt-1 text-xs text-secondary">Separate languages with commas.</p>
                            </div>
                        </div>
                    </fieldset></div>

                    <!-- Background -->
                    <div class="pt-6 border-t border-rowDivider"><fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Professional background</legend>
                        <div class="flex flex-col gap-4">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label for="de-exp" class="block mb-1 text-[13px] font-medium text-regular">Years of experience <span class="text-danger" aria-hidden="true">*</span></label>
                                    <boo-input name="de-exp" type="number" formControlName="yearsOfExperience" label="Years" />
                                </div>
                                <div>
                                    <label for="de-practice" class="block mb-1 text-[13px] font-medium text-regular">Years in practice <span class="text-danger" aria-hidden="true">*</span></label>
                                    <boo-input name="de-practice" type="number" formControlName="yearsOfPractice" label="Years" />
                                </div>
                                <div>
                                    <label for="de-pubs" class="block mb-1 text-[13px] font-medium text-regular">Publications <span class="text-danger" aria-hidden="true">*</span></label>
                                    <boo-input name="de-pubs" type="number" formControlName="publicationsCount" label="Number" />
                                </div>
                                <div>
                                    <label for="de-talks" class="block mb-1 text-[13px] font-medium text-regular">Conference talks <span class="text-danger" aria-hidden="true">*</span></label>
                                    <boo-input name="de-talks" type="number" formControlName="conferencePresentations" label="Number" />
                                </div>
                            </div>
                            <p class="m-0 -mt-2 text-xs text-secondary">Whole numbers, 0 or more.</p>
                            <div>
                                <label for="de-achieve" class="block mb-1 text-[13px] font-medium text-regular">Achievements</label>
                                <boo-textarea id="de-achieve" formControlName="archivements" label="Awards, fellowships and recognitions" [rows]="3" [maxlength]="max.text" />
                            </div>
                            <div>
                                <label for="de-research" class="block mb-1 text-[13px] font-medium text-regular">Research interests</label>
                                <boo-textarea id="de-research" formControlName="researchInterests" label="Areas the doctor studies or publishes in" [rows]="3" [maxlength]="max.text" />
                            </div>
                        </div>
                    </fieldset></div>
                </div>

                <footer class="flex-none px-6 py-4 border-t border-rowDivider flex items-center justify-end gap-2">
                    <button type="button" boo-button variant="secondary" size="sm" [disabled]="submitting" (click)="requestClose()">Cancel</button>
                    <button type="submit" boo-button variant="primary" size="sm" [loading]="submitting" [disabled]="!form.dirty || !!photoBusy">Save profile</button>
                </footer>
            </form>
        </drawer>
    `,
})
export class CmsDoctorProfileDrawerComponent implements OnChanges {
    /** The doctor being edited; null keeps the drawer closed. */
    @Input() doctor: Doctor | null = null;
    @Input() specialtyName: string | null = null;
    @Output() close = new EventEmitter<void>();
    /** The profile was saved; carries the record as the server now has it. */
    @Output() saved = new EventEmitter<Doctor>();
    /** The photo was replaced or removed (already saved); carries the refreshed record when it could be read. */
    @Output() photoChanged = new EventEmitter<Doctor>();

    private readonly fb = inject(FormBuilder);
    private readonly srv = inject(DoctorService);
    private readonly dialogSrv = inject(DialogService);
    private readonly toastSrv = inject(ToastService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly host: HTMLElement = inject(ElementRef).nativeElement;

    readonly max = MAX;
    readonly name = displayName;
    readonly initials = initials;

    readonly form = this.fb.group({
        bio: this.fb.nonNullable.control('', Validators.maxLength(MAX.text)),
        about: this.fb.nonNullable.control('', Validators.maxLength(MAX.text)),
        languages: this.fb.nonNullable.control('', Validators.maxLength(MAX.languages)),
        yearsOfExperience: this.fb.control<number | string | null>(0, WHOLE),
        yearsOfPractice: this.fb.control<number | string | null>(0, WHOLE),
        publicationsCount: this.fb.control<number | string | null>(0, WHOLE),
        conferencePresentations: this.fb.control<number | string | null>(0, WHOLE),
        archivements: this.fb.nonNullable.control('', Validators.maxLength(MAX.text)),
        researchInterests: this.fb.nonNullable.control('', Validators.maxLength(MAX.text)),
    });

    submitting = false;
    photoUrl: string | null = null;
    photoFailed = false;
    photoBusy: 'upload' | 'remove' | null = null;

    ngOnChanges(changes: SimpleChanges): void {
        const prev = changes['doctor']?.previousValue as Doctor | null | undefined;
        if (changes['doctor'] && this.doctor && this.doctor.id !== prev?.id) this.fill(this.doctor);
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.doctor) this.requestClose();
    }

    submit(): void {
        const d = this.doctor;
        if (!d || this.submitting || this.photoBusy) return;
        this.form.markAllAsTouched();
        if (this.form.invalid) {
            setTimeout(() => this.host.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')?.scrollIntoView({ block: 'center' }));
            return;
        }

        this.submitting = true;
        this.srv.search_by_id(d.id)
            .pipe(
                // Read the record just before writing, so values this form doesn't show are sent back as stored now.
                switchMap(res => {
                    if (!res?.success || !res.data) throw new Error('Doctor could not be read');
                    return this.srv.update(d.id, this.buildBody(res.data));
                }),
                switchMap(() => this.srv.search_by_id(d.id)),
                map(res => res?.success && res.data ? res.data : null),
                finalize(() => this.submitting = false),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: saved => {
                    this.form.markAsPristine();
                    this.saved.emit(saved ?? { ...d, ...this.buildProfile() });
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

    // Photo
    onPhotoPicked(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        input.value = '';
        const d = this.doctor;
        if (!file || !d || this.photoBusy) return;
        if (!PHOTO_TYPES.includes(file.type)) {
            this.toastSrv.error('Choose a JPEG, PNG or WebP image.');
            return;
        }
        if (file.size > PHOTO_MAX_BYTES) {
            this.toastSrv.error('The photo must be 5 MB or smaller.');
            return;
        }

        this.photoBusy = 'upload';
        this.srv.uploadAvatar(d.id, file)
            .pipe(finalize(() => this.photoBusy = null), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: res => {
                    if (!res?.success || !res.data) {
                        this.toastSrv.error('The photo was not saved. Please try again.');
                        return;
                    }
                    this.setPhoto(res.data);
                    this.toastSrv.success(displayName(d), 'Photo updated');
                    this.notifyPhoto(d, res.data);
                },
                // The global HTTP error toast reports the failure; the old photo stays.
                error: () => undefined,
            });
    }

    confirmRemovePhoto(): void {
        const d = this.doctor;
        if (!d || this.photoBusy) return;
        this.dialogSrv.confirm(
            `Remove ${displayName(d)}'s photo? The public profile will show their initials instead.`,
            () => this.removePhoto(d),
            'Remove photo',
            'warning',
            'Remove photo',
            'Keep photo',
        );
    }

    private removePhoto(d: Doctor): void {
        this.photoBusy = 'remove';
        this.srv.removeAvatar(d.id)
            .pipe(finalize(() => this.photoBusy = null), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.setPhoto(null);
                    this.toastSrv.success(displayName(d), 'Photo removed');
                    this.notifyPhoto(d, null);
                },
                error: () => undefined,
            });
    }

    /** Hands the page the record with its new photo, read back when possible. */
    private notifyPhoto(d: Doctor, url: string | null): void {
        this.srv.search_by_id(d.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: res => this.photoChanged.emit(res?.success && res.data ? res.data : { ...d, avatar: url }),
                error: () => this.photoChanged.emit({ ...d, avatar: url }),
            });
    }

    private setPhoto(url: string | null): void {
        this.photoUrl = url;
        this.photoFailed = false;
    }

    private fill(d: Doctor): void {
        this.setPhoto(d.avatar);
        this.form.reset({
            bio: d.bio ?? '',
            about: d.about ?? '',
            languages: (d.languagesSpoken ?? []).join(', '),
            yearsOfExperience: d.yearsOfExperience ?? 0,
            yearsOfPractice: d.yearsOfPractice ?? 0,
            publicationsCount: d.publicationsCount ?? 0,
            conferencePresentations: d.conferencePresentations ?? 0,
            archivements: d.archivements ?? '',
            researchInterests: d.researchInterests ?? '',
        });
    }

    /** The fields this form owns, as the API names them. */
    private buildProfile() {
        const v = this.form.getRawValue();
        const languages = [...new Set(v.languages.split(',').map(l => l.trim()).filter(Boolean))];
        return {
            bio: v.bio.trim() || null,
            about: v.about.trim() || null,
            archivements: v.archivements.trim() || null,
            researchInterests: v.researchInterests.trim() || null,
            languagesSpoken: languages,
            yearsOfExperience: Number(v.yearsOfExperience),
            yearsOfPractice: Number(v.yearsOfPractice),
            publicationsCount: Number(v.publicationsCount),
            conferencePresentations: Number(v.conferencePresentations),
        };
    }

    /** The full update body: this form's fields, plus everything else exactly as currently stored. */
    private buildBody(current: Doctor) {
        return {
            ...this.buildProfile(),
            consultationFeeMin: current.consultationFeeMin,
            consultationFeeMax: current.consultationFeeMax,
            followUpFee: current.followUpFee,
            emergencyConsultationFee: current.emergencyConsultationFee,
            homeVisitFee: current.homeVisitFee,
            videoConsultationFee: current.videoConsultationFee,
            consultationDuration: current.consultationDuration,
            bufferTime: current.bufferTime,
            advanceBookingDays: current.advanceBookingDays,
            cancellationPolicy: current.cancellationPolicy,
            isAvailableOnline: current.isAvailableOnline,
            isAvailableHomeVisit: current.isAvailableHomeVisit,
            isAvailableEmergency: current.isAvailableEmergency,
            bankAccountDetails: current.bankAccountDetails,
            panNumber: current.panNumber,
            gstin: current.gstin,
            // Left out on purpose: the server keeps the stored employment status when this is null.
            employmentStatus: null,
        };
    }
}
