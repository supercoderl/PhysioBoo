import { Component, inject } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { BooCheckboxComponent, BooInputComponent } from '@physioboo/ui';
import { AppointmentTypeService } from "../../../../../../services/admin/appointment-type.service";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { AppointmentType } from "../../../../../../shared/types/operation.types";
import { BooTextareaComponent } from "../../../../../textarea/boo-textarea/boo-textarea.component";
import { CategoryDrawerBase } from "../shared/category-drawer.base";
import { CommonCategoryDrawerShellComponent } from "../shared/category-drawer-shell.component";

/** Create / edit an appointment type (POST /appointment-types, PATCH /appointment-types/{id}). */
@Component({
    selector: 'common-category-appointment-type-drawer',
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
            [title]="isEdit ? 'Edit appointment type' : 'New appointment type'"
            subtitle="The slot the scheduler books and what it costs."
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
                    <div class="grid grid-cols-1 sm:grid-cols-[1fr_10rem] gap-4">
                        <boo-input label="Name" [required]="true" formControlName="name" [maxlength]="100" placeholder="e.g. General consultation" />
                        <div class="flex items-center gap-2">
                            <span class="flex-none w-9 h-9 rounded-lg border border-borderGray" [style.background-color]="form.value.colorCode || 'transparent'" aria-hidden="true"></span>
                            <boo-input class="flex-1 min-w-0" label="Calendar color" formControlName="colorCode" [maxlength]="9" placeholder="#FB7185" />
                        </div>
                    </div>
                    <p *ngIf="form.controls['colorCode'].touched && form.controls['colorCode'].hasError('pattern')" class="m-0 mt-1 text-xs text-danger" role="alert">Use a hex color such as #FB7185.</p>
                </section>

                <section class="px-6 py-5 border-b border-rowDivider">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Scheduling and fee</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <boo-input type="number" label="Slot length (min)" [required]="true" formControlName="defaultDuration" placeholder="30" />
                        <boo-input type="number" label="Buffer after (min)" formControlName="bufferTime" placeholder="0" />
                        <boo-input type="number" label="Consultation fee (USD)" formControlName="consultationFee" placeholder="0.00" />
                    </div>
                </section>

                <section class="px-6 py-5 border-b border-rowDivider">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Booking rules</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="rounded-xl border border-borderGray px-3 py-2.5">
                            <boo-checkbox formControlName="isEmergency" label="Emergency" />
                        </div>
                        <div class="rounded-xl border border-borderGray px-3 py-2.5">
                            <boo-checkbox formControlName="isFollowUp" label="Follow-up visit" />
                        </div>
                        <div class="sm:col-span-2 rounded-xl border border-borderGray px-3 py-2.5">
                            <boo-checkbox formControlName="requiresPreparation" label="Patient preparation required" />
                        </div>
                    </div>
                    <div *ngIf="form.value.requiresPreparation" class="mt-4">
                        <boo-textarea label="Preparation instructions" formControlName="preparationInstructions" placeholder="e.g. Fast for 8 hours before the visit" />
                    </div>
                </section>

                <section class="px-6 py-5">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Details</h3>
                    <boo-textarea label="Description" formControlName="description" placeholder="What this visit is for" />
                    <div *ngIf="isEdit" class="mt-4 rounded-xl border border-borderGray px-3 py-2.5">
                        <boo-checkbox formControlName="isActive" label="Active" />
                        <p class="m-0 mt-1 text-xs text-secondary">Clear to mark this appointment type inactive.</p>
                    </div>
                </section>
            </ng-container>
        </common-category-drawer-shell>
    `
})
export class CommonCategoryAppointmentTypeDrawerComponent extends CategoryDrawerBase<AppointmentType> {
    protected override readonly noun = 'appointment type';
    protected override readonly service = inject(AppointmentTypeService);

    override readonly form = inject(FormBuilder).group({
        name: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]],
        description: [null as string | null],
        defaultDuration: [30 as number | string, [Validators.required, Validators.min(1)]],
        bufferTime: [0 as number | string, [Validators.min(0)]],
        consultationFee: [0 as number | string, [Validators.min(0)]],
        colorCode: ['#FB7185' as string | null, [Validators.pattern(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/)]],
        isEmergency: [false],
        requiresPreparation: [false],
        preparationInstructions: [null as string | null],
        isFollowUp: [false],
        isActive: [true]
    });

    protected override defaults() {
        return {
            name: '', description: null, defaultDuration: 30, bufferTime: 0, consultationFee: 0, colorCode: '#FB7185',
            isEmergency: false, requiresPreparation: false, preparationInstructions: null, isFollowUp: false, isActive: true
        };
    }

    protected override toFormValue(item: AppointmentType) {
        return {
            name: item.name,
            description: item.description,
            defaultDuration: item.defaultDuration,
            bufferTime: item.bufferTime,
            consultationFee: item.consultationFee,
            colorCode: item.colorCode,
            isEmergency: !!item.isEmergency,
            requiresPreparation: !!item.requiresPreparation,
            preparationInstructions: item.preparationInstructions,
            isFollowUp: !!item.isFollowUp,
            isActive: item.isActive
        };
    }

    protected override toPayload(raw: Record<string, any>) {
        return {
            name: this.text(raw['name']),
            description: this.text(raw['description']),
            defaultDuration: this.num(raw['defaultDuration'], 30),
            bufferTime: this.num(raw['bufferTime']),
            consultationFee: this.num(raw['consultationFee']),
            colorCode: this.text(raw['colorCode']),
            isEmergency: !!raw['isEmergency'],
            requiresPreparation: !!raw['requiresPreparation'],
            preparationInstructions: this.text(raw['preparationInstructions']),
            isFollowUp: !!raw['isFollowUp'],
            // Update requires it (create ignores it); omitting it used to deactivate the type on every edit.
            isActive: !!raw['isActive']
        };
    }
}
