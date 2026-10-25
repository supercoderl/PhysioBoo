import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { DrawerComponent } from "../../../../components/drawer/drawer.component";
import { StockTakeService } from "../../../../services/admin/stock-take.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { formatStockTakeValue, StockTake, StockTakeActivity, StockTakeActivityType, stockTakeStatusLabel, stockTakeStatusTone } from "../../../../shared/types/stock-take.types";
import { STOCK_TAKE_ACTION_META, StockTakeAccess, StockTakeActionKey, stockTakeActions } from "./stock-take-actions";

const ACTIVITY_ICON: Record<StockTakeActivityType, string> = {
  Created: 'circle-plus', Assigned: 'user-plus', Started: 'play', ItemCounted: 'clipboard',
  Completed: 'circle-check', Approved: 'check-circle', Rejected: 'circle-x', Cancelled: 'ban',
};

/** Session facts, the actions its status allows and its activity trail. */
@Component({
  selector: 'stock-take-detail-drawer',
  standalone: true,
  imports: [SharedModule, DrawerComponent, BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent, BooStatusBadgeComponent],
  template: `
    <drawer [isOpen]="isOpen" [isShowDialog]="true" (close)="close.emit()">
      <div class="flex flex-col h-full bg-surface" role="dialog" aria-modal="true" aria-labelledby="stock-take-detail-title" (keydown.escape)="close.emit()">
        <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-3 sticky top-0 bg-surface z-10">
          <div class="min-w-0">
            <h2 id="stock-take-detail-title" class="text-xl font-bold text-regular leading-tight m-0 truncate">{{ stockTake?.code }}</h2>
            <div class="mt-1.5" *ngIf="stockTake">
              <boo-status-badge [label]="statusLabel(stockTake.status)" [tone]="statusTone(stockTake.status)" dotted></boo-status-badge>
            </div>
          </div>
          <button type="button" (click)="close.emit()" class="flex-none text-gray-500 hover:text-gray-700 w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100" aria-label="Close details">
            <physio-icon name="x" [size]="20"></physio-icon>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6" custom-scrollbar *ngIf="stockTake">
          <div *ngIf="stockTake.rejectionReason" class="p-3 rounded-1.5 bg-rose-50 border border-rose-100 text-sm text-rose-700" role="note">
            <span class="font-semibold">Rejected:</span> {{ stockTake.rejectionReason }}
          </div>

          <section aria-label="Progress">
            <div class="flex items-center justify-between text-xs text-secondary mb-1.5">
              <span>{{ stockTake.itemsCount | number }} items</span>
              <span class="font-semibold text-regular tabular-nums">{{ stockTake.completedPercent | number:'1.0-1' }}% counted</span>
            </div>
            <div class="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div class="h-full rounded-full bg-primary" [style.width.%]="stockTake.completedPercent"></div>
            </div>
            <p class="mt-2 mb-0 text-xs text-secondary" *ngIf="stockTake.completedPercent > 0">
              Variance at cost: <span class="font-semibold tabular-nums" [ngClass]="stockTake.differenceValue < 0 ? 'text-rose-600' : 'text-regular'">{{ money(stockTake.differenceValue) }}</span>
            </p>
          </section>

          <section aria-label="Details">
            <dl class="grid grid-cols-2 gap-x-4 gap-y-3 m-0 text-sm">
              <div><dt class="text-xs text-secondary">Warehouse</dt><dd class="m-0 text-regular">{{ stockTake.warehouseName || '—' }}</dd></div>
              <div><dt class="text-xs text-secondary">Department</dt><dd class="m-0 text-regular">{{ stockTake.departmentName || '—' }}</dd></div>
              <div><dt class="text-xs text-secondary">Scheduled</dt><dd class="m-0 text-regular">{{ stockTake.scheduledDate | date:'mediumDate' }}</dd></div>
              <div><dt class="text-xs text-secondary">Counter</dt><dd class="m-0 text-regular break-all">{{ stockTake.assignedToName || 'Unassigned' }}</dd></div>
              <div><dt class="text-xs text-secondary">Created by</dt><dd class="m-0 text-regular break-all">{{ stockTake.createdByName || '—' }}</dd></div>
              <div><dt class="text-xs text-secondary">Created</dt><dd class="m-0 text-regular">{{ stockTake.createdDate | date:'medium' }}</dd></div>
            </dl>
            <p class="mt-3 mb-0 text-sm text-regular whitespace-pre-line" *ngIf="stockTake.notes"><span class="block text-xs text-secondary">Notes</span>{{ stockTake.notes }}</p>
          </section>

          <section aria-label="Actions" *ngIf="actions.length">
            <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-2 mt-0">Actions</h3>
            <div class="flex flex-wrap gap-2">
              <button *ngFor="let key of actions" boo-button [variant]="key === actions[0] ? 'primary' : 'secondary'" size="sm"
                [disabled]="busy" (click)="action.emit({ key, item: stockTake })">
                <physio-icon [name]="meta[key].icon" [size]="14"></physio-icon>{{ meta[key].label }}
              </button>
            </div>
          </section>

          <section aria-label="Activity">
            <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-3 mt-0">Activity</h3>

            <div *ngIf="loading" class="flex items-center justify-center py-8" role="status" aria-label="Loading activity">
              <physio-icon name="loader-circle" [class]="'w-6 h-6 text-primary animate-spin'"></physio-icon>
            </div>

            <boo-error-state *ngIf="!loading && failed" title="We couldn't load the activity" [description]="null" (retry)="load()"></boo-error-state>
            <boo-empty-state *ngIf="!loading && !failed && !activities.length" icon="history" title="No activity yet"></boo-empty-state>

            <ol class="list-none m-0 p-0 relative border-s border-gray-200 ml-2 space-y-5" *ngIf="!loading && !failed && activities.length">
              <li *ngFor="let a of activities" class="ms-5 relative">
                <span class="absolute -start-[30px] top-0 w-5 h-5 rounded-full bg-primarySoft flex items-center justify-center">
                  <physio-icon [name]="icon(a.type)" [size]="11" class="text-primary"></physio-icon>
                </span>
                <p class="m-0 text-sm text-regular font-medium">{{ a.message }}</p>
                <p class="m-0 mt-0.5 text-xs text-secondary">{{ a.actor || 'System' }} · {{ a.occurredAt | date:'medium' }}</p>
              </li>
            </ol>
          </section>
        </div>
      </div>
    </drawer>
  `,
})
export class StockTakeDetailDrawerComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() stockTake: StockTake | null = null;
  @Input() access!: StockTakeAccess;
  @Input() busy = false;
  @Output() close = new EventEmitter<void>();
  @Output() action = new EventEmitter<{ key: StockTakeActionKey; item: StockTake }>();

  activities: StockTakeActivity[] = [];
  loading = false;
  failed = false;

  readonly meta = STOCK_TAKE_ACTION_META;
  readonly money = formatStockTakeValue;
  statusLabel = stockTakeStatusLabel;
  statusTone = stockTakeStatusTone;

  get actions(): StockTakeActionKey[] {
    return this.stockTake ? stockTakeActions(this.stockTake, this.access) : [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isOpen && this.stockTake && (changes['isOpen'] || changes['stockTake'])) this.load();
  }

  load(): void {
    const id = this.stockTake?.id;
    if (!id) return;
    this.loading = true;
    this.failed = false;
    this.activities = [];
    this.srv.getHistory(id).subscribe({
      next: res => {
        if (this.stockTake?.id !== id) return;
        this.failed = !res.success;
        this.activities = res.success ? res.data : [];
        this.loading = false;
      },
      error: () => { if (this.stockTake?.id === id) { this.failed = true; this.loading = false; } },
    });
  }

  icon(type: StockTakeActivityType): string {
    return ACTIVITY_ICON[type] ?? 'circle';
  }

  constructor(private srv: StockTakeService) { }
}
