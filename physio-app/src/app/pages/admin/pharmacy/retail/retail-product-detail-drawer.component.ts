import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, inject, signal } from "@angular/core";
import { BooButtonComponent, BooErrorStateComponent } from '@physioboo/ui';
import { Subscription } from "rxjs";
import { DrawerComponent } from "../../../../components/drawer/drawer.component";
import { RetailPosService } from "../../../../services/admin/retail-pos.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { RetailMedicineDetail } from "../../../../shared/types/retail-pos.types";
import { formatRetailMoney } from "../../../../shared/utils/retail-pos.utils";

@Component({
  selector: 'retail-product-detail-drawer',
  standalone: true,
  imports: [SharedModule, DrawerComponent, BooButtonComponent, BooErrorStateComponent],
  template: `
    <drawer [isOpen]="isOpen" (close)="close.emit()">
      <div class="p-5" role="dialog" aria-modal="true" aria-labelledby="retail-detail-title" [attr.aria-hidden]="!isOpen">
        <div class="flex items-start justify-between gap-3 mb-4">
          <div class="min-w-0">
            <h2 id="retail-detail-title" class="text-lg font-semibold text-regular m-0 break-words">{{ detail()?.name || 'Medicine details' }}</h2>
            <p *ngIf="detail() as d" class="text-sm text-secondary m-0">{{ subtitle(d) }}</p>
          </div>
          <button type="button" (click)="close.emit()" class="w-8 h-8 shrink-0 rounded-1.5 flex items-center justify-center text-gray-500 hover:bg-gray-100" aria-label="Close details">
            <physio-icon name="x" [size]="18"></physio-icon>
          </button>
        </div>

        <div *ngIf="loading()" class="space-y-3" aria-busy="true">
          <div *ngFor="let n of [1,2,3,4]" class="h-10 rounded-1.5 bg-gray-50 animate-pulse"></div>
        </div>

        <boo-error-state *ngIf="!loading() && error()" title="Couldn't load details" [description]="error()" (retry)="load()"></boo-error-state>

        <ng-container *ngIf="!loading() && !error() && detail() as d">
          <dl class="grid grid-cols-2 gap-3 mb-5 text-sm m-0">
            <div *ngIf="d.manufacturer"><dt class="text-secondary text-xs">Manufacturer</dt><dd class="m-0">{{ d.manufacturer }}</dd></div>
            <div *ngIf="d.category"><dt class="text-secondary text-xs">Category</dt><dd class="m-0">{{ d.category }}</dd></div>
            <div *ngIf="d.barcode"><dt class="text-secondary text-xs">Barcode</dt><dd class="m-0">{{ d.barcode }}</dd></div>
            <div *ngIf="d.batchNo"><dt class="text-secondary text-xs">Next batch to sell</dt><dd class="m-0">{{ d.batchNo }}</dd></div>
            <div *ngIf="d.expiryDate"><dt class="text-secondary text-xs">Earliest expiry</dt><dd class="m-0">{{ d.expiryDate | date:'mediumDate' }}</dd></div>
            <div><dt class="text-secondary text-xs">Stock</dt><dd class="m-0">{{ d.stock }} units</dd></div>
            <div>
              <dt class="text-secondary text-xs">Price</dt>
              <dd class="m-0">{{ money(d.price) }} <span *ngIf="d.mrp && d.mrp > d.price" class="text-gray-500 line-through">{{ money(d.mrp) }}</span></dd>
            </div>
          </dl>

          <section *ngIf="d.interactionWarnings.length" class="mb-5" aria-label="Interaction warnings">
            <h3 class="text-xs font-semibold text-secondary uppercase m-0 mb-2">Interaction warnings</h3>
            <div *ngFor="let w of d.interactionWarnings" class="bg-dangerSoft border border-dangerBorder text-gray-900 text-xs rounded-1.5 p-2.5 mb-2 flex items-start gap-2" role="alert">
              <physio-icon name="triangle-alert" [size]="14" class="mt-0.5 shrink-0 text-danger"></physio-icon>
              <span>{{ w }}</span>
            </div>
          </section>

          <section class="mb-5" aria-label="Alternative medicines">
            <h3 class="text-xs font-semibold text-secondary uppercase m-0 mb-2">Alternative medicines</h3>
            <p *ngIf="!d.alternatives.length" class="text-sm text-secondary m-0">No alternatives on record.</p>
            <div *ngFor="let alt of d.alternatives" class="flex items-center justify-between gap-3 py-2 border-b border-borderGray/60 last:border-0">
              <div class="min-w-0">
                <p class="text-sm text-regular m-0 break-words">{{ alt.name }}</p>
                <p class="text-xs text-secondary m-0">{{ alt.manufacturer }}<span *ngIf="alt.manufacturer"> · </span>{{ alt.stock }} in stock</p>
              </div>
              <span class="text-sm font-semibold text-regular shrink-0">{{ money(alt.price) }}</span>
            </div>
          </section>

          <section class="mb-5" aria-label="Inventory movement">
            <h3 class="text-xs font-semibold text-secondary uppercase m-0 mb-2">Recent inventory movement</h3>
            <p *ngIf="!d.inventoryMovements.length" class="text-sm text-secondary m-0">No movements recorded.</p>
            <div *ngFor="let mv of d.inventoryMovements" class="flex items-center justify-between py-1.5 text-xs">
              <span class="text-secondary">{{ mv.date | date:'short' }}<span *ngIf="mv.reference"> · {{ mv.reference }}</span></span>
              <span class="font-semibold" [ngClass]="mv.type === 'In' ? 'text-emerald-700' : 'text-danger'">{{ mv.type === 'In' ? '+' : '−' }}{{ mv.quantity }}</span>
            </div>
          </section>

          <button boo-button variant="primary" size="md" [block]="true" (click)="addToCart.emit(d)" [disabled]="d.stock <= 0 || addDisabled" [loading]="adding"
            [attr.title]="addDisabled ? addDisabledReason : null">
            {{ d.stock <= 0 ? 'Out of stock' : 'Add to cart' }}
          </button>
        </ng-container>
      </div>
    </drawer>
  `,
})
export class RetailProductDetailDrawerComponent implements OnChanges, OnDestroy {
  @Input() isOpen = false;
  @Input() medicineId: string | null = null;
  @Input() addDisabled = false;
  @Input() addDisabledReason = '';
  @Input() adding = false;
  @Output() close = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<RetailMedicineDetail>();

  private readonly srv = inject(RetailPosService);
  private sub?: Subscription;

  detail = signal<RetailMedicineDetail | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isOpen'] || changes['medicineId']) && this.isOpen && this.medicineId) this.load();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  load(): void {
    if (!this.medicineId) return;
    this.sub?.unsubscribe();
    this.detail.set(null);
    this.error.set(null);
    this.loading.set(true);
    this.sub = this.srv.getMedicineDetail(this.medicineId).subscribe({
      next: res => {
        this.loading.set(false);
        if (res.success && res.data) this.detail.set(res.data);
        else this.error.set('This medicine is no longer available.');
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Check your connection and try again.');
      },
    });
  }

  subtitle(d: RetailMedicineDetail): string {
    return [d.genericName, d.strength, d.packageLabel].filter(Boolean).join(' · ');
  }

  money(amount: number): string {
    return formatRetailMoney(amount);
  }
}
