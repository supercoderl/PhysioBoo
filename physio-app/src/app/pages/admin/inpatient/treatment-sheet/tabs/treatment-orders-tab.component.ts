import { Component, Input, OnChanges, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../components/input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../../components/select/boo-select/boo-select.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../../components/ui/status-badge.component";
import { TreatmentSheetService } from "../../../../../services/admin/treatment-sheet.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { OrderPriority, OrderStatus, OrderType, TreatmentOrder } from "../../../../../shared/types/treatment-sheet.types";

@Component({
  selector: 'treatment-orders-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, BooInputComponent, BooSelectComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <boo-input label="Search orders..." size="small" (search)="onSearch($event)"></boo-input>
      <boo-select label="Order Type" [(ngModel)]="typeFilter" [options]="typeOptions" bindLabel="label" bindValue="value"></boo-select>
      <boo-select label="Status" [(ngModel)]="statusFilter" [options]="statusOptions" bindLabel="label" bindValue="value"></boo-select>
      <boo-select label="Priority" [(ngModel)]="priorityFilter" [options]="priorityOptions" bindLabel="label" bindValue="value"></boo-select>
      <button (click)="groupByCategory = !groupByCategory"
        class="px-3 py-2 rounded-lg text-xs font-semibold border transition-colors"
        [ngClass]="groupByCategory ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-gray-200 text-gray-600'">
        Group by Category
      </button>
    </div>

    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading() && !filtered().length"><boo-empty-state icon="clipboard-list" title="No matching orders"></boo-empty-state></div>

    <ng-container *ngIf="!isLoading() && filtered().length">
      <div *ngFor="let group of groupedOrders()" class="bg-surface border border-gray-200 rounded-lg overflow-hidden mb-4">
        <div *ngIf="groupByCategory" class="px-4 py-2 bg-gray-100 text-xs font-semibold text-gray-600 uppercase">{{ group.key }}</div>
        <table class="w-full text-sm">
          <thead class="bg-gray-100 text-gray-600 text-xs uppercase">
            <tr>
              <th class="px-4 py-3 text-left">Order Type</th>
              <th class="px-4 py-3 text-left">Order Name</th>
              <th class="px-4 py-3 text-left">Priority</th>
              <th class="px-4 py-3 text-left">Frequency</th>
              <th class="px-4 py-3 text-left">Start</th>
              <th class="px-4 py-3 text-left">End</th>
              <th class="px-4 py-3 text-left">Doctor</th>
              <th class="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr *ngFor="let o of group.items">
              <td class="px-4 py-3">{{ o.orderType }}</td>
              <td class="px-4 py-3 font-medium text-gray-800">{{ o.orderName }}</td>
              <td class="px-4 py-3"><boo-status-badge [label]="o.priority" [tone]="priorityTone(o.priority)"></boo-status-badge></td>
              <td class="px-4 py-3">{{ o.frequency ?? '—' }}</td>
              <td class="px-4 py-3">{{ o.startTime | date:'short' }}</td>
              <td class="px-4 py-3">{{ o.endTime ? (o.endTime | date:'short') : '—' }}</td>
              <td class="px-4 py-3 text-gray-500">{{ o.orderingDoctorName }}</td>
              <td class="px-4 py-3"><boo-status-badge [label]="o.status" [tone]="statusTone(o.status)"></boo-status-badge></td>
            </tr>
          </tbody>
        </table>
      </div>
    </ng-container>
  `,
})
export class TreatmentOrdersTabComponent implements OnChanges {
  @Input({ required: true }) patientId!: string;

  isLoading = signal(true);
  orders = signal<TreatmentOrder[]>([]);
  groupByCategory = false;

  search = '';
  typeFilter: OrderType | null = null;
  statusFilter: OrderStatus | null = null;
  priorityFilter: OrderPriority | null = null;

  readonly typeOptions: { label: string; value: OrderType | null }[] = [
    { label: 'All Types', value: null },
    { label: 'Doctor', value: 'Doctor' }, { label: 'Medication', value: 'Medication' },
    { label: 'Procedure', value: 'Procedure' }, { label: 'Lab', value: 'Lab' },
    { label: 'Imaging', value: 'Imaging' }, { label: 'Nursing', value: 'Nursing' },
  ];
  readonly statusOptions: { label: string; value: OrderStatus | null }[] = [
    { label: 'All Statuses', value: null },
    { label: 'Active', value: 'Active' }, { label: 'Pending', value: 'Pending' },
    { label: 'Completed', value: 'Completed' }, { label: 'On Hold', value: 'OnHold' }, { label: 'Cancelled', value: 'Cancelled' },
  ];
  readonly priorityOptions: { label: string; value: OrderPriority | null }[] = [
    { label: 'All Priorities', value: null },
    { label: 'Routine', value: 'Routine' }, { label: 'Urgent', value: 'Urgent' }, { label: 'Stat', value: 'Stat' },
  ];

  constructor(private srv: TreatmentSheetService) { }

  ngOnChanges(): void {
    if (!this.patientId) return;
    this.isLoading.set(true);
    this.srv.getOrders(this.patientId).subscribe({
      next: (res) => { if (res.success) this.orders.set(res.data.items); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  onSearch(query: string): void { this.search = query; }

  filtered(): TreatmentOrder[] {
    let list = this.orders();
    if (this.typeFilter) list = list.filter(o => o.orderType === this.typeFilter);
    if (this.statusFilter) list = list.filter(o => o.status === this.statusFilter);
    if (this.priorityFilter) list = list.filter(o => o.priority === this.priorityFilter);
    if (this.search) {
      const q = this.search.toLowerCase();
      list = list.filter(o => o.orderName.toLowerCase().includes(q) || o.orderingDoctorName.toLowerCase().includes(q));
    }
    return list;
  }

  groupedOrders(): { key: string; items: TreatmentOrder[] }[] {
    const list = this.filtered();
    if (!this.groupByCategory) return [{ key: 'all', items: list }];
    const map = new Map<string, TreatmentOrder[]>();
    for (const o of list) map.set(o.orderType, [...(map.get(o.orderType) ?? []), o]);
    return Array.from(map.entries()).map(([key, items]) => ({ key, items }));
  }

  priorityTone(priority: OrderPriority): BadgeTone {
    switch (priority) {
      case 'Stat': return 'danger';
      case 'Urgent': return 'warning';
      default: return 'neutral';
    }
  }

  statusTone(status: OrderStatus): BadgeTone {
    switch (status) {
      case 'Active': return 'success';
      case 'Completed': return 'success';
      case 'Pending': return 'primary';
      case 'OnHold': return 'warning';
      case 'Cancelled': return 'danger';
      default: return 'neutral';
    }
  }
}
