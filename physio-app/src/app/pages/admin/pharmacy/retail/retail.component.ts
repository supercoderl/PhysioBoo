import { Component, DestroyRef, HostListener, OnInit, ViewChild, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent, BooInlineErrorComponent } from '@physioboo/ui';
import { Observable, Subscription, concatMap, from, last } from "rxjs";
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { HospitalService } from "../../../../services/admin/hospital.service";
import { RetailPosService } from "../../../../services/admin/retail-pos.service";
import { AuthService } from "../../../../services/auth/auth.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { ToastService } from "../../../../services/common/toast.service";
import { Permissions } from "../../../../shared/constants/permission.constant";
import { SharedModule } from "../../../../shared/shared-imports";
import { PagedResponse } from "../../../../shared/types/common";
import { Hospital } from "../../../../shared/types/support.types";
import {
  RetailCart,
  RetailCartLineItem,
  RetailCheckoutPayload,
  RetailCustomer,
  RetailInventoryInsight,
  RetailMedicineCard,
  RetailTransaction,
} from "../../../../shared/types/retail-pos.types";
import { formatRetailMoney, retailCartTotals } from "../../../../shared/utils/retail-pos.utils";
import { RetailCartPanelComponent } from "./retail-cart-panel.component";
import { RetailCatalogPanelComponent } from "./retail-catalog-panel.component";
import { RetailCheckoutPanelComponent } from "./retail-checkout-panel.component";
import { RetailCustomerLookupDrawerComponent } from "./retail-customer-lookup-drawer.component";
import { RetailPaymentDialogComponent } from "./retail-payment-dialog.component";
import { RetailProductDetailDrawerComponent } from "./retail-product-detail-drawer.component";
import { RetailReceiptDialogComponent } from "./retail-receipt-dialog.component";

const FACILITY_STORAGE_KEY = 'physioboo.retail.hospitalId';

