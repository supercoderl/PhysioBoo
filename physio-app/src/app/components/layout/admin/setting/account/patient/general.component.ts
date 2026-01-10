import { Component } from "@angular/core";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { BooInputComponent } from "../../../../../input/boo-input/boo-input.component";
import { SwitchComponent } from "../../../../../switch/switch.component";
import { PatientType } from "../../../../../../shared/enums/patient";
import { BooSelectComponent } from "../../../../../select/boo-select/boo-select.component";

@Component({
    selector: 'admin-account-patient-general',
    standalone: true,
    imports: [
        SharedModule,
        BooInputComponent,
        SwitchComponent,
        BooSelectComponent
    ],
    template: `
        <div class="grid w-full gap-4 sm:grid-cols-3">
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Patient Number
                </label>
                <boo-input
                    [label]="'MRN-2024-0001'"
                    formControlName="patientNumber"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Patient Type
                </label>
                <boo-select
                    [label]="'Select Type (e.g., New, Returning, VIP, Insurance)...'"
                    formControlName="patientType"
                    [required]="true"
                    booError
                    size="small"
                    [options]="patientOptions"
                ></boo-select>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Software Engineer
                </label>
                <boo-input
                    [label]="'Select...'"
                    formControlName="occupation"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Annual Income Range
                </label>
                <boo-input
                    [label]="'Select Range (e.g., < $10k, $10k-$50k, > $50k)...'"
                    formControlName="annualIncomeRange"
                    booError
                    size="small"
                ></boo-input>
            </div>  
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Referred User
                </label>
                <boo-input
                    [label]="'Dr. John Doe / Clinic ABC'"
                    formControlName="referredBy"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Referral Hospital
                </label>
                <boo-input
                    [label]="'Select Hospital...'"
                    formControlName="referralHospitalId"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    VIP
                </label>
                <div>
                    <switch [isOpen]="true" />
                </div>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Senior Citizen
                </label>
                <div>
                    <switch [isOpen]="true" />
                </div>
            </div>
        </div>
    `
})

export class AdminAccountPatientGeneralComponent {
    // #region Inputs, Outputs, Properties
    patientOptions = Object.keys(PatientType)
        .filter(key => isNaN(Number(key)))
        .map(key => ({
            label: key,
            value: PatientType[key as keyof typeof PatientType]
        }));
    // #endregion
}