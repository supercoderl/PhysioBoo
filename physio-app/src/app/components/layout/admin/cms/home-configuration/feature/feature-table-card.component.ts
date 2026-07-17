import { Component, EventEmitter, Input, Output } from "@angular/core";
import { LocalLoadingService } from "../../../../../../services/common/local-loading.service";
import { ColumnDefDirective } from "../../../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { Feature } from "../../../../../../shared/types/feature.types";
import { ActionItem, PaginationData } from "../../../../../../shared/types/common";
import { BooIconComponent } from "../../../../../icon/boo-icon/boo-icon.component";
import { BooActionAdminComponent } from "../../../../../table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent } from "../../../../../table/boo-table-admin/boo-table-admin.component";

@Component({
  selector: 'home-config-feature-table-card',
  standalone: true,
  imports: [
    SharedModule,
    BooTableAdminComponent,
    ColumnDefDirective,
    BooActionAdminComponent,
    BooIconComponent
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
        (pageChange)="onPageClick($event)"
        [loading]="loadingSrv.isLoading('search')"
      >
        <ng-template appColumnDef="select" type="checkbox" width="48px"></ng-template>

        <ng-template appColumnDef="icon" headerLabel="Icon" headerClass="text-left" width="56px" let-item>
          <div class="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
            <boo-icon [name]="item.icon || 'circle'" [size]="18" class="text-primary"></boo-icon>
          </div>
        </ng-template>

        <ng-template appColumnDef="title" headerLabel="Title" headerClass="text-left" [sortable]="true" let-item>
          <div class="min-w-0" (click)="onEditClick(item.id)">
            <div class="truncate text-sm font-semibold text-danger cursor-pointer" [title]="item.title">
              {{ item.title }}
            </div>
            <div class="truncate text-xs text-secondary">{{ item.description }}</div>
          </div>
        </ng-template>

        <ng-template appColumnDef="order" headerLabel="Order" headerClass="text-right" cellClass="text-right" [sortable]="true" let-item>
          <div class="text-sm">{{ item.order }}</div>
        </ng-template>

        <ng-template appColumnDef="active" headerLabel="Status" headerClass="text-left" let-item>
          <span
            class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
            [ngClass]="item.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
          >
            {{ item.active ? 'Active' : 'Inactive' }}
          </span>
        </ng-template>

        <ng-template appColumnDef="actions" headerLabel="Actions" let-item headerClass="text-center" cellClass="text-center">
          <div class="relative">
            <boo-action-admin
              [items]="tableActions"
              [data]="item"
            />
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
export class HomeConfigFeatureTableCardComponent {
  // #region Inputs, Outputs, Properties
  @Input() data: PaginationData<Feature> | null = null;
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
  constructor(
    protected loadingSrv: LocalLoadingService
  ) { }
  // #endregion

  // #region Methods
  onPageClick(page: number) {
    this.pageChange.emit(page);
  }

  onEditClick(id: string) {
    this.editClick.emit(id);
  }

  onDeleteClick(id: string) {
    this.deleteClick.emit(id);
  }
  // #endregion
}