@Component({
  selector: 'admin-retail',
  standalone: true,
  imports: [
    SharedModule,
    BooButtonComponent,
    BooEmptyStateComponent,
    BooErrorStateComponent,
    BooInlineErrorComponent,
    BooSelectComponent,
    RetailCatalogPanelComponent,
    RetailCartPanelComponent,
    RetailCheckoutPanelComponent,
    RetailPaymentDialogComponent,
    RetailReceiptDialogComponent,
    RetailProductDetailDrawerComponent,
    RetailCustomerLookupDrawerComponent,
  ],
  template: `
    <!-- Permission denied: the catalog and insight are all guarded by pharmacy:medicine-inventory:read -->
    <main *ngIf="!canReadCatalog" class="py-5">
      <div class="bg-surface border border-borderGray/60 rounded-2 py-8">
        <boo-empty-state icon="lock" title="You don't have access to Pharmacy Retail"
          description="Viewing the retail catalog needs the pharmacy inventory read permission. Ask an administrator to grant it."></boo-empty-state>
      </div>
    </main>

    <main *ngIf="canReadCatalog" class="flex flex-1 flex-col gap-5 pb-24 xl:min-h-0 xl:pb-5">
      <header class="flex shrink-0 flex-wrap items-end justify-between gap-4">
        <div class="min-w-0">
          <h1 class="m-0 text-xl leading-7 font-semibold tracking-tight text-regular">Pharmacy retail</h1>
          <p class="text-sm text-secondary m-0 mt-1 max-w-2xl">Counter sales of medicine. Find a medicine in the catalog, add it to the open sale, then take payment.</p>
          <p class="text-xs text-gray-500 m-0 mt-1">Shortcuts: F2 search · F3 customer · F4 checkout · Ctrl+B barcode</p>
        </div>
        <div class="flex flex-wrap items-end gap-3">
          <div *ngIf="hospitals().length > 1" class="w-60">
            <boo-select label="Facility" [options]="hospitals()" bindLabel="name" bindValue="id" [required]="true" [ngModel]="hospitalId()" (ngModelChange)="selectHospital($event)"></boo-select>
          </div>
          <boo-inline-error *ngIf="hospitalsError()" what="facilities" [compact]="true" [state]="hospitalsRetrying() ? 'retrying' : 'default'" (retry)="loadHospitals()"></boo-inline-error>
          <button *ngIf="canCreateCart" boo-button variant="primary" size="md" (click)="newSale()" [disabled]="!hospitalId() || mutating()" [loading]="creating()"
            [attr.title]="!hospitalId() ? 'Select a facility first' : null">
            <physio-icon name="plus" [size]="16"></physio-icon> New sale
          </button>
        </div>
      </header>

      <!-- Today at the counter: sales first, stock alerts after; all values come from the insight endpoint -->
      <section class="shrink-0" aria-label="Today at the counter">
        <boo-inline-error *ngIf="insightError()" what="today's summary" [state]="insightRetrying() ? 'retrying' : 'default'" (retry)="loadInsight()"></boo-inline-error>
        <dl *ngIf="!insightError()" class="m-0 border border-borderGray/60 rounded-2 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-px bg-borderGray/60 overflow-hidden">
          <ng-container *ngIf="insight() as i; else insightSkeleton">
            <div class="bg-surface px-4 py-3"><dt class="text-xs text-secondary">Today's revenue</dt><dd class="m-0 mt-1 text-lg font-semibold text-regular tabular-nums">{{ money(i.todayRevenue) }}</dd></div>
            <div class="bg-surface px-4 py-3"><dt class="text-xs text-secondary">Sales completed</dt><dd class="m-0 mt-1 text-lg font-semibold text-regular tabular-nums">{{ i.todaySalesCount }}</dd></div>
            <div class="bg-surface px-4 py-3 col-span-2 md:col-span-1 min-w-0"><dt class="text-xs text-secondary">Best seller today</dt>
              <dd class="m-0 mt-1 text-sm font-semibold text-regular truncate">{{ i.bestSellerName || 'No sales yet' }}<span *ngIf="i.bestSellerName && i.bestSellerUnitsSold" class="font-normal text-secondary"> · {{ i.bestSellerUnitsSold }} sold</span></dd></div>
            <div class="bg-surface px-4 py-3"><dt class="text-xs text-secondary">Low-stock batches</dt><dd class="m-0 mt-1 text-lg font-semibold tabular-nums" [ngClass]="i.lowStockCount ? 'text-amber-700' : 'text-regular'">{{ i.lowStockCount }}</dd></div>
            <div class="bg-surface px-4 py-3"><dt class="text-xs text-secondary">Near-expiry batches</dt><dd class="m-0 mt-1 text-lg font-semibold tabular-nums" [ngClass]="i.nearExpiryCount ? 'text-amber-700' : 'text-regular'">{{ i.nearExpiryCount }}</dd></div>
            <div class="bg-surface px-4 py-3"><dt class="text-xs text-secondary">Out-of-stock batches</dt><dd class="m-0 mt-1 text-lg font-semibold tabular-nums" [ngClass]="i.outOfStockCount ? 'text-danger' : 'text-regular'">{{ i.outOfStockCount }}</dd></div>
          </ng-container>
          <ng-template #insightSkeleton>
            <div *ngFor="let n of [1,2,3,4,5,6]" class="bg-surface px-4 py-3"><div class="h-3 w-20 rounded bg-gray-100 animate-pulse"></div><div class="h-6 w-14 rounded bg-gray-100 animate-pulse mt-2"></div></div>
          </ng-template>
        </dl>
      </section>

      <!-- Cart load failure replaces the workspace -->
      <div *ngIf="cartsError()" class="min-h-[320px] flex items-center justify-center bg-surface rounded-2 border border-borderGray/60">
        <boo-error-state title="Couldn't load the sales workspace" [description]="cartsError()" (retry)="loadCarts()"></boo-error-state>
      </div>

      <!-- Catalog (primary) beside the sale (sticky on wide screens, below the catalog otherwise) -->
      <div *ngIf="!cartsError()" class="grid grid-cols-1 gap-6 xl:min-h-[34rem] xl:flex-1 xl:grid-cols-[minmax(0,1fr)_420px] xl:grid-rows-[minmax(0,1fr)]">
        <retail-catalog-panel #catalogPanel class="block min-h-0 min-w-0" [canReadCategories]="canReadCategories" [addDisabled]="!canAdd()" [addDisabledReason]="addDisabledReason()"
          [pendingMedicineId]="pendingMedicineId()" (addToCart)="addMedicine($event)" (barcodeScanned)="onBarcodeScanned($event)"
          (viewDetail)="openProductDrawer($event)" (medicinesLoaded)="onMedicinesLoaded($event)"></retail-catalog-panel>

        <aside id="retail-sale" class="flex min-h-0 flex-col self-start bg-surface border border-borderGray/60 rounded-2 scroll-mt-4 xl:h-full xl:self-auto xl:overflow-hidden" aria-label="Current sale">
          <div class="shrink-0 px-4 py-3 border-b border-borderGray/60">
            <h2 class="text-base font-semibold text-regular m-0">Current sale</h2>
            <div *ngIf="carts().length" class="mt-2 -mx-1 flex items-center gap-1 overflow-x-auto" role="tablist" aria-label="Open sales">
              <button *ngFor="let c of carts(); let i = index" type="button" role="tab" [id]="'retail-tab-' + c.id" [attr.aria-selected]="activeCartId() === c.id"
                [attr.tabindex]="activeCartId() === c.id ? 0 : -1" (click)="switchCart(c.id)" (keydown.arrowright)="moveTab(i, 1)" (keydown.arrowleft)="moveTab(i, -1)"
                class="px-3 min-h-9 rounded-full text-xs font-medium flex items-center gap-1.5 border whitespace-nowrap transition-colors"
                [ngClass]="activeCartId() === c.id ? 'bg-primarySoft border-primary text-primaryDeep' : 'bg-surface border-gray-300 text-gray-700 hover:border-gray-400'">
                <span class="w-1.5 h-1.5 rounded-full" [ngClass]="c.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'" aria-hidden="true"></span>
                {{ c.name }} <span class="text-gray-500">({{ c.items.length }})</span><span *ngIf="c.status === 'Held'" class="text-amber-800">· on hold</span>
              </button>
            </div>
          </div>

          <ng-container *ngIf="canReadCart; else cartDenied">
            <div *ngIf="cartsLoading()" class="p-4 space-y-3" aria-busy="true">
              <div *ngFor="let n of [1,2,3]" class="h-16 rounded-1.5 bg-gray-50 animate-pulse"></div>
            </div>

            <ng-container *ngIf="!cartsLoading()">
              <retail-cart-panel class="block xl:min-h-0 xl:flex-1" [cart]="activeCart()" [canEdit]="canEditCart()" [canCreate]="canCreateCart && !!hospitalId()" [busy]="mutating()" [warnings]="warnings()"
                [stockByMedicine]="stockByMedicine()" (quantityChange)="onQuantityChange($event)" (discountChange)="onDiscountChange($event)"
                (removeItem)="onRemoveItem($event)" (clearAll)="onClearAll()" (resume)="resumeActiveCart()" (newSale)="newSale()"></retail-cart-panel>
              <retail-checkout-panel class="block shrink-0" [cart]="activeCart()" [canEdit]="canEditCart()" [busy]="mutating()" [holding]="holding()" [canHold]="canHold()"
                [checkoutBlockedReason]="checkoutBlockedReason()" (openCustomerLookup)="openCustomerDrawer()" (checkout)="openPaymentDialog()" (holdSale)="holdActiveCart()"></retail-checkout-panel>
            </ng-container>
          </ng-container>

          <ng-template #cartDenied>
            <boo-empty-state icon="lock" title="Retail carts are not available to you"
              description="You can browse medicines, but opening a sale needs the retail cart read permission."></boo-empty-state>
          </ng-template>
        </aside>
      </div>
    </main>

    <!-- Narrow screens: the sale sits below the catalog, so keep its total and a way to reach it in view -->
    <div *ngIf="canReadCatalog && canReadCart && activeCart()?.items?.length" class="xl:hidden fixed inset-x-0 bottom-0 z-30 bg-surface border-t border-borderGray shadow-[0_-4px_12px_rgba(0,0,0,0.06)] px-4 py-2.5 flex items-center justify-between gap-3">
      <div class="leading-tight min-w-0">
        <p class="m-0 text-xs text-secondary truncate">{{ activeCart()?.name }} · {{ activeCart()?.items?.length }} item(s)</p>
        <p class="m-0 text-base font-semibold text-primaryDeep tabular-nums">{{ money(grandTotal()) }}</p>
      </div>
      <button boo-button variant="primary" size="md" (click)="scrollToSale()">Review sale</button>
    </div>

    <ng-container *ngIf="canReadCatalog">
      <retail-product-detail-drawer [isOpen]="productDrawerOpen()" [medicineId]="productDrawerMedicineId()" [addDisabled]="!canAdd()" [addDisabledReason]="addDisabledReason()"
        [adding]="!!pendingMedicineId()" (close)="productDrawerOpen.set(false)" (addToCart)="onAddFromDetail($event)"></retail-product-detail-drawer>

      <retail-customer-lookup-drawer [isOpen]="customerDrawerOpen()" [submitting]="attaching()" (close)="customerDrawerOpen.set(false)" (useCustomer)="onUseCustomer($event)"></retail-customer-lookup-drawer>

      <retail-payment-dialog [isOpen]="paymentDialogOpen()" [grandTotal]="grandTotal()" [hasInsurance]="!!activeCart()?.customer?.insuranceProvider" [hospitalId]="hospitalId()"
        [submitting]="checkingOut()" [errorMessage]="checkoutError()" (close)="paymentDialogOpen.set(false)" (completeSale)="onCompleteSale($event)"></retail-payment-dialog>

      <retail-receipt-dialog [transaction]="receipt()" [canSend]="canReadTransaction" [canRefund]="canRefund" (close)="receipt.set(null)" (refunded)="onRefunded($event)"></retail-receipt-dialog>
    </ng-container>
  `,})
