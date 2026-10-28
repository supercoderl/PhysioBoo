import { Component, OnChanges, SimpleChanges, inject } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { BooCheckboxComponent, BooInputComponent } from '@physioboo/ui';
import { LabTestCategoryService } from "../../../../../../services/admin/lab-test-category.service";
import { LabTestService } from "../../../../../../services/admin/lab-test.service";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { LabTest } from "../../../../../../shared/types/laboratory-imaging.types";
import { BooSelectComponent } from "../../../../../select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../../textarea/boo-textarea/boo-textarea.component";
import { CategoryDrawerBase } from "../shared/category-drawer.base";
import { CommonCategoryDrawerShellComponent } from "../shared/category-drawer-shell.component";

/** Create / edit a lab test (POST /lab-tests, PATCH /lab-tests/{id}). The test code is assigned by the server. */
@Component({
    selector: 'common-category-lab-test-drawer',
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
            [title]="isEdit ? 'Edit lab test' : 'New lab test'"
            subtitle="What is collected, how it is reported and what it costs."
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
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Test</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <boo-input class="sm:col-span-2" label="Test name" [required]="true" formControlName="testName" [maxlength]="200" placeholder="e.g. Complete blood count (CBC)" />
                        <boo-select class="sm:col-span-2" label="Category" formControlName="categoryId" [options]="categoryOptions" [required]="true" />
                        <boo-input label="Methodology" formControlName="methodology" [maxlength]="150" placeholder="e.g. Spectrophotometry" />
                        <boo-input label="Unit of measurement" formControlName="unitOfMeasurement" [maxlength]="50" placeholder="e.g. mg/dL" />
                    </div>
                    <p *ngIf="form.controls['categoryId'].touched && form.controls['categoryId'].invalid" class="m-0 mt-1 text-xs text-danger" role="alert">Choose a category.</p>
                    <div class="mt-4">
                        <boo-textarea label="Description" formControlName="description" />
                    </div>
                </section>

                <section class="px-6 py-5 border-b border-rowDivider">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Specimen and collection</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <boo-input label="Sample type" formControlName="sampleType" [maxlength]="100" placeholder="e.g. Whole blood" />
                        <boo-input label="Sample volume" formControlName="sampleVolume" [maxlength]="50" placeholder="e.g. 5 ml" />
                    </div>
                    <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="rounded-xl border border-borderGray px-3 py-2.5">
                            <boo-checkbox formControlName="preparationRequired" label="Preparation required" />
                        </div>
                        <div class="rounded-xl border border-borderGray px-3 py-2.5">
                            <boo-checkbox formControlName="fastingRequired" label="Fasting required" />
                        </div>
                    </div>
                    <div class="mt-4 flex flex-col gap-4">
                        <div *ngIf="form.value.fastingRequired" class="sm:w-1/2 sm:pr-2">
                            <boo-input type="number" label="Fasting (hours)" formControlName="fastingHours" placeholder="8" />
                        </div>
                        <boo-textarea *ngIf="form.value.preparationRequired" label="Patient preparation" formControlName="preparationInstructions" />
                        <boo-textarea label="Collection instructions" formControlName="collectionInstructions" placeholder="For the staff collecting the sample" />
                    </div>
                </section>

                <section class="px-6 py-5 border-b border-rowDivider">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Reference ranges</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <boo-input label="Male" formControlName="normalRangeMale" [maxlength]="100" placeholder="e.g. 4.5–5.5" />
                        <boo-input label="Female" formControlName="normalRangeFemale" [maxlength]="100" placeholder="e.g. 4.0–5.0" />
                        <boo-input label="Pediatric" formControlName="normalPediatric" [maxlength]="100" placeholder="e.g. 3.8–4.8" />
                    </div>
                </section>

                <section class="px-6 py-5">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Ordering, turnaround and price</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <boo-input type="number" label="Price (USD)" formControlName="cost" placeholder="0.00" />
                        <boo-input type="number" label="Turnaround (hours)" formControlName="reportingTimeHours" placeholder="24" />
                    </div>
                    <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="rounded-xl border border-borderGray px-3 py-2.5">
                            <boo-checkbox formControlName="isProfile" label="Panel of several tests" />
                        </div>
                        <div class="rounded-xl border border-borderGray px-3 py-2.5">
                            <boo-checkbox formControlName="requiresAppoinment" label="Appointment required" />
                        </div>
                        <div class="rounded-xl border border-borderGray px-3 py-2.5">
                            <boo-checkbox formControlName="isUrgentAvailable" label="Urgent processing" />
                        </div>
                        <div class="rounded-xl border border-borderGray px-3 py-2.5">
                            <boo-checkbox formControlName="isHomeCollectionAvailable" label="Home collection" />
                        </div>
                    </div>
                    <div *ngIf="form.value.isUrgentAvailable" class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <boo-input type="number" label="Urgent price (USD)" formControlName="urgentCost" placeholder="0.00" />
                        <boo-input type="number" label="Urgent turnaround (hours)" formControlName="urgentReportingTimeHours" placeholder="2" />
                    </div>
                    <div *ngIf="form.value.isHomeCollectionAvailable" class="mt-4 sm:w-1/2 sm:pr-2">
                        <boo-input type="number" label="Home collection charge (USD)" formControlName="homeCollectionCharge" placeholder="0.00" />
                    </div>
                    <div *ngIf="isEdit" class="mt-4 rounded-xl border border-borderGray px-3 py-2.5">
                        <boo-checkbox formControlName="isActive" label="Active" />
                        <p class="m-0 mt-1 text-xs text-secondary">Clear to mark this test inactive.</p>
                    </div>
                </section>
            </ng-container>
        </common-category-drawer-shell>
    `
})
export class CommonCategoryLabTestDrawerComponent extends CategoryDrawerBase<LabTest> implements OnChanges {
    protected override readonly noun = 'lab test';
    protected override readonly service = inject(LabTestService);
    private readonly categorySrv = inject(LabTestCategoryService);

    categoryOptions: { label: string; value: string }[] = [];

    override readonly form = inject(FormBuilder).group({
        testName: ['', [Validators.required, Validators.maxLength(200), Validators.pattern(/\S/)]],
        categoryId: [null as string | null, [Validators.required]],
        description: [null as string | null],
        sampleType: [null as string | null],
        sampleVolume: [null as string | null],
        unitOfMeasurement: [null as string | null],
        methodology: [null as string | null],
        preparationRequired: [false],
        preparationInstructions: [null as string | null],
        fastingRequired: [false],
        fastingHours: [0 as number | string, [Validators.min(0)]],
        collectionInstructions: [null as string | null],
        normalRangeMale: [null as string | null],
        normalRangeFemale: [null as string | null],
        normalPediatric: [null as string | null],
        cost: [0 as number | string, [Validators.min(0)]],
        reportingTimeHours: [0 as number | string, [Validators.min(0)]],
        isProfile: [false],
        requiresAppoinment: [false],
        isUrgentAvailable: [false],
        urgentCost: [0 as number | string, [Validators.min(0)]],
        urgentReportingTimeHours: [0 as number | string, [Validators.min(0)]],
        isHomeCollectionAvailable: [false],
        homeCollectionCharge: [0 as number | string, [Validators.min(0)]],
        isActive: [true]
    });

    override ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);
        // Categories can change on their own page; read the (cached) lookup each time the drawer opens.
        if (changes['isOpen'] && this.isOpen) {
            this.categorySrv.lookup().subscribe(options => this.categoryOptions = options);
        }
    }

    protected override defaults() {
        return {
            testName: '', categoryId: null, description: null, sampleType: null, sampleVolume: null, unitOfMeasurement: null,
            methodology: null, preparationRequired: false, preparationInstructions: null, fastingRequired: false, fastingHours: 0,
            collectionInstructions: null, normalRangeMale: null, normalRangeFemale: null, normalPediatric: null, cost: 0,
            reportingTimeHours: 0, isProfile: false, requiresAppoinment: false, isUrgentAvailable: false, urgentCost: 0,
            urgentReportingTimeHours: 0, isHomeCollectionAvailable: false, homeCollectionCharge: 0, isActive: true
        };
    }

    protected override toFormValue(item: LabTest) {
        return {
            testName: item.testName,
            categoryId: item.categoryId,
            description: item.description,
            sampleType: item.sampleType,
            sampleVolume: item.sampleVolume,
            unitOfMeasurement: item.unitOfMeasurement,
            methodology: item.methodology,
            preparationRequired: !!item.preparationRequired,
            preparationInstructions: item.preparationInstructions,
            fastingRequired: !!item.fastingRequired,
            fastingHours: item.fastingHours ?? 0,
            collectionInstructions: item.collectionInstructions,
            normalRangeMale: item.normalRangeMale,
            normalRangeFemale: item.normalRangeFemale,
            normalPediatric: item.normalPediatric,
            cost: item.cost ?? 0,
            reportingTimeHours: item.reportingTimeHours ?? 0,
            isProfile: !!item.isProfile,
            requiresAppoinment: !!item.requiresAppoinment,
            isUrgentAvailable: !!item.isUrgentAvailable,
            urgentCost: item.urgentCost ?? 0,
            urgentReportingTimeHours: item.urgentReportingTimeHours ?? 0,
            isHomeCollectionAvailable: !!item.isHomeCollectionAvailable,
            homeCollectionCharge: item.homeCollectionCharge ?? 0,
            isActive: item.isActive
        };
    }

    protected override toPayload(raw: Record<string, any>) {
        return {
            testName: this.text(raw['testName']),
            categoryId: raw['categoryId'],
            description: this.text(raw['description']),
            sampleType: this.text(raw['sampleType']),
            sampleVolume: this.text(raw['sampleVolume']),
            collectionInstructions: this.text(raw['collectionInstructions']),
            preparationRequired: !!raw['preparationRequired'],
            preparationInstructions: this.text(raw['preparationInstructions']),
            fastingRequired: !!raw['fastingRequired'],
            fastingHours: this.num(raw['fastingHours']),
            normalRangeMale: this.text(raw['normalRangeMale']),
            normalRangeFemale: this.text(raw['normalRangeFemale']),
            normalPediatric: this.text(raw['normalPediatric']),
            unitOfMeasurement: this.text(raw['unitOfMeasurement']),
            methodology: this.text(raw['methodology']),
            reportingTimeHours: this.num(raw['reportingTimeHours']),
            cost: this.num(raw['cost']),
            isProfile: !!raw['isProfile'],
            isUrgentAvailable: !!raw['isUrgentAvailable'],
            urgentCost: this.num(raw['urgentCost']),
            urgentReportingTimeHours: this.num(raw['urgentReportingTimeHours']),
            isHomeCollectionAvailable: !!raw['isHomeCollectionAvailable'],
            homeCollectionCharge: this.num(raw['homeCollectionCharge']),
            requiresAppoinment: !!raw['requiresAppoinment'],
            // Update requires it (create ignores it); omitting it used to deactivate the test on every edit.
            isActive: !!raw['isActive']
        };
    }
}
