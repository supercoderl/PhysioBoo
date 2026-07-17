import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooIconComponent } from "../../../../icon/boo-icon/boo-icon.component";
import { DrawerComponent } from "../../../../drawer/drawer.component";
import { SharedModule } from "../../../../../shared/shared-imports";
import { RevenueTransactionDetail } from "../../../../../shared/types/revenue.types";

@Component({
    selector: 'revenue-transaction-drawer',
    standalone: true,
    imports: [SharedModule, DrawerComponent, BooIconComponent],
    template: `
    <drawer [isOpen]="isOpen" [isShowDialog]="false" [width]="440" (close)="close.emit()">
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div>
          <h3 class="text-base font-semibold text-regular">Transaction Detail</h3>
          <p class="text-xs text-secondary" *ngIf="detail as d">{{ d.billNo }}</p>
        </div>
        <button type="button" (click)="close.emit()" class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
          <boo-icon name="x" [size]="16" iconClass="text-gray-500"></boo-icon>
        </button>
      </div>

      <div class="p-5" *ngIf="loading">
        <div class="space-y-3">
          <div *ngFor="let i of [1,2,3,4]" class="h-10 animate-pulse bg-gray-100 rounded-1.5"></div>
        </div>
      </div>

      <div class="p-5" *ngIf="!loading && !detail">
        <div class="h-[200px] flex flex-col items-center justify-center text-center gap-2">
          <boo-icon name="file-search" [size]="28" iconClass="text-gray-300"></boo-icon>
          <p class="text-sm text-secondary">Select a transaction to view details.</p>
        </div>
      </div>

      <div class="p-5 space-y-5 overflow-y-auto" *ngIf="!loading && detail as d">
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p class="text-xs text-secondary">Patient</p>
            <p class="font-medium text-regular">{{ d.patientName }}</p>
          </div>
          <div>
            <p class="text-xs text-secondary">Doctor</p>
            <p class="font-medium text-regular">{{ d.doctorName }}</p>
          </div>
          <div>
            <p class="text-xs text-secondary">Department</p>
            <p class="font-medium text-regular">{{ d.department }}</p>
          </div>
          <div>
            <p class="text-xs text-secondary">Date & Time</p>
            <p class="font-medium text-regular">{{ d.datetime | date:'MMM d, y, h:mm a' }}</p>
          </div>
        </div>

        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-secondary mb-2">Line Items</p>
          <div class="divide-y divide-gray-100 border border-gray-100 rounded-1.5">
            <div *ngFor="let li of d.lineItems" class="flex items-center justify-between px-3 py-2 text-sm">
              <div class="min-w-0">
                <p class="text-regular truncate">{{ li.description }}</p>
                <p class="text-xs text-secondary">{{ li.quantity }} × {{ li.unitPrice | currency }}</p>
              </div>
              <p class="font-medium text-regular shrink-0 ml-3">{{ li.total | currency }}</p>
            </div>
            <div *ngIf="d.lineItems.length === 0" class="px-3 py-4 text-sm text-secondary text-center">No line items.</div>
          </div>
        </div>

        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-secondary mb-2">Payment Splits</p>
          <div class="divide-y divide-gray-100 border border-gray-100 rounded-1.5">
            <div *ngFor="let p of d.paymentSplits" class="flex items-center justify-between px-3 py-2 text-sm">
              <span class="text-regular">{{ p.method }}<span *ngIf="p.reference" class="text-secondary"> · {{ p.reference }}</span></span>
              <span class="font-medium text-regular">{{ p.amount | currency }}</span>
            </div>
            <div *ngIf="d.paymentSplits.length === 0" class="px-3 py-4 text-sm text-secondary text-center">No payment splits recorded.</div>
          </div>
        </div>

        <div *ngIf="d.insuranceClaim as claim">
          <p class="text-xs font-semibold uppercase tracking-wide text-secondary mb-2">Insurance Claim</p>
          <div class="border border-gray-100 rounded-1.5 px-3 py-2.5 text-sm space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-regular">{{ claim.providerName }}</span>
              <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-secondary">{{ claim.status }}</span>
            </div>
            <div class="flex items-center justify-between text-secondary">
              <span>Claimed {{ claim.claimedAmount | currency }}</span>
              <span>Approved {{ claim.approvedAmount | currency }}</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3 text-sm pt-2 border-t border-gray-100">
          <div>
            <p class="text-xs text-secondary">Amount</p>
            <p class="font-semibold text-regular">{{ d.amount | currency }}</p>
          </div>
          <div>
            <p class="text-xs text-secondary">Discount</p>
            <p class="font-semibold text-amber-600">{{ d.discount | currency }}</p>
          </div>
          <div>
            <p class="text-xs text-secondary">Refund</p>
            <p class="font-semibold text-rose-600">{{ d.refund | currency }}</p>
          </div>
        </div>
      </div>
    </drawer>
  `,
})
export class RevenueTransactionDrawerComponent {
    @Input() isOpen = false;
    @Input() detail: RevenueTransactionDetail | null = null;
    @Input() loading = false;
    @Output() close = new EventEmitter<void>();
}
