import { Component, Input, OnChanges, SimpleChanges, inject } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { BooCheckboxComponent, BooInputComponent } from '@physioboo/ui';
import { MedicineCategoryService } from "../../../../../../services/admin/medicine-category.service";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { MedicineCategory } from "../../../../../../shared/types/clinical.types";
import { BooSelectComponent } from "../../../../../select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../../textarea/boo-textarea/boo-textarea.component";
import { CategoryDrawerBase } from "../shared/category-drawer.base";
import { CommonCategoryDrawerShellComponent } from "../shared/category-drawer-shell.component";

/** Create / edit a medicine category (POST /medicine-categories, PATCH /medicine-categories/{id}). The code is assigned by the server. */
@Component({
    selector: 'common-category-medicine-category-drawer',
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
            [title]="isEdit ? 'Edit medicine category' : 'New medicine category'"
            subtitle="Where the category sits in the formulary and how its medicines are dispensed."
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
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Category</h3>
                    <div class="flex flex-col gap-4">
                        <boo-input label="Category name" [required]="true" formControlName="name" [maxlength]="150" placeholder="e.g. Antibiotics" />
                        <boo-select label="Parent category" formControlName="parentCategoryId" [options]="parentChoices" />
                    </div>
                </section>

                <section class="px-6 py-5 border-b border-rowDivider">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Dispensing rules</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="rounded-xl border border-borderGray px-3 py-2.5">
                            <boo-checkbox formControlName="requiresPrescription" label="Prescription required" />
                        </div>
                        <div class="rounded-xl border border-borderGray px-3 py-2.5">
                            <boo-checkbox formControlName="isControlled" label="Controlled substance" />
                        </div>
                    </div>
                </section>

                <section class="px-6 py-5">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Details</h3>
                    <div class="flex flex-col gap-4">
                        <boo-textarea label="Storage conditions" formControlName="storageConditions" placeholder="e.g. Store below 25°C, away from direct sunlight" />
                        <boo-textarea label="Description" formControlName="description" />
                    </div>
                </section>
            </ng-container>
        </common-category-drawer-shell>
    `
})
export class CommonCategoryMedicineCategoryDrawerComponent extends CategoryDrawerBase<MedicineCategory> implements OnChanges {
    /** Every category, from the list page; the one being edited is left out. */
    @Input() parentOptions: { label: string; value: string }[] = [];

    protected override readonly noun = 'medicine category';
    protected override readonly service = inject(MedicineCategoryService);

    parentChoices: { label: string; value: string | null }[] = [{ label: 'None (top level)', value: null }];

    override readonly form = inject(FormBuilder).group({
        name: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(/\S/)]],
        description: [null as string | null],
        parentCategoryId: [null as string | null],
        isControlled: [false],
        requiresPrescription: [false],
        storageConditions: [null as string | null]
    });

    override ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);
        if (changes['parentOptions'] || changes['currentId']) {
            this.parentChoices = [
                { label: 'None (top level)', value: null },
                ...this.parentOptions.filter(o => o.value !== this.currentId)
            ];
        }
    }

    protected override defaults() {
        return { name: '', description: null, parentCategoryId: null, isControlled: false, requiresPrescription: false, storageConditions: null };
    }

    protected override toFormValue(item: MedicineCategory) {
        return {
            name: item.name,
            description: item.description,
            parentCategoryId: item.parentCategoryId ?? null,
            isControlled: !!item.isControlled,
            requiresPrescription: !!item.requiresPrescription,
            storageConditions: item.storageConditions
        };
    }

    protected override toPayload(raw: Record<string, any>) {
        return {
            name: this.text(raw['name']),
            description: this.text(raw['description']),
            parentCategoryId: raw['parentCategoryId'] || null,
            isControlled: !!raw['isControlled'],
            requiresPrescription: !!raw['requiresPrescription'],
            storageConditions: this.text(raw['storageConditions'])
        };
    }
}
