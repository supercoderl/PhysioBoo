import { Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { DrawerComponent } from "../../../../components/drawer/drawer.component";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { RetailPosService } from "../../../../services/admin/retail-pos.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { RetailMedicineDetail } from "../../../../shared/types/retail-pos.types";

@Component({
  selector: 'retail-product-detail-drawer',
  standalone: true,
  imports: [SharedModule, BooIconComponent, DrawerComponent],
  template: `
    <drawer [isOpen]="isOpen" [width]="480" (close)="close.emit()">
      <div class="p-5" *ngIf="detail">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">{{ detail.name }}</h2>
            <p class="text-sm text-gray-500">{{ detail.genericName }} · {{ detail.strength }} · {{ detail.packageLabel }}</p>
          </div>
          <button type="button" (click)="close.emit()" class="text-gray-400 hover:text-gray-600" aria-label="Close drawer">
            <boo-icon name="x" [size]="18"></boo-icon>
          </button>
        </div>

        <div class="grid grid-cols-2 gap-3 mb-5 text-sm">
          <div><span class="text-gray-500 block text-xs">Manufacturer</span>{{ detail.manufacturer }}</div>
          <div><span class="text-gray-500 block text-xs">Category</span>{{ detail.category }}</div>
          <div><span class="text-gray-500 block text-xs">Batch No.</span>{{ detail.batchNo }}</div>
          <div><span class="text-gray-500 block text-xs">Expiry</span>{{ detail.expiryDate }}</div>
          <div><span class="text-gray-500 block text-xs">Stock</span>{{ detail.stock }} units</div>
          <div><span class="text-gray-500 block text-xs">Price</span>\${{ detail.price.toFixed(2) }} <span class="text-gray-400 line-through">\${{ detail.mrp.toFixed(2) }}</span></div>
        </div>

        <div class="mb-5" *ngIf="detail.interactionWarnings.length">
          <h3 class="text-xs font-semibold text-gray-500 uppercase mb-2">Interaction Warnings</h3>
          <div *ngFor="let w of detail.interactionWarnings" class="bg-rose-50 text-rose-700 text-xs rounded-lg p-2.5 mb-2 flex items-start gap-2">
            <boo-icon name="alert-triangle" [size]="14" iconClass="mt-0.5 shrink-0"></boo-icon>
            <span>{{ w }}</span>
          </div>
        </div>

        <div class="mb-5">
          <h3 class="text-xs font-semibold text-gray-500 uppercase mb-2">Alternative Medicines</h3>
          <div *ngFor="let alt of detail.alternatives" class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div>
              <p class="text-sm text-gray-800">{{ alt.name }}</p>
              <p class="text-xs text-gray-500">{{ alt.manufacturer }} · {{ alt.stock }} in stock</p>
            </div>
            <span class="text-sm font-semibold text-gray-900">\${{ alt.price.toFixed(2) }}</span>
          </div>
        </div>

        <div class="mb-5">
          <h3 class="text-xs font-semibold text-gray-500 uppercase mb-2">Inventory Movement</h3>
          <div *ngFor="let mv of detail.inventoryMovements" class="flex items-center justify-between py-1.5 text-xs">
            <span class="text-gray-500">{{ mv.date | date:'short' }} · {{ mv.reference }}</span>
            <span [ngClass]="mv.type === 'In' ? 'text-emerald-600' : 'text-rose-600'" class="font-semibold">{{ mv.type === 'In' ? '+' : '-' }}{{ mv.quantity }}</span>
          </div>
        </div>

        <button type="button" (click)="addToCart.emit(detail)" [disabled]="detail.stock === 0"
          class="w-full py-3 rounded-lg font-semibold text-sm transition-colors"
          [ngClass]="detail.stock > 0 ? 'bg-primary text-white hover:opacity-90' : 'bg-gray-200 text-gray-400 cursor-not-allowed'">
          {{ detail.stock === 0 ? 'Out of Stock' : 'Add to Cart' }}
        </button>
      </div>
    </drawer>
  `,
})
export class RetailProductDetailDrawerComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() medicineId: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<RetailMedicineDetail>();

  detail: RetailMedicineDetail | null = null;

  constructor(private srv: RetailPosService) { }

  ngOnChanges(): void {
    if (this.isOpen && this.medicineId) {
      this.srv.getMedicineDetail(this.medicineId).subscribe(res => {
        if (res.success) this.detail = res.data;
      });
    }
  }
}
