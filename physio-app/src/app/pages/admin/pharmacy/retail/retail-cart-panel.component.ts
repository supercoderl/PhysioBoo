import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { BooButtonComponent, BooEmptyStateComponent, BooInputComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { SharedModule } from "../../../../shared/shared-imports";
import { RetailCart, RetailCartLineItem } from "../../../../shared/types/retail-pos.types";
import { formatRetailMoney } from "../../../../shared/utils/retail-pos.utils";

@Component({
  selector: 'retail-cart-panel',
  standalone: true,
  imports: [SharedModule, BooButtonComponent, BooEmptyStateComponent, BooInputComponent, BooStatusBadgeComponent],
  template: `
    <section class="flex flex-col xl:h-full xl:min-h-0" aria-label="Sale items">
      <div class="p-3 border-b border-borderGray/60 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <h2 class="text-sm font-semibold text-regular m-0 truncate">Items<span class="font-normal text-secondary"> · {{ cart?.items?.length || 0 }}</span></h2>
          <boo-status-badge *ngIf="cart?.status === 'Held'" label="On hold" tone="warning" [dotted]="true"></boo-status-badge>
        </div>
        <button *ngIf="cart && cart.items.length && canEdit" boo-button variant="ghost" size="sm" (click)="clearAll.emit()" [disabled]="busy" class="!text-danger shrink-0">Clear cart</button>
      </div>

      <!-- Clinical warnings from the API -->
      <div *ngIf="warnings.length" class="px-3 pt-3" role="alert">
        <div *ngFor="let w of warnings" class="bg-dangerSoft border border-dangerBorder text-gray-900 text-xs rounded-1.5 p-2.5 mb-2 flex items-start gap-2">
          <physio-icon name="triangle-alert" [size]="14" class="mt-0.5 shrink-0 text-danger"></physio-icon>
          <span>{{ w }}</span>
        </div>
      </div>

      <div *ngIf="cart?.status === 'Held'" class="mx-3 mt-3 p-3 rounded-1.5 bg-amber-50 border border-amber-200 text-xs text-gray-900 flex items-center justify-between gap-3">
        <span>This sale is on hold. Resume it to change items or check out.</span>
        <button *ngIf="canEdit" boo-button variant="outline" size="sm" (click)="resume.emit()" [loading]="busy" class="shrink-0">Resume</button>
      </div>

      <div class="boo-scrollbar p-3 xl:min-h-0 xl:flex-1 xl:overflow-y-auto">
        <boo-empty-state *ngIf="!cart" icon="shopping-cart" title="No open sale"
          [description]="canCreate ? 'Start a new sale to begin adding medicines.' : 'There is no open sale to work on.'">
          <button *ngIf="canCreate" boo-button variant="primary" size="sm" (click)="newSale.emit()" [loading]="busy">New sale</button>
        </boo-empty-state>

        <boo-empty-state *ngIf="cart && !cart.items.length" icon="shopping-cart" title="Cart is empty" description="Search the catalog or scan a barcode to add a medicine."></boo-empty-state>

        <ul class="list-none m-0 p-0">
          <li *ngFor="let item of cart?.items; trackBy: trackById" class="mb-3 pb-3 border-b border-borderGray/60 last:border-0 last:mb-0 last:pb-0">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="text-sm font-medium text-regular m-0 break-words">{{ item.name }}</p>
                <p class="text-xs text-secondary m-0 break-words">{{ subtitle(item) }}</p>
                <p *ngIf="stockWarning(item) as w" class="text-[11px] text-danger m-0 mt-0.5">{{ w }}</p>
              </div>
              <button *ngIf="canEdit" type="button" (click)="removeItem.emit(item)" [disabled]="busy"
                class="shrink-0 w-8 h-8 -mr-1 rounded-1.5 flex items-center justify-center text-gray-500 hover:text-danger hover:bg-gray-100 disabled:opacity-40" [attr.aria-label]="'Remove ' + item.name">
                <physio-icon name="x" [size]="16"></physio-icon>
              </button>
            </div>

            <div class="grid grid-cols-[auto_1fr] gap-3 items-center mt-2">
              <div class="flex items-center gap-1">
                <button boo-button variant="secondary" size="sm" [iconOnly]="true" (click)="changeQuantity(item, -1)" [disabled]="!canEdit || busy || item.quantity <= 1"
                  [attr.aria-label]="'Decrease quantity for ' + item.name"><physio-icon name="minus" [size]="14"></physio-icon></button>
                <boo-input class="!w-16" type="number" size="small" label="Qty" [ngModel]="draftFor(item, 'quantity')" (ngModelChange)="setDraft(item, 'quantity', $event)"
                  (focusout)="commitQuantity(item)" (keydown.enter)="commitQuantity(item)" [disabled]="!canEdit || busy" [maxlength]="4" [attr.aria-label]="'Quantity for ' + item.name"></boo-input>
                <button boo-button variant="secondary" size="sm" [iconOnly]="true" (click)="changeQuantity(item, 1)" [disabled]="!canEdit || busy"
                  [attr.aria-label]="'Increase quantity for ' + item.name"><physio-icon name="plus" [size]="14"></physio-icon></button>
              </div>
              <div class="flex items-center gap-1.5 justify-end">
                <boo-input class="!w-20" type="number" size="small" label="Discount" [ngModel]="draftFor(item, 'discountPercent')" (ngModelChange)="setDraft(item, 'discountPercent', $event)"
                  (focusout)="commitDiscount(item)" (keydown.enter)="commitDiscount(item)" [disabled]="!canEdit || busy" [maxlength]="5" [attr.aria-label]="'Discount percent for ' + item.name"></boo-input>
                <span class="text-xs text-secondary">%</span>
              </div>
            </div>

            <p *ngIf="rowErrors[item.id]" class="text-[11px] text-danger m-0 mt-1" role="alert">{{ rowErrors[item.id] }}</p>

            <div class="flex items-center justify-between mt-2 text-xs text-secondary">
              <span>{{ money(item.unitPrice) }} × {{ item.quantity }}<span *ngIf="item.discountPercent"> − {{ item.discountPercent }}%</span></span>
              <span class="text-sm font-semibold text-regular">{{ money(item.total) }}</span>
            </div>
          </li>
        </ul>
      </div>
    </section>
  `,
})
export class RetailCartPanelComponent implements OnChanges {
  @Input() cart: RetailCart | null = null;
  /** The cart can be edited: the sale is active and the cashier has pharmacy:retail-cart:update. */
  @Input() canEdit = false;
  @Input() canCreate = false;
  /** A cart request is in flight; controls lock so edits cannot be submitted twice. */
  @Input() busy = false;
  @Input() warnings: string[] = [];
  /** Stock seen in the catalog by medicine id, used only for the "exceeds stock" hint. */
  @Input() stockByMedicine: Record<string, number> = {};
  @Output() quantityChange = new EventEmitter<{ item: RetailCartLineItem; quantity: number }>();
  @Output() discountChange = new EventEmitter<{ item: RetailCartLineItem; discountPercent: number }>();
  @Output() removeItem = new EventEmitter<RetailCartLineItem>();
  @Output() clearAll = new EventEmitter<void>();
  @Output() resume = new EventEmitter<void>();
  @Output() newSale = new EventEmitter<void>();

  /**
   * Typed-but-uncommitted field values. They shadow the server value until a new cart arrives, so a failed request
   * leaves what the cashier typed in place instead of snapping back.
   */
  private drafts: Record<string, number | null> = {};
  rowErrors: Record<string, string> = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cart']) {
      this.drafts = {};
      this.rowErrors = {};
    }
  }

  draftFor(item: RetailCartLineItem, field: 'quantity' | 'discountPercent'): number | null {
    const key = `${item.id}:${field}`;
    return key in this.drafts ? this.drafts[key] : item[field];
  }

  setDraft(item: RetailCartLineItem, field: 'quantity' | 'discountPercent', value: number | null): void {
    this.drafts[`${item.id}:${field}`] = value;
    delete this.rowErrors[item.id];
  }

  commitQuantity(item: RetailCartLineItem): void {
    const key = `${item.id}:quantity`;
    if (!(key in this.drafts)) return;
    const value = this.drafts[key];
    if (value === item.quantity) { delete this.drafts[key]; return; }
    if (value === null || !Number.isInteger(Number(value)) || Number(value) < 1) {
      delete this.drafts[key];
      this.rowErrors[item.id] = 'Quantity must be a whole number of at least 1.';
      return;
    }
    this.quantityChange.emit({ item, quantity: Number(value) });
  }

  commitDiscount(item: RetailCartLineItem): void {
    const key = `${item.id}:discountPercent`;
    if (!(key in this.drafts)) return;
    const value = this.drafts[key];
    if (value === item.discountPercent) { delete this.drafts[key]; return; }
    if (value === null || Number(value) < 0 || Number(value) > 100) {
      delete this.drafts[key];
      this.rowErrors[item.id] = 'Discount must be between 0 and 100.';
      return;
    }
    this.discountChange.emit({ item, discountPercent: Number(value) });
  }

  changeQuantity(item: RetailCartLineItem, delta: number): void {
    const next = item.quantity + delta;
    if (next >= 1) this.quantityChange.emit({ item, quantity: next });
  }

  stockWarning(item: RetailCartLineItem): string | null {
    const stock = this.stockByMedicine[item.medicineId];
    return stock !== undefined && item.quantity > stock ? `Only ${stock} in stock` : null;
  }

  subtitle(item: RetailCartLineItem): string {
    return [item.genericName, item.strength, item.unit].filter(Boolean).join(' · ');
  }

  money(amount: number): string {
    return formatRetailMoney(amount);
  }

  trackById(_: number, item: RetailCartLineItem): string {
    return item.id;
  }
}
