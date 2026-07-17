import { Component } from "@angular/core";
import { ColumnDefDirective } from "../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../shared/shared-imports";
import { BooButtonAdminComponent } from "../../../button/boo-button-admin/boo-button-admin.component";
import { ButtonIconComponent } from "../../../button/button-icon/button-icon.component";
import { BooIconComponent } from "../../../icon/boo-icon/boo-icon.component";
import { BooTableAdminComponent } from "../../../table/boo-table-admin/boo-table-admin.component";

interface Appointment {
    id: number;
    avatar: string;
    name: string;
    date: string;
    time: string;
    specialty: string;
    specialtyColor: string;
}

@Component({
    selector: 'admin-appointment-table-card',
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
    <div class="bg-surface rounded-lg border border-borderGray h-full">
      <div class="flex items-center justify-between py-3 px-5 border-b border-borderGray">
        <h5 class="font-bold text-lg mb-0 text-regular">Appointment Request</h5>
        <boo-button-admin
            background="transparent"
            [border]="{ width: 1, color: '#e3e3e3' }"
            textColor="#000000"
            padding="4px 8px"
            buttonClass="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
            All Appointments
        </boo-button-admin>
      </div>
      
      <boo-table-admin
        [data]="appointments"
        [showHeader]="false"
        [showFooter]="false"
        [availableTools]="[]"
        tdClass="px-4 py-3"
      >
        <ng-template appColumnDef="patient" let-item>
          <div class="flex items-center gap-3">
            <img [src]="item.avatar" [alt]="item.name" class="w-12 h-12 rounded-[6px] object-cover">
            <div>
              <div class="font-semibold text-gray-900">{{ item.name }}</div>
              <div class="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <span class="flex items-center gap-1">
                  <boo-icon name="calendar" [size]="12"></boo-icon>
                  {{ item.date }}
                </span>
                <span class="flex items-center gap-1">
                  <boo-icon name="clock" [size]="12"></boo-icon>
                  {{ item.time }}
                </span>
              </div>
            </div>
          </div>
        </ng-template>

        <ng-template appColumnDef="specialty" let-item cellClass="text-center">
          <span class="inline-block px-2 py-1 rounded-md text-xs font-medium" 
                [style.color]="item.specialtyColor"
                [style.background-color]="item.specialtyColor + '15'">
            {{ item.specialty }}
          </span>
        </ng-template>

        <ng-template appColumnDef="actions" let-item cellClass="text-right">
          <div class="flex items-center justify-end gap-2">
            <button-icon
              [icon]="{ name: 'circle-x' }"
              buttonClass="!bg-[#EEF2F7] !border-0 !px-2"
              ariaLabel="Reject appointment"
            >
            </button-icon>
            <button-icon
              [icon]="{ name: 'check' }"
              buttonClass="!bg-[#EEF2F7] !border-0 !px-2"
              ariaLabel="Approve appointment"
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
export class AdminAppointmentTableCardComponent {
    // #region Inputs, Outputs, Properties
    appointments: Appointment[] = [
        {
            id: 1,
            avatar: 'https://i.pravatar.cc/150?img=12',
            name: 'Dominic Foster',
            date: '12 Aug 2025',
            time: '11:35 PM',
            specialty: 'Urology',
            specialtyColor: '#22C55E'
        },
        {
            id: 2,
            avatar: 'https://i.pravatar.cc/150?img=45',
            name: 'Charlotte Bennett',
            date: '06 Aug 2025',
            time: '09:58 AM',
            specialty: 'Cardiology',
            specialtyColor: '#3B82F6'
        },
        {
            id: 3,
            avatar: 'https://i.pravatar.cc/150?img=33',
            name: 'Ethan Sullivan',
            date: '01 Aug 2025',
            time: '12:10 PM',
            specialty: 'Dermatology',
            specialtyColor: '#22C55E'
        },
        {
            id: 4,
            avatar: 'https://i.pravatar.cc/150?img=47',
            name: 'Brianna Thompson',
            date: '26 Jul 2025',
            time: '08:20 AM',
            specialty: 'ENT Surgery',
            specialtyColor: '#A855F7'
        },
        {
            id: 5,
            avatar: 'https://i.pravatar.cc/150?img=51',
            name: 'Braun Tucker',
            date: '23 Jul 2025',
            time: '10:30 AM',
            specialty: 'Radiology',
            specialtyColor: '#3B82F6'
        }
    ];
    // #endregion
}