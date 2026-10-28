import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from "@angular/core";
import {
  BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent, BooPaginationComponent, BooSearchFieldComponent,
  BooStatusBadgeComponent
} from '@physioboo/ui';
import { finalize } from "rxjs";
import { BooSelectComponent } from "../../../../../components/select/boo-select/boo-select.component";
import { LaboratoryService } from "../../../../../services/admin/laboratory.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { LabOrderRow, LabOrderStatus, LabPriority, LabVerificationStatus, SampleCollectionStatus } from "../../../../../shared/types/laboratory.types";
import { LaboratoryOrderDetailDrawerComponent } from "../drawers/laboratory-order-detail-drawer.component";
import { collectionTone, labStatusTone, priorityTone, statusLabel, verificationTone } from "../laboratory-display";

const PAGE_SIZE = 25;

@Component({
  selector: 'laboratory-orders-tab',
  standalone: true,
  imports: [
    SharedModule, BooSearchFieldComponent, BooSelectComponent, BooButtonComponent, BooPaginationComponent,
    BooStatusBadgeComponent, BooEmptyStateComponent, BooErrorStateComponent, LaboratoryOrderDetailDrawerComponent,
  ],
  template: `
    <div *ngIf="isLoading()" aria-hidden="true" class="h-64 rounded-xl border border-borderGray bg-surface animate-pulse"></div>
    <span *ngIf="isLoading()" class="sr-only" role="status">Loading orders…</span>

    <boo-error-state *ngIf="!isLoading() && error()" appearance="panel" icon="cloud-off" title="We couldn't load the orders"
      description="Check your connection and try again." retryLabel="Try again" (retry)="load()" />

    <ng-container *ngIf="!isLoading() && !error()">
      <div class="flex flex-wrap items-end gap-3 mb-4">
        <boo-search-field size="middle" class="w-full md:w-80" label="Search orders" placeholder="Order #, patient or MRN"
          [(ngModel)]="search" (ngModelChange)="applyFilters()" (clear)="search = ''; applyFilters()" />
        <boo-select class="w-44" label="Priority" [(ngModel)]="priorityFilter" (ngModelChange)="applyFilters()" [options]="priorityOptions" />
        <boo-select class="w-48" label="Lab status" [(ngModel)]="labStatusFilter" (ngModelChange)="applyFilters()" [options]="labStatusOptions" />
        <boo-select class="w-48" label="Collection" [(ngModel)]="collectionFilter" (ngModelChange)="applyFilters()" [options]="collectionOptions" />
        <boo-select class="w-52" label="Verification" [(ngModel)]="verificationFilter" (ngModelChange)="applyFilters()" [options]="verificationOptions" />
        <button boo-button variant="secondary" size="sm" type="button" [attr.aria-pressed]="groupByDepartment" (click)="toggleGroup()">
          Group by department
        </button>
      </div>

      <p *ngIf="truncated()" class="m-0 mb-3 text-xs text-secondary" role="status">
        Showing the newest {{ orders().length }} of {{ total() }} orders. Older orders are available from a patient's laboratory history.
      </p>

      <boo-empty-state *ngIf="!filtered().length" icon="flask-conical" appearance="panel"
        [title]="orders().length ? 'No orders match these filters' : 'No laboratory orders yet'"
        [description]="orders().length ? 'Try a different search or clear the filters.' : 'Orders placed by clinicians appear here.'">
        <button *ngIf="hasFilters()" boo-button variant="outline" size="sm" type="button" (click)="clearFilters()">Clear filters</button>
      </boo-empty-state>

      <ng-container *ngIf="filtered().length">
        <div *ngFor="let group of groups(); trackBy: trackByKey" class="bg-surface border border-gray-200 rounded-lg overflow-hidden mb-4">
          <h3 *ngIf="groupByDepartment" class="m-0 px-4 py-2 bg-gray-100 text-xs font-semibold text-gray-600 uppercase">{{ group.key || 'No department' }}</h3>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[1100px] text-sm">
              <thead class="bg-gray-100 text-gray-600 text-xs uppercase">
                <tr>
                  <th scope="col" class="px-4 py-3 text-left">Order #</th>
                  <th scope="col" class="px-4 py-3 text-left">Patient</th>
                  <th scope="col" class="px-4 py-3 text-left">MRN</th>
                  <th scope="col" class="px-4 py-3 text-left">Dept / Ward</th>
                  <th scope="col" class="px-4 py-3 text-left">Tests</th>
                  <th scope="col" class="px-4 py-3 text-left">Doctor</th>
                  <th scope="col" class="px-4 py-3 text-left">Priority</th>
                  <th scope="col" class="px-4 py-3 text-left">Collection</th>
                  <th scope="col" class="px-4 py-3 text-left">Lab status</th>
                  <th scope="col" class="px-4 py-3 text-left">Verification</th>
                  <th scope="col" class="px-4 py-3 text-left">Ordered</th>
                  <th scope="col" class="px-4 py-3 text-left"><span class="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr *ngFor="let o of group.items; trackBy: trackById" class="hover:bg-gray-50">
                  <td class="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{{ o.orderNumber }}</td>
                  <td class="px-4 py-3">{{ o.patientName }}</td>
                  <td class="px-4 py-3 text-gray-500">{{ o.mrn }}</td>
                  <td class="px-4 py-3 text-gray-500">{{ deptWard(o) }}</td>
                  <td class="px-4 py-3 text-gray-500 max-w-[16rem] truncate" [attr.title]="testNames(o)">{{ testNames(o) }}</td>
                  <td class="px-4 py-3 text-gray-500">{{ o.orderingDoctorName || '—' }}</td>
                  <td class="px-4 py-3"><boo-status-badge [label]="o.priority" [tone]="priority(o)" /></td>
                  <td class="px-4 py-3"><boo-status-badge [label]="label(o.collectionStatus)" [tone]="collection(o)" /></td>
                  <td class="px-4 py-3"><boo-status-badge [label]="label(o.labStatus)" [tone]="labStatus(o)" /></td>
                  <td class="px-4 py-3"><boo-status-badge [label]="label(o.verificationStatus)" [tone]="verification(o)" /></td>
                  <td class="px-4 py-3 text-gray-500 whitespace-nowrap">{{ o.orderTime | date: 'MMM d, y, HH:mm' }}</td>
                  <td class="px-4 py-3">
                    <button boo-button variant="link" size="sm" type="button" (click)="openDetail(o)" [attr.aria-label]="'Open order ' + o.orderNumber">Details</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xs text-secondary tabular-nums" role="status">{{ rangeLabel() }}</span>
          <boo-pagination *ngIf="totalPages() > 1" [page]="page()" [totalPages]="totalPages()" appearance="labelled" (pageChange)="page.set($event)" />
        </div>
      </ng-container>
    </ng-container>

    <laboratory-order-detail-drawer [isOpen]="detailOpen()" [order]="selected()" (close)="closeDetail()"
      (viewPatient)="closeDetail(); viewPatient.emit($event)" />
  `,
})
export class LaboratoryOrdersTabComponent implements OnChanges {
  @Input() refreshKey = 0;
  @Output() viewPatient = new EventEmitter<string>();

