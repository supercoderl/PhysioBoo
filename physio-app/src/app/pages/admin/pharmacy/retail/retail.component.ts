import { Component, OnInit } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { CartItem } from "../../../../shared/types/cart";
import { Medicine } from "../../../../shared/types/medicine";

@Component({
    selector: 'admin-retail',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-7xl mx-auto">
        
        <!-- Page Header -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-800">Pharmacy Retail</h1>
          <p class="text-gray-600 mt-1">Manage medicine sales and billing</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Left Section - Medicine Search & List -->
          <div class="lg:col-span-2 space-y-6">
            
            <!-- Search & Filter Card -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <div class="flex flex-col md:flex-row gap-4">
                <div class="flex-1">
                  <input
                    type="text"
                    [(ngModel)]="searchQuery"
                    (input)="searchMedicines()"
                    placeholder="Search medicine by name, generic name, or batch no..."
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  [(ngModel)]="selectedCategory"
                  (change)="filterByCategory()"
                  class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Ointment">Ointment</option>
                </select>
              </div>
            </div>

            <!-- Medicine List Card -->
            <div class="bg-white rounded-lg shadow-md">
              <div class="p-6 border-b border-gray-200">
                <h2 class="text-xl font-semibold text-gray-800">Available Medicines</h2>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch/Expiry</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr *ngFor="let medicine of filteredMedicines" class="hover:bg-gray-50 transition-colors">
                      <td class="px-6 py-4">
                        <div class="text-sm font-medium text-gray-900">{{medicine.name}}</div>
                        <div class="text-sm text-gray-500">{{medicine.genericName}}</div>
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                          {{medicine.category}}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-900">
                        <div>{{medicine.batchNo}}</div>
                        <div class="text-gray-500">Exp: {{medicine.expiryDate}}</div>
                      </td>
                      <td class="px-6 py-4 text-sm">
                        <span [ngClass]="{
                          'text-red-600 font-semibold': medicine.stock < 10,
                          'text-yellow-600': medicine.stock >= 10 && medicine.stock < 50,
                          'text-green-600': medicine.stock >= 50
                        }">
                          {{medicine.stock}} units
                        </span>
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-900">
                        <div class="font-semibold">\${{medicine.price}}</div>
                        <div class="text-gray-500 text-xs">MRP: \${{medicine.mrp}}</div>
                      </td>
                      <td class="px-6 py-4 text-sm">
                        <button
                          (click)="addToCart(medicine)"
                          [disabled]="medicine.stock === 0"
                          [ngClass]="{
                            'bg-blue-600 hover:bg-blue-700 text-white': medicine.stock > 0,
                            'bg-gray-300 text-gray-500 cursor-not-allowed': medicine.stock === 0
                          }"
                          class="px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          {{medicine.stock === 0 ? 'Out of Stock' : 'Add to Cart'}}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <!-- Right Section - Cart & Billing -->
          <div class="space-y-6">
            
            <!-- Patient Info Card -->
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-lg font-semibold text-gray-800 mb-4">Patient Information</h2>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                  <input
                    type="text"
                    [(ngModel)]="patientName"
                    placeholder="Enter patient name"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    [(ngModel)]="patientPhone"
                    placeholder="Enter phone number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Doctor Name (Optional)</label>
                  <input
                    type="text"
                    [(ngModel)]="doctorName"
                    placeholder="Enter doctor name"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <!-- Cart Card -->
            <div class="bg-white rounded-lg shadow-md">
              <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 class="text-lg font-semibold text-gray-800">Cart Items ({{cart.length}})</h2>
                <button
                  *ngIf="cart.length > 0"
                  (click)="clearCart()"
                  class="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Clear All
                </button>
              </div>
              
              <div class="p-6 max-h-96 overflow-y-auto">
                <div *ngIf="cart.length === 0" class="text-center py-8 text-gray-500">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p class="mt-2">Cart is empty</p>
                </div>

                <div *ngFor="let item of cart" class="mb-4 pb-4 border-b border-gray-200 last:border-0">
                  <div class="flex justify-between items-start mb-2">
                    <div class="flex-1">
                      <h3 class="font-medium text-gray-900">{{item.name}}</h3>
                      <p class="text-sm text-gray-500">{{item.genericName}}</p>
                      <p class="text-sm text-gray-600 mt-1">\${{item.price}} × {{item.quantity}}</p>
                    </div>
                    <button
                      (click)="removeFromCart(item.id)"
                      class="text-red-600 hover:text-red-700"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div class="flex items-center gap-3">
                    <div class="flex items-center border border-gray-300 rounded-lg">
                      <button
                        (click)="updateQuantity(item.id, -1)"
                        class="px-3 py-1 hover:bg-gray-100"
                      >-</button>
                      <input
                        type="number"
                        [(ngModel)]="item.quantity"
                        (change)="recalculateCart()"
                        min="1"
                        [max]="item.stock"
                        class="w-16 text-center border-x border-gray-300 py-1"
                      />
                      <button
                        (click)="updateQuantity(item.id, 1)"
                        [disabled]="item.quantity >= item.stock"
                        class="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >+</button>
                    </div>
                    
                    <div class="flex-1">
                      <input
                        type="number"
                        [(ngModel)]="item.discount"
                        (input)="recalculateCart()"
                        placeholder="Discount %"
                        min="0"
                        max="100"
                        class="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                  
                  <div class="mt-2 text-right">
                    <span class="text-sm text-gray-600">Total: </span>
                    <span class="font-semibold text-gray-900">\${{item.total.toFixed(2)}}</span>
                  </div>
                </div>
              </div>

              <!-- Billing Summary -->
              <div class="p-6 bg-gray-50 border-t border-gray-200">
                <div class="space-y-2 mb-4">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Subtotal:</span>
                    <span class="font-medium">\${{subtotal.toFixed(2)}}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Total Discount:</span>
                    <span class="font-medium text-green-600">-\${{totalDiscount.toFixed(2)}}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Tax ({{taxRate}}%):</span>
                    <span class="font-medium">\${{tax.toFixed(2)}}</span>
                  </div>
                  <div class="pt-2 border-t border-gray-300 flex justify-between">
                    <span class="text-lg font-semibold text-gray-900">Grand Total:</span>
                    <span class="text-lg font-bold text-blue-600">\${{grandTotal.toFixed(2)}}</span>
                  </div>
                </div>

                <div class="space-y-2">
                  <button
                    (click)="processSale()"
                    [disabled]="cart.length === 0 || !patientName"
                    [ngClass]="{
                      'bg-blue-600 hover:bg-blue-700 text-white': cart.length > 0 && patientName,
                      'bg-gray-300 text-gray-500 cursor-not-allowed': cart.length === 0 || !patientName
                    }"
                    class="w-full py-3 rounded-lg font-semibold transition-colors"
                  >
                    Process Sale
                  </button>
                  <button
                    (click)="printBill()"
                    [disabled]="cart.length === 0"
                    class="w-full py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Print Bill
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    `
})

export class AdminRetailComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    searchQuery = '';
    selectedCategory = '';

    medicines: Medicine[] = [];
    filteredMedicines: Medicine[] = [];
    cart: CartItem[] = [];

    patientName = '';
    patientPhone = '';
    doctorName = '';

    taxRate = 5; // 5% tax

    get subtotal(): number {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    get totalDiscount(): number {
        return this.cart.reduce((sum, item) => {
            const itemTotal = item.price * item.quantity;
            return sum + (itemTotal * item.discount / 100);
        }, 0);
    }

    get tax(): number {
        return (this.subtotal - this.totalDiscount) * this.taxRate / 100;
    }

    get grandTotal(): number {
        return this.subtotal - this.totalDiscount + this.tax;
    }
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit() {
        this.loadMedicines();
    }
    // #endregion

    // #region Methods
    loadMedicines() {
        // Sample data - replace with actual API call
        this.medicines = [
            { id: '1', name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Tablet', manufacturer: 'PharmaCo', batchNo: 'BT2024001', expiryDate: '12/2025', stock: 150, price: 2.50, mrp: 3.00 },
            { id: '2', name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', category: 'Capsule', manufacturer: 'MediLife', batchNo: 'BT2024002', expiryDate: '08/2025', stock: 80, price: 5.00, mrp: 6.00 },
            { id: '3', name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'Tablet', manufacturer: 'HealthCare+', batchNo: 'BT2024003', expiryDate: '03/2026', stock: 200, price: 3.00, mrp: 3.50 },
            { id: '4', name: 'Cough Syrup', genericName: 'Dextromethorphan', category: 'Syrup', manufacturer: 'WellMed', batchNo: 'BT2024004', expiryDate: '06/2025', stock: 45, price: 8.50, mrp: 10.00 },
            { id: '5', name: 'Insulin Injection', genericName: 'Insulin Glargine', category: 'Injection', manufacturer: 'BioPharm', batchNo: 'BT2024005', expiryDate: '11/2025', stock: 25, price: 35.00, mrp: 40.00 },
            { id: '6', name: 'Antiseptic Cream', genericName: 'Povidone-Iodine', category: 'Ointment', manufacturer: 'SkinCare', batchNo: 'BT2024006', expiryDate: '09/2025', stock: 5, price: 4.50, mrp: 5.50 },
            { id: '7', name: 'Vitamin D3', genericName: 'Cholecalciferol', category: 'Capsule', manufacturer: 'NutriHealth', batchNo: 'BT2024007', expiryDate: '12/2026', stock: 0, price: 12.00, mrp: 14.00 },
            { id: '8', name: 'Metformin 500mg', genericName: 'Metformin HCl', category: 'Tablet', manufacturer: 'DiabCare', batchNo: 'BT2024008', expiryDate: '04/2026', stock: 120, price: 6.50, mrp: 7.50 },
        ];
        this.filteredMedicines = [...this.medicines];
    }

    searchMedicines() {
        const query = this.searchQuery.toLowerCase();
        this.filteredMedicines = this.medicines.filter(med =>
            med.name.toLowerCase().includes(query) ||
            med.genericName.toLowerCase().includes(query) ||
            med.batchNo.toLowerCase().includes(query)
        );
        if (this.selectedCategory) {
            this.filteredMedicines = this.filteredMedicines.filter(med => med.category === this.selectedCategory);
        }
    }

    filterByCategory() {
        if (this.selectedCategory) {
            this.filteredMedicines = this.medicines.filter(med => med.category === this.selectedCategory);
        } else {
            this.filteredMedicines = [...this.medicines];
        }
        if (this.searchQuery) {
            this.searchMedicines();
        }
    }

    addToCart(medicine: Medicine) {
        const existingItem = this.cart.find(item => item.id === medicine.id);
        if (existingItem) {
            if (existingItem.quantity < medicine.stock) {
                existingItem.quantity++;
                this.recalculateCart();
            }
        } else {
            const cartItem: CartItem = {
                ...medicine,
                quantity: 1,
                discount: 0,
                total: medicine.price
            };
            this.cart.push(cartItem);
        }
    }

    removeFromCart(id: string) {
        this.cart = this.cart.filter(item => item.id !== id);
    }

    updateQuantity(id: string, change: number) {
        const item = this.cart.find(i => i.id === id);
        if (item) {
            const newQty = item.quantity + change;
            if (newQty > 0 && newQty <= item.stock) {
                item.quantity = newQty;
                this.recalculateCart();
            }
        }
    }

    recalculateCart() {
        this.cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            const discountAmount = itemTotal * item.discount / 100;
            item.total = itemTotal - discountAmount;
        });
    }

    clearCart() {
        if (confirm('Are you sure you want to clear the cart?')) {
            this.cart = [];
        }
    }

    processSale() {
        if (!this.patientName) {
            alert('Please enter patient name');
            return;
        }

        const saleData = {
            patientName: this.patientName,
            patientPhone: this.patientPhone,
            doctorName: this.doctorName,
            items: this.cart,
            subtotal: this.subtotal,
            discount: this.totalDiscount,
            tax: this.tax,
            grandTotal: this.grandTotal,
            date: new Date()
        };

        console.log('Processing sale:', saleData);
        alert('Sale processed successfully!');

        // Reset form
        this.cart = [];
        this.patientName = '';
        this.patientPhone = '';
        this.doctorName = '';
    }

    printBill() {
        alert('Printing bill...');
        // Implement print functionality
    }
    // #endregion
}