import { Component, EventEmitter, Input, OnChanges, Output, signal } from "@angular/core";
import { DrawerComponent } from "../../../../components/drawer/drawer.component";
import { BooEmptyStateComponent, BooInputComponent } from '@physioboo/ui';
import { RetailPosService } from "../../../../services/admin/retail-pos.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { RetailCustomer } from "../../../../shared/types/retail-pos.types";
import { BooButtonAdminComponent } from "../../../../components/button/boo-button-admin/boo-button-admin.component";

@Component({
  selector: 'retail-customer-lookup-drawer',
  standalone: true,
  imports: [SharedModule,DrawerComponent, BooEmptyStateComponent, BooButtonAdminComponent, BooInputComponent],
  template: `
    <drawer [isOpen]="isOpen" (close)="close.emit()">
      <div class="p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-semibold text-gray-900">Find Customer</h2>
          <button type="button" (click)="close.emit()" class="text-gray-400 hover:text-gray-600" aria-label="Close drawer">
            <physio-icon name="x" [size]="18"></physio-icon>
          </button>
        </div>

        <div class="relative mb-4">
          <physio-icon name="search" [size]="16" [class]="'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'"></physio-icon>
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
            <boo-input [(ngModel)]="walkInName" label="Name" size="small"></boo-input>
            <boo-input type="tel" [(ngModel)]="walkInPhone" label="Phone" size="small"></boo-input>
            <boo-button-admin (click)="useWalkIn()" [disabled]="!walkInName" textColor="white" padding="8px 12px" [fontSize]="14" [radius]="8" fontWeight="600" buttonClass="w-full" class="w-full">
              Use Walk-in Customer
            </boo-button-admin>
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
