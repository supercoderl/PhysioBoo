import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { BooFilterChip, BooFilterChipsComponent, BooInputComponent } from "@physioboo/ui";
import { DepartmentService } from "../../../../../services/admin/department.service";
import { DoctorService } from "../../../../../services/admin/doctor.service";
import { InsuranceCompanyService } from "../../../../../services/admin/insurance-company.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { Lookup } from "../../../../../shared/types/common";
import { RevenueGranularity, RevenueReportFilter } from "../../../../../shared/types/filter.types";
import { BooDatepickerComponent } from "../../../../date-picker/boo-date-picker.component";
import { BooSelectComponent } from "../../../../select/boo-select/boo-select.component";
import { activePreset, presetRange, RevenuePreset } from "./revenue-report-filter.util";

type FilterChipKey = 'department' | 'doctor' | 'method' | 'insurer' | 'search';
interface ScopeChip extends BooFilterChip { key: FilterChipKey; }

const ALL = 'all';
const MIN_SEARCH_LENGTH = 2;

/**
 * The reporting toolbar. It is controlled: it never edits `filter`, it emits a new one, so a drill-down or a reset
 * done by the page is reflected here. Lookups it cannot load simply leave their select with "All".
 */
@Component({
    selector: 'revenue-filter-bar',
    standalone: true,
    imports: [SharedModule, BooSelectComponent, BooDatepickerComponent, BooInputComponent, BooFilterChipsComponent],
    template: `
    <form class="bg-surface border border-borderGray/60 rounded-2 p-3.5 flex flex-col gap-3" aria-label="Report filters" (submit)="$event.preventDefault()">
      <div class="flex flex-col gap-2.5 lg:flex-row lg:items-end lg:gap-4">
        <div class="lg:w-[84px] lg:pb-3 text-xs font-semibold uppercase tracking-wide text-secondary" id="revenue-period-label">Period</div>
        <div role="group" aria-labelledby="revenue-period-label" class="flex flex-wrap gap-1.5 lg:pb-1.5">
          <button type="button" *ngFor="let p of rangePresets" (click)="applyPreset(p.value)"
            [attr.aria-pressed]="preset === p.value"
            class="px-3 min-h-10 lg:min-h-8 rounded-full text-xs font-medium transition-colors"
            [ngClass]="preset === p.value ? 'bg-primary text-white' : 'bg-gray-100 text-secondary hover:bg-gray-200'">
            {{ p.label }}
          </button>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1 lg:max-w-[560px]">
          <boo-datepicker label="From" [ngModel]="filter.start" name="start" (ngModelChange)="setDate('start', $event)"
            [attr.aria-describedby]="invalidMessage ? 'revenue-filter-invalid' : null"></boo-datepicker>
          <boo-datepicker label="To" [ngModel]="filter.end" name="end" (ngModelChange)="setDate('end', $event)"
            [attr.aria-describedby]="invalidMessage ? 'revenue-filter-invalid' : null"></boo-datepicker>
          <boo-select class="col-span-2 sm:col-span-1" label="Granularity" [ngModel]="filter.granularity" name="granularity"
            (ngModelChange)="setGranularity($event)" [options]="granularityOptions" bindLabel="label" bindValue="value"></boo-select>
        </div>
      </div>

      <p *ngIf="invalidMessage" id="revenue-filter-invalid" role="alert" class="flex items-start gap-2 text-sm text-danger bg-rose-50 border border-rose-100 rounded-1.5 px-3 py-2 mb-0">
        <physio-icon name="circle-alert" [size]="16" class="mt-0.5 shrink-0"></physio-icon>
        <span>{{ invalidMessage }} <span class="text-secondary">Results below still show the last valid filter.</span></span>
      </p>

      <div class="flex flex-col gap-2.5 lg:flex-row lg:items-end lg:gap-4 pt-3 border-t border-borderGray/50">
        <div class="lg:w-[84px] lg:pb-3 text-xs font-semibold uppercase tracking-wide text-secondary">Scope</div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1" [ngClass]="canFilterInsurance ? 'lg:grid-cols-5' : 'lg:grid-cols-4'">
          <boo-select label="Department" [ngModel]="selected(filter.departmentIds)" name="department" (ngModelChange)="setList('departmentIds', $event)"
            [options]="departmentOptions" bindLabel="name" bindValue="id"></boo-select>
          <boo-select label="Doctor" [ngModel]="selected(filter.doctorIds)" name="doctor" (ngModelChange)="setList('doctorIds', $event)"
            [options]="doctorOptions" bindLabel="name" bindValue="id"></boo-select>
          <boo-select label="Payment method" [ngModel]="selected(filter.paymentMethods)" name="method" (ngModelChange)="setList('paymentMethods', $event)"
            [options]="paymentMethodOptions" bindLabel="label" bindValue="value"></boo-select>
          <boo-select *ngIf="canFilterInsurance" label="Insurance provider" [ngModel]="selected(filter.insuranceProviderIds)" name="insurer" (ngModelChange)="setList('insuranceProviderIds', $event)"
            [options]="insurerOptions" bindLabel="name" bindValue="id"></boo-select>
          <boo-input label="Bill or patient number" [ngModel]="filter.search ?? ''" name="search" [debounce]="400" [maxlength]="60" (search)="onSearch($event)"></boo-input>
        </div>
      </div>

      <div class="flex items-center justify-between gap-3 flex-wrap" *ngIf="chips.length">
        <boo-filter-chips [chips]="chips" (remove)="removeChip($event)"></boo-filter-chips>
        <button type="button" (click)="reset.emit()" class="inline-flex items-center gap-1.5 min-h-10 lg:min-h-8 px-2 text-xs font-semibold text-primary hover:opacity-80">
          <physio-icon name="rotate-cw" [size]="14"></physio-icon>Reset filters
        </button>
      </div>
    </form>
  `,
})
export class RevenueFilterBarComponent implements OnInit {
    @Input({ required: true }) filter!: RevenueReportFilter;
    /** Why the dates in the toolbar cannot be reported on, or null. */
    @Input() invalidMessage: string | null = null;
    /** Listing insurance providers needs a permission the report itself does not imply. */
    @Input() canFilterInsurance = false;
    @Output() filterChange = new EventEmitter<RevenueReportFilter>();
    @Output() reset = new EventEmitter<void>();

