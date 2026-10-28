import { Component, inject } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { BooInputComponent } from '@physioboo/ui';
import { map } from "rxjs";
import { SequenceTrackerService } from "../../../../../services/admin/sequence-tracker.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { SequenceTracker } from "../../../../../shared/types/system.types";
import { BooSelectComponent } from "../../../../select/boo-select/boo-select.component";
import { CategoryDrawerBase } from "../../system/common-category/shared/category-drawer.base";
import { CommonCategoryDrawerShellComponent } from "../../system/common-category/shared/category-drawer-shell.component";
import { SEQUENCE_DATE_FORMATS, SEQUENCE_ENTITY_TYPES, buildSequenceCode, dateFormatRepeatsCodes } from "./sequence-tracker.utils";

const WHOLE_NUMBER = /^\d+$/;

/**
 * Create / edit a numbering rule (POST /sequence-trackers, PATCH /sequence-trackers/{id}). The server issues codes
 * as prefix + date + "-" + zero-padded (last number + 1) + suffix for the rule whose record type matches exactly, so
 * the drawer offers the record types the server uses, refuses a second rule for the same type, and warns before a
 * change that would issue codes again.
 */
@Component({
    selector: 'setting-sequence-tracker-drawer',
    standalone: true,
    imports: [
        SharedModule,
        CommonCategoryDrawerShellComponent,
        BooInputComponent,
        BooSelectComponent,
    ],
    template: `
        <common-category-drawer-shell
            [form]="form"
            [isOpen]="isOpen"
            [title]="isEdit ? 'Edit numbering rule' : 'New numbering rule'"
            subtitle="How codes are generated for one type of record."
            [isEdit]="isEdit"
            [canDelete]="canDelete"
            [loading]="loading"
            [loadFailed]="loadFailed"
            [saving]="saving || checking"
            (save)="save()"
            (cancel)="requestClose()"
            (discard)="discard()"
            (delete)="onDelete()"
            (retry)="loadDetail()"
        >
            <ng-container [formGroup]="form">
                <section class="px-6 py-5 border-b border-rowDivider">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Record type</h3>
                    <boo-select label="Record type" [required]="true" formControlName="entityType" [options]="entityTypeOptions" />
                    <p *ngIf="duplicateType" class="m-0 mt-1 text-xs text-danger" role="alert">A rule for {{ duplicateType }} already exists. Edit that rule instead.</p>
                    <p *ngIf="isEdit && typeChanged" class="m-0 mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900" role="note">
                        <physio-icon name="triangle-alert" [size]="14" class="shrink-0 mt-px" aria-hidden="true" />
                        {{ loaded?.entityType }} records will have no numbering rule after this change, and creating them will fail until one is added.
                    </p>
                </section>

                <section class="px-6 py-5 border-b border-rowDivider">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Code format</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <boo-input label="Prefix" [required]="true" formControlName="prefix" [maxlength]="20" />
                        <boo-input label="Suffix (optional)" formControlName="suffix" [maxlength]="20" />
                        <boo-select class="sm:col-span-2" label="Date part" formControlName="useDateFormating" [options]="dateFormats" />
                        <div>
                            <boo-input type="number" label="Number of digits" [required]="true" formControlName="sequenceLength" />
                            <p *ngIf="form.controls.sequenceLength.touched && form.controls.sequenceLength.invalid" class="m-0 mt-1 text-xs text-danger" role="alert">Enter a whole number from 1 to 18.</p>
                        </div>
                        <div>
                            <boo-input type="number" label="Last issued number" [required]="true" formControlName="currentSequence" />
                            <p *ngIf="form.controls.currentSequence.touched && form.controls.currentSequence.invalid; else counterHint" class="m-0 mt-1 text-xs text-danger" role="alert">Enter a whole number, 0 or more.</p>
                            <ng-template #counterHint><p class="m-0 mt-1 text-xs text-secondary">The next code uses this number + 1.</p></ng-template>
                        </div>
                    </div>

                    <p *ngIf="repeatsCodes" class="m-0 mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900" role="note">
                        <physio-icon name="triangle-alert" [size]="14" class="shrink-0 mt-px" aria-hidden="true" />
                        The counter restarts at 1 every day. A year or month date part stays the same across days, so codes will repeat. Use the full date, or no date.
                    </p>
                    <p *ngIf="isEdit && counterLowered" class="m-0 mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800" role="note">
                        <physio-icon name="triangle-alert" [size]="14" class="shrink-0 mt-px" aria-hidden="true" />
                        Lowering the number from {{ loaded?.currentSequence }} re-issues codes that may already belong to existing records.
                    </p>
                </section>

                <section class="px-6 py-5">
                    <h3 class="m-0 mb-3 text-xs font-semibold uppercase tracking-wider text-secondary">Next code</h3>
                    <div class="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                        <p class="m-0 text-lg font-mono text-regular break-all">{{ preview }}</p>
                        <p class="m-0 mt-1 text-xs text-secondary">The code the next {{ form.controls.entityType.value || 'record' }} would get if created today, once this rule is saved.</p>
                    </div>
                </section>
            </ng-container>
        </common-category-drawer-shell>
    `
})
export class SettingSequenceTrackerDrawerComponent extends CategoryDrawerBase<SequenceTracker> {
    protected override readonly noun = 'numbering rule';
    protected override readonly service = inject(SequenceTrackerService);

