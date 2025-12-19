import { Component } from "@angular/core";
import { ColumnDefDirective } from "../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../shared/shared-imports";
import { ButtonIconComponent } from "../../../button/button-icon/button-icon.component";
import { BooTableAdminComponent } from "../../../table/boo-table-admin/boo-table-admin.component";

interface Booking {
  id: number;
  avatar: string;
  name: string;
  date: string;
  time: string;
  specialty: string;
  specialtyColor: string;
}

@Component({
  selector: 'admin-booking-table-card',
  standalone: true,
  imports: [
    SharedModule,
    BooTableAdminComponent,
    ColumnDefDirective,
    ButtonIconComponent
  ],
  template: `
    <div class="bg-white rounded-[6px] border border-gray-200 h-full">
      <boo-table-admin 
        [data]="getPaginatedData()" 
        tdClass="px-4 py-3"
        [showFooter]="true" 
        [currentPage]="currentPage"
        [pageSize]="pageSize"
        [totalItems]="bookings.length"
        (pageChange)="onPageChange($event)"
      >
        <ng-template appColumnDef="date" headerLabel="Date & Time" headerClass="text-left" let-item>
          <div>
            <div class="text-gray-500">30 Apr 2025 - 09:30 AM	</div>
          </div>
        </ng-template>
        
        <ng-template appColumnDef="patient" headerLabel="Patient" headerClass="text-left" let-item>
          <div class="flex items-center gap-3">
            <img [src]="item.avatar" [alt]="item.name" class="w-12 h-12 rounded-full object-cover">
            <div>
              <div class="font-semibold text-gray-900">{{ item.name }}</div>
              <div class="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <span class="flex items-center gap-1">
                  {{ item.date }}
                </span>
              </div>
            </div>
          </div>
        </ng-template>

        <ng-template appColumnDef="doctor" headerLabel="Doctor" headerClass="text-left" let-item>
          <div class="flex items-center gap-3">
            <img [src]="item.avatar" [alt]="item.name" class="w-12 h-12 rounded-full object-cover">
            <div>
              <div class="font-semibold text-gray-900">{{ item.name }}</div>
              <div class="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <span class="flex items-center gap-1">
                  {{ item.date }}
                </span>
              </div>
            </div>
          </div>
        </ng-template>

        <ng-template appColumnDef="mode" headerLabel="Mode" headerClass="text-left" let-item>
          <div>
            <div class="font-semibold text-gray-900">In-person</div>
          </div>
        </ng-template>

        <ng-template appColumnDef="status" headerLabel="Status" headerClass="text-left" let-item>
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
            >
            </button-icon>
            <button-icon
              [icon]="{ name: 'check' }"
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
export class AdminBookingTableCardComponent {
  // #region Inputs, Outputs, Properties
  currentPage: number = 1;
  pageSize: number = 5;
  bookings: Booking[] = [
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

  getPaginatedData(): Booking[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.bookings.slice(startIndex, endIndex);
  }
  // #endregion

  // #region Methods
  onPageChange(page: number): void {
    this.currentPage = page;
  }
  // #endregion
}