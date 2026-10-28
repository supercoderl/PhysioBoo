import { Component, Input } from "@angular/core";
import { BooStatusBadgeComponent } from "@physioboo/ui";
import { ColumnDefDirective } from "../../../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { LabTest } from "../../../../../../shared/types/laboratory-imaging.types";
import { BooActionAdminComponent } from "../../../../../table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent } from "../../../../../table/boo-table-admin/boo-table-admin.component";
import { CategoryTableCardBase } from "../shared/category-table-card.base";

/** Lab tests: test identity and category, specimen, turnaround, price, ordering options and status. */
@Component({
  selector: 'common-category-lab-test-table-card',
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
      [bulkActions]="bulkActions"
      [sortOptions]="sortOptions"
      [currentSort]="currentSort"
      [filterConfigs]="filterConfigs"
      [currentFilter]="currentFilter"
      minTableWidth="1080px"
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

      <ng-template appColumnDef="name" headerLabel="Test" headerClass="text-left" let-item>
        <div class="flex items-center gap-3 min-w-0">
          <div class="min-w-0">
            <button
              *ngIf="canUpdate; else plainName"
              type="button"
              class="block max-w-full truncate p-0 bg-transparent border-0 text-left text-sm leading-4 font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
              [title]="item.testName"
              (click)="onRowOpen(item)"
            >{{ item.testName }}</button>
            <ng-template #plainName><span class="block truncate text-sm leading-4 font-semibold text-regular" [title]="item.testName">{{ item.testName }}</span></ng-template>
            <div class="truncate text-xs leading-4 text-secondary">{{ item.testCode || empty }}</div>
          </div>
        </div>
      </ng-template>
      <ng-template appColumnDef="category" headerLabel="Category" headerClass="text-left" width="170px" let-item>
        <div class="truncate text-sm">{{ categoryNames[item.categoryId] || empty }}</div>
      </ng-template>
      <ng-template appColumnDef="sample" headerLabel="Specimen" headerClass="text-left" width="150px" let-item>
        <div class="min-w-0">
          <div class="truncate text-sm leading-4 text-regular">{{ item.sampleType || empty }}</div>
          <div class="truncate text-xs leading-4 text-secondary">{{ item.sampleVolume || item.unitOfMeasurement || empty }}</div>
        </div>
      </ng-template>
      <ng-template appColumnDef="reportingTimeHours" headerLabel="Turnaround" headerClass="text-left" width="130px" let-item>
        <div class="min-w-0">
          <div class="truncate text-sm leading-4 text-regular">{{ item.reportingTimeHours ? item.reportingTimeHours + ' h' : empty }}</div>
          <div class="truncate text-xs leading-4 text-secondary">{{ item.isUrgentAvailable && item.urgentReportingTimeHours ? 'Urgent ' + item.urgentReportingTimeHours + ' h' : 'Routine only' }}</div>
        </div>
      </ng-template>
      <ng-template appColumnDef="cost" headerLabel="Price" headerClass="text-right" cellClass="text-right" width="120px" let-item>
        <span class="text-sm tabular-nums">{{ item.cost | currency:'USD':'symbol':'1.2-2' }}</span>
      </ng-template>
      <ng-template appColumnDef="options" headerLabel="Options" headerClass="text-left" width="230px" let-item>
        <div class="flex flex-wrap gap-1 overflow-hidden">
          <boo-status-badge *ngIf="item.fastingRequired" [label]="'Fasting'" tone="warning" />
          <boo-status-badge *ngIf="item.isHomeCollectionAvailable" [label]="'Home collection'" tone="primary" />
          <boo-status-badge *ngIf="item.isProfile" [label]="'Panel'" tone="neutral" />
          <span *ngIf="!(item.fastingRequired) && !(item.isHomeCollectionAvailable) && !(item.isProfile)" class="text-sm text-secondary">{{ empty }}</span>
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
export class CommonCategoryLabTestTableCardComponent extends CategoryTableCardBase<LabTest> {
  /** Category names by id (the lab test category lookup). */
  @Input() categoryNames: Record<string, string> = {};
}
