import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ColumnDefDirective } from "../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../shared/shared-imports";
import { ActionItem, PaginationData } from "../../../../shared/types/common";
import { StockTake, StockTakeStatus, stockTakeStatusLabel, stockTakeStatusTone } from "../../../../shared/types/stock-take.types";
import { BooActionAdminComponent } from "../../../../components/table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent } from "../../../../components/table/boo-table-admin/boo-table-admin.component";
import { StatusBadgeComponent } from "../../../../components/ui/status-badge.component";

@Component({
    selector: 'stock-take-table-card',
    standalone: true,
    imports: [SharedModule, BooTableAdminComponent, ColumnDefDirective, BooActionAdminComponent, StatusBadgeComponent],
    host: { class: 'block h-full min-h-0' },
    template: `
    <div class="bg-surface rounded-2 border border-borderGray/60 h-full overflow-hidden">
      <boo-table-admin
        [data]="data?.items ?? []"
        tdClass="px-4 py-3"
        [showFooter]="true"
        [currentPage]="data?.pageNumber ?? 1"
        [pageSize]="data?.pageSize ?? 10"
        [totalItems]="data?.totalCount ?? 0"
        [loading]="loading"
        (pageChange)="pageChange.emit($event)"
      >
        <ng-template appColumnDef="code" headerLabel="Stock Take No" headerClass="text-left" let-item>
          <button type="button" (click)="rowClick.emit(item)" class="text-sm font-semibold text-primary hover:underline">{{ item.code }}</button>
        </ng-template>

        <ng-template appColumnDef="warehouseName" headerLabel="Warehouse" headerClass="text-left" let-item>
          <div class="text-sm text-regular">{{ item.warehouseName }}</div>
        </ng-template>

        <ng-template appColumnDef="departmentName" headerLabel="Department" headerClass="text-left" let-item>
          <div class="text-sm text-secondary">{{ item.departmentName }}</div>
        </ng-template>

        <ng-template appColumnDef="createdBy" headerLabel="Created By" headerClass="text-left" let-item>
          <div class="text-sm text-secondary">{{ item.createdBy }}</div>
        </ng-template>

        <ng-template appColumnDef="assignedTo" headerLabel="Assigned To" headerClass="text-left" let-item>
          <div class="text-sm" [ngClass]="item.assignedTo ? 'text-regular' : 'text-gray-400 italic'">{{ item.assignedTo ?? 'Unassigned' }}</div>
        </ng-template>

        <ng-template appColumnDef="scheduledDate" headerLabel="Scheduled Date" headerClass="text-left" let-item>
          <div class="text-sm text-secondary">{{ item.scheduledDate | date:'mediumDate' }}</div>
        </ng-template>

        <ng-template appColumnDef="status" headerLabel="Status" headerClass="text-left" let-item>
          <boo-status-badge [label]="statusLabel(item.status)" [tone]="statusTone(item.status)" dotted></boo-status-badge>
        </ng-template>

        <ng-template appColumnDef="completedPercent" headerLabel="Progress" headerClass="text-left" let-item>
          <div class="w-28">
            <div class="flex items-center justify-between text-[11px] text-secondary mb-1">
              <span>{{ item.itemsCount }} items</span>
              <span class="font-semibold">{{ item.completedPercent }}%</span>
            </div>
            <div class="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div class="h-full rounded-full bg-primary transition-all" [style.width.%]="item.completedPercent"></div>
            </div>
          </div>
        </ng-template>

        <ng-template appColumnDef="differenceValue" headerLabel="Difference Value" headerClass="text-right" cellClass="text-right" let-item>
          <span class="text-sm font-semibold" [ngClass]="item.differenceValue < 0 ? 'text-rose-600' : item.differenceValue > 0 ? 'text-emerald-600' : 'text-gray-500'">
            {{ item.differenceValue > 0 ? '+' : '' }}{{ '$' + item.differenceValue.toFixed(2) }}
          </span>
        </ng-template>

        <ng-template appColumnDef="lastUpdated" headerLabel="Last Updated" headerClass="text-left" let-item>
          <div class="text-xs text-secondary">{{ item.lastUpdated | date:'short' }}</div>
        </ng-template>

        <ng-template appColumnDef="actions" headerLabel="Actions" headerClass="text-center" cellClass="text-center" let-item>
          <boo-action-admin [items]="actionsFor(item)" [data]="item"></boo-action-admin>
        </ng-template>
      </boo-table-admin>
    </div>
  `,
})
export class StockTakeTableCardComponent {
    @Input() data: PaginationData<StockTake> | null = null;
    @Input() loading: boolean = false;

    @Output() pageChange = new EventEmitter<number>();
    @Output() rowClick = new EventEmitter<StockTake>();
    @Output() editClick = new EventEmitter<StockTake>();
    @Output() startClick = new EventEmitter<StockTake>();
    @Output() continueClick = new EventEmitter<StockTake>();
    @Output() assignClick = new EventEmitter<StockTake>();
    @Output() completeClick = new EventEmitter<StockTake>();
    @Output() approveClick = new EventEmitter<StockTake>();
    @Output() rejectClick = new EventEmitter<StockTake>();
    @Output() cancelClick = new EventEmitter<StockTake>();
    @Output() deleteClick = new EventEmitter<StockTake>();
    @Output() historyClick = new EventEmitter<StockTake>();
    @Output() printClick = new EventEmitter<StockTake>();
    @Output() differenceClick = new EventEmitter<StockTake>();

    statusLabel = stockTakeStatusLabel;
    statusTone = stockTakeStatusTone;

    actionsFor(item: StockTake): ActionItem[] {
        const status: StockTakeStatus = item.status;
        const common: ActionItem[] = [
            { label: 'View History', icon: 'history', onClick: (d) => this.historyClick.emit(d) },
            { label: 'Print', icon: 'printer', onClick: (d) => this.printClick.emit(d) },
        ];

        if (status === 'Draft') {
            return [
                { label: 'Edit Draft', icon: 'pencil', onClick: (d) => this.editClick.emit(d) },
                { label: 'Start Counting', icon: 'play', onClick: (d) => this.startClick.emit(d) },
                ...common,
                { label: 'Delete', icon: 'trash-2', isDanger: true, onClick: (d) => this.deleteClick.emit(d) },
            ];
        }
        if (status === 'Counting') {
            return [
                { label: 'Continue Counting', icon: 'square-pen', onClick: (d) => this.continueClick.emit(d) },
                { label: 'Assign Counter', icon: 'user-plus', onClick: (d) => this.assignClick.emit(d) },
                { label: 'Complete Counting', icon: 'circle-check', onClick: (d) => this.completeClick.emit(d) },
                ...common,
                { label: 'Cancel', icon: 'ban', isDanger: true, onClick: (d) => this.cancelClick.emit(d) },
            ];
        }
        if (status === 'PendingApproval') {
            return [
                { label: 'View Difference Detail', icon: 'scale', onClick: (d) => this.differenceClick.emit(d) },
                { label: 'Approve', icon: 'circle-check-big', onClick: (d) => this.approveClick.emit(d) },
                { label: 'Reject', icon: 'circle-x', isDanger: true, onClick: (d) => this.rejectClick.emit(d) },
                ...common,
            ];
        }
        if (status === 'Rejected') {
            return [
                { label: 'Continue Counting', icon: 'square-pen', onClick: (d) => this.continueClick.emit(d) },
                { label: 'View Difference Detail', icon: 'scale', onClick: (d) => this.differenceClick.emit(d) },
                ...common,
            ];
        }
        return common;
    }
}
