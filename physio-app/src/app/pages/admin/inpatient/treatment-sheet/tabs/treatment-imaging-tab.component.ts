import { Router } from "@angular/router";
import { Component, Input, OnChanges, signal } from "@angular/core";
import { BooBadgeTone, BooEmptyStateComponent, BooErrorStateComponent, BooStatusBadgeComponent, BooButtonComponent, BooSpinnerComponent } from '@physioboo/ui';
import { TreatmentSheetService } from "../../../../../services/admin/treatment-sheet.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { TreatmentImagingOrderRow } from "../../../../../shared/types/treatment-sheet.types";

@Component({
  selector: 'treatment-imaging-tab',
  standalone: true,
  imports: [SharedModule, BooStatusBadgeComponent, BooEmptyStateComponent, BooErrorStateComponent, BooButtonComponent, BooSpinnerComponent],
  template: `
    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-spinner [inline]="true" tone="primary" [size]="24" />
    </div>

    <boo-error-state *ngIf="!isLoading() && loadError()" title="Couldn't load imaging requests" [description]="loadError()" appearance="panel" (retry)="load()"></boo-error-state>

    <div *ngIf="!isLoading() && !loadError() && !studies().length"><boo-empty-state icon="scan" title="No imaging requests"></boo-empty-state></div>

    <div *ngIf="!isLoading() && !loadError() && studies().length" class="bg-surface border border-gray-200 rounded-lg overflow-hidden">
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
              <button type="button" boo-button variant="text" classname="text-primary text-xs font-semibold disabled:opacity-40 disabled:no-underline" (click)="viewReport()" [disabled]="!s.reportAvailable">Report</button>
              <button type="button" boo-button variant="text" classname="text-primary text-xs font-semibold disabled:opacity-40 disabled:no-underline" (click)="viewImages()" [disabled]="!s.imagesAvailable">Images</button>
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
  loadError = signal<string | null>(null);
  studies = signal<TreatmentImagingOrderRow[]>([]);

  constructor(private srv: TreatmentSheetService, private toastSrv: ToastService, private router: Router) { }

  ngOnChanges(): void {
    this.load();
  }

  load(): void {
    if (!this.patientId) return;
    this.isLoading.set(true);
    this.loadError.set(null);
    this.srv.getImagingOrders(this.patientId).subscribe({
      next: (res) => {
        if (res.success) this.studies.set(res.data.items); else this.loadError.set('The imaging requests could not be loaded.');
        this.isLoading.set(false);
      },
      error: () => { this.loadError.set('The imaging requests could not be loaded.'); this.isLoading.set(false); },
    });
  }

  statusTone(status: TreatmentImagingOrderRow['status']): BooBadgeTone {
    switch (status) {
      case 'Completed': return 'success';
      case 'InProgress': return 'primary';
      case 'Cancelled': return 'danger';
      default: return 'neutral';
    }
  }

  // Reports and studies live in the Radiology workspace (no separate image viewer is integrated).
  viewReport(): void { this.openRadiology(); }
  viewImages(): void { this.openRadiology(); }

  private openRadiology(): void {
    this.router.navigate(['/admin/paraclinical/radiology'], { queryParams: { patient: this.patientId } });
  }
}
