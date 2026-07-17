import { Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { DrawerComponent } from "../../../../components/drawer/drawer.component";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../components/ui/empty-state.component";
import { StatusBadgeComponent } from "../../../../components/ui/status-badge.component";
import { StockTakeService } from "../../../../services/admin/stock-take.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { StockTake, StockTakeActivity, StockTakeActivityType, stockTakeStatusLabel, stockTakeStatusTone } from "../../../../shared/types/stock-take.types";

const ACTIVITY_ICON: Record<StockTakeActivityType, string> = {
    Created: 'plus-circle', Assigned: 'user-plus', Started: 'play', ItemCounted: 'clipboard-list',
    Completed: 'circle-check', Approved: 'circle-check-big', Rejected: 'circle-x', Cancelled: 'ban',
};

@Component({
    selector: 'stock-take-history-drawer',
    standalone: true,
    imports: [SharedModule, DrawerComponent, BooIconComponent, EmptyStateComponent, StatusBadgeComponent],
    template: `
    <drawer [isOpen]="isOpen" [isShowDialog]="true" [width]="460" (close)="close.emit()">
      <div class="flex flex-col h-full bg-surface">
        <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-surface z-10">
          <div>
            <h2 class="text-xl font-bold text-primary leading-none mb-1">History — {{ stockTake?.code }}</h2>
            <p class="text-sm text-secondary m-0" *ngIf="stockTake">
              <boo-status-badge [label]="statusLabel(stockTake.status)" [tone]="statusTone(stockTake.status)" dotted></boo-status-badge>
            </p>
          </div>
          <button (click)="close.emit()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100" aria-label="Close">
            <boo-icon name="x" [size]="20"></boo-icon>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-6" custom-scrollbar>
          <div *ngIf="stockTake?.rejectionReason" class="mb-4 p-3 rounded-1.5 bg-rose-50 border border-rose-100 text-sm text-rose-700">
            <span class="font-semibold">Rejection reason:</span> {{ stockTake?.rejectionReason }}
          </div>

          <boo-empty-state *ngIf="!loading && !activities.length" icon="history" title="No history yet"></boo-empty-state>

          <div *ngIf="loading" class="flex items-center justify-center py-10">
            <boo-icon name="loader-circle" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
          </div>

          <ol class="relative border-s border-gray-100 ml-2 space-y-6" *ngIf="!loading && activities.length">
            <li *ngFor="let a of activities" class="ms-5">
              <span class="absolute -start-[9px] w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                <boo-icon [name]="icon(a.type)" [size]="10" iconClass="text-primary"></boo-icon>
              </span>
              <p class="text-sm text-regular font-medium">{{ a.message }}</p>
              <p class="text-xs text-secondary mt-0.5">{{ a.actor }} · {{ a.occurredAt | date:'medium' }}</p>
            </li>
          </ol>
        </div>
      </div>
    </drawer>
  `,
})
export class StockTakeHistoryDrawerComponent implements OnChanges {
    @Input() isOpen = false;
    @Input() stockTake: StockTake | null = null;
    @Output() close = new EventEmitter<void>();

    activities: StockTakeActivity[] = [];
    loading = false;

    statusLabel = stockTakeStatusLabel;
    statusTone = stockTakeStatusTone;

    constructor(private srv: StockTakeService) { }

    ngOnChanges(): void {
        if (this.isOpen && this.stockTake) this.load(this.stockTake.id);
    }

    private load(id: string): void {
        this.loading = true;
        this.srv.getHistory(id).subscribe({
            next: res => { if (res.success) this.activities = res.data; this.loading = false; },
            error: () => this.loading = false,
        });
    }

    icon(type: StockTakeActivityType): string {
        return ACTIVITY_ICON[type] ?? 'circle';
    }
}
