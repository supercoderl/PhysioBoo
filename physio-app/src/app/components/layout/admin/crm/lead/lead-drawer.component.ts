import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { finalize, firstValueFrom } from "rxjs";
import { LeadService } from "../../../../../services/admin/lead.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING, SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING } from "../../../../../shared/constants/error.constant";
import { LeadPriority, LeadStatus } from "../../../../../shared/enums/lead";
import { SharedModule } from "../../../../../shared/shared-imports";
import { CreateLeadRequest, Lead, UpdateLeadRequest } from "../../../../../shared/types/lead.types";
import { BooButtonAdminComponent } from "../../../../button/boo-button-admin/boo-button-admin.component";
import { DrawerComponent } from "../../../../drawer/drawer.component";
import { BooIconComponent } from "../../../../icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../textarea/boo-textarea/boo-textarea.component";

@Component({
    selector: 'crm-lead-drawer',
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
        <drawer [isOpen]="isOpen" [isShowDialog]="true" [width]="680" (close)="onClose()">
            <div class="flex flex-col h-full bg-surface relative">
                <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-surface z-10 sticky top-0">
                    <div>
                        <h2 class="text-xl font-bold text-primary leading-none mb-1">
                            {{ currentId ? 'Edit Lead' : 'New Lead' }}
                        </h2>
                        <p class="text-sm text-secondary m-0">Contact details and lead classification</p>
                    </div>
                    <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                        <boo-icon name="x" [size]="20"></boo-icon>
                    </button>
                </div>

                <div #scrollContainer class="flex-1 overflow-y-auto bg-surface" custom-scrollbar [formGroup]="form">
                    <div *ngIf="loadingSrv.isLoading('search-by-id') && currentId" class="absolute inset-0 bg-surface/80 z-50 flex items-center justify-center backdrop-blur-sm">
                        <boo-icon name="loader" class="animate-spin text-primary" [size]="32"></boo-icon>
                    </div>

                    <!-- Contact Info -->
                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Contact Info</h3>
                        <boo-input label="Full Name" formControlName="name" placeholder="Ex: John Doe" required></boo-input>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-input label="Phone" type="tel" formControlName="phone" placeholder="+1 234-567-8900" required></boo-input>
                            <boo-input label="Email" type="email" formControlName="email" placeholder="john@example.com" required></boo-input>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <!-- Classification -->
                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Classification</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-select label="Service" formControlName="service" [options]="serviceOptions" required></boo-select>
                            <boo-select label="Source" formControlName="source" [options]="sourceOptions" required></boo-select>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-select label="Status" formControlName="status" [options]="statusOptions"></boo-select>
                            <boo-select label="Priority" formControlName="priority" [options]="priorityOptions"></boo-select>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <!-- Assignment & Notes -->
                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Assignment & Notes</h3>
                        <boo-select label="Assigned To" formControlName="assignedTo" [options]="staffOptions"></boo-select>
                        <boo-textarea label="Notes" formControlName="notes" [rows]="4" placeholder="Additional context about this lead..."></boo-textarea>
                    </div>
                </div>

                <div class="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between z-20 sticky bottom-0">
                    <button *ngIf="currentId" (click)="onDelete()" class="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1.5">
                        <boo-icon name="trash-2" [size]="16"></boo-icon>
                        Delete
                    </button>
                    <div class="flex gap-3 ml-auto">
                        <boo-button-admin background="transparent" (click)="onClose()">Cancel</boo-button-admin>
                        <boo-button-admin textColor="white" (click)="onSave()" [loading]="loadingSrv.isLoading('update') || loadingSrv.isLoading('create')">
                            Save Changes
                        </boo-button-admin>
                    </div>
                </div>
            </div>
        </drawer>
    `
})
export class CrmLeadDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Input() currentId: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saveSuccess = new EventEmitter<Lead>();
    @Output() delete = new EventEmitter<string>();
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;
    form: FormGroup;

    readonly statusOptions = [
        { label: 'New', value: LeadStatus.New },
        { label: 'Contacted', value: LeadStatus.Contacted },
        { label: 'Qualified', value: LeadStatus.Qualified },
        { label: 'Converted', value: LeadStatus.Converted },
        { label: 'Lost', value: LeadStatus.Lost },
    ];

    readonly priorityOptions = [
        { label: 'High', value: LeadPriority.High },
        { label: 'Medium', value: LeadPriority.Medium },
        { label: 'Low', value: LeadPriority.Low },
    ];

    readonly serviceOptions = [
        { label: 'Consultation', value: 'Consultation' },
        { label: 'Surgery', value: 'Surgery' },
        { label: 'Diagnostics', value: 'Diagnostics' },
        { label: 'Emergency', value: 'Emergency' },
        { label: 'Pharmacy', value: 'Pharmacy' },
        { label: 'Physiotherapy', value: 'Physiotherapy' },
    ];

    readonly sourceOptions = [
        { label: 'Website', value: 'Website' },
        { label: 'Phone Call', value: 'Phone Call' },
        { label: 'Walk-in', value: 'Walk-in' },
        { label: 'Referral', value: 'Referral' },
        { label: 'Social Media', value: 'Social Media' },
        { label: 'Advertisement', value: 'Advertisement' },
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
        private leadSrv: LeadService,
        protected loadingSrv: LocalLoadingService
    ) {
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
            name: [null, [Validators.required]],
            phone: [null, [Validators.required]],
            email: [null, [Validators.required, Validators.email]],
            service: [null, [Validators.required]],
            source: [null, [Validators.required]],
            status: [LeadStatus.New, [Validators.required]],
            priority: [LeadPriority.Medium, [Validators.required]],
            assignedTo: [null],
            notes: [null],
        });
    }

    loadDetail(id: string) {
        this.form.disable();
        this.leadSrv.search_by_id(id)
            .pipe(finalize(() => this.form.enable()))
            .subscribe(res => {
                if (!res.success || !res.data) return;
                const l = res.data;
                this.form.patchValue({
                    name: l.name,
                    phone: l.phone,
                    email: l.email,
                    service: l.service,
                    source: l.source,
                    status: l.status,
                    priority: l.priority,
                    assignedTo: l.assignedTo,
                    notes: l.notes,
                });
            });
    }

    private buildPayload(): CreateLeadRequest | UpdateLeadRequest {
        const v = this.form.getRawValue();
        return {
            name: v.name,
            phone: v.phone,
            email: v.email,
            service: v.service,
            source: v.source,
            status: v.status,
            priority: v.priority,
            assignedTo: v.assignedTo ?? null,
            notes: v.notes ?? null,
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
                await firstValueFrom(this.leadSrv.update(this.currentId, this.buildPayload()));
                id = this.currentId;
            } else {
                const createRes = await firstValueFrom(this.leadSrv.create(this.buildPayload()));
                if (!createRes.success || !createRes.data) {
                    this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
                    return;
                }
                id = createRes.data;
            }

            const response = await firstValueFrom(this.leadSrv.search_by_id(id));
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
            name: null,
            phone: null,
            email: null,
            service: null,
            source: null,
            status: LeadStatus.New,
            priority: LeadPriority.Medium,
            assignedTo: null,
            notes: null,
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