    readonly dateFormats = SEQUENCE_DATE_FORMATS;
    /** The record as loaded, to warn about changes that affect codes already issued. */
    loaded: SequenceTracker | null = null;
    checking = false;
    duplicateType: string | null = null;

    override readonly form = inject(FormBuilder).group({
        entityType: ['', [Validators.required]],
        prefix: ['', [Validators.required, Validators.maxLength(20)]],
        suffix: ['' as string | null, [Validators.maxLength(20)]],
        useDateFormating: [null as string | null],
        sequenceLength: [6 as number | string, [Validators.required, Validators.min(1), Validators.max(18), Validators.pattern(WHOLE_NUMBER)]],
        currentSequence: [0 as number | string, [Validators.required, Validators.min(0), Validators.pattern(WHOLE_NUMBER)]],
    });

    /** Known record types, plus the loaded one if it isn't (so an old rule still shows its own type). */
    get entityTypeOptions(): { label: string; value: string }[] {
        const types = [...SEQUENCE_ENTITY_TYPES];
        const current = this.loaded?.entityType;
        if (current && !types.includes(current)) types.unshift(current);
        return types.map(t => ({ label: t === current && !SEQUENCE_ENTITY_TYPES.includes(t) ? `${t} (not used)` : t, value: t }));
    }

    get preview(): string {
        const v = this.form.getRawValue();
        return buildSequenceCode({
            prefix: (v.prefix ?? '').trim() || 'PREFIX',
            suffix: (v.suffix ?? '').trim() || null,
            useDateFormating: v.useDateFormating,
            sequenceLength: this.num(v.sequenceLength, 1) ?? 1,
        }, (this.num(v.currentSequence, 0) ?? 0) + 1);
    }

    get repeatsCodes(): boolean {
        return dateFormatRepeatsCodes(this.form.controls.useDateFormating.value);
    }

    get typeChanged(): boolean {
        return !!this.loaded && this.form.controls.entityType.value !== this.loaded.entityType;
    }

    get counterLowered(): boolean {
        const value = this.num(this.form.controls.currentSequence.value, null);
        return !!this.loaded && value !== null && value < this.loaded.currentSequence;
    }

    protected override defaults() {
        this.loaded = null;
        this.duplicateType = null;
        return { entityType: '', prefix: '', suffix: '', useDateFormating: null, sequenceLength: 6, currentSequence: 0 };
    }

    protected override toFormValue(item: SequenceTracker) {
        this.loaded = item;
        return {
            entityType: item.entityType,
            prefix: item.prefix,
            suffix: item.suffix ?? '',
            useDateFormating: item.useDateFormating ?? null,
            sequenceLength: item.sequenceLength,
            currentSequence: item.currentSequence,
        };
    }

    protected override toPayload(raw: Record<string, any>) {
        return {
            entityType: String(raw['entityType'] ?? '').trim(),
            prefix: String(raw['prefix'] ?? '').trim(),
            suffix: this.text(raw['suffix']),
            useDateFormating: raw['useDateFormating'] || null,
            sequenceLength: this.num(raw['sequenceLength'], 1),
            currentSequence: this.num(raw['currentSequence'], 0),
        };
    }

    /**
     * The server keeps no uniqueness on the record type and uses the first matching rule, so a second rule for the
     * same type would make numbering unpredictable. Check before saving a new type.
     */
    override save(): void {
        if (this.saving || this.checking || this.loading || this.loadFailed) return;
        const entityType = String(this.form.controls.entityType.value ?? '').trim();
        this.duplicateType = null;
        if (this.form.invalid || !entityType || (this.isEdit && !this.typeChanged)) {
            super.save();
            return;
        }

        this.checking = true;
        this.service.search({ pageNumber: 1, pageSize: 50, search: entityType, sort: '+entityType', filter: { start: '', end: '' } })
            .pipe(map(res => (res.data?.items ?? []).some(r => r.entityType === entityType && r.id !== this.currentId)))
            .subscribe({
                next: exists => {
                    this.checking = false;
                    if (exists) {
                        this.duplicateType = entityType;
                        return;
                    }
                    super.save();
                },
                error: () => this.checking = false
            });
    }
}
