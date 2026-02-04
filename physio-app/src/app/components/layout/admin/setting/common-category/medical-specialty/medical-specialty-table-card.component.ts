import { Component, EventEmitter, Input, Output } from "@angular/core";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { BooTableAdminComponent } from "../../../../../table/boo-table-admin/boo-table-admin.component";
import { ColumnDefDirective } from "../../../../../../shared/directives/column-def.directive";
import { ButtonIconComponent } from "../../../../../button/button-icon/button-icon.component";
import { MedicalSpecialty } from "../../../../../../shared/types/medical-staff";
import { PaginationData } from "../../../../../../shared/types/common";
import { ColorUtils } from "../../../../../../shared/utils/color.utils";

@Component({
  selector: 'admin-medical-specialty-table-card',
  standalone: true,
  imports: [
    SharedModule,
    BooTableAdminComponent,
    ColumnDefDirective,
    ButtonIconComponent
  ],
  template: `
    <div class="bg-white rounded-[6px] border border-gray-200 h-full">
      <boo-table-admin 
        [data]="data?.items ?? []" 
        tdClass="px-4 py-3"
        [showFooter]="true" 
        [currentPage]="data?.pageNumber ?? 1"
        [pageSize]="data?.pageSize ?? 10"
        [totalItems]="data?.totalCount ?? 0"
        (pageChange)="onPageClick($event)"
      >  
        <ng-template appColumnDef="name" headerLabel="Name" headerClass="text-left" let-item>
          <div class="flex items-center gap-3" (click)="onEditClick(item.id)">
            <img [src]="item.iconUrl" [alt]="item.name" class="w-8 h-8 object-cover">
            <div>
              <div class="text-sm font-semibold text-gray-900">{{ item.name }}</div>
            </div>
          </div>
        </ng-template>

        <ng-template appColumnDef="code" headerLabel="Code" headerClass="text-left" let-item>
          <div class="text-sm">{{ item.code }}</div>
        </ng-template>

        <ng-template appColumnDef="category" headerLabel="Category" headerClass="text-left" let-item>
          <div class="text-sm">{{ item.category }}</div>
        </ng-template>

        <ng-template appColumnDef="attributes" headerLabel="Attributes" headerClass="text-left" let-item>
          <span class="inline-block px-2 py-1 rounded-md text-xs font-medium text-white" 
            [style.background-color]="ColorUtils.generateFromText(item.isSurgery ? 'Surgery' : 'Diagnostic')">
            {{ item.isSurgery ? 'Surgery' : 'Diagnostic' }}
          </span>
        </ng-template>

        <ng-template appColumnDef="averageConsultationDuration" headerLabel="Avg Duration" headerClass="text-left" let-item>
          <div class="text-sm">{{ item.averageConsultationDuration }}</div>
        </ng-template>

        <ng-template appColumnDef="actions" let-item cellClass="text-right">
          <div class="flex items-center justify-end gap-2">
            <button-icon
              [icon]="{ name: 'trash-2' }"
              buttonClass="!bg-[#EEF2F7] !border-0 !px-2"
              (click)="onDeleteClick(item.id)"
            >
            </button-icon>
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
export class AdminMedicalSpecialtyTableCardComponent {
  // #region Inputs, Outputs, Properties
  @Input() data: PaginationData<MedicalSpecialty[]> | null = null;
  @Output() pageChange = new EventEmitter<number>();
  @Output() editClick = new EventEmitter<string>();
  @Output() deleteClick = new EventEmitter<string>();
  ColorUtils = ColorUtils;
  // #endregion

  // #region Init (Lifecycle + Setup)
  constructor() { }
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