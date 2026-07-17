import { Component, EventEmitter, Input, Output } from "@angular/core";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ColumnDefDirective } from "../../../../../shared/directives/column-def.directive";
import { LeadPriority, LeadStatus } from "../../../../../shared/enums/lead";
import { SharedModule } from "../../../../../shared/shared-imports";
import { ActionItem, PaginationData } from "../../../../../shared/types/common";
import { Lead } from "../../../../../shared/types/lead.types";
import { BooActionAdminComponent } from "../../../../table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent } from "../../../../table/boo-table-admin/boo-table-admin.component";

@Component({
    selector: 'crm-lead-table-card',
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
                <ng-template appColumnDef="name" headerLabel="Name" headerClass="text-left" let-item>
                    <div class="cursor-pointer" (click)="onEditClick(item.id)">
                        <div class="text-sm font-semibold text-primary truncate" [title]="item.name">{{ item.name }}</div>
                        <div class="text-xs text-secondary">{{ item.createdAt | date:'mediumDate' }}</div>
                    </div>
                </ng-template>

                <ng-template appColumnDef="contact" headerLabel="Contact" headerClass="text-left" let-item>
                    <div class="text-sm text-regular">{{ item.phone }}</div>
                    <div class="text-xs text-secondary">{{ item.email }}</div>
                </ng-template>

                <ng-template appColumnDef="service" headerLabel="Service" headerClass="text-left" let-item>
                    <span class="text-sm text-regular">{{ item.service }}</span>
                </ng-template>

                <ng-template appColumnDef="status" headerLabel="Status" headerClass="text-left" let-item>
                    <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="{
                            'bg-blue-100 text-blue-700':   item.status === LeadStatus.New,
                            'bg-amber-100 text-amber-700': item.status === LeadStatus.Contacted,
                            'bg-purple-100 text-purple-700': item.status === LeadStatus.Qualified,
                            'bg-green-100 text-green-700': item.status === LeadStatus.Converted,
                            'bg-red-100 text-red-700':     item.status === LeadStatus.Lost
                        }">
                        {{ LeadStatus[item.status] }}
                    </span>
                </ng-template>

                <ng-template appColumnDef="priority" headerLabel="Priority" headerClass="text-left" let-item>
                    <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="{
                            'bg-red-100 text-red-700':     item.priority === LeadPriority.High,
                            'bg-amber-100 text-amber-700': item.priority === LeadPriority.Medium,
                            'bg-green-100 text-green-700': item.priority === LeadPriority.Low
                        }">
                        {{ LeadPriority[item.priority] }}
                    </span>
                </ng-template>

                <ng-template appColumnDef="assignedTo" headerLabel="Assigned To" headerClass="text-left" let-item>
                    <span class="text-sm text-regular">{{ item.assignedTo ?? '—' }}</span>
                </ng-template>

                <ng-template appColumnDef="source" headerLabel="Source" headerClass="text-left" let-item>
                    <span class="text-sm text-secondary">{{ item.source }}</span>
                </ng-template>

                <ng-template appColumnDef="actions" headerLabel="Actions" let-item headerClass="text-center" cellClass="text-center">
                    <boo-action-admin [items]="tableActions" [data]="item" />
                </ng-template>
            </boo-table-admin>
        </div>
    `
})
export class CrmLeadTableCardComponent {
    // #region Inputs, Outputs, Properties
    @Input() data: PaginationData<Lead> | null = null;
    @Input() filter!: { pageNumber: number; pageSize: number };
    @Output() pageChange = new EventEmitter<number>();
    @Output() editClick = new EventEmitter<string>();
    @Output() deleteClick = new EventEmitter<string>();

    LeadStatus = LeadStatus;
    LeadPriority = LeadPriority;

    readonly tableActions: ActionItem[] = [
        {
            label: 'Delete',
            isDanger: true,
            onClick: (item: any) => this.onDeleteClick(item.id)
        }
    ];
    // #endregion

    constructor(protected loadingSrv: LocalLoadingService) { }

    onPageClick(page: number) { this.pageChange.emit(page); }
    onEditClick(id: string) { this.editClick.emit(id); }
    onDeleteClick(id: string) { this.deleteClick.emit(id); }
}
