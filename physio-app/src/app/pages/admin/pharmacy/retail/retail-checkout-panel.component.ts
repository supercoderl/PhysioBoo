import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { RetailCart } from "../../../../shared/types/retail-pos.types";

const VAT_RATE = 0.05;

@Component({
  selector: 'retail-checkout-panel',
  standalone: true,
  imports: [SharedModule, BooIconComponent],
  template: `
    <div class="bg-surface border border-gray-200 rounded-lg flex flex-col h-full">
      <!-- Customer card -->
      <div class="p-3 border-b border-gray-200">
        <h2 class="text-sm font-semibold text-gray-800 mb-2">Customer</h2>

        <div *ngIf="!cart?.customer" class="flex gap-2">
          <button type="button" (click)="openCustomerLookup.emit()"
            class="flex-1 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-xs font-semibold text-gray-600 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1.5">
            <boo-icon name="search" [size]="14"></boo-icon> Search Patient
          </button>
          <span class="text-xs text-gray-400 self-center">or</span>
          <button type="button" (click)="useWalkIn.emit()"
            class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Walk-in Customer
          </button>
        </div>

        <div *ngIf="cart?.customer" class="bg-gray-50 rounded-lg p-3">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-semibold text-gray-900">{{ cart!.customer!.fullName }}</p>
              <p class="text-xs text-gray-500" *ngIf="cart!.customer!.mrn">MRN {{ cart!.customer!.mrn }}</p>
              <p class="text-xs text-gray-500">{{ cart!.customer!.phone }}</p>
            </div>
            <button type="button" (click)="openCustomerLookup.emit()" class="text-xs font-semibold text-primary hover:underline">Change</button>
          </div>

          <div class="flex flex-wrap gap-1.5 mt-2">
            <span *ngIf="cart!.customer!.insuranceProvider" class="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium">{{ cart!.customer!.insuranceProvider }}</span>
            <span *ngIf="cart!.customer!.loyaltyPoints" class="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-medium">{{ cart!.customer!.loyaltyPoints }} pts</span>
            <span *ngIf="cart!.customer!.prescriptionReference" class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-medium">Rx {{ cart!.customer!.prescriptionReference }}</span>
            <span *ngIf="cart!.customer!.allergyInformation" class="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-medium flex items-center gap-1">
              <boo-icon name="alert-triangle" [size]="11"></boo-icon> {{ cart!.customer!.allergyInformation }}
            </span>
          </div>
        </div>
      </div>

      <!-- Payment summary -->
      <div class="p-3 flex-1 flex flex-col justify-end">
        <div class="space-y-1.5 mb-4">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Subtotal</span>
            <span class="font-medium text-gray-800">\${{ subtotal().toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Discount</span>
            <span class="font-medium text-emerald-600">-\${{ discountTotal().toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Insurance Coverage</span>
            <span class="font-medium text-primary">-\${{ insuranceCoverage().toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">VAT (5%)</span>
            <span class="font-medium text-gray-800">\${{ vat().toFixed(2) }}</span>
          </div>
          <div class="pt-2 border-t border-gray-200 flex justify-between items-baseline">
            <span class="text-sm font-semibold text-gray-900">Grand Total</span>
            <span class="text-xl font-bold text-primary">\${{ grandTotal().toFixed(2) }}</span>
          </div>
        </div>

        <div class="space-y-2">
          <button type="button" (click)="checkout.emit()" [disabled]="!cart || !cart.items.length"
            class="w-full py-3 rounded-lg font-semibold text-sm transition-colors"
            [ngClass]="cart && cart.items.length ? 'bg-primary text-white hover:opacity-90' : 'bg-gray-200 text-gray-400 cursor-not-allowed'">
            Checkout
          </button>
          <div class="flex gap-2">
            <button type="button" (click)="holdSale.emit()" [disabled]="!cart || !cart.items.length"
              class="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Hold Sale
            </button>
            <button type="button" (click)="printBill.emit()" [disabled]="!cart || !cart.items.length"
              class="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Print Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RetailCheckoutPanelComponent {
  @Input() cart: RetailCart | null = null;
  @Output() openCustomerLookup = new EventEmitter<void>();
  @Output() useWalkIn = new EventEmitter<void>();
  @Output() checkout = new EventEmitter<void>();
  @Output() holdSale = new EventEmitter<void>();
  @Output() printBill = new EventEmitter<void>();

  subtotal(): number {
    return (this.cart?.items ?? []).reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  }

  discountTotal(): number {
    return (this.cart?.items ?? []).reduce((s, i) => s + (i.unitPrice * i.quantity * i.discountPercent / 100), 0);
  }

  insuranceCoverage(): number {
    return (this.cart?.items ?? []).reduce((s, i) => s + i.insuranceCoveredAmount, 0);
  }

  vat(): number {
    return Math.max(0, this.subtotal() - this.discountTotal() - this.insuranceCoverage()) * VAT_RATE;
  }

  grandTotal(): number {
    return Math.max(0, this.subtotal() - this.discountTotal() - this.insuranceCoverage() + this.vat());
  }
}
