import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { DrawerComponent } from "../../../../../drawer/drawer.component";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BooInputComponent } from "../../../../../input/boo-input/boo-input.component";
import { BooIconComponent } from "../../../../../icon/boo-icon/boo-icon.component";
import { BooTextareaComponent } from "../../../../../textarea/boo-textarea/boo-textarea.component";
import { BooButtonAdminComponent } from "../../../../../button/boo-button-admin/boo-button-admin.component";
import { BooCheckboxComponent } from "../../../../../checkbox/boo-checkbox/boo-checkbox.component";
import { ToastService } from "../../../../../../services/common/toast.service";
import { generateUUID } from "../../../../../../shared/utils/common";
import { finalize } from "rxjs";
import { LocalLoadingService } from "../../../../../../services/common/local-loading.service";
import { AppointmentType } from "../../../../../../shared/types/operation";
import { AppointmentTypeService } from "../../../../../../services/admin/appointment-type.service";

@Component({
    selector: 'common-category-appointment-type-drawer',
    standalone: true,
    imports: [
        SharedModule,
        DrawerComponent,
        BooInputComponent,
        BooIconComponent,
        BooTextareaComponent,
        BooButtonAdminComponent,
        BooCheckboxComponent
    ],
    template: `
        <drawer
            [isOpen]="isOpen"
            [isShowDialog]="true"
            [width]="420"
            (close)="onClose()"
        >
            <div class="flex flex-col h-full bg-surface relative">
                <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-surface z-10 sticky top-0">
                    <div>
                        <h2 class="text-xl font-bold text-primary leading-none mb-1">
                            {{ currentId ? 'Edit Appointment Type' : 'New Appointment Type' }}
                        </h2>
                        <p class="text-sm text-secondary m-0">Configure appointment type details and settings</p>
                    </div>
                    <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                        <boo-icon name="x" [size]="20"></boo-icon>
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto bg-surface" custom-scrollbar [formGroup]="form">
                    <div *ngIf="loadingSrv.isLoading('search-by-id') && currentId" class="absolute inset-0 bg-surface/80 z-50 flex items-center justify-center backdrop-blur-sm">
                        <boo-icon name="loader" class="animate-spin text-primary" [size]="32"></boo-icon>
                    </div>
                    
                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Basic Information</h3>
                        <div class="space-y-4">
                            <boo-input label="Type Name" [required]="true" formControlName="name" placeholder="Ex: General Consultation"></boo-input>
                            <div class="flex gap-4">
                                <div class="flex-1">
                                    <boo-input label="Code" formControlName="code" placeholder="Ex: GEN-01"></boo-input>
                                </div>
                                <div class="flex-1">
                                    <boo-input label="Color Code" formControlName="colorCode" placeholder="Ex: #FF5733"></boo-input>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Time & Pricing</h3>
                        <div class="space-y-4">
                            <div class="flex gap-4">
                                <div class="flex-1">
                                    <boo-input type="number" label="Duration (Mins)" [required]="true" formControlName="defaultDuration" placeholder="30"></boo-input>
                                </div>
                                <div class="flex-1">
                                    <boo-input type="number" label="Buffer Time (Mins)" formControlName="bufferTime" placeholder="15"></boo-input>
                                </div>
                            </div>
                            <div>
                                <boo-input type="number" label="Consultation Fee ($)" formControlName="consultationFee" placeholder="150.00"></boo-input>
                            </div>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Settings</h3>
                        <div class="grid grid-cols-2 gap-4">
                            
                            <div 
                                class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:border-red-400 hover:shadow-sm"
                                [ngClass]="{'border-red-500 bg-red-50/50': form.get('isEmergency')?.value, 'border-gray-200': !form.get('isEmergency')?.value}"
                                (click)="toggleCheck('isEmergency')"
                            >
                                <div class="flex items-center gap-2">
                                    <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                        <boo-icon name="triangle-alert" [size]="16" color="#ef4444"></boo-icon>
                                    </div>
                                    <span class="text-sm font-medium text-gray-700">Emergency</span>
                                </div>
                                <boo-checkbox formControlName="isEmergency"></boo-checkbox>
                            </div>

                            <div 
                                class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm"
                                [ngClass]="{'border-primary bg-primary/5': form.get('isFollowUp')?.value, 'border-gray-200': !form.get('isFollowUp')?.value}"
                                (click)="toggleCheck('isFollowUp')"
                            >
                                <div class="flex items-center gap-2">
                                    <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                        <boo-icon name="refresh-cw" [size]="16" class="text-primary"></boo-icon>
                                    </div>
                                    <span class="text-sm font-medium text-gray-700">Follow Up</span>
                                </div>
                                <boo-checkbox formControlName="isFollowUp"></boo-checkbox>
                            </div>

                            <div 
                                class="col-span-2 border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:border-orange-400 hover:shadow-sm"
                                [ngClass]="{'border-orange-500 bg-orange-50/50': form.get('requiresPreparation')?.value, 'border-gray-200': !form.get('requiresPreparation')?.value}"
                                (click)="toggleCheck('requiresPreparation')"
                            >
                                <div class="flex items-center gap-2">
                                    <div class="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                        <boo-icon name="clipboard" [size]="16" color="#f97316"></boo-icon>
                                    </div>
                                    <span class="text-sm font-medium text-gray-700">Requires Preparation before Appointment</span>
                                </div>
                                <boo-checkbox formControlName="requiresPreparation"></boo-checkbox>
                            </div>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6 pb-10">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Details & Instructions</h3>    
                        <div class="space-y-4">
                            <div *ngIf="form.get('requiresPreparation')?.value" class="animate-fade-in-up">
                                <boo-textarea 
                                    label="Preparation Instructions" 
                                    formControlName="preparationInstructions" 
                                    placeholder="Ex: Fasting for 8 hours, drink plenty of water...">
                                </boo-textarea>
                            </div>
                            <boo-textarea 
                                label="Description" 
                                formControlName="description" 
                                placeholder="Enter general description about this appointment type...">
                            </boo-textarea>
                        </div>
                    </div>
                </div>

                <div class="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between z-10 sticky bottom-0">
                    <div>
                        <button 
                            *ngIf="currentId" class="group flex items-center gap-1.5 text-red-500 hover:text-red-700 px-2 py-1.5 rounded-md hover:bg-red-50 transition-all text-sm font-medium"
                            (click)="onDelete()"
                        >
                            <boo-icon 
                                name="trash-2" 
                                [size]="16" 
                                class="transition-transform group-hover:scale-110"
                                color="#ef4444"
                            ></boo-icon> 
                            <span>Delete</span>
                        </button>
                    </div>
                    <div class="flex gap-3">
                        <boo-button-admin
                            buttonClass="hover:!bg-gray-200"
                            background="transparent"
                            (click)="onClose()"
                            [disabled]="loadingSrv.isLoading('search-by-id')"
                        >
                            Cancel
                        </boo-button-admin>
                        <boo-button-admin
                            textColor="white"
                            (click)="onSave()"
                            [disabled]="loadingSrv.isLoading('search-by-id') || loadingSrv.isLoading('create') || loadingSrv.isLoading('update')"
                            [loading]="loadingSrv.isLoading('update')"
                        >
                            Save Changes
                        </boo-button-admin>
                    </div>
                </div>
            </div>
        </drawer>
    `
})

export class CommonCategoryAppointmentTypeDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Input() currentId: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saveSuccess = new EventEmitter<AppointmentType>();
    @Output() delete = new EventEmitter<string>();
    form: FormGroup;
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private fb: FormBuilder,
        private toastSrv: ToastService,
        private appointmentTypeSrv: AppointmentTypeService,
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
            name: ['', [Validators.required]],
            code: [null],
            description: [null],
            defaultDuration: [30, [Validators.required]],
            bufferTime: [0, [Validators.required]],
            isEmergency: [false],
            requiresPreparation: [false],
            preparationInstructions: [null],
            isFollowUp: [false],
            consultationFee: [0, [Validators.required]],
            colorCode: [null]
        });
    }

    loadDetail(id: string) {
        this.form.disable();

        this.appointmentTypeSrv.search_by_id({ id })
            .pipe(
                finalize(() => this.form.enable())
            )
            .subscribe(_res => {
                if (_res.success) {
                    this.form.patchValue({
                        name: _res.data?.name,
                        code: _res.data?.code,
                        description: _res.data?.description,
                        defaultDuration: _res.data?.defaultDuration,
                        bufferTime: _res.data?.bufferTime,
                        isEmergency: _res.data?.isEmergency || false,
                        requiresPreparation: _res.data?.requiresPreparation || false,
                        preparationInstructions: _res.data?.preparationInstructions,
                        isFollowUp: _res.data?.isFollowUp || false,
                        consultationFee: _res.data?.consultationFee,
                        colorCode: _res.data?.colorCode
                    })
                }
            })
    }

    toggleCheck(controlName: string) {
        const currentValue = this.form.get(controlName)?.value;

        this.form.patchValue({
            [controlName]: !currentValue
        });
        this.form.markAsDirty();
    }

    onIconUploaded(data: { url: string; publicId: string }) {
        this.form.patchValue({
            iconUrl: data.url,
            iconPublicId: data.publicId
        });
        this.form.markAsDirty();
    }

    onSave() {
        if (this.form.invalid) {
            this.toastSrv.error('Please check required fields');
            this.form.markAllAsTouched();
            return;
        }

        const rawValue = this.form.getRawValue();

        const formData = {
            ...this.form.getRawValue(),
            id: this.currentId ?? generateUUID(),
            isEmergency: !!rawValue.isEmergency,
            requiresPreparation: !!rawValue.requiresPreparation,
            isFollowUp: !!rawValue.isFollowUp
        }

        const request$ = this.currentId
            ? this.appointmentTypeSrv.update(formData)
            : this.appointmentTypeSrv.create(formData);

        request$.subscribe({
            next: (res) => this.saveSuccess.emit({
                id: res.data,
                ...this.form.getRawValue(),
                createdAt: new Date()
            })
        });
    }

    resetForm() {
        this.form.reset({
            defaultDuration: 30,
            bufferTime: 0,
            consultationFee: 0,
            colorCode: '#3B82F6',
            isEmergency: false,
            requiresPreparation: false,
            isFollowUp: false
        });
    }

    onClose() {
        this.close.emit();
    }

    onDelete() {
        if (this.currentId) this.delete.emit(this.currentId);
    }
}