import { Component } from "@angular/core";
import { BooStatusBadgeComponent } from "@physioboo/ui";
import { ColumnDefDirective } from "../../../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { Manufacturer } from "../../../../../../shared/types/support.types";
import { BooActionAdminComponent } from "../../../../../table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent } from "../../../../../table/boo-table-admin/boo-table-admin.component";
import { CategoryTableCardBase } from "../shared/category-table-card.base";

/** Manufacturers: company identity, location, contact, regulatory certifications and status. */
@Component({
  selector: 'common-category-manufacturer-table-card',
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
      minTableWidth="980px"
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

      <ng-template appColumnDef="name" headerLabel="Manufacturer" headerClass="text-left" let-item>
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
            <div class="truncate text-xs leading-4 text-secondary">{{ item.companyCode || empty }}</div>
          </div>
        </div>
      </ng-template>
      <ng-template appColumnDef="location" headerLabel="Location" headerClass="text-left" let-item>
        <div class="min-w-0">
          <div class="truncate text-sm leading-4 text-regular">{{ join(item.city, item.state) || empty }}</div>
          <div class="truncate text-xs leading-4 text-secondary">{{ item.country || empty }}</div>
        </div>
      </ng-template>
      <ng-template appColumnDef="contact" headerLabel="Contact" headerClass="text-left" let-item>
        <div class="min-w-0">
          <div class="truncate text-sm leading-4 text-regular">{{ item.phone || empty }}</div>
          <div class="truncate text-xs leading-4 text-secondary">{{ item.email || item.website || empty }}</div>
        </div>
      </ng-template>
      <ng-template appColumnDef="certifications" headerLabel="Certifications" headerClass="text-left" width="200px" let-item>
        <div class="flex flex-wrap gap-1 overflow-hidden">
          <boo-status-badge *ngIf="item.gmpCertified" [label]="'GMP'" tone="success" />
          <boo-status-badge *ngIf="item.isoCertified" [label]="'ISO'" tone="primary" />
          <boo-status-badge *ngIf="item.fdaApproved" [label]="'FDA'" tone="neutral" />
          <span *ngIf="!(item.gmpCertified) && !(item.isoCertified) && !(item.fdaApproved)" class="text-sm text-secondary">{{ empty }}</span>
        </div>
      </ng-template>
      <ng-template appColumnDef="licenseNumber" headerLabel="License no." headerClass="text-left" width="150px" let-item>
        <div class="truncate text-sm tabular-nums">{{ item.licenseNumber || empty }}</div>
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
export class CommonCategoryManufacturerTableCardComponent extends CategoryTableCardBase<Manufacturer> {
  join(...parts: (string | null | undefined)[]): string {
    return parts.filter(Boolean).join(', ');
  }
}
