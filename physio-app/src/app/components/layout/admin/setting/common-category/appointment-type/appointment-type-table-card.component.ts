import { Component, EventEmitter, Input, Output, signal } from "@angular/core";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { BooTableAdminComponent } from "../../../../../table/boo-table-admin/boo-table-admin.component";
import { ColumnDefDirective } from "../../../../../../shared/directives/column-def.directive";
import { ActionItem, PaginationData } from "../../../../../../shared/types/common";
import { ColorUtils } from "../../../../../../shared/utils/color.utils";
import { LocalLoadingService } from "../../../../../../services/common/local-loading.service";
import { BooActionAdminComponent } from "../../../../../table/boo-table-admin/boo-action-admin.component";
import { AppointmentType } from "../../../../../../shared/types/operation";
import { BooIconComponent } from "../../../../../icon/boo-icon/boo-icon.component";

@Component({
  selector: 'common-category-appointment-type-table-card',
  standalone: true,
  imports: [
    SharedModule,
    BooTableAdminComponent,
    ColumnDefDirective,
    BooActionAdminComponent,
    BooIconComponent
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
            </div>
          </div>
        </ng-template>

        <ng-template appColumnDef="code" headerLabel="Code" headerClass="text-left" let-item>
          <div class="text-sm">{{ item.code }}</div>
        </ng-template>

        <ng-template appColumnDef="defaultDuration" headerLabel="Duration" headerClass="text-left" let-item>
          <div class="text-sm">{{ item.defaultDuration }}</div>
        </ng-template>

        <ng-template appColumnDef="isEmergency" headerLabel="Emergency" headerClass="text-left" let-item>
          <boo-icon name="circle-check" *ngIf="item.IsEmergency"  />
        </ng-template>

        <ng-template appColumnDef="consultationFee" headerLabel="Consultation Fee" headerClass="text-left" let-item>
          <div class="text-sm">{{ item.consultationFee }}</div>
        </ng-template>

        <ng-template appColumnDef="actions" let-item cellClass="text-right">
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
export class CommonCategoryAppointmentTypeTableCardComponent {
  // #region Inputs, Outputs, Properties
  @Input() data: PaginationData<AppointmentType> | null = null;
  @Input() filter!: { pageNumber: number, pageSize: number };
  @Output() pageChange = new EventEmitter<number>();
  @Output() editClick = new EventEmitter<string>();
  @Output() deleteClick = new EventEmitter<string>();
  ColorUtils = ColorUtils;

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