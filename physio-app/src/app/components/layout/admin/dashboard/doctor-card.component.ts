import { Component } from "@angular/core";
import { ColumnDefDirective } from "../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../shared/shared-imports";
import { BooButtonAdminComponent } from "../../../button/boo-button-admin/boo-button-admin.component";
import { BooTableAdminComponent } from "../../../table/boo-table-admin/boo-table-admin.component";
import { BooTagComponent } from "../../../tag/boo-tag/boo-tag/boo-tag.component";

interface Doctor {
    id: number;
    name: string;
    medicalBranch: string;
    avatar: string;
    status: string;
}

@Component({
    selector: 'admin-doctor-table-card',
    standalone: true,
    imports: [
        SharedModule,
        BooButtonAdminComponent,
        BooTableAdminComponent,
        ColumnDefDirective,
        BooTagComponent
    ],
    template: `
    <div class="bg-surface rounded-lg border border-gray-200 h-full">
      <div class="flex items-center justify-between py-3 px-5 border-b border-gray-200">
        <h5 class="font-bold text-lg mb-0">Doctors</h5> 
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
        [data]="doctors" 
        [showHeader]="false"
        [showBorder]="false"
        tdClass="px-4 py-3"
      >
        <ng-template appColumnDef="patient" let-item>
            <div class="flex items-center gap-3">
                <img [src]="item.avatar" [alt]="item.name" class="w-12 h-12 rounded-[6px] object-cover">
                <div>
                    <div class="font-semibold text-gray-900">
                        {{ item.name }}
                    </div>
                    <div class="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span class="flex items-center gap-1">
                            {{ item.medicalBranch }}
                        </span>
                    </div>
                </div>
            </div>
        </ng-template>

        <ng-template appColumnDef="actions" let-item cellClass="text-right">
          <div class="flex items-center justify-end gap-2">
            <boo-tag>
                {{item.status}}
            </boo-tag>
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
export class AdminDoctorTableCardComponent {
    // #region Inputs, Outputs, Properties
    doctors: Doctor[] = [
        {
            id: 1,
            name: 'Dr. William Harrison',
            medicalBranch: 'Cardiology',
            avatar: 'https://dreamsemr.dreamstechnologies.com/php/template/assets/img/doctors/doctor-01.jpg',
            status: 'Available'
        },
        {
            id: 2,
            name: 'Dr. Victoria Adams',
            medicalBranch: 'Urology',
            avatar: 'https://dreamsemr.dreamstechnologies.com/php/template/assets/img/doctors/doctor-11.jpg',
            status: 'Unavailable'
        },
        {
            id: 3,
            name: 'Dr. Jonathan Bennett',
            medicalBranch: 'Radiology',
            avatar: 'https://dreamsemr.dreamstechnologies.com/php/template/assets/img/doctors/doctor-06.jpg',
            status: 'Available'
        },
        {
            id: 4,
            name: 'Dr. Natalie Brooks',
            medicalBranch: 'ENT Surgery',
            avatar: 'https://dreamsemr.dreamstechnologies.com/php/template/assets/img/doctors/doctor-07.jpg',
            status: 'Available'
        },
        {
            id: 5,
            name: 'Dr. Samuel Reed',
            medicalBranch: 'Dermatology',
            avatar: 'https://dreamsemr.dreamstechnologies.com/php/template/assets/img/doctors/doctor-12.jpg',
            status: 'Available'
        },
    ];
    // #endregion
}