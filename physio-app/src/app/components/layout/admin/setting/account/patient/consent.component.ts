import { Component } from "@angular/core";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { BooInputComponent } from "../../../../../input/boo-input/boo-input.component";
import { BooTextareaComponent } from "../../../../../textarea/boo-textarea/boo-textarea.component";
import { BooSelectComponent } from "../../../../../select/boo-select/boo-select.component";

@Component({
    selector: 'admin-account-patient-consent',
    standalone: true,
    imports: [
        SharedModule,
        BooInputComponent,
        BooTextareaComponent,
        BooSelectComponent
    ],
    template: `
        <div class="grid w-full gap-4 sm:grid-cols-3">
            <div class="sm:col-span-3">
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Consent For Research
                </label>
                <boo-textarea
                    [label]="'Patient consents to data use for research'"
                    formControlName="consentForResearch"
                    booError
                    size="small"
                    [rows]="8"
                ></boo-textarea>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Consent For Marketing
                </label>
                <boo-input
                    [label]="'Patient wishes to receive promotions'"
                    formControlName="consentForMarketing"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Data Sharing Consent
                </label>
                <boo-input
                    [label]="'Allow sharing with external specialists'"
                    formControlName="dataSharingConsent"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Registration Date
                </label>
                <boo-input
                    [label]="'Jan 01, 2024'"
                    formControlName="registrationDate"
                    booError
                    size="small"
                ></boo-input>
            </div>  
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Last Visit Date
                </label>
                <boo-input
                    [label]="'Feb 15, 2024'"
                    formControlName="lastVisitDate"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Next Follow Update
                </label>
                <boo-input
                    [label]="'Mar 15, 2024'"
                    formControlName="nextFollowUpdate"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Total Visits
                </label>
                <boo-select
                    [label]="'5'"
                    formControlName="totalVists"
                    booError
                    size="small"
                ></boo-select>
            </div>
        </div>
    `
})

export class AdminAccountPatientConsentComponent { }