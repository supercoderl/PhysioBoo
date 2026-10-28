import { Component } from "@angular/core";
import { BooStatusBadgeComponent } from "@physioboo/ui";
import { ColumnDefDirective } from "../../../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { InsuranceCompany } from "../../../../../../shared/types/support.types";
import { InsuranceType } from "../../../../../../shared/enums/insurance-type";
import { BooActionAdminComponent } from "../../../../../table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent } from "../../../../../table/boo-table-admin/boo-table-admin.component";
import { CategoryTableCardBase } from "../shared/category-table-card.base";

/** Insurance companies: insurer identity and type, contact, the claim channels it offers, settlement performance and status. */
@Component({
  selector: 'common-category-insurance-company-table-card',
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

      <ng-template appColumnDef="name" headerLabel="Insurer" headerClass="text-left" let-item>
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
      <ng-template appColumnDef="type" headerLabel="Type" headerClass="text-left" width="130px" let-item>
        <boo-status-badge [label]="typeLabel(item.type)" tone="neutral" />
      </ng-template>
      <ng-template appColumnDef="contact" headerLabel="Contact" headerClass="text-left" let-item>
        <div class="min-w-0">
          <div class="truncate text-sm leading-4 text-regular">{{ item.contactPerson || empty }}</div>
          <div class="truncate text-xs leading-4 text-secondary">{{ item.phone || item.email || empty }}</div>
        </div>
      </ng-template>
      <ng-template appColumnDef="claims" headerLabel="Claims" headerClass="text-left" width="210px" let-item>
        <div class="flex flex-wrap gap-1 overflow-hidden">
          <boo-status-badge *ngIf="item.cashlessFacility" [label]="'Cashless'" tone="success" />
          <boo-status-badge *ngIf="item.reimbursementFacility" [label]="'Reimbursement'" tone="primary" />
          <span *ngIf="!(item.cashlessFacility) && !(item.reimbursementFacility)" class="text-sm text-secondary">{{ empty }}</span>
        </div>
      </ng-template>
      <ng-template appColumnDef="settlement" headerLabel="Settlement" headerClass="text-left" width="130px" let-item>
        <div class="min-w-0">
          <div class="truncate text-sm leading-4 text-regular">{{ item.claimSettlementRatio !== null && item.claimSettlementRatio !== undefined ? (item.claimSettlementRatio | number:'1.0-2') + '%' : empty }}</div>
          <div class="truncate text-xs leading-4 text-secondary">{{ item.averageClaimSettlementTime ? '~' + item.averageClaimSettlementTime + ' days' : empty }}</div>
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
export class CommonCategoryInsuranceCompanyTableCardComponent extends CategoryTableCardBase<InsuranceCompany> {
  typeLabel(type: InsuranceType | null | undefined): string {
    return type === null || type === undefined ? '—' : (InsuranceType[type] ?? '—');
  }
}
