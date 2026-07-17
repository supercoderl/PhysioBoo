import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { BooDatepickerComponent } from "../../../../components/date-picker/boo-date-picker.component";
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { DepartmentService } from "../../../../services/admin/department.service";
import { StockTakeService } from "../../../../services/admin/stock-take.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { Lookup } from "../../../../shared/types/common";
import { StockTakeFilter } from "../../../../shared/types/stock-take.types";

@Component({
    selector: 'stock-take-filter-bar',
    standalone: true,
    imports: [SharedModule, BooIconComponent, BooSelectComponent, BooDatepickerComponent],
    template: `
    <div class="bg-surface border border-borderGray/60 rounded-2 p-3.5">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
        <boo-select label="Warehouse" [(ngModel)]="filter.warehouseId" (ngModelChange)="emitChange()"
          [options]="warehouses" bindLabel="name" bindValue="id"></boo-select>

        <boo-select label="Department" [(ngModel)]="filter.departmentId" (ngModelChange)="emitChange()"
          [options]="departments" bindLabel="name" bindValue="id"></boo-select>

        <boo-select label="Status" [(ngModel)]="filter.status" (ngModelChange)="emitChange()"
          [options]="statusOptions" bindLabel="label" bindValue="value"></boo-select>

        <boo-datepicker label="Scheduled From" [(ngModel)]="filter.dateFrom" (ngModelChange)="emitChange()"></boo-datepicker>

        <boo-datepicker label="Scheduled To" [(ngModel)]="filter.dateTo" (ngModelChange)="emitChange()"></boo-datepicker>

        <div class="flex items-center gap-2">
          <div class="flex-1 relative">
            <boo-icon name="search" [size]="14" iconClass="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></boo-icon>
            <input type="text" [(ngModel)]="search" (ngModelChange)="onSearchChange()"
              placeholder="Search stock take no..."
              class="w-full pl-8 pr-3 h-8 border border-gray-300 rounded-1.5 text-[13px] focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
          </div>
          <button type="button" (click)="onReset()" title="Reset filters"
            class="w-8 h-8 shrink-0 rounded-1.5 border border-gray-200 flex items-center justify-center hover:bg-gray-50" aria-label="Reset filters">
            <boo-icon name="rotate-ccw" [size]="14" iconClass="text-gray-500"></boo-icon>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class StockTakeFilterBarComponent implements OnInit {
    @Input() filter: StockTakeFilter = {};
    @Output() filterChange = new EventEmitter<StockTakeFilter>();
    @Output() searchChange = new EventEmitter<string>();
    @Output() reset = new EventEmitter<void>();

    search = '';
    warehouses: Lookup[] = [];
    departments: Lookup[] = [];

    readonly statusOptions = [
        { label: 'Draft', value: 'Draft' },
        { label: 'Counting', value: 'Counting' },
        { label: 'Pending Approval', value: 'PendingApproval' },
        { label: 'Approved', value: 'Approved' },
        { label: 'Rejected', value: 'Rejected' },
        { label: 'Cancelled', value: 'Cancelled' },
    ];

    constructor(private srv: StockTakeService, private departmentSrv: DepartmentService) { }

    ngOnInit(): void {
        this.srv.getWarehouses().subscribe(res => { if (res.success) this.warehouses = res.data; });
        this.departmentSrv.search({ pageNumber: 1, pageSize: 100 }).subscribe(res => {
            if (res.success) this.departments = res.data.items.map(d => ({ id: d.id, name: d.name }));
        });
    }

    emitChange(): void {
        this.filterChange.emit({ ...this.filter });
    }

    onSearchChange(): void {
        this.searchChange.emit(this.search);
    }

    onReset(): void {
        this.filter = {};
        this.search = '';
        this.reset.emit();
    }
}