export class AdminRetailComponent implements OnInit {
  @ViewChild('catalogPanel') catalogPanel?: RetailCatalogPanelComponent;

  private readonly srv = inject(RetailPosService);
  private readonly hospitalSrv = inject(HospitalService);
  private readonly authSrv = inject(AuthService);
  private readonly toastSrv = inject(ToastService);
  private readonly dialogSrv = inject(DialogService);
  private readonly destroyRef = inject(DestroyRef);

  // #region Permissions — each action checks its own permission; read access never implies write access
  readonly canReadCatalog = this.authSrv.hasPermission(Permissions.Pharmacy.MedicineInventoryRead);
  readonly canReadCategories = this.authSrv.hasPermission(Permissions.Pharmacy.MedicineCategoryRead);
  readonly canReadCart = this.authSrv.hasPermission(Permissions.Pharmacy.RetailCartRead);
  readonly canCreateCart = this.authSrv.hasPermission(Permissions.Pharmacy.RetailCartCreate);
  readonly canUpdateCart = this.authSrv.hasPermission(Permissions.Pharmacy.RetailCartUpdate);
  readonly canCheckout = this.authSrv.hasPermission(Permissions.Pharmacy.RetailTransactionCreate);
  readonly canReadTransaction = this.authSrv.hasPermission(Permissions.Pharmacy.RetailTransactionRead);
  readonly canRefund = this.authSrv.hasPermission(Permissions.Pharmacy.RetailTransactionRefund);
  // #endregion

