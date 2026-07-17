import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { finalize, firstValueFrom } from "rxjs";
import { ComplaintService } from "../../../../../services/admin/complaint.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING, SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING } from "../../../../../shared/constants/error.constant";
import { ComplaintCategory, ComplaintPriority, ComplaintStatus } from "../../../../../shared/enums/complaint";
import { SharedModule } from "../../../../../shared/shared-imports";
import { Complaint, CreateComplaintRequest, UpdateComplaintRequest } from "../../../../../shared/types/complaint.types";
import { BooButtonAdminComponent } from "../../../../button/boo-button-admin/boo-button-admin.component";
import { DrawerComponent } from "../../../../drawer/drawer.component";
import { BooIconComponent } from "../../../../icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../textarea/boo-textarea/boo-textarea.component";

@Component({
    selector: 'crm-complaint-drawer',
    standalone: true,
    imports: [
        SharedModule,
        DrawerComponent,
        BooInputComponent,
        BooIconComponent,
        BooButtonAdminComponent,
        BooSelectComponent,
        BooTextareaComponent
    ],
    template: `
        <drawer [isOpen]="isOpen" [isShowDialog]="true" [width]="720" (close)="onClose()">
            <div class="flex flex-col h-full bg-surface relative">

                <!-- Sticky header -->
                <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-surface z-10 sticky top-0">
                    <div>
                        <h2 class="text-xl font-bold text-primary leading-none mb-1">
                            {{ currentId ? 'Edit Complaint' : 'Log New Complaint' }}
                        </h2>
                        <p class="text-sm text-secondary m-0">Patient complaint and support ticket details</p>
                    </div>
                    <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors" aria-label="Close drawer">
                        <boo-icon name="x" [size]="20"></boo-icon>
                    </button>
                </div>

                <!-- Scrollable body — validate on blur per Angular + UX skill guidance -->
                <div #scrollContainer class="flex-1 overflow-y-auto bg-surface" custom-scrollbar [formGroup]="form">

                    <!-- Loading overlay while fetching detail -->
                    <div *ngIf="loadingSrv.isLoading('search-by-id') && currentId"
                        class="absolute inset-0 bg-surface/80 z-50 flex items-center justify-center backdrop-blur-sm">
                        <boo-icon name="loader" class="animate-spin text-primary" [size]="32"></boo-icon>
                    </div>

                    <!-- Status (edit-only) — prominent at top -->
                    <ng-container *ngIf="currentId">
                        <div class="px-6 pt-5 pb-4">
                            <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-3">Status</h3>
                            <div class="grid grid-cols-4 gap-2">
                                <button *ngFor="let opt of statusOptions" type="button"
                                    (click)="setStatus(opt.value)"
                                    class="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-medium transition-all cursor-pointer"
                                    [ngClass]="form.get('status')?.value === opt.value
                                        ? opt.activeClass
                                        : 'border-gray-200 text-gray-500 hover:border-gray-300'">
                                    <boo-icon [name]="opt.icon" [size]="16"></boo-icon>
                                    {{ opt.label }}
                                </button>
                            </div>
                        </div>
                        <div class="h-px bg-gray-100 mx-6"></div>
                    </ng-container>

                    <!-- Patient Info -->
                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Patient Info</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-input label="Patient Name" formControlName="patientName" placeholder="Full name" required></boo-input>
                            <boo-input label="Patient ID" formControlName="patientId" placeholder="Optional"></boo-input>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-input label="Contact Email" type="email" formControlName="email" placeholder="patient@example.com" required></boo-input>
                            <boo-input label="Contact Phone" type="tel" formControlName="phone" placeholder="+84 xxx xxx xxx" required></boo-input>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <!-- Classification -->
                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Classification</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-select label="Category" formControlName="category" [options]="categoryOptions" required></boo-select>
                            <boo-select label="Priority" formControlName="priority" [options]="priorityOptions" required></boo-select>
                        </div>
                        <boo-select label="Assigned To" formControlName="assignedTo" [options]="staffOptions"></boo-select>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <!-- Complaint Detail -->
                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Complaint Detail</h3>
                        <boo-input label="Subject" formControlName="subject" placeholder="Brief description of the issue" required></boo-input>
                        <boo-textarea label="Detailed Description" formControlName="description" [rows]="5"
                            placeholder="Provide full context — dates, departments involved, expected vs actual outcome..." required></boo-textarea>
                    </div>
                </div>

                <!-- Sticky footer -->
                <div class="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between z-20 sticky bottom-0">
                    <button *ngIf="currentId" (click)="onDelete()"
                        class="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1.5 transition-colors"
                        aria-label="Delete complaint">
                        <boo-icon name="trash-2" [size]="16"></boo-icon>
                        Delete
                    </button>
                    <div class="flex gap-3 ml-auto">
                        <boo-button-admin background="transparent" (click)="onClose()">Cancel</boo-button-admin>
                        <boo-button-admin textColor="white" (click)="onSave()"
                            [loading]="loadingSrv.isLoading('update') || loadingSrv.isLoading('create')">
                            {{ currentId ? 'Save Changes' : 'Submit Complaint' }}
                        </boo-button-admin>
                    </div>
                </div>
            </div>
        </drawer>
    `
})
export class CrmComplaintDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Input() currentId: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saveSuccess = new EventEmitter<Complaint>();
    @Output() delete = new EventEmitter<string>();
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;
    form: FormGroup;

    readonly statusOptions = [
        { label: 'Pending', value: ComplaintStatus.Pending, icon: 'clock', activeClass: 'border-gray-400 bg-gray-50 text-gray-700' },
        { label: 'In Progress', value: ComplaintStatus.InProgress, icon: 'loader', activeClass: 'border-blue-400 bg-blue-50 text-blue-700' },
        { label: 'Resolved', value: ComplaintStatus.Resolved, icon: 'check-circle', activeClass: 'border-green-400 bg-green-50 text-green-700' },
        { label: 'Closed', value: ComplaintStatus.Closed, icon: 'archive', activeClass: 'border-purple-400 bg-purple-50 text-purple-700' },
    ];

    readonly categoryOptions = [
        { label: 'Medical Services', value: ComplaintCategory.MedicalServices },
        { label: 'Billing & Insurance', value: ComplaintCategory.BillingInsurance },
        { label: 'Facility & Equipment', value: ComplaintCategory.FacilityEquipment },
        { label: 'Staff Behavior', value: ComplaintCategory.StaffBehavior },
        { label: 'Appointment Issues', value: ComplaintCategory.AppointmentIssues },
        { label: 'Pharmacy Services', value: ComplaintCategory.PharmacyServices },
        { label: 'Other', value: ComplaintCategory.Other },
    ];

    readonly priorityOptions = [
        { label: 'Low', value: ComplaintPriority.Low },
        { label: 'Medium', value: ComplaintPriority.Medium },
        { label: 'High', value: ComplaintPriority.High },
        { label: 'Urgent', value: ComplaintPriority.Urgent },
    ];

    readonly staffOptions = [
        { label: 'Dr. Smith', value: 'Dr. Smith' },
        { label: 'Dr. Johnson', value: 'Dr. Johnson' },
        { label: 'Dr. Williams', value: 'Dr. Williams' },
        { label: 'Nurse Brown', value: 'Nurse Brown' },
        { label: 'Admin Davis', value: 'Admin Davis' },
    ];
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private fb: FormBuilder,
        private toastSrv: ToastService,
        private complaintSrv: ComplaintService,
        protected loadingSrv: LocalLoadingService
    ) {
        // updateOn: 'blur' — Angular stack guideline: validate after user leaves field
        this.form = this.initForm();
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
            patientName: [null, { validators: [Validators.required], updateOn: 'blur' }],
            patientId: [null],
            email: [null, { validators: [Validators.required, Validators.email], updateOn: 'blur' }],
            phone: [null, { validators: [Validators.required], updateOn: 'blur' }],
            category: [null, [Validators.required]],
            priority: [ComplaintPriority.Medium, [Validators.required]],
            status: [ComplaintStatus.Pending],
            subject: [null, { validators: [Validators.required], updateOn: 'blur' }],
            description: [null, { validators: [Validators.required], updateOn: 'blur' }],
            assignedTo: [null],
        });
    }

    loadDetail(id: string) {
        this.form.disable();
        this.complaintSrv.search_by_id(id)
            .pipe(finalize(() => this.form.enable()))
            .subscribe(res => {
                if (!res.success || !res.data) return;
                const c = res.data;
                this.form.patchValue({
                    patientName: c.patientName,
                    patientId: c.patientId,
                    email: c.email,
                    phone: c.phone,
                    category: c.category,
                    priority: c.priority,
                    status: c.status,
                    subject: c.subject,
                    description: c.description,
                    assignedTo: c.assignedTo,
                });
            });
    }

    setStatus(status: ComplaintStatus) {
        this.form.patchValue({ status });
        this.form.markAsDirty();
    }

    private buildCreate(): CreateComplaintRequest {
        const v = this.form.getRawValue();
        return {
            patientName: v.patientName,
            patientId: v.patientId ?? null,
            email: v.email,
            phone: v.phone,
            category: v.category,
            priority: v.priority,
            subject: v.subject,
            description: v.description,
            assignedTo: v.assignedTo ?? null,
        };
    }

    private buildUpdate(): UpdateComplaintRequest {
        const v = this.form.getRawValue();
        return {
            patientName: v.patientName,
            patientId: v.patientId ?? null,
            email: v.email,
            phone: v.phone,
            category: v.category,
            priority: v.priority,
            status: v.status,
            subject: v.subject,
            description: v.description,
            assignedTo: v.assignedTo ?? null,
        };
    }

    async onSave() {
        if (this.form.invalid) {
            this.toastSrv.error('Please check required fields');
            this.form.markAllAsTouched();
            return;
        }

        try {
            let id: string;
            if (this.currentId) {
                await firstValueFrom(this.complaintSrv.update(this.currentId, this.buildUpdate()));
                id = this.currentId;
            } else {
                const createRes = await firstValueFrom(this.complaintSrv.create(this.buildCreate()));
                if (!createRes.success || !createRes.data) {
                    this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
                    return;
                }
                id = createRes.data;
            }

            const response = await firstValueFrom(this.complaintSrv.search_by_id(id));
            if (response.success && response.data) {
                this.saveSuccess.emit(response.data);
            } else {
                this.toastSrv.error(SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING);
            }
        } catch {
            this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
        }
    }

    resetForm() {
        this.form.reset({
            patientName: null,
            patientId: null,
            email: null,
            phone: null,
            category: null,
            priority: ComplaintPriority.Medium,
            status: ComplaintStatus.Pending,
            subject: null,
            description: null,
            assignedTo: null,
        });
    }

    onClose() {
        if (this.scrollContainer) this.scrollContainer.nativeElement.scrollTop = 0;
        this.close.emit();
    }

    onDelete() {
        if (this.currentId) this.delete.emit(this.currentId);
    }
    // #endregion
}
