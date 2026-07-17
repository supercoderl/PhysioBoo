import { Component, EventEmitter, Input, OnChanges, Output, signal } from "@angular/core";
import { Router } from "@angular/router";
import { DrawerComponent } from "../../../../components/drawer/drawer.component";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../components/ui/empty-state.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../components/ui/status-badge.component";
import { SurgeryService } from "../../../../services/admin/surgery.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { EquipmentStatus, SurgeryCase, SurgeryTimelineStage } from "../../../../shared/types/surgery.types";

const STAGE_LABELS: Record<SurgeryTimelineStage, string> = {
  Scheduled: 'Scheduled', PatientArrived: 'Patient Arrived', PreOpCompleted: 'Pre-op Completed',
  AnesthesiaStarted: 'Anesthesia Started', SurgeryStarted: 'Surgery Started',
  ProcedureCompleted: 'Procedure Completed', Recovery: 'Recovery', DischargedFromOr: 'Discharged from OR',
};

@Component({
  selector: 'surgery-detail-drawer',
  standalone: true,
  imports: [SharedModule, DrawerComponent, BooIconComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <drawer [isOpen]="isOpen" [width]="760" (close)="onClose()">
      <div class="flex flex-col h-full bg-surface relative">
        <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-surface z-10 sticky top-0">
          <div>
            <h2 class="text-xl font-bold text-primary leading-none mb-1">Surgery Detail</h2>
            <p class="text-sm text-secondary m-0">{{ detail()?.surgeryNumber ?? 'Loading case...' }} — {{ detail()?.procedure }}</p>
          </div>
          <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <boo-icon name="x" [size]="20"></boo-icon>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto bg-surface" custom-scrollbar>
          <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
            <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
          </div>

          <ng-container *ngIf="!isLoading() && detail() as c">
            <!-- Patient summary -->
            <div class="px-6 py-5 border-b border-gray-100">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-gray-800">Patient Summary</h3>
                <boo-status-badge [label]="c.consentStatus" [tone]="consentTone(c.consentStatus)"></boo-status-badge>
              </div>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div><span class="text-gray-500">Patient</span><div class="font-medium text-gray-800">{{ c.patientName }}</div></div>
                <div><span class="text-gray-500">MRN</span><div class="font-medium text-gray-800">{{ c.mrn }}</div></div>
                <div class="col-span-2"><span class="text-gray-500">Diagnosis</span><div class="font-medium text-gray-800">{{ c.diagnosis }}</div></div>
                <div class="col-span-2"><span class="text-gray-500">Surgical History</span><div class="font-medium text-gray-800">{{ c.surgicalHistory.join(', ') || 'None' }}</div></div>
                <div><span class="text-gray-500">Allergies</span><div class="font-medium" [ngClass]="c.allergies.length ? 'text-rose-600' : 'text-gray-800'">{{ c.allergies.join(', ') || 'None reported' }}</div></div>
                <div><span class="text-gray-500">Risk Assessment</span><div class="font-medium text-gray-800">{{ c.riskAssessment }}</div></div>
                <div class="col-span-2"><span class="text-gray-500">Current Medications</span><div class="font-medium text-gray-800">{{ c.currentMedications.join(', ') || 'None' }}</div></div>
              </div>
            </div>

            <!-- Quick actions -->
            <div class="px-6 py-4 border-b border-gray-100 flex flex-wrap gap-2">
              <button (click)="viewEmr()" class="px-3 py-1.5 bg-surface border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1.5">
                <boo-icon name="file-text" [size]="14"></boo-icon> View EMR
              </button>
              <button (click)="printConsent()" class="px-3 py-1.5 bg-surface border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1.5">
                <boo-icon name="printer" [size]="14"></boo-icon> Print Consent
              </button>
              <button (click)="viewImages()" class="px-3 py-1.5 bg-surface border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1.5">
                <boo-icon name="image" [size]="14"></boo-icon> View Images
              </button>
              <button (click)="openTreatmentSheet()" class="px-3 py-1.5 bg-surface border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1.5">
                <boo-icon name="clipboard-list" [size]="14"></boo-icon> Open Treatment Sheet
              </button>
            </div>

            <!-- Surgical team -->
            <div class="px-6 py-5 border-b border-gray-100">
              <h3 class="text-sm font-semibold text-gray-800 mb-3">Surgical Team</h3>
              <div class="space-y-1.5">
                <div *ngFor="let m of c.team" class="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md">
                  <div class="min-w-0">
                    <div class="text-sm font-medium text-gray-800 truncate">{{ m.name }}</div>
                    <div class="text-xs text-gray-500">{{ m.role }}</div>
                  </div>
                  <boo-status-badge [label]="m.availability" [tone]="m.availability === 'Assigned' ? 'success' : m.availability === 'Available' ? 'neutral' : 'danger'"></boo-status-badge>
                </div>
              </div>
            </div>

            <!-- Pre-operative checklist -->
            <div class="px-6 py-5 border-b border-gray-100">
              <h3 class="text-sm font-semibold text-gray-800 mb-3">Pre-operative Checklist</h3>
              <div class="space-y-1.5">
                <div *ngFor="let item of c.checklist" class="flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 rounded-md">
                  <div class="flex items-center gap-2 min-w-0">
                    <boo-icon [name]="item.status === 'Completed' ? 'check-circle-2' : item.status === 'NotApplicable' ? 'circle-x' : 'clock'"
                      [size]="16" [ngClass]="item.status === 'Completed' ? 'text-emerald-500' : item.status === 'NotApplicable' ? 'text-gray-400' : 'text-amber-500'"></boo-icon>
                    <span class="text-sm text-gray-700 truncate" [attr.aria-label]="item.label + ' — ' + item.status">{{ item.label }}</span>
                  </div>
                  <span *ngIf="item.signedBy" class="text-[11px] text-gray-400 shrink-0">{{ item.signedBy }}</span>
                </div>
              </div>
            </div>

            <!-- Equipment & consumables -->
            <div class="px-6 py-5 border-b border-gray-100">
              <h3 class="text-sm font-semibold text-gray-800 mb-3">Equipment & Consumables</h3>
              <div class="space-y-1.5">
                <div *ngFor="let eq of c.equipment" class="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md">
                  <div class="min-w-0">
                    <div class="text-sm font-medium text-gray-800 truncate">{{ eq.name }}</div>
                    <div class="text-xs text-gray-500">{{ eq.category }} · Qty {{ eq.quantity }}</div>
                  </div>
                  <boo-status-badge [label]="eq.status" [tone]="equipmentTone(eq.status)"></boo-status-badge>
                </div>
              </div>
            </div>

            <!-- Surgical timeline -->
            <div class="px-6 py-5 border-b border-gray-100">
              <h3 class="text-sm font-semibold text-gray-800 mb-3">Surgical Timeline</h3>
              <div class="flex items-center overflow-x-auto pb-1">
                <ng-container *ngFor="let ev of c.timeline; let last = last">
                  <div class="flex flex-col items-center gap-1 shrink-0 w-24">
                    <div class="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold"
                      [ngClass]="ev.occurredAt ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'">
                      <boo-icon [name]="ev.occurredAt ? 'check' : 'clock'" [size]="14"></boo-icon>
                    </div>
                    <span class="text-[11px] font-medium text-gray-700 text-center">{{ STAGE_LABELS[ev.stage] }}</span>
                    <span class="text-[10px] text-gray-400 text-center">{{ ev.occurredAt ? (ev.occurredAt | date:'short') : '—' }}</span>
                  </div>
                  <div *ngIf="!last" class="h-0.5 flex-1 min-w-[12px]" [ngClass]="ev.occurredAt ? 'bg-primary' : 'bg-gray-200'"></div>
                </ng-container>
              </div>
            </div>

            <!-- Notes -->
            <div class="px-6 py-5">
              <h3 class="text-sm font-semibold text-gray-800 mb-3">Notes</h3>
              <p *ngIf="c.notes" class="text-sm text-gray-600 bg-gray-50 rounded-md p-3">{{ c.notes }}</p>
              <boo-empty-state *ngIf="!c.notes" icon="file-text" title="No notes recorded for this case"></boo-empty-state>
            </div>
          </ng-container>
        </div>
      </div>
    </drawer>
  `,
})
export class SurgeryDetailDrawerComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() surgeryId: string | null = null;
  @Output() close = new EventEmitter<void>();

  isLoading = signal(true);
  detail = signal<SurgeryCase | null>(null);

  readonly STAGE_LABELS = STAGE_LABELS;

  constructor(private srv: SurgeryService, private toastSrv: ToastService, private dialogSrv: DialogService, private router: Router) { }

  ngOnChanges(): void {
    if (!this.isOpen || !this.surgeryId) return;
    this.isLoading.set(true);
    this.srv.getCaseDetail(this.surgeryId).subscribe({
      next: (res) => { if (res.success) this.detail.set(res.data); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  consentTone(status: string): BadgeTone {
    switch (status) {
      case 'Signed': return 'success';
      case 'Pending': return 'warning';
      default: return 'danger';
    }
  }

  equipmentTone(status: EquipmentStatus): BadgeTone {
    switch (status) {
      case 'Available': case 'Reserved': return 'success';
      case 'InUse': return 'primary';
      case 'Sterilizing': return 'warning';
      default: return 'danger';
    }
  }

  onClose(): void {
    this.close.emit();
  }

  viewEmr(): void {
    this.router.navigate(['/admin/clinic/medical-record'], { queryParams: { patientId: this.detail()?.mrn } });
  }

  printConsent(): void {
    window.print();
  }

  viewImages(): void {
    this.toastSrv.info('View Images — not wired yet');
  }

  openTreatmentSheet(): void {
    this.router.navigate(['/admin/paraclinical/treatment-sheet'], { queryParams: { patientId: this.detail()?.mrn } });
  }
}