  isLoading = signal(true);
  error = signal(false);
  orders = signal<LabOrderRow[]>([]);
  total = signal(0);
  filtered = signal<LabOrderRow[]>([]);
  page = signal(1);
  selected = signal<LabOrderRow | null>(null);
  detailOpen = signal(false);

  groupByDepartment = false;
  search = '';
  priorityFilter: LabPriority | null = null;
  labStatusFilter: LabOrderStatus | null = null;
  collectionFilter: SampleCollectionStatus | null = null;
  verificationFilter: LabVerificationStatus | null = null;

  readonly label = statusLabel;
  readonly priority = (o: LabOrderRow) => priorityTone(o.priority);
  readonly collection = (o: LabOrderRow) => collectionTone(o.collectionStatus);
  readonly labStatus = (o: LabOrderRow) => labStatusTone(o.labStatus);
  readonly verification = (o: LabOrderRow) => verificationTone(o.verificationStatus);

  readonly priorityOptions: { label: string; value: LabPriority | null }[] = [
    { label: 'All priorities', value: null },
    { label: 'Routine', value: 'Routine' }, { label: 'Urgent', value: 'Urgent' }, { label: 'Stat', value: 'Stat' },
  ];
  readonly labStatusOptions: { label: string; value: LabOrderStatus | null }[] = [
    { label: 'All lab statuses', value: null },
    { label: 'Ordered', value: 'Ordered' }, { label: 'Collected', value: 'Collected' }, { label: 'Received', value: 'Received' },
    { label: 'Processing', value: 'Processing' }, { label: 'Quality check', value: 'QualityCheck' },
    { label: 'Completed', value: 'Completed' }, { label: 'Cancelled', value: 'Cancelled' },
  ];
  readonly collectionOptions: { label: string; value: SampleCollectionStatus | null }[] = [
    { label: 'All collection', value: null },
    { label: 'Not collected', value: 'NotCollected' }, { label: 'Collected', value: 'Collected' },
    { label: 'In transit', value: 'InTransit' }, { label: 'Received', value: 'Received' }, { label: 'Rejected', value: 'Rejected' },
  ];
  readonly verificationOptions: { label: string; value: LabVerificationStatus | null }[] = [
    { label: 'All verification', value: null },
    { label: 'Pending verification', value: 'PendingVerification' }, { label: 'Verified', value: 'Verified' },
    { label: 'Rejected', value: 'Rejected' }, { label: 'Returned for review', value: 'ReturnedForReview' },
  ];

