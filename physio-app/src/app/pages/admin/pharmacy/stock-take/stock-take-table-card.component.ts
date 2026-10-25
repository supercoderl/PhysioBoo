import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooButtonComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { BooActionAdminComponent } from "../../../../components/table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent } from "../../../../components/table/boo-table-admin/boo-table-admin.component";
import { ColumnDefDirective } from "../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../shared/shared-imports";
import { ActionItem, PaginationData } from "../../../../shared/types/common";
import { formatStockTakeValue, StockTake, stockTakeStatusLabel, stockTakeStatusTone } from "../../../../shared/types/stock-take.types";
import { primaryStockTakeAction, STOCK_TAKE_ACTION_META, StockTakeAccess, StockTakeActionKey, stockTakeActions } from "./stock-take-actions";

@Component({
  selector: 'stock-take-table-card',
  standalone: true,
  imports: [SharedModule, BooTableAdminComponent, ColumnDefDirective, BooActionAdminComponent, BooStatusBadgeComponent, BooButtonComponent],
  host: { class: 'block h-full min-h-0 min-w-0' },
  template: `
    <div class="h-full min-h-0 bg-surface rounded-2 border border-borderGray/60 overflow-hidden">
      <boo-table-admin
        minTableWidth="960px"
        [data]="data?.items ?? []"
        [showToolbar]="false"
        [fillEmpty]="false"
        tdClass="px-4 py-3"
        [showFooter]="true"
        [currentPage]="data?.pageNumber ?? 1"
        [pageSize]="data?.pageSize ?? 10"
        [totalItems]="data?.totalCount ?? 0"
        [loading]="loading"
        (pageChange)="pageChange.emit($event)"
      >
        <ng-template appColumnDef="code" headerLabel="Session" headerClass="text-left" width="26%" let-item>
          <div class="min-w-0 leading-tight">
            <button type="button" (click)="open.emit(item)" class="block max-w-full truncate text-left text-sm font-semibold text-primary hover:underline">{{ item.code }}</button>
            <div class="truncate text-[11px] text-secondary">{{ item.warehouseName || '—' }} · {{ item.departmentName || '—' }}</div>
          </div>
        </ng-template>

        <ng-template appColumnDef="status" headerLabel="Status" headerClass="text-left" let-item>
          <boo-status-badge [label]="statusLabel(item.status)" [tone]="statusTone(item.status)" dotted></boo-status-badge>
        </ng-template>

        <ng-template appColumnDef="progress" headerLabel="Progress" headerClass="text-left" width="16%" let-item>
          <div *ngIf="item.itemsCount; else noItems" class="w-32 leading-tight">
            <div class="flex items-center justify-between text-[11px] text-secondary mb-1 tabular-nums">
              <span>{{ item.itemsCount | number }} items</span>
              <span class="font-semibold text-regular">{{ item.completedPercent | number:'1.0-1' }}%</span>
            </div>
            <div class="h-1.5 rounded-full bg-gray-100 overflow-hidden" role="progressbar" aria-label="Items counted"
              aria-valuemin="0" aria-valuemax="100" [attr.aria-valuenow]="item.completedPercent">
              <div class="h-full rounded-full bg-primary" [style.width.%]="item.completedPercent"></div>
            </div>
          </div>
          <ng-template #noItems><span class="text-[11px] text-secondary">{{ item.status === 'Draft' ? 'Not started' : 'No items' }}</span></ng-template>
        </ng-template>

        <ng-template appColumnDef="scheduledDate" headerLabel="Scheduled" headerClass="text-left" let-item>
          <div class="leading-tight">
            <div class="text-sm text-regular tabular-nums">{{ item.scheduledDate | date:'mediumDate' }}</div>
            <div class="text-[11px] text-secondary">Updated {{ item.lastUpdated | date:'short' }}</div>
          </div>
        </ng-template>

        <ng-template appColumnDef="assignedToName" headerLabel="Counter" headerClass="text-left" let-item>
          <div class="max-w-[12rem] truncate text-sm" [ngClass]="item.assignedToName ? 'text-regular' : 'text-secondary italic'">{{ item.assignedToName || 'Unassigned' }}</div>
        </ng-template>

        <ng-template appColumnDef="differenceValue" headerLabel="Variance" headerClass="text-right" cellClass="text-right" let-item>
          <span *ngIf="item.completedPercent > 0; else noVariance" class="text-sm font-semibold tabular-nums"
            [ngClass]="item.differenceValue < 0 ? 'text-rose-600' : item.differenceValue > 0 ? 'text-emerald-600' : 'text-secondary'">{{ money(item.differenceValue) }}</span>
          <ng-template #noVariance><span class="text-sm text-secondary">—</span></ng-template>
        </ng-template>

        <ng-template appColumnDef="actions" headerLabel="Actions" headerClass="text-right" cellClass="text-right" let-item>
          <div class="flex items-center justify-end gap-1">
            <ng-container *ngIf="primaryOf(item) as primary">
              <button boo-button variant="soft" size="sm" [disabled]="busy" (click)="action.emit({ key: primary, item })">
                <physio-icon [name]="meta[primary].icon" [size]="14"></physio-icon>{{ meta[primary].label }}
              </button>
            </ng-container>
            <boo-action-admin *ngIf="menuFor(item).length" [items]="menuFor(item)" [data]="item"></boo-action-admin>
          </div>
        </ng-template>
      </boo-table-admin>
    </div>
  `,
})
export class StockTakeTableCardComponent {
  @Input() data: PaginationData<StockTake> | null = null;
  @Input() loading = false;
  /** True while a lifecycle call is in flight, so a row cannot be actioned twice. */
  @Input() busy = false;
  @Input() access!: StockTakeAccess;

  @Output() pageChange = new EventEmitter<number>();
  @Output() open = new EventEmitter<StockTake>();
  @Output() action = new EventEmitter<{ key: StockTakeActionKey; item: StockTake }>();

  readonly meta = STOCK_TAKE_ACTION_META;
  readonly money = formatStockTakeValue;
  statusLabel = stockTakeStatusLabel;
  statusTone = stockTakeStatusTone;

  primaryOf(item: StockTake): StockTakeActionKey | null {
    return primaryStockTakeAction(item, stockTakeActions(item, this.access));
  }

  menuFor(item: StockTake): ActionItem[] {
    const primary = this.primaryOf(item);
    return stockTakeActions(item, this.access)
      .filter(key => key !== primary)
      .map(key => ({
        label: this.meta[key].label,
        icon: this.meta[key].icon,
        isDanger: this.meta[key].danger,
        onClick: (d: StockTake) => { if (!this.busy) this.action.emit({ key, item: d }); },
      }));
  }
}
