import { Component, Input, OnChanges, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../../components/ui/status-badge.component";
import { TreatmentSheetService } from "../../../../../services/admin/treatment-sheet.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { TreatmentImagingOrderRow } from "../../../../../shared/types/treatment-sheet.types";

@Component({
  selector: 'treatment-imaging-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading() && !studies().length"><boo-empty-state icon="scan" title="No imaging requests"></boo-empty-state></div>

    <div *ngIf="!isLoading() && studies().length" class="bg-surface border border-gray-200 rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-100 text-gray-600 text-xs uppercase">
          <tr>
            <th class="px-4 py-3 text-left">Study</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-left">Scheduled</th>
            <th class="px-4 py-3 text-left">Report</th>
            <th class="px-4 py-3 text-left">Images</th>
            <th class="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr *ngFor="let s of studies()">
            <td class="px-4 py-3 font-medium text-gray-800">{{ s.studyName }}</td>
            <td class="px-4 py-3"><boo-status-badge [label]="s.status" [tone]="statusTone(s.status)"></boo-status-badge></td>
            <td class="px-4 py-3">{{ s.scheduledTime ? (s.scheduledTime | date:'short') : '—' }}</td>
            <td class="px-4 py-3">
              <boo-status-badge [label]="s.reportAvailable ? 'Available' : 'Pending'" [tone]="s.reportAvailable ? 'success' : 'neutral'"></boo-status-badge>
            </td>
            <td class="px-4 py-3">
              <boo-status-badge [label]="s.imagesAvailable ? 'Available' : 'Pending'" [tone]="s.imagesAvailable ? 'success' : 'neutral'"></boo-status-badge>
            </td>
            <td class="px-4 py-3 flex gap-3">
              <button (click)="viewReport()" [disabled]="!s.reportAvailable" class="text-primary text-xs font-semibold hover:underline disabled:opacity-40 disabled:no-underline">Report</button>
              <button (click)="viewImages()" [disabled]="!s.imagesAvailable" class="text-primary text-xs font-semibold hover:underline disabled:opacity-40 disabled:no-underline">Images</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class TreatmentImagingTabComponent implements OnChanges {
  @Input({ required: true }) patientId!: string;

  isLoading = signal(true);
  studies = signal<TreatmentImagingOrderRow[]>([]);

  constructor(private srv: TreatmentSheetService, private toastSrv: ToastService) { }

  ngOnChanges(): void {
    if (!this.patientId) return;
    this.isLoading.set(true);
    this.srv.getImagingOrders(this.patientId).subscribe({
      next: (res) => { if (res.success) this.studies.set(res.data.items); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  statusTone(status: TreatmentImagingOrderRow['status']): BadgeTone {
    switch (status) {
      case 'Completed': return 'success';
      case 'InProgress': return 'primary';
      case 'Cancelled': return 'danger';
      default: return 'neutral';
    }
  }

  viewReport(): void { this.toastSrv.info('View report — not wired yet'); }
  viewImages(): void { this.toastSrv.info('View images — not wired yet'); }
}
