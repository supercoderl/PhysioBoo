import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from "@angular/core";
import { Observable, finalize } from "rxjs";
import { ImagingModalityService } from "../../../../services/admin/imaging-modality.service";
import { LabTestService } from "../../../../services/admin/lab-test.service";
import { LaboratoryService } from "../../../../services/admin/laboratory.service";
import { RadiologyService } from "../../../../services/admin/radiology.service";
import { TreatmentSheetService } from "../../../../services/admin/treatment-sheet.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { DrawerComponent } from "../../../drawer/drawer.component";
import { BooButtonAdminComponent } from "../../../button/boo-button-admin/boo-button-admin.component";
import { BooInputComponent } from "../../../input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../textarea/boo-textarea/boo-textarea.component";
import { BooCheckboxComponent } from "../../../checkbox/boo-checkbox/boo-checkbox.component";

export type ClinicalAction = 'lab' | 'imaging' | 'note';
type Priority = 'Routine' | 'Urgent' | 'Stat';

/**
 * Clinician actions from the medical record: order lab tests, order an imaging exam, or add a progress note.
 * Orders attach to the patient's latest visit on the server and then appear in the Laboratory / Radiology workspaces.
 */
@Component({
    selector: 'clinical-action-drawer',
    standalone: true,
    imports: [SharedModule, DrawerComponent, BooButtonAdminComponent, BooInputComponent, BooSelectComponent, BooTextareaComponent, BooCheckboxComponent],
    template: `
        <drawer [isOpen]="isOpen" [isShowDialog]="true" (close)="close.emit()">
            <div class="flex flex-col h-full bg-surface">
                <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 class="text-xl font-bold text-primary leading-none mb-1">{{ title() }}</h2>
                        <p class="text-sm text-secondary m-0">{{ patientName }}</p>
                    </div>
                    <button (click)="close.emit()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100" aria-label="Close">
                        <physio-icon name="x" [size]="20"></physio-icon>
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto p-6 space-y-4" custom-scrollbar>
                    <!-- Lab -->
                    <ng-container *ngIf="action === 'lab'">
                        <div class="flex flex-col gap-1 text-xs text-gray-600">Find tests
                            <boo-input [(ngModel)]="testSearch" label="Type to filter tests" size="small"></boo-input>
                        </div>
                        <div class="max-h-72 overflow-y-auto rounded border border-gray-200 divide-y divide-gray-100">
                            <boo-checkbox *ngFor="let t of filteredTests()" class="px-3 py-2 hover:bg-gray-50"
                                [ngModel]="selectedTests.has(t.id)" (ngModelChange)="toggleTest(t.id)">
                                <span>{{ t.testName }}</span>
                            </boo-checkbox>
                            <div *ngIf="!filteredTests().length" class="px-3 py-4 text-xs text-gray-500">No matching tests.</div>
                        </div>
                        <div class="text-xs text-gray-500">{{ selectedTests.size }} selected</div>
                    </ng-container>

                    <!-- Imaging -->
                    <ng-container *ngIf="action === 'imaging'">
                        <div class="flex flex-col gap-1 text-xs text-gray-600">Modality
                            <boo-select [(ngModel)]="modalityId" required label="Select a modality" [options]="modalities()" bindLabel="name" bindValue="id" size="small"></boo-select>
                        </div>
                        <div class="flex flex-col gap-1 text-xs text-gray-600">Body part
                            <boo-input [(ngModel)]="bodyPart" [maxlength]="100" label="e.g. Chest, Left knee" size="small"></boo-input>
                        </div>
                        <boo-checkbox [(ngModel)]="contrastRequired"><span class="text-gray-700">Contrast required</span></boo-checkbox>
                    </ng-container>

                    <ng-container *ngIf="action !== 'note'">
                        <div class="flex flex-col gap-1 text-xs text-gray-600">Priority
                            <boo-select [(ngModel)]="priority" [options]="priorityOptions" size="small"></boo-select>
                        </div>
                    </ng-container>

                    <div class="flex flex-col gap-1 text-xs text-gray-600">{{ action === 'note' ? 'Note' : 'Clinical indication / notes' }}
                        <boo-textarea [(ngModel)]="text" [rows]="5" [maxlength]="2000" size="small"></boo-textarea>
                    </div>
                </div>

                <div class="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                    <boo-button-admin (click)="close.emit()" background="transparent" textColor="#55434B" [border]="{ width: 1, color: '#E3D5DA' }" padding="8px 16px" [fontSize]="14" [radius]="8">Cancel</boo-button-admin>
                    <boo-button-admin (click)="submit()" [disabled]="!canSubmit() || saving()" textColor="white" padding="8px 16px" [fontSize]="14" [radius]="8">
                        {{ saving() ? 'Saving…' : action === 'note' ? 'Add note' : 'Place order' }}
                    </boo-button-admin>
                </div>
            </div>
        </drawer>
    `
})
export class ClinicalActionDrawerComponent implements OnChanges {
    @Input() isOpen = false;
    @Input() action: ClinicalAction = 'lab';
    @Input() patientId = '';
    @Input() patientName = '';
    @Output() close = new EventEmitter<void>();
    @Output() done = new EventEmitter<ClinicalAction>();

