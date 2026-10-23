import { Router } from "@angular/router";
import { Component, Input, OnChanges, signal } from "@angular/core";
import { BooBadgeTone, BooEmptyStateComponent, BooErrorStateComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { TreatmentSheetService } from "../../../../../services/admin/treatment-sheet.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { TreatmentLabOrderRow } from "../../../../../shared/types/treatment-sheet.types";

@Component({
  selector: 'treatment-laboratory-tab',
  standalone: true,
  imports: [SharedModule, BooStatusBadgeComponent, BooEmptyStateComponent, BooErrorStateComponent],
  template: `
    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <physio-icon name="loader" [class]="'w-6 h-6 text-primary animate-spin'"></physio-icon>
    </div>

    <boo-error-state *ngIf="!isLoading() && loadError()" title="Couldn't load laboratory orders" [description]="loadError()" appearance="panel" (retry)="load()"></boo-error-state>

    <div *ngIf="!isLoading() && !loadError() && !labs().length"><boo-empty-state icon="flask-conical" title="No laboratory orders"></boo-empty-state></div>

    <div *ngIf="!isLoading() && !loadError() && labs().length" class="bg-surface border border-gray-200 rounded-lg overflow-hidden">
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
  loadError = signal<string | null>(null);
  labs = signal<TreatmentLabOrderRow[]>([]);

  constructor(private srv: TreatmentSheetService, private toastSrv: ToastService, private router: Router) { }

  ngOnChanges(): void {
    this.load();
  }

  load(): void {
    if (!this.patientId) return;
    this.isLoading.set(true);
    this.loadError.set(null);
    this.srv.getLabOrders(this.patientId).subscribe({
      next: (res) => {
        if (res.success) this.labs.set(res.data.items); else this.loadError.set('The laboratory orders could not be loaded.');
        this.isLoading.set(false);
      },
      error: () => { this.loadError.set('The laboratory orders could not be loaded.'); this.isLoading.set(false); },
    });
  }

  resultTone(status: TreatmentLabOrderRow['resultStatus']): BooBadgeTone {
    switch (status) {
      case 'Final': return 'success';
      case 'Critical': return 'danger';
      case 'Partial': return 'warning';
      default: return 'neutral';
    }
  }

  viewResult(): void {
    this.router.navigate(['/admin/paraclinical/laboratory'], { queryParams: { patient: this.patientId } });
  }
}
