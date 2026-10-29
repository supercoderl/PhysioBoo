import { Component } from "@angular/core";
import { BooStatusBadgeComponent } from "@physioboo/ui";
import { ColumnDefDirective } from "../../../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { ImagingModality } from "../../../../../../shared/types/laboratory-imaging.types";
import { BooActionAdminComponent } from "../../../../../table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent } from "../../../../../table/boo-table-admin/boo-table-admin.component";
import { CategoryTableCardBase } from "../shared/category-table-card.base";

/** Imaging modalities: identity and category, exam duration, radiation dose, patient preparation and status. */
@Component({
  selector: 'common-category-imaging-modality-table-card',
  standalone: true,
  imports: [
    SharedModule,
    BooTableAdminComponent,
    ColumnDefDirective,
    BooActionAdminComponent,
    BooStatusBadgeComponent
  ],
  template: `
    <boo-table-admin
      class="flex-1 min-h-0 rounded-[6px] overflow-hidden"
      [data]="data?.items ?? []"
      [currentPage]="data?.pageNumber ?? filter.pageNumber"
      [pageSize]="data?.pageSize ?? filter.pageSize"
      [totalItems]="data?.totalCount ?? 0"
      [loading]="loading"
      [availableTools]="tools"
      columnsStorageKey="common-category.imaging-modality"
      [bulkActions]="bulkActions"
      [sortOptions]="sortOptions"
      [currentSort]="currentSort"
      [filterConfigs]="filterConfigs"
      [currentFilter]="currentFilter"
      minTableWidth="960px"
      (pageChange)="pageChange.emit($event)"
      (searchChange)="searchChange.emit($event)"
      (reload)="reloadClick.emit()"
      (sortApply)="sortApply.emit($event)"
      (filterApply)="filterApply.emit($event)"
      (bulkAction)="onBulkAction($event)"
    >
      <ng-container *ngIf="canDelete">
        <ng-template appColumnDef="select" type="checkbox" width="48px"></ng-template>
      </ng-container>

      <ng-template appColumnDef="name" hideable="false" headerLabel="Modality" headerClass="text-left" let-item>
        <div class="flex items-center gap-3 min-w-0">
          <div class="min-w-0">
            <button
              *ngIf="canUpdate; else plainName"
              type="button"
              class="block max-w-full truncate p-0 bg-transparent border-0 text-left text-sm leading-4 font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
              [title]="item.name"
              (click)="onRowOpen(item)"
            >{{ item.name }}</button>
            <ng-template #plainName><span class="block truncate text-sm leading-4 font-semibold text-regular" [title]="item.name">{{ item.name }}</span></ng-template>
            <div class="truncate text-xs leading-4 text-secondary">{{ item.code || empty }}</div>
          </div>
        </div>
      </ng-template>
      <ng-template appColumnDef="category" headerLabel="Category" headerClass="text-left" width="150px" let-item>
        <div class="truncate text-sm">{{ item.category || empty }}</div>
      </ng-template>
      <ng-template appColumnDef="averageDurationMinutes" headerLabel="Avg. duration" headerClass="text-right" cellClass="text-right" width="130px" let-item>
        <span class="text-sm tabular-nums">{{ item.averageDurationMinutes ? item.averageDurationMinutes + ' min' : empty }}</span>
      </ng-template>
      <ng-template appColumnDef="radiationDose" defaultHidden headerLabel="Radiation dose" headerClass="text-right" cellClass="text-right" width="140px" let-item>
        <span class="text-sm tabular-nums" [class.text-secondary]="!item.radiationDose">{{ item.radiationDose ? (item.radiationDose | number:'1.0-2') + ' mSv' : 'None' }}</span>
      </ng-template>
      <ng-template appColumnDef="prep" defaultHidden headerLabel="Patient preparation" headerClass="text-left" width="210px" let-item>
        <div class="flex flex-wrap gap-1 overflow-hidden">
          <boo-status-badge *ngIf="item.requiresContrast" [label]="'Contrast'" tone="warning" />
          <boo-status-badge *ngIf="item.preparationRequired" [label]="'Preparation'" tone="primary" />
          <span *ngIf="!(item.requiresContrast) && !(item.preparationRequired)" class="text-sm text-secondary">{{ empty }}</span>
        </div>
      </ng-template>
      <ng-template appColumnDef="isActive" headerLabel="Status" headerClass="text-left" width="120px" let-item>
        <boo-status-badge dotted [label]="item.isActive ? 'Active' : 'Inactive'" [tone]="item.isActive ? 'success' : 'neutral'" />
      </ng-template>
      <ng-container *ngIf="tableActions.length">
        <ng-template appColumnDef="actions" headerLabel="" width="64px" headerClass="text-center" cellClass="flex justify-center" let-item>
          <boo-action-admin [items]="tableActions" [data]="item" />
        </ng-template>
      </ng-container>
    </boo-table-admin>
  `
})
export class CommonCategoryImagingModalityTableCardComponent extends CategoryTableCardBase<ImagingModality> {
}
