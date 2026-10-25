import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooButtonComponent, BooEmptyStateComponent, BooInlineErrorComponent, BooInlineErrorState, BooStatusBadgeComponent } from '@physioboo/ui';
import { BooTextareaComponent } from "../../../../components/textarea/boo-textarea/boo-textarea.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { DispenseLineAction, DispenseMedicationItem, DispenseWorkspace, DispenseWorkspaceTab } from "../../../../shared/types/dispensing.types";
import { ClinicalWarning } from "../../../../shared/types/prescription-rx.types";
import { severityRank } from "../../../../shared/types/dispensing.types";
import {
  completionBlockReason,
  dispenseStatusLabel,
  dispenseStatusTone,
  isClosedStatus,
  isLineReady,
  severityTone,
} from "../../../../shared/utils/dispensing.utils";
import { DispenseMedicineCardComponent } from "./dispense-medicine-card.component";
import { DispenseProgressStepperComponent } from "./dispense-progress-stepper.component";

interface FlatWarning extends ClinicalWarning {
  itemName: string;
}

@Component({
  selector: 'dispense-detail-panel',
  standalone: true,
  imports: [SharedModule, BooButtonComponent, BooStatusBadgeComponent, BooEmptyStateComponent, BooInlineErrorComponent, BooTextareaComponent, DispenseProgressStepperComponent, DispenseMedicineCardComponent],
  template: `
    <section class="h-full flex flex-col bg-surface rounded-2 border border-borderGray/60 overflow-hidden" aria-label="Prescription workspace" [attr.aria-busy]="loading ? 'true' : null">
      <!-- Nothing selected -->
      <boo-empty-state *ngIf="!workspace && !loading && !error" class="flex-1 flex items-center justify-center" icon="clipboard-list"
        title="Select a prescription" description="Choose a prescription from the list to review its medicines and dispense them."></boo-empty-state>

      <!-- Loading -->
      <div *ngIf="loading && !workspace" class="p-6 space-y-4 animate-pulse" aria-label="Loading prescription">
        <div class="h-5 w-1/3 bg-gray-200 rounded"></div>
        <div class="h-4 w-1/2 bg-gray-100 rounded"></div>
        <div class="h-24 bg-gray-100 rounded-2"></div>
        <div class="h-40 bg-gray-100 rounded-2"></div>
      </div>

      <!-- Error -->
      <div *ngIf="error && !workspace && !loading" class="p-6">
        <boo-inline-error what="this prescription" [state]="errorState" (retry)="retry.emit()"></boo-inline-error>
      </div>

      <ng-container *ngIf="workspace as ws">
        <!-- Prescription header -->
        <header class="px-5 pt-4 pb-3 border-b border-borderGray/60 space-y-3">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center flex-wrap gap-2">
                <h2 class="text-lg font-semibold text-regular m-0">{{ ws.prescriptionNumber }}</h2>
                <boo-status-badge [label]="statusLabel(ws.status)" [tone]="statusTone(ws.status)" dotted></boo-status-badge>
              </div>
              <p class="text-xs text-secondary mt-1 mb-0">
                Dr. {{ ws.prescribingDoctor }} · Issued {{ ws.createdAt | date:'dd MMM yyyy, HH:mm' }}<ng-container *ngIf="ws.dispensingStartedAt"> · Started {{ ws.dispensingStartedAt | date:'HH:mm' }}</ng-container>
              </p>
            </div>
            <button boo-button variant="ghost" size="sm" (click)="refresh.emit()" [disabled]="loading" aria-label="Reload prescription">
              <physio-icon name="refresh" [size]="16" [class]="loading ? 'animate-spin' : ''"></physio-icon>Reload
            </button>
          </div>

          <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
            <p class="text-sm font-semibold text-regular m-0">{{ ws.patient.fullName }}
              <span class="font-normal text-secondary">· {{ ws.patient.gender }}, {{ ws.patient.ageYears }}y · {{ ws.patient.mrn }}</span></p>
            <p *ngIf="ws.patient.insuranceProvider" class="text-xs text-secondary m-0">
              {{ ws.patient.insuranceProvider }} · {{ ws.patient.insuranceCovered ? 'Insurance covered' : 'Not covered' }}</p>
          </div>

          <!-- Patient safety -->
          <div *ngIf="hasSafetyInfo(ws)" class="flex flex-wrap gap-1.5" aria-label="Patient safety information">
            <boo-status-badge *ngFor="let a of ws.patient.allergies" [label]="'Allergy: ' + a" tone="danger"></boo-status-badge>
            <boo-status-badge *ngIf="ws.patient.allergyFreeText" [label]="'Allergy note: ' + ws.patient.allergyFreeText" tone="warning"></boo-status-badge>
            <boo-status-badge *ngFor="let c of ws.patient.chronicConditions" [label]="c" tone="neutral"></boo-status-badge>
            <boo-status-badge *ngIf="ws.patient.isPregnant" label="Pregnancy" tone="warning"></boo-status-badge>
            <boo-status-badge *ngIf="ws.patient.isPediatric" label="Paediatric" tone="primary"></boo-status-badge>
            <boo-status-badge *ngIf="ws.patient.isElderly" label="Elderly" tone="primary"></boo-status-badge>
            <boo-status-badge *ngIf="ws.patient.isHighRisk" label="High risk" tone="danger"></boo-status-badge>
          </div>
          <p *ngIf="ws.patient.primaryDiagnosis" class="text-xs text-secondary m-0">Diagnosis: <span class="font-medium text-regular">{{ ws.patient.primaryDiagnosis }}</span></p>

          <dispense-progress-stepper [currentStage]="ws.currentStage"></dispense-progress-stepper>
        </header>

        <!-- Body -->
        <div class="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4">
          <div *ngIf="readOnlyReason(ws) as reason" class="flex items-start gap-2 rounded-2 bg-gray-50 border border-borderGray/60 px-3 py-2 text-xs text-secondary" role="status">
            <physio-icon name="lock" [size]="14" class="mt-0.5 shrink-0"></physio-icon><span>{{ reason }}</span>
          </div>

          <!-- Clinical alerts -->
          <section *ngIf="warnings(ws).length" aria-label="Clinical alerts" class="rounded-2 border border-rose-200 overflow-hidden">
            <h3 class="m-0 px-4 py-2 bg-rose-50 border-b border-rose-200 text-sm font-semibold text-rose-700 flex items-center gap-2">
              <physio-icon name="shield-alert" [size]="16"></physio-icon>Clinical alerts ({{ warnings(ws).length }})
            </h3>
            <ul class="list-none m-0 p-0 divide-y divide-rose-100">
              <li *ngFor="let w of warnings(ws)" class="px-4 py-3 flex items-start justify-between gap-3" [attr.role]="w.severity === 'Critical' && !w.acknowledged ? 'alert' : null">
                <div class="min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <boo-status-badge [label]="w.severity" [tone]="severityTone(w.severity)" dotted></boo-status-badge>
                    <span class="text-xs font-semibold text-secondary">{{ w.itemName }}</span>
                  </div>
                  <p class="text-sm text-regular m-0">{{ w.message }}</p>
                  <p *ngIf="w.recommendation" class="text-xs text-secondary mt-0.5 mb-0">{{ w.recommendation }}</p>
                </div>
                <boo-status-badge *ngIf="w.acknowledged" label="Acknowledged" tone="success"></boo-status-badge>
                <button *ngIf="!w.acknowledged && canAct(ws)" boo-button size="sm" variant="secondary" class="shrink-0" [disabled]="locked" [loading]="busyKey === 'ack:' + w.id"
                  (click)="acknowledge.emit(w.id)">Acknowledge</button>
              </li>
            </ul>
          </section>

          <!-- Review / Dispense -->
          <div *ngIf="canAct(ws)" role="tablist" aria-label="Workspace mode" class="inline-flex rounded-2 bg-gray-100 p-1 gap-1">
            <button type="button" role="tab" id="dispense-tab-review" [attr.aria-selected]="tab === 'review'" aria-controls="dispense-tabpanel" (click)="tabChange.emit('review')"
              class="h-9 px-4 rounded-1.5 text-sm font-semibold" [ngClass]="tab === 'review' ? 'bg-surface text-regular shadow-sm' : 'text-secondary hover:text-regular'">Review</button>
            <button type="button" role="tab" id="dispense-tab-dispense" [attr.aria-selected]="tab === 'dispense'" aria-controls="dispense-tabpanel" (click)="tabChange.emit('dispense')"
              class="h-9 px-4 rounded-1.5 text-sm font-semibold" [ngClass]="tab === 'dispense' ? 'bg-surface text-regular shadow-sm' : 'text-secondary hover:text-regular'">Dispense</button>
          </div>

          <div id="dispense-tabpanel" [attr.role]="canAct(ws) ? 'tabpanel' : null" [attr.aria-labelledby]="canAct(ws) ? 'dispense-tab-' + tab : null" class="space-y-3">
            <h3 *ngIf="!canAct(ws)" class="text-sm font-semibold text-regular m-0">Medicines ({{ ws.items.length }})</h3>
            <boo-empty-state *ngIf="!ws.items.length" icon="pill" title="No medicines on this prescription"></boo-empty-state>
            <dispense-medicine-card *ngFor="let item of ws.items; trackBy: trackById" [item]="item"
              [mode]="canAct(ws) && tab === 'dispense' ? 'dispense' : 'review'" [locked]="locked"
              [busyAction]="lineBusyAction(item.id)" (act)="lineAction.emit($event)"></dispense-medicine-card>
          </div>
        </div>

        <!-- Dispense footer -->
        <footer *ngIf="canAct(ws) && tab === 'dispense'" class="border-t border-borderGray/60 bg-surface px-5 py-3 space-y-3">
          <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-3 items-end">
            <boo-textarea label="Pharmacist notes (optional)" [rows]="2" size="small" [maxlength]="2000" [disabled]="locked"
              [ngModel]="notes" (ngModelChange)="notesChange.emit($event)"></boo-textarea>
            <div class="flex flex-wrap items-center gap-2 lg:justify-end">
              <button boo-button variant="secondary" [disabled]="locked" [loading]="busyKey === 'hold'" (click)="hold.emit()"><physio-icon name="pause" [size]="16"></physio-icon>Hold</button>
              <button boo-button variant="secondary" classname="!text-rose-700 !border-rose-300 hover:!bg-rose-50" [disabled]="locked" [loading]="busyKey === 'cancel'" (click)="cancel.emit()">Cancel prescription</button>
              <button boo-button variant="primary" [disabled]="locked || !!blockReason(ws)" [loading]="busyKey === 'complete'" (click)="complete.emit()"><physio-icon name="check" [size]="16"></physio-icon>Complete dispensing</button>
            </div>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-2 text-xs" aria-live="polite">
            <span class="text-secondary">{{ readyCount(ws) }} of {{ ws.items.length }} lines ready</span>
            <span *ngIf="blockReason(ws) as reason" class="text-amber-700 flex items-center gap-1.5"><physio-icon name="info" [size]="14"></physio-icon>{{ reason }}</span>
          </div>
        </footer>
      </ng-container>
    </section>
  `,
})
export class DispenseDetailPanelComponent {
  @Input() workspace: DispenseWorkspace | null = null;
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() errorState: BooInlineErrorState = 'default';
  @Input() tab: DispenseWorkspaceTab = 'review';
  /** The user holds the dispensing:process permission. */
  @Input() canProcess = false;
  /** A mutation is in flight: all actions are disabled. */
  @Input() locked = false;
  @Input() busyKey: string | null = null;
  @Input() notes = '';