  constructor(private srv: LaboratoryService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refreshKey']) this.load();
  }

  load(): void {
    if (!this.orders().length) this.isLoading.set(true);
    this.error.set(false);
    this.srv.getOrders().pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: res => {
        if (!res.success) { this.error.set(true); return; }
        this.orders.set(res.data.items);
        this.total.set(res.data.totalCount);
        this.applyFilters(false);
      },
      error: () => this.error.set(true),
    });
  }

  truncated(): boolean { return this.total() > this.orders().length; }

  hasFilters(): boolean {
    return !!(this.search || this.priorityFilter || this.labStatusFilter || this.collectionFilter || this.verificationFilter);
  }

  applyFilters(resetPage = true): void {
    const q = this.search.trim().toLowerCase();
    this.filtered.set(this.orders().filter(o =>
      (!this.priorityFilter || o.priority === this.priorityFilter) &&
      (!this.labStatusFilter || o.labStatus === this.labStatusFilter) &&
      (!this.collectionFilter || o.collectionStatus === this.collectionFilter) &&
      (!this.verificationFilter || o.verificationStatus === this.verificationFilter) &&
      (!q || o.orderNumber.toLowerCase().includes(q) || o.patientName.toLowerCase().includes(q) || o.mrn.toLowerCase().includes(q))
    ));
    if (resetPage) this.page.set(1);
    else this.page.set(Math.min(this.page(), this.totalPages()));
  }

  clearFilters(): void {
    this.search = '';
    this.priorityFilter = null;
    this.labStatusFilter = null;
    this.collectionFilter = null;
    this.verificationFilter = null;
    this.applyFilters();
  }

  toggleGroup(): void { this.groupByDepartment = !this.groupByDepartment; }

  totalPages(): number { return Math.max(1, Math.ceil(this.filtered().length / PAGE_SIZE)); }

  pageItems(): LabOrderRow[] {
    const start = (this.page() - 1) * PAGE_SIZE;
    return this.filtered().slice(start, start + PAGE_SIZE);
  }

  rangeLabel(): string {
    const count = this.filtered().length;
    const start = (this.page() - 1) * PAGE_SIZE + 1;
    return `${start}–${Math.min(count, start + PAGE_SIZE - 1)} of ${count} orders`;
  }

  groups(): { key: string; items: LabOrderRow[] }[] {
    const items = this.pageItems();
    if (!this.groupByDepartment) return [{ key: 'all', items }];
    const map = new Map<string, LabOrderRow[]>();
    for (const o of items) map.set(o.departmentName, [...(map.get(o.departmentName) ?? []), o]);
    return Array.from(map.entries()).map(([key, group]) => ({ key, items: group }));
  }

  deptWard(o: LabOrderRow): string {
    return [o.departmentName, o.wardName].filter(Boolean).join(' / ') || '—';
  }

  testNames(o: LabOrderRow): string {
    return o.tests.map(t => t.testName).join(', ');
  }

  openDetail(o: LabOrderRow): void {
    this.selected.set(o);
    this.detailOpen.set(true);
  }

  closeDetail(): void { this.detailOpen.set(false); }

  trackById(_: number, o: LabOrderRow): string { return o.id; }
  trackByKey(_: number, g: { key: string }): string { return g.key; }
}
