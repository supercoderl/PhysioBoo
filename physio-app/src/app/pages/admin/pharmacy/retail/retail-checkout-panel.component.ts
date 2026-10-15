import { Component, EventEmitter, Input, Output } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { RetailCart } from "../../../../shared/types/retail-pos.types";
import { BooButtonAdminComponent } from "../../../../components/button/boo-button-admin/boo-button-admin.component";

const VAT_RATE = 0.05;

@Component({
  selector: 'retail-checkout-panel',
  standalone: true,
  imports: [SharedModule, BooButtonAdminComponent],
  template: `
    <div class="bg-surface border border-gray-200 rounded-lg flex flex-col h-full">
      <!-- Customer card -->
      <div class="p-3 border-b border-gray-200">
        <h2 class="text-sm font-semibold text-gray-800 mb-2">Customer</h2>

        <div *ngIf="!cart?.customer" class="flex gap-2">
          <boo-button-admin (click)="openCustomerLookup.emit()" background="transparent" textColor="#71606A" [border]="{ width: 1, style: 'dashed', color: '#E3D5DA' }" padding="8px 12px" [fontSize]="12" [radius]="8" fontWeight="600" [gap]="6" buttonClass="w-full" class="flex-1">
            <physio-icon name="search" [size]="14"></physio-icon> Search Patient
          </boo-button-admin>
          <span class="text-xs text-gray-400 self-center">or</span>
          <boo-button-admin (click)="useWalkIn.emit()" background="transparent" textColor="#71606A" [border]="{ width: 1, color: '#EFE3E7' }" padding="8px 12px" [fontSize]="12" [radius]="8" fontWeight="600" buttonClass="w-full" class="flex-1">
            Walk-in Customer
          </boo-button-admin>
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
              <physio-icon name="triangle-alert" [size]="11"></physio-icon> {{ cart!.customer!.allergyInformation }}
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
          <boo-button-admin (click)="checkout.emit()" [disabled]="!cart || !cart.items.length" textColor="white" padding="12px 12px" [fontSize]="14" [radius]="8" fontWeight="600" buttonClass="w-full" class="w-full">
            Checkout
          </boo-button-admin>
          <div class="flex gap-2">
            <boo-button-admin (click)="holdSale.emit()" [disabled]="!cart || !cart.items.length" background="transparent" textColor="#55434B" [border]="{ width: 1, color: '#E3D5DA' }" padding="8px 12px" [fontSize]="12" [radius]="8" fontWeight="600" buttonClass="w-full" class="flex-1">
              Hold Sale
            </boo-button-admin>
            <boo-button-admin (click)="printBill.emit()" [disabled]="!cart || !cart.items.length" background="transparent" textColor="#55434B" [border]="{ width: 1, color: '#E3D5DA' }" padding="8px 12px" [fontSize]="12" [radius]="8" fontWeight="600" buttonClass="w-full" class="flex-1">
              Print Bill
            </boo-button-admin>
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
