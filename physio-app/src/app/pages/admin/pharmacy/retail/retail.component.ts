import { Component, HostListener, OnInit, ViewChild, signal } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { StatCardComponent } from "../../../../components/ui/stat-card.component";
import { RetailPosService, nextLineItemId } from "../../../../services/admin/retail-pos.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import {
  RetailCart,
  RetailCartLineItem,
  RetailCustomer,
  RetailInventoryInsight,
  RetailMedicineCard,
  RetailPaymentSplit,
} from "../../../../shared/types/retail-pos.types";
import { RetailCartPanelComponent } from "./retail-cart-panel.component";
import { RetailCatalogPanelComponent } from "./retail-catalog-panel.component";
import { RetailCheckoutPanelComponent } from "./retail-checkout-panel.component";
import { RetailCustomerLookupDrawerComponent } from "./retail-customer-lookup-drawer.component";
import { RetailPaymentDialogComponent } from "./retail-payment-dialog.component";
import { RetailProductDetailDrawerComponent } from "./retail-product-detail-drawer.component";

@Component({
  selector: 'admin-retail',
  standalone: true,
  imports: [
    SharedModule,
    BooIconComponent,
    StatCardComponent,
    RetailCatalogPanelComponent,
    RetailCartPanelComponent,
    RetailCheckoutPanelComponent,
    RetailPaymentDialogComponent,
    RetailProductDetailDrawerComponent,
    RetailCustomerLookupDrawerComponent,
  ],
  host: { class: 'block min-h-screen bg-gray-50' },
  template: `
    <!-- Sticky POS header -->
    <div class="sticky top-0 z-20 bg-surface shadow-sm">
      <div class="px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-lg font-semibold text-gray-800">Pharmacy Retail</h1>
          <p class="text-xs text-secondary">Cashier: Current Cashier · Shift started {{ shiftStart | date:'shortTime' }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" (click)="showInsight.set(!showInsight())"
            class="px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-1.5">
            <boo-icon name="gauge" [size]="14"></boo-icon> {{ showInsight() ? 'Hide' : 'Show' }} Insight
          </button>
          <button type="button" (click)="newSale()" class="px-3 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:opacity-90 flex items-center gap-1.5">
            <boo-icon name="plus-circle" [size]="14"></boo-icon> New Sale
          </button>
        </div>
      </div>

      <!-- Retail queue bar -->
      <div class="px-4 sm:px-6 border-t border-gray-200 flex items-center gap-1 overflow-x-auto" role="tablist">
        <button *ngFor="let c of carts()" type="button" (click)="switchCart(c.id)" role="tab" [attr.aria-selected]="activeCartId() === c.id"
          class="px-4 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 -mb-px whitespace-nowrap transition-colors"
          [ngClass]="activeCartId() === c.id ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-primary hover:border-gray-300'">
          <span class="w-1.5 h-1.5 rounded-full" [ngClass]="c.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-300'"></span>
          {{ c.name }}
          <span class="text-[11px] text-gray-400">({{ c.items.length }})</span>
        </button>
        <button type="button" (click)="newCart()" class="px-3 py-2.5 text-xs font-semibold text-primary hover:underline flex items-center gap-1">
          <boo-icon name="plus" [size]="12"></boo-icon> New Cart
        </button>
      </div>
    </div>

    <main class="px-4 sm:px-6 py-4">
      <!-- Inventory insight strip -->
      <div *ngIf="showInsight() && insight()" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <boo-stat-card label="Low Stock" [value]="insight()!.lowStockCount" icon="trending-down" tone="warning"></boo-stat-card>
        <boo-stat-card label="Near Expiry" [value]="insight()!.nearExpiryCount" icon="calendar-clock" tone="warning"></boo-stat-card>
        <boo-stat-card label="Out of Stock" [value]="insight()!.outOfStockCount" icon="package-x" tone="danger"></boo-stat-card>
        <boo-stat-card label="Best Seller" [value]="insight()!.bestSeller?.name ?? '—'" icon="trophy" tone="primary"></boo-stat-card>
        <boo-stat-card label="Today's Revenue" [value]="'$' + insight()!.todayRevenue.toFixed(2)" icon="dollar-sign" tone="success"></boo-stat-card>
        <boo-stat-card label="Today's Sales" [value]="insight()!.todaySalesCount" icon="receipt" tone="neutral"></boo-stat-card>
      </div>

      <!-- Three-workspace grid: desktop = 3 panels side by side, tablet = 2-up, mobile = stacked -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1.6fr_1.4fr] gap-4">
        <div class="h-[calc(100vh-220px)] min-h-[480px]">
          <retail-catalog-panel #catalogPanel (addToCart)="onAddToCart($event)" (viewDetail)="openProductDrawer($event)"></retail-catalog-panel>
        </div>
        <div class="h-[calc(100vh-220px)] min-h-[480px]">
          <retail-cart-panel [cart]="activeCart()" (quantityChange)="onQuantityChange($event)" (discountChange)="onDiscountChange($event)"
            (removeItem)="onRemoveItem($event)" (clearAll)="onClearAll()"></retail-cart-panel>
        </div>
        <div class="h-[calc(100vh-220px)] min-h-[480px] md:col-span-2 lg:col-span-1">
          <retail-checkout-panel [cart]="activeCart()" (openCustomerLookup)="customerDrawerOpen.set(true)" (useWalkIn)="customerDrawerOpen.set(true)"
            (checkout)="openPaymentDialog()" (holdSale)="suspendActiveCart()" (printBill)="printBill()"></retail-checkout-panel>
        </div>
      </div>
    </main>

    <!-- Floating quick actions -->
    <div class="fixed bottom-6 right-6 flex flex-col gap-2 z-30">
      <button type="button" (click)="newSale()" title="New Sale (F2)" class="w-11 h-11 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:opacity-90">
        <boo-icon name="plus" [size]="18"></boo-icon>
      </button>
      <button type="button" (click)="suspendActiveCart()" title="Suspend Sale" class="w-11 h-11 rounded-full bg-surface border border-gray-300 shadow-lg flex items-center justify-center hover:bg-gray-50">
        <boo-icon name="pause" [size]="18" iconClass="text-gray-700"></boo-icon>
      </button>
      <button type="button" (click)="toggleHeldQueue()" title="Hold Queue" class="relative w-11 h-11 rounded-full bg-surface border border-gray-300 shadow-lg flex items-center justify-center hover:bg-gray-50">
        <boo-icon name="list" [size]="18" iconClass="text-gray-700"></boo-icon>
        <span *ngIf="heldCarts().length" class="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center">{{ heldCarts().length }}</span>
      </button>
      <button type="button" title="Print Receipt" (click)="printBill()" class="w-11 h-11 rounded-full bg-surface border border-gray-300 shadow-lg flex items-center justify-center hover:bg-gray-50">
        <boo-icon name="printer" [size]="18" iconClass="text-gray-700"></boo-icon>
      </button>
    </div>

    <!-- Held queue popover -->
    <div *ngIf="showHeldQueue()" class="fixed bottom-24 right-6 w-72 bg-surface border border-gray-200 rounded-lg shadow-2xl z-30 p-3">
      <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Held Carts</p>
      <div *ngIf="!heldCarts().length" class="text-xs text-gray-400">No held carts</div>
      <div *ngFor="let c of heldCarts()" class="flex items-center justify-between py-1.5">
        <span class="text-sm text-gray-700">{{ c.name }} ({{ c.items.length }})</span>
        <button type="button" (click)="resumeCart(c.id)" class="text-xs font-semibold text-primary hover:underline">Resume</button>
      </div>
    </div>

    <retail-product-detail-drawer [isOpen]="productDrawerOpen()" [medicineId]="productDrawerMedicineId()"
      (close)="productDrawerOpen.set(false)" (addToCart)="onAddDetailToCart($event)"></retail-product-detail-drawer>

    <retail-customer-lookup-drawer [isOpen]="customerDrawerOpen()" (close)="customerDrawerOpen.set(false)"
      (useCustomer)="onUseCustomer($event)"></retail-customer-lookup-drawer>

    <retail-payment-dialog [isOpen]="paymentDialogOpen()" [grandTotal]="grandTotal()" [hasInsurance]="!!activeCart()?.customer?.insuranceProvider"
      (close)="paymentDialogOpen.set(false)" (completeSale)="onCompleteSale($event)"></retail-payment-dialog>
  `,
})
export class AdminRetailComponent implements OnInit {
  @ViewChild('catalogPanel') catalogPanel!: RetailCatalogPanelComponent;

