import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { AdminContentHeaderComponent } from "../../../../components/layout/admin/content-header/content-header.component";
import { RevenueDepartmentTableCardComponent } from "../../../../components/layout/admin/finance/revenue-report/revenue-department-table-card.component";
import { RevenueDoctorTableCardComponent } from "../../../../components/layout/admin/finance/revenue-report/revenue-doctor-table-card.component";
import { RevenueFilterBarComponent } from "../../../../components/layout/admin/finance/revenue-report/revenue-filter-bar.component";
import { RevenueInsuranceCardComponent } from "../../../../components/layout/admin/finance/revenue-report/revenue-insurance-card.component";
import { RevenueKpiStripComponent } from "../../../../components/layout/admin/finance/revenue-report/revenue-kpi-strip.component";
import { RevenueOutstandingCardComponent } from "../../../../components/layout/admin/finance/revenue-report/revenue-outstanding-card.component";
import { RevenuePaymentMethodChartComponent } from "../../../../components/layout/admin/finance/revenue-report/revenue-payment-method-chart.component";
import { RevenueRefundDiscountCardComponent } from "../../../../components/layout/admin/finance/revenue-report/revenue-refund-discount-card.component";
import { RevenueTransactionDrawerComponent } from "../../../../components/layout/admin/finance/revenue-report/revenue-transaction-drawer.component";
import { RevenueTransactionsTableCardComponent } from "../../../../components/layout/admin/finance/revenue-report/revenue-transactions-table-card.component";
import { RevenueTrendChartComponent } from "../../../../components/layout/admin/finance/revenue-report/revenue-trend-chart.component";
import { ButtonIconComponent } from "../../../../components/button/button-icon/button-icon.component";
import { RevenueReportService } from "../../../../services/admin/revenue-report.service";
import { LocalLoadingService } from "../../../../services/common/local-loading.service";
import { PrintService } from "../../../../services/common/print.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { PaginationData, PaginationDataWithInit } from "../../../../shared/types/common";
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

