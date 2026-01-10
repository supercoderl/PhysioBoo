import { Component } from "@angular/core";
import { SharedModule } from "../../../../../shared/shared-imports";
import { TabComponent, TabsComponent } from "../../../../tab/tab.component";
import { AdminAccountPatientGeneralComponent } from "./patient/general.component";
import { AdminAccountPatientClinicalComponent } from "./patient/clinical.component";
import { AdminAccountPatientBillingComponent } from "./patient/billing.component";
import { AdminAccountPatientPreferenceComponent } from "./patient/preference.component";
import { AdminAccountPatientConsentComponent } from "./patient/consent.component";

@Component({
    selector: 'admin-account-patient',
    standalone: true,
    imports: [
        SharedModule,
        TabsComponent,
        TabComponent,
        AdminAccountPatientGeneralComponent,
        AdminAccountPatientClinicalComponent,
        AdminAccountPatientBillingComponent,
        AdminAccountPatientPreferenceComponent,
        AdminAccountPatientConsentComponent
    ],
    template: `
        <div class="flex flex-col gap-4">
            <div class="w-full">
                <p class="font-semibold text-base m-0">Patient Information</p>
                <p class="m-0 text-[13px] leading-[1.5] text-[#4B5563]">
                    Overview of medical history and current health records.
                </p>
            </div>
            <app-tabs>
                <app-tab label="General">
                    <admin-account-patient-general />
                </app-tab>
                <app-tab label="Clinical">
                    <admin-account-patient-clinical />
                </app-tab>
                <app-tab label="Insurance & Billing">
                    <admin-account-patient-billing />
                </app-tab>
                <app-tab label="Preferences">
                    <admin-account-patient-preference />
                </app-tab>
                <app-tab label="Consent">
                    <admin-account-patient-consent />
                </app-tab>
            </app-tabs>
        </div>
    `
})

export class AdminAccountPatientComponent {

}