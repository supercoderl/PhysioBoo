import { Component } from "@angular/core";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { BooInputComponent } from "../../../../../input/boo-input/boo-input.component";

@Component({
    selector: 'admin-account-patient-billing',
    standalone: true,
    imports: [
        SharedModule,
        BooInputComponent
    ],
    template: `
        <div class="grid w-full gap-4 sm:grid-cols-3">
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Insurance Provider
                </label>
                <boo-input
                    [label]="'Manulife / Blue Cross / State Health...'"
                    formControlName="inssuranceProvider"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Insurance Policy Number
                </label>
                <boo-input
                    [label]="'POL-99887766'"
                    formControlName="inssurancePolicyNumber"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Insurance Expiry Date
                </label>
                <boo-input
                    [label]="'MM/DD/YYYY'"
                    formControlName="inssuranceExpiryDate"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Insurance Coverage Amount
                </label>
                <boo-input
                    [label]="'50,000,000'"
                    formControlName="insuranceCoverageAmount"
                    booError
                    size="small"
                ></boo-input>
            </div>  
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Total Amount Spent
                </label>
                <boo-input
                    [label]="'1,250.00'"
                    formControlName="totalAmountSpent"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Outstanding Balance
                </label>
                <boo-input
                    [label]="'0.00'"
                    formControlName="outstandingBalance"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Loyalty Points
                </label>
                <boo-input
                    [label]="'150'"
                    formControlName="loyaltyPoints"
                    booError
                    size="small"
                ></boo-input>
            </div>
        </div>
    `
})

export class AdminAccountPatientBillingComponent { }