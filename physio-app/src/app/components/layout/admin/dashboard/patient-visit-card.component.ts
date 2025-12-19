import { Component } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { BooButtonAdminComponent } from "../../../button/boo-button-admin/boo-button-admin.component";

interface PatientVisit {
    id: number;
    title: string;
    subTitle: string;
    percent: string;
    icon: string;
}

@Component({ 
    selector: 'admin-patient-visit-card',
    standalone: true,
    imports: [
        SharedModule,
        BooButtonAdminComponent
    ],
    template: `
    <div class="bg-white rounded-lg border border-gray-200 h-full">
        <div class="flex items-center justify-between py-3 px-5 border-b border-gray-200">
            <h5 class="font-bold text-lg mb-0">Patient Visits</h5> 
            <boo-button-admin
                background="transparent"
                [border]="{ width: 1, color: '#e3e3e3' }"
                textColor="#000000"
                padding="4px 8px"
            >
                View All
            </boo-button-admin>
        </div>
    </div>
  `
})
export class AdminPatientVisitTableCardComponent {
    // #region Inputs, Outputs, Properties

    // #endregion
}