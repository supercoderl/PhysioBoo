import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { finalize, firstValueFrom } from "rxjs";
import { AudienceSegmentService } from "../../../../../services/admin/audience-segment.service";
import { CampaignService } from "../../../../../services/admin/campaign.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING, SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING } from "../../../../../shared/constants/error.constant";
import { CampaignStatus, CampaignType } from "../../../../../shared/enums/campaign";
import { SharedModule } from "../../../../../shared/shared-imports";
import { Campaign, CreateCampaignRequest, UpdateCampaignRequest } from "../../../../../shared/types/campaign.types";
import { BooButtonAdminComponent } from "../../../../button/boo-button-admin/boo-button-admin.component";
import { DrawerComponent } from "../../../../drawer/drawer.component";
import { BooIconComponent } from "../../../../icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../textarea/boo-textarea/boo-textarea.component";

@Component({
    selector: 'crm-campaign-drawer',
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
        <drawer [isOpen]="isOpen" [isShowDialog]="true" [width]="760" (close)="onClose()">
            <div class="flex flex-col h-full bg-surface relative">
                <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-surface z-10 sticky top-0">
                    <div>
                        <h2 class="text-xl font-bold text-primary leading-none mb-1">
                            {{ currentId ? 'Edit Campaign' : 'New Campaign' }}
                        </h2>
                        <p class="text-sm text-secondary m-0">Marketing campaign details and targeting</p>
                    </div>
                    <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                        <boo-icon name="x" [size]="20"></boo-icon>
                    </button>
                </div>

                <div #scrollContainer class="flex-1 overflow-y-auto bg-surface" custom-scrollbar [formGroup]="form">
                    <div *ngIf="loadingSrv.isLoading('search-by-id') && currentId" class="absolute inset-0 bg-surface/80 z-50 flex items-center justify-center backdrop-blur-sm">
                        <boo-icon name="loader" class="animate-spin text-primary" [size]="32"></boo-icon>
                    </div>

                    <!-- Details -->
                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Details</h3>
                        <boo-input label="Campaign Name" formControlName="name" placeholder="Ex: Annual Health Checkup Drive" required></boo-input>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-select label="Type" formControlName="type" [options]="typeOptions"></boo-select>
                            <boo-select *ngIf="currentId" label="Status" formControlName="status" [options]="statusOptions"></boo-select>
                        </div>
                        <boo-input label="Goal" formControlName="goal" placeholder="Ex: Preventive care awareness"></boo-input>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <!-- Audience & Schedule -->
                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Audience & Schedule</h3>
                        <boo-select label="Audience Segment" formControlName="audienceSegmentId" [options]="segmentOptions"></boo-select>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-input label="Start Date" type="date" formControlName="startDate"></boo-input>
                            <boo-input label="End Date" type="date" formControlName="endDate"></boo-input>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <!-- Budget -->
                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Budget</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-input label="Budget ($)" type="number" formControlName="budget" placeholder="0"></boo-input>
                            <boo-input *ngIf="currentId" label="Spent ($)" type="number" formControlName="spent" placeholder="0"></boo-input>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <!-- Description -->
                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider">Description</h3>
                        <boo-textarea label="Description" formControlName="description" [rows]="4" placeholder="Campaign details and notes..."></boo-textarea>
                    </div>
                </div>

                <div class="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between z-20 sticky bottom-0">
                    <button *ngIf="currentId" (click)="onDelete()" class="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1.5">
                        <boo-icon name="trash-2" [size]="16"></boo-icon>
                        Delete
                    </button>
                    <div class="flex gap-3 ml-auto">
                        <boo-button-admin background="transparent" (click)="onClose()">Cancel</boo-button-admin>
                        <boo-button-admin textColor="white" (click)="onSave()" [loading]="loadingSrv.isLoading('update')">
                            Save Changes
                        </boo-button-admin>
                    </div>
                </div>
            </div>
        </drawer>
    `
})
export class CrmCampaignDrawerComponent implements OnChanges, OnInit {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Input() currentId: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saveSuccess = new EventEmitter<Campaign>();
    @Output() delete = new EventEmitter<string>();
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;
    form: FormGroup;

    segmentOptions: { label: string; value: string }[] = [];

    readonly typeOptions = [
        { label: 'Email', value: CampaignType.Email },
        { label: 'SMS', value: CampaignType.Sms },
        { label: 'Social Media', value: CampaignType.Social },
        { label: 'Multi-Channel', value: CampaignType.MultiChannel },
        { label: 'Push', value: CampaignType.Push },
    ];

    readonly statusOptions = [
        { label: 'Draft', value: CampaignStatus.Draft },
        { label: 'Scheduled', value: CampaignStatus.Scheduled },
        { label: 'Active', value: CampaignStatus.Active },
        { label: 'Paused', value: CampaignStatus.Paused },
        { label: 'Completed', value: CampaignStatus.Completed },
        { label: 'Cancelled', value: CampaignStatus.Cancelled },
    ];
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private fb: FormBuilder,
        private toastSrv: ToastService,
        private campaignSrv: CampaignService,
        private audienceSegmentSrv: AudienceSegmentService,
        protected loadingSrv: LocalLoadingService
    ) {
        this.form = this.initForm();
    }

    ngOnInit(): void {
        this.loadSegmentOptions();
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
            type: [CampaignType.Email, [Validators.required]],
            status: [CampaignStatus.Draft],
            goal: [null],

            audienceSegmentId: [null],
            startDate: [null],
            endDate: [null],

            budget: [null],
            spent: [null],

            description: [null],
        });
    }

    loadSegmentOptions() {
        this.audienceSegmentSrv.lookup().subscribe(res => {
            if (!res.success || !res.data) return;
            this.segmentOptions = res.data.map(s => ({ label: `${s.name} (${s.count})`, value: s.id }));
        });
    }

    loadDetail(id: string) {
        this.form.disable();
        this.campaignSrv.search_by_id(id)
            .pipe(finalize(() => this.form.enable()))
            .subscribe(res => {
                if (!res.success || !res.data) return;
                const c = res.data;
                this.form.patchValue({
                    name: c.name,
                    type: c.type,
                    status: c.status,
                    goal: c.goal,

                    audienceSegmentId: c.audienceSegmentId,
                    startDate: c.startDate,
                    endDate: c.endDate,

                    budget: c.budget,
                    spent: c.spent,

                    description: c.description,
                });
            });
    }

    private toNullableString(v: unknown): string | null {
        if (v === null || v === undefined) return null;
        const s = String(v).trim();
        return s.length === 0 ? null : s;
    }

    private toNullableNumber(v: unknown): number | null {
        if (v === null || v === undefined || v === '') return null;
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
    }

    private buildCreate(): CreateCampaignRequest {
        const v = this.form.getRawValue();
        return {
            name: v.name,
            type: v.type,
            audienceSegmentId: this.toNullableString(v.audienceSegmentId),
            goal: this.toNullableString(v.goal),
            startDate: this.toNullableString(v.startDate),
            endDate: this.toNullableString(v.endDate),
            budget: this.toNullableNumber(v.budget),
            description: this.toNullableString(v.description),
        };
    }

    private buildUpdate(): UpdateCampaignRequest {
        const v = this.form.getRawValue();
        return {
            name: v.name,
            type: v.type,
            status: v.status,
            audienceSegmentId: this.toNullableString(v.audienceSegmentId),
            goal: this.toNullableString(v.goal),
            startDate: this.toNullableString(v.startDate),
            endDate: this.toNullableString(v.endDate),
            budget: this.toNullableNumber(v.budget),
            spent: this.toNullableNumber(v.spent),
            description: this.toNullableString(v.description),
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
                await firstValueFrom(this.campaignSrv.update(this.currentId, this.buildUpdate()));
                id = this.currentId;
            } else {
                const createRes = await firstValueFrom(this.campaignSrv.create(this.buildCreate()));
                if (!createRes.success || !createRes.data) {
                    this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
                    return;
                }
                id = createRes.data;
            }

            const response = await firstValueFrom(this.campaignSrv.search_by_id(id));
            if (response.success && response.data) {
                this.saveSuccess.emit(response.data);
            } else this.toastSrv.error(SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING);
        } catch (err) {
            this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
            return;
        }
    }

    resetForm() {
        this.form.reset({
            name: null,
            type: CampaignType.Email,
            status: CampaignStatus.Draft,
            goal: null,
            audienceSegmentId: null,
            startDate: null,
            endDate: null,
            budget: null,
            spent: null,
            description: null,
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
