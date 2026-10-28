import { Component, inject } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { BooCheckboxComponent, BooInputComponent } from '@physioboo/ui';
import { LabTestCategoryService } from "../../../../../../services/admin/lab-test-category.service";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { LabTestCategory } from "../../../../../../shared/types/laboratory-imaging.types";
import { BooTextareaComponent } from "../../../../../textarea/boo-textarea/boo-textarea.component";
import { CategoryDrawerBase } from "../shared/category-drawer.base";
import { CommonCategoryDrawerShellComponent } from "../shared/category-drawer-shell.component";

/** Create / edit a lab test category (POST /lab-test-categories, PATCH /lab-test-categories/{id}). */
@Component({
    selector: 'common-category-lab-test-category-drawer',
    standalone: true,
    imports: [
        SharedModule,
        CommonCategoryDrawerShellComponent,
        BooInputComponent,
        BooTextareaComponent,
        BooCheckboxComponent
    ],
    template: `
        <common-category-drawer-shell
            [form]="form"
            [isOpen]="isOpen"
            [title]="isEdit ? 'Edit lab test category' : 'New lab test category'"
            subtitle="Groups lab tests in the catalog and on order forms."
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
            <section class="px-6 py-5" [formGroup]="form">
                <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Category</h3>
                <div class="flex flex-col gap-4">
                    <boo-input label="Name" [required]="true" formControlName="name" [maxlength]="150" placeholder="e.g. Haematology" />
                    <boo-input label="Lab section" formControlName="department" [maxlength]="150" placeholder="e.g. Clinical pathology" />
                    <boo-textarea label="Description" formControlName="description" placeholder="Which tests belong here" />
                </div>
                <div *ngIf="isEdit" class="mt-4 rounded-xl border border-borderGray px-3 py-2.5">
                    <boo-checkbox formControlName="isActive" label="Active" />
                    <p class="m-0 mt-1 text-xs text-secondary">Clear to mark this category inactive.</p>
                </div>
            </section>
        </common-category-drawer-shell>
    `
})
export class CommonCategoryLabTestCategoryDrawerComponent extends CategoryDrawerBase<LabTestCategory> {
    protected override readonly noun = 'lab test category';
    protected override readonly service = inject(LabTestCategoryService);

    override readonly form = inject(FormBuilder).group({
        name: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(/\S/)]],
        description: [null as string | null],
        department: [null as string | null],
        isActive: [true]
    });

    protected override defaults() {
        return { name: '', description: null, department: null, isActive: true };
    }

    protected override toFormValue(item: LabTestCategory) {
        return { name: item.name, description: item.description, department: item.department, isActive: item.isActive };
    }

    protected override toPayload(raw: Record<string, any>) {
        return {
            name: this.text(raw['name']),
            description: this.text(raw['description']),
            department: this.text(raw['department']),
            // Update requires it (create ignores it); omitting it used to deactivate the category on every edit.
            isActive: !!raw['isActive']
        };
    }
}
