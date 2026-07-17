import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { finalize, firstValueFrom } from "rxjs";
import { BedMapService } from "../../../../../services/admin/bed-map.service";
import { PatientService } from "../../../../../services/admin/patient.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { Bed } from "../../../../../shared/types/bed.types";
import { BooButtonAdminComponent } from "../../../../button/boo-button-admin/boo-button-admin.component";
import { DrawerComponent } from "../../../../drawer/drawer.component";
import { BooIconComponent } from "../../../../icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../textarea/boo-textarea/boo-textarea.component";

@Component({
    selector: 'bed-map-assign-drawer',
    standalone: true,
    imports: [
        SharedModule,
        DrawerComponent,
        BooInputComponent,
        BooIconComponent,
        BooTextareaComponent,
        BooButtonAdminComponent,
        BooSelectComponent
    ],
    template: `
        <drawer [isOpen]="isOpen" [isShowDialog]="true" [width]="480" (close)="onClose()">
            <div class="flex flex-col h-full bg-surface relative">
                <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-surface z-10 sticky top-0">
                    <div>
                        <h2 class="text-xl font-bold text-primary leading-none mb-1">Assign Patient</h2>
                        <p class="text-sm text-secondary m-0" *ngIf="bed">Bed {{ bed.number }} &middot; {{ bed.wardName }}</p>
                    </div>
                    <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                        <boo-icon name="x" [size]="20"></boo-icon>
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto bg-surface" custom-scrollbar [formGroup]="form">
                    <div *ngIf="loadingSrv.isLoading('bed-assign-patients')" class="absolute inset-0 bg-surface/80 z-50 flex items-center justify-center backdrop-blur-sm">
                        <boo-icon name="loader" class="animate-spin text-primary" [size]="32"></boo-icon>
                    </div>

                    <div class="p-6 space-y-4">
                        <boo-select label="Patient" formControlName="patientId" required
                            [options]="patientOptions" bindLabel="label" bindValue="value"></boo-select>
                        <boo-input type="date" label="Expected Discharge Date" formControlName="expectedDischargeDate"></boo-input>
                        <boo-textarea label="Notes" formControlName="notes" placeholder="Optional admission notes"></boo-textarea>
                    </div>
                </div>

                <div class="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end z-20 sticky bottom-0">
                    <div class="flex gap-3">
                        <boo-button-admin background="transparent" (click)="onClose()">Cancel</boo-button-admin>
                        <boo-button-admin textColor="white" (click)="onAssign()" [loading]="loadingSrv.isLoading('bed-assign')">
                            Assign Bed
                        </boo-button-admin>
                    </div>
                </div>
            </div>
        </drawer>
    `
})
export class BedMapAssignDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Input() bed: Bed | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() assignSuccess = new EventEmitter<Bed>();

    form: FormGroup;
    patientOptions: { label: string; value: string }[] = [];
    // #endregion

    constructor(
        private fb: FormBuilder,
        private toastSrv: ToastService,
        private bedMapSrv: BedMapService,
        private patientSrv: PatientService,
        protected loadingSrv: LocalLoadingService
    ) {
        this.form = this.fb.group({
            patientId: [null, [Validators.required]],
            expectedDischargeDate: [null],
            notes: ['']
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.isOpen) return;

        this.form.reset({ patientId: null, expectedDischargeDate: null, notes: '' });
        this.loadAvailablePatients();
    }

    loadAvailablePatients() {
        this.loadingSrv.setLoading('bed-assign-patients', true);

        this.patientSrv.search({ pageNumber: 1, pageSize: 50 })
            .pipe(finalize(() => this.loadingSrv.setLoading('bed-assign-patients', false)))
            .subscribe(_res => {
                if (_res.success && _res.data) {
                    this.patientOptions = _res.data.items.map(p => ({
                        label: p.patientNumber,
                        value: p.id
                    }));
                }
            });
    }

    async onAssign() {
        if (this.form.invalid || !this.bed) {
            this.toastSrv.error('Please select a patient');
            this.form.markAllAsTouched();
            return;
        }

        this.loadingSrv.setLoading('bed-assign', true);

        try {
            const formData = { ...this.form.getRawValue() };
            const response = await firstValueFrom(this.bedMapSrv.assign(this.bed.id, formData));

            if (response.success) {
                this.toastSrv.success('Patient assigned to bed');
                this.assignSuccess.emit({
                    ...this.bed,
                    status: 'Occupied',
                    patientId: formData.patientId,
                    expectedDischargeDate: formData.expectedDischargeDate,
                    notes: formData.notes
                });
            } else {
                this.toastSrv.error('Unable to assign patient');
            }
        } catch {
            this.toastSrv.error('Unable to assign patient');
        } finally {
            this.loadingSrv.setLoading('bed-assign', false);
        }
    }

    onClose() {
        this.close.emit();
    }
}
