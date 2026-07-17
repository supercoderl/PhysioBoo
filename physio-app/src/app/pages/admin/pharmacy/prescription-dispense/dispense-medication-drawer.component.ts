import { Component, EventEmitter, Input, Output } from "@angular/core";
import { DrawerComponent } from "../../../../components/drawer/drawer.component";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { BatchOption, DispenseMedicationItem, DispenseMedicineAlternative, DispenseMedicineDetail } from "../../../../shared/types/dispensing.types";

@Component({
    selector: 'dispense-medication-drawer',
    standalone: true,
    imports: [SharedModule, BooIconComponent, DrawerComponent],
    template: `
    <drawer [isOpen]="isOpen" [width]="480" (close)="close.emit()">
      <div class="flex flex-col h-full" *ngIf="item">
        <div class="p-4 border-b border-borderGray/60 flex items-start justify-between">
          <div>
            <h3 class="text-base font-semibold text-regular">{{ item.name }}</h3>
            <p class="text-xs text-secondary">{{ item.genericName }} · {{ item.strength }} · {{ item.dosageForm }}</p>
          </div>
          <button type="button" (click)="close.emit()" class="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100">
            <boo-icon name="x" [size]="16"></boo-icon>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-5">
          <!-- Medicine details -->
          <section>
            <h4 class="text-xs font-semibold text-secondary uppercase mb-2">Medicine Details</h4>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div><span class="text-secondary">Route</span><p class="font-medium text-regular">{{ item.route || '—' }}</p></div>
              <div><span class="text-secondary">Manufacturer</span><p class="font-medium text-regular">{{ detail?.manufacturer || '—' }}</p></div>
              <div><span class="text-secondary">Dose</span><p class="font-medium text-regular">{{ item.dose }}</p></div>
              <div><span class="text-secondary">Frequency</span><p class="font-medium text-regular">{{ item.frequency }}</p></div>
            </div>
          </section>

          <!-- Batch & expiry -->
          <section>
            <h4 class="text-xs font-semibold text-secondary uppercase mb-2">Batch &amp; Expiry (FEFO)</h4>
            <div class="space-y-1.5">
              <button type="button" *ngFor="let b of item.availableBatches" (click)="selectBatch.emit(b)"
                class="w-full flex items-center justify-between px-3 py-2 rounded-1.5 border text-left"
                [ngClass]="b.batchNo === item.batchNo ? 'border-primary bg-primary/5' : 'border-borderGray/60 hover:bg-gray-50'">
                <div>
                  <p class="text-xs font-semibold text-regular">{{ b.batchNo }}</p>
                  <p class="text-[11px] text-secondary">{{ b.location }} · {{ b.quantityAvailable }} available</p>
                </div>
                <span class="text-[11px] font-semibold" [ngClass]="b.isExpired ? 'text-rose-600' : b.isNearExpiry ? 'text-amber-600' : 'text-secondary'">
                  Exp {{ b.expiryDate }}
                </span>
              </button>
            </div>
          </section>

          <!-- Inventory location -->
          <section *ngIf="detail?.stockByLocation?.length">
            <h4 class="text-xs font-semibold text-secondary uppercase mb-2">Inventory Location</h4>
            <div class="space-y-1">
              <div *ngFor="let s of detail!.stockByLocation" class="flex items-center justify-between text-xs">
                <span class="text-secondary">{{ s.location }}</span>
                <span class="font-medium text-regular">{{ s.quantity }} units</span>
              </div>
            </div>
          </section>

          <!-- Drug interactions -->
          <section *ngIf="detail?.interactionWarnings?.length">
            <h4 class="text-xs font-semibold text-secondary uppercase mb-2">Drug Interactions</h4>
            <div class="space-y-1.5">
              <div *ngFor="let w of detail!.interactionWarnings" class="px-3 py-2 rounded-1.5 bg-amber-50 text-amber-800 text-xs flex items-start gap-2">
                <boo-icon name="triangle-alert" [size]="13" iconClass="mt-0.5 shrink-0"></boo-icon>
                <span>{{ w }}</span>
              </div>
            </div>
          </section>

          <!-- Alternative medicines -->
          <section *ngIf="item.alternatives.length">
            <h4 class="text-xs font-semibold text-secondary uppercase mb-2">Alternative Medicines</h4>
            <div class="space-y-1.5">
              <div *ngFor="let alt of item.alternatives" class="flex items-center justify-between px-3 py-2 rounded-1.5 border border-borderGray/60">
                <div>
                  <p class="text-xs font-semibold text-regular">{{ alt.name }}</p>
                  <p class="text-[11px] text-secondary">{{ alt.manufacturer }} · {{ alt.stock }} in stock</p>
                </div>
                <button type="button" (click)="selectAlternative.emit(alt)" class="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-primary/10 text-primary hover:bg-primary/20">
                  Use Instead
                </button>
              </div>
            </div>
          </section>

          <!-- Dispensing history -->
          <section *ngIf="detail?.dispensingHistory?.length">
            <h4 class="text-xs font-semibold text-secondary uppercase mb-2">Dispensing History</h4>
            <div class="space-y-1.5">
              <div *ngFor="let h of detail!.dispensingHistory" class="flex items-center justify-between text-xs">
                <span class="text-secondary">{{ h.date | date:'mediumDate' }} · {{ h.pharmacist }}</span>
                <span class="font-medium text-regular">{{ h.quantity }} {{ item.unit }}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </drawer>
  `,
})
export class DispenseMedicationDrawerComponent {
    @Input() isOpen = false;
    @Input() item: DispenseMedicationItem | null = null;
    @Input() detail: DispenseMedicineDetail | null = null;

    @Output() close = new EventEmitter<void>();
    @Output() selectBatch = new EventEmitter<BatchOption>();
    @Output() selectAlternative = new EventEmitter<DispenseMedicineAlternative>();
}
