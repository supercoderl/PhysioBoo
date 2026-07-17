import { Component, EventEmitter, Output, signal } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../shared/shared-imports";

export type QuickOperation = 'Receiving' | 'Transfer' | 'Adjustment' | 'StockCount' | 'BatchMerge' | 'BatchSplit' | 'Audit';

interface QuickOpDef {
    key: QuickOperation;
    label: string;
    icon: string;
}

@Component({
    selector: 'inventory-quick-actions',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
    <div class="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2">
      <div *ngIf="open()" class="bg-surface border border-gray-200 rounded-1.5 shadow-2xl p-2 w-56">
        <button type="button" *ngFor="let op of operations" (click)="select.emit(op.key); open.set(false)"
          class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100">
          <boo-icon [name]="op.icon" [size]="15" iconClass="text-primary"></boo-icon>
          {{ op.label }}
        </button>
      </div>
      <button type="button" (click)="open.set(!open())" title="Quick Operations"
        class="w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:opacity-90">
        <boo-icon [name]="open() ? 'x' : 'plus'" [size]="20"></boo-icon>
      </button>
    </div>
  `,
})
export class InventoryQuickActionsComponent {
    @Output() select = new EventEmitter<QuickOperation>();

    open = signal(false);

    readonly operations: QuickOpDef[] = [
        { key: 'Receiving', label: 'Stock Receiving', icon: 'truck' },
        { key: 'Transfer', label: 'Stock Transfer', icon: 'repeat' },
        { key: 'Adjustment', label: 'Stock Adjustment', icon: 'settings-2' },
        { key: 'StockCount', label: 'Stock Count', icon: 'clipboard-check' },
        { key: 'BatchMerge', label: 'Batch Merge', icon: 'layers' },
        { key: 'BatchSplit', label: 'Batch Split', icon: 'split' },
        { key: 'Audit', label: 'Inventory Audit', icon: 'clipboard-list' },
    ];
}
