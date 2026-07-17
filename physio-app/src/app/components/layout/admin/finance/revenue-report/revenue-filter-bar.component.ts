import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { DepartmentService } from "../../../../../services/admin/department.service";
import { DoctorService } from "../../../../../services/admin/doctor.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { Lookup } from "../../../../../shared/types/common";
import { RevenueGranularity, RevenueReportFilter } from "../../../../../shared/types/filter.types";
import { BooDatepickerComponent } from "../../../../date-picker/boo-date-picker.component";
import { BooIconComponent } from "../../../../icon/boo-icon/boo-icon.component";
import { BooSelectComponent } from "../../../../select/boo-select/boo-select.component";

type RangePreset = 'today' | '7d' | '30d' | 'month' | 'quarter' | 'custom';

@Component({
    selector: 'revenue-filter-bar',
    standalone: true,
    imports: [SharedModule, BooIconComponent, BooSelectComponent, BooDatepickerComponent],
    template: `
    <div class="bg-surface border border-borderGray/60 rounded-2 p-3.5">
      <div class="flex flex-wrap items-center gap-1.5 mb-3">
        <button type="button" *ngFor="let p of rangePresets" (click)="applyPreset(p.value)"
          class="px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
          [ngClass]="preset === p.value ? 'bg-primary text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'">
          {{ p.label }}
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
        <boo-datepicker label="From" [(ngModel)]="filter.start" (ngModelChange)="onCustomDateChange()"></boo-datepicker>
        <boo-datepicker label="To" [(ngModel)]="filter.end" (ngModelChange)="onCustomDateChange()"></boo-datepicker>

        <boo-select label="Department" [(ngModel)]="selectedDepartmentId" (ngModelChange)="onDepartmentChange($event)"
          [options]="departments" bindLabel="name" bindValue="id"></boo-select>

        <boo-select label="Doctor" [(ngModel)]="selectedDoctorId" (ngModelChange)="onDoctorChange($event)"
          [options]="doctors" bindLabel="name" bindValue="id"></boo-select>

        <boo-select label="Payment Method" [(ngModel)]="selectedPaymentMethod" (ngModelChange)="onPaymentMethodChange($event)"
          [options]="paymentMethodOptions" bindLabel="label" bindValue="value"></boo-select>

        <div class="flex items-center gap-2">
          <boo-select label="Granularity" [(ngModel)]="filter.granularity" (ngModelChange)="emitChange()"
            [options]="granularityOptions" bindLabel="label" bindValue="value" required></boo-select>
          <button type="button" (click)="onReset()" title="Reset filters"
            class="w-11 h-11 shrink-0 rounded-1.5 border border-gray-200 flex items-center justify-center hover:bg-gray-50" aria-label="Reset filters">
            <boo-icon name="rotate-ccw" [size]="16" iconClass="text-gray-500"></boo-icon>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class RevenueFilterBarComponent implements OnInit {
    @Input({ required: true }) filter!: RevenueReportFilter;
    @Output() filterChange = new EventEmitter<RevenueReportFilter>();
    @Output() reset = new EventEmitter<void>();

    preset: RangePreset = '30d';
    departments: Lookup[] = [];
    doctors: Lookup[] = [];
    selectedDepartmentId: string | null = null;
    selectedDoctorId: string | null = null;
    selectedPaymentMethod: string | null = null;

    readonly rangePresets: { label: string; value: RangePreset }[] = [
        { label: 'Today', value: 'today' },
        { label: 'Last 7 Days', value: '7d' },
        { label: 'Last 30 Days', value: '30d' },
        { label: 'This Month', value: 'month' },
        { label: 'This Quarter', value: 'quarter' },
    ];

    readonly granularityOptions: { label: string; value: RevenueGranularity }[] = [
        { label: 'Daily', value: 'day' },
        { label: 'Weekly', value: 'week' },
        { label: 'Monthly', value: 'month' },
    ];

    readonly paymentMethodOptions = [
        { label: 'Cash', value: 'Cash' },
        { label: 'Card', value: 'Card' },
        { label: 'UPI', value: 'UPI' },
        { label: 'Insurance', value: 'Insurance' },
    ];

    constructor(private departmentSrv: DepartmentService, private doctorSrv: DoctorService) { }

    ngOnInit(): void {
        this.departmentSrv.search({ pageNumber: 1, pageSize: 100 }).subscribe(res => {
            if (res.success) this.departments = res.data.items.map(d => ({ id: d.id, name: d.name }));
        });
        this.doctorSrv.search({ pageNumber: 1, pageSize: 100 }).subscribe(res => {
            if (res.success) this.doctors = res.data.items.map(d => ({ id: d.id, name: "" }));
        });
    }

    applyPreset(preset: RangePreset): void {
        this.preset = preset;
        const today = new Date();
        const toIso = (d: Date) => d.toISOString().split('T')[0];
        let start = new Date(today);

        switch (preset) {
            case 'today':
                break;
            case '7d':
                start.setDate(today.getDate() - 6);
                break;
            case '30d':
                start.setDate(today.getDate() - 29);
                break;
            case 'month':
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                break;
            case 'quarter':
                start = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
                break;
        }

        this.filter.start = toIso(start);
        this.filter.end = toIso(today);
        this.emitChange();
    }

    onCustomDateChange(): void {
        this.preset = 'custom';
        this.emitChange();
    }

    onDepartmentChange(id: string | null): void {
        this.filter.departmentIds = id ? [id] : undefined;
        this.emitChange();
    }

    onDoctorChange(id: string | null): void {
        this.filter.doctorIds = id ? [id] : undefined;
        this.emitChange();
    }

    onPaymentMethodChange(method: string | null): void {
        this.filter.paymentMethods = method ? [method] : undefined;
        this.emitChange();
    }

    onReset(): void {
        this.selectedDepartmentId = null;
        this.selectedDoctorId = null;
        this.selectedPaymentMethod = null;
        this.preset = '30d';
        this.reset.emit();
    }

    emitChange(): void {
        this.filterChange.emit({ ...this.filter });
    }
}
