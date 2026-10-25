import { Component, computed, DestroyRef, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { BooEmptyStateComponent, BooInlineErrorComponent } from "@physioboo/ui";
import { finalize, forkJoin, Observable, Subscription } from "rxjs";
import { ButtonIconComponent } from "../../../../components/button/button-icon/button-icon.component";
import { AdminContentHeaderComponent } from "../../../../components/layout/admin/content-header/content-header.component";
import { RevenueDepartmentTableCardComponent } from "../../../../components/layout/admin/finance/revenue-report/revenue-department-table-card.component";
import { RevenueDoctorTableCardComponent } from "../../../../components/layout/admin/finance/revenue-report/revenue-doctor-table-card.component";
import { RevenueFilterBarComponent } from "../../../../components/layout/admin/finance/revenue-report/revenue-filter-bar.component";
import { RevenueInsuranceCardComponent } from "../../../../components/layout/admin/finance/revenue-report/revenue-insurance-card.component";
import { RevenueKpiStripComponent } from "../../../../components/layout/admin/finance/revenue-report/revenue-kpi-strip.component";
import { RevenueOutstandingCardComponent } from "../../../../components/layout/admin/finance/revenue-report/revenue-outstanding-card.component";
import { RevenuePaymentMethodChartComponent } from "../../../../components/layout/admin/finance/revenue-report/revenue-payment-method-chart.component";
import { RevenueRefundDiscountCardComponent } from "../../../../components/layout/admin/finance/revenue-report/revenue-refund-discount-card.component";
import { defaultRevenueFilter, revenueFilterError, revenueFilterKey } from "../../../../components/layout/admin/finance/revenue-report/revenue-report-filter.util";
import { RevenueTransactionDrawerComponent } from "../../../../components/layout/admin/finance/revenue-report/revenue-transaction-drawer.component";
import { RevenueTransactionsTableCardComponent } from "../../../../components/layout/admin/finance/revenue-report/revenue-transactions-table-card.component";
import { RevenueTrendChartComponent } from "../../../../components/layout/admin/finance/revenue-report/revenue-trend-chart.component";
import { RevenueReportService } from "../../../../services/admin/revenue-report.service";
import { AuthService } from "../../../../services/auth/auth.service";
import { ToastService } from "../../../../services/common/toast.service";
import { Permissions } from "../../../../shared/constants/permission.constant";
import { SharedModule } from "../../../../shared/shared-imports";
import { PaginationData } from "../../../../shared/types/common";
import { RevenueReportFilter } from "../../../../shared/types/filter.types";
import {
    DepartmentRevenuePerformance,
    DiscountRecord,
    DoctorRevenuePerformance,
    InsuranceProviderRevenue,
    OutstandingAgingSummary,
    OutstandingInvoice,
    PaymentMethodBreakdown,
    RefundRecord,
    RevenueSummary,
    RevenueTransaction,
    RevenueTransactionDetail,
    RevenueTrendPoint,
} from "../../../../shared/types/revenue.types";
import { ReportSection, unwrap } from "./revenue-report-section";

type BreakdownTab = 'departments' | 'doctors' | 'insurance';

const BILLS_PAGE_SIZE = 10;
const LIST_PREVIEW_SIZE = 5;
const DAY_MS = 86_400_000;
const DATE_FORMAT = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
const GRANULARITY_LABEL = { day: 'Daily', week: 'Weekly', month: 'Monthly' } as const;

@Component({
    selector: 'admin-revenue-report',
    standalone: true,
    imports: [
        SharedModule,
        AdminContentHeaderComponent,
        ButtonIconComponent,
        BooEmptyStateComponent,
        BooInlineErrorComponent,
        RevenueFilterBarComponent,
        RevenueKpiStripComponent,
        RevenueTrendChartComponent,
        RevenuePaymentMethodChartComponent,
        RevenueDepartmentTableCardComponent,
        RevenueDoctorTableCardComponent,
        RevenueInsuranceCardComponent,
        RevenueOutstandingCardComponent,
        RevenueRefundDiscountCardComponent,
        RevenueTransactionsTableCardComponent,
        RevenueTransactionDrawerComponent,
    ],
    template: `
    <admin-content-header>
      <div class="flex flex-col gap-6 pb-8">
        <header class="flex flex-wrap items-start gap-3 pb-3 border-b border-borderGray/60">
          <div class="flex-1 min-w-[240px]">
            <h1 class="m-0 text-xl leading-7 font-semibold tracking-tight text-regular">Revenue Report</h1>
            <p class="text-sm text-secondary mb-0" *ngIf="canRead">{{ periodSummary() }}</p>
            <p class="text-sm text-secondary mb-0" *ngIf="!canRead">Financial overview and analytics across the hospital.</p>
          </div>
          <div class="flex items-center gap-2" *ngIf="canRead">
            <button-icon [icon]="{ name: 'refresh', size: 16 }" ariaLabel="Refresh the report" [disabled]="!!filterError() || isLoading()" (onClick)="loadAll()">Refresh</button-icon>
            <button-icon *ngIf="canExport" [icon]="{ name: 'download', size: 16 }" ariaLabel="Export the report to Excel" [loading]="exporting()"
              [disabled]="!!filterError() || exporting()" buttonClass="!bg-primary !text-white" (onClick)="onExport()">Export</button-icon>
          </div>
        </header>

        <boo-empty-state *ngIf="!canRead" icon="lock" title="You don't have access to revenue reports"
          description="Your role is missing the revenue report permission. Ask an administrator to grant it."></boo-empty-state>

        <ng-container *ngIf="canRead">
          <div class="lg:sticky lg:top-0 z-20">
            <revenue-filter-bar [filter]="draft()" [invalidMessage]="filterError()" [canFilterInsurance]="canFilterInsurance"
              (filterChange)="onFilterChange($event)" (reset)="onFilterChange(defaultFilter())"></revenue-filter-bar>
          </div>

          <!-- Summary -->
          <section aria-labelledby="rev-summary" [attr.aria-busy]="summary.state() === 'loading'">
            <h2 id="rev-summary" class="text-base font-semibold text-regular mb-0.5">Summary</h2>
            <p class="text-xs text-secondary mb-3">What was collected, what went back, and what is still owed.</p>
            <ng-container *ngIf="show(summary); else summaryError">
              <revenue-kpi-strip [summary]="summary.data()" [loading]="summary.state() === 'loading'" [periodDays]="periodDays()"></revenue-kpi-strip>
            </ng-container>
            <ng-template #summaryError><ng-container *ngTemplateOutlet="sectionError; context: { section: summary, what: 'the summary' }"></ng-container></ng-template>
          </section>

          <!-- Trend and mix -->
          <section aria-labelledby="rev-trend">
            <h2 id="rev-trend" class="text-base font-semibold text-regular mb-0.5">Trend and payment mix</h2>
            <p class="text-xs text-secondary mb-3">How collections move over the period and through which payment methods.</p>
            <div class="grid grid-cols-1 xl:grid-cols-12 gap-4">
              <div class="xl:col-span-8 min-w-0">
                <ng-container *ngIf="show(trend); else trendError">
                  <revenue-trend-chart [data]="trend.data() ?? []" [loading]="trend.state() === 'loading'" [granularity]="applied().granularity"></revenue-trend-chart>
                </ng-container>
                <ng-template #trendError><ng-container *ngTemplateOutlet="sectionError; context: { section: trend, what: 'the revenue trend' }"></ng-container></ng-template>
              </div>
              <div class="xl:col-span-4 min-w-0">
                <ng-container *ngIf="show(methods); else methodsError">
                  <revenue-payment-method-chart [data]="methods.data() ?? []" [loading]="methods.state() === 'loading'"></revenue-payment-method-chart>
                </ng-container>
                <ng-template #methodsError><ng-container *ngTemplateOutlet="sectionError; context: { section: methods, what: 'the payment method split' }"></ng-container></ng-template>
              </div>
            </div>
          </section>

          <!-- Breakdown -->
          <section aria-labelledby="rev-breakdown">
            <h2 id="rev-breakdown" class="text-base font-semibold text-regular mb-0.5">Where revenue comes from</h2>
            <p class="text-xs text-secondary mb-3">Select a department or doctor to apply it as a filter to the whole report.</p>

            <div role="tablist" aria-label="Revenue breakdown" class="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-3 max-w-full overflow-x-auto">
              <button *ngFor="let tab of breakdownTabs" type="button" role="tab" [id]="'breakdown-tab-' + tab.id" aria-controls="breakdown-panel"
                [attr.aria-selected]="breakdownTab() === tab.id" [attr.tabindex]="breakdownTab() === tab.id ? 0 : -1"
                (click)="selectBreakdownTab(tab.id)" (keydown.arrowRight)="moveBreakdownTab(1)" (keydown.arrowLeft)="moveBreakdownTab(-1)"
                class="px-3.5 min-h-10 lg:min-h-8 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
                [ngClass]="breakdownTab() === tab.id ? 'bg-surface text-regular shadow-sm' : 'text-secondary hover:text-regular'">{{ tab.label }}</button>
            </div>

            <div id="breakdown-panel" role="tabpanel" [attr.aria-labelledby]="'breakdown-tab-' + breakdownTab()">
              <ng-container [ngSwitch]="breakdownTab()">
                <ng-container *ngSwitchCase="'departments'">
                  <ng-container *ngIf="show(departments); else departmentsError">
                    <boo-empty-state *ngIf="departments.state() === 'ready' && !departments.data()?.length" icon="building-2"
                      title="No department revenue in this period" description="No paid payments match the selected period and scope."></boo-empty-state>
                    <revenue-department-table-card *ngIf="departments.state() === 'loading' || departments.data()?.length" [data]="departments.data()"
                      [loading]="departments.state() === 'loading'" (rowClick)="onDrilldown('departmentIds', $event)"></revenue-department-table-card>
                  </ng-container>
                  <ng-template #departmentsError><ng-container *ngTemplateOutlet="sectionError; context: { section: departments, what: 'department revenue' }"></ng-container></ng-template>
                </ng-container>

                <ng-container *ngSwitchCase="'doctors'">
                  <ng-container *ngIf="show(doctors); else doctorsError">
                    <boo-empty-state *ngIf="doctors.state() === 'ready' && !doctors.data()?.length" icon="stethoscope"
                      title="No doctor revenue in this period" description="No paid payments linked to a doctor's appointment match the selected period and scope."></boo-empty-state>
                    <revenue-doctor-table-card *ngIf="doctors.state() === 'loading' || doctors.data()?.length" [data]="doctors.data()"
                      [loading]="doctors.state() === 'loading'" (rowClick)="onDrilldown('doctorIds', $event)"></revenue-doctor-table-card>
                  </ng-container>
                  <ng-template #doctorsError><ng-container *ngTemplateOutlet="sectionError; context: { section: doctors, what: 'doctor revenue' }"></ng-container></ng-template>
                </ng-container>

                <ng-container *ngSwitchCase="'insurance'">
                  <ng-container *ngIf="show(insurance); else insuranceError">
                    <revenue-insurance-card [data]="insurance.data()" [loading]="insurance.state() === 'loading'"></revenue-insurance-card>
                  </ng-container>
                  <ng-template #insuranceError><ng-container *ngTemplateOutlet="sectionError; context: { section: insurance, what: 'insurance revenue' }"></ng-container></ng-template>
                </ng-container>
              </ng-container>
            </div>
          </section>

          <!-- Receivables and adjustments -->
          <section aria-labelledby="rev-receivables">
            <h2 id="rev-receivables" class="text-base font-semibold text-regular mb-0.5">Receivables and adjustments</h2>
            <p class="text-xs text-secondary mb-3">What is still owed, and what was refunded or discounted.</p>
            <div class="grid grid-cols-1 xl:grid-cols-12 gap-4">
              <div class="xl:col-span-7 min-w-0">
                <ng-container *ngIf="show(outstanding); else outstandingError">
                  <revenue-outstanding-card [aging]="outstanding.data()?.aging ?? []" [invoices]="outstanding.data()?.invoices?.items ?? null"
                    [invoiceTotal]="outstanding.data()?.invoices?.totalCount ?? 0" [loading]="outstanding.state() === 'loading'"></revenue-outstanding-card>
                </ng-container>
                <ng-template #outstandingError><ng-container *ngTemplateOutlet="sectionError; context: { section: outstanding, what: 'outstanding balances' }"></ng-container></ng-template>
              </div>
              <div class="xl:col-span-5 min-w-0">
                <ng-container *ngIf="show(adjustments); else adjustmentsError">
                  <revenue-refund-discount-card [refunds]="adjustments.data()?.refunds?.items ?? null" [discounts]="adjustments.data()?.discounts?.items ?? null"
                    [refundTotal]="adjustments.data()?.refunds?.totalCount ?? 0" [discountTotal]="adjustments.data()?.discounts?.totalCount ?? 0"
                    [loading]="adjustments.state() === 'loading'"></revenue-refund-discount-card>
                </ng-container>
                <ng-template #adjustmentsError><ng-container *ngTemplateOutlet="sectionError; context: { section: adjustments, what: 'refunds and discounts' }"></ng-container></ng-template>
              </div>
            </div>
          </section>

          <!-- Bill register -->
          <section aria-labelledby="rev-register" [attr.aria-busy]="bills.state() === 'loading'">
            <h2 id="rev-register" class="text-base font-semibold text-regular mb-0.5">Bill register</h2>
            <p class="text-xs text-secondary mb-3">Every bill dated in the period with its payment status. Select a bill number for line items and payments.</p>
            <ng-container *ngIf="show(bills); else billsError">
              <boo-empty-state *ngIf="bills.state() === 'ready' && !bills.data()?.totalCount" icon="receipt"
                title="No bills in this period" description="No bills match the selected period and scope. Try a wider period or clear a filter."></boo-empty-state>
              <revenue-transactions-table-card *ngIf="bills.state() === 'loading' || bills.data()?.totalCount" [data]="bills.data()" [filter]="billsPaging()"
                [loading]="bills.state() === 'loading'" (pageChange)="onBillsPageChange($event)" (rowClick)="onBillClick($event)"></revenue-transactions-table-card>
            </ng-container>
            <ng-template #billsError><ng-container *ngTemplateOutlet="sectionError; context: { section: bills, what: 'the bill register' }"></ng-container></ng-template>
          </section>
        </ng-container>
      </div>

      <ng-template #sectionError let-section="section" let-what="what">
        <boo-inline-error *ngIf="section.state() === 'error'" [what]="what" [state]="section.retrying() ? 'retrying' : 'default'" (retry)="retry(section)"></boo-inline-error>
        <boo-empty-state *ngIf="section.state() === 'forbidden'" icon="lock" [title]="'You can\\'t view ' + what"
          description="Your role does not include access to this part of the report."></boo-empty-state>
      </ng-template>

      <revenue-transaction-drawer
        [isOpen]="drawerOpen()"
        [detail]="billDetail()"
        [loading]="billDetailLoading()"
        (close)="drawerOpen.set(false)"
      ></revenue-transaction-drawer>
    </admin-content-header>
  `,
})
export class AdminRevenueReportComponent {
    private readonly revenueSrv = inject(RevenueReportService);
    private readonly authSrv = inject(AuthService);
    private readonly toastSrv = inject(ToastService);
    private readonly destroyRef = inject(DestroyRef);

    // The route guard checks the bill permission; the API itself requires these, so the page checks them too.
    readonly canRead = this.authSrv.hasPermission(Permissions.Finance.RevenueReportRead);
    readonly canExport = this.authSrv.hasPermission(Permissions.Finance.RevenueReportExport);
    readonly canFilterInsurance = this.authSrv.hasPermission(Permissions.Admin.InsuranceCompanyRead);

    readonly defaultFilter = defaultRevenueFilter;

    /** What the toolbar shows. May be invalid; the sections keep the last valid `applied` filter until it is fixed. */
    readonly draft = signal<RevenueReportFilter>(defaultRevenueFilter());
    readonly applied = signal<RevenueReportFilter>(this.draft());
    readonly filterError = computed(() => revenueFilterError(this.draft()));
    private readonly appliedKey = computed(() => revenueFilterKey(this.applied()));

    readonly periodDays = computed(() => Math.round((Date.parse(this.applied().end) - Date.parse(this.applied().start)) / DAY_MS) + 1);
    readonly periodSummary = computed(() => {
        const f = this.applied();
        const date = (iso: string) => DATE_FORMAT.format(new Date(`${iso}T00:00:00`));
        const scope = [f.departmentIds, f.doctorIds, f.paymentMethods, f.insuranceProviderIds].filter(list => list?.length).length + (f.search ? 1 : 0);
        return `${date(f.start)} – ${date(f.end)} · ${GRANULARITY_LABEL[f.granularity]}${scope ? ` · ${scope} ${scope === 1 ? 'filter' : 'filters'} applied` : ''}`;
    });

    // #region Sections
    readonly summary = this.section<RevenueSummary>(f => this.revenueSrv.getSummary(f).pipe(unwrap()));
    readonly trend = this.section<RevenueTrendPoint[]>(f => this.revenueSrv.getTrend(f).pipe(unwrap()));
    readonly methods = this.section<PaymentMethodBreakdown[]>(f => this.revenueSrv.getPaymentMethodBreakdown(f).pipe(unwrap()));
    readonly departments = this.section<DepartmentRevenuePerformance[]>(f => this.revenueSrv.getDepartmentPerformance(f).pipe(unwrap()));
    readonly doctors = this.section<DoctorRevenuePerformance[]>(f => this.revenueSrv.getDoctorPerformance(f).pipe(unwrap()));
    readonly insurance = this.section<InsuranceProviderRevenue[]>(f => this.revenueSrv.getInsuranceRevenue(f).pipe(unwrap()));
    readonly outstanding = this.section<{ aging: OutstandingAgingSummary[]; invoices: PaginationData<OutstandingInvoice> }>(f => forkJoin({
        aging: this.revenueSrv.getOutstandingSummary(f).pipe(unwrap()),
        invoices: this.revenueSrv.searchOutstanding({ pageNumber: 1, pageSize: LIST_PREVIEW_SIZE, filter: f }).pipe(unwrap()),
    }));
    readonly adjustments = this.section<{ refunds: PaginationData<RefundRecord>; discounts: PaginationData<DiscountRecord> }>(f => forkJoin({
        refunds: this.revenueSrv.searchRefunds({ pageNumber: 1, pageSize: LIST_PREVIEW_SIZE, filter: f }).pipe(unwrap()),
        discounts: this.revenueSrv.searchDiscounts({ pageNumber: 1, pageSize: LIST_PREVIEW_SIZE, filter: f }).pipe(unwrap()),
    }));
    readonly bills = this.section<PaginationData<RevenueTransaction>>(f => this.revenueSrv.searchTransactions({
        pageNumber: this.billsPage(), pageSize: BILLS_PAGE_SIZE, filter: f,
    }).pipe(unwrap()));

    private readonly allSections = [this.summary, this.trend, this.methods, this.outstanding, this.adjustments, this.bills];
    readonly isLoading = computed(() => [...this.allSections, this.departments, this.doctors, this.insurance].some(s => s.state() === 'loading'));
    // #endregion

    readonly breakdownTabs: { id: BreakdownTab; label: string }[] = [
        { id: 'departments', label: 'Departments' },
        { id: 'doctors', label: 'Doctors' },
        { id: 'insurance', label: 'Insurance' },
    ];
    readonly breakdownTab = signal<BreakdownTab>('departments');

    readonly billsPage = signal(1);
    readonly billsPaging = computed(() => ({ pageNumber: this.billsPage(), pageSize: BILLS_PAGE_SIZE }));

    readonly drawerOpen = signal(false);
    readonly billDetail = signal<RevenueTransactionDetail | null>(null);
    readonly billDetailLoading = signal(false);
    private billDetailRequest?: Subscription;

    readonly exporting = signal(false);

    constructor() {
        if (this.canRead) this.loadAll();
    }

    /** Every section gets the applied filter at call time, so a retry always asks for what the toolbar currently applies. */
    private section<T>(request: (filter: RevenueReportFilter) => Observable<T>): ReportSection<T> {
        return new ReportSection<T>(() => request(this.applied()), this.destroyRef);
    }

    show(section: ReportSection<unknown>): boolean {
        const state = section.state();
        return state !== 'error' && state !== 'forbidden';
    }

    // #region Loading
    loadAll(): void {
        const key = this.appliedKey();
        this.allSections.forEach(section => section.load(key));
        this.activeBreakdown().load(key);
    }

    retry(section: ReportSection<unknown>): void {
        section.retry(this.appliedKey());
    }

    private loadBills(): void {
        this.bills.load(this.appliedKey());
    }

    private activeBreakdown(): ReportSection<unknown> {
        switch (this.breakdownTab()) {
            case 'doctors': return this.doctors;
            case 'insurance': return this.insurance;
            default: return this.departments;
        }
    }
    // #endregion

    // #region Interaction
    onFilterChange(filter: RevenueReportFilter): void {
        this.draft.set(filter);
        if (revenueFilterError(filter)) return;

        // The toolbar fires on every control; an unchanged filter must not refetch.
        if (revenueFilterKey(filter) === this.appliedKey()) return;

        this.applied.set(filter);
        this.billsPage.set(1);
        this.loadAll();
    }

    onDrilldown(key: 'departmentIds' | 'doctorIds', id: string): void {
        this.onFilterChange({ ...this.draft(), [key]: [id] });
    }

    selectBreakdownTab(tab: BreakdownTab): void {
        this.breakdownTab.set(tab);
        this.activeBreakdown().ensure(this.appliedKey());
    }

    moveBreakdownTab(step: 1 | -1): void {
        const index = this.breakdownTabs.findIndex(t => t.id === this.breakdownTab());
        const next = this.breakdownTabs[(index + step + this.breakdownTabs.length) % this.breakdownTabs.length];
        this.selectBreakdownTab(next.id);
        queueMicrotask(() => document.getElementById(`breakdown-tab-${next.id}`)?.focus());
    }

    onBillsPageChange(page: number): void {
        this.billsPage.set(page);
        this.loadBills();
    }

    onBillClick(id: string): void {
        this.billDetailRequest?.unsubscribe();
        this.billDetail.set(null);
        this.billDetailLoading.set(true);
        this.drawerOpen.set(true);

        this.billDetailRequest = this.revenueSrv.getTransactionDetail(id).pipe(
            finalize(() => this.billDetailLoading.set(false)),
            takeUntilDestroyed(this.destroyRef),
        ).subscribe({
            next: res => {
                if (res.success && res.data) {
                    this.billDetail.set(res.data);
                } else {
                    this.drawerOpen.set(false);
                    this.toastSrv.error('This bill could not be found');
                }
            },
            error: () => {
                this.drawerOpen.set(false);
                this.toastSrv.error('Failed to load the bill detail');
            },
        });
    }

    onExport(): void {
        if (!this.canExport || this.filterError() || this.exporting()) return;

        const filter = this.applied();
        this.exporting.set(true);
        this.revenueSrv.export(filter).pipe(
            finalize(() => this.exporting.set(false)),
            takeUntilDestroyed(this.destroyRef),
        ).subscribe({
            next: blob => this.downloadBlob(blob, `revenue-report_${filter.start}_${filter.end}.xlsx`),
            error: err => this.toastSrv.error(err?.status === 403 ? 'You are not allowed to export this report' : 'Failed to export the report'),
        });
    }

    private downloadBlob(blob: Blob, filename: string): void {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }
    // #endregion
}