  carts = signal<RetailCart[]>([]);
  activeCartId = signal<string>('');
  cartsLoading = signal(true);
  cartsError = signal<string | null>(null);

  insight = signal<RetailInventoryInsight | null>(null);
  insightError = signal(false);
  insightRetrying = signal(false);

  hospitals = signal<Hospital[]>([]);
  hospitalId = signal<string | null>(null);
  hospitalsError = signal(false);
  hospitalsRetrying = signal(false);

  warnings = signal<string[]>([]);
  stockByMedicine = signal<Record<string, number>>({});

  /** A cart request is in flight; every cart-editing control locks until it settles. */
  mutating = signal(false);
  creating = signal(false);
  holding = signal(false);
  attaching = signal(false);
  pendingMedicineId = signal<string | null>(null);

  productDrawerOpen = signal(false);
  productDrawerMedicineId = signal<string | null>(null);
  customerDrawerOpen = signal(false);
  paymentDialogOpen = signal(false);
  checkingOut = signal(false);
  checkoutError = signal<string | null>(null);
  receipt = signal<RetailTransaction | null>(null);

  private warningsSub?: Subscription;

  ngOnInit(): void {
    if (!this.canReadCatalog) return;
    this.loadInsight();
    if (this.canReadCart) this.loadCarts();
    else this.cartsLoading.set(false);
    if (this.canCreateCart || this.canCheckout) this.loadHospitals();
  }

