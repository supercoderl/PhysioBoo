import { Component, EventEmitter, Input, Output } from "@angular/core";
import { LocalLoadingService } from "../../../../../../services/common/local-loading.service";
import { ColumnDefDirective } from "../../../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { ActionItem, PaginationData } from "../../../../../../shared/types/common";
import { HospitalGroup } from "../../../../../../shared/types/support";
import { BooActionAdminComponent } from "../../../../../table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent } from "../../../../../table/boo-table-admin/boo-table-admin.component";

@Component({
  selector: 'common-category-hospital-group-table-card',
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
          <div class="flex items-center gap-3 overflow-hidden" (click)="onEditClick(item.id)">
            <div class="min-w-0 flex-1">
              <div class="truncate text-sm font-semibold text-danger cursor-pointer" [title]="item.name">
                {{ item.name }}
              </div>
              <div class="text-xs text-secondary">{{ item.code }}</div>
            </div>
          </div>
        </ng-template>

        <ng-template appColumnDef="contactPerson" headerLabel="Contact" headerClass="text-left" let-item>
          <div class="text-sm">{{ item.contactPerson ?? '—' }}</div>
          <div class="text-xs text-secondary">{{ item.email ?? '' }}</div>
        </ng-template>

        <ng-template appColumnDef="hospitalCount" headerLabel="Hospitals" headerClass="text-center" cellClass="text-center" let-item>
          <span class="text-sm font-medium">{{ item.hospitalCount }}</span>
        </ng-template>

        <ng-template appColumnDef="subscriptionPlan" headerLabel="Plan" headerClass="text-left" let-item>
          <span class="text-sm">{{ item.subscriptionPlan }}</span>
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
export class CommonCategoryHospitalGroupTableCardComponent {
  // #region Inputs, Outputs, Properties
  @Input() data: PaginationData<HospitalGroup> | null = null;
  @Input() filter!: { pageNumber: number, pageSize: number };
  @Output() pageChange = new EventEmitter<number>();
  @Output() editClick = new EventEmitter<string>();
  @Output() deleteClick = new EventEmitter<string>();

  readonly tableActions: ActionItem[] = [
    {
      label: 'Delete',
      isDanger: true,
      onClick: (item: any) => this.onDeleteClick(item.id)
    }
  ];
  // #endregion

  // #region Init (Lifecycle + Setup)
  constructor(protected loadingSrv: LocalLoadingService) { }
  // #endregion

  // #region Methods
  onPageClick(page: number) { this.pageChange.emit(page); }
  onEditClick(id: string) { this.editClick.emit(id); }
  onDeleteClick(id: string) { this.deleteClick.emit(id); }
  // #endregion
}
