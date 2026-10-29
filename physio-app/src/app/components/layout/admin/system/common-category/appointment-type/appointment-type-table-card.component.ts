import { Component } from "@angular/core";
import { BooStatusBadgeComponent } from "@physioboo/ui";
import { ColumnDefDirective } from "../../../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { AppointmentType } from "../../../../../../shared/types/operation.types";
import { BooActionAdminComponent } from "../../../../../table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent } from "../../../../../table/boo-table-admin/boo-table-admin.component";
import { CategoryTableCardBase } from "../shared/category-table-card.base";

/** Appointment types: the slot length and buffer the scheduler books, the consultation fee, booking flags and status. */
@Component({
  selector: 'common-category-appointment-type-table-card',
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
      columnsStorageKey="common-category.appointment-type"
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

      <ng-template appColumnDef="name" hideable="false" headerLabel="Appointment type" headerClass="text-left" let-item>
        <div class="flex items-center gap-3 min-w-0">
          <span class="flex-none w-2.5 h-2.5 rounded-full ring-2 ring-surface shadow-[0_0_0_1px_rgba(0,0,0,0.08)]" [style.background-color]="item.colorCode || '#CBD5E1'" aria-hidden="true"></span>
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
      <ng-template appColumnDef="defaultDuration" headerLabel="Slot" headerClass="text-left" width="140px" let-item>
        <div class="min-w-0">
          <div class="truncate text-sm leading-4 text-regular">{{ item.defaultDuration }} min</div>
          <div class="truncate text-xs leading-4 text-secondary">{{ item.bufferTime ? '+ ' + item.bufferTime + ' min buffer' : 'No buffer' }}</div>
        </div>
      </ng-template>
      <ng-template appColumnDef="consultationFee" headerLabel="Consultation fee" headerClass="text-right" cellClass="text-right" width="150px" let-item>
        <span class="text-sm tabular-nums">{{ item.consultationFee | currency:'USD':'symbol':'1.2-2' }}</span>
      </ng-template>
      <ng-template appColumnDef="flags" defaultHidden headerLabel="Booking" headerClass="text-left" width="240px" let-item>
        <div class="flex flex-wrap gap-1 overflow-hidden">
          <boo-status-badge *ngIf="item.isEmergency" [label]="'Emergency'" tone="danger" />
          <boo-status-badge *ngIf="item.isFollowUp" [label]="'Follow-up'" tone="primary" />
          <boo-status-badge *ngIf="item.requiresPreparation" [label]="'Preparation'" tone="warning" />
          <span *ngIf="!(item.isEmergency) && !(item.isFollowUp) && !(item.requiresPreparation)" class="text-sm text-secondary">{{ empty }}</span>
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
export class CommonCategoryAppointmentTypeTableCardComponent extends CategoryTableCardBase<AppointmentType> {
}