    departments: Lookup[] = [];
    doctors: Lookup[] = [];
    insurers: Lookup[] = [];

    readonly rangePresets: { label: string; value: RevenuePreset }[] = [
        { label: 'Today', value: 'today' },
        { label: 'Last 7 days', value: '7d' },
        { label: 'Last 30 days', value: '30d' },
        { label: 'This month', value: 'month' },
        { label: 'This quarter', value: 'quarter' },
    ];

    readonly granularityOptions: { label: string; value: RevenueGranularity }[] = [
        { label: 'Daily', value: 'day' },
        { label: 'Weekly', value: 'week' },
        { label: 'Monthly', value: 'month' },
    ];

    // Values are the backend's PaymentMethod names (parsed case-insensitively); labels follow its MethodLabel.
    readonly paymentMethodOptions = [
        { label: 'All methods', value: ALL },
        { label: 'Cash', value: 'Cash' },
        { label: 'Card', value: 'Card' },
        { label: 'UPI', value: 'Upi' },
        { label: 'Net Banking', value: 'NetBanking' },
        { label: 'Cheque', value: 'Cheque' },
        { label: 'Demand Draft', value: 'DemandDraft' },
        { label: 'Insurance', value: 'Insurance' },
        { label: 'Wallet', value: 'Wallet' },
        { label: 'QR', value: 'Qr' },
    ];

    constructor(
        private departmentSrv: DepartmentService,
        private doctorSrv: DoctorService,
        private insurerSrv: InsuranceCompanyService,
    ) { }

