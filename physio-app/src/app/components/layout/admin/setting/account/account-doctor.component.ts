import { Component } from "@angular/core";
import { SharedModule } from "../../../../../shared/shared-imports";
import { TabsComponent, TabComponent } from "../../../../tab/tab.component";
import { AdminAccountDoctorProfileComponent } from "./doctor/profile.component";
import { AdminAccountDoctorProfessionalComponent } from "./doctor/professional.component";
import { AdminAccountDoctorServiceComponent } from "./doctor/service.component";
import { AdminAccountDoctorFinancialComponent } from "./doctor/financial.component";
import { AdminAccountDoctorPerformanceComponent } from "./doctor/performance.component";

@Component({
    selector: 'admin-account-doctor',
    standalone: true,
    imports: [
    SharedModule,
    TabsComponent,
    TabComponent,
    AdminAccountDoctorProfileComponent,
    AdminAccountDoctorProfessionalComponent,
    AdminAccountDoctorServiceComponent,
    AdminAccountDoctorFinancialComponent,
    AdminAccountDoctorPerformanceComponent
],
    template: `
        <div class="flex flex-col gap-4">
            <div class="w-full">
                <p class="font-semibold text-base m-0">Doctor Information</p>
                <p class="m-0 text-[13px] leading-[1.5] text-[#4B5563]">
                    Professional credentials and medical specialty details.
                </p>
            </div>
            <app-tabs>
                <app-tab label="Profile">
                    <admin-account-doctor-profile />
                </app-tab>
                <app-tab label="Professional">
                    <admin-account-doctor-professional />
                </app-tab>
                <app-tab label="Services & Fees">
                    <admin-account-doctor-service />
                </app-tab>
                <app-tab label="Financial">
                    <admin-account-doctor-financial />
                </app-tab>
                <app-tab label="Performance">
                    <admin-account-doctor-performance />
                </app-tab>
            </app-tabs>
        </div>
    `
})

export class AdminAccountDoctorComponent {

}