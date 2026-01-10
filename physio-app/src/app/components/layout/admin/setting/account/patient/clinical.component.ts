import { Component } from "@angular/core";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { BooInputComponent } from "../../../../../input/boo-input/boo-input.component";
import { SwitchComponent } from "../../../../../switch/switch.component";
import { BooTextareaComponent } from "../../../../../textarea/boo-textarea/boo-textarea.component";
import { BooSelectComponent } from "../../../../../select/boo-select/boo-select.component";

@Component({
    selector: 'admin-account-patient-clinical',
    standalone: true,
    imports: [
        SharedModule,
        BooInputComponent,
        SwitchComponent,
        BooTextareaComponent,
        BooSelectComponent
    ],
    template: `
        <div class="grid w-full gap-4 sm:grid-cols-3">
            <div class="sm:col-span-3">
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Medical History
                </label>
                <boo-textarea
                    [label]="'History of Hypertension (2018), Type 2 Diabetes...'"
                    formControlName="medicalHistory"
                    booError
                    size="small"
                    [rows]="8"
                ></boo-textarea>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Family History
                </label>
                <boo-input
                    [label]="'Father: Heart Disease, Mother: Diabetes...'"
                    formControlName="familyHistory"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Surgical History
                </label>
                <boo-input
                    [label]="'Appendectomy (2015), ACL Repair (2020)...'"
                    formControlName="surgicalHistory"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Allergy Information
                </label>
                <boo-input
                    [label]="'Penicillin, Peanuts, Latex...'"
                    formControlName="allergyInformation"
                    [required]="true"
                    booError
                    size="small"
                ></boo-input>
            </div>  
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Current Medications
                </label>
                <boo-input
                    [label]="'Metformin 500mg, Aspirin 81mg...'"
                    formControlName="currentMedications"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Lifestyle Notes
                </label>
                <boo-input
                    [label]="'Smoker (5 years), Sedentary lifestyle...'"
                    formControlName="lifestyleNotes"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Chronic Patient
                </label>
                <div>
                    <switch [isOpen]="true" />
                </div>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Risk Level
                </label>
                <boo-select
                    [label]="'Low / Medium / High'"
                    formControlName="riskLevel"
                    booError
                    size="small"
                ></boo-select>
            </div>
        </div>
    `
})

export class AdminAccountPatientClinicalComponent {}