    tests = signal<{ id: string; testName: string }[]>([]);
    modalities = signal<{ id: string; name: string }[]>([]);
    saving = signal(false);

    testSearch = '';
    selectedTests = new Set<string>();
    modalityId: string | null = null;
    bodyPart = '';
    contrastRequired = false;
    priority: Priority = 'Routine';
    readonly priorityOptions: { label: string; value: Priority }[] = [
        { label: 'Routine', value: 'Routine' },
        { label: 'Urgent', value: 'Urgent' },
        { label: 'Stat', value: 'Stat' },
    ];
    text = '';

    constructor(
        private labTestSrv: LabTestService,
        private modalitySrv: ImagingModalityService,
        private labSrv: LaboratoryService,
        private radiologySrv: RadiologyService,
        private treatmentSrv: TreatmentSheetService,
        private toastSrv: ToastService,
    ) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (!(changes['isOpen'] && this.isOpen)) return;
        this.reset();
        if (this.action === 'lab' && !this.tests().length) {
            this.labTestSrv.search({ pageNumber: 1, pageSize: 500, search: '', sort: '', filter: { start: '', end: '' } }).subscribe({
                next: res => { if (res.success) this.tests.set(res.data.items.filter((t: any) => t.isActive !== false).map(t => ({ id: t.id, testName: t.testName }))); }
            });
        }
        if (this.action === 'imaging' && !this.modalities().length) {
            this.modalitySrv.search({ pageNumber: 1, pageSize: 200, search: '', sort: '', filter: { start: '', end: '', requiresContrast: null, preparationRequired: null, isActive: true } }).subscribe({
                next: res => { if (res.success) this.modalities.set(res.data.items.map(m => ({ id: m.id, name: m.name }))); }
            });
        }
    }

    private reset(): void {
        this.testSearch = '';
        this.selectedTests = new Set();
        this.modalityId = null;
        this.bodyPart = '';
        this.contrastRequired = false;
        this.priority = 'Routine';
        this.text = '';
    }

    title(): string {
        return this.action === 'lab' ? 'Order lab tests' : this.action === 'imaging' ? 'Order imaging' : 'Add progress note';
    }

    filteredTests() {
        const q = this.testSearch.trim().toLowerCase();
        return q ? this.tests().filter(t => t.testName.toLowerCase().includes(q)) : this.tests();
    }

    toggleTest(id: string): void {
        if (this.selectedTests.has(id)) this.selectedTests.delete(id); else this.selectedTests.add(id);
    }

    canSubmit(): boolean {
        if (this.action === 'lab') return this.selectedTests.size > 0;
        if (this.action === 'imaging') return !!this.modalityId;
        return !!this.text.trim();
    }

    submit(): void {
        if (!this.canSubmit() || this.saving()) return;
        this.saving.set(true);
        const notes = this.text.trim() || null;

        const request$: Observable<{ success: boolean }> =
            this.action === 'lab'
                ? this.labSrv.placeOrder({ patientId: this.patientId, testIds: [...this.selectedTests], priority: this.priority, clinicalNotes: notes })
                : this.action === 'imaging'
                    ? this.radiologySrv.placeOrder({ patientId: this.patientId, modalityId: this.modalityId!, bodyPart: this.bodyPart.trim() || null, clinicalIndication: notes, priority: this.priority, contrastRequired: this.contrastRequired })
                    : this.treatmentSrv.addNote(this.patientId, 'Doctor', this.text.trim());

        request$.pipe(finalize(() => this.saving.set(false))).subscribe({
            next: (res: { success: boolean }) => {
                if (!res.success) { this.toastSrv.error('Unable to save'); return; }
                this.toastSrv.success(this.action === 'note' ? 'Note added' : 'Order placed');
                this.done.emit(this.action);
                this.close.emit();
            },
            error: (err: any) => this.toastSrv.error(err?.error?.errors?.[0] ?? 'Unable to save')
        });
    }
}
