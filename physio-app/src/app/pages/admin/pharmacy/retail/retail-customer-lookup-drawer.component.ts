import { Component, EventEmitter, Input, OnChanges, Output, signal } from "@angular/core";
import { DrawerComponent } from "../../../../components/drawer/drawer.component";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../components/ui/empty-state.component";
import { RetailPosService } from "../../../../services/admin/retail-pos.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { RetailCustomer } from "../../../../shared/types/retail-pos.types";

@Component({
  selector: 'retail-customer-lookup-drawer',
  standalone: true,
  imports: [SharedModule, BooIconComponent, DrawerComponent, EmptyStateComponent],
  template: `
    <drawer [isOpen]="isOpen" [width]="420" (close)="close.emit()">
      <div class="p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-semibold text-gray-900">Find Customer</h2>
          <button type="button" (click)="close.emit()" class="text-gray-400 hover:text-gray-600" aria-label="Close drawer">
            <boo-icon name="x" [size]="18"></boo-icon>
          </button>
        </div>

        <div class="relative mb-4">
          <boo-icon name="search" [size]="16" iconClass="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></boo-icon>
          <input type="text" [(ngModel)]="query" (ngModelChange)="search()" placeholder="Search by name, phone, or MRN..."
            class="w-full pl-9 pr-3 h-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
        </div>

        <boo-empty-state *ngIf="!results().length" icon="user-search" title="No patients found" description="Try a different name, phone, or MRN"></boo-empty-state>

        <div *ngFor="let p of results()" class="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
          <div>
            <p class="text-sm font-medium text-gray-900">{{ p.fullName }}</p>
            <p class="text-xs text-gray-500">{{ p.mrn }} · {{ p.phone }}</p>
          </div>
          <button type="button" (click)="useCustomer.emit(p)" class="text-xs font-semibold text-primary hover:underline">Use as Customer</button>
        </div>

        <div class="mt-6 pt-4 border-t border-gray-200">
          <p class="text-xs font-semibold text-gray-500 uppercase mb-2">Walk-in Customer</p>
          <div class="flex flex-col gap-2">
            <input type="text" [(ngModel)]="walkInName" placeholder="Name"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
            <input type="tel" [(ngModel)]="walkInPhone" placeholder="Phone"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
            <button type="button" (click)="useWalkIn()" [disabled]="!walkInName"
              class="py-2 rounded-lg text-sm font-semibold transition-colors"
              [ngClass]="walkInName ? 'bg-primary text-white hover:opacity-90' : 'bg-gray-200 text-gray-400 cursor-not-allowed'">
              Use Walk-in Customer
            </button>
          </div>
        </div>
      </div>
    </drawer>
  `,
})
export class RetailCustomerLookupDrawerComponent implements OnChanges {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() useCustomer = new EventEmitter<RetailCustomer>();

  query = '';
  walkInName = '';
  walkInPhone = '';
  results = signal<RetailCustomer[]>([]);

  constructor(private srv: RetailPosService) { }

  ngOnChanges(): void {
    if (this.isOpen) this.search();
  }

  search(): void {
    this.srv.searchPatients(this.query).subscribe(res => {
      if (res.success) this.results.set(res.data);
    });
  }

  useWalkIn(): void {
    if (!this.walkInName) return;
    this.useCustomer.emit({ type: 'WalkIn', fullName: this.walkInName, phone: this.walkInPhone });
    this.walkInName = '';
    this.walkInPhone = '';
  }
}
