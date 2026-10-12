import { Component, EventEmitter, Input, Output } from "@angular/core";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ColumnDefDirective } from "../../../../../shared/directives/column-def.directive";
import { hospitalTypeLabel } from "../../../../../shared/enums/hospital-type";
import { SharedModule } from "../../../../../shared/shared-imports";
import { ActionItem, PaginationData } from "../../../../../shared/types/common";
import { SortOption } from "../../../../../shared/types/sort";
import { Hospital } from "../../../../../shared/types/support.types";
import { BooActionAdminComponent } from "../../../../table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent } from "../../../../table/boo-table-admin/boo-table-admin.component";

/** Branch table: search, sort, paging and reload; the API supports nothing else yet (see docs/hospital-branch-redesign.md). */
@Component({
  selector: 'admin-hospital-table-card',
  standalone: true,
  imports: [
    SharedModule,
    BooTableAdminComponent,
    ColumnDefDirective,
    BooActionAdminComponent
  ],
  host: { class: 'block h-full min-h-0' },
  template: `
    <div class="bg-surface rounded-[6px] border border-gray-200 h-full overflow-hidden">
      <boo-table-admin
        [data]="data?.items ?? []"
        tdClass="px-4 py-3"
        [showFooter]="true"
        [currentPage]="data?.pageNumber ?? filter.pageNumber"
        [pageSize]="data?.pageSize ?? filter.pageSize"
        [totalItems]="data?.totalCount ?? 0"
        [sortOptions]="sortOptions"
        [currentSort]="currentSort"
        [availableTools]="['sort']"
        [loading]="loadingSrv.isLoading('search')"
        (pageChange)="pageChange.emit($event)"
        (searchChange)="searchChange.emit($event)"
        (reload)="reloadClick.emit()"
        (sortApply)="sortApply.emit($event)"
      >
        <ng-template appColumnDef="name" headerLabel="Branch" headerClass="text-left" let-item>
          <div class="min-w-0 cursor-pointer" (click)="editClick.emit(item.id)">
            <div class="truncate text-sm font-semibold text-primary" [title]="item.name">{{ item.name }}</div>
            <div class="text-xs text-secondary">{{ item.hospitalCode || '—' }}</div>
          </div>
        </ng-template>

        <ng-template appColumnDef="hospitalType" headerLabel="Type" headerClass="text-left" let-item>
          <div class="text-sm">{{ typeLabel(item.hospitalType) }}</div>
        </ng-template>

        <ng-template appColumnDef="location" headerLabel="Location" headerClass="text-left" let-item>
          <div class="text-sm">{{ location(item) }}</div>
        </ng-template>

        <ng-template appColumnDef="capacity" headerLabel="Beds / ICU" headerClass="text-center" cellClass="text-center" let-item>
          <span class="text-sm font-medium tabular-nums">{{ item.bedCapacity }} / {{ item.icuCapacity }}</span>
        </ng-template>

        <ng-template appColumnDef="services" headerLabel="Services" headerClass="text-center" cellClass="text-center" let-item>
          <div class="flex justify-center gap-1 flex-wrap">
            <span *ngIf="item.emergencyCapacity > 0" class="inline-flex px-1.5 py-0.5 rounded text-xs bg-red-100 text-red-600">ER</span>
            <span *ngIf="item.icuCapacity > 0" class="inline-flex px-1.5 py-0.5 rounded text-xs bg-orange-100 text-orange-600">ICU</span>
            <span *ngIf="item.is24Hours" class="inline-flex px-1.5 py-0.5 rounded text-xs bg-primarySoft text-primary">24h</span>
            <span *ngIf="!item.emergencyCapacity && !item.icuCapacity && !item.is24Hours" class="text-sm text-secondary">—</span>
          </div>
        </ng-template>

        <ng-template appColumnDef="isActive" headerLabel="Status" headerClass="text-center" cellClass="text-center" let-item>
          <span
            class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
            [ngClass]="item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
          >
            {{ item.isActive ? 'Active' : 'Inactive' }}
          </span>
        </ng-template>

        <ng-template appColumnDef="actions" headerLabel="Actions" let-item headerClass="text-center" cellClass="text-center">
          <div class="relative">
            <boo-action-admin [items]="tableActions" [data]="item" />
          </div>
        </ng-template>
      </boo-table-admin>
    </div>
  `
})
export class AdminHospitalTableCardComponent {
  // #region Inputs, Outputs, Properties
  @Input() data: PaginationData<Hospital> | null = null;
  @Input() filter!: { pageNumber: number, pageSize: number };
  @Input() sortOptions: SortOption[] = [];
  @Input() currentSort = '';
  @Output() pageChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() reloadClick = new EventEmitter<void>();
  @Output() sortApply = new EventEmitter<SortOption>();
  @Output() editClick = new EventEmitter<string>();
  @Output() deleteClick = new EventEmitter<string>();

  readonly typeLabel = hospitalTypeLabel;

  readonly tableActions: ActionItem[] = [
    {
      label: 'Edit',
      onClick: (item: any) => this.editClick.emit(item.id)
    },
    {
      label: 'Delete',
      isDanger: true,
      onClick: (item: any) => this.deleteClick.emit(item.id)
    }
  ];
  // #endregion

  // #region Init (Lifecycle + Setup)
  constructor(protected loadingSrv: LocalLoadingService) { }
  // #endregion

  // #region Methods
  location(hospital: Hospital): string {
    return [hospital.city, hospital.country].filter(Boolean).join(', ') || '—';
  }
  // #endregion
}
