import { Component, OnInit } from "@angular/core";
import { PatientType, RiskLevel } from "../../../../shared/enums/patient";
import { SharedModule } from "../../../../shared/shared-imports";
import { BillItem } from "../../../../shared/types/bill";
import { Patient } from "../../../../shared/types/patient";

@Component({
  selector: 'admin-cashier',
  standalone: true,
  imports: [
    SharedModule
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Search Patient Section -->
        <div class="bg-surface rounded-lg shadow-md p-6 mb-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Patient Information</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Patient ID / Name</label>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (input)="searchPatient()"
                placeholder="Search patient..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="text"
                placeholder="Phone number"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Bill Number</label>
              <input
                type="text"
                [(ngModel)]="billNumber"
                readonly
                class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Bill Items Section -->
          <div class="lg:col-span-2 bg-surface rounded-lg shadow-md p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold text-gray-800">Bill Items</h2>
              <button
                (click)="addNewItem()"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add Item
              </button>
            </div>

            <!-- Add Item Form -->
            <div class="bg-gray-50 rounded-lg p-4 mb-4">
              <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div class="md:col-span-2">
                  <input
                    type="text"
                    [(ngModel)]="newItem.service"
                    placeholder="Service/Item name"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    [(ngModel)]="newItem.quantity"
                    (input)="calculateItemTotal()"
                    placeholder="Qty"
                    min="1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    [(ngModel)]="newItem.price"
                    (input)="calculateItemTotal()"
                    placeholder="Price"
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <!-- Items Table -->
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Service</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">Qty</th>
                    <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">Price</th>
                    <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                    <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr *ngFor="let item of billItems" class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-800">{{ item.service }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 text-center">{{ item.quantity }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 text-right">₹{{ item.price.toFixed(2) }}</td>
                    <td class="px-4 py-3 text-sm font-medium text-gray-800 text-right">₹{{ item.total.toFixed(2) }}</td>
                    <td class="px-4 py-3 text-center">
                      <button
                        (click)="removeItem(item.id)"
                        class="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="billItems.length === 0">
                    <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                      No items added yet. Click "Add Item" to start.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Payment Section -->
          <div class="bg-surface rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Payment Details</h2>
            
            <!-- Summary -->
            <div class="space-y-3 mb-6 pb-6 border-b border-gray-200">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Subtotal:</span>
                <span class="font-medium text-gray-800">₹{{ subtotal.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Discount (%):</span>
                <input
                  type="number"
                  [(ngModel)]="discount"
                  (input)="calculateTotal()"
                  min="0"
                  max="100"
                  class="w-20 px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Tax (%):</span>
                <input
                  type="number"
                  [(ngModel)]="tax"
                  (input)="calculateTotal()"
                  min="0"
                  class="w-20 px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div class="flex justify-between text-lg font-semibold pt-3 border-t border-gray-200">
                <span class="text-gray-800">Total Amount:</span>
                <span class="text-blue-600">₹{{ totalAmount.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Payment Method -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select
                [(ngModel)]="paymentMethod"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="insurance">Insurance</option>
              </select>
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Amount Received</label>
              <input
                type="number"
                [(ngModel)]="amountReceived"
                (input)="calculateChange()"
                placeholder="0.00"
                min="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div class="mb-6 p-4 bg-green-50 rounded-lg">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-700">Change:</span>
                <span class="text-xl font-bold text-green-600">₹{{ change.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3">
              <button
                (click)="processPayment()"
                [disabled]="billItems.length === 0 || amountReceived < totalAmount"
                class="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                Process Payment
              </button>
              <button
                (click)="printBill()"
                class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Print Bill
              </button>
              <button
                (click)="clearBill()"
                class="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Clear / New Bill
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    `
})

export class AdminCashierComponent implements OnInit {
  // #region Inputs, Outputs, Properties
  searchQuery = '';
  selectedPatient: Patient = {
    id: "",
    patientNumber: "",
    patientType: PatientType.Outpatient,
    primaryDoctorId: "",
    totalVisits: 0,
    totalAmountSpent: 0,
    loyaltyPoints: 0,
    riskLevel: RiskLevel.Low,
    userId: null,
    fullName: "",
    dateOfBirth: null,
    gender: null,
    bloodType: null,
    phone: null,
    email: null,
    address: null,
    city: null,
    country: null,
    occupation: null,
    isVip: false,
    isSeniorCitizen: false,
    emergencyContactName: null,
    emergencyContactPhone: null,
    lastVisitDate: null,
    nextFollowUpDate: null,
    isActive: false,
    createdAt: new Date()
  };
  billNumber = '';

  newItem = { service: '', quantity: 1, price: 0, total: 0 };
  billItems: BillItem[] = [];
  nextItemId = 1;

  subtotal = 0;
  discount = 0;
  tax = 5;
  totalAmount = 0;
  amountReceived = 0;
  change = 0;
  paymentMethod: 'cash' | 'card' | 'insurance' | 'upi' = 'cash';
  // #endregion

  // #region Init (Lifecycle + Setup)
  ngOnInit() {
    this.generateBillNumber();
  }
  // #endregion

  // #region Methods
  generateBillNumber() {
    const now = new Date();
    this.billNumber = `BILL${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  }

  searchPatient() {
    // Implement patient search logic here
    console.log('Searching for:', this.searchQuery);
  }

  addNewItem() {
    if (this.newItem.service && this.newItem.quantity > 0 && this.newItem.price > 0) {
      this.billItems.push({
        id: this.nextItemId++,
        service: this.newItem.service,
        quantity: this.newItem.quantity,
        price: this.newItem.price,
        total: this.newItem.quantity * this.newItem.price
      });

      this.newItem = { service: '', quantity: 1, price: 0, total: 0 };
      this.calculateTotal();
    }
  }

  calculateItemTotal() {
    this.newItem.total = this.newItem.quantity * this.newItem.price;
  }

  removeItem(id: number) {
    this.billItems = this.billItems.filter(item => item.id !== id);
    this.calculateTotal();
  }

  calculateTotal() {
    this.subtotal = this.billItems.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = (this.subtotal * this.discount) / 100;
    const afterDiscount = this.subtotal - discountAmount;
    const taxAmount = (afterDiscount * this.tax) / 100;
    this.totalAmount = afterDiscount + taxAmount;
    this.calculateChange();
  }

  calculateChange() {
    this.change = Math.max(0, this.amountReceived - this.totalAmount);
  }

  processPayment() {
    if (this.billItems.length === 0) {
      alert('Please add items to the bill');
      return;
    }

    if (this.amountReceived < this.totalAmount) {
      alert('Insufficient payment amount');
      return;
    }

    alert(`Payment processed successfully!\nBill Number: ${this.billNumber}\nTotal: ₹${this.totalAmount.toFixed(2)}\nReceived: ₹${this.amountReceived.toFixed(2)}\nChange: ₹${this.change.toFixed(2)}`);

    // Here you would typically save to backend
    this.printBill();
  }

  printBill() {
    console.log('Printing bill...');
    window.print();
  }

  clearBill() {
    if (confirm('Are you sure you want to clear the current bill?')) {
      this.billItems = [];
      this.newItem = { service: '', quantity: 1, price: 0, total: 0 };
      this.subtotal = 0;
      this.discount = 0;
      this.tax = 5;
      this.totalAmount = 0;
      this.amountReceived = 0;
      this.change = 0;
      this.searchQuery = '';
      this.generateBillNumber();
    }
  }
  // #endregion
}