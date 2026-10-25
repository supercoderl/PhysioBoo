import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { BooButtonComponent } from '@physioboo/ui';
import { SharedModule } from "../../../../shared/shared-imports";
import { DispenseSummary } from "../../../../shared/types/dispensing.types";

/** Shows what the server actually recorded when a dispensing was completed. */
@Component({
  selector: 'dispense-result-dialog',
  standalone: true,
  imports: [SharedModule, BooButtonComponent],
  template: `
    <div *ngIf="summary" class="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40" (click)="close.emit()" aria-hidden="true"></div>
      <div #panel tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="dispense-result-title"
        class="relative bg-surface rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 focus:outline-none">
        <div class="px-6 pt-5 pb-4 flex items-start gap-4">
          <div class="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0"><physio-icon name="circle-check" [size]="20" class="text-emerald-600"></physio-icon></div>
          <div>
            <h2 id="dispense-result-title" class="text-lg font-semibold text-gray-900 m-0">{{ summary.itemsRemainingCount ? 'Partially dispensed' : 'Dispensing complete' }}</h2>
            <p class="text-sm text-gray-600 mt-1 mb-0">{{ prescriptionNumber }}<ng-container *ngIf="summary.itemsRemainingCount"> · {{ summary.itemsRemainingCount }} {{ summary.itemsRemainingCount === 1 ? 'line' : 'lines' }} still to dispense.</ng-container></p>
          </div>
        </div>
        <dl class="px-6 pb-5 m-0 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div><dt class="text-xs text-secondary">Lines dispensed</dt><dd class="font-semibold text-regular m-0">{{ summary.itemsDispensedCount }}</dd></div>
          <div><dt class="text-xs text-secondary">Lines remaining</dt><dd class="font-semibold text-regular m-0">{{ summary.itemsRemainingCount }}</dd></div>
          <div><dt class="text-xs text-secondary">Stock movements recorded</dt><dd class="font-semibold text-regular m-0">{{ summary.inventoryChangesCount }}</dd></div>
          <div><dt class="text-xs text-secondary">Dispensing time</dt><dd class="font-semibold text-regular m-0">{{ duration }}</dd></div>
          <div><dt class="text-xs text-secondary">Covered by insurance</dt><dd class="font-semibold text-regular m-0">{{ summary.insuranceCoverageAmount | number:'1.2-2' }}</dd></div>
          <div><dt class="text-xs text-secondary">Patient payment</dt><dd class="font-semibold text-regular m-0">{{ summary.patientPaymentAmount | number:'1.2-2' }}</dd></div>
          <div class="col-span-2" *ngIf="summary.pharmacistName"><dt class="text-xs text-secondary">Pharmacist</dt><dd class="font-semibold text-regular m-0">{{ summary.pharmacistName }}</dd></div>
        </dl>
        <div class="px-6 py-4 bg-gray-50 flex justify-end">
          <button boo-button variant="primary" (click)="close.emit()">Done</button>
        </div>
      </div>
    </div>
  `,
})
export class DispenseResultDialogComponent implements OnChanges {
  @Input() summary: DispenseSummary | null = null;
  @Input() prescriptionNumber = '';
  @Output() close = new EventEmitter<void>();

  @ViewChild('panel') private panel?: ElementRef<HTMLElement>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['summary'] && this.summary) setTimeout(() => this.panel?.nativeElement.focus());
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.summary) this.close.emit();
  }

  get duration(): string {
    const seconds = this.summary?.dispensingTimeSeconds ?? 0;
    return seconds < 60 ? `${seconds} s` : `${Math.floor(seconds / 60)} min ${seconds % 60} s`;
  }
}