  // #region Loading
  loadCarts(): void {
    this.cartsError.set(null);
    this.cartsLoading.set(true);
    this.srv.getCarts().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        const list = res.success ? res.data ?? [] : [];
        this.carts.set(list);
        const current = list.find(c => c.id === this.activeCartId());
        this.activeCartId.set(current?.id ?? (list.find(c => c.status === 'Active') ?? list[0])?.id ?? '');
        this.cartsLoading.set(false);
        this.refreshWarnings();
      },
      error: () => {
        this.cartsLoading.set(false);
        this.cartsError.set('Check your connection and try again.');
      },
    });
  }

  loadInsight(): void {
    this.insightRetrying.set(this.insightError());
    this.srv.getInsight().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        this.insightRetrying.set(false);
        this.insightError.set(!res.success);
        if (res.success) this.insight.set(res.data);
      },
      error: () => {
        this.insightRetrying.set(false);
        this.insightError.set(true);
      },
    });
  }

  loadHospitals(): void {
    this.hospitalsRetrying.set(this.hospitalsError());
    this.hospitalSrv.lookup().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: list => {
        this.hospitalsRetrying.set(false);
        this.hospitalsError.set(false);
        this.hospitals.set(list);
        const saved = this.readSavedHospital();
        this.hospitalId.set(list.find(h => h.id === (this.hospitalId() ?? saved))?.id ?? (list.length === 1 ? list[0].id : null));
      },
      error: () => {
        this.hospitalsRetrying.set(false);
        this.hospitalsError.set(true);
      },
    });
  }

  selectHospital(id: string | null): void {
    this.hospitalId.set(id || null);
    try { if (id) localStorage.setItem(FACILITY_STORAGE_KEY, id); } catch { /* storage unavailable: choice just isn't remembered */ }
  }

  private readSavedHospital(): string | null {
    try { return localStorage.getItem(FACILITY_STORAGE_KEY); } catch { return null; }
  }
  // #endregion

  // #region Derived state
  activeCart(): RetailCart | null {
    return this.carts().find(c => c.id === this.activeCartId()) ?? null;
  }

  canEditCart(): boolean {
    return this.canUpdateCart && this.activeCart()?.status === 'Active';
  }

  /** Adding is possible into an active cart, or into a new one when the cashier may create carts and a facility is set. */
  canAdd(): boolean {
    if (this.mutating()) return false;
    const cart = this.activeCart();
    if (cart) return this.canEditCart();
    return this.canCreateCart && this.canUpdateCart && !!this.hospitalId();
  }

  addDisabledReason(): string {
    if (!this.canReadCart) return 'You do not have access to retail carts';
    if (!this.canUpdateCart) return 'You do not have permission to edit carts';
    const cart = this.activeCart();
    if (cart && cart.status === 'Held') return 'Resume this held sale before adding items';
    if (!cart && !this.canCreateCart) return 'There is no open sale and you cannot create one';
    if (!cart && !this.hospitalId()) return 'Select a facility to start a sale';
    return '';
  }

  canHold(): boolean {
    const cart = this.activeCart();
    return this.canEditCart() && !!cart && cart.items.length > 0;
  }

  grandTotal(): number {
    return retailCartTotals(this.activeCart()).grandTotal;
  }

  checkoutBlockedReason(): string | null {
    const cart = this.activeCart();
    if (!this.canCheckout) return 'You do not have permission to complete sales.';
    if (!cart) return 'Open a sale to check out.';
    if (cart.status === 'Held') return 'Resume this sale to check out.';
    if (!cart.items.length) return 'Add a medicine to check out.';
    if (!this.hospitalId()) return 'Select a facility to check out.';
    if (this.grandTotal() <= 0) return 'The total due must be greater than zero.';
    return null;
  }

  money(amount: number): string {
    return formatRetailMoney(amount);
  }
  // #endregion

  scrollToSale(): void {
    document.getElementById('retail-sale')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // #region Keyboard
  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.canReadCatalog) return;
    if (event.key === 'Escape') {
      if (this.productDrawerOpen()) this.productDrawerOpen.set(false);
      if (this.customerDrawerOpen() && !this.attaching()) this.customerDrawerOpen.set(false);
      return; // dialogs close themselves on Escape
    }
    if (this.paymentDialogOpen() || this.receipt() || this.customerDrawerOpen()) return;

    if (event.key === 'F2') { event.preventDefault(); this.catalogPanel?.focusSearch(); }
    else if (event.key === 'F3') { event.preventDefault(); this.openCustomerDrawer(); }
    else if (event.key === 'F4') { event.preventDefault(); this.openPaymentDialog(); }
    else if (event.ctrlKey && event.key.toLowerCase() === 'b') { event.preventDefault(); this.catalogPanel?.focusBarcode(); }
  }

  moveTab(index: number, delta: number): void {
    const list = this.carts();
    const next = list[(index + delta + list.length) % list.length];
    if (!next) return;
    this.switchCart(next.id);
    setTimeout(() => document.getElementById('retail-tab-' + next.id)?.focus());
  }
  // #endregion

  // #region Cart operations — the API owns the cart; every response replaces the local copy
  private replaceCart(cart: RetailCart): void {
    this.carts.update(list => list.some(c => c.id === cart.id) ? list.map(c => c.id === cart.id ? cart : c) : [...list, cart]);
    if (cart.id === this.activeCartId()) this.refreshWarnings();
  }

  private removeCartLocally(cartId: string): void {
    this.carts.update(list => list.filter(c => c.id !== cartId));
    if (this.activeCartId() === cartId) {
      const next = this.carts().find(c => c.status === 'Active') ?? this.carts()[0];
      this.activeCartId.set(next?.id ?? '');
      this.refreshWarnings();
    }
  }

  /** Runs one cart request at a time. `done` runs only on success; on failure local data is left untouched. */
  private runCartOp(request$: Observable<PagedResponse<RetailCart | null>>, done?: (cart: RetailCart) => void, settled?: () => void): void {
    if (this.mutating()) return;
    this.mutating.set(true);
    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        this.mutating.set(false);
        settled?.();
        if (res.success && res.data) {
          this.replaceCart(res.data);
          done?.(res.data);
        }
      },
      error: () => {
        this.mutating.set(false);
        settled?.();
      },
    });
  }

  newSale(): void {
    const hospitalId = this.hospitalId();
    if (!this.canCreateCart || !hospitalId || this.mutating()) return;
    this.creating.set(true);
    this.runCartOp(this.srv.createCart(hospitalId, `Sale ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`),
      cart => this.activeCartId.set(cart.id), () => this.creating.set(false));
  }

  switchCart(cartId: string): void {
    if (this.activeCartId() === cartId) return;
    this.activeCartId.set(cartId);
    this.refreshWarnings();
  }

  addMedicine(medicine: RetailMedicineCard, done?: () => void): void {
    if (!this.canAdd()) {
      const reason = this.addDisabledReason();
      if (reason) this.toastSrv.info(reason);
      return;
    }
    this.stockByMedicine.update(map => ({ ...map, [medicine.id]: medicine.stock }));

    const cart = this.activeCart();
    const existing = cart?.items.find(i => i.medicineId === medicine.id);
    const quantity = (existing?.quantity ?? 0) + 1;
    if (quantity > medicine.stock) {
      this.toastSrv.error(`Only ${medicine.stock} units of ${medicine.name} in stock`);
      return;
    }

    this.pendingMedicineId.set(medicine.id);
    const upsert = (cartId: string) => this.srv.upsertCartItem(cartId, medicine.id, quantity, existing?.discountPercent ?? 0);

    if (cart) {
      this.runCartOp(upsert(cart.id), () => done?.(), () => this.pendingMedicineId.set(null));
      return;
    }

    // No open sale yet: create one for this facility, then add the medicine to it.
    this.mutating.set(true);
    this.srv.createCart(this.hospitalId()!, `Sale ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        this.mutating.set(false);
        if (res.success && res.data) {
          this.replaceCart(res.data);
          this.activeCartId.set(res.data.id);
          this.runCartOp(upsert(res.data.id), () => done?.(), () => this.pendingMedicineId.set(null));
        } else {
          this.pendingMedicineId.set(null);
        }
      },
      error: () => {
        this.mutating.set(false);
        this.pendingMedicineId.set(null);
      },
    });
  }

  onBarcodeScanned(medicine: RetailMedicineCard): void {
    this.addMedicine(medicine, () => this.toastSrv.success(`${medicine.name} added to cart`, 'Scanned'));
  }

  onAddFromDetail(medicine: RetailMedicineCard): void {
    this.addMedicine(medicine, () => this.productDrawerOpen.set(false));
  }

  onMedicinesLoaded(list: RetailMedicineCard[]): void {
    this.stockByMedicine.update(map => list.reduce((acc, m) => ({ ...acc, [m.id]: m.stock }), { ...map }));
  }

  onQuantityChange(change: { item: RetailCartLineItem; quantity: number }): void {
    const cart = this.activeCart();
    if (!cart || !this.canEditCart()) return;
    this.runCartOp(this.srv.upsertCartItem(cart.id, change.item.medicineId, change.quantity, change.item.discountPercent));
  }

  onDiscountChange(change: { item: RetailCartLineItem; discountPercent: number }): void {
    const cart = this.activeCart();
    if (!cart || !this.canEditCart()) return;
    this.runCartOp(this.srv.upsertCartItem(cart.id, change.item.medicineId, change.item.quantity, change.discountPercent));
  }

  onRemoveItem(item: RetailCartLineItem): void {
    const cart = this.activeCart();
    if (!cart || !this.canEditCart()) return;
    this.runCartOp(this.srv.removeCartItem(cart.id, item.id));
  }

  /** The API has no "empty cart" endpoint, so the lines are removed one request at a time. */
  onClearAll(): void {
    const cart = this.activeCart();
    if (!cart || !cart.items.length || !this.canEditCart() || this.mutating()) return;
    this.dialogSrv.confirm(`Remove all ${cart.items.length} item(s) from ${cart.name}?`, () => {
      this.mutating.set(true);
      from(cart.items).pipe(
        concatMap(item => this.srv.removeCartItem(cart.id, item.id)),
        last(),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe({
        next: res => {
          this.mutating.set(false);
          if (res.success && res.data) this.replaceCart(res.data);
        },
        error: () => {
          // Some lines may already be gone; resync from the server rather than guess.
          this.mutating.set(false);
          this.loadCarts();
        },
      });
    }, 'Clear cart', 'warning', 'Clear cart');
  }

  holdActiveCart(): void {
    const cart = this.activeCart();
    if (!cart || !this.canHold() || this.mutating()) return;
    this.holding.set(true);
    this.runCartOp(this.srv.suspendCart(cart.id), held => {
      this.toastSrv.success(`${held.name} put on hold`);
      const other = this.carts().find(c => c.id !== held.id && c.status === 'Active');
      if (other) this.activeCartId.set(other.id);
    }, () => this.holding.set(false));
  }

  resumeActiveCart(): void {
    const cart = this.activeCart();
    if (!cart || cart.status !== 'Held' || !this.canUpdateCart) return;
    this.runCartOp(this.srv.resumeCart(cart.id), resumed => this.toastSrv.success(`${resumed.name} resumed`));
  }
  // #endregion

  // #region Customer and clinical warnings
  openCustomerDrawer(): void {
    if (!this.canEditCart() || this.mutating()) return;
    this.customerDrawerOpen.set(true);
  }

  onUseCustomer(customer: RetailCustomer): void {
    const cart = this.activeCart();
    if (!cart || !this.canEditCart() || this.attaching() || this.mutating()) return;
    this.attaching.set(true);
    this.runCartOp(this.srv.attachCustomer(cart.id, customer), attached => {
      this.customerDrawerOpen.set(false);
      this.toastSrv.success(`${attached.customer?.fullName ?? customer.fullName} attached to ${attached.name}`);
    }, () => this.attaching.set(false));
  }

  private refreshWarnings(): void {
    this.warningsSub?.unsubscribe();
    const cart = this.activeCart();
    const patientId = cart?.customer?.patientId;
    if (!this.canReadCart || !cart || !patientId || !cart.items.length) {
      this.warnings.set([]);
      return;
    }
    this.warningsSub = this.srv.checkWarnings(cart.id, patientId, cart.items.map(i => i.medicineId)).subscribe({
      next: res => this.warnings.set(res.success ? res.data ?? [] : []),
      error: () => this.warnings.set([]), // advisory only: a failed check never blocks the sale
    });
  }
  // #endregion

  // #region Product detail
  openProductDrawer(medicineId: string): void {
    this.productDrawerMedicineId.set(medicineId);
    this.productDrawerOpen.set(true);
  }
  // #endregion

  // #region Checkout
  openPaymentDialog(): void {
    if (this.checkoutBlockedReason() || this.mutating()) return;
    this.checkoutError.set(null);
    this.paymentDialogOpen.set(true);
  }

  onCompleteSale(payload: RetailCheckoutPayload): void {
    const cart = this.activeCart();
    if (!cart || this.checkingOut() || this.checkoutBlockedReason()) return;
    this.checkingOut.set(true);
    this.checkoutError.set(null);
    this.srv.checkout(cart.id, payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        this.checkingOut.set(false);
        if (res.success && res.data) {
          this.paymentDialogOpen.set(false);
          this.removeCartLocally(cart.id); // the API closes the cart as part of checkout
          this.receipt.set(res.data);
          this.loadInsight();
          this.catalogPanel?.reload(); // stock changed
        } else {
          this.checkoutError.set('The sale could not be completed. Nothing was charged; review the details and try again.');
        }
      },
      error: err => {
        this.checkingOut.set(false);
        this.checkoutError.set(err?.error?.errors?.[0] ?? 'The sale could not be completed. Nothing was charged; review the details and try again.');
      },
    });
  }

  onRefunded(transaction: RetailTransaction): void {
    this.receipt.set(transaction);
    this.loadInsight();
    this.catalogPanel?.reload();
  }
  // #endregion
}
