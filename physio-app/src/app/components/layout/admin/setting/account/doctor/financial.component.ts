import { Component } from "@angular/core";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { BooInputComponent } from "../../../../../input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../../select/boo-select/boo-select.component";

@Component({
    selector: 'admin-account-doctor-financial',
    standalone: true,
    imports: [
        SharedModule,
        BooInputComponent,
        BooSelectComponent
    ],
    template: `
        <div class="grid w-full gap-4 sm:grid-cols-3">
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Employee Id
                </label>
                <boo-input
                    [label]="'DOC-2024-001'"
                    formControlName="employeeId"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Employee Status
                </label>
                <boo-select
                    [label]="'Select...'"
                    formControlName="employeeStatus"
                    booError
                    size="small"
                ></boo-select>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Joining Date
                </label>
                <boo-input
                    [label]="'01/01/2024'"
                    formControlName="joiningDate"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Termination Date
                </label>
                <boo-input
                    [label]="'--/--/----'"
                    formControlName="terminationDate"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Pan Number
                </label>
                <boo-input
                    [label]="'8031xxxxxx'"
                    formControlName="panNumber"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Gstin
                </label>
                <boo-input
                    [label]="'031xxxxxxx'"
                    formControlName="gstin"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div class="sm:col-span-3">
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Bank Account Details
                </label>
                <boo-input
                    [label]="'Vietcombank - 0071000xxxxxx - JOHN DOE'"
                    formControlName="bankAccountDetails"
                    [required]="true"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div class="sm:col-span-3">
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Payment Methods
                </label>
                <boo-input
                    [label]="'Visa, Mastercard, Momo'"
                    formControlName="paymentMethods"
                    [required]="true"
                    booError
                    size="small"
                ></boo-input>
            </div>
        </div>
    `
})

export class AdminAccountDoctorFinancialComponent {}