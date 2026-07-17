import { Component, EventEmitter, OnInit, Output, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../components/input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../../components/select/boo-select/boo-select.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../../components/ui/status-badge.component";
import { LaboratoryService } from "../../../../../services/admin/laboratory.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { LabOrderRow, LabOrderStatus, LabPriority, LabVerificationStatus, SampleCollectionStatus } from "../../../../../shared/types/laboratory.types";

@Component({
  selector: 'laboratory-orders-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, BooInputComponent, BooSelectComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <boo-input label="Search order #, patient, MRN..." size="small" (search)="onSearch($event)"></boo-input>
      <boo-select label="Priority" [(ngModel)]="priorityFilter" [options]="priorityOptions" bindLabel="label" bindValue="value"></boo-select>
      <boo-select label="Lab Status" [(ngModel)]="labStatusFilter" [options]="labStatusOptions" bindLabel="label" bindValue="value"></boo-select>
      <boo-select label="Collection Status" [(ngModel)]="collectionFilter" [options]="collectionOptions" bindLabel="label" bindValue="value"></boo-select>
      <boo-select label="Verification" [(ngModel)]="verificationFilter" [options]="verificationOptions" bindLabel="label" bindValue="value"></boo-select>
      <button (click)="groupByDepartment = !groupByDepartment"
        class="px-3 py-2 rounded-lg text-xs font-semibold border transition-colors"
        [ngClass]="groupByDepartment ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-gray-200 text-gray-600'">
        Group by Department
      </button>
    </div>

    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading() && !filtered().length">
      <boo-empty-state icon="flask-conical" title="No orders match these filters">
        <button (click)="clearFilters()" class="text-primary text-xs font-semibold hover:underline">Clear Filters</button>
      </boo-empty-state>
    </div>

    <ng-container *ngIf="!isLoading() && filtered().length">
      <div *ngFor="let group of groupedOrders()" class="bg-surface border border-gray-200 rounded-lg overflow-hidden mb-4">
        <div *ngIf="groupByDepartment" class="px-4 py-2 bg-gray-100 text-xs font-semibold text-gray-600 uppercase">{{ group.key }}</div>
        <table class="w-full text-sm">
          <thead class="bg-gray-100 text-gray-600 text-xs uppercase">
            <tr>
              <th class="px-4 py-3 text-left">Order #</th>
              <th class="px-4 py-3 text-left">Patient</th>
              <th class="px-4 py-3 text-left">MRN</th>
              <th class="px-4 py-3 text-left">Dept / Ward</th>
              <th class="px-4 py-3 text-left">Tests</th>
              <th class="px-4 py-3 text-left">Doctor</th>
              <th class="px-4 py-3 text-left">Priority</th>
              <th class="px-4 py-3 text-left">Collection</th>
              <th class="px-4 py-3 text-left">Lab Status</th>
              <th class="px-4 py-3 text-left">Verification</th>
              <th class="px-4 py-3 text-left">Order Time</th>
              <th class="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr *ngFor="let o of group.items" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-gray-800">{{ o.orderNumber }}</td>
              <td class="px-4 py-3">{{ o.patientName }}</td>
              <td class="px-4 py-3 text-gray-500">{{ o.mrn }}</td>
              <td class="px-4 py-3 text-gray-500">{{ o.departmentName }} / {{ o.wardName }}</td>
              <td class="px-4 py-3 text-gray-500">{{ testNames(o) }}</td>
              <td class="px-4 py-3 text-gray-500">{{ o.orderingDoctorName }}</td>
              <td class="px-4 py-3"><boo-status-badge [label]="o.priority" [tone]="priorityTone(o.priority)"></boo-status-badge></td>
              <td class="px-4 py-3"><boo-status-badge [label]="o.collectionStatus" [tone]="collectionTone(o.collectionStatus)"></boo-status-badge></td>
              <td class="px-4 py-3"><boo-status-badge [label]="o.labStatus" [tone]="labStatusTone(o.labStatus)"></boo-status-badge></td>
              <td class="px-4 py-3"><boo-status-badge [label]="o.verificationStatus" [tone]="verificationTone(o.verificationStatus)"></boo-status-badge></td>
              <td class="px-4 py-3 text-gray-500">{{ o.orderTime | date:'short' }}</td>
              <td class="px-4 py-3">
                <button (click)="viewPatient.emit(o.mrn)" class="text-primary text-xs font-semibold hover:underline">View</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </ng-container>
  `,
})
export class LaboratoryOrdersTabComponent implements OnInit {
  @Output() viewPatient = new EventEmitter<string>();

  isLoading = signal(true);
  orders = signal<LabOrderRow[]>([]);
  groupByDepartment = false;

  search = '';
  priorityFilter: LabPriority | null = null;
  labStatusFilter: LabOrderStatus | null = null;
  collectionFilter: SampleCollectionStatus | null = null;
  verificationFilter: LabVerificationStatus | null = null;

  readonly priorityOptions: { label: string; value: LabPriority | null }[] = [
    { label: 'All Priorities', value: null },
    { label: 'Routine', value: 'Routine' }, { label: 'Urgent', value: 'Urgent' }, { label: 'Stat', value: 'Stat' },
  ];
  readonly labStatusOptions: { label: string; value: LabOrderStatus | null }[] = [
    { label: 'All Lab Statuses', value: null },
    { label: 'Ordered', value: 'Ordered' }, { label: 'Collected', value: 'Collected' }, { label: 'Received', value: 'Received' },
    { label: 'Processing', value: 'Processing' }, { label: 'Quality Check', value: 'QualityCheck' },
    { label: 'Completed', value: 'Completed' }, { label: 'Cancelled', value: 'Cancelled' },
  ];
  readonly collectionOptions: { label: string; value: SampleCollectionStatus | null }[] = [
    { label: 'All Collection', value: null },
    { label: 'Not Collected', value: 'NotCollected' }, { label: 'Collected', value: 'Collected' },
    { label: 'In Transit', value: 'InTransit' }, { label: 'Received', value: 'Received' }, { label: 'Rejected', value: 'Rejected' },
  ];
  readonly verificationOptions: { label: string; value: LabVerificationStatus | null }[] = [
    { label: 'All Verification', value: null },
    { label: 'Pending Verification', value: 'PendingVerification' }, { label: 'Verified', value: 'Verified' },
    { label: 'Rejected', value: 'Rejected' }, { label: 'Returned for Review', value: 'ReturnedForReview' },
  ];

  constructor(private srv: LaboratoryService) { }

  ngOnInit(): void {
    this.srv.getOrders().subscribe({
      next: (res) => { if (res.success) this.orders.set(res.data.items); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  onSearch(query: string): void { this.search = query; }

  clearFilters(): void {
    this.search = '';
    this.priorityFilter = null;
    this.labStatusFilter = null;
    this.collectionFilter = null;
    this.verificationFilter = null;
  }

  testNames(o: LabOrderRow): string {
    return o.tests.map(t => t.testName).join(', ');
  }

  filtered(): LabOrderRow[] {
    let list = this.orders();
    if (this.priorityFilter) list = list.filter(o => o.priority === this.priorityFilter);
    if (this.labStatusFilter) list = list.filter(o => o.labStatus === this.labStatusFilter);
    if (this.collectionFilter) list = list.filter(o => o.collectionStatus === this.collectionFilter);
    if (this.verificationFilter) list = list.filter(o => o.verificationStatus === this.verificationFilter);
    if (this.search) {
      const q = this.search.toLowerCase();
      list = list.filter(o => o.orderNumber.toLowerCase().includes(q) || o.patientName.toLowerCase().includes(q) || o.mrn.toLowerCase().includes(q));
    }
    return list;
  }

  groupedOrders(): { key: string; items: LabOrderRow[] }[] {
    const list = this.filtered();
    if (!this.groupByDepartment) return [{ key: 'all', items: list }];
    const map = new Map<string, LabOrderRow[]>();
    for (const o of list) map.set(o.departmentName, [...(map.get(o.departmentName) ?? []), o]);
    return Array.from(map.entries()).map(([key, items]) => ({ key, items }));
  }

  priorityTone(priority: LabPriority): BadgeTone {
    switch (priority) {
      case 'Stat': return 'danger';
      case 'Urgent': return 'warning';
      default: return 'neutral';
    }
  }

  collectionTone(status: SampleCollectionStatus): BadgeTone {
    switch (status) {
      case 'Collected': case 'Received': return 'success';
      case 'InTransit': return 'primary';
      case 'Rejected': return 'danger';
      default: return 'neutral';
    }
  }

  labStatusTone(status: LabOrderStatus): BadgeTone {
    switch (status) {
      case 'Completed': return 'success';
      case 'Processing': case 'QualityCheck': return 'primary';
      case 'Cancelled': return 'danger';
      default: return 'neutral';
    }
  }

  verificationTone(status: LabVerificationStatus): BadgeTone {
    switch (status) {
      case 'Verified': return 'success';
      case 'PendingVerification': return 'warning';
      default: return 'danger';
    }
  }
}
