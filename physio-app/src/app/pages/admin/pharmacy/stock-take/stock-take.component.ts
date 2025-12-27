import { Component } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { StockItem, StockTakeSession } from "../../../../shared/types/stock";

@Component({
    selector: 'admin-stock-take',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <!-- Header Section -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h2 class="text-2xl font-semibold text-gray-800">Stock Take</h2>
            <p class="text-gray-600 mt-1">Inventory Count & Reconciliation</p>
          </div>
          <button 
            (click)="startNewStockTake()"
            class="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
          >
            <span>+ Start New Stock Take</span>
          </button>
        </div>

        <!-- Current Session Info -->
        <div *ngIf="currentSession" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p class="text-sm text-blue-700 font-medium">Session ID</p>
              <p class="text-lg font-semibold text-blue-900">{{ currentSession.id }}</p>
            </div>
            <div>
              <p class="text-sm text-blue-700 font-medium">Started</p>
              <p class="text-lg font-semibold text-blue-900">{{ currentSession.startDate }}</p>
            </div>
            <div>
              <p class="text-sm text-blue-700 font-medium">Progress</p>
              <p class="text-lg font-semibold text-blue-900">
                {{ currentSession.completedItems }} / {{ currentSession.totalItems }}
              </p>
              <div class="w-full bg-blue-200 rounded-full h-2 mt-1">
                <div 
                  class="bg-blue-600 h-2 rounded-full transition-all"
                  [style.width.%]="(currentSession.completedItems / currentSession.totalItems) * 100"
                ></div>
              </div>
            </div>
            <div>
              <p class="text-sm text-blue-700 font-medium">Performed By</p>
              <p class="text-lg font-semibold text-blue-900">{{ currentSession.performedBy }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input 
              type="text" 
              [(ngModel)]="searchTerm"
              placeholder="Search by name or code..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select 
              [(ngModel)]="filterCategory"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="Antibiotics">Antibiotics</option>
              <option value="Analgesics">Analgesics</option>
              <option value="Cardiovascular">Cardiovascular</option>
              <option value="Respiratory">Respiratory</option>
              <option value="Supplements">Supplements</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select 
              [(ngModel)]="filterStatus"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="counted">Counted</option>
              <option value="verified">Verified</option>
              <option value="discrepancy">Discrepancy</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <select 
              [(ngModel)]="filterLocation"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Locations</option>
              <option value="Shelf A1">Shelf A1</option>
              <option value="Shelf A2">Shelf A2</option>
              <option value="Shelf B1">Shelf B1</option>
              <option value="Refrigerator">Refrigerator</option>
              <option value="Controlled">Controlled</option>
            </select>
          </div>
        </div>

        <div class="flex gap-3 mt-4">
          <button 
            (click)="applyFilters()"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Apply Filters
          </button>
          <button 
            (click)="clearFilters()"
            class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- Stock Items Table -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-semibold text-gray-800">Stock Items</h3>
          <div class="flex gap-3">
            <button 
              (click)="scanBarcode()"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
            >
              Scan Barcode
            </button>
            <button 
              (click)="exportToExcel()"
              class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
            >
              Export to Excel
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item Name</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Batch No</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Expiry</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">System Qty</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Physical Qty</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Variance</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of filteredItems" 
                  class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td class="px-4 py-4 font-medium text-gray-900">{{ item.code }}</td>
                <td class="px-4 py-4">
                  <p class="font-medium text-gray-900">{{ item.name }}</p>
                  <p class="text-sm text-gray-500">{{ item.unit }}</p>
                </td>
                <td class="px-4 py-4 text-gray-700">{{ item.category }}</td>
                <td class="px-4 py-4 text-gray-700">{{ item.location }}</td>
                <td class="px-4 py-4 text-gray-700">{{ item.batchNo }}</td>
                <td class="px-4 py-4">
                  <span [ngClass]="{
                    'text-red-600 font-medium': isExpiringSoon(item.expiryDate),
                    'text-gray-700': !isExpiringSoon(item.expiryDate)
                  }">
                    {{ item.expiryDate }}
                  </span>
                </td>
                <td class="px-4 py-4 text-gray-700 font-medium">{{ item.systemQty }}</td>
                <td class="px-4 py-4">
                  <input 
                    type="number" 
                    [(ngModel)]="item.physicalQty"
                    (ngModelChange)="calculateVariance(item)"
                    min="0"
                    [disabled]="item.status === 'verified'"
                    class="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </td>
                <td class="px-4 py-4">
                  <span [ngClass]="{
                    'text-red-600 font-semibold': item.variance < 0,
                    'text-green-600 font-semibold': item.variance > 0,
                    'text-gray-700': item.variance === 0
                  }">
                    {{ item.variance > 0 ? '+' : '' }}{{ item.variance }}
                  </span>
                </td>
                <td class="px-4 py-4">
                  <span [ngClass]="{
                    'bg-yellow-100 text-yellow-800': item.status === 'pending',
                    'bg-blue-100 text-blue-800': item.status === 'counted',
                    'bg-green-100 text-green-800': item.status === 'verified',
                    'bg-red-100 text-red-800': item.status === 'discrepancy'
                  }" class="px-3 py-1 rounded-full text-xs font-medium">
                    {{ item.status | titlecase }}
                  </span>
                </td>
                <td class="px-4 py-4">
                  <div class="flex gap-2">
                    <button 
                      *ngIf="item.status !== 'verified'"
                      (click)="saveCount(item)"
                      class="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Save
                    </button>
                    <button 
                      *ngIf="item.status === 'counted' || item.status === 'discrepancy'"
                      (click)="verifyCount(item)"
                      class="text-green-600 hover:text-green-800 font-medium text-sm"
                    >
                      Verify
                    </button>
                    <button 
                      (click)="viewHistory(item)"
                      class="text-gray-600 hover:text-gray-800 font-medium text-sm"
                    >
                      History
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="p-6 border-t border-gray-200 flex justify-between items-center">
          <p class="text-sm text-gray-600">
            Showing {{ filteredItems.length }} of {{ stockItems.length }} items
          </p>
          <div class="flex gap-2">
            <button class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Previous
            </button>
            <button class="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
            <button class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">2</button>
            <button class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">3</button>
            <button class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Summary Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <p class="text-sm text-gray-600 mb-2">Total Items</p>
          <p class="text-3xl font-bold text-gray-900">{{ stockItems.length }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <p class="text-sm text-gray-600 mb-2">Counted</p>
          <p class="text-3xl font-bold text-blue-600">{{ getCountedItems() }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <p class="text-sm text-gray-600 mb-2">Discrepancies</p>
          <p class="text-3xl font-bold text-red-600">{{ getDiscrepancyItems() }}</p>
        </div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <p class="text-sm text-gray-600 mb-2">Verified</p>
          <p class="text-3xl font-bold text-green-600">{{ getVerifiedItems() }}</p>
        </div>
      </div>

      <!-- Complete Stock Take Button -->
      <div *ngIf="currentSession" class="flex justify-end gap-4 mt-6">
        <button 
          (click)="pauseStockTake()"
          class="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
        >
          Pause Stock Take
        </button>
        <button 
          (click)="completeStockTake()"
          class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Complete Stock Take
        </button>
      </div>
    </div>
    `
})

export class AdminStockTakeComponent {
    // #region Inputs, Outputs, Properties
    searchTerm = '';
    filterCategory = '';
    filterStatus = '';
    filterLocation = '';

    currentSession: StockTakeSession | null = {
        id: 'ST-2024-001',
        startDate: '2024-12-21 09:00',
        completedItems: 8,
        totalItems: 15,
        status: 'in-progress',
        performedBy: 'John Pharmacist'
    };

    stockItems: StockItem[] = [
        {
            id: 1,
            code: 'MED-001',
            name: 'Amoxicillin 500mg',
            category: 'Antibiotics',
            unit: 'Capsule',
            systemQty: 500,
            physicalQty: 495,
            variance: -5,
            location: 'Shelf A1',
            batchNo: 'BT2024001',
            expiryDate: '2025-06-30',
            status: 'counted'
        },
        {
            id: 2,
            code: 'MED-002',
            name: 'Paracetamol 500mg',
            category: 'Analgesics',
            unit: 'Tablet',
            systemQty: 1000,
            physicalQty: 1000,
            variance: 0,
            location: 'Shelf A2',
            batchNo: 'BT2024002',
            expiryDate: '2025-12-31',
            status: 'verified'
        },
        {
            id: 3,
            code: 'MED-003',
            name: 'Ibuprofen 400mg',
            category: 'Analgesics',
            unit: 'Tablet',
            systemQty: 750,
            physicalQty: 720,
            variance: -30,
            location: 'Shelf A2',
            batchNo: 'BT2024003',
            expiryDate: '2025-03-15',
            status: 'discrepancy'
        },
        {
            id: 4,
            code: 'MED-004',
            name: 'Lisinopril 10mg',
            category: 'Cardiovascular',
            unit: 'Tablet',
            systemQty: 300,
            physicalQty: 0,
            variance: 0,
            location: 'Shelf B1',
            batchNo: 'BT2024004',
            expiryDate: '2025-09-20',
            status: 'pending'
        },
        {
            id: 5,
            code: 'MED-005',
            name: 'Omeprazole 20mg',
            category: 'Gastrointestinal',
            unit: 'Capsule',
            systemQty: 400,
            physicalQty: 405,
            variance: 5,
            location: 'Shelf A1',
            batchNo: 'BT2024005',
            expiryDate: '2025-08-10',
            status: 'counted'
        },
        {
            id: 6,
            code: 'MED-006',
            name: 'Vitamin D3 1000IU',
            category: 'Supplements',
            unit: 'Tablet',
            systemQty: 600,
            physicalQty: 0,
            variance: 0,
            location: 'Shelf B1',
            batchNo: 'BT2024006',
            expiryDate: '2026-01-30',
            status: 'pending'
        },
        {
            id: 7,
            code: 'MED-007',
            name: 'Insulin Glargine',
            category: 'Diabetes',
            unit: 'Vial',
            systemQty: 50,
            physicalQty: 48,
            variance: -2,
            location: 'Refrigerator',
            batchNo: 'BT2024007',
            expiryDate: '2025-02-28',
            status: 'counted'
        },
        {
            id: 8,
            code: 'MED-008',
            name: 'Salbutamol Inhaler',
            category: 'Respiratory',
            unit: 'Inhaler',
            systemQty: 80,
            physicalQty: 0,
            variance: 0,
            location: 'Shelf A2',
            batchNo: 'BT2024008',
            expiryDate: '2025-07-15',
            status: 'pending'
        }
    ];

    filteredItems: StockItem[] = [...this.stockItems];
    // #endregion

    // #region Methods
    calculateVariance(item: StockItem) {
        item.variance = item.physicalQty - item.systemQty;
        if (item.physicalQty > 0) {
            if (item.variance === 0) {
                item.status = 'counted';
            } else {
                item.status = 'discrepancy';
            }
        }
    }

    saveCount(item: StockItem) {
        if (item.physicalQty === 0) {
            alert('Please enter physical quantity');
            return;
        }
        item.lastUpdated = new Date().toLocaleString();
        alert(`Count saved for ${item.name}`);
        this.updateSessionProgress();
    }

    verifyCount(item: StockItem) {
        item.status = 'verified';
        alert(`Count verified for ${item.name}`);
        this.updateSessionProgress();
    }

    updateSessionProgress() {
        if (this.currentSession) {
            this.currentSession.completedItems = this.stockItems.filter(
                item => item.status === 'verified'
            ).length;
        }
    }

    viewHistory(item: StockItem) {
        alert(`Viewing history for ${item.name}`);
    }

    isExpiringSoon(expiryDate: string): boolean {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 90; // Expiring within 3 months
    }

    applyFilters() {
        this.filteredItems = this.stockItems.filter(item => {
            const matchesSearch = !this.searchTerm ||
                item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                item.code.toLowerCase().includes(this.searchTerm.toLowerCase());

            const matchesCategory = !this.filterCategory || item.category === this.filterCategory;
            const matchesStatus = !this.filterStatus || item.status === this.filterStatus;
            const matchesLocation = !this.filterLocation || item.location === this.filterLocation;

            return matchesSearch && matchesCategory && matchesStatus && matchesLocation;
        });
    }

    clearFilters() {
        this.searchTerm = '';
        this.filterCategory = '';
        this.filterStatus = '';
        this.filterLocation = '';
        this.filteredItems = [...this.stockItems];
    }

    getCountedItems(): number {
        return this.stockItems.filter(item => item.status === 'counted').length;
    }

    getDiscrepancyItems(): number {
        return this.stockItems.filter(item => item.status === 'discrepancy').length;
    }

    getVerifiedItems(): number {
        return this.stockItems.filter(item => item.status === 'verified').length;
    }

    startNewStockTake() {
        const confirmed = confirm('Start a new stock take session?');
        if (confirmed) {
            this.currentSession = {
                id: 'ST-2024-' + Math.floor(Math.random() * 1000),
                startDate: new Date().toLocaleString(),
                completedItems: 0,
                totalItems: this.stockItems.length,
                status: 'in-progress',
                performedBy: 'Current User'
            };
            // Reset all items to pending
            this.stockItems.forEach(item => {
                item.status = 'pending';
                item.physicalQty = 0;
                item.variance = 0;
            });
        }
    }

    pauseStockTake() {
        if (this.currentSession) {
            this.currentSession.status = 'paused';
            alert('Stock take paused. You can resume later.');
        }
    }

    completeStockTake() {
        const pendingItems = this.stockItems.filter(item => item.status === 'pending').length;
        if (pendingItems > 0) {
            const confirmed = confirm(`There are ${pendingItems} pending items. Complete stock take anyway?`);
            if (!confirmed) return;
        }

        if (this.currentSession) {
            this.currentSession.status = 'completed';
            alert('Stock take completed successfully!');
            this.currentSession = null;
        }
    }

    scanBarcode() {
        alert('Barcode scanner activated');
    }

    exportToExcel() {
        alert('Exporting to Excel...');
    }
    // #endregion
}