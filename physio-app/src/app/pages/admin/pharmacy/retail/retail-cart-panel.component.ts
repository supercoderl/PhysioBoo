import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../components/ui/empty-state.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { RetailCart, RetailCartLineItem } from "../../../../shared/types/retail-pos.types";

@Component({
  selector: 'retail-cart-panel',
  standalone: true,
  imports: [SharedModule, BooIconComponent, EmptyStateComponent],
  template: `
    <div class="bg-surface border border-gray-200 rounded-lg flex flex-col h-full">
      <div class="p-3 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 class="text-sm font-semibold text-gray-800">{{ cart?.name || 'Cart' }} ({{ cart?.items?.length || 0 }})</h2>
        </div>
        <button *ngIf="cart && cart.items.length > 0" type="button" (click)="clearAll.emit()" class="text-xs font-semibold text-rose-600 hover:text-rose-700">
          Clear All
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-3">
        <boo-empty-state *ngIf="!cart || !cart.items.length" icon="shopping-cart" title="Cart is empty" description="Scan or search a medicine to begin"></boo-empty-state>

        <div *ngFor="let item of cart?.items; trackBy: trackById" class="mb-3 pb-3 border-b border-gray-100 last:border-0">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ item.name }}</p>
              <p class="text-xs text-gray-500 truncate">{{ item.genericName }} · {{ item.strength }} · {{ item.packageLabel }}</p>
            </div>
            <button type="button" (click)="removeItem.emit(item.id)" class="text-gray-400 hover:text-rose-600 shrink-0" aria-label="Remove item">
              <boo-icon name="x" [size]="16"></boo-icon>
            </button>
          </div>

          <div class="flex items-center gap-3 mt-2">
            <div class="flex items-center border border-gray-300 rounded-lg">
              <button type="button" (click)="changeQuantity(item, -1)" class="px-2.5 py-1 hover:bg-gray-100" [attr.aria-label]="'Decrease quantity for ' + item.name">−</button>
              <input type="number" [ngModel]="item.quantity" (ngModelChange)="setQuantity(item, $event)" min="1" [max]="item.stock"
                [attr.aria-label]="'Quantity for ' + item.name"
                class="w-12 text-center border-x border-gray-300 py-1 text-sm outline-none" />
              <button type="button" (click)="changeQuantity(item, 1)" [disabled]="item.quantity >= item.stock" class="px-2.5 py-1 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed" [attr.aria-label]="'Increase quantity for ' + item.name">+</button>
            </div>

            <div class="flex items-center gap-1 flex-1">
              <input type="number" [ngModel]="item.discountPercent" (ngModelChange)="setDiscount(item, $event)" min="0" max="100"
                [attr.aria-label]="'Discount percent for ' + item.name"
                class="w-16 px-2 py-1 border border-gray-300 rounded text-xs outline-none focus:ring-2 focus:ring-primary/30" />
              <span class="text-xs text-gray-400">% off</span>
            </div>
          </div>

          <div class="flex items-center justify-between mt-1.5">
            <span class="text-xs text-gray-500">\${{ item.unitPrice.toFixed(2) }} × {{ item.quantity }}</span>
            <span class="text-sm font-semibold text-gray-900">\${{ item.total.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RetailCartPanelComponent {
  @Input() cart: RetailCart | null = null;
  @Output() quantityChange = new EventEmitter<{ lineItemId: string; quantity: number }>();
  @Output() discountChange = new EventEmitter<{ lineItemId: string; discountPercent: number }>();
  @Output() removeItem = new EventEmitter<string>();
  @Output() clearAll = new EventEmitter<void>();

  changeQuantity(item: RetailCartLineItem, delta: number): void {
    const next = item.quantity + delta;
    if (next < 1 || next > item.stock) return;
    this.quantityChange.emit({ lineItemId: item.id, quantity: next });
  }

  setQuantity(item: RetailCartLineItem, value: number): void {
    const qty = Math.max(1, Math.min(item.stock, Math.floor(value || 1)));
    this.quantityChange.emit({ lineItemId: item.id, quantity: qty });
  }

  setDiscount(item: RetailCartLineItem, value: number): void {
    const discount = Math.max(0, Math.min(100, value || 0));
    this.discountChange.emit({ lineItemId: item.id, discountPercent: discount });
  }

  trackById(_: number, item: RetailCartLineItem): string {
    return item.id;
  }
}
