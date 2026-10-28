import { Component, Input } from "@angular/core";
import { BooStatusBadgeComponent } from "@physioboo/ui";
import { ColumnDefDirective } from "../../../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { MedicalSpecialty } from "../../../../../../shared/types/medical-staff.types";
import { BooActionAdminComponent } from "../../../../../table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent } from "../../../../../table/boo-table-admin/boo-table-admin.component";
import { CategoryTableCardBase } from "../shared/category-table-card.base";

/** Medical specialties: identity, parent specialty, classification and the average consultation length used for scheduling. */
@Component({
  selector: 'common-category-medical-specialty-table-card',
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
      minTableWidth="880px"
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

      <ng-template appColumnDef="name" headerLabel="Specialty" headerClass="text-left" let-item>
        <div class="flex items-center gap-3 min-w-0">
          <span class="flex-none inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primarySoft text-primary overflow-hidden" aria-hidden="true">
            <span *ngIf="isInlineSvg(item.iconUrl)" class="w-5 h-5 [&>svg]:w-full [&>svg]:h-full" [innerHTML]="item.iconUrl | safeHtml"></span>
            <img *ngIf="item.iconUrl && !isInlineSvg(item.iconUrl)" [src]="item.iconUrl" alt="" class="w-5 h-5 object-contain" />
            <physio-icon *ngIf="!item.iconUrl" name="stethoscope" [size]="16" />
          </span>
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
      <ng-template appColumnDef="parent" headerLabel="Parent specialty" headerClass="text-left" let-item>
        <div class="truncate text-sm" [class.text-secondary]="!item.parentSpecialtyId">
          {{ item.parentSpecialtyId ? (parentNames[item.parentSpecialtyId] || 'Unknown specialty') : 'Top level' }}
        </div>
      </ng-template>
      <ng-template appColumnDef="category" headerLabel="Category" headerClass="text-left" width="140px" let-item>
        <div class="truncate text-sm">{{ item.category || empty }}</div>
      </ng-template>
      <ng-template appColumnDef="classification" headerLabel="Classification" headerClass="text-left" width="190px" let-item>
        <div class="flex flex-wrap gap-1 overflow-hidden">
          <boo-status-badge *ngIf="item.isSurgical" [label]="'Surgical'" tone="primary" />
          <boo-status-badge *ngIf="item.isDiagnostic" [label]="'Diagnostic'" tone="neutral" />
          <span *ngIf="!(item.isSurgical) && !(item.isDiagnostic)" class="text-sm text-secondary">{{ empty }}</span>
        </div>
      </ng-template>
      <ng-template appColumnDef="averageConsultationDuration" headerLabel="Avg. consultation" headerClass="text-right" cellClass="text-right" width="150px" let-item>
        <span class="text-sm tabular-nums">{{ item.averageConsultationDuration ? item.averageConsultationDuration + ' min' : empty }}</span>
      </ng-template>
      <ng-container *ngIf="tableActions.length">
        <ng-template appColumnDef="actions" headerLabel="" width="64px" headerClass="text-center" cellClass="flex justify-center" let-item>
          <boo-action-admin [items]="tableActions" [data]="item" />
        </ng-template>
      </ng-container>
    </boo-table-admin>
  `
})
export class CommonCategoryMedicalSpecialtyTableCardComponent extends CategoryTableCardBase<MedicalSpecialty> {
  /** Specialty names by id, for the parent column; the page loads every specialty once. */
  @Input() parentNames: Record<string, string> = {};

  isInlineSvg(value: string | null | undefined): boolean {
    return !!value && value.trim().toLowerCase().startsWith('<svg');
  }
}
