import { Component, EventEmitter, Input, OnChanges, Output, signal } from "@angular/core";
import { BooButtonAdminComponent } from "../../../../../components/button/boo-button-admin/boo-button-admin.component";
import { BooBadgeTone, BooEmptyStateComponent, BooErrorStateComponent, BooInputComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { BooDatepickerComponent } from "../../../../../components/date-picker/boo-date-picker.component";
import { BooSelectComponent } from "../../../../../components/select/boo-select/boo-select.component";
import { TreatmentSheetService } from "../../../../../services/admin/treatment-sheet.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { CreateTreatmentOrderRequest, OrderPriority, OrderStatus, OrderType, TreatmentOrder } from "../../../../../shared/types/treatment-sheet.types";
import { toLocalDateTime } from "../../admission/admission.utils";

interface OrderDraft {
  orderName: string;
  orderType: OrderType | null;
  priority: OrderPriority | null;
  frequency: string;
  startDate: string;
  startTime: string;
}

@Component({
  selector: 'treatment-orders-tab',
  standalone: true,
  imports: [SharedModule, BooButtonAdminComponent, BooDatepickerComponent, BooInputComponent, BooSelectComponent, BooStatusBadgeComponent, BooEmptyStateComponent, BooErrorStateComponent],
  template: `
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <boo-input label="Search orders..." size="small" (search)="onSearch($event)"></boo-input>
      <boo-select size="small" label="Order Type" [(ngModel)]="typeFilter" [options]="typeOptions" bindLabel="label" bindValue="value"></boo-select>
      <boo-select size="small" label="Status" [(ngModel)]="statusFilter" [options]="statusOptions" bindLabel="label" bindValue="value"></boo-select>
      <boo-select size="small" label="Priority" [(ngModel)]="priorityFilter" [options]="priorityOptions" bindLabel="label" bindValue="value"></boo-select>
      <button type="button" (click)="groupByCategory = !groupByCategory" [attr.aria-pressed]="groupByCategory"
        class="px-3 py-2 rounded-lg text-xs font-semibold border transition-colors"
        [ngClass]="groupByCategory ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-gray-200 text-gray-600'">
        Group by Category
      </button>
      <boo-button-admin *ngIf="canWrite" (click)="toggleNew()" textColor="white" padding="8px 12px" [fontSize]="12" [radius]="8" fontWeight="600" class="ml-auto">
        {{ newOpen() ? 'Close form' : 'New order' }}
      </boo-button-admin>
    </div>

    <form *ngIf="newOpen()" (ngSubmit)="createOrder()" class="mb-4 rounded-lg border border-dashed border-amber-400 bg-amber-50/40 p-4" aria-label="New treatment order">
      <div class="flex items-center gap-2 mb-3">
        <h3 class="text-sm font-semibold text-primary m-0">New order</h3>
        <boo-status-badge label="Unsaved draft" tone="warning" [dotted]="true"></boo-status-badge>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-6 gap-3 items-start">
        <div class="md:col-span-3">
          <boo-input [(ngModel)]="draft.orderName" name="orderName" [maxlength]="255" label="Order name" required size="small"></boo-input>
        </div>
        <boo-select [(ngModel)]="draft.orderType" name="orderType" label="Type" required [options]="draftTypeOptions" size="small"></boo-select>
        <boo-select [(ngModel)]="draft.priority" name="priority" label="Priority" required [options]="draftPriorityOptions" size="small"></boo-select>
        <boo-input [(ngModel)]="draft.frequency" name="frequency" [maxlength]="64" label="Frequency" size="small"></boo-input>
        <div class="md:col-span-2">
          <boo-datepicker [(ngModel)]="draft.startDate" name="startDate" label="Start date" required size="small"></boo-datepicker>
        </div>
        <div class="md:col-span-2">
          <boo-input [(ngModel)]="draft.startTime" name="startTime" type="time" label="Start time" required size="small"></boo-input>
        </div>
      </div>
      <p *ngIf="submitted() && validationMessage()" class="text-xs text-red-600 mt-2" role="alert">{{ validationMessage() }}</p>
      <div class="flex justify-end gap-2 mt-3">
        <boo-button-admin (click)="discardDraft()" [disabled]="saving()" background="transparent" textColor="#55434B" [border]="{ width: 1, color: '#E3D5DA' }" padding="8px 12px" [fontSize]="12" [radius]="8">Discard</boo-button-admin>
        <boo-button-admin (click)="createOrder()" [disabled]="saving()" [loading]="saving()" textColor="white" padding="8px 12px" [fontSize]="12" [radius]="8" fontWeight="600">{{ saving() ? 'Saving…' : 'Create order' }}</boo-button-admin>
      </div>
    </form>

    <div *ngIf="isLoading()" class="flex items-center justify-center py-16" aria-live="polite">
      <physio-icon name="loader" [class]="'w-6 h-6 text-primary animate-spin'"></physio-icon>
    </div>

    <boo-error-state *ngIf="!isLoading() && loadError()" title="Couldn't load orders" [description]="loadError()" appearance="panel" (retry)="load()"></boo-error-state>

    <ng-container *ngIf="!isLoading() && !loadError()">
      <div *ngIf="!orders().length"><boo-empty-state icon="clipboard" title="No orders recorded" description="Orders recorded for this stay will appear here."></boo-empty-state></div>
      <div *ngIf="orders().length && !filtered().length"><boo-empty-state icon="clipboard" title="No matching orders" description="No order matches the current filters."></boo-empty-state></div>

      <div *ngFor="let group of groupedOrders()" class="bg-surface border border-gray-200 rounded-lg overflow-x-auto mb-4">
        <div *ngIf="groupByCategory" class="px-4 py-2 bg-gray-100 text-xs font-semibold text-gray-600 uppercase">{{ group.key }}</div>
        <table class="w-full text-sm">
          <caption class="sr-only">Saved treatment orders</caption>
          <thead class="bg-gray-100 text-gray-600 text-xs uppercase">
            <tr>
              <th scope="col" class="px-4 py-3 text-left">Order Type</th>
              <th scope="col" class="px-4 py-3 text-left">Order Name</th>
              <th scope="col" class="px-4 py-3 text-left">Priority</th>
              <th scope="col" class="px-4 py-3 text-left">Frequency</th>
              <th scope="col" class="px-4 py-3 text-left">Start</th>
              <th scope="col" class="px-4 py-3 text-left">End</th>
              <th scope="col" class="px-4 py-3 text-left">Doctor</th>
              <th scope="col" class="px-4 py-3 text-left">Status</th>
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
      <p *ngIf="truncated()" class="text-xs text-secondary">Showing the {{ orders().length }} most recent of {{ total() }} orders.</p>
    </ng-container>
  `,
})
export class TreatmentOrdersTabComponent implements OnChanges {
  @Input({ required: true }) patientId!: string;
  @Input() canWrite = false;
  /** Emitted after an order was saved so the page can refresh its counters. */
  @Output() changed = new EventEmitter<void>();

  isLoading = signal(true);
  loadError = signal<string | null>(null);
  orders = signal<TreatmentOrder[]>([]);
  total = signal(0);
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

  /** The new-order form needs an explicit type and priority, so it offers the filter options minus "All". */
  readonly draftTypeOptions = this.typeOptions.slice(1);
  readonly draftPriorityOptions = this.priorityOptions.slice(1);

  newOpen = signal(false);
  saving = signal(false);
  submitted = signal(false);
  draft = this.emptyDraft();

  constructor(private srv: TreatmentSheetService, private toastSrv: ToastService) { }

  private emptyDraft(): OrderDraft {
    return { orderName: '', orderType: null, priority: null, frequency: '', startDate: '', startTime: '' };
  }

  toggleNew(): void {
    this.newOpen.set(!this.newOpen());
  }

  discardDraft(): void {
    this.draft = this.emptyDraft();
    this.submitted.set(false);
    this.newOpen.set(false);
  }

  /** First problem the backend would reject, so the user fixes it without a round trip. */
  validationMessage(): string | null {
    const d = this.draft;
    if (!d.orderName.trim()) return 'Enter the order name.';
    if (!d.orderType) return 'Choose the order type.';
    if (!d.priority) return 'Choose the priority.';
    if (!d.startDate || !d.startTime) return 'Enter the start date and time.';
    return null;
  }

  createOrder(): void {
    if (this.saving()) return;
    this.submitted.set(true);
    if (this.validationMessage()) return;

    const d = this.draft;
    // Status is left out: the backend records a new order as Active.
    const request: CreateTreatmentOrderRequest = {
      orderType: d.orderType!,
      orderName: d.orderName.trim(),
      priority: d.priority!,
      frequency: d.frequency.trim() || null,
      startTime: toLocalDateTime(d.startDate, d.startTime),
      endTime: null,
    };
    this.saving.set(true);
    this.srv.createOrder(this.patientId, request).subscribe({
      next: res => {
        this.saving.set(false);
        if (!res.success) { this.toastSrv.error('Unable to create the order'); return; }
        if (res.data) {
          this.orders.set([res.data, ...this.orders()]);
          this.total.update(t => t + 1);
        }
        this.discardDraft();
        this.toastSrv.success('Order created');
        this.changed.emit();
      },
      // The draft stays as typed so the user can retry.
      error: () => { this.saving.set(false); this.toastSrv.error('Unable to create the order'); }
    });
  }

  ngOnChanges(): void {
    this.load();
  }

  load(): void {
    if (!this.patientId) return;
    this.isLoading.set(true);
    this.loadError.set(null);
    this.srv.getOrders(this.patientId).subscribe({
      next: (res) => {
        if (res.success) {
          this.orders.set(res.data.items);
          this.total.set(res.data.totalCount);
        } else {
          this.loadError.set('The orders could not be loaded.');
        }
        this.isLoading.set(false);
      },
      error: () => { this.loadError.set('The orders could not be loaded.'); this.isLoading.set(false); },
    });
  }

  truncated(): boolean { return this.total() > this.orders().length; }

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
    if (!list.length) return [];
    if (!this.groupByCategory) return [{ key: 'all', items: list }];
    const map = new Map<string, TreatmentOrder[]>();
    for (const o of list) map.set(o.orderType, [...(map.get(o.orderType) ?? []), o]);
    return Array.from(map.entries()).map(([key, items]) => ({ key, items }));
  }

  priorityTone(priority: OrderPriority): BooBadgeTone {
    switch (priority) {
      case 'Stat': return 'danger';
      case 'Urgent': return 'warning';
      default: return 'neutral';
    }
  }

  statusTone(status: OrderStatus): BooBadgeTone {
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
