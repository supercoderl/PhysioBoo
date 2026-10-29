import { Component } from "@angular/core";
import { BooStatusBadgeComponent } from "@physioboo/ui";
import { ColumnDefDirective } from "../../../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { Supplier } from "../../../../../../shared/types/support.types";
import { SupplierType } from "../../../../../../shared/enums/supplier-type";
import { BooActionAdminComponent } from "../../../../../table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent } from "../../../../../table/boo-table-admin/boo-table-admin.component";
import { CategoryTableCardBase } from "../shared/category-table-card.base";

/** Suppliers: identity and type, contact, location and the purchasing terms (lead time, credit limit). */
@Component({
  selector: 'common-category-supplier-table-card',
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
      columnsStorageKey="common-category.supplier"
      [bulkActions]="bulkActions"
      [sortOptions]="sortOptions"
      [currentSort]="currentSort"
      [filterConfigs]="filterConfigs"
      [currentFilter]="currentFilter"
      minTableWidth="1040px"
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

      <ng-template appColumnDef="name" hideable="false" headerLabel="Supplier" headerClass="text-left" let-item>
        <div class="flex items-center gap-3 min-w-0">
          <div class="min-w-0">
            <button
              *ngIf="canUpdate; else plainName"
              type="button"
              class="block max-w-full truncate p-0 bg-transparent border-0 text-left text-sm leading-4 font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
              [title]="item.supplierName"
              (click)="onRowOpen(item)"
            >{{ item.supplierName }}</button>
            <ng-template #plainName><span class="block truncate text-sm leading-4 font-semibold text-regular" [title]="item.supplierName">{{ item.supplierName }}</span></ng-template>
            <div class="truncate text-xs leading-4 text-secondary">{{ item.supplierCode || empty }}</div>
          </div>
        </div>
      </ng-template>
      <ng-template appColumnDef="type" headerLabel="Type" headerClass="text-left" width="160px" let-item>
        <boo-status-badge [label]="typeLabel(item.type)" tone="neutral" />
      </ng-template>
      <ng-template appColumnDef="contact" headerLabel="Contact" headerClass="text-left" let-item>
        <div class="min-w-0">
          <div class="truncate text-sm leading-4 text-regular">{{ item.contactPerson || empty }}</div>
          <div class="truncate text-xs leading-4 text-secondary">{{ item.phone || item.email || empty }}</div>
        </div>
      </ng-template>
      <ng-template appColumnDef="location" defaultHidden headerLabel="Location" headerClass="text-left" let-item>
        <div class="min-w-0">
          <div class="truncate text-sm leading-4 text-regular">{{ join(item.city, item.stateProvince) || empty }}</div>
          <div class="truncate text-xs leading-4 text-secondary">{{ item.country || empty }}</div>
        </div>
      </ng-template>
      <ng-template appColumnDef="leadTimeDays" headerLabel="Lead time" headerClass="text-right" cellClass="text-right" width="110px" let-item>
        <span class="text-sm tabular-nums">{{ item.leadTimeDays ? item.leadTimeDays + (item.leadTimeDays === 1 ? ' day' : ' days') : empty }}</span>
      </ng-template>
      <ng-template appColumnDef="creditLimit" defaultHidden headerLabel="Credit limit" headerClass="text-right" cellClass="text-right" width="140px" let-item>
        <span class="text-sm tabular-nums">{{ item.creditLimit ? (item.creditLimit | currency:(item.currency || 'USD'):'symbol':'1.0-2') : empty }}</span>
      </ng-template>
      <ng-container *ngIf="tableActions.length">
        <ng-template appColumnDef="actions" headerLabel="" width="64px" headerClass="text-center" cellClass="flex justify-center" let-item>
          <boo-action-admin [items]="tableActions" [data]="item" />
        </ng-template>
      </ng-container>
    </boo-table-admin>
  `
})
export class CommonCategorySupplierTableCardComponent extends CategoryTableCardBase<Supplier> {
  /** "MedicalEquipment" → "Medical equipment". */
  typeLabel(type: SupplierType | null | undefined): string {
    const key = type === null || type === undefined ? undefined : SupplierType[type];
    if (!key) return '—';
    const words = key.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
    return words.charAt(0).toUpperCase() + words.slice(1);
  }

  join(...parts: (string | null | undefined)[]): string {
    return parts.filter(Boolean).join(', ');
  }
}
