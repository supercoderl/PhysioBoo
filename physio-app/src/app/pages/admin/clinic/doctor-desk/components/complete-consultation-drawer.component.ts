import { NgIf } from '@angular/common';
import { Component, DestroyRef, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { BooButtonComponent, BooIconComponent } from '@physioboo/ui';
import { finalize } from 'rxjs/operators';
import { BooDatepickerComponent } from '../../../../../components/date-picker/boo-date-picker.component';
import { DrawerComponent } from '../../../../../components/drawer/drawer.component';
import { BooTextareaComponent } from '../../../../../components/textarea/boo-textarea/boo-textarea.component';
import { AppointmentService } from '../../../../../services/admin/appointment.service';
import { DialogService } from '../../../../../services/common/dialog.service';
import { ToastService } from '../../../../../services/common/toast.service';
import { CustomScrollbarDirective } from '../../../../../shared/directives/scrollbar.directive';
import { QueuePatient } from '../../../../../shared/types/doctor-desk.types';

const TEXT_MAX = 2000;

function todayIso(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function notBlank(control: AbstractControl<string>): ValidationErrors | null {
    return control.value.trim() ? null : { required: true };
}

function notInPast(control: AbstractControl<string>): ValidationErrors | null {
    return !control.value || control.value >= todayIso() ? null : { past: true };
}

/**
 * Ends a consultation (PATCH /api/appointments/{id}/complete). The server stores the diagnosis, the treatment plan and
 * the follow-up date; it has nowhere to keep doctor notes, so the form does not ask for them.
 */
@Component({
    selector: 'complete-consultation-drawer',
    standalone: true,
    imports: [NgIf, ReactiveFormsModule, DrawerComponent, BooButtonComponent, BooIconComponent, BooTextareaComponent, BooDatepickerComponent, CustomScrollbarDirective],
    template: `
        <drawer [isOpen]="isOpen" [isShowDialog]="form.dirty" (close)="discard()">
            <form
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="cc-title"
                [attr.inert]="isOpen ? null : ''"
                [formGroup]="form"
                (ngSubmit)="submit()"
                novalidate
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <h2 id="cc-title" class="m-0 text-lg font-semibold leading-tight text-regular">Complete consultation</h2>
                        <p *ngIf="patient" class="m-0 mt-0.5 text-xs text-secondary truncate">
                            {{ patient.queueNumber }} · {{ patient.name || 'Unnamed patient' }} · {{ patient.age }} y · {{ patient.gender }}
                        </p>
                    </div>
                    <button type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close" (click)="requestClose()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-5" custom-scrollbar>
                    <p class="m-0 text-xs text-secondary">Fields marked <span class="text-danger">*</span> are required. The visit is closed when you save.</p>

                    <div>
                        <label for="cc-diagnosis" class="block mb-1 text-[13px] font-medium text-regular">Diagnosis <span class="text-danger" aria-hidden="true">*</span></label>
                        <boo-textarea id="cc-diagnosis" name="cc-diagnosis" formControlName="diagnosis" label="Diagnosis" [rows]="4" [maxlength]="textMax" />
                    </div>

                    <div>
                        <label for="cc-plan" class="block mb-1 text-[13px] font-medium text-regular">Treatment plan</label>
                        <boo-textarea id="cc-plan" name="cc-plan" formControlName="treatmentPlan" label="Treatment plan" [rows]="4" [maxlength]="textMax" />
                    </div>

                    <div class="max-w-xs">
                        <label for="cc-follow-up" class="block mb-1 text-[13px] font-medium text-regular">Follow-up date</label>
                        <boo-datepicker id="cc-follow-up" name="cc-follow-up" formControlName="followUpDate" label="Optional" [min]="today" />
                    </div>
                </div>

                <footer class="flex-none px-6 py-4 border-t border-rowDivider flex items-center justify-end gap-2">
                    <button type="button" boo-button variant="secondary" size="sm" [disabled]="submitting" (click)="requestClose()">Cancel</button>
                    <button type="submit" boo-button variant="primary" size="sm" [loading]="submitting">
                        <physio-icon *ngIf="!submitting" name="check-circle" [size]="15" aria-hidden="true" />Complete consultation
                    </button>
                </footer>
            </form>
        </drawer>
    `,
})
export class CompleteConsultationDrawerComponent implements OnChanges {
    @Input() isOpen = false;
    @Input() patient: QueuePatient | null = null;
    @Output() close = new EventEmitter<void>();
    /** The server accepted the completion. */
    @Output() completed = new EventEmitter<QueuePatient>();

    private readonly fb = inject(FormBuilder);
    private readonly host: HTMLElement = inject(ElementRef).nativeElement;
    private readonly destroyRef = inject(DestroyRef);
    private readonly appointmentSrv = inject(AppointmentService);
    private readonly dialogSrv = inject(DialogService);
    private readonly toastSrv = inject(ToastService);

    readonly textMax = TEXT_MAX;
    readonly today = todayIso();

    readonly form = this.fb.nonNullable.group({
        diagnosis: ['', [Validators.maxLength(TEXT_MAX), notBlank]],
        treatmentPlan: ['', Validators.maxLength(TEXT_MAX)],
        followUpDate: ['', notInPast],
    });

    submitting = false;

    ngOnChanges(changes: SimpleChanges): void {
        // Another visit starts from a clean form; reopening the same visit keeps what was typed.
        const patient = changes['patient'];
        if (patient && !patient.firstChange && patient.previousValue?.appointmentId !== patient.currentValue?.appointmentId) {
            this.form.reset();
        }
        if (changes['isOpen']?.currentValue) {
            // Wait for the drawer's slide-in before moving focus into it.
            setTimeout(() => this.host.querySelector<HTMLElement>('textarea')?.focus(), 350);
        }
    }

    submit(): void {
        if (this.submitting || !this.patient) return;
        this.form.markAllAsTouched();
        if (this.form.invalid) {
            setTimeout(() => this.host.querySelector<HTMLElement>('.ng-invalid textarea, .ng-invalid input')?.focus());
            return;
        }

        const v = this.form.getRawValue();
        const patient = this.patient;
        this.submitting = true;
        // Failures are reported by the global HTTP error toast; the form keeps what was entered.
        this.appointmentSrv
            .completeConsultation(patient.appointmentId, {
                diagnosis: v.diagnosis.trim(),
                treatmentPlan: v.treatmentPlan.trim() || null,
                followUpDate: v.followUpDate || null,
            })
            .pipe(finalize(() => this.submitting = false), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.toastSrv.success(`${patient.name || 'Patient'} · ${patient.queueNumber}`, 'Consultation completed');
                    this.form.reset();
                    this.completed.emit(patient);
                },
                error: () => undefined,
            });
    }

    requestClose(): void {
        if (this.submitting) return;
        if (this.form.dirty) this.dialogSrv.confirmUnsavedChanges(() => this.discard());
        else this.close.emit();
    }

    /** Called once leaving is confirmed (the drawer backdrop asks itself when the form is dirty). */
    discard(): void {
        if (this.submitting) return;
        this.form.reset();
        this.close.emit();
    }
}
