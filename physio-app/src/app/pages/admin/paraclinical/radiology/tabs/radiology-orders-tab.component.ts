import { Component, EventEmitter, OnInit, Output, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../components/input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../../components/select/boo-select/boo-select.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../../components/ui/status-badge.component";
import { RadiologyService } from "../../../../../services/admin/radiology.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { ImagingOrderRow, ImagingOrderStatus, RadiologyPriority, ReportStatus } from "../../../../../shared/types/radiology.types";

@Component({
  selector: 'radiology-orders-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, BooInputComponent, BooSelectComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <boo-input label="Search order #, patient, MRN..." size="small" (search)="onSearch($event)"></boo-input>
      <boo-select label="Priority" [(ngModel)]="priorityFilter" [options]="priorityOptions" bindLabel="label" bindValue="value"></boo-select>
      <boo-select label="Status" [(ngModel)]="statusFilter" [options]="statusOptions" bindLabel="label" bindValue="value"></boo-select>
      <boo-select label="Report Status" [(ngModel)]="reportStatusFilter" [options]="reportStatusOptions" bindLabel="label" bindValue="value"></boo-select>
      <button (click)="groupByModality = !groupByModality"
        class="px-3 py-2 rounded-lg text-xs font-semibold border transition-colors"
        [ngClass]="groupByModality ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-gray-200 text-gray-600'">
        Group by Modality
      </button>
    </div>

    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading() && !filtered().length">
      <boo-empty-state icon="scan" title="No imaging orders match these filters">
        <button (click)="clearFilters()" class="text-primary text-xs font-semibold hover:underline">Clear Filters</button>
      </boo-empty-state>
    </div>

    <ng-container *ngIf="!isLoading() && filtered().length">
      <div *ngFor="let group of groupedOrders()" class="bg-surface border border-gray-200 rounded-lg overflow-hidden mb-4">
        <div *ngIf="groupByModality" class="px-4 py-2 bg-gray-100 text-xs font-semibold text-gray-600 uppercase">{{ group.key }}</div>
        <table class="w-full text-sm">
          <thead class="bg-gray-100 text-gray-600 text-xs uppercase">
            <tr>
              <th class="px-4 py-3 text-left">Order #</th>
              <th class="px-4 py-3 text-left">Patient</th>
              <th class="px-4 py-3 text-left">MRN</th>
              <th class="px-4 py-3 text-left">Dept / Ward</th>
              <th class="px-4 py-3 text-left">Examination</th>
              <th class="px-4 py-3 text-left">Doctor</th>
              <th class="px-4 py-3 text-left">Priority</th>
              <th class="px-4 py-3 text-left">Scheduled</th>
              <th class="px-4 py-3 text-left">Status</th>
              <th class="px-4 py-3 text-left">Report</th>
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
              <td class="px-4 py-3 text-gray-500">{{ examNames(o) }}</td>
              <td class="px-4 py-3 text-gray-500">{{ o.orderingDoctorName }}</td>
              <td class="px-4 py-3"><boo-status-badge [label]="o.priority" [tone]="priorityTone(o.priority)"></boo-status-badge></td>
              <td class="px-4 py-3 text-gray-500">{{ o.scheduledTime ? (o.scheduledTime | date:'short') : 'Not scheduled' }}</td>
              <td class="px-4 py-3"><boo-status-badge [label]="o.status" [tone]="statusTone(o.status)"></boo-status-badge></td>
              <td class="px-4 py-3"><boo-status-badge [label]="o.reportStatus" [tone]="reportStatusTone(o.reportStatus)"></boo-status-badge></td>
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
export class RadiologyOrdersTabComponent implements OnInit {
  @Output() viewPatient = new EventEmitter<string>();

  isLoading = signal(true);
  orders = signal<ImagingOrderRow[]>([]);
  groupByModality = false;

  search = '';
  priorityFilter: RadiologyPriority | null = null;
  statusFilter: ImagingOrderStatus | null = null;
  reportStatusFilter: ReportStatus | null = null;

  readonly priorityOptions: { label: string; value: RadiologyPriority | null }[] = [
    { label: 'All Priorities', value: null },
    { label: 'Routine', value: 'Routine' }, { label: 'Urgent', value: 'Urgent' }, { label: 'Stat', value: 'Stat' },
  ];
  readonly statusOptions: { label: string; value: ImagingOrderStatus | null }[] = [
    { label: 'All Statuses', value: null },
    { label: 'Ordered', value: 'Ordered' }, { label: 'Scheduled', value: 'Scheduled' }, { label: 'Arrived', value: 'Arrived' },
    { label: 'In Progress', value: 'InProgress' }, { label: 'Imaging Completed', value: 'ImagingCompleted' },
    { label: 'Image Uploaded', value: 'ImageUploaded' }, { label: 'Cancelled', value: 'Cancelled' },
  ];
  readonly reportStatusOptions: { label: string; value: ReportStatus | null }[] = [
    { label: 'All Report Statuses', value: null },
    { label: 'Not Started', value: 'NotStarted' }, { label: 'Reporting', value: 'Reporting' },
    { label: 'Pending Verification', value: 'PendingVerification' }, { label: 'Verified', value: 'Verified' },
    { label: 'Released', value: 'Released' }, { label: 'Rejected', value: 'Rejected' }, { label: 'Returned for Revision', value: 'ReturnedForRevision' },
  ];

  constructor(private srv: RadiologyService) { }

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
    this.statusFilter = null;
    this.reportStatusFilter = null;
  }

  examNames(o: ImagingOrderRow): string {
    return o.examinations.map(e => e.examinationName).join(', ');
  }

  filtered(): ImagingOrderRow[] {
    let list = this.orders();
    if (this.priorityFilter) list = list.filter(o => o.priority === this.priorityFilter);
    if (this.statusFilter) list = list.filter(o => o.status === this.statusFilter);
    if (this.reportStatusFilter) list = list.filter(o => o.reportStatus === this.reportStatusFilter);
    if (this.search) {
      const q = this.search.toLowerCase();
      list = list.filter(o => o.orderNumber.toLowerCase().includes(q) || o.patientName.toLowerCase().includes(q) || o.mrn.toLowerCase().includes(q));
    }
    return list;
  }

  groupedOrders(): { key: string; items: ImagingOrderRow[] }[] {
    const list = this.filtered();
    if (!this.groupByModality) return [{ key: 'all', items: list }];
    const map = new Map<string, ImagingOrderRow[]>();
    for (const o of list) {
      const key = o.examinations[0]?.modalityName ?? 'Unspecified';
      map.set(key, [...(map.get(key) ?? []), o]);
    }
    return Array.from(map.entries()).map(([key, items]) => ({ key, items }));
  }

  priorityTone(priority: RadiologyPriority): BadgeTone {
    switch (priority) {
      case 'Stat': return 'danger';
      case 'Urgent': return 'warning';
      default: return 'neutral';
    }
  }

  statusTone(status: ImagingOrderStatus): BadgeTone {
    switch (status) {
      case 'ImagingCompleted': case 'ImageUploaded': return 'success';
      case 'InProgress': case 'Arrived': return 'primary';
      case 'Cancelled': return 'danger';
      default: return 'neutral';
    }
  }

  reportStatusTone(status: ReportStatus): BadgeTone {
    switch (status) {
      case 'Released': case 'Verified': return 'success';
      case 'PendingVerification': case 'Reporting': return 'warning';
      case 'Rejected': case 'ReturnedForRevision': return 'danger';
      default: return 'neutral';
    }
  }
}
