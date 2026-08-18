import { Component, EventEmitter, Input, Output } from "@angular/core";
import { LocalLoadingService } from "../../../../services/common/local-loading.service";
import { ColumnDefDirective } from "../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../shared/shared-imports";
import { AppointmentRecord } from "../../../../shared/types/appointment.types";
import { PaginationData } from "../../../../shared/types/common";
import { LoadingKeys } from "../../../../shared/types/loading";
import { ButtonIconComponent } from "../../../button/button-icon/button-icon.component";
import { BooTableAdminComponent } from "../../../table/boo-table-admin/boo-table-admin.component";

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  Scheduled: { label: 'Scheduled', color: '#3B82F6' },
  Confirmed: { label: 'Confirmed', color: '#6366F1' },
  CheckedIn: { label: 'Checked-in', color: '#22C55E' },
  InProgress: { label: 'In Progress', color: '#F59E0B' },
  Completed: { label: 'Completed', color: '#64748B' },
  Cancelled: { label: 'Cancelled', color: '#EF4444' },
  NoShow: { label: 'No Show', color: '#EF4444' },
  Rescheduled: { label: 'Rescheduled', color: '#A855F7' },
};

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
    <div class="bg-surface rounded-[6px] border border-gray-200 h-full">
      <boo-table-admin
        [data]="data?.items ?? []"
        tdClass="px-4 py-3"
        [showFooter]="true"
        [currentPage]="data?.pageNumber ?? filter.pageNumber"
        [pageSize]="data?.pageSize ?? filter.pageSize"
        [totalItems]="data?.totalCount ?? 0"
        (pageChange)="onPageClick($event)"
        [loading]="loadingSrv.isLoading(LoadingKeys.APPOINTMENT.SEARCH)"
      >
        <ng-template appColumnDef="date" headerLabel="Date & Time" headerClass="text-left" let-item>
          <div class="text-gray-500">{{ item.scheduledDate }} - {{ item.scheduledTime }}</div>
        </ng-template>

        <ng-template appColumnDef="patient" headerLabel="Patient" headerClass="text-left" let-item>
          <div>
            <div class="font-semibold text-gray-900">{{ item.patientName }}</div>
            <div class="flex items-center gap-4 text-sm text-gray-600 mt-1">
              <span class="flex items-center gap-1">{{ item.patientMRN }}</span>
            </div>
          </div>
        </ng-template>

        <ng-template appColumnDef="doctor" headerLabel="Doctor" headerClass="text-left" let-item>
          <div class="font-semibold text-gray-900">{{ item.doctorName }}</div>
        </ng-template>

        <ng-template appColumnDef="mode" headerLabel="Type" headerClass="text-left" let-item>
          <div class="font-semibold text-gray-900">{{ item.appointmentTypeName ?? 'In-person' }}</div>
        </ng-template>

        <ng-template appColumnDef="status" headerLabel="Status" headerClass="text-left" let-item>
          <span class="inline-block px-2 py-1 rounded-md text-xs font-medium"
                [style.color]="statusBadge(item.status).color"
                [style.background-color]="statusBadge(item.status).color + '15'">
            {{ statusBadge(item.status).label }}
          </span>
        </ng-template>

        <ng-template appColumnDef="actions" let-item cellClass="text-right">
          <div class="flex items-center justify-end gap-2">
            <button-icon
              *ngIf="canCancel(item.status)"
              [icon]="{ name: 'circle-x' }"
              buttonClass="!bg-[#EEF2F7] !border-0 !px-2"
              ariaLabel="Cancel appointment"
              (onClick)="cancelClick.emit(item.id)"
            >
            </button-icon>
            <button-icon
              *ngIf="canCheckIn(item.status)"
              [icon]="{ name: 'check' }"
              buttonClass="!bg-[#EEF2F7] !border-0 !px-2"
              ariaLabel="Check in patient"
              (onClick)="checkInClick.emit(item.id)"
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
  @Input() data: PaginationData<AppointmentRecord> | null = null;
  @Input() filter!: { pageNumber: number, pageSize: number };
  @Output() pageChange = new EventEmitter<number>();
  @Output() checkInClick = new EventEmitter<string>();
  @Output() cancelClick = new EventEmitter<string>();

  LoadingKeys = LoadingKeys;
  // #endregion

  // #region Init (Lifecycle + Setup)
  constructor(protected loadingSrv: LocalLoadingService) { }
  // #endregion

  // #region Methods
  onPageClick(page: number): void {
    this.pageChange.emit(page);
  }

  statusBadge(status: string) {
    return STATUS_BADGE[status] ?? { label: status, color: '#64748B' };
  }

  canCheckIn(status: string): boolean {
    return status === 'Scheduled' || status === 'Confirmed';
  }

  canCancel(status: string): boolean {
    return status === 'Scheduled' || status === 'Confirmed' || status === 'CheckedIn';
  }
  // #endregion
}
