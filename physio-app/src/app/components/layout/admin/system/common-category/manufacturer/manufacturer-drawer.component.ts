import { Component, inject } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { BooCheckboxComponent, BooInputComponent } from '@physioboo/ui';
import { ManufacturerService } from "../../../../../../services/admin/manufacturer.service";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { Manufacturer } from "../../../../../../shared/types/support.types";
import { CategoryDrawerBase } from "../shared/category-drawer.base";
import { CommonCategoryDrawerShellComponent } from "../shared/category-drawer-shell.component";

/** Create / edit a manufacturer (POST /manufacturers, PATCH /manufacturers/{id}). The company code is assigned by the server. */
@Component({
    selector: 'common-category-manufacturer-drawer',
    standalone: true,
    imports: [
        SharedModule,
        CommonCategoryDrawerShellComponent,
        BooInputComponent,
        BooCheckboxComponent
    ],
    template: `
        <common-category-drawer-shell
            [form]="form"
            [isOpen]="isOpen"
            [title]="isEdit ? 'Edit manufacturer' : 'New manufacturer'"
            subtitle="Company identity, contact and regulatory standing."
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
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Company</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-[1fr_10rem] gap-4">
                        <boo-input label="Company name" [required]="true" formControlName="name" [maxlength]="200" placeholder="e.g. MedTech Inc." />
                        <boo-input type="number" label="Established" formControlName="establishedYear" placeholder="e.g. 1990" />
                    </div>
                    <p *ngIf="form.controls['establishedYear'].touched && form.controls['establishedYear'].invalid" class="m-0 mt-1 text-xs text-danger" role="alert">Enter a year between 1800 and {{ thisYear }}.</p>
                </section>

                <section class="px-6 py-5 border-b border-rowDivider">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Contact and location</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <boo-input type="email" label="Email" formControlName="email" [maxlength]="150" placeholder="contact@company.com" />
                        <boo-input label="Phone" formControlName="phone" [maxlength]="20" />
                        <boo-input class="sm:col-span-2" label="Website" formControlName="website" [maxlength]="200" placeholder="https://…" />
                        <boo-input class="sm:col-span-2" label="Address" formControlName="address" [maxlength]="300" />
                        <boo-input label="City" formControlName="city" [maxlength]="100" />
                        <boo-input label="State / province" formControlName="state" [maxlength]="100" />
                        <boo-input label="Country" formControlName="country" [maxlength]="100" />
                        <boo-input label="Postal code" formControlName="postalCode" [maxlength]="20" />
                    </div>
                </section>

                <section class="px-6 py-5">
                    <h3 class="m-0 mb-4 text-xs font-semibold uppercase tracking-wider text-secondary">Regulatory</h3>
                    <boo-input label="License number" formControlName="licenseNumber" [maxlength]="100" />
                    <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div class="rounded-xl border border-borderGray px-3 py-2.5">
                            <boo-checkbox formControlName="gmpCertified" label="GMP certified" />
                        </div>
                        <div class="rounded-xl border border-borderGray px-3 py-2.5">
                            <boo-checkbox formControlName="isoCertified" label="ISO certified" />
                        </div>
                        <div class="rounded-xl border border-borderGray px-3 py-2.5">
                            <boo-checkbox formControlName="fdaApproved" label="FDA approved" />
                        </div>
                    </div>
                    <div *ngIf="isEdit" class="mt-4 rounded-xl border border-borderGray px-3 py-2.5">
                        <boo-checkbox formControlName="isActive" label="Active" />
                        <p class="m-0 mt-1 text-xs text-secondary">Clear to mark this manufacturer inactive.</p>
                    </div>
                </section>
            </ng-container>
        </common-category-drawer-shell>
    `
})
export class CommonCategoryManufacturerDrawerComponent extends CategoryDrawerBase<Manufacturer> {
    protected override readonly noun = 'manufacturer';
    protected override readonly service = inject(ManufacturerService);

    readonly thisYear = new Date().getFullYear();

    override readonly form = inject(FormBuilder).group({
        name: ['', [Validators.required, Validators.maxLength(200), Validators.pattern(/\S/)]],
        address: [null as string | null],
        city: [null as string | null],
        state: [null as string | null],
        country: [null as string | null],
        postalCode: [null as string | null],
        phone: [null as string | null],
        email: [null as string | null, [Validators.email]],
        website: [null as string | null],
        licenseNumber: [null as string | null],
        gmpCertified: [false],
        isoCertified: [false],
        fdaApproved: [false],
        // The API stores 0 when the year is unknown.
        establishedYear: [null as number | string | null, [Validators.min(1800), Validators.max(this.thisYear)]],
        isActive: [true]
    });

    protected override defaults() {
        return {
            name: '', address: null, city: null, state: null, country: null, postalCode: null, phone: null, email: null,
            website: null, licenseNumber: null, gmpCertified: false, isoCertified: false, fdaApproved: false,
            establishedYear: null, isActive: true
        };
    }

    protected override toFormValue(item: Manufacturer) {
        return {
            name: item.name,
            address: item.address,
            city: item.city,
            state: item.state,
            country: item.country,
            postalCode: item.postalCode,
            phone: item.phone,
            email: item.email,
            website: item.website,
            licenseNumber: item.licenseNumber,
            gmpCertified: !!item.gmpCertified,
            isoCertified: !!item.isoCertified,
            fdaApproved: !!item.fdaApproved,
            establishedYear: item.establishedYear || null,
            isActive: item.isActive
        };
    }

    protected override toPayload(raw: Record<string, any>) {
        return {
            name: this.text(raw['name']),
            address: this.text(raw['address']),
            city: this.text(raw['city']),
            state: this.text(raw['state']),
            country: this.text(raw['country']),
            postalCode: this.text(raw['postalCode']),
            phone: this.text(raw['phone']),
            email: this.text(raw['email']),
            website: this.text(raw['website']),
            licenseNumber: this.text(raw['licenseNumber']),
            gmpCertified: !!raw['gmpCertified'],
            isoCertified: !!raw['isoCertified'],
            fdaApproved: !!raw['fdaApproved'],
            establishedYear: this.num(raw['establishedYear']),
            // Update requires it (create ignores it); omitting it used to deactivate the manufacturer on every edit.
            isActive: !!raw['isActive']
        };
    }
}
