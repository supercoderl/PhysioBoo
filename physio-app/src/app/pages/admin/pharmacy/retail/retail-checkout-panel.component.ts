import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooButtonComponent } from '@physioboo/ui';
import { SharedModule } from "../../../../shared/shared-imports";
import { RetailCart } from "../../../../shared/types/retail-pos.types";
import { formatRetailMoney, retailCartTotals } from "../../../../shared/utils/retail-pos.utils";

@Component({
  selector: 'retail-checkout-panel',
  standalone: true,
  imports: [SharedModule, BooButtonComponent],
  template: `
    <section class="flex flex-col border-t border-borderGray/60" aria-label="Customer and checkout">
      <div class="p-3 border-b border-borderGray/60">
        <h2 class="text-sm font-semibold text-regular m-0 mb-2">Customer</h2>

        <div *ngIf="!cart" class="text-xs text-secondary">Open a sale to attach a customer.</div>

        <div *ngIf="cart && !cart.customer" class="flex flex-wrap gap-2">
          <button boo-button variant="secondary" size="sm" (click)="openCustomerLookup.emit()" [disabled]="!canEdit || busy" class="flex-1">
            <physio-icon name="search" [size]="14"></physio-icon> Patient or walk-in (F3)
          </button>
        </div>

        <div *ngIf="cart?.customer as customer" class="bg-gray-50 rounded-1.5 p-3">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="text-sm font-semibold text-regular m-0 break-words">{{ customer.fullName }}</p>
              <p class="text-xs text-secondary m-0" *ngIf="customer.type === 'WalkIn'">Walk-in customer</p>
              <p class="text-xs text-secondary m-0" *ngIf="customer.mrn">MRN {{ customer.mrn }}</p>
              <p class="text-xs text-secondary m-0" *ngIf="customer.phone">{{ customer.phone }}</p>
            </div>
            <button *ngIf="canEdit" boo-button variant="link" size="sm" (click)="openCustomerLookup.emit()" [disabled]="busy">Change</button>
          </div>

          <div class="flex flex-wrap gap-1.5 mt-2">
            <span *ngIf="customer.insuranceProvider" class="px-2 py-0.5 rounded-full bg-primarySoft text-primaryDeep text-[11px] font-medium">{{ customer.insuranceProvider }}</span>
            <span *ngIf="customer.loyaltyPoints" class="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-medium">{{ customer.loyaltyPoints }} pts</span>
            <span *ngIf="customer.prescriptionReference" class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-medium">Rx {{ customer.prescriptionReference }}</span>
            <span *ngIf="customer.allergyInformation" class="px-2 py-0.5 rounded-full bg-dangerSoft text-gray-900 text-[11px] font-medium inline-flex items-center gap-1">
              <physio-icon name="triangle-alert" [size]="11" class="text-danger"></physio-icon> Allergy: {{ customer.allergyInformation }}
            </span>
          </div>
        </div>
      </div>

      <div class="p-3 bg-gray-50/60 rounded-b-2">
        <dl class="space-y-1.5 mb-4 m-0">
          <div class="flex justify-between text-sm">
            <dt class="text-secondary">Subtotal ({{ totals().itemCount }} {{ totals().itemCount === 1 ? 'unit' : 'units' }})</dt>
            <dd class="m-0 font-medium text-regular">{{ money(totals().subtotal) }}</dd>
          </div>
          <div class="flex justify-between text-sm">
            <dt class="text-secondary">Discount</dt>
            <dd class="m-0 font-medium text-emerald-700">−{{ money(totals().discountTotal) }}</dd>
          </div>
          <div class="flex justify-between text-sm" *ngIf="totals().insuranceCoverage > 0">
            <dt class="text-secondary">Insurance coverage</dt>
            <dd class="m-0 font-medium text-primaryDeep">−{{ money(totals().insuranceCoverage) }}</dd>
          </div>
          <div class="pt-2 border-t border-borderGray/60 flex justify-between items-baseline">
            <dt class="text-sm font-semibold text-regular">Total due</dt>
            <dd class="m-0 text-xl font-bold text-primaryDeep">{{ money(totals().grandTotal) }}</dd>
          </div>
        </dl>

        <p *ngIf="checkoutBlockedReason" class="text-xs text-secondary m-0 mb-2" role="status">{{ checkoutBlockedReason }}</p>

        <div class="space-y-2">
          <button boo-button variant="primary" size="md" [block]="true" (click)="checkout.emit()" [disabled]="!!checkoutBlockedReason || busy">
            Checkout (F4)
          </button>
          <button boo-button variant="secondary" size="sm" [block]="true" (click)="holdSale.emit()" [disabled]="!canHold || busy" [loading]="holding">
            Put sale on hold
          </button>
        </div>
      </div>
    </section>
  `,
})
export class RetailCheckoutPanelComponent {
  @Input() cart: RetailCart | null = null;
  @Input() canEdit = false;
  @Input() busy = false;
  @Input() holding = false;
  @Input() canHold = false;
  /** Why checkout cannot run right now (empty cart, missing permission, no facility); null when it can. */
  @Input() checkoutBlockedReason: string | null = null;
  @Output() openCustomerLookup = new EventEmitter<void>();
  @Output() checkout = new EventEmitter<void>();
  @Output() holdSale = new EventEmitter<void>();

  totals() {
    return retailCartTotals(this.cart);
  }

  money(amount: number): string {
    return formatRetailMoney(amount);
  }
}