    ngOnInit(): void {
        this.departmentSrv.search({ pageNumber: 1, pageSize: 100 }).subscribe({
            next: res => { if (res.success) this.departments = res.data.items.map(d => ({ id: d.id, name: d.name })); },
            error: () => { },
        });
        this.doctorSrv.search({ pageNumber: 1, pageSize: 100 }).subscribe({
            next: res => { if (res.success) this.doctors = res.data.items.map(d => ({ id: d.id, name: d.fullName })); },
            error: () => { },
        });
        if (this.canFilterInsurance) {
            this.insurerSrv.search({ pageNumber: 1, pageSize: 200, filter: { start: '', end: '' } }).subscribe({
                next: res => { if (res.success) this.insurers = res.data.items.map(c => ({ id: c.id, name: c.name })); },
                error: () => { },
            });
        }
    }

    get preset(): RevenuePreset | null {
        return activePreset(this.filter);
    }

    get departmentOptions(): Lookup[] { return [{ id: ALL, name: 'All departments' }, ...this.departments]; }
    get doctorOptions(): Lookup[] { return [{ id: ALL, name: 'All doctors' }, ...this.doctors]; }
    get insurerOptions(): Lookup[] { return [{ id: ALL, name: 'All providers' }, ...this.insurers]; }

    /** The toolbar's selects are single-choice; the filter stores lists. */
    selected(values?: string[]): string {
        return values?.[0] ?? ALL;
    }

    get chips(): ScopeChip[] {
        const f = this.filter;
        const chips: ScopeChip[] = [];
        const name = (list: Lookup[], id?: string) => list.find(l => l.id === id)?.name ?? 'Selected';

        if (f.departmentIds?.length) chips.push({ key: 'department', label: `Department: ${name(this.departments, f.departmentIds[0])}` });
        if (f.doctorIds?.length) chips.push({ key: 'doctor', label: `Doctor: ${name(this.doctors, f.doctorIds[0])}` });
        if (f.paymentMethods?.length) {
            const method = this.paymentMethodOptions.find(m => m.value === f.paymentMethods![0]);
            chips.push({ key: 'method', label: `Method: ${method?.label ?? f.paymentMethods[0]}` });
        }
        if (f.insuranceProviderIds?.length) chips.push({ key: 'insurer', label: `Insurer: ${name(this.insurers, f.insuranceProviderIds[0])}` });
        if (f.search?.trim()) chips.push({ key: 'search', label: `Search: ${f.search.trim()}` });
        return chips;
    }

    applyPreset(preset: RevenuePreset): void {
        this.filterChange.emit({ ...this.filter, ...presetRange(preset) });
    }

    setDate(field: 'start' | 'end', value: string | null): void {
        const next = value ?? '';
        if (next === this.filter[field]) return;
        this.filterChange.emit({ ...this.filter, [field]: next });
    }

    setGranularity(value: RevenueGranularity): void {
        if (value === this.filter.granularity) return;
        this.filterChange.emit({ ...this.filter, granularity: value });
    }

    setList(key: 'departmentIds' | 'doctorIds' | 'paymentMethods' | 'insuranceProviderIds', value: string | null): void {
        const next = value && value !== ALL ? [value] : undefined;
        if ((next?.[0] ?? null) === (this.filter[key]?.[0] ?? null)) return;
        this.filterChange.emit({ ...this.filter, [key]: next });
    }

    onSearch(value: string): void {
        const term = value.trim();
        // One character matches too much to be a useful search; wait for a second one (clearing is always applied).
        if (term.length > 0 && term.length < MIN_SEARCH_LENGTH) return;
        if (term === (this.filter.search ?? '').trim()) return;
        this.filterChange.emit({ ...this.filter, search: term || null });
    }

    removeChip(chip: ScopeChip): void {
        const clear: Record<FilterChipKey, Partial<RevenueReportFilter>> = {
            department: { departmentIds: undefined },
            doctor: { doctorIds: undefined },
            method: { paymentMethods: undefined },
            insurer: { insuranceProviderIds: undefined },
            search: { search: null },
        };
        this.filterChange.emit({ ...this.filter, ...clear[chip.key] });
    }
}
