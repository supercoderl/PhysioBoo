import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { finalize } from "rxjs";
import { SequenceTrackerService } from "../../../../../services/admin/sequence-tracker.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { SequenceTracker } from "../../../../../shared/types/system";
import { generateUUID } from "../../../../../shared/utils/common";
import { BooButtonAdminComponent } from "../../../../button/boo-button-admin/boo-button-admin.component";
import { DrawerComponent } from "../../../../drawer/drawer.component";
import { BooIconComponent } from "../../../../icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../select/boo-select/boo-select.component";

@Component({
    selector: 'setting-sequence-tracker-drawer',
    standalone: true,
    imports: [
        SharedModule,
        DrawerComponent,
        BooInputComponent,
        BooIconComponent,
        BooButtonAdminComponent,
        BooSelectComponent,
    ],
    template: `
        <drawer
            [isOpen]="isOpen"
            [isShowDialog]="true"
            [width]="720" 
            (close)="onClose()"
        >
            <div class="flex flex-col h-full bg-surface relative">
                <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-surface z-10 sticky top-0">
                    <div>
                        <h2 class="text-xl font-bold text-primary leading-none mb-1">
                            {{ currentId ? 'Edit Numbering Rule' : 'New Numbering Rule' }}
                        </h2>
                        <p class="text-sm text-secondary m-0">Configure auto-generated codes for system entities</p>
                    </div>
                    <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                        <boo-icon name="x" [size]="20"></boo-icon>
                    </button>
                </div>

                <div #scrollContainer class="flex-1 overflow-y-auto bg-surface" custom-scrollbar [formGroup]="form">
                    <div *ngIf="loadingSrv.isLoading('search-by-id') && currentId" class="absolute inset-0 bg-surface/80 z-50 flex items-center justify-center backdrop-blur-sm">
                        <boo-icon name="loader" class="animate-spin text-primary" [size]="32"></boo-icon>
                    </div>

                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Rule Identification</h3>
                        <div class="space-y-4">
                            <boo-input 
                                label="Entity Type" 
                                [required]="true" 
                                formControlName="entityType" 
                                placeholder="Ex: Patient, LabTest, Invoice...">
                            </boo-input>

                            <div class="grid grid-cols-2 gap-4">
                                <boo-input 
                                    label="Prefix" 
                                    [required]="true" 
                                    formControlName="prefix" 
                                    placeholder="Ex: BN-, TEST-">
                                </boo-input>
                                
                                <boo-input 
                                    label="Suffix (Optional)" 
                                    formControlName="suffix" 
                                    placeholder="Ex: -HCM">
                                </boo-input>
                            </div>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6 pb-10">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Sequence Configuration</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1.5">Date Formatting (Optional)</label>
                                <boo-select 
                                    formControlName="useDateFormating"
                                    [options]="[
                                        { label: 'None', value: null },
                                        { label: 'Year (yyyy) - Ex: 2026', value: 'yyyy' },
                                        { label: 'Year & Month (yyMM) - Ex: 2603', value: 'yyMM' },
                                        { label: 'Full Date (yyyyMMdd) - Ex: 20260307', value: 'yyyyMMdd' }
                                    ]"
                                ></boo-select>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <boo-input 
                                    type="number" 
                                    label="Sequence Length" 
                                    [required]="true" 
                                    formControlName="sequenceLength" 
                                    placeholder="Ex: 4 (0001)">
                                </boo-input>
                                
                                <boo-input 
                                    type="number" 
                                    label="Current Sequence" 
                                    [required]="true" 
                                    formControlName="currentSequence" 
                                    placeholder="Ex: 0">
                                </boo-input>
                            </div>

                            <div class="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                                <p class="text-xs text-primary font-semibold mb-1 uppercase tracking-wider">Format Preview</p>
                                <p class="text-lg font-mono text-gray-800">
                                    {{ form.get('prefix')?.value || 'PREFIX-' }}<span class="text-gray-400">{{ form.get('useDateFormating')?.value ? 'DATE-' : '' }}</span><span class="text-blue-600">{{ previewSequence }}</span>{{ form.get('suffix')?.value || '' }}
                                </p>
                            </div>
                        </div>
                    </div>             
                </div>

                <div class="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between z-20 sticky bottom-0 shadow-top-md">
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

export class SettingSequenceTrackerDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Input() currentId: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saveSuccess = new EventEmitter<SequenceTracker>();
    @Output() delete = new EventEmitter<string>();
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;
    form: FormGroup;
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private fb: FormBuilder,
        private toastSrv: ToastService,
        private sequenceTrackerSrv: SequenceTrackerService,
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
            entityType: ['', [Validators.required]],
            prefix: ['', [Validators.required]],
            useDateFormating: [null],
            sequenceLength: [4],
            currentSequence: [0],
            suffix: [null],
        });
    }

    get previewSequence(): string {
        const length = this.form.get('sequenceLength')?.value || 4;
        const current = this.form.get('currentSequence')?.value || 1;
        return current.toString().padStart(length, '0');
    }

    loadDetail(id: string) {
        this.form.disable();

        this.sequenceTrackerSrv.search_by_id({ id })
            .pipe(
                finalize(() => this.form.enable())
            )
            .subscribe(_res => {
                if (_res.success) {
                    this.form.patchValue({
                        entityType: _res.data?.entityType,
                        prefix: _res.data?.prefix,
                        useDateFormating: _res.data?.useDateFormating,
                        sequenceLength: _res.data?.sequenceLength,
                        currentSequence: _res.data?.currentSequence,
                        suffix: _res.data?.suffix
                    })
                }
            })
    }

    onSave() {
        if (this.form.invalid) {
            this.toastSrv.error('Please check required fields');
            this.form.markAllAsTouched();
            return;
        }

        const formData = { ...this.form.getRawValue(), id: this.currentId ?? generateUUID() }

        const request$ = this.currentId
            ? this.sequenceTrackerSrv.update(formData)
            : this.sequenceTrackerSrv.create(formData);

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
            entityType: '',
            prefix: '',
            useDateFormating: null,
            sequenceLength: 4,
            currentSequence: 0,
            suffix: null,
        });
    }

    onClose() {
        if (this.scrollContainer) {
            this.scrollContainer.nativeElement.scrollTop = 0;
        }

        this.close.emit();
    }

    onDelete() {
        if(this.currentId) this.delete.emit(this.currentId);
    }
}