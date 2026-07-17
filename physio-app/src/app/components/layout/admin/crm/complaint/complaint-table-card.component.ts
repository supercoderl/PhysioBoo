import { Component, EventEmitter, Input, Output } from "@angular/core";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ColumnDefDirective } from "../../../../../shared/directives/column-def.directive";
import { ComplaintCategory, ComplaintPriority, ComplaintStatus } from "../../../../../shared/enums/complaint";
import { SharedModule } from "../../../../../shared/shared-imports";
import { ActionItem, PaginationData } from "../../../../../shared/types/common";
import { Complaint } from "../../../../../shared/types/complaint.types";
import { BooActionAdminComponent } from "../../../../table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent } from "../../../../table/boo-table-admin/boo-table-admin.component";

const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
    [ComplaintCategory.MedicalServices]: 'Medical',
    [ComplaintCategory.BillingInsurance]: 'Billing',
    [ComplaintCategory.FacilityEquipment]: 'Facility',
    [ComplaintCategory.StaffBehavior]: 'Staff',
    [ComplaintCategory.AppointmentIssues]: 'Appointment',
    [ComplaintCategory.PharmacyServices]: 'Pharmacy',
    [ComplaintCategory.Other]: 'Other',
};

@Component({
    selector: 'crm-complaint-table-card',
    standalone: true,
    imports: [
        SharedModule,
        BooTableAdminComponent,
        ColumnDefDirective,
        BooActionAdminComponent
    ],
    template: `
        <div class="bg-surface rounded-[6px] border border-gray-200 h-full overflow-hidden">
            <boo-table-admin
                [data]="data?.items ?? []"
                tdClass="px-4 py-3"
                [showFooter]="true"
                [currentPage]="data?.pageNumber ?? filter.pageNumber"
                [pageSize]="data?.pageSize ?? filter.pageSize"
                [totalItems]="data?.totalCount ?? 0"
                (pageChange)="onPageClick($event)"
                [loading]="loadingSrv.isLoading('search')"
            >
                <!-- Ticket # + Subject -->
                <ng-template appColumnDef="ticketNumber" headerLabel="Ticket" headerClass="text-left" let-item>
                    <div class="cursor-pointer" (click)="onEditClick(item.id)">
                        <div class="text-xs font-mono font-semibold text-primary">{{ item.ticketNumber }}</div>
                        <div class="text-sm text-regular truncate max-w-[180px]" [title]="item.subject">{{ item.subject }}</div>
                    </div>
                </ng-template>

                <!-- Patient -->
                <ng-template appColumnDef="patientName" headerLabel="Patient" headerClass="text-left" let-item>
                    <div class="text-sm font-medium text-regular">{{ item.patientName }}</div>
                    <div class="text-xs text-secondary">{{ item.email }}</div>
                </ng-template>

                <!-- Category -->
                <ng-template appColumnDef="category" headerLabel="Category" headerClass="text-left" let-item>
                    <!-- <span class="text-sm text-secondary">{{ categoryLabels[item.category] }}</span> -->
                </ng-template>

                <!-- Priority -->
                <ng-template appColumnDef="priority" headerLabel="Priority" headerClass="text-left" let-item>
                    <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="{
                            'bg-red-100 text-red-700':    item.priority === ComplaintPriority.Urgent,
                            'bg-orange-100 text-orange-700': item.priority === ComplaintPriority.High,
                            'bg-amber-100 text-amber-700': item.priority === ComplaintPriority.Medium,
                            'bg-green-100 text-green-700': item.priority === ComplaintPriority.Low
                        }">
                        {{ ComplaintPriority[item.priority] }}
                    </span>
                </ng-template>

                <!-- Status -->
                <ng-template appColumnDef="status" headerLabel="Status" headerClass="text-left" let-item>
                    <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="{
                            'bg-gray-100 text-gray-700':   item.status === ComplaintStatus.Pending,
                            'bg-blue-100 text-blue-700':   item.status === ComplaintStatus.InProgress,
                            'bg-green-100 text-green-700': item.status === ComplaintStatus.Resolved,
                            'bg-purple-100 text-purple-700': item.status === ComplaintStatus.Closed
                        }">
                        {{ statusLabel(item.status) }}
                    </span>
                </ng-template>

                <!-- Date -->
                <ng-template appColumnDef="createdAt" headerLabel="Submitted" headerClass="text-left" let-item>
                    <div class="text-sm text-regular">{{ item.createdAt | date:'mediumDate' }}</div>
                    <div *ngIf="item.resolvedAt" class="text-xs text-secondary">
                        Resolved {{ item.resolvedAt | date:'mediumDate' }}
                    </div>
                </ng-template>

                <!-- Actions -->
                <ng-template appColumnDef="actions" headerLabel="Actions" let-item headerClass="text-center" cellClass="text-center">
                    <boo-action-admin [items]="tableActions" [data]="item" />
                </ng-template>
            </boo-table-admin>
        </div>
    `
})
export class CrmComplaintTableCardComponent {
    // #region Inputs, Outputs, Properties
    @Input() data: PaginationData<Complaint> | null = null;
    @Input() filter!: { pageNumber: number; pageSize: number };
    @Output() pageChange = new EventEmitter<number>();
    @Output() editClick = new EventEmitter<string>();
    @Output() deleteClick = new EventEmitter<string>();

    ComplaintStatus = ComplaintStatus;
    ComplaintPriority = ComplaintPriority;
    categoryLabels = CATEGORY_LABELS;

    readonly tableActions: ActionItem[] = [
        {
            label: 'Delete',
            isDanger: true,
            onClick: (item: any) => this.onDeleteClick(item.id)
        }
    ];
    // #endregion

    constructor(protected loadingSrv: LocalLoadingService) { }

    statusLabel(status: ComplaintStatus): string {
        const map: Record<ComplaintStatus, string> = {
            [ComplaintStatus.Pending]: 'Pending',
            [ComplaintStatus.InProgress]: 'In Progress',
            [ComplaintStatus.Resolved]: 'Resolved',
            [ComplaintStatus.Closed]: 'Closed',
        };
        return map[status] ?? '—';
    }

    onPageClick(page: number) { this.pageChange.emit(page); }
    onEditClick(id: string) { this.editClick.emit(id); }
    onDeleteClick(id: string) { this.deleteClick.emit(id); }
}
