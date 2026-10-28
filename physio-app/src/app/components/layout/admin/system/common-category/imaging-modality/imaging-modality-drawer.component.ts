import { Component, inject } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { BooCheckboxComponent, BooInputComponent } from '@physioboo/ui';
import { ImagingModalityService } from "../../../../../../services/admin/imaging-modality.service";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { ImagingModality } from "../../../../../../shared/types/laboratory-imaging.types";
import { BooSelectComponent } from "../../../../../select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../../textarea/boo-textarea/boo-textarea.component";
import { CategoryDrawerBase } from "../shared/category-drawer.base";
import { CommonCategoryDrawerShellComponent } from "../shared/category-drawer-shell.component";

const MODALITY_CATEGORIES = ['X-Ray', 'Ultrasound', 'MRI', 'CT Scan', 'Nuclear Medicine'];

/** Create / edit an imaging modality (POST /imaging-modalities, PATCH /imaging-modalities/{id}). */
@Component({
    selector: 'common-category-imaging-modality-drawer',
    standalone: true,
    imports: [
        SharedModule,
        CommonCategoryDrawerShellComponent,
        BooInputComponent,
        BooTextareaComponent,
        BooCheckboxComponent,
        BooSelectComponent
    ],
    template: `
        <common-category-drawer-shell
            [form]="form"
            [isOpen]="isOpen"
            [title]="isEdit ? 'Edit imaging modality' : 'New imaging modality'"
            subtitle="How the exam is scheduled and what the patient needs to know."
            [isEdit]="isEdit"
            [canDelete]="canDelete"
            [loading]="loading"
            [loadFailed]="loadFailed"
            [saving]="saving"
            (save)="save()"
            (cancel)="requestClose()"
            (discard)="discard()"
            (delete)="onDelete()"
            (retry)="loadDetail()"
        >
            <ng-container [formGroup]="form">
                <section class="px-6 py-5 border-b border-rowDivider">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Basic information</h3>
                    <div class="flex flex-col gap-4">
                        <boo-input label="Name" [required]="true" formControlName="name" [maxlength]="150" placeholder="e.g. Magnetic resonance imaging" />
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <boo-input label="Code" formControlName="code" [maxlength]="20" placeholder="e.g. MRI" />
                            <boo-select label="Category" formControlName="category" [options]="categoryOptions" />
                        </div>
                    </div>
                </section>

                <section class="px-6 py-5 border-b border-rowDivider">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Exam parameters</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <boo-input type="number" label="Average duration (min)" formControlName="averageDurationMinutes" placeholder="30" />
                        <boo-input type="number" label="Radiation dose (mSv)" formControlName="radiationDose" placeholder="0" />
                    </div>
                    <p class="m-0 mt-2 text-xs text-secondary">Use 0 for modalities without ionizing radiation, such as ultrasound and MRI.</p>
                </section>

                <section class="px-6 py-5 border-b border-rowDivider">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Patient preparation</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="rounded-xl border border-borderGray px-3 py-2.5">
                            <boo-checkbox formControlName="requiresContrast" label="Contrast agent" />
                        </div>
                        <div class="rounded-xl border border-borderGray px-3 py-2.5">
                            <boo-checkbox formControlName="preparationRequired" label="Preparation required" />
                        </div>
                    </div>
                    <div *ngIf="form.value.preparationRequired" class="mt-4">
                        <boo-textarea label="Preparation instructions" formControlName="preparationInstructions" placeholder="e.g. Fast for 6 hours; drink 1 litre of water an hour before" />
                    </div>
                </section>

                <section class="px-6 py-5">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Details</h3>
                    <boo-textarea label="Description" formControlName="description" placeholder="What this modality is used for" />
                    <div *ngIf="isEdit" class="mt-4 rounded-xl border border-borderGray px-3 py-2.5">
                        <boo-checkbox formControlName="isActive" label="Active" />
                        <p class="m-0 mt-1 text-xs text-secondary">Clear to mark this modality inactive.</p>
                    </div>
                </section>
            </ng-container>
        </common-category-drawer-shell>
    `
})
export class CommonCategoryImagingModalityDrawerComponent extends CategoryDrawerBase<ImagingModality> {
    protected override readonly noun = 'imaging modality';
    protected override readonly service = inject(ImagingModalityService);

    override readonly form = inject(FormBuilder).group({
        name: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(/\S/)]],
        code: [null as string | null],
        category: [null as string | null],
        description: [null as string | null],
        requiresContrast: [false],
        preparationRequired: [false],
        preparationInstructions: [null as string | null],
        averageDurationMinutes: [0 as number | string, [Validators.min(0)]],
        radiationDose: [0 as number | string, [Validators.min(0)]],
        isActive: [true]
    });

    /** The preset list, plus a stored category that is not in it, so editing never drops it. */
    categoryOptions = this.optionsWith(null);

    protected override defaults() {
        this.categoryOptions = this.optionsWith(null);
        return {
            name: '', code: null, category: null, description: null, requiresContrast: false, preparationRequired: false,
            preparationInstructions: null, averageDurationMinutes: 0, radiationDose: 0, isActive: true
        };
    }

    protected override toFormValue(item: ImagingModality) {
        this.categoryOptions = this.optionsWith(item.category);
        return {
            name: item.name,
            code: item.code,
            category: item.category,
            description: item.description,
            requiresContrast: !!item.requiresContrast,
            preparationRequired: !!item.preparationRequired,
            preparationInstructions: item.preparationInstructions,
            averageDurationMinutes: item.averageDurationMinutes ?? 0,
            radiationDose: item.radiationDose ?? 0,
            isActive: item.isActive
        };
    }

    protected override toPayload(raw: Record<string, any>) {
        return {
            name: this.text(raw['name']),
            code: this.text(raw['code']),
            category: this.text(raw['category']),
            description: this.text(raw['description']),
            requiresContrast: !!raw['requiresContrast'],
            preparationRequired: !!raw['preparationRequired'],
            preparationInstructions: this.text(raw['preparationInstructions']),
            averageDurationMinutes: this.num(raw['averageDurationMinutes']),
            radiationDose: this.num(raw['radiationDose']),
            // Update requires it (create ignores it); omitting it used to deactivate the modality on every edit.
            isActive: !!raw['isActive']
        };
    }

    private optionsWith(current: string | null): { label: string; value: string }[] {
        const all = current && !MODALITY_CATEGORIES.includes(current) ? [...MODALITY_CATEGORIES, current] : MODALITY_CATEGORIES;
        return all.map(c => ({ label: c, value: c }));
    }
}
