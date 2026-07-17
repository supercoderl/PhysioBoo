import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooButtonAdminComponent } from "../../../../components/button/boo-button-admin/boo-button-admin.component";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { StockTakeSummary } from "../../../../shared/types/stock-take.types";

@Component({
    selector: 'stock-take-complete-dialog',
    standalone: true,
    imports: [SharedModule, BooIconComponent, BooButtonAdminComponent],
    template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" (click)="close.emit()"></div>

      <div class="relative bg-surface rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        <div class="px-6 py-5 border-b border-gray-100 flex items-start gap-4">
          <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" [ngClass]="hasRemaining ? 'bg-amber-50' : 'bg-emerald-50'">
            <boo-icon [name]="hasRemaining ? 'triangle-alert' : 'circle-check-big'" [iconClass]="hasRemaining ? 'text-amber-600' : 'text-emerald-600'" [size]="20"></boo-icon>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900">Complete Counting</h3>
            <p class="text-sm text-gray-500 mt-1 leading-relaxed" *ngIf="hasRemaining">
              {{ summary?.remainingItems }} item(s) are still uncounted. Completing now submits the session for approval as-is.
            </p>
            <p class="text-sm text-gray-500 mt-1 leading-relaxed" *ngIf="!hasRemaining">
              All items counted. Submit this session for approval?
            </p>
          </div>
        </div>

        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <boo-button-admin background="transparent" (click)="close.emit()">Cancel</boo-button-admin>
          <boo-button-admin textColor="white" (click)="confirm.emit()">Complete Counting</boo-button-admin>
        </div>
      </div>
    </div>
  `,
})
export class StockTakeCompleteDialogComponent {
    @Input() isOpen = false;
    @Input() summary: StockTakeSummary | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() confirm = new EventEmitter<void>();

    get hasRemaining(): boolean {
        return (this.summary?.remainingItems ?? 0) > 0;
    }
}
