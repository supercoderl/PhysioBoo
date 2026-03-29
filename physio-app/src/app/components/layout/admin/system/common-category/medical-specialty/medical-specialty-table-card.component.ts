import { Component, EventEmitter, Input, Output } from "@angular/core";
import { LocalLoadingService } from "../../../../../../services/common/local-loading.service";
import { ColumnDefDirective } from "../../../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { ActionItem, PaginationData } from "../../../../../../shared/types/common";
import { MedicalSpecialty } from "../../../../../../shared/types/medical-staff";
import { ColorUtils } from "../../../../../../shared/utils/color.utils";
import { BooActionAdminComponent } from "../../../../../table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent } from "../../../../../table/boo-table-admin/boo-table-admin.component";

@Component({
  selector: 'common-category-medical-specialty-table-card',
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
            <div 
              class="w-8 h-8 object-cover transition-colors duration-300 stroke-primary"
              [innerHTML]="item.iconUrl | safeHtml">
            </div>
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

        <ng-template appColumnDef="category" headerLabel="Category" headerClass="text-left" let-item>
          <div class="text-sm">{{ item.category }}</div>
        </ng-template>

        <ng-template appColumnDef="attributes" headerLabel="Attributes" headerClass="text-center" cellClass="text-center" let-item>
          <span class="inline-block px-2 py-1 rounded-md text-xs font-medium text-white" 
            [style.background-color]="ColorUtils.generateFromText(item.isSurgical ? 'Surgery' : item.isDiagnostic ? 'Diagnostic' : 'Unknown')">
            {{ item.isSurgical ? 'Surgery' : item.isDiagnostic ? 'Diagnostic' : 'Unknown' }}
          </span>
        </ng-template>

        <ng-template appColumnDef="averageConsultationDuration" headerLabel="Avg Duration" headerClass="text-right" cellClass="text-right" let-item>
          <div class="text-sm">{{ item.averageConsultationDuration }}</div>
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
export class CommonCategoryMedicalSpecialtyTableCardComponent {
  // #region Inputs, Outputs, Properties
  @Input() data: PaginationData<MedicalSpecialty> | null = null;
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