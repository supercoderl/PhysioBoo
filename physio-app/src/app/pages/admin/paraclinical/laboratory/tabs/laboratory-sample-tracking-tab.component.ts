import { Component, OnInit, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../../components/ui/status-badge.component";
import { LaboratoryService } from "../../../../../services/admin/laboratory.service";
import { DialogService } from "../../../../../services/common/dialog.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { LabSample, LabSampleTimelineEvent, SampleCollectionStatus } from "../../../../../shared/types/laboratory.types";

const STAGE_LABELS: Record<LabSampleTimelineEvent['stage'], string> = {
  Ordered: 'Ordered', Collected: 'Collected', Received: 'Received', Processing: 'Processing',
  QualityCheck: 'Quality Check', Completed: 'Completed', Verified: 'Verified', ReportReleased: 'Report Released',
};

@Component({
  selector: 'laboratory-sample-tracking-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading() && !samples().length"><boo-empty-state icon="test-tube" title="No samples pending collection or tracking"></boo-empty-state></div>

    <div *ngIf="!isLoading() && samples().length" class="space-y-3">
      <div *ngFor="let s of samples()" class="bg-surface border border-gray-200 rounded-lg overflow-hidden">
        <button type="button" (click)="toggleExpand(s.id)" class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left">
          <div class="flex items-center gap-4 min-w-0">
            <boo-icon name="scan-barcode" [size]="18" iconClass="text-gray-400 shrink-0"></boo-icon>
            <div class="min-w-0">
              <div class="text-sm font-semibold text-gray-800 truncate">{{ s.barcode }} · {{ s.testName }}</div>
              <div class="text-xs text-gray-500 truncate">{{ s.patientName }} · {{ s.orderNumber }} · {{ s.sampleType }} ({{ s.containerType }})</div>
            </div>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <boo-status-badge [label]="s.collectionStatus" [tone]="collectionTone(s.collectionStatus)"></boo-status-badge>
            <boo-icon name="chevron-down" [size]="16" iconClass="text-gray-400 transition-transform" [ngClass]="expanded() === s.id ? 'rotate-180' : ''"></boo-icon>
          </div>
        </button>

        <div *ngIf="expanded() === s.id" class="border-t border-gray-100 px-4 py-4 bg-gray-50">
          <div class="flex flex-wrap items-center gap-2 mb-4">
            <button (click)="printBarcode(s)" class="px-3 py-1.5 bg-surface border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1.5">
              <boo-icon name="printer" [size]="14"></boo-icon> Print Barcode
            </button>
            <button [disabled]="s.collectionStatus !== 'NotCollected'" (click)="markCollected(s)" class="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary/15 disabled:opacity-40 disabled:cursor-not-allowed">
              Mark Collected
            </button>
            <button [disabled]="s.collectionStatus === 'Rejected'" (click)="recollect(s)" class="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed">
              Recollect
            </button>
            <button [disabled]="s.collectionStatus === 'Rejected'" (click)="reject(s)" class="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed">
              Reject Sample
            </button>
          </div>

          <div class="flex items-center overflow-x-auto pb-1">
            <ng-container *ngFor="let ev of s.timeline; let last = last">
              <div class="flex flex-col items-center gap-1 shrink-0 w-28">
                <div class="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold"
                  [ngClass]="ev.occurredAt ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'">
                  <boo-icon [name]="ev.occurredAt ? 'check' : 'circle'" [size]="14"></boo-icon>
                </div>
                <span class="text-[11px] font-medium text-gray-700 text-center">{{ STAGE_LABELS[ev.stage] }}</span>
                <span class="text-[10px] text-gray-400 text-center">{{ ev.occurredAt ? (ev.occurredAt | date:'short') : '—' }}</span>
              </div>
              <div *ngIf="!last" class="h-0.5 flex-1 min-w-[16px]" [ngClass]="ev.occurredAt ? 'bg-primary' : 'bg-gray-200'"></div>
            </ng-container>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LaboratorySampleTrackingTabComponent implements OnInit {
  isLoading = signal(true);
  samples = signal<LabSample[]>([]);
  expanded = signal<string | null>(null);

  readonly STAGE_LABELS = STAGE_LABELS;

  constructor(private srv: LaboratoryService, private toastSrv: ToastService, private dialogSrv: DialogService) { }

  ngOnInit(): void {
    this.srv.getSamples().subscribe({
      next: (res) => { if (res.success) this.samples.set(res.data.items); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  toggleExpand(id: string): void {
    this.expanded.set(this.expanded() === id ? null : id);
  }

  collectionTone(status: SampleCollectionStatus): BadgeTone {
    switch (status) {
      case 'Collected': case 'Received': return 'success';
      case 'InTransit': return 'primary';
      case 'Rejected': return 'danger';
      default: return 'neutral';
    }
  }

  printBarcode(s: LabSample): void {
    this.toastSrv.info(`Printing barcode ${s.barcode} — not wired yet`);
  }

  markCollected(s: LabSample): void {
    this.srv.markSampleCollected(s.id, 'You', s.containerType).subscribe(res => {
      if (res.success) {
        this.samples.update(list => list.map(x => x.id === s.id ? { ...x, collectionStatus: 'Collected' as const } : x));
        this.toastSrv.success('Sample marked collected');
      } else {
        this.toastSrv.error('Unable to mark sample collected');
      }
    });
  }

  recollect(s: LabSample): void {
    this.dialogSrv.confirm(
      `Recollect sample ${s.barcode} for ${s.testName}?`,
      () => {
        this.srv.recollectSample(s.id, 'Recollection requested').subscribe(res => {
          if (res.success) this.toastSrv.success('Recollection requested');
          else this.toastSrv.error('Unable to request recollection');
        });
      },
      'Recollect Sample',
    );
  }

  reject(s: LabSample): void {
    this.dialogSrv.confirm(
      `Reject sample ${s.barcode}? This will require a new collection.`,
      () => {
        this.srv.rejectSample(s.id, 'Sample rejected').subscribe(res => {
          if (res.success) {
            this.samples.update(list => list.map(x => x.id === s.id ? { ...x, collectionStatus: 'Rejected' as const } : x));
            this.toastSrv.success('Sample rejected');
          } else {
            this.toastSrv.error('Unable to reject sample');
          }
        });
      },
      'Reject Sample',
      'danger',
      'Reject',
    );
  }
}
