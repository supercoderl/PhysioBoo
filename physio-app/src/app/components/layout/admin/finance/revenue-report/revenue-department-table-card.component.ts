import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ColumnDefDirective } from "../../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../../shared/shared-imports";
import { DepartmentRevenuePerformance } from "../../../../../shared/types/revenue.types";
import { BooTableAdminComponent } from "../../../../table/boo-table-admin/boo-table-admin.component";

@Component({
    selector: 'revenue-department-table-card',
    standalone: true,
    imports: [SharedModule, BooTableAdminComponent, ColumnDefDirective],
    template: `
    <div class="bg-surface rounded-2 border border-borderGray/60 h-full overflow-hidden">
      <boo-table-admin
        title="Department Performance"
        [data]="data ?? []"
        tdClass="px-4 py-3"
        [showFooter]="false"
        [currentPage]="1"
        [pageSize]="(data?.length ?? 0) || 1"
        [totalItems]="data?.length ?? 0"
        [loading]="loading"
      >
        <ng-template appColumnDef="name" headerLabel="Department" headerClass="text-left" let-item>
          <button type="button" class="text-sm font-semibold text-regular hover:text-primary hover:underline" (click)="rowClick.emit(item.departmentId)">
            {{ item.name }}
          </button>
        </ng-template>

        <ng-template appColumnDef="revenue" headerLabel="Revenue" headerClass="text-right" cellClass="text-right" let-item>
          <span class="text-sm font-semibold text-regular">{{ item.revenue | currency }}</span>
        </ng-template>

        <ng-template appColumnDef="patients" headerLabel="Patients" headerClass="text-center" cellClass="text-center" let-item>
          <span class="text-sm text-regular">{{ item.patients }}</span>
        </ng-template>

        <ng-template appColumnDef="avgPerPatient" headerLabel="Avg/Patient" headerClass="text-right" cellClass="text-right" let-item>
          <span class="text-sm text-secondary">{{ (item.patients ? item.revenue / item.patients : 0) | currency }}</span>
        </ng-template>

        <ng-template appColumnDef="growthPct" headerLabel="Growth" headerClass="text-center" cellClass="text-center" let-item>
          <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
            [ngClass]="item.growthPct >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'">
            {{ item.growthPct >= 0 ? '+' : '' }}{{ item.growthPct.toFixed(1) }}%
          </span>
        </ng-template>

        <ng-template appColumnDef="percentage" headerLabel="Share" headerClass="text-left" let-item>
          <div class="flex items-center gap-2 min-w-[120px]">
            <div class="flex-1 bg-gray-100 rounded-full h-1.5">
              <div class="bg-primary h-1.5 rounded-full" [style.width.%]="item.percentage"></div>
            </div>
            <span class="text-xs text-secondary w-10 text-right">{{ item.percentage.toFixed(1) }}%</span>
          </div>
        </ng-template>
      </boo-table-admin>
    </div>
  `,
})
export class RevenueDepartmentTableCardComponent {
    @Input() data: DepartmentRevenuePerformance[] | null = null;
    @Input() loading = false;
    @Output() rowClick = new EventEmitter<string>();
}
