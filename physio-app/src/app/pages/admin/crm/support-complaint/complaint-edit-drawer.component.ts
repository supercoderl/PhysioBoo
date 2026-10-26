import { NgIf } from '@angular/common';
import { Component, DestroyRef, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { BooButtonComponent, BooIconComponent, BooInputComponent } from '@physioboo/ui';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { BooSelectComponent } from '../../../../components/select/boo-select/boo-select.component';
import { BooTextareaComponent } from '../../../../components/textarea/boo-textarea/boo-textarea.component';
import { ComplaintService } from '../../../../services/admin/complaint.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { CustomScrollbarDirective } from '../../../../shared/directives/scrollbar.directive';
import { ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../../../../shared/enums/complaint';
import { Complaint, UpdateComplaintRequest } from '../../../../shared/types/complaint.types';
import { CATEGORY_OPTIONS, COMPLAINT_LIMITS, PRIORITY_OPTIONS, STATUS_OPTIONS, isGuid, subjectOf, ticketOf } from './complaint.utils';

function patientIdText(control: AbstractControl<string>): ValidationErrors | null {
    const v = control.value?.trim();
    return !v || isGuid(v) ? null : { guid: true };
}

/**
 * Log (POST /api/complaints) or edit (PATCH /api/complaints/{id}) a complaint. The update replaces every field, so the
 * form always sends the whole complaint. Failures are reported by the global HTTP error toast and the form keeps what
 * was entered.
 */
@Component({
    selector: 'crm-complaint-edit-drawer',
    standalone: true,
    imports: [
        NgIf,
        ReactiveFormsModule,
        DrawerComponent,
        BooButtonComponent,
        BooIconComponent,
        BooInputComponent,
        BooSelectComponent,
        BooTextareaComponent,
        CustomScrollbarDirective,
    ],
    template: `
        <drawer [isOpen]="open" [isShowDialog]="form.dirty && !submitting" (close)="discard()">
            <form
                *ngIf="open"
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="complaint-edit-title"
                [formGroup]="form"
                (ngSubmit)="submit()"
                novalidate
                [attr.aria-busy]="submitting"
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="m-0 text-xs font-medium text-secondary">
                            <ng-container *ngIf="complaint; else newTpl">Edit · <span class="font-mono tabular-nums">{{ ticket(complaint) }}</span></ng-container>
                            <ng-template #newTpl>New complaint</ng-template>
                        </p>
                        <h2 id="complaint-edit-title" class="m-0 mt-0.5 text-lg font-semibold leading-tight text-regular break-words">
                            {{ complaint ? subject(complaint) : 'Log a complaint' }}
                        </h2>
                        <p class="m-0 mt-0.5 text-xs text-secondary">
                            <ng-container *ngIf="!complaint">Received by phone, email or at the desk. New tickets start as pending. </ng-container>Fields marked <span class="text-danger">*</span> are required.
                        </p>
                    </div>
                    <button type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close complaint form" (click)="requestClose()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-6" custom-scrollbar>
                    <!-- The complaint -->
                    <fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Complaint</legend>
                        <div class="flex flex-col gap-4">
                            <div>
                                <label for="ce-subject" class="block mb-1 text-[13px] font-medium text-regular">Subject <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-input name="ce-subject" formControlName="subject" label="A short summary of the issue" [maxlength]="limits.subject" />
                            </div>
                            <div>
                                <label for="ce-description" class="block mb-1 text-[13px] font-medium text-regular">What happened <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-textarea
                                    id="ce-description"
                                    formControlName="description"
                                    label="In the patient's words: when, where, who was involved, and what they expect"
                                    [rows]="6"
                                    [maxlength]="limits.description"
                                />
                                <p class="m-0 mt-1 text-xs text-secondary text-right tabular-nums">{{ form.controls.description.value.length }} / {{ limits.description }}</p>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label for="ce-category" class="block mb-1 text-[13px] font-medium text-regular">Category <span class="text-danger" aria-hidden="true">*</span></label>
                                    <boo-select id="ce-category" formControlName="category" label="Category" required [options]="categoryOptions" />
                                </div>
                                <div>
                                    <label for="ce-priority" class="block mb-1 text-[13px] font-medium text-regular">Priority <span class="text-danger" aria-hidden="true">*</span></label>
                                    <boo-select id="ce-priority" formControlName="priority" label="Priority" required [searchable]="false" [options]="priorityOptions" />
                                </div>
                                <div *ngIf="complaint">
                                    <label for="ce-status" class="block mb-1 text-[13px] font-medium text-regular">Status <span class="text-danger" aria-hidden="true">*</span></label>
                                    <boo-select id="ce-status" formControlName="status" label="Status" required [searchable]="false" [options]="statusOptions" />
                                </div>
                            </div>
                        </div>
                    </fieldset>

                    <!-- Who raised it -->
                    <div class="pt-6 border-t border-rowDivider"><fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Raised by</legend>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="sm:col-span-2">
                                <label for="ce-name" class="block mb-1 text-[13px] font-medium text-regular">Full name <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-input name="ce-name" formControlName="patientName" label="e.g. Nguyen Van An" [maxlength]="limits.patientName" />
                            </div>
                            <div>
                                <label for="ce-phone" class="block mb-1 text-[13px] font-medium text-regular">Phone <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-input name="ce-phone" type="tel" formControlName="phone" label="e.g. 0901 234 567" [maxlength]="limits.phone" />
                            </div>
                            <div>
                                <label for="ce-email" class="block mb-1 text-[13px] font-medium text-regular">Email <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-input name="ce-email" type="email" formControlName="email" label="name@example.com" [maxlength]="limits.email" />
                            </div>
                            <div class="sm:col-span-2">
                                <label for="ce-patient" class="block mb-1 text-[13px] font-medium text-regular">Patient record ID <span class="font-normal text-secondary">(optional)</span></label>
                                <boo-input name="ce-patient" formControlName="patientId" label="Links the ticket to an existing patient record" [maxlength]="36" />
                                <p *ngIf="form.controls.patientId.touched && form.controls.patientId.hasError('guid'); else patientHintTpl" class="m-0 mt-1 text-xs text-danger" role="alert">
                                    Enter a full patient record ID, or leave this empty.
                                </p>
                                <ng-template #patientHintTpl>
                                    <p class="m-0 mt-1 text-xs text-secondary">The record must already exist; the server checks it when you save.</p>
                                </ng-template>
                            </div>
                        </div>
                    </fieldset></div>

                    <!-- Owner -->
                    <div class="pt-6 border-t border-rowDivider"><fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Handling</legend>
                        <div class="flex items-end justify-between gap-2 mb-1">
                            <label for="ce-owner" class="block text-[13px] font-medium text-regular">Owner</label>
                            <button
                                *ngIf="me && form.controls.assignedTo.value !== me"
                                type="button"
                                boo-button
                                variant="link"
                                size="sm"
                                classname="!h-auto"
                                (click)="assignToMe()"
                            >Assign to me</button>
                        </div>
                        <boo-input name="ce-owner" formControlName="assignedTo" label="Who will look into this" [maxlength]="limits.assignedTo" />
                    </fieldset></div>
                </div>

                <footer class="flex-none px-6 py-4 border-t border-rowDivider flex items-center justify-end gap-2">
                    <button type="button" boo-button variant="secondary" size="sm" [disabled]="submitting" (click)="requestClose()">Cancel</button>
                    <button type="submit" boo-button variant="primary" size="sm" [loading]="submitting" [disabled]="!!complaint && !form.dirty">
                        {{ complaint ? 'Save changes' : 'Log complaint' }}
                    </button>
                </footer>
            </form>
        </drawer>
    `,
})
export class CrmComplaintEditDrawerComponent implements OnChanges {
    /** The drawer is open while this is true. */
    @Input() open = false;
    /** The complaint being edited; null logs a new one. */
    @Input() complaint: Complaint | null = null;
    /** The signed-in user's name, for "Assign to me". */
    @Input() me: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<{ complaint: Complaint; created: boolean }>();

    private readonly fb = inject(FormBuilder);
    private readonly complaintSrv = inject(ComplaintService);
    private readonly dialogSrv = inject(DialogService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly host: HTMLElement = inject(ElementRef).nativeElement;

    readonly limits = COMPLAINT_LIMITS;
    readonly categoryOptions = CATEGORY_OPTIONS;
    readonly priorityOptions = PRIORITY_OPTIONS;
    readonly statusOptions = STATUS_OPTIONS;
    readonly subject = subjectOf;
    readonly ticket = ticketOf;

    readonly form = this.fb.nonNullable.group({
        subject: ['', [Validators.required, Validators.maxLength(COMPLAINT_LIMITS.subject)]],
        description: ['', [Validators.required, Validators.maxLength(COMPLAINT_LIMITS.description)]],
        category: this.fb.control<ComplaintCategory | null>(null, Validators.required),
        priority: this.fb.nonNullable.control<ComplaintPriority>(ComplaintPriority.Medium, Validators.required),
        status: this.fb.nonNullable.control<ComplaintStatus>(ComplaintStatus.Pending, Validators.required),
        patientName: ['', [Validators.required, Validators.maxLength(COMPLAINT_LIMITS.patientName)]],
        phone: ['', [Validators.required, Validators.maxLength(COMPLAINT_LIMITS.phone)]],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(COMPLAINT_LIMITS.email)]],
        patientId: ['', patientIdText],
        assignedTo: ['', Validators.maxLength(COMPLAINT_LIMITS.assignedTo)],
    });

    submitting = false;

    ngOnChanges(changes: SimpleChanges): void {
        // Opening the drawer starts from the complaint's saved values, or a blank form for a new one.
        if (changes['open'] && this.open) this.fill(this.complaint);
        else if (changes['complaint'] && this.open && this.complaint?.id !== (changes['complaint'].previousValue as Complaint | null)?.id) this.fill(this.complaint);
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.open) this.requestClose();
    }

    assignToMe(): void {
        if (!this.me) return;
        this.form.controls.assignedTo.setValue(this.me);
        this.form.controls.assignedTo.markAsDirty();
    }

    submit(): void {
        if (!this.open || this.submitting) return;
        this.form.markAllAsTouched();
        if (this.form.invalid) {
            setTimeout(() => this.host.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')?.scrollIntoView({ block: 'center' }));
            return;
        }

        const body = this.buildRequest();
        const editing = this.complaint;
        this.submitting = true;
        const id$: Observable<string> = editing
            ? this.complaintSrv.update(editing.id, body).pipe(map(() => editing.id))
            : this.complaintSrv.create(this.createBody(body)).pipe(map(res => {
                if (!res?.success || !res.data) throw new Error('No id returned');
                return res.data;
            }));

        id$
            .pipe(
                // The save returns only an id; read the ticket back so the list shows what the server stored.
                switchMap(id => this.complaintSrv.search_by_id(id).pipe(
                    map(res => res?.success && res.data ? res.data : this.fallback(id, body)),
                    catchError(() => of(this.fallback(id, body))),
                )),
                finalize(() => this.submitting = false),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: complaint => {
                    this.form.markAsPristine();
                    this.saved.emit({ complaint, created: !editing });
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

    private fill(c: Complaint | null): void {
        this.form.reset({
            subject: c?.subject ?? '',
            description: c?.description ?? '',
            category: c?.category ?? null,
            priority: c?.priority ?? ComplaintPriority.Medium,
            status: c?.status ?? ComplaintStatus.Pending,
            patientName: c?.patientName ?? '',
            phone: c?.phone ?? '',
            email: c?.email ?? '',
            patientId: c?.patientId ?? '',
            assignedTo: c?.assignedTo ?? '',
        });
    }

    private buildRequest(): UpdateComplaintRequest {
        const v = this.form.getRawValue();
        return {
            subject: v.subject.trim(),
            description: v.description.trim(),
            category: v.category!,
            priority: v.priority,
            status: v.status,
            patientName: v.patientName.trim(),
            phone: v.phone.trim(),
            email: v.email.trim(),
            patientId: v.patientId.trim() || null,
            assignedTo: v.assignedTo.trim() || null,
        };
    }

    /** New tickets always start as pending on the server, so the create body carries no status. */
    private createBody({ status: _status, ...rest }: UpdateComplaintRequest) {
        return rest;
    }

    private fallback(id: string, body: UpdateComplaintRequest): Complaint {
        const now = new Date();
        return {
            ...body,
            id,
            ticketNumber: this.complaint?.ticketNumber ?? '',
            status: this.complaint ? body.status : ComplaintStatus.Pending,
            createdAt: this.complaint?.createdAt ?? now,
            updatedAt: this.complaint ? now : null,
            resolvedAt: this.complaint?.resolvedAt ?? null,
        };
    }
}
