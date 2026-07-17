import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../components/ui/empty-state.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../components/ui/status-badge.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { DispenseQueueItem, DispenseQueueStatus } from "../../../../shared/types/dispensing.types";

@Component({
    selector: 'dispense-queue-panel',
    standalone: true,
    imports: [SharedModule, BooIconComponent, StatusBadgeComponent, EmptyStateComponent],
    template: `
    <div class="h-full flex flex-col bg-surface rounded-2 border border-borderGray/60 overflow-hidden">
      <div class="p-3 border-b border-borderGray/60 flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold text-regular">Prescription Queue</h2>
          <button type="button" (click)="autoRefreshChange.emit(!autoRefresh)" [title]="autoRefresh ? 'Auto-refresh on' : 'Auto-refresh off'"
            class="w-7 h-7 rounded-1.5 flex items-center justify-center" [ngClass]="autoRefresh ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'">
            <boo-icon name="refresh-cw" [size]="14"></boo-icon>
          </button>
        </div>
        <div class="relative">
          <boo-icon name="search" [size]="14" iconClass="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"></boo-icon>
          <input type="text" [ngModel]="search" (ngModelChange)="searchChange.emit($event)" placeholder="Search patient, MRN, RX number..."
            class="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary" />
        </div>
        <div class="flex items-center gap-1 overflow-x-auto" role="tablist">
          <button type="button" *ngFor="let f of filters" (click)="statusFilterChange.emit(f.value)" role="tab"
            [attr.aria-selected]="statusFilter === f.value"
            class="px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
            [ngClass]="statusFilter === f.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
            {{ f.label }}
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-2 space-y-2">
        <boo-empty-state *ngIf="!items.length" icon="inbox" title="No prescriptions waiting" description="New prescriptions will appear here as they arrive."></boo-empty-state>

        <button type="button" *ngFor="let item of items" (click)="select.emit(item)"
          class="w-full text-left p-3 rounded-1.5 border transition-colors"
          [ngClass]="item.queueId === selectedQueueId ? 'border-primary bg-primary/5' : 'border-borderGray/60 hover:border-primary/40 hover:bg-gray-50'">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-semibold text-gray-500">#{{ item.queueNumber }} · {{ item.prescriptionNumber }}</span>
            <span class="w-1.5 h-1.5 rounded-full shrink-0" [ngClass]="priorityDotClass(item.priority)" [title]="item.priority + ' priority'"></span>
          </div>
          <p class="text-sm font-semibold text-regular leading-tight">{{ item.patientName }}</p>
          <p class="text-[11px] text-secondary mb-1.5">{{ item.mrn }} · {{ item.wardOrClinic }}</p>
          <div class="flex items-center justify-between">
            <span class="text-[11px] text-secondary">{{ item.prescribingDoctor }} · {{ item.medicationCount }} meds</span>
            <boo-status-badge [label]="item.status" [tone]="statusTone(item.status)" dotted></boo-status-badge>
          </div>
        </button>
      </div>
    </div>
  `,
})
export class DispenseQueuePanelComponent {
    @Input() items: DispenseQueueItem[] = [];
    @Input() selectedQueueId: string | null = null;
    @Input() search = '';
    @Input() statusFilter: DispenseQueueStatus | null = null;
    @Input() autoRefresh = true;

    @Output() select = new EventEmitter<DispenseQueueItem>();
    @Output() searchChange = new EventEmitter<string>();
    @Output() statusFilterChange = new EventEmitter<DispenseQueueStatus | null>();
    @Output() autoRefreshChange = new EventEmitter<boolean>();

    readonly filters: { label: string; value: DispenseQueueStatus | null }[] = [
        { label: 'All', value: null },
        { label: 'Waiting', value: 'Waiting' },
        { label: 'Verifying', value: 'Verifying' },
        { label: 'On Hold', value: 'OnHold' },
        { label: 'Completed', value: 'Completed' },
    ];

    priorityDotClass(priority: string): string {
        if (priority === 'Critical') return 'bg-rose-500';
        if (priority === 'High') return 'bg-amber-500';
        return 'bg-gray-300';
    }

    statusTone(status: DispenseQueueStatus): BadgeTone {
        switch (status) {
            case 'Waiting': return 'neutral';
            case 'Verifying': return 'primary';
            case 'Preparing':
            case 'Dispensing': return 'warning';
            case 'Completed': return 'success';
            case 'Cancelled': return 'danger';
            case 'OnHold': return 'warning';
            default: return 'neutral';
        }
    }
}
