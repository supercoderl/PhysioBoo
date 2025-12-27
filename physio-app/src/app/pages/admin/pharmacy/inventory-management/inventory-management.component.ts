import { Component, OnInit } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { InventoryItem } from "../../../../shared/types/inventory";

@Component({
    selector: 'admin-inventory-management',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
     <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header Section -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-800">Inventory Management</h1>
          <p class="text-gray-600 mt-1">Manage hospital supplies and equipment</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Total Items</p>
                <p class="text-2xl font-bold text-gray-800">{{ getTotalItems() }}</p>
              </div>
              <div class="bg-blue-100 p-3 rounded-full">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Low Stock</p>
                <p class="text-2xl font-bold text-orange-600">{{ getLowStockCount() }}</p>
              </div>
              <div class="bg-orange-100 p-3 rounded-full">
                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Out of Stock</p>
                <p class="text-2xl font-bold text-red-600">{{ getOutOfStockCount() }}</p>
              </div>
              <div class="bg-red-100 p-3 rounded-full">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">Categories</p>
                <p class="text-2xl font-bold text-green-600">{{ getCategories().length }}</p>
              </div>
              <div class="bg-green-100 p-3 rounded-full">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters and Actions -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div class="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <!-- Search -->
              <div class="relative">
                <input
                  type="text"
                  [(ngModel)]="searchTerm"
                  (ngModelChange)="filterItems()"
                  placeholder="Search items..."
                  class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
                />
                <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>

              <!-- Category Filter -->
              <select
                [(ngModel)]="selectedCategory"
                (ngModelChange)="filterItems()"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option *ngFor="let cat of getCategories()" [value]="cat">{{ cat }}</option>
              </select>

              <!-- Status Filter -->
              <select
                [(ngModel)]="selectedStatus"
                (ngModelChange)="filterItems()"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3">
              <button
                (click)="exportData()"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Export
              </button>
              <button
                (click)="openAddModal()"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add Item
              </button>
            </div>
          </div>
        </div>

        <!-- Inventory Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let item of filteredItems" class="hover:bg-gray-50 transition">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ item.name }}</div>
                    <div class="text-sm text-gray-500">{{ item.supplier }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                      {{ item.category }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ item.quantity }} {{ item.unit }}</div>
                    <div class="text-xs text-gray-500">Min: {{ item.minStock }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ item.location }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ item.expiryDate }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      [ngClass]="{
                        'bg-green-100 text-green-800': item.status === 'In Stock',
                        'bg-orange-100 text-orange-800': item.status === 'Low Stock',
                        'bg-red-100 text-red-800': item.status === 'Out of Stock'
                      }"
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    >
                      {{ item.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex gap-2">
                      <button
                        (click)="editItem(item)"
                        class="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button
                        (click)="deleteItem(item.id)"
                        class="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div *ngIf="filteredItems.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No items found</h3>
            <p class="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
          </div>
        </div>
      </div>
    </div>
    `
})

export class AdminInventoryManagementComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    inventoryItems: InventoryItem[] = [
        {
            id: 1,
            name: 'Surgical Masks',
            category: 'PPE',
            quantity: 5000,
            minStock: 1000,
            unit: 'pieces',
            location: 'Warehouse A',
            expiryDate: '2025-12-31',
            supplier: 'MedSupply Co.',
            status: 'In Stock'
        },
        {
            id: 2,
            name: 'Latex Gloves',
            category: 'PPE',
            quantity: 800,
            minStock: 1000,
            unit: 'boxes',
            location: 'Warehouse A',
            expiryDate: '2026-03-15',
            supplier: 'HealthCare Inc.',
            status: 'Low Stock'
        },
        {
            id: 3,
            name: 'Antibiotics - Amoxicillin',
            category: 'Medication',
            quantity: 0,
            minStock: 200,
            unit: 'units',
            location: 'Pharmacy',
            expiryDate: '2025-08-20',
            supplier: 'PharmaTech',
            status: 'Out of Stock'
        },
        {
            id: 4,
            name: 'Syringes 5ml',
            category: 'Medical Supplies',
            quantity: 3000,
            minStock: 500,
            unit: 'pieces',
            location: 'Storage Room B',
            expiryDate: '2027-01-10',
            supplier: 'MedEquip Ltd.',
            status: 'In Stock'
        },
        {
            id: 5,
            name: 'Blood Pressure Monitor',
            category: 'Equipment',
            quantity: 25,
            minStock: 10,
            unit: 'units',
            location: 'Equipment Room',
            expiryDate: 'N/A',
            supplier: 'MediTech Solutions',
            status: 'In Stock'
        },
        {
            id: 6,
            name: 'Bandages',
            category: 'Medical Supplies',
            quantity: 150,
            minStock: 200,
            unit: 'rolls',
            location: 'Storage Room A',
            expiryDate: '2026-06-30',
            supplier: 'MedSupply Co.',
            status: 'Low Stock'
        }
    ];

    filteredItems: InventoryItem[] = [];
    searchTerm: string = '';
    selectedCategory: string = '';
    selectedStatus: string = '';
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit() {
        this.filteredItems = [...this.inventoryItems];
    }
    // #endregion

    // #region Methods
    filterItems() {
        this.filteredItems = this.inventoryItems.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                item.supplier.toLowerCase().includes(this.searchTerm.toLowerCase());
            const matchesCategory = !this.selectedCategory || item.category === this.selectedCategory;
            const matchesStatus = !this.selectedStatus || item.status === this.selectedStatus;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }

    getTotalItems(): number {
        return this.inventoryItems.length;
    }

    getLowStockCount(): number {
        return this.inventoryItems.filter(item => item.status === 'Low Stock').length;
    }

    getOutOfStockCount(): number {
        return this.inventoryItems.filter(item => item.status === 'Out of Stock').length;
    }

    getCategories(): string[] {
        return [...new Set(this.inventoryItems.map(item => item.category))];
    }

    openAddModal() {
        console.log('Open add item modal');
        // Implement modal logic
    }

    editItem(item: InventoryItem) {
        console.log('Edit item:', item);
        // Implement edit logic
    }

    deleteItem(id: number) {
        if (confirm('Are you sure you want to delete this item?')) {
            this.inventoryItems = this.inventoryItems.filter(item => item.id !== id);
            this.filterItems();
        }
    }

    exportData() {
        console.log('Export data');
        // Implement export logic
    }
    // #endregion
}