  shiftStart = new Date();

  carts = signal<RetailCart[]>([]);
  activeCartId = signal<string>('');
  insight = signal<RetailInventoryInsight | null>(null);
  showInsight = signal(true);
  showHeldQueue = signal(false);

  productDrawerOpen = signal(false);
  productDrawerMedicineId = signal<string | null>(null);
  customerDrawerOpen = signal(false);
  paymentDialogOpen = signal(false);

  constructor(
    private srv: RetailPosService,
    private toastSrv: ToastService,
    private dialogSrv: DialogService,
  ) { }

  ngOnInit(): void {
    this.srv.getCarts().subscribe(res => {
      if (res.success && res.data.length) {
        this.carts.set(res.data);
        this.activeCartId.set(res.data[0].id);
      }
    });
    this.srv.getInsight().subscribe(res => { if (res.success) this.insight.set(res.data); });
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const isTypingElsewhere = (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA')
      && !target.classList.contains('allow-shortcut');

    if (event.key === 'Escape') {
      this.productDrawerOpen.set(false);
      this.customerDrawerOpen.set(false);
      this.paymentDialogOpen.set(false);
      return;
    }
    if (isTypingElsewhere) return;

    if (event.key === 'F2') { event.preventDefault(); this.catalogPanel?.focusSearch(); }
    if (event.key === 'F3') { event.preventDefault(); this.customerDrawerOpen.set(true); }
    if (event.key === 'F4') { event.preventDefault(); this.openPaymentDialog(); }
    if (event.key === 'F5') { event.preventDefault(); if (this.paymentDialogOpen()) { /* completion happens inside dialog */ } }
    if (event.ctrlKey && event.key.toLowerCase() === 'b') { event.preventDefault(); this.catalogPanel?.focusBarcode(); }
  }

  activeCart(): RetailCart | null {
    return this.carts().find(c => c.id === this.activeCartId()) ?? null;
  }

  heldCarts() {
    return this.carts().filter(c => c.status === 'Held');
  }

  grandTotal(): number {
    const cart = this.activeCart();
    if (!cart) return 0;
    const subtotal = cart.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const discount = cart.items.reduce((s, i) => s + (i.unitPrice * i.quantity * i.discountPercent / 100), 0);
    const insurance = cart.items.reduce((s, i) => s + i.insuranceCoveredAmount, 0);
    const vat = Math.max(0, subtotal - discount - insurance) * 0.05;
    return Math.max(0, subtotal - discount - insurance + vat);
  }

  private updateCart(cartId: string, updater: (cart: RetailCart) => RetailCart): void {
    this.carts.update(list => list.map(c => c.id === cartId ? updater(c) : c));
  }

  private insuranceCoveredAmount(cart: RetailCart, medicine: RetailMedicineCard, quantity: number): number {
    if (!medicine.insuranceCovered || !cart.customer?.insuranceCoverageAmount) return 0;
    return (medicine.price * quantity) * (cart.customer.insuranceCoverageAmount / 100);
  }

  onAddToCart(medicine: RetailMedicineCard): void {
    const cart = this.activeCart();
    if (!cart) return;
    this.updateCart(cart.id, c => {
      const existing = c.items.find(i => i.medicineId === medicine.id);
      if (existing) {
        if (existing.quantity >= medicine.stock) {
          this.toastSrv.error(`Only ${medicine.stock} units of ${medicine.name} in stock`);
          return c;
        }
        const quantity = existing.quantity + 1;
        const items = c.items.map(i => i.id === existing.id
          ? { ...i, quantity, insuranceCoveredAmount: this.insuranceCoveredAmount(c, medicine, quantity), total: this.lineTotal(i.unitPrice, quantity, i.discountPercent) }
          : i);
        return { ...c, items };
      }
      const line: RetailCartLineItem = {
        id: nextLineItemId(),
        medicineId: medicine.id,
        name: medicine.name,
        genericName: medicine.genericName,
        strength: medicine.strength,
        packageLabel: medicine.packageLabel,
        unit: medicine.packageLabel,
        quantity: 1,
        stock: medicine.stock,
        unitPrice: medicine.price,
        discountPercent: 0,
        insuranceCoveredAmount: this.insuranceCoveredAmount(c, medicine, 1),
        total: medicine.price,
      };
      return { ...c, items: [...c.items, line] };
    });
  }

  private lineTotal(unitPrice: number, quantity: number, discountPercent: number): number {
    const gross = unitPrice * quantity;
    return gross - (gross * discountPercent / 100);
  }

  onQuantityChange(payload: { lineItemId: string; quantity: number }): void {
    const cart = this.activeCart();
    if (!cart) return;
    this.updateCart(cart.id, c => ({
      ...c,
      items: c.items.map(i => i.id === payload.lineItemId
        ? { ...i, quantity: payload.quantity, total: this.lineTotal(i.unitPrice, payload.quantity, i.discountPercent) }
        : i),
    }));
  }

  onDiscountChange(payload: { lineItemId: string; discountPercent: number }): void {
    const cart = this.activeCart();
    if (!cart) return;
    this.updateCart(cart.id, c => ({
      ...c,
      items: c.items.map(i => i.id === payload.lineItemId
        ? { ...i, discountPercent: payload.discountPercent, total: this.lineTotal(i.unitPrice, i.quantity, payload.discountPercent) }
        : i),
    }));
  }

  onRemoveItem(lineItemId: string): void {
    const cart = this.activeCart();
    if (!cart) return;
    this.updateCart(cart.id, c => ({ ...c, items: c.items.filter(i => i.id !== lineItemId) }));
  }

  onClearAll(): void {
    const cart = this.activeCart();
    if (!cart) return;
    this.dialogSrv.confirmDelete(() => {
      this.updateCart(cart.id, c => ({ ...c, items: [] }));
    }, 'all items in this cart');
  }

  newCart(): void {
    this.srv.createCart().subscribe(res => {
      if (res.success) {
        this.carts.update(list => [...list, res.data]);
        this.activeCartId.set(res.data.id);
      }
    });
  }

  newSale(): void {
    this.newCart();
  }

  switchCart(cartId: string): void {
    this.activeCartId.set(cartId);
  }

  suspendActiveCart(): void {
    const cart = this.activeCart();
    if (!cart || !cart.items.length) return;
    this.updateCart(cart.id, c => ({ ...c, status: 'Held' }));
    const remaining = this.carts().find(c => c.id !== cart.id && c.status === 'Active');
    if (remaining) this.activeCartId.set(remaining.id);
    else this.newCart();
    this.toastSrv.success(`${cart.name} put on hold`);
  }

  resumeCart(cartId: string): void {
    this.updateCart(cartId, c => ({ ...c, status: 'Active' }));
    this.activeCartId.set(cartId);
    this.showHeldQueue.set(false);
  }

  toggleHeldQueue(): void {
    this.showHeldQueue.set(!this.showHeldQueue());
  }

  openProductDrawer(medicineId: string): void {
    this.productDrawerMedicineId.set(medicineId);
    this.productDrawerOpen.set(true);
  }

  onAddDetailToCart(medicine: RetailMedicineCard): void {
    this.onAddToCart(medicine);
    this.productDrawerOpen.set(false);
  }

  onUseCustomer(customer: RetailCustomer): void {
    const cart = this.activeCart();
    if (!cart) return;
    this.updateCart(cart.id, c => ({ ...c, customer }));
    this.customerDrawerOpen.set(false);
    this.toastSrv.success(`${customer.fullName} attached to ${cart.name}`);
  }

  openPaymentDialog(): void {
    const cart = this.activeCart();
    if (!cart || !cart.items.length) return;
    this.paymentDialogOpen.set(true);
  }

  onCompleteSale(payload: { paymentSplits: RetailPaymentSplit[]; amountTendered: number }): void {
    const cart = this.activeCart();
    if (!cart) return;
    this.srv.checkout(cart.id, payload.paymentSplits, payload.amountTendered, cart).subscribe(res => {
      if (res.success) {
        this.toastSrv.success(`Sale ${res.data.transactionNumber} completed`, 'Sale Complete');
        this.paymentDialogOpen.set(false);
        this.updateCart(cart.id, c => ({ ...c, items: [], customer: null }));
      } else {
        this.toastSrv.error('Unable to complete sale');
      }
    });
  }

  printBill(): void {
    const cart = this.activeCart();
    if (!cart || !cart.items.length) {
      this.toastSrv.info('Cart is empty — nothing to print');
      return;
    }
    this.toastSrv.success('Receipt sent to printer');
  }
}
