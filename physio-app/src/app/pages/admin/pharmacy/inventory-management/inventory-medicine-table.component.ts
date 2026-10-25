import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooButtonComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { BooTableAdminComponent } from "../../../../components/table/boo-table-admin/boo-table-admin.component";
import { ColumnDefDirective } from "../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../shared/shared-imports";
import { PaginationData } from "../../../../shared/types/common";
import { InventoryMedicine, stockStatusLabel, stockStatusTone } from "../../../../shared/types/inventory-management.types";

@Component({
    selector: 'inventory-medicine-table',
    standalone: true,
    imports: [SharedModule, BooTableAdminComponent, ColumnDefDirective, BooStatusBadgeComponent, BooButtonComponent],
    host: { class: 'block h-full min-h-0 min-w-0' },
    template: `
    <div class="h-full min-h-0 bg-surface rounded-2 border border-borderGray/60 overflow-hidden">
      <boo-table-admin
        minTableWidth="760px"
        [data]="data?.items ?? []"
        [showToolbar]="false"
        [fillEmpty]="false"
        tdClass="px-4"
        [showFooter]="true"
        [currentPage]="data?.pageNumber ?? 1"
        [pageSize]="data?.pageSize ?? 20"
        [totalItems]="data?.totalCount ?? 0"
        [loading]="loading"
        (pageChange)="pageChange.emit($event)"
      >
        <ng-template appColumnDef="medicine" headerLabel="Medicine" headerClass="text-left" width="30%" let-item>
          <div class="min-w-0 leading-tight">
            <button type="button" (click)="view.emit(item)" class="block max-w-full truncate text-left text-sm font-semibold text-primary hover:underline">{{ item.name }}</button>
            <div class="truncate text-[11px] text-secondary">
              {{ item.genericName || 'No generic name' }}<ng-container *ngIf="item.barcode"> · {{ item.barcode }}</ng-container>
            </div>
          </div>
        </ng-template>

        <ng-template appColumnDef="category" headerLabel="Category / location" headerClass="text-left" let-item>
          <div class="min-w-0 leading-tight">
            <div class="truncate text-sm text-regular">{{ item.category || '—' }}</div>
            <div class="truncate text-[11px] text-secondary">{{ item.storageLocation || 'No location' }}</div>
          </div>
        </ng-template>

        <ng-template appColumnDef="currentStock" headerLabel="On hand" headerClass="text-right" cellClass="text-right" let-item>
          <span class="text-sm font-semibold text-regular tabular-nums">{{ item.currentStock | number }}</span>
        </ng-template>

        <ng-template appColumnDef="reorderLevel" headerLabel="Reorder level" headerClass="text-right" cellClass="text-right" let-item>
          <span class="text-sm text-secondary tabular-nums">{{ item.reorderLevel | number }}</span>
        </ng-template>

        <ng-template appColumnDef="status" headerLabel="Status" headerClass="text-left" let-item>
          <boo-status-badge [label]="statusLabel(item.status)" [tone]="statusTone(item.status)" dotted></boo-status-badge>
        </ng-template>

        <ng-template appColumnDef="expiry" headerLabel="Earliest expiry" headerClass="text-left" let-item>
          <div class="leading-tight">
            <div class="text-sm tabular-nums" [ngClass]="item.isNearExpiry ? 'text-amber-700 font-semibold' : 'text-regular'">
              {{ item.soonestExpiryDate ? (item.soonestExpiryDate | date:'mediumDate') : '—' }}
            </div>
            <div class="text-[11px] text-secondary">
              {{ item.batchCount | number }} {{ item.batchCount === 1 ? 'batch' : 'batches' }}<ng-container *ngIf="item.isNearExpiry"> · near expiry</ng-container>
            </div>
          </div>
        </ng-template>

        <ng-template appColumnDef="actions" headerLabel="" headerClass="text-right" cellClass="text-right" width="64px" let-item>
          <button boo-button variant="ghost" size="sm" [iconOnly]="true" (click)="view.emit(item)" [attr.aria-label]="'View stock for ' + item.name">
            <physio-icon name="chevron-right" [size]="18"></physio-icon>
          </button>
        </ng-template>
      </boo-table-admin>
    </div>
  `,
})
export class InventoryMedicineTableComponent {
    @Input() data: PaginationData<InventoryMedicine> | null = null;
    @Input() loading = false;

    @Output() pageChange = new EventEmitter<number>();
    @Output() view = new EventEmitter<InventoryMedicine>();

    readonly statusLabel = stockStatusLabel;
    readonly statusTone = stockStatusTone;
}
