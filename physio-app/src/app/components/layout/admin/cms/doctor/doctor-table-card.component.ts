import { Component, EventEmitter, Input, Output } from "@angular/core";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ColumnDefDirective } from "../../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../../shared/shared-imports";
import { ActionItem, PaginationData } from "../../../../../shared/types/common";
import { Doctor } from "../../../../../shared/types/medical-staff";
import { ColorUtils } from "../../../../../shared/utils/color.utils";
import { BooAvatarComponent } from "../../../../image/avatar/boo-avatar.component";
import { BooActionAdminComponent } from "../../../../table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent } from "../../../../table/boo-table-admin/boo-table-admin.component";

@Component({
  selector: 'cms-doctor-table-card',
  standalone: true,
  imports: [
    SharedModule,
    BooTableAdminComponent,
    ColumnDefDirective,
    BooActionAdminComponent,
    BooAvatarComponent
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
        <ng-template appColumnDef="select" type="checkbox" width="48px"></ng-template>

        <ng-template appColumnDef="avatar" headerLabel="Avatar" headerClass="text-left" [sortable]="true" let-item>
          <boo-avatar [src]="item.avatar" />
        </ng-template>

        <ng-template 
          appColumnDef="fullName" 
          headerLabel="Name" 
          headerClass="text-left" 
          [sortable]="true" 
          [draggable]="true" 
          [hasActions]="true"
          let-item
        >
          <div class="flex items-center gap-3 overflow-hidden" (click)="onEditClick(item.id)">
            <div class="min-w-0 flex-1">
              <div class="truncate text-sm font-semibold text-danger cursor-pointer" [title]="item.fullName">
                {{ item.fullName }}
              </div>
            </div>
          </div>
        </ng-template>

        <ng-template 
            appColumnDef="employeeId" 
            headerLabel="Emp Id" 
            headerClass="text-left" 
            [sortable]="true" 
            [draggable]="true" 
            [hasActions]="true"
            let-item
        >
          <div class="text-sm">{{ item.employeeId }}</div>
        </ng-template>

        <ng-template 
            appColumnDef="yearsOfExperience" 
            headerLabel="Exp" 
            headerClass="text-right" 
            cellClass="text-right" 
            [sortable]="true" 
            [draggable]="true" 
            [hasActions]="true"
            let-item
        >
          <div class="text-sm">{{ item.yearsOfExperience }}</div>
        </ng-template>

        <ng-template 
            appColumnDef="followUpFee" 
            headerLabel="Fee" 
            headerClass="text-center" 
            cellClass="text-center" 
            [sortable]="true" 
            [draggable]="true" 
            [hasActions]="true"
            let-item
        >
          <div class="text-sm">{{ item.followUpFee }}</div>
        </ng-template>

        <ng-template 
            appColumnDef="successRate" 
            headerLabel="Success Rate" 
            headerClass="text-right" 
            cellClass="text-right" 
            [sortable]="true" 
            [draggable]="true" 
            [hasActions]="true"
            let-item
        >
          <div class="text-sm">{{ item.successRate }}</div>
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
export class CmsDoctorTableCardComponent {
  // #region Inputs, Outputs, Properties
  @Input() data: PaginationData<Doctor> | null = null;
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