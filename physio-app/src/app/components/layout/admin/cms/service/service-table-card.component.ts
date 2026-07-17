import { Component, EventEmitter, Input, Output } from "@angular/core";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ColumnDefDirective } from "../../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../../shared/shared-imports";
import { ActionItem, PaginationData } from "../../../../../shared/types/common";
import { FilterConfig } from "../../../../../shared/types/filter.types";
import { MedicalService, ServiceAvailability, ServiceStatus } from "../../../../../shared/types/service.types";
import { SortOption } from "../../../../../shared/types/sort";
import { BulkAction } from "../../../../../shared/types/table.types";
import { BooActionAdminComponent } from "../../../../table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent } from "../../../../table/boo-table-admin/boo-table-admin.component";

@Component({
  selector: 'cms-service-table-card',
  standalone: true,
  imports: [
    SharedModule,
    BooTableAdminComponent,
    ColumnDefDirective,
    BooActionAdminComponent,
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
        [bulkActions]="bulkActions"
        [sortOptions]="sortOptions"
        [currentSort]="currentSort"
        [filterConfigs]="filterConfigs"
        [currentFilter]="currentFilter"
        (pageChange)="onPageClick($event)"
        (searchChange)="onSearchChange($event)"
        (reload)="reloadClick.emit()"
        (bulkAction)="bulkAction.emit($event)"
        (sortApply)="sortApply.emit($event)"
        (filterApply)="filterApply.emit($event)"
        (resetView)="resetView.emit()"
        [loading]="loadingSrv.isLoading('services')"
      >
        <ng-template appColumnDef="select" type="checkbox" width="48px"></ng-template>

        <ng-template appColumnDef="code" headerLabel="Code" headerClass="text-left" width="110px" let-item>
          <div class="font-mono text-xs text-secondary">{{ item.code }}</div>
        </ng-template>

        <ng-template
          appColumnDef="name"
          headerLabel="Name"
          headerClass="text-left"
          [sortable]="true"
          [hasActions]="true"
          let-item
        >
          <div class="min-w-0 cursor-pointer" (click)="viewClick.emit(item)">
            <div class="font-medium text-primary truncate" [title]="item.name">{{ item.name }}</div>
            <div class="text-xs text-secondary truncate max-w-md">{{ item.shortName || item.description }}</div>
          </div>
        </ng-template>

        <ng-template appColumnDef="department" headerLabel="Department" headerClass="text-left" let-item>
          <span class="text-sm text-primary">{{ item.primaryDepartmentName || '—' }}</span>
          <span *ngIf="item.departmentIds.length > 1" class="ml-1 text-xs text-secondary">+{{ item.departmentIds.length - 1 }}</span>
        </ng-template>

        <ng-template appColumnDef="doctors" headerLabel="Doctors" headerClass="text-left" let-item>
          <div class="flex items-center gap-2">
            <span *ngIf="item.primaryDoctorName" class="text-sm text-primary truncate">{{ item.primaryDoctorName }}</span>
            <span *ngIf="!item.primaryDoctorName" class="text-xs text-gray-400 italic">Unassigned</span>
            <span *ngIf="(item.doctorCount ?? item.doctorIds.length) > 1"
              class="text-xs text-secondary bg-gray-100 rounded px-1.5 py-0.5">
              +{{ (item.doctorCount ?? item.doctorIds.length) - 1 }}
            </span>
          </div>
        </ng-template>

        <ng-template appColumnDef="basePrice" headerLabel="Price" headerClass="text-right" cellClass="text-right" [sortable]="true" let-item>
          <div class="font-medium text-primary">{{ formatMoney(item.basePrice, item.currency) }}</div>
        </ng-template>

        <ng-template appColumnDef="durationMinutes" headerLabel="Duration" headerClass="text-right" cellClass="text-right" let-item>
          <div class="text-secondary">{{ formatDuration(item.durationMinutes) }}</div>
        </ng-template>

        <ng-template appColumnDef="status" headerLabel="Status" headerClass="text-left" let-item>
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" [ngClass]="statusClass(item.status)">
            <span class="w-1.5 h-1.5 rounded-full" [ngClass]="statusDotClass(item.status)"></span>
            {{ item.status }}
          </span>
        </ng-template>

        <ng-template appColumnDef="availability" headerLabel="Availability" headerClass="text-left" let-item>
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" [ngClass]="availabilityClass(item.availability)">
            <span class="w-1.5 h-1.5 rounded-full" [ngClass]="availabilityDotClass(item.availability)"></span>
            {{ item.availability }}
          </span>
        </ng-template>

        <ng-template appColumnDef="actions" headerLabel="Actions" let-item headerClass="text-center" cellClass="text-center">
          <div class="relative">
            <boo-action-admin [items]="tableActions" [data]="item" />
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
export class CmsServiceTableCardComponent {
  // #region Inputs, Outputs, Properties
  @Input() data: PaginationData<MedicalService> | null = null;
  @Input() filter!: { pageNumber: number, pageSize: number };
  @Input() sortOptions: SortOption[] = [];
  @Input() currentSort: string = '';
  @Input() filterConfigs: FilterConfig[] = [];
  @Input() currentFilter: Record<string, any> = {};
  @Output() pageChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() reloadClick = new EventEmitter<void>();
  @Output() viewClick = new EventEmitter<MedicalService>();
  @Output() editClick = new EventEmitter<MedicalService>();
  @Output() duplicateClick = new EventEmitter<MedicalService>();
  @Output() archiveClick = new EventEmitter<MedicalService>();
  @Output() deleteClick = new EventEmitter<MedicalService>();
  @Output() bulkAction = new EventEmitter<{ action: BulkAction; ids: (number | string)[]; selectAllPages: boolean }>();
  @Output() sortApply = new EventEmitter<SortOption>();
  @Output() filterApply = new EventEmitter<{ key: string; value: any }>();
  @Output() resetView = new EventEmitter<void>();

  readonly bulkActions: BulkAction[] = [
    { key: 'archive', label: 'Archive', icon: 'archive', variant: 'default', requireConfirm: true },
    { key: 'export', label: 'Export', icon: 'download', variant: 'default' },
    { key: 'delete', label: 'Delete', icon: 'trash-2', variant: 'danger', requireConfirm: true },
  ];

  readonly tableActions: ActionItem[] = [
    { label: 'View details', icon: 'eye',     onClick: (s) => this.viewClick.emit(s as MedicalService) },
    { label: 'Edit',         icon: 'pencil',  onClick: (s) => this.editClick.emit(s as MedicalService) },
    { label: 'Duplicate',    icon: 'copy',    onClick: (s) => this.duplicateClick.emit(s as MedicalService) },
    { label: 'Archive',      icon: 'archive', onClick: (s) => this.archiveClick.emit(s as MedicalService) },
    { label: 'Delete',       icon: 'trash-2', isDanger: true, onClick: (s) => this.deleteClick.emit(s as MedicalService) },
  ];
  // #endregion

  // #region Init (Lifecycle + Setup)
  constructor(
    protected loadingSrv: LocalLoadingService
  ) { }
  // #endregion

  // #region Methods
  onPageClick(page: number) {
    this.pageChange.emit(page);
  }

  onSearchChange(val: string) {
    this.searchChange.emit(val);
  }

  statusClass(s: ServiceStatus): string {
    switch (s) {
      case 'Active':   return 'bg-emerald-50 text-emerald-700';
      case 'Draft':    return 'bg-amber-50 text-amber-700';
      case 'Inactive': return 'bg-gray-100 text-gray-600';
      case 'Archived': return 'bg-zinc-100 text-zinc-500';
    }
  }

  statusDotClass(s: ServiceStatus): string {
    switch (s) {
      case 'Active':   return 'bg-emerald-500';
      case 'Draft':    return 'bg-amber-500';
      case 'Inactive': return 'bg-gray-400';
      case 'Archived': return 'bg-zinc-400';
    }
  }

  availabilityClass(a: ServiceAvailability): string {
    switch (a) {
      case 'Available':   return 'bg-emerald-50 text-emerald-700';
      case 'Limited':     return 'bg-amber-50 text-amber-700';
      case 'Unavailable': return 'bg-red-50 text-red-700';
    }
  }

  availabilityDotClass(a: ServiceAvailability): string {
    switch (a) {
      case 'Available':   return 'bg-emerald-500';
      case 'Limited':     return 'bg-amber-500';
      case 'Unavailable': return 'bg-red-500';
    }
  }

  formatMoney(amount: number, currency: string): string {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency', currency, maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${amount.toLocaleString()} ${currency}`;
    }
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  }
  // #endregion
}
