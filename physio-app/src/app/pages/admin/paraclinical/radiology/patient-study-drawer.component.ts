import { Component, EventEmitter, Input, OnChanges, Output, signal } from "@angular/core";
import { Router } from "@angular/router";
import { forkJoin } from "rxjs";
import { DrawerComponent } from "../../../../components/drawer/drawer.component";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../components/ui/empty-state.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../components/ui/status-badge.component";
import { RadiologyService } from "../../../../services/admin/radiology.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { ImagingOrderRow, RadiologyPatientStudySummary, ReportStatus } from "../../../../shared/types/radiology.types";

@Component({
  selector: 'radiology-patient-study-drawer',
  standalone: true,
  imports: [SharedModule, DrawerComponent, BooIconComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <drawer [isOpen]="isOpen" [width]="720" (close)="onClose()">
      <div class="flex flex-col h-full bg-surface relative">
        <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-surface z-10 sticky top-0">
          <div>
            <h2 class="text-xl font-bold text-primary leading-none mb-1">Patient Study Drawer</h2>
            <p class="text-sm text-secondary m-0">{{ summary()?.fullName ?? 'Loading patient...' }}</p>
          </div>
          <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <boo-icon name="x" [size]="20"></boo-icon>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto bg-surface" custom-scrollbar>
          <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
            <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
          </div>

          <ng-container *ngIf="!isLoading() && summary()">
            <!-- Patient summary -->
            <div class="px-6 py-5 border-b border-gray-100">
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div><span class="text-gray-500">MRN</span><div class="font-medium text-gray-800">{{ summary()!.mrn }}</div></div>
                <div><span class="text-gray-500">Visit #</span><div class="font-medium text-gray-800">{{ summary()!.visitNumber }}</div></div>
                <div><span class="text-gray-500">Department</span><div class="font-medium text-gray-800">{{ summary()!.departmentName }}</div></div>
              </div>
            </div>

            <!-- Quick actions -->
            <div class="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-2">
              <button (click)="viewEmr()" class="px-3 py-1.5 bg-surface border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1.5">
                <boo-icon name="file-text" [size]="14"></boo-icon> View EMR
              </button>
              <button (click)="openPacs()" class="px-3 py-1.5 bg-surface border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1.5">
                <boo-icon name="monitor" [size]="14"></boo-icon> Open PACS
              </button>
              <button (click)="printReport()" class="px-3 py-1.5 bg-surface border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1.5">
                <boo-icon name="printer" [size]="14"></boo-icon> Print Report
              </button>
              <button (click)="exportPdf()" class="px-3 py-1.5 bg-surface border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1.5">
                <boo-icon name="file-down" [size]="14"></boo-icon> Export PDF
              </button>
            </div>

            <!-- Imaging history -->
            <div class="px-6 py-5">
              <h3 class="text-sm font-semibold text-gray-800 mb-3">Imaging History</h3>
              <div *ngIf="!history().length"><boo-empty-state icon="scan" title="No imaging history for this patient"></boo-empty-state></div>
              <div *ngIf="history().length" class="space-y-2">
                <div *ngFor="let o of history()" class="border border-gray-200 rounded-lg p-3">
                  <div class="flex items-center justify-between gap-2">
                    <div class="min-w-0">
                      <div class="text-sm font-medium text-gray-800 truncate">{{ o.orderNumber }} — {{ examNames(o) }}</div>
                      <div class="text-xs text-gray-500">{{ o.orderTime | date:'medium' }} · {{ o.orderingDoctorName }}</div>
                    </div>
                    <boo-status-badge [label]="o.reportStatus" [tone]="reportStatusTone(o.reportStatus)"></boo-status-badge>
                  </div>
                </div>
              </div>
            </div>
          </ng-container>
        </div>
      </div>
    </drawer>
  `,
})
export class RadiologyPatientStudyDrawerComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() patientId: string | null = null;
  @Output() close = new EventEmitter<void>();

  isLoading = signal(true);
  summary = signal<RadiologyPatientStudySummary | null>(null);
  history = signal<ImagingOrderRow[]>([]);

  constructor(private srv: RadiologyService, private toastSrv: ToastService, private router: Router) { }

  ngOnChanges(): void {
    if (!this.isOpen || !this.patientId) return;
    this.isLoading.set(true);
    forkJoin({
      summary: this.srv.getPatientSummary(this.patientId),
      history: this.srv.getPatientHistory(this.patientId),
    }).subscribe({
      next: ({ summary, history }) => {
        if (summary.success) this.summary.set(summary.data);
        if (history.success) this.history.set(history.data.items);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  examNames(o: ImagingOrderRow): string {
    return o.examinations.map(e => e.examinationName).join(', ');
  }

  reportStatusTone(status: ReportStatus): BadgeTone {
    switch (status) {
      case 'Released': case 'Verified': return 'success';
      case 'PendingVerification': case 'Reporting': return 'warning';
      case 'Rejected': case 'ReturnedForRevision': return 'danger';
      default: return 'neutral';
    }
  }

  onClose(): void {
    this.close.emit();
  }

  viewEmr(): void {
    this.router.navigate(['/admin/clinic/medical-record'], { queryParams: { patientId: this.patientId } });
  }

  openPacs(): void {
    this.toastSrv.info('Open PACS — integration pending');
  }

  printReport(): void {
    window.print();
  }

  exportPdf(): void {
    this.toastSrv.info('Export PDF — not wired yet');
  }
}
