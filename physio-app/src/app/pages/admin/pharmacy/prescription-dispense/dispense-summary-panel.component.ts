import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../components/ui/empty-state.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { DispenseWorkspace } from "../../../../shared/types/dispensing.types";

@Component({
    selector: 'dispense-summary-panel',
    standalone: true,
    imports: [SharedModule, BooIconComponent, EmptyStateComponent],
    template: `
    <div class="h-full flex flex-col bg-surface rounded-2 border border-borderGray/60 overflow-hidden">
      <div class="p-3 border-b border-borderGray/60">
        <h2 class="text-sm font-semibold text-regular">Dispensing Summary</h2>
      </div>

      <boo-empty-state *ngIf="!workspace" icon="receipt" title="No prescription selected"
        class="flex-1 flex items-center justify-center"></boo-empty-state>

      <ng-container *ngIf="workspace">
        <div class="flex-1 overflow-y-auto p-3 space-y-3">
          <div class="grid grid-cols-2 gap-2">
            <div class="rounded-1.5 bg-emerald-50 px-3 py-2">
              <p class="text-[11px] text-emerald-700">Items Dispensed</p>
              <p class="text-lg font-bold text-emerald-700">{{ dispensedCount }}</p>
            </div>
            <div class="rounded-1.5 bg-amber-50 px-3 py-2">
              <p class="text-[11px] text-amber-700">Items Remaining</p>
              <p class="text-lg font-bold text-amber-700">{{ remainingCount }}</p>
            </div>
          </div>

          <div class="space-y-1.5 text-xs">
            <div class="flex items-center justify-between"><span class="text-secondary">Inventory Changes</span><span class="font-medium text-regular">{{ workspace.items.length }} line(s)</span></div>
            <div class="flex items-center justify-between"><span class="text-secondary">Insurance</span><span class="font-medium text-regular">{{ workspace.patient.insuranceProvider || '—' }}</span></div>
            <div class="flex items-center justify-between"><span class="text-secondary">Patient Payment</span><span class="font-medium text-regular">{{ workspace.patient.insuranceCovered ? 'Co-pay applies' : 'Full payment' }}</span></div>
            <div class="flex items-center justify-between"><span class="text-secondary">Dispensing Time</span><span class="font-medium text-regular">{{ elapsedLabel }}</span></div>
            <div class="flex items-center justify-between"><span class="text-secondary">Pharmacist</span><span class="font-medium text-regular">Current Pharmacist</span></div>
          </div>

          <div *ngIf="blockReason" class="px-3 py-2 rounded-1.5 bg-amber-50 text-amber-800 text-[11px] flex items-start gap-2">
            <boo-icon name="info" [size]="13" iconClass="mt-0.5 shrink-0"></boo-icon>
            <span>{{ blockReason }}</span>
          </div>
        </div>

        <div class="p-3 border-t border-borderGray/60 space-y-2">
          <button type="button" [disabled]="!!blockReason" (click)="complete.emit()"
            class="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            [title]="blockReason || ''">
            Complete Dispensing
          </button>
          <div class="grid grid-cols-3 gap-2">
            <button type="button" (click)="hold.emit()" class="py-2 rounded-lg text-xs font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50">Hold</button>
            <button type="button" (click)="cancel.emit()" class="py-2 rounded-lg text-xs font-semibold border border-rose-200 text-rose-600 hover:bg-rose-50">Cancel</button>
            <button type="button" (click)="printLabels.emit()" class="py-2 rounded-lg text-xs font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50">Print</button>
          </div>
        </div>
      </ng-container>
    </div>
  `,
})
export class DispenseSummaryPanelComponent {
    @Input() workspace: DispenseWorkspace | null = null;

    @Output() complete = new EventEmitter<void>();
    @Output() hold = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();
    @Output() printLabels = new EventEmitter<void>();

    get dispensedCount(): number {
        return this.workspace?.items.filter(i => i.status === 'Dispensed' || i.status === 'Picked' || i.status === 'Verified').length ?? 0;
    }

    get remainingCount(): number {
        return this.workspace ? this.workspace.items.length - this.dispensedCount : 0;
    }

    get elapsedLabel(): string {
        if (!this.workspace?.dispensingStartedAt) return 'Not started';
        const minutes = Math.round((Date.now() - new Date(this.workspace.dispensingStartedAt).getTime()) / 60000);
        return `${minutes} min`;
    }

    get blockReason(): string | null {
        if (!this.workspace) return 'No prescription selected';
        const unacknowledgedCritical = this.workspace.items.some(i => i.warnings.some(w => w.severity === 'Critical' && !w.acknowledged));
        if (unacknowledgedCritical) return 'Acknowledge all Critical clinical alerts before completing.';
        const notPicked = this.workspace.items.some(i => i.status === 'NotPicked');
        if (notPicked) return 'Pick or resolve every medication line before completing.';
        return null;
    }
}
