import { Component, Input, OnChanges, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../../components/ui/status-badge.component";
import { TreatmentSheetService } from "../../../../../services/admin/treatment-sheet.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { TreatmentLabOrderRow } from "../../../../../shared/types/treatment-sheet.types";

@Component({
  selector: 'treatment-laboratory-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading() && !labs().length"><boo-empty-state icon="flask-conical" title="No laboratory orders"></boo-empty-state></div>

    <div *ngIf="!isLoading() && labs().length" class="bg-surface border border-gray-200 rounded-lg overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-100 text-gray-600 text-xs uppercase">
          <tr>
            <th class="px-4 py-3 text-left">Test</th>
            <th class="px-4 py-3 text-left">Sample Status</th>
            <th class="px-4 py-3 text-left">Result Status</th>
            <th class="px-4 py-3 text-left">Critical</th>
            <th class="px-4 py-3 text-left">Ordered At</th>
            <th class="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr *ngFor="let l of labs()" [ngClass]="l.isCritical ? 'bg-rose-50' : ''">
            <td class="px-4 py-3 font-medium text-gray-800">{{ l.testName }}</td>
            <td class="px-4 py-3">{{ l.sampleStatus }}</td>
            <td class="px-4 py-3"><boo-status-badge [label]="l.resultStatus" [tone]="resultTone(l.resultStatus)"></boo-status-badge></td>
            <td class="px-4 py-3"><boo-status-badge *ngIf="l.isCritical" label="Critical" tone="danger" [dotted]="true"></boo-status-badge><span *ngIf="!l.isCritical">—</span></td>
            <td class="px-4 py-3">{{ l.orderedAt | date:'short' }}</td>
            <td class="px-4 py-3">
              <button (click)="viewResult()" [disabled]="l.resultStatus === 'Pending'" class="text-primary text-xs font-semibold hover:underline disabled:opacity-40 disabled:no-underline">View Result</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class TreatmentLaboratoryTabComponent implements OnChanges {
  @Input({ required: true }) patientId!: string;

  isLoading = signal(true);
  labs = signal<TreatmentLabOrderRow[]>([]);

  constructor(private srv: TreatmentSheetService, private toastSrv: ToastService) { }

  ngOnChanges(): void {
    if (!this.patientId) return;
    this.isLoading.set(true);
    this.srv.getLabOrders(this.patientId).subscribe({
      next: (res) => { if (res.success) this.labs.set(res.data.items); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  resultTone(status: TreatmentLabOrderRow['resultStatus']): BadgeTone {
    switch (status) {
      case 'Final': return 'success';
      case 'Critical': return 'danger';
      case 'Partial': return 'warning';
      default: return 'neutral';
    }
  }

  viewResult(): void {
    this.toastSrv.info('View result — not wired yet');
  }
}