  @Output() tabChange = new EventEmitter<DispenseWorkspaceTab>();
  @Output() notesChange = new EventEmitter<string>();
  @Output() acknowledge = new EventEmitter<string>();
  @Output() lineAction = new EventEmitter<DispenseLineAction>();
  @Output() hold = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() complete = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();
  @Output() retry = new EventEmitter<void>();

  readonly statusLabel = dispenseStatusLabel;
  readonly statusTone = dispenseStatusTone;
  readonly severityTone = severityTone;

  /** Dispensing actions exist only for users who may process and for sessions that are still open. */
  canAct(ws: DispenseWorkspace): boolean {
    return this.canProcess && !isClosedStatus(ws.status);
  }

  readOnlyReason(ws: DispenseWorkspace): string | null {
    if (ws.status === 'Completed') return 'This prescription has been dispensed. It is shown for review only.';
    if (ws.status === 'Cancelled') return 'This prescription was cancelled. It is shown for review only.';
    if (!this.canProcess) return 'You can review this prescription but do not have permission to dispense it.';
    return null;
  }

  warnings(ws: DispenseWorkspace): FlatWarning[] {
    return ws.items
      .flatMap(item => item.warnings.map(w => ({ ...w, itemName: item.name })))
      .sort((a, b) => Number(a.acknowledged) - Number(b.acknowledged) || severityRank(b.severity) - severityRank(a.severity));
  }

  hasSafetyInfo(ws: DispenseWorkspace): boolean {
    const p = ws.patient;
    return !!(p.allergies.length || p.allergyFreeText || p.chronicConditions.length || p.isPregnant || p.isPediatric || p.isElderly || p.isHighRisk);
  }

  readyCount(ws: DispenseWorkspace): number {
    return ws.items.filter(isLineReady).length;
  }

  blockReason(ws: DispenseWorkspace): string | null {
    return completionBlockReason(ws);
  }

  /** Spinner target for the line that is mid-request ('status' | 'reserve' | 'hold'). */
  lineBusyAction(itemId: string): 'status' | 'reserve' | 'hold' | null {
    const [kind, id, detail] = (this.busyKey ?? '').split(':');
    if (id !== itemId) return null;
    if (kind === 'reserve') return 'reserve';
    if (kind === 'status') return detail === 'OnHold' ? 'hold' : 'status';
    return null;
  }

  trackById(_: number, item: DispenseMedicationItem): string {
    return item.id;
  }
}
