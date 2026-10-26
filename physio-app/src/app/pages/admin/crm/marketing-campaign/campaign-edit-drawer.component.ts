import { NgIf } from '@angular/common';
import { Component, DestroyRef, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { BooButtonComponent, BooIconComponent, BooInputComponent } from '@physioboo/ui';
import { Observable } from 'rxjs';
import { finalize, map, switchMap } from 'rxjs/operators';
import { BooDatepickerComponent } from '../../../../components/date-picker/boo-date-picker.component';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { BooSelectComponent } from '../../../../components/select/boo-select/boo-select.component';
import { BooTextareaComponent } from '../../../../components/textarea/boo-textarea/boo-textarea.component';
import { CampaignService } from '../../../../services/admin/campaign.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { CustomScrollbarDirective } from '../../../../shared/directives/scrollbar.directive';
import { CampaignStatus, CampaignType } from '../../../../shared/enums/campaign';
import { AudienceSegment } from '../../../../shared/types/audience-segment.types';
import { Campaign, CreateCampaignRequest, UpdateCampaignRequest } from '../../../../shared/types/campaign.types';
import { CHANNEL_OPTIONS, STATUS_OPTIONS } from './campaign.utils';

/** The server stores amounts as numeric(18,2), so they must stay below 10^16. */
const MAX_AMOUNT = 9_999_999_999_999_999;

/** Mirrors the server rule: the end date may not be before the start date. */
function dateOrder(group: AbstractControl): ValidationErrors | null {
    const start = group.get('startDate')?.value as string | null;
    const end = group.get('endDate')?.value as string | null;
    return start && end && end < start ? { dateOrder: true } : null;
}

function toAmount(v: string | number | null): number | null {
    if (v === null || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

/**
 * Create (POST /api/campaigns) or edit (PATCH /api/campaigns/{id}) a campaign. New campaigns always start as drafts;
 * status and amount spent can be changed once the campaign exists. Failures are reported by the global HTTP error
 * toast and the form keeps what was entered.
 */
@Component({
    selector: 'crm-campaign-edit-drawer',
    standalone: true,
    imports: [
        NgIf,
        ReactiveFormsModule,
        DrawerComponent,
        BooButtonComponent,
        BooIconComponent,
        BooInputComponent,
        BooSelectComponent,
        BooDatepickerComponent,
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
                aria-labelledby="campaign-edit-title"
                [formGroup]="form"
                (ngSubmit)="submit()"
                novalidate
                [attr.aria-busy]="submitting"
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="m-0 text-xs font-medium text-secondary tabular-nums">{{ campaign ? 'Edit · ' + campaign.code : 'New campaign' }}</p>
                        <h2 id="campaign-edit-title" class="m-0 mt-0.5 text-lg font-semibold leading-tight text-regular break-words">
                            {{ campaign ? campaign.name : 'Plan a campaign' }}
                        </h2>
                        <p class="m-0 mt-0.5 text-xs text-secondary">
                            <ng-container *ngIf="!campaign">It's saved as a draft until you launch it. </ng-container>Fields marked <span class="text-danger">*</span> are required.
                        </p>
                    </div>
                    <button type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close campaign form" (click)="requestClose()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-6" custom-scrollbar>
                    <!-- Identity -->
                    <fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Campaign</legend>
                        <div class="flex flex-col gap-4">
                            <div>
                                <label for="ce-name" class="block mb-1 text-[13px] font-medium text-regular">Name <span class="text-danger" aria-hidden="true">*</span></label>
                                <boo-input name="ce-name" formControlName="name" label="e.g. Spring back-care check-ups" [maxlength]="120" />
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label for="ce-type" class="block mb-1 text-[13px] font-medium text-regular">Channel <span class="text-danger" aria-hidden="true">*</span></label>
                                    <boo-select id="ce-type" formControlName="type" label="Channel" required [options]="channelOptions" />
                                </div>
                                <div *ngIf="campaign">
                                    <label for="ce-status" class="block mb-1 text-[13px] font-medium text-regular">Status <span class="text-danger" aria-hidden="true">*</span></label>
                                    <boo-select id="ce-status" formControlName="status" label="Status" required [options]="statusOptions" />
                                </div>
                            </div>
                            <div>
                                <label for="ce-goal" class="block mb-1 text-[13px] font-medium text-regular">Goal</label>
                                <boo-input name="ce-goal" formControlName="goal" label="e.g. Book 50 posture assessments" [maxlength]="255" />
                            </div>
                        </div>
                    </fieldset>

                    <!-- Audience and schedule -->
                    <div class="pt-6 border-t border-rowDivider"><fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Audience and schedule</legend>
                        <div class="flex flex-col gap-4">
                            <div>
                                <label for="ce-segment" class="block mb-1 text-[13px] font-medium text-regular">Audience segment</label>
                                <boo-select id="ce-segment" formControlName="audienceSegmentId" label="No specific audience" [options]="segmentOptions" />
                                <p *ngIf="segmentError" class="m-0 mt-1 flex items-start gap-1.5 text-xs text-danger" role="alert">
                                    <physio-icon name="circle-alert" [size]="14" class="flex-none mt-px" />{{ segmentError }}
                                </p>
                                <p *ngIf="!segmentError && segmentHint" class="m-0 mt-1 text-xs text-secondary">{{ segmentHint }}</p>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label for="ce-start" class="block mb-1 text-[13px] font-medium text-regular">Start date</label>
                                    <boo-datepicker id="ce-start" formControlName="startDate" label="Start date" [max]="form.controls.endDate.value" />
                                </div>
                                <div>
                                    <label for="ce-end" class="block mb-1 text-[13px] font-medium text-regular">End date</label>
                                    <boo-datepicker id="ce-end" formControlName="endDate" label="End date" [min]="form.controls.startDate.value" />
                                </div>
                            </div>
                            <p *ngIf="form.hasError('dateOrder')" class="m-0 -mt-2 text-xs text-danger" role="alert">The end date can't be before the start date.</p>
                        </div>
                    </fieldset></div>

                    <!-- Budget -->
                    <div class="pt-6 border-t border-rowDivider"><fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Budget</legend>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label for="ce-budget" class="block mb-1 text-[13px] font-medium text-regular">Budget</label>
                                <boo-input name="ce-budget" type="number" formControlName="budget" label="0" [maxlength]="20" />
                            </div>
                            <div *ngIf="campaign">
                                <label for="ce-spent" class="block mb-1 text-[13px] font-medium text-regular">Spent so far</label>
                                <boo-input name="ce-spent" type="number" formControlName="spent" label="0" [maxlength]="20" />
                            </div>
                        </div>
                        <p *ngIf="amountError" class="m-0 mt-2 text-xs text-danger" role="alert">Amounts can't be negative.</p>
                    </fieldset></div>

                    <!-- Notes -->
                    <div class="pt-6 border-t border-rowDivider"><fieldset class="m-0 p-0 border-0 min-w-0">
                        <legend class="mb-3 text-sm font-semibold text-regular">Brief</legend>
                        <label for="ce-description" class="block mb-1 text-[13px] font-medium text-regular">Description</label>
                        <boo-textarea id="ce-description" formControlName="description" label="Message, offer and anything the team should know" [rows]="5" [maxlength]="2000" />
                    </fieldset></div>
                </div>

                <footer class="flex-none px-6 py-4 border-t border-rowDivider flex items-center justify-end gap-2">
                    <button type="button" boo-button variant="secondary" size="sm" [disabled]="submitting" (click)="requestClose()">Cancel</button>
                    <button type="submit" boo-button variant="primary" size="sm" [loading]="submitting" [disabled]="!!campaign && !form.dirty">
                        {{ campaign ? 'Save changes' : 'Create draft' }}
                    </button>
                </footer>
            </form>
        </drawer>
    `,
})
export class CrmCampaignEditDrawerComponent implements OnChanges {
    /** Open the drawer; with no campaign it creates a new one. */
    @Input() open = false;
    /** The campaign being edited, or null to create one. */
    @Input() campaign: Campaign | null = null;
    @Input() segments: AudienceSegment[] = [];
    /** Set when the audience segments could not be loaded. */
    @Input() segmentError: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<{ campaign: Campaign; created: boolean }>();

    private readonly fb = inject(FormBuilder);
    private readonly campaignSrv = inject(CampaignService);
    private readonly dialogSrv = inject(DialogService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly host: HTMLElement = inject(ElementRef).nativeElement;

    readonly channelOptions = CHANNEL_OPTIONS;
    readonly statusOptions = STATUS_OPTIONS;

    readonly form = this.fb.group({
        name: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(120)]),
        type: this.fb.nonNullable.control<CampaignType>(CampaignType.Email, Validators.required),
        status: this.fb.nonNullable.control<CampaignStatus>(CampaignStatus.Draft, Validators.required),
        goal: this.fb.nonNullable.control('', Validators.maxLength(255)),
        audienceSegmentId: this.fb.control<string | null>(null),
        startDate: this.fb.control<string | null>(null),
        endDate: this.fb.control<string | null>(null),
        budget: this.fb.control<string | number | null>(null, [Validators.min(0), Validators.max(MAX_AMOUNT)]),
        spent: this.fb.control<string | number | null>(null, [Validators.min(0), Validators.max(MAX_AMOUNT)]),
        description: this.fb.nonNullable.control('', Validators.maxLength(2000)),
    }, { validators: dateOrder });

    submitting = false;

    get segmentOptions(): { value: string; label: string }[] {
        return this.segments.map(s => ({ value: s.id, label: s.name }));
    }

    /** Who the chosen segment covers and how many people are in it today. */
    get segmentHint(): string | null {
        const id = this.form.controls.audienceSegmentId.value;
        const s = id ? this.segments.find(x => x.id === id) : null;
        if (!s) return null;
        return `${s.criteria} · ${s.count.toLocaleString()} ${s.count === 1 ? 'person' : 'people'} now`;
    }

    get amountError(): boolean {
        const c = this.form.controls;
        return [c.budget, c.spent].some(x => (x.touched || x.dirty) && x.hasError('min'));
    }

    ngOnChanges(changes: SimpleChanges): void {
        const opened = changes['open']?.currentValue === true && !changes['open'].previousValue;
        const prev = changes['campaign']?.previousValue as Campaign | null | undefined;
        const swapped = !!changes['campaign'] && this.campaign?.id !== prev?.id;
        // Opening, or switching to another campaign, starts from that campaign's saved values (or a blank draft).
        if (this.open && (opened || swapped)) this.fill(this.campaign);
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.open) this.requestClose();
    }

    submit(): void {
        if (!this.open || this.submitting) return;
        this.form.markAllAsTouched();
        if (this.form.invalid) {
            setTimeout(() => this.host.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')?.scrollIntoView({ block: 'center' }));
            return;
        }

        const existing = this.campaign;
        const save$: Observable<string> = existing
            ? this.campaignSrv.update(existing.id, this.buildUpdate()).pipe(map(() => existing.id))
            : this.campaignSrv.create(this.buildCreate()).pipe(map(res => {
                if (!res?.success || !res.data) throw new Error('Campaign was not created');
                return res.data;
            }));

        this.submitting = true;
        save$
            .pipe(
                // The write returns only the id; read the record back so the list shows what the server stored.
                switchMap(id => this.campaignSrv.search_by_id(id).pipe(map(res => ({ id, res })))),
                finalize(() => this.submitting = false),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: ({ id, res }) => {
                    this.form.markAsPristine();
                    const stored = res?.success && res.data ? res.data : null;
                    this.saved.emit({
                        campaign: stored ?? this.fallback(id, existing),
                        created: !existing,
                    });
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

    private fill(c: Campaign | null): void {
        this.form.reset({
            name: c?.name ?? '',
            type: c?.type ?? CampaignType.Email,
            status: c?.status ?? CampaignStatus.Draft,
            goal: c?.goal ?? '',
            audienceSegmentId: c?.audienceSegmentId ?? null,
            startDate: c?.startDate?.slice(0, 10) ?? null,
            endDate: c?.endDate?.slice(0, 10) ?? null,
            budget: c ? c.budget : null,
            spent: c ? c.spent : null,
            description: c?.description ?? '',
        });
    }

    private buildCreate(): CreateCampaignRequest {
        const v = this.form.getRawValue();
        const text = (s: string) => s.trim() || null;
        return {
            name: v.name.trim(),
            type: v.type,
            audienceSegmentId: v.audienceSegmentId || null,
            goal: text(v.goal),
            startDate: v.startDate || null,
            endDate: v.endDate || null,
            budget: toAmount(v.budget),
            description: text(v.description),
        };
    }

    private buildUpdate(): UpdateCampaignRequest {
        const v = this.form.getRawValue();
        return {
            ...this.buildCreate(),
            status: v.status,
            spent: toAmount(v.spent),
        };
    }

    /** What was saved, for when the read-back failed. */
    private fallback(id: string, existing: Campaign | null): Campaign {
        const body = this.buildUpdate();
        return {
            ...body,
            id,
            code: existing?.code ?? '',
            status: existing ? body.status : CampaignStatus.Draft,
            budget: body.budget ?? 0,
            spent: existing ? body.spent ?? existing.spent : 0,
            audienceSegmentName: this.segments.find(s => s.id === body.audienceSegmentId)?.name ?? null,
            reach: existing?.reach ?? 0,
            conversions: existing?.conversions ?? 0,
            createdBy: existing?.createdBy ?? null,
            createdDate: existing?.createdDate ?? null,
        };
    }
}
