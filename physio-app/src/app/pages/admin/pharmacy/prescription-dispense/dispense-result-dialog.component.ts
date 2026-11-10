import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooButtonComponent, BooDialogComponent } from '@physioboo/ui';
import { SharedModule } from "../../../../shared/shared-imports";
import { DispenseSummary } from "../../../../shared/types/dispensing.types";

/** Shows what the server actually recorded when a dispensing was completed. */
@Component({
  selector: 'dispense-result-dialog',
  standalone: true,
  imports: [SharedModule, BooButtonComponent, BooDialogComponent],
  template: `
    <boo-dialog *ngIf="summary" [heading]="summary.itemsRemainingCount ? 'Partially dispensed' : 'Dispensing complete'" [description]="subtitle" tone="success" icon="circle-check" (dismiss)="close.emit()">
        <dl class="m-0 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div><dt class="text-xs text-secondary">Lines dispensed</dt><dd class="font-semibold text-regular m-0">{{ summary.itemsDispensedCount }}</dd></div>
          <div><dt class="text-xs text-secondary">Lines remaining</dt><dd class="font-semibold text-regular m-0">{{ summary.itemsRemainingCount }}</dd></div>
          <div><dt class="text-xs text-secondary">Stock movements recorded</dt><dd class="font-semibold text-regular m-0">{{ summary.inventoryChangesCount }}</dd></div>
          <div><dt class="text-xs text-secondary">Dispensing time</dt><dd class="font-semibold text-regular m-0">{{ duration }}</dd></div>
          <div><dt class="text-xs text-secondary">Covered by insurance</dt><dd class="font-semibold text-regular m-0">{{ summary.insuranceCoverageAmount | number:'1.2-2' }}</dd></div>
          <div><dt class="text-xs text-secondary">Patient payment</dt><dd class="font-semibold text-regular m-0">{{ summary.patientPaymentAmount | number:'1.2-2' }}</dd></div>
          <div class="col-span-2" *ngIf="summary.pharmacistName"><dt class="text-xs text-secondary">Pharmacist</dt><dd class="font-semibold text-regular m-0">{{ summary.pharmacistName }}</dd></div>
        </dl>
        <button boo-dialog-footer type="button" boo-button variant="primary" size="sm" (click)="close.emit()">Done</button>
    </boo-dialog>
  `,
})
export class DispenseResultDialogComponent {
  @Input() summary: DispenseSummary | null = null;
  @Input() prescriptionNumber = '';
  @Output() close = new EventEmitter<void>();



  get subtitle(): string {
    const remaining = this.summary?.itemsRemainingCount ?? 0;
    return this.prescriptionNumber + (remaining ? ` · ${remaining} ${remaining === 1 ? 'line' : 'lines'} still to dispense.` : '');
  }

  get duration(): string {
    const seconds = this.summary?.dispensingTimeSeconds ?? 0;
    return seconds < 60 ? `${seconds} s` : `${Math.floor(seconds / 60)} min ${seconds % 60} s`;
  }
}
