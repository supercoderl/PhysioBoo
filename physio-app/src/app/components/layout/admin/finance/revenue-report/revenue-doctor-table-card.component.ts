import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ColumnDefDirective } from "../../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../../shared/shared-imports";
import { DoctorRevenuePerformance } from "../../../../../shared/types/revenue.types";
import { BooTableAdminComponent } from "../../../../table/boo-table-admin/boo-table-admin.component";

@Component({
    selector: 'revenue-doctor-table-card',
    standalone: true,
    imports: [SharedModule, BooTableAdminComponent, ColumnDefDirective],
    template: `
    <div class="bg-surface rounded-2 border border-borderGray/60 h-full overflow-hidden">
      <boo-table-admin
        title="Doctor Performance"
        [data]="data ?? []"
        tdClass="px-4 py-3"
        [showFooter]="false"
        [currentPage]="1"
        [pageSize]="(data?.length ?? 0) || 1"
        [totalItems]="data?.length ?? 0"
        [loading]="loading"
      >
        <ng-template appColumnDef="name" headerLabel="Doctor" headerClass="text-left" let-item>
          <button type="button" class="text-left hover:text-primary" (click)="rowClick.emit(item.doctorId)">
            <div class="text-sm font-semibold text-regular">{{ item.name }}</div>
            <div class="text-xs text-secondary">{{ item.department }}</div>
          </button>
        </ng-template>

        <ng-template appColumnDef="revenue" headerLabel="Revenue" headerClass="text-right" cellClass="text-right" let-item>
          <span class="text-sm font-semibold text-regular">{{ item.revenue | currency }}</span>
        </ng-template>

        <ng-template appColumnDef="patients" headerLabel="Patients" headerClass="text-center" cellClass="text-center" let-item>
          <span class="text-sm text-regular">{{ item.patients }}</span>
        </ng-template>

        <ng-template appColumnDef="averageBillValue" headerLabel="Avg. Bill" headerClass="text-right" cellClass="text-right" let-item>
          <span class="text-sm text-secondary">{{ item.averageBillValue | currency }}</span>
        </ng-template>

        <ng-template appColumnDef="growthPct" headerLabel="Growth" headerClass="text-center" cellClass="text-center" let-item>
          <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
            [ngClass]="item.growthPct >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'">
            {{ item.growthPct >= 0 ? '+' : '' }}{{ item.growthPct.toFixed(1) }}%
          </span>
        </ng-template>
      </boo-table-admin>
    </div>
  `,
})
export class RevenueDoctorTableCardComponent {
    @Input() data: DoctorRevenuePerformance[] | null = null;
    @Input() loading = false;
    @Output() rowClick = new EventEmitter<string>();
}
