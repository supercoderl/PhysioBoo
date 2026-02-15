import { Component } from "@angular/core";
import { ColumnDefDirective } from "../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../shared/shared-imports";
import { BooButtonAdminComponent } from "../../../button/boo-button-admin/boo-button-admin.component";
import { ButtonIconComponent } from "../../../button/button-icon/button-icon.component";
import { BooIconComponent } from "../../../icon/boo-icon/boo-icon.component";
import { BooTableAdminComponent } from "../../../table/boo-table-admin/boo-table-admin.component";

interface PatientReport {
    id: number;
    icon: string;
    color: string;
    background: string;
    name: string;
    reportType: string;
    url: string;
}

@Component({
    selector: 'admin-patient-report-table-card',
    standalone: true,
    imports: [
        SharedModule,
        BooButtonAdminComponent,
        BooTableAdminComponent,
        ColumnDefDirective,
        BooIconComponent,
        ButtonIconComponent
    ],
    template: `
    <div class="md:col-span-2 bg-surface rounded-lg border border-gray-200 h-full">
      <div class="flex items-center justify-between py-3 px-5 border-b border-gray-200">
        <h5 class="font-bold text-lg mb-0">Patient Reports</h5> 
        <boo-button-admin
            background="transparent"
            [border]="{ width: 1, color: '#e3e3e3' }"
            textColor="#000000"
            padding="4px 8px"
        >
            View All
        </boo-button-admin>
      </div>
      
      <boo-table-admin 
        [data]="patientReports" 
        [showHeader]="false"
        [showBorder]="false"
        tdClass="px-4 py-3"
      >
        <ng-template appColumnDef="patient" let-item>
          <div class="flex items-center gap-3">
            <div 
                class="p-2.5 rounded-full inlineFlex-center-center"
                [style.backgroundColor]="item.background"
            >
                <boo-icon [name]="item.icon" [color]="item.color" [size]="20"></boo-icon>
            </div>
            <div>
              <div class="font-semibold text-gray-900">{{ item.name }}</div>
              <div class="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <span class="flex items-center">
                  {{ item.reportType }}
                </span>
              </div>
            </div>
          </div>
        </ng-template>

        <ng-template appColumnDef="actions" let-item cellClass="text-right">
          <div class="flex items-center justify-end gap-2">
            <button-icon 
              [icon]="{ name: 'download' }"
              buttonClass="!bg-[#EEF2F7] !border-0 !px-2"
            >
            </button-icon>
          </div>
        </ng-template>
      </boo-table-admin>
    </div>
  `,
    styles: [`
    :host ::ng-deep {
      .pi {
        font-size: 0.875rem;
      }
    }
  `]
})
export class AdminPatientReportTableCardComponent {
    // #region Inputs, Outputs, Properties
    patientReports: PatientReport[] = [
        {
            id: 1,
            icon: 'droplet',
            color: '#1F6DB2',
            background: '#EBF2F9',
            name: 'David Marshall',
            reportType: 'Hemoglobin',
            url: ''
        },
        {
            id: 2,
            icon: 'meh',
            color: '#09800F',
            background: '#EEF9F1',
            name: 'Thomas McLean',
            reportType: 'X Ray',
            url: ''
        },
        {
            id: 3,
            icon: 'rainbow',
            color: '#B71C1C',
            background: '#FBECEA',
            name: 'Greta Kinney',
            reportType: 'MRI Scan',
            url: ''
        },
        {
            id: 4,
            icon: 'badge',
            color: '#6A1B9A',
            background: '#F1EBF7',
            name: 'Larry Wilburn',
            reportType: 'Blood Test',
            url: ''
        },
        {
            id: 5,
            icon: 'boom-box',
            color: '#00796B',
            background: '#EBF2F1',
            name: 'Reyan Verol',
            reportType: 'CT Scan',
            url: ''
        },
    ];
    // #endregion
}