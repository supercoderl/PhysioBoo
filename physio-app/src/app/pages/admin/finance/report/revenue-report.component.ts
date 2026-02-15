import { Component, OnInit } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { DepartmentRevenue, RevenueData } from "../../../../shared/types/revenue";
import { PaymentSummary } from "../../../../shared/types/patient";

@Component({
    selector: 'admin-revenue-report',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header with Date Range -->
        <div class="bg-surface rounded-lg shadow-md p-6 mb-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 class="text-2xl font-bold text-gray-800">Revenue Report</h1>
              <p class="text-gray-600 mt-1">Financial overview and analytics</p>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  [(ngModel)]="fromDate"
                  (change)="filterData()"
                  class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  [(ngModel)]="toDate"
                  (change)="filterData()"
                  class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div class="flex items-end">
                <button
                  (click)="exportReport()"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                >
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium opacity-90">Total Revenue</h3>
              <svg class="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p class="text-3xl font-bold">₹{{ totalRevenue.toLocaleString() }}</p>
            <p class="text-sm mt-2 opacity-90">
              <span class="font-semibold">+12.5%</span> from last period
            </p>
          </div>

          <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium opacity-90">Total Patients</h3>
              <svg class="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <p class="text-3xl font-bold">{{ totalPatients }}</p>
            <p class="text-sm mt-2 opacity-90">
              <span class="font-semibold">+8.3%</span> from last period
            </p>
          </div>

          <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium opacity-90">Avg. Bill Value</h3>
              <svg class="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            </div>
            <p class="text-3xl font-bold">₹{{ averageBillValue.toLocaleString() }}</p>
            <p class="text-sm mt-2 opacity-90">
              <span class="font-semibold">+3.8%</span> from last period
            </p>
          </div>

          <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-6 text-white">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium opacity-90">Pending Claims</h3>
              <svg class="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p class="text-3xl font-bold">₹{{ pendingClaims.toLocaleString() }}</p>
            <p class="text-sm mt-2 opacity-90">
              <span class="font-semibold">{{ pendingClaimsCount }}</span> claims pending
            </p>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Revenue Trend Chart -->
          <div class="bg-surface rounded-lg shadow-md p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">Revenue Trend (Last 7 Days)</h2>
            <div class="space-y-3">
              <div *ngFor="let data of revenueData" class="flex items-center">
                <div class="w-24 text-sm text-gray-600">{{ data.date }}</div>
                <div class="flex-1 ml-4">
                  <div class="flex items-center">
                    <div class="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                      <div
                        [style.width.%]="(data.total / maxDailyRevenue) * 100"
                        class="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-end pr-2"
                      >
                        <span class="text-white text-xs font-semibold">₹{{ data.total.toLocaleString() }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Methods Distribution -->
          <div class="bg-surface rounded-lg shadow-md p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">Payment Methods Distribution</h2>
            <div class="space-y-4">
              <div *ngFor="let payment of paymentSummary" class="border-b border-gray-100 pb-4 last:border-0">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-3">
                    <div 
                      [class]="getPaymentIconClass(payment.method)"
                      class="w-10 h-10 rounded-lg flex items-center justify-center"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path>
                        <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd"></path>
                      </svg>
                    </div>
                    <div>
                      <p class="font-medium text-gray-800">{{ payment.method }}</p>
                      <p class="text-sm text-gray-500">{{ payment.count }} transactions</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold text-gray-800">₹{{ payment.amount.toLocaleString() }}</p>
                    <p class="text-sm text-gray-500">{{ payment.percentage.toFixed(1) }}%</p>
                  </div>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    [style.width.%]="payment.percentage"
                    [class]="getPaymentBarClass(payment.method)"
                    class="h-2 rounded-full transition-all"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Department Revenue -->
        <div class="bg-surface rounded-lg shadow-md p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">Department-wise Revenue</h2>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-100">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                  <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">Revenue</th>
                  <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">Patients</th>
                  <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">Avg/Patient</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">% of Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr *ngFor="let dept of departmentRevenue" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm font-medium text-gray-800">{{ dept.name }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800 text-right font-semibold">₹{{ dept.revenue.toLocaleString() }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ dept.patients }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 text-right">₹{{ (dept.revenue / dept.patients).toLocaleString() }}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <div class="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          [style.width.%]="dept.percentage"
                          class="bg-blue-600 h-2 rounded-full"
                        ></div>
                      </div>
                      <span class="text-sm text-gray-600 w-12">{{ dept.percentage.toFixed(1) }}%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Detailed Transactions -->
        <div class="bg-surface rounded-lg shadow-md p-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <h2 class="text-lg font-semibold text-gray-800">Recent Transactions</h2>
            <div class="flex gap-3">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Search transactions..."
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                [(ngModel)]="filterPaymentMethod"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Insurance">Insurance</option>
              </select>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-100">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Bill No.</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date & Time</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Patient</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Payment Method</th>
                  <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                  <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr *ngFor="let transaction of getFilteredTransactions()" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm font-medium text-blue-600">{{ transaction.billNo }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ transaction.datetime }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800">{{ transaction.patient }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ transaction.department }}</td>
                  <td class="px-4 py-3">
                    <span [class]="getPaymentBadgeClass(transaction.paymentMethod)" class="px-2 py-1 rounded-full text-xs font-medium">
                      {{ transaction.paymentMethod }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm font-semibold text-gray-800 text-right">₹{{ transaction.amount.toLocaleString() }}</td>
                  <td class="px-4 py-3 text-center">
                    <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {{ transaction.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <p class="text-sm text-gray-600">Showing {{ transactions.length }} transactions</p>
            <div class="flex gap-2">
              <button class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">Previous</button>
              <button class="px-3 py-1 bg-blue-600 text-white rounded text-sm">1</button>
              <button class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">2</button>
              <button class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">3</button>
              <button class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    `
})

export class AdminRevenueReportComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    fromDate = '';
    toDate = '';
    searchQuery = '';
    filterPaymentMethod = '';

    totalRevenue = 2458750;
    totalPatients = 856;
    averageBillValue = 2872;
    pendingClaims = 345000;
    pendingClaimsCount = 23;

    revenueData: RevenueData[] = [];
    maxDailyRevenue = 0;

    paymentSummary: PaymentSummary[] = [
        { method: 'Cash', amount: 985000, count: 342, percentage: 40.1 },
        { method: 'Card', amount: 738000, count: 257, percentage: 30.0 },
        { method: 'Insurance', amount: 492000, count: 168, percentage: 20.0 },
        { method: 'UPI', amount: 243750, count: 89, percentage: 9.9 }
    ];

    departmentRevenue: DepartmentRevenue[] = [
        { name: 'Cardiology', revenue: 685000, patients: 145, percentage: 27.9 },
        { name: 'Orthopedics', revenue: 542000, patients: 189, percentage: 22.1 },
        { name: 'Emergency', revenue: 425000, patients: 267, percentage: 17.3 },
        { name: 'Surgery', revenue: 385000, patients: 98, percentage: 15.7 },
        { name: 'Pediatrics', revenue: 245000, patients: 157, percentage: 10.0 },
        { name: 'General Medicine', revenue: 176750, patients: 200, percentage: 7.0 }
    ];

    transactions = [
        { billNo: 'BILL20241220001', datetime: '20/12/2024 09:15', patient: 'Rajesh Kumar', department: 'Cardiology', paymentMethod: 'Card', amount: 8500, status: 'Paid' },
        { billNo: 'BILL20241220002', datetime: '20/12/2024 09:30', patient: 'Priya Sharma', department: 'Orthopedics', paymentMethod: 'Cash', amount: 3200, status: 'Paid' },
        { billNo: 'BILL20241220003', datetime: '20/12/2024 10:05', patient: 'Amit Patel', department: 'Emergency', paymentMethod: 'Insurance', amount: 12500, status: 'Paid' },
        { billNo: 'BILL20241220004', datetime: '20/12/2024 10:20', patient: 'Sunita Singh', department: 'Surgery', paymentMethod: 'UPI', amount: 25000, status: 'Paid' },
        { billNo: 'BILL20241220005', datetime: '20/12/2024 10:45', patient: 'Vikram Reddy', department: 'Pediatrics', paymentMethod: 'Cash', amount: 1500, status: 'Paid' },
        { billNo: 'BILL20241220006', datetime: '20/12/2024 11:10', patient: 'Meena Gupta', department: 'General Medicine', paymentMethod: 'Card', amount: 2800, status: 'Paid' },
        { billNo: 'BILL20241220007', datetime: '20/12/2024 11:35', patient: 'Arjun Malhotra', department: 'Cardiology', paymentMethod: 'Insurance', amount: 15600, status: 'Paid' },
        { billNo: 'BILL20241220008', datetime: '20/12/2024 12:00', patient: 'Kavita Desai', department: 'Orthopedics', paymentMethod: 'UPI', amount: 4200, status: 'Paid' }
    ];
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit() {
        this.initializeDates();
        this.generateRevenueData();
    }
    // #endregion

    // #region Methods
    initializeDates() {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);

        this.toDate = today.toISOString().split('T')[0];
        this.fromDate = weekAgo.toISOString().split('T')[0];
    }

    generateRevenueData() {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        this.revenueData = days.map(day => {
            const cash = Math.floor(Math.random() * 50000) + 100000;
            const card = Math.floor(Math.random() * 40000) + 80000;
            const insurance = Math.floor(Math.random() * 30000) + 60000;
            const upi = Math.floor(Math.random() * 20000) + 30000;
            const total = cash + card + insurance + upi;

            return {
                date: day,
                cashPayments: cash,
                cardPayments: card,
                insurancePayments: insurance,
                upiPayments: upi,
                total: total
            };
        });

        this.maxDailyRevenue = Math.max(...this.revenueData.map(d => d.total));
    }

    filterData() {
        console.log('Filtering data from', this.fromDate, 'to', this.toDate);
        // Implement filtering logic here
    }

    getFilteredTransactions() {
        return this.transactions.filter(t => {
            const matchesSearch = !this.searchQuery ||
                t.billNo.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                t.patient.toLowerCase().includes(this.searchQuery.toLowerCase());

            const matchesPayment = !this.filterPaymentMethod ||
                t.paymentMethod === this.filterPaymentMethod;

            return matchesSearch && matchesPayment;
        });
    }

    getPaymentIconClass(method: string): string {
        const classes: { [key: string]: string } = {
            'Cash': 'bg-green-100 text-green-600',
            'Card': 'bg-blue-100 text-blue-600',
            'Insurance': 'bg-purple-100 text-purple-600',
            'UPI': 'bg-orange-100 text-orange-600'
        };
        return classes[method] || 'bg-gray-100 text-gray-600';
    }

    getPaymentBarClass(method: string): string {
        const classes: { [key: string]: string } = {
            'Cash': 'bg-green-500',
            'Card': 'bg-blue-500',
            'Insurance': 'bg-purple-500',
            'UPI': 'bg-orange-500'
        };
        return classes[method] || 'bg-gray-500';
    }

    getPaymentBadgeClass(method: string): string {
        const classes: { [key: string]: string } = {
            'Cash': 'bg-green-100 text-green-800',
            'Card': 'bg-blue-100 text-blue-800',
            'Insurance': 'bg-purple-100 text-purple-800',
            'UPI': 'bg-orange-100 text-orange-800'
        };
        return classes[method] || 'bg-gray-100 text-gray-800';
    }

    exportReport() {
        alert('Exporting revenue report to PDF...\n\nThis would generate a comprehensive PDF report with all revenue data, charts, and analytics.');
        console.log('Exporting report...');
    }
    // #endregion
}