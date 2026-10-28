import { Component } from "@angular/core";
import { BooStatusBadgeComponent } from "@physioboo/ui";
import { ColumnDefDirective } from "../../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../../shared/shared-imports";
import { SequenceTracker } from "../../../../../shared/types/system.types";
import { BooActionAdminComponent } from "../../../../table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent } from "../../../../table/boo-table-admin/boo-table-admin.component";
import { CategoryTableCardBase } from "../../system/common-category/shared/category-table-card.base";
import { SEQUENCE_ENTITY_TYPES, buildSequenceCode, dateFormatRepeatsCodes, nextSequenceOf } from "./sequence-tracker.utils";

/** Numbering rules: the record type, the code format, the next code it would issue, and the counter. */
@Component({
  selector: 'setting-sequence-tracker-table-card',
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
      minTableWidth="900px"
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

      <ng-template appColumnDef="entityType" headerLabel="Record type" headerClass="text-left" let-item>
        <div class="min-w-0">
          <button
            *ngIf="canUpdate; else plainType"
            type="button"
            class="block max-w-full truncate p-0 bg-transparent border-0 text-left text-sm leading-4 font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
            [title]="item.entityType"
            (click)="onRowOpen(item)"
          >{{ item.entityType }}</button>
          <ng-template #plainType><span class="block truncate text-sm leading-4 font-semibold text-regular" [title]="item.entityType">{{ item.entityType }}</span></ng-template>
          <div *ngIf="!isKnownType(item.entityType)" class="mt-0.5 text-xs leading-4 text-danger" title="No record type asks for a code with this exact name, so this rule is never used.">Not used by any record type</div>
        </div>
      </ng-template>
      <ng-template appColumnDef="format" headerLabel="Format" headerClass="text-left" width="220px" let-item>
        <div class="min-w-0">
          <div class="truncate text-sm leading-4 font-mono text-regular">{{ item.prefix }}<span class="text-secondary">{{ item.useDateFormating ? item.useDateFormating + '-' : '' }}</span>{{ digits(item) }}{{ item.suffix || '' }}</div>
          <div class="truncate text-xs leading-4 text-secondary">{{ item.sequenceLength }}-digit number{{ item.useDateFormating ? ', restarts daily' : '' }}</div>
        </div>
      </ng-template>
      <ng-template appColumnDef="next" headerLabel="Next code" headerClass="text-left" width="240px" let-item>
        <div class="flex items-center gap-2 min-w-0">
          <span class="truncate text-sm font-mono text-regular" [title]="'If a code were issued now: ' + nextCode(item)">{{ nextCode(item) }}</span>
          <boo-status-badge *ngIf="repeats(item)" label="Can repeat" tone="warning" [title]="repeatHint" />
        </div>
      </ng-template>
      <ng-template appColumnDef="currentSequence" headerLabel="Last issued #" headerClass="text-right" cellClass="text-right" width="120px" let-item>
        <span class="text-sm tabular-nums">{{ item.currentSequence | number }}</span>
      </ng-template>
      <ng-template appColumnDef="updatedAt" headerLabel="Updated" headerClass="text-left" width="140px" let-item>
        <span class="text-sm text-regular">{{ (item.updatedAt || item.createdAt) | date:'mediumDate' }}</span>
      </ng-template>
      <ng-container *ngIf="tableActions.length">
        <ng-template appColumnDef="actions" headerLabel="" width="64px" headerClass="text-center" cellClass="flex justify-center" let-item>
          <boo-action-admin [items]="tableActions" [data]="item" />
        </ng-template>
      </ng-container>
    </boo-table-admin>
  `
})
export class SettingSequenceTrackerTableCardComponent extends CategoryTableCardBase<SequenceTracker> {
  readonly repeatHint = 'The counter restarts every day, but a year or month date part does not change daily, so earlier codes are issued again.';

  /** "####" for a 4-digit number. */
  digits(item: SequenceTracker): string {
    return '#'.repeat(Math.max(1, Number(item.sequenceLength) || 1));
  }

  isKnownType(type: string): boolean {
    return SEQUENCE_ENTITY_TYPES.includes(type);
  }

  nextCode(item: SequenceTracker): string {
    return buildSequenceCode(item, nextSequenceOf(item));
  }

  repeats(item: SequenceTracker): boolean {
    return dateFormatRepeatsCodes(item.useDateFormating);
  }
}
