import { Component, Input, OnChanges, SimpleChanges, inject } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { BooCheckboxComponent, BooInputComponent } from '@physioboo/ui';
import { MedicalSpecialtyService } from "../../../../../../services/admin/medical-specialty.service";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { MedicalSpecialty } from "../../../../../../shared/types/medical-staff.types";
import { BooSelectComponent } from "../../../../../select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../../textarea/boo-textarea/boo-textarea.component";
import { BooUploadComponent } from "../../../../../upload/boo-upload/boo-upload.component";
import { CategoryDrawerBase } from "../shared/category-drawer.base";
import { CommonCategoryDrawerShellComponent } from "../shared/category-drawer-shell.component";

const SPECIALTY_CATEGORIES = ['Clinical', 'Paraclinical', 'Administrative'];

/** Create / edit a medical specialty (POST /medical-specialties, PATCH /medical-specialties/{id}). */
@Component({
    selector: 'common-category-medical-specialty-drawer',
    standalone: true,
    imports: [
        SharedModule,
        CommonCategoryDrawerShellComponent,
        BooInputComponent,
        BooTextareaComponent,
        BooCheckboxComponent,
        BooSelectComponent,
        BooUploadComponent
    ],
    template: `
        <common-category-drawer-shell
            [form]="form"
            [isOpen]="isOpen"
            [title]="isEdit ? 'Edit medical specialty' : 'New medical specialty'"
            subtitle="How the specialty is classified and how long a consultation takes."
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
                    <div class="flex gap-5">
                        <div class="flex-none">
                            <boo-upload
                                formControlName="iconUrl"
                                width="5rem"
                                height="5rem"
                                [radius]="12"
                                accept=".svg"
                                [svgSize]="126"
                                (uploadSuccess)="onIconUploaded($event)"
                            />
                            <p class="m-0 mt-1 w-20 text-center text-[11px] leading-4 text-secondary">SVG icon</p>
                        </div>
                        <div class="flex-1 min-w-0 flex flex-col gap-4">
                            <boo-input label="Specialty name" [required]="true" formControlName="name" [maxlength]="150" placeholder="e.g. Cardiology" />
                            <boo-input label="Code" formControlName="code" [maxlength]="20" placeholder="e.g. CARD" />
                        </div>
                    </div>
                </section>

                <section class="px-6 py-5 border-b border-rowDivider">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Classification</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <boo-select label="Parent specialty" formControlName="parentSpecialtyId" [options]="parentChoices" />
                        <boo-select label="Category" formControlName="category" [options]="categoryOptions" />
                    </div>
                    <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="rounded-xl border border-borderGray px-3 py-2.5">
                            <boo-checkbox formControlName="isSurgical" label="Surgical" />
                        </div>
                        <div class="rounded-xl border border-borderGray px-3 py-2.5">
                            <boo-checkbox formControlName="isDiagnostic" label="Diagnostic" />
                        </div>
                    </div>
                    <div class="mt-4 sm:w-1/2 sm:pr-2">
                        <boo-input type="number" label="Avg. consultation (min)" formControlName="averageConsultationDuration" placeholder="30" />
                    </div>
                </section>

                <section class="px-6 py-5">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Details</h3>
                    <div class="flex flex-col gap-4">
                        <boo-textarea label="Description" formControlName="description" />
                        <boo-textarea label="Required qualifications" formControlName="requiredQualifications" placeholder="Degrees and certificates a doctor needs" />
                    </div>
                </section>
            </ng-container>
        </common-category-drawer-shell>
    `
})
export class CommonCategoryMedicalSpecialtyDrawerComponent extends CategoryDrawerBase<MedicalSpecialty> implements OnChanges {
    /** Every specialty, from the list page; the one being edited is left out. */
    @Input() parentOptions: { label: string; value: string }[] = [];

    protected override readonly noun = 'medical specialty';
    protected override readonly service = inject(MedicalSpecialtyService);

    parentChoices: { label: string; value: string | null }[] = [{ label: 'None (top level)', value: null }];
    categoryOptions = this.categoriesWith(null);

    override readonly form = inject(FormBuilder).group({
        name: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(/\S/)]],
        code: [null as string | null],
        category: [null as string | null],
        description: [null as string | null],
        requiredQualifications: [null as string | null],
        isDiagnostic: [false],
        isSurgical: [false],
        parentSpecialtyId: [null as string | null],
        averageConsultationDuration: [30 as number | string, [Validators.min(0)]],
        iconUrl: [null as string | null],
        iconPublicId: [null as string | null]
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

    onIconUploaded(data: { url: string; publicId: string }): void {
        this.form.patchValue({ iconUrl: data.url, iconPublicId: data.publicId });
        this.form.markAsDirty();
    }

    protected override defaults() {
        this.categoryOptions = this.categoriesWith(null);
        return {
            name: '', code: null, category: null, description: null, requiredQualifications: null, isDiagnostic: false,
            isSurgical: false, parentSpecialtyId: null, averageConsultationDuration: 30, iconUrl: null, iconPublicId: null
        };
    }

    protected override toFormValue(item: MedicalSpecialty) {
        this.categoryOptions = this.categoriesWith(item.category ?? null);
        return {
            name: item.name,
            code: item.code,
            category: item.category,
            description: item.description,
            requiredQualifications: item.requiredQualifications,
            isDiagnostic: !!item.isDiagnostic,
            isSurgical: !!item.isSurgical,
            parentSpecialtyId: item.parentSpecialtyId ?? null,
            averageConsultationDuration: item.averageConsultationDuration ?? 0,
            iconUrl: item.iconUrl
        };
    }

    protected override toPayload(raw: Record<string, any>) {
        return {
            name: this.text(raw['name']),
            code: this.text(raw['code']),
            category: this.text(raw['category']),
            isSurgical: !!raw['isSurgical'],
            isDiagnostic: !!raw['isDiagnostic'],
            averageConsultationDuration: this.num(raw['averageConsultationDuration']),
            description: this.text(raw['description']),
            requiredQualifications: this.text(raw['requiredQualifications']),
            parentSpecialtyId: raw['parentSpecialtyId'] || null,
            iconUrl: raw['iconUrl'] || null,
            iconPublicId: raw['iconPublicId'] || null
        };
    }

    /** The preset list, plus a stored category outside it (e.g. the old "Adminstrative" spelling). */
    private categoriesWith(current: string | null): { label: string; value: string }[] {
        const all = current && !SPECIALTY_CATEGORIES.includes(current) ? [...SPECIALTY_CATEGORIES, current] : SPECIALTY_CATEGORIES;
        return all.map(c => ({ label: c, value: c }));
    }
}