@Component({
    selector: 'admin-revenue-report',
    standalone: true,
    imports: [
        SharedModule,
        AdminContentHeaderComponent,
        ButtonIconComponent,
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
      <div class="flex items-center gap-2 pb-3 mb-4 border-1 border-bottom">
        <div class="flex-1">
          <h4 class="text-[22px] text-primary font-semibold mb-0">Revenue Report</h4>
          <p class="text-sm text-secondary mb-0">Financial overview and analytics across the hospital.</p>
        </div>
        <div class="flex items-center gap-2">
          <button-icon [icon]="{ name: 'printer', size: 16 }" (onClick)="onPrint()">Print</button-icon>
          <button-icon [icon]="{ name: 'download', size: 16 }" [loading]="loadingSrv.isLoading('export')" (onClick)="onExport()">Export</button-icon>
          <button-icon buttonClass="!bg-primary text-white" [icon]="{ name: 'refresh-cw', size: 16, color: 'white' }" (onClick)="loadAll()">Refresh</button-icon>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <revenue-filter-bar [filter]="filter" (filterChange)="onFilterChange($event)" (reset)="onFilterReset()"></revenue-filter-bar>

        <revenue-kpi-strip [summary]="summary"></revenue-kpi-strip>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <revenue-trend-chart [data]="trend" [loading]="loadingSrv.isLoading('trend')"></revenue-trend-chart>
          <revenue-payment-method-chart [data]="paymentMethods" [loading]="loadingSrv.isLoading('payment-methods')"></revenue-payment-method-chart>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <revenue-department-table-card [data]="departments" [loading]="loadingSrv.isLoading('departments')" (rowClick)="onDrilldown('departmentIds', $event)"></revenue-department-table-card>
          <revenue-doctor-table-card [data]="doctors" [loading]="loadingSrv.isLoading('doctors')" (rowClick)="onDrilldown('doctorIds', $event)"></revenue-doctor-table-card>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <revenue-insurance-card [data]="insurance" [loading]="loadingSrv.isLoading('insurance')"></revenue-insurance-card>
          <revenue-outstanding-card [aging]="outstandingAging" [invoices]="outstandingInvoices" [loading]="loadingSrv.isLoading('outstanding')"></revenue-outstanding-card>
          <revenue-refund-discount-card [refunds]="refunds" [discounts]="discounts" [loading]="loadingSrv.isLoading('refunds') || loadingSrv.isLoading('discounts')"></revenue-refund-discount-card>
        </div>

        <div #transactionsSection>
          <revenue-transactions-table-card
            [data]="transactions"
            [filter]="{ pageNumber: transactionsPageNumber, pageSize: transactionsPageSize }"
            [loading]="loadingSrv.isLoading('transactions')"
            (pageChange)="onTransactionsPageChange($event)"
            (rowClick)="onTransactionRowClick($event)"
          ></revenue-transactions-table-card>
        </div>
      </div>

      <revenue-transaction-drawer
        [isOpen]="isTransactionDrawerOpen"
        [detail]="transactionDetail"
        [loading]="loadingSrv.isLoading('transaction-detail')"
        (close)="onCloseTransactionDrawer()"
      ></revenue-transaction-drawer>
    </admin-content-header>
  `,
})
export class AdminRevenueReportComponent implements OnInit {
    @ViewChild('transactionsSection') transactionsSection?: ElementRef<HTMLElement>;

    filter: RevenueReportFilter = this.buildDefaultFilter();

    summary: RevenueSummary | null = null;
    trend: RevenueTrendPoint[] = [];
    paymentMethods: PaymentMethodBreakdown[] = [];
    departments: DepartmentRevenuePerformance[] | null = null;
    doctors: DoctorRevenuePerformance[] | null = null;
    insurance: InsuranceProviderRevenue[] | null = null;
    outstandingAging: OutstandingAgingSummary[] = [];
    outstandingInvoices: OutstandingInvoice[] | null = null;
    refunds: RefundRecord[] | null = null;
    discounts: DiscountRecord[] | null = null;

    transactions: PaginationData<RevenueTransaction> | null = null;
    transactionsPageNumber = 1;
    transactionsPageSize = 10;

    isTransactionDrawerOpen = false;
    transactionDetail: RevenueTransactionDetail | null = null;

    constructor(
        private revenueReportSrv: RevenueReportService,
        protected loadingSrv: LocalLoadingService,
        private toastSrv: ToastService,
        private printSrv: PrintService,
    ) { }

    ngOnInit(): void {
        this.loadAll();
    }

    buildDefaultFilter(): RevenueReportFilter {
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - 29);
        const toIso = (d: Date) => d.toISOString().split('T')[0];
        return { start: toIso(start), end: toIso(today), granularity: 'day' };
    }

    loadAll(): void {
        this.loadSummary();
        this.loadTrend();
        this.loadPaymentMethods();
        this.loadDepartments();
        this.loadDoctors();
        this.loadInsurance();
        this.loadOutstanding();
        this.loadRefunds();
        this.loadDiscounts();
        this.loadTransactions();
    }

    onFilterChange(filter: RevenueReportFilter): void {
        this.filter = filter;
        this.transactionsPageNumber = 1;
        this.loadAll();
    }

    onFilterReset(): void {
        this.filter = this.buildDefaultFilter();
        this.transactionsPageNumber = 1;
        this.loadAll();
    }

    onDrilldown(key: 'departmentIds' | 'doctorIds', id: string): void {
        this.filter = { ...this.filter, [key]: [id] };
        this.transactionsPageNumber = 1;
        this.loadTransactions();
        this.transactionsSection?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    onTransactionsPageChange(page: number): void {
        this.transactionsPageNumber = page;
        this.loadTransactions();
    }

    onTransactionRowClick(id: string): void {
        this.isTransactionDrawerOpen = true;
        this.loadingSrv.setLoading('transaction-detail', true);
        this.revenueReportSrv.getTransactionDetail(id).subscribe({
            next: res => {
                if (res.success) this.transactionDetail = res.data;
                this.loadingSrv.setLoading('transaction-detail', false);
            },
            error: () => {
                this.toastSrv.error('Failed to load transaction detail');
                this.loadingSrv.setLoading('transaction-detail', false);
            }
        });
    }

    onCloseTransactionDrawer(): void {
        this.isTransactionDrawerOpen = false;
    }

    onExport(): void {
        this.loadingSrv.setLoading('export', true);
        this.revenueReportSrv.export(this.filter).subscribe({
            next: res => {
                this.loadingSrv.setLoading('export', false);
                if (res.success && res.data.fileUrl) {
                    window.open(res.data.fileUrl, '_blank');
                } else {
                    this.toastSrv.error('Failed to export report');
                }
            },
            error: () => {
                this.loadingSrv.setLoading('export', false);
                this.toastSrv.error('Failed to export report');
            }
        });
    }

    onPrint(): void {
        this.printSrv.print('REVENUE_REPORT_SUMMARY', { summary: this.summary, filter: this.filter });
    }

    private loadSummary(): void {
        this.loadingSrv.setLoading('summary', true);
        this.revenueReportSrv.getSummary(this.filter).subscribe({
            next: res => {
                if (res.success) this.summary = res.data;
                this.loadingSrv.setLoading('summary', false);
            },
            error: () => {
                this.toastSrv.error('Failed to load revenue summary');
                this.loadingSrv.setLoading('summary', false);
            }
        });
    }

    private loadTrend(): void {
        this.loadingSrv.setLoading('trend', true);
        this.revenueReportSrv.getTrend(this.filter).subscribe({
            next: res => {
                if (res.success) this.trend = res.data;
                this.loadingSrv.setLoading('trend', false);
            },
            error: () => {
                this.toastSrv.error('Failed to load revenue trend');
                this.loadingSrv.setLoading('trend', false);
            }
        });
    }

    private loadPaymentMethods(): void {
        this.loadingSrv.setLoading('payment-methods', true);
        this.revenueReportSrv.getPaymentMethodBreakdown(this.filter).subscribe({
            next: res => {
                if (res.success) this.paymentMethods = res.data;
                this.loadingSrv.setLoading('payment-methods', false);
            },
            error: () => {
                this.toastSrv.error('Failed to load payment method breakdown');
                this.loadingSrv.setLoading('payment-methods', false);
            }
        });
    }

    private loadDepartments(): void {
        this.loadingSrv.setLoading('departments', true);
        this.revenueReportSrv.getDepartmentPerformance(this.filter).subscribe({
            next: res => {
                if (res.success) this.departments = res.data;
                this.loadingSrv.setLoading('departments', false);
            },
            error: () => {
                this.toastSrv.error('Failed to load department performance');
                this.loadingSrv.setLoading('departments', false);
            }
        });
    }

    private loadDoctors(): void {
        this.loadingSrv.setLoading('doctors', true);
        this.revenueReportSrv.getDoctorPerformance(this.filter).subscribe({
            next: res => {
                if (res.success) this.doctors = res.data;
                this.loadingSrv.setLoading('doctors', false);
            },
            error: () => {
                this.toastSrv.error('Failed to load doctor performance');
                this.loadingSrv.setLoading('doctors', false);
            }
        });
    }

    private loadInsurance(): void {
        this.loadingSrv.setLoading('insurance', true);
        this.revenueReportSrv.getInsuranceRevenue(this.filter).subscribe({
            next: res => {
                if (res.success) this.insurance = res.data;
                this.loadingSrv.setLoading('insurance', false);
            },
            error: () => {
                this.toastSrv.error('Failed to load insurance revenue');
                this.loadingSrv.setLoading('insurance', false);
            }
        });
    }

    private loadOutstanding(): void {
        this.loadingSrv.setLoading('outstanding', true);
        this.revenueReportSrv.getOutstandingSummary(this.filter).subscribe({
            next: res => {
                if (res.success) this.outstandingAging = res.data;
            },
            error: () => this.toastSrv.error('Failed to load outstanding aging summary'),
        });
        this.revenueReportSrv.searchOutstanding({ pageNumber: 1, pageSize: 5, filter: this.filter }).subscribe({
            next: res => {
                if (res.success) this.outstandingInvoices = res.data.items;
                this.loadingSrv.setLoading('outstanding', false);
            },
            error: () => {
                this.toastSrv.error('Failed to load outstanding invoices');
                this.loadingSrv.setLoading('outstanding', false);
            }
        });
    }

    private loadRefunds(): void {
        this.loadingSrv.setLoading('refunds', true);
        this.revenueReportSrv.searchRefunds({ pageNumber: 1, pageSize: 5, filter: this.filter }).subscribe({
            next: res => {
                if (res.success) this.refunds = res.data.items;
                this.loadingSrv.setLoading('refunds', false);
            },
            error: () => {
                this.toastSrv.error('Failed to load refunds');
                this.loadingSrv.setLoading('refunds', false);
            }
        });
    }

    private loadDiscounts(): void {
        this.loadingSrv.setLoading('discounts', true);
        this.revenueReportSrv.searchDiscounts({ pageNumber: 1, pageSize: 5, filter: this.filter }).subscribe({
            next: res => {
                if (res.success) this.discounts = res.data.items;
                this.loadingSrv.setLoading('discounts', false);
            },
            error: () => {
                this.toastSrv.error('Failed to load discounts');
                this.loadingSrv.setLoading('discounts', false);
            }
        });
    }

    private loadTransactions(): void {
        this.loadingSrv.setLoading('transactions', true);
        this.revenueReportSrv.searchTransactions({
            pageNumber: this.transactionsPageNumber,
            pageSize: this.transactionsPageSize,
            filter: this.filter,
        }).subscribe({
            next: res => {
                this.transactions = res.success ? res.data : PaginationDataWithInit<RevenueTransaction>();
                this.loadingSrv.setLoading('transactions', false);
            },
            error: () => {
                this.toastSrv.error('Failed to load transactions');
                this.transactions = PaginationDataWithInit<RevenueTransaction>();
                this.loadingSrv.setLoading('transactions', false);
            }
        });
    }
}
