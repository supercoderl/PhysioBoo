import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../components/ui/empty-state.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../components/ui/status-badge.component";
import { SharedModule } from "../../../../shared/shared-imports";
import {
  DispenseItemStatus,
  DispenseMedicationItem,
  DispenseWorkspace,
  severityRank,
} from "../../../../shared/types/dispensing.types";
import { ClinicalWarning } from "../../../../shared/types/prescription-rx.types";
import { DispenseProgressStepperComponent } from "./dispense-progress-stepper.component";

interface FlatWarning extends ClinicalWarning {
    itemId: string;
    itemName: string;
}

@Component({
    selector: 'dispense-picking-panel',
    standalone: true,
    imports: [SharedModule, BooIconComponent, StatusBadgeComponent, EmptyStateComponent, DispenseProgressStepperComponent],
    template: `
    <div class="h-full flex flex-col bg-surface rounded-2 border border-borderGray/60 overflow-hidden">
      <boo-empty-state *ngIf="!workspace" icon="clipboard-list" title="Select a prescription from the queue to begin verification"
        class="flex-1 flex items-center justify-center"></boo-empty-state>

      <ng-container *ngIf="workspace">
        <!-- Sticky patient & clinical context -->
        <div class="p-3 border-b border-borderGray/60 sticky top-0 bg-surface z-10">
          <div class="flex items-start justify-between gap-3 mb-2">
            <div>
              <p class="text-sm font-semibold text-regular">{{ workspace.patient.fullName }} <span class="text-secondary font-normal">· {{ workspace.patient.gender }}, {{ workspace.patient.ageYears }}y</span></p>
              <p class="text-[11px] text-secondary">{{ workspace.patient.mrn }} · {{ workspace.prescriptionNumber }} · Dr. {{ workspace.prescribingDoctor }}</p>
            </div>
            <boo-status-badge [label]="workspace.status" tone="primary" dotted></boo-status-badge>
          </div>

          <div class="flex flex-wrap gap-1.5 mb-2">
            <span *ngFor="let a of workspace.patient.allergies" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700">
              <boo-icon name="triangle-alert" [size]="11"></boo-icon> Allergy: {{ a }}
            </span>
            <span *ngIf="workspace.patient.allergyFreeText" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700" title="Free-text allergy — verify manually">
              <boo-icon name="triangle-alert" [size]="11"></boo-icon> {{ workspace.patient.allergyFreeText }}
            </span>
            <span *ngFor="let c of workspace.patient.chronicConditions" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">{{ c }}</span>
            <span *ngIf="workspace.patient.isPregnant" class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-pink-50 text-pink-700">Pregnancy</span>
            <span *ngIf="workspace.patient.isPediatric" class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700">Pediatric</span>
            <span *ngIf="workspace.patient.isHighRisk" class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700">High Risk</span>
          </div>

          <p class="text-[11px] text-secondary mb-2" *ngIf="workspace.patient.primaryDiagnosis">Diagnosis: <span class="text-regular font-medium">{{ workspace.patient.primaryDiagnosis }}</span></p>

          <dispense-progress-stepper [currentStage]="workspace.currentStage"></dispense-progress-stepper>
        </div>

        <div class="flex-1 overflow-y-auto p-3 space-y-3">
          <!-- Clinical alerts -->
          <div *ngIf="flatWarnings.length" class="rounded-1.5 border border-rose-200 bg-rose-50/40 overflow-hidden">
            <div class="px-3 py-2 flex items-center gap-2 bg-rose-50 border-b border-rose-200">
              <boo-icon name="shield-alert" [size]="14" iconClass="text-rose-600"></boo-icon>
              <span class="text-xs font-semibold text-rose-700">Clinical Alerts ({{ flatWarnings.length }})</span>
            </div>
            <div class="divide-y divide-rose-100">
              <div *ngFor="let w of flatWarnings" class="px-3 py-2 flex items-start justify-between gap-3" [attr.role]="w.severity === 'Critical' ? 'alert' : null">
                <div class="min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <boo-status-badge [label]="w.severity" [tone]="severityTone(w.severity)" dotted></boo-status-badge>
                    <span class="text-[11px] font-semibold text-secondary">{{ w.itemName }}</span>
                  </div>
                  <p class="text-xs text-regular">{{ w.message }}</p>
                  <p class="text-[11px] text-secondary mt-0.5" *ngIf="w.recommendation">{{ w.recommendation }}</p>
                </div>
                <button type="button" *ngIf="!w.acknowledged" (click)="acknowledgeAlert.emit({ itemId: w.itemId, alertId: w.id })"
                  class="shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white border border-rose-300 text-rose-700 hover:bg-rose-100">
                  Acknowledge
                </button>
                <boo-status-badge *ngIf="w.acknowledged" label="Acknowledged" tone="success"></boo-status-badge>
              </div>
            </div>
          </div>

          <!-- Picking list -->
          <div class="space-y-2">
            <div *ngFor="let item of workspace.items" class="rounded-1.5 border border-borderGray/60 p-3" [ngClass]="hasUnacknowledgedCritical(item) ? 'border-rose-300 bg-rose-50/20' : ''">
              <div class="flex items-start justify-between gap-3">
                <button type="button" class="flex items-start gap-3 text-left min-w-0" (click)="openDrawer.emit(item)">
                  <input type="checkbox" class="mt-1 w-4 h-4 accent-primary" [checked]="item.status === 'Picked' || item.status === 'Verified' || item.status === 'Dispensed'"
                    (click)="$event.stopPropagation()" (change)="togglePick(item)" [disabled]="hasUnacknowledgedCritical(item)" />
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-regular">
                      {{ item.name }} <span class="text-secondary font-normal" *ngIf="item.strength">· {{ item.strength }}</span>
                      <boo-icon *ngIf="item.isHighAlert" name="octagon-alert" [size]="13" iconClass="text-rose-600 inline ml-1" title="High-alert medication"></boo-icon>
                    </p>
                    <p class="text-[11px] text-secondary">Shelf {{ item.shelfLocation }} · Batch {{ item.batchNo }} · Exp {{ item.expiryDate }}</p>
                    <p class="text-[11px] text-secondary">{{ item.dose }} · {{ item.frequency }} · {{ item.durationDays }}d</p>
                  </div>
                </button>
                <boo-status-badge [label]="item.status" [tone]="itemStatusTone(item.status)"></boo-status-badge>
              </div>

              <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                <div class="flex items-center gap-2">
                  <label class="text-[11px] text-secondary">Qty</label>
                  <input type="number" min="0" [max]="item.qtyPrescribed" [ngModel]="item.qtyToDispense"
                    (ngModelChange)="qtyChange.emit({ itemId: item.id, qty: $event })"
                    class="w-16 px-2 py-1 text-xs border border-gray-300 rounded-lg" />
                  <span class="text-[11px] text-secondary">/ {{ item.qtyPrescribed }} {{ item.unit }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <button type="button" (click)="replaceItem.emit(item)" title="Replace Medicine" class="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100">
                    <boo-icon name="repeat" [size]="14" iconClass="text-gray-500"></boo-icon>
                  </button>
                  <button type="button" (click)="reserveItem.emit(item)" title="Reserve Item" class="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100">
                    <boo-icon name="package-search" [size]="14" iconClass="text-gray-500"></boo-icon>
                  </button>
                  <button type="button" (click)="cancelItem.emit(item)" title="Cancel Item" class="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose-50">
                    <boo-icon name="x" [size]="14" iconClass="text-rose-500"></boo-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes + barcode -->
          <div class="space-y-2">
            <label class="block text-[11px] font-medium text-secondary">Dispensing Notes</label>
            <textarea rows="2" [ngModel]="workspace.pharmacistNotes" (ngModelChange)="notesChange.emit($event)"
              placeholder="Pharmacist notes, counseling points, special instructions..."
              class="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary"></textarea>

            <div class="relative">
              <boo-icon name="scan-line" [size]="14" iconClass="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"></boo-icon>
              <input #barcodeInput type="text" placeholder="Scan barcode (Ctrl+B to focus)..."
                (keydown.enter)="onBarcode(barcodeInput)"
                class="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg allow-shortcut focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
})
export class DispensePickingPanelComponent {
    @Input() workspace: DispenseWorkspace | null = null;

    @Output() openDrawer = new EventEmitter<DispenseMedicationItem>();
    @Output() qtyChange = new EventEmitter<{ itemId: string; qty: number }>();
    @Output() pickItem = new EventEmitter<DispenseMedicationItem>();
    @Output() acknowledgeAlert = new EventEmitter<{ itemId: string; alertId: string }>();
    @Output() replaceItem = new EventEmitter<DispenseMedicationItem>();
    @Output() reserveItem = new EventEmitter<DispenseMedicationItem>();
    @Output() cancelItem = new EventEmitter<DispenseMedicationItem>();
    @Output() notesChange = new EventEmitter<string>();
    @Output() barcodeScan = new EventEmitter<string>();

    get flatWarnings(): FlatWarning[] {
        if (!this.workspace) return [];
        return this.workspace.items
            .flatMap(item => item.warnings.map(w => ({ ...w, itemId: item.id, itemName: item.name })))
            .sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
    }

    hasUnacknowledgedCritical(item: DispenseMedicationItem): boolean {
        return item.warnings.some(w => w.severity === 'Critical' && !w.acknowledged);
    }

    togglePick(item: DispenseMedicationItem): void {
        this.pickItem.emit(item);
    }

    onBarcode(input: HTMLInputElement): void {
        const value = input.value.trim();
        if (!value) return;
        this.barcodeScan.emit(value);
        input.value = '';
    }

    severityTone(severity: string): BadgeTone {
        switch (severity) {
            case 'Critical': return 'danger';
            case 'High': return 'danger';
            case 'Medium': return 'warning';
            case 'Low': return 'neutral';
            default: return 'primary';
        }
    }

    itemStatusTone(status: DispenseItemStatus): BadgeTone {
        switch (status) {
            case 'NotPicked': return 'neutral';
            case 'Picked': return 'primary';
            case 'Verified': return 'primary';
            case 'Dispensed': return 'success';
            case 'OnHold': return 'warning';
            case 'Replaced': return 'warning';
            case 'Reserved': return 'warning';
            default: return 'neutral';
        }
    }
}
