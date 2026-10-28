import { Component, inject } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { BooCheckboxComponent, BooInputComponent } from '@physioboo/ui';
import { DepartmentService } from "../../../../../../services/admin/department.service";
import { DoctorService } from "../../../../../../services/admin/doctor.service";
import { HospitalService } from "../../../../../../services/admin/hospital.service";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { Department } from "../../../../../../shared/types/operation.types";
import { BooSelectComponent } from "../../../../../select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../../textarea/boo-textarea/boo-textarea.component";
import { CategoryDrawerBase } from "../shared/category-drawer.base";
import { CommonCategoryDrawerShellComponent } from "../shared/category-drawer-shell.component";

/**
 * Create / edit a department (POST /departments, PATCH /departments/{id}). The create endpoint does not take bed
 * count, care types or status, so those are edited once the department exists.
 */
@Component({
    selector: 'common-category-department-drawer',
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
            [title]="isEdit ? 'Edit department' : 'New department'"
            subtitle="Where the department is, who leads it and the care it provides."
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
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Department</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <boo-input label="Name" [required]="true" formControlName="name" [maxlength]="100" placeholder="e.g. Cardiology" />
                        <boo-input label="Code" formControlName="departmentCode" [maxlength]="20" placeholder="e.g. CARD" />
                        <boo-select label="Hospital" formControlName="hospitalId" [options]="hospitalOptions" [required]="true" />
                        <boo-select label="Head of department" formControlName="headOfDepartment" [options]="doctorOptions" />
                    </div>
                    <p *ngIf="form.controls['hospitalId'].touched && form.controls['hospitalId'].invalid" class="m-0 mt-1 text-xs text-danger" role="alert">Choose the hospital this department belongs to.</p>
                </section>

                <section class="px-6 py-5 border-b border-rowDivider">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Location and contact</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <boo-input type="number" label="Floor" formControlName="floorNumber" placeholder="1" />
                        <boo-input label="Wing / block" formControlName="wing" [maxlength]="50" placeholder="e.g. East" />
                        <boo-input label="Phone" formControlName="phone" [maxlength]="20" />
                        <boo-input type="email" label="Email" formControlName="email" [maxlength]="150" placeholder="cardiology@hospital.org" />
                        <boo-input label="Operating hours" formControlName="operationHours" [maxlength]="100" placeholder="24/7 or 08:00–17:00" />
                        <boo-input type="number" label="Budget allocated (USD)" formControlName="budgetAllocated" placeholder="0.00" />
                    </div>
                </section>

                <section class="px-6 py-5 border-b border-rowDivider">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Capacity and care</h3>
                    <ng-container *ngIf="isEdit; else createNote">
                        <div class="sm:w-1/2 sm:pr-2">
                            <boo-input type="number" label="Beds" formControlName="bedCount" placeholder="0" />
                        </div>
                        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div class="rounded-xl border border-borderGray px-3 py-2.5">
                                <boo-checkbox formControlName="isEmergency" label="Emergency" />
                            </div>
                            <div class="rounded-xl border border-borderGray px-3 py-2.5">
                                <boo-checkbox formControlName="isCriticalCare" label="Critical care" />
                            </div>
                            <div class="rounded-xl border border-borderGray px-3 py-2.5">
                                <boo-checkbox formControlName="isInPatient" label="Inpatient" />
                            </div>
                            <div class="rounded-xl border border-borderGray px-3 py-2.5">
                                <boo-checkbox formControlName="isOutPatient" label="Outpatient" />
                            </div>
                        </div>
                    </ng-container>
                    <ng-template #createNote>
                        <p class="m-0 text-sm text-secondary">Beds and the type of care are set after the department is created.</p>
                    </ng-template>
                </section>

                <section class="px-6 py-5">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Details</h3>
                    <div class="flex flex-col gap-4">
                        <boo-textarea label="Description" formControlName="description" />
                        <boo-textarea label="Equipment" formControlName="equipmentList" placeholder="e.g. Ventilators, ECG monitors" />
                    </div>
                    <div *ngIf="isEdit" class="mt-4 rounded-xl border border-borderGray px-3 py-2.5">
                        <boo-checkbox formControlName="isActive" label="Active" />
                        <p class="m-0 mt-1 text-xs text-secondary">Clear to mark this department inactive.</p>
                    </div>
                </section>
            </ng-container>
        </common-category-drawer-shell>
    `
})
export class CommonCategoryDepartmentDrawerComponent extends CategoryDrawerBase<Department> {
    protected override readonly noun = 'department';
    protected override readonly service = inject(DepartmentService);

    doctorOptions: { label: string; value: string }[] = [];
    hospitalOptions: { label: string; value: string }[] = [];

    override readonly form = inject(FormBuilder).group({
        hospitalId: [null as string | null, [Validators.required]],
        name: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]],
        departmentCode: [null as string | null],
        description: [null as string | null],
        headOfDepartment: [null as string | null],
        budgetAllocated: [null as number | string | null, [Validators.min(0)]],
        floorNumber: [null as number | string | null],
        wing: [null as string | null],
        phone: [null as string | null],
        email: [null as string | null, [Validators.email]],
        bedCount: [0 as number | string, [Validators.min(0)]],
        isEmergency: [false],
        isCriticalCare: [false],
        isOutPatient: [false],
        isInPatient: [false],
        operationHours: [null as string | null],
        equipmentList: [null as string | null],
        isActive: [true]
    });

    constructor() {
        super();
        inject(HospitalService).lookup().subscribe(items => {
            this.hospitalOptions = items.map(h => ({ label: h.name, value: h.id }));
        });
        inject(DoctorService).search({ pageNumber: 1, pageSize: 200, search: '', sort: '+fullName', filter: { start: '', end: '' } }).subscribe(res => {
            if (res.success) this.doctorOptions = (res.data?.items ?? []).map(d => ({ label: d.fullName, value: d.id }));
        });
    }

    protected override defaults() {
        return {
            hospitalId: null, name: '', departmentCode: null, description: null, headOfDepartment: null, budgetAllocated: null,
            floorNumber: null, wing: null, phone: null, email: null, bedCount: 0, isEmergency: false, isCriticalCare: false,
            isOutPatient: false, isInPatient: false, operationHours: null, equipmentList: null, isActive: true
        };
    }

    protected override toFormValue(item: Department) {
        return {
            hospitalId: item.hospitalId,
            name: item.name ?? '',
            departmentCode: item.departmentCode,
            description: item.description,
            headOfDepartment: item.headOfDepartment,
            budgetAllocated: item.budgetAllocated,
            floorNumber: item.floorNumber,
            wing: item.wing,
            phone: item.phone,
            email: item.email,
            bedCount: item.bedCount ?? 0,
            isEmergency: !!item.isEmergency,
            isCriticalCare: !!item.isCriticalCare,
            isOutPatient: !!item.isOutPatient,
            isInPatient: !!item.isInPatient,
            operationHours: item.operationHours,
            equipmentList: item.equipmentList,
            isActive: item.isActive ?? true
        };
    }

    protected override toPayload(raw: Record<string, any>) {
        return {
            hospitalId: raw['hospitalId'],
            name: this.text(raw['name']),
            departmentCode: this.text(raw['departmentCode']),
            description: this.text(raw['description']),
            headOfDepartment: raw['headOfDepartment'] || null,
            budgetAllocated: this.num(raw['budgetAllocated'], null),
            floorNumber: this.num(raw['floorNumber'], null),
            wing: this.text(raw['wing']),
            phone: this.text(raw['phone']),
            email: this.text(raw['email']),
            operationHours: this.text(raw['operationHours']),
            equipmentList: this.text(raw['equipmentList']),
            // Update only (create ignores them); the update contract needs isActive or the department is deactivated.
            bedCount: this.num(raw['bedCount']),
            isEmergency: !!raw['isEmergency'],
            isCriticalCare: !!raw['isCriticalCare'],
            isOutPatient: !!raw['isOutPatient'],
            isInPatient: !!raw['isInPatient'],
            isActive: !!raw['isActive']
        };
    }
}
