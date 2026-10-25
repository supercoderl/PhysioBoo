import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooButtonComponent, BooInlineErrorComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { DrawerComponent } from "../../../../components/drawer/drawer.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { BatchOption, DispenseMedicationItem, DispenseMedicineAlternative, DispenseMedicineDetail } from "../../../../shared/types/dispensing.types";

@Component({
  selector: 'dispense-medication-drawer',
  standalone: true,
  imports: [SharedModule, DrawerComponent, BooButtonComponent, BooStatusBadgeComponent, BooInlineErrorComponent],
  template: `
    <drawer [isOpen]="isOpen" (close)="close.emit()">
      <div class="flex flex-col h-screen" *ngIf="item" role="dialog" aria-modal="true" aria-labelledby="dispense-drawer-title">
        <header class="p-5 border-b border-borderGray/60 flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 id="dispense-drawer-title" class="text-base font-semibold text-regular m-0">{{ item.name }}<span *ngIf="item.strength" class="font-normal text-secondary"> · {{ item.strength }}</span></h2>
            <p class="text-xs text-secondary mt-1 mb-0">{{ descriptor }}</p>
          </div>
          <button boo-button variant="subtle" size="sm" [iconOnly]="true" (click)="close.emit()" aria-label="Close medicine details"><physio-icon name="x" [size]="18"></physio-icon></button>
        </header>

        <div class="flex-1 overflow-y-auto p-5 space-y-6">
          <section aria-labelledby="dispense-drawer-rx">
            <h3 id="dispense-drawer-rx" class="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">Prescribed</h3>
            <dl class="grid grid-cols-2 gap-3 text-sm m-0">
              <div><dt class="text-xs text-secondary">Dose</dt><dd class="font-medium text-regular m-0">{{ item.dose || '—' }}</dd></div>
              <div><dt class="text-xs text-secondary">Frequency</dt><dd class="font-medium text-regular m-0">{{ item.frequency || '—' }}</dd></div>
              <div><dt class="text-xs text-secondary">Duration</dt><dd class="font-medium text-regular m-0">{{ item.durationDays }} days</dd></div>
              <div><dt class="text-xs text-secondary">Quantity</dt><dd class="font-medium text-regular m-0">{{ item.qtyPrescribed }} {{ item.unit }}</dd></div>
              <div *ngIf="detail?.manufacturer"><dt class="text-xs text-secondary">Manufacturer</dt><dd class="font-medium text-regular m-0">{{ detail?.manufacturer }}</dd></div>
            </dl>
          </section>

          <section aria-labelledby="dispense-drawer-batches">
            <h3 id="dispense-drawer-batches" class="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">Batches · earliest expiry first</h3>
            <p *ngIf="!item.availableBatches.length" class="text-sm text-secondary m-0">No batches in stock.</p>
            <ul class="list-none m-0 p-0 space-y-2">
              <li *ngFor="let b of item.availableBatches" class="rounded-2 border px-3 py-2.5 flex items-center justify-between gap-3"
                [ngClass]="b.batchNo === item.batchNo ? 'border-primary bg-primarySoft' : 'border-borderGray/60'">
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-regular m-0">{{ b.batchNo }}
                    <boo-status-badge *ngIf="b.batchNo === item.batchNo" label="Selected" tone="primary"></boo-status-badge>
                    <boo-status-badge *ngIf="b.isExpired" label="Expired" tone="danger"></boo-status-badge>
                    <boo-status-badge *ngIf="!b.isExpired && b.isNearExpiry" label="Near expiry" tone="warning"></boo-status-badge></p>
                  <p class="text-xs text-secondary mt-0.5 mb-0">{{ b.location || 'No location' }} · {{ b.quantityAvailable }} available<ng-container *ngIf="b.expiryDate"> · exp {{ b.expiryDate }}</ng-container></p>
                </div>
                <button *ngIf="canProcess && b.batchNo !== item.batchNo && !b.isExpired" boo-button size="sm" variant="secondary" [disabled]="locked" (click)="selectBatch.emit(b)">Use batch</button>
              </li>
            </ul>
          </section>

          <section *ngIf="loading || error || detail" aria-labelledby="dispense-drawer-stock">
            <h3 id="dispense-drawer-stock" class="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">Stock, interactions &amp; history</h3>
            <div *ngIf="loading" class="space-y-2 animate-pulse" aria-busy="true"><div class="h-4 w-1/2 bg-gray-200 rounded"></div><div class="h-4 w-2/3 bg-gray-100 rounded"></div></div>
            <boo-inline-error *ngIf="error && !loading" what="medicine details" [compact]="true" (retry)="retry.emit()"></boo-inline-error>

            <ng-container *ngIf="detail && !loading">
              <ul *ngIf="detail.stockByLocation.length" class="list-none m-0 p-0 space-y-1 mb-4">
                <li *ngFor="let s of detail.stockByLocation" class="flex items-center justify-between text-sm"><span class="text-secondary">{{ s.location || 'Unassigned' }}</span><span class="font-medium text-regular">{{ s.quantity }} {{ item.unit }}</span></li>
              </ul>
              <ul *ngIf="detail.interactionWarnings.length" class="list-none m-0 p-0 space-y-2 mb-4">
                <li *ngFor="let w of detail.interactionWarnings" class="rounded-2 bg-amber-50 px-3 py-2 text-sm text-amber-800 flex items-start gap-2"><physio-icon name="triangle-alert" [size]="14" class="mt-0.5 shrink-0"></physio-icon><span>{{ w }}</span></li>
              </ul>
              <ul *ngIf="detail.dispensingHistory.length" class="list-none m-0 p-0 space-y-1">
                <li *ngFor="let h of detail.dispensingHistory" class="flex items-center justify-between text-sm"><span class="text-secondary">{{ h.date | date:'dd MMM yyyy' }} · {{ h.pharmacist }}</span><span class="font-medium text-regular">{{ h.quantity }} {{ item.unit }}</span></li>
              </ul>
              <p *ngIf="!detail.stockByLocation.length && !detail.interactionWarnings.length && !detail.dispensingHistory.length" class="text-sm text-secondary m-0">No additional stock, interaction or history information.</p>
            </ng-container>
          </section>

          <section *ngIf="item.alternatives.length" aria-labelledby="dispense-drawer-alt">
            <h3 id="dispense-drawer-alt" class="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">In-stock equivalents</h3>
            <ul class="list-none m-0 p-0 space-y-2">
              <li *ngFor="let alt of item.alternatives" class="rounded-2 border border-borderGray/60 px-3 py-2.5 flex items-center justify-between gap-3">
                <div class="min-w-0"><p class="text-sm font-semibold text-regular m-0">{{ alt.name }}</p><p class="text-xs text-secondary mt-0.5 mb-0">{{ alt.manufacturer }} · {{ alt.stock }} in stock</p></div>
                <button *ngIf="canProcess" boo-button size="sm" variant="secondary" [disabled]="locked" (click)="substitute.emit(alt)">Substitute</button>
              </li>
            </ul>
            <p class="text-xs text-secondary mt-2 mb-0">Substitution is only accepted when the prescriber allowed it.</p>
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
  @Input() loading = false;
  @Input() error = false;
  @Input() canProcess = false;
  @Input() locked = false;

  @Output() close = new EventEmitter<void>();
  @Output() selectBatch = new EventEmitter<BatchOption>();
  @Output() substitute = new EventEmitter<DispenseMedicineAlternative>();
  @Output() retry = new EventEmitter<void>();

  get descriptor(): string {
    return [this.item?.genericName, this.item?.dosageForm, this.item?.route].filter(Boolean).join(' · ');
  }
}
