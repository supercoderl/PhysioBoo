import { Component } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { Prescription } from "../../../../shared/types/prescription";

@Component({
    selector: 'admin-prescription-dispense',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <!-- Search Section -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Prescription Dispense</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Prescription ID</label>
            <input 
              type="text" 
              [(ngModel)]="searchPrescriptionId"
              placeholder="Enter prescription ID"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Patient ID</label>
            <input 
              type="text" 
              [(ngModel)]="searchPatientId"
              placeholder="Enter patient ID"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div class="flex items-end">
            <button 
              (click)="searchPrescription()"
              class="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Search Prescription
            </button>
          </div>
        </div>
      </div>

      <!-- Prescription Details -->
      <div *ngIf="currentPrescription" class="bg-white rounded-lg shadow-sm mb-6">
        <!-- Patient Info Header -->
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p class="text-blue-100 text-sm">Patient Name</p>
              <p class="font-semibold text-lg">Da</p>
            </div>
            <div>
              <p class="text-blue-100 text-sm">Patient ID</p>
              <p class="font-semibold text-lg">12</p>
            </div>
            <div>
              <p class="text-blue-100 text-sm">Doctor</p>
              <p class="font-semibold text-lg">Da</p>
            </div>
            <div>
              <p class="text-blue-100 text-sm">Prescription Date</p>
              <p class="font-semibold text-lg">15-12-2025</p>
            </div>
          </div>
        </div>

        <!-- Medications Table -->
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Medications to Dispense</h3>
          
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Medication</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Dosage</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Frequency</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Prescribed Qty</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Dispense Qty</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                
              </tbody>
            </table>
          </div>

          <!-- Pharmacist Notes -->
          <div class="mt-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Pharmacist Notes</label>
            <textarea 
              [(ngModel)]="pharmacistNotes"
              rows="3"
              placeholder="Enter any notes or special instructions..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4 mt-6">
            <button 
              (click)="dispensePartial()"
              class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Dispense Selected
            </button>
            <button 
              (click)="dispenseAll()"
              class="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Dispense All
            </button>
            <button 
              (click)="printLabel()"
              class="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Print Labels
            </button>
            <button 
              (click)="cancelDispense()"
              class="px-6 py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Dispenses -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Recent Dispenses</h3>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Prescription ID</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Patient Name</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Dispensed By</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date & Time</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let record of recentDispenses" 
                  class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td class="px-4 py-4 font-medium text-gray-900">{{ record.prescriptionId }}</td>
                <td class="px-4 py-4 text-gray-700">{{ record.patientName }}</td>
                <td class="px-4 py-4 text-gray-700">{{ record.dispensedBy }}</td>
                <td class="px-4 py-4 text-gray-700">{{ record.dateTime }}</td>
                <td class="px-4 py-4">
                  <span [ngClass]="{
                    'bg-green-100 text-green-800': record.status === 'completed',
                    'bg-blue-100 text-blue-800': record.status === 'partial'
                  }" class="px-3 py-1 rounded-full text-xs font-medium">
                    {{ record.status | titlecase }}
                  </span>
                </td>
                <td class="px-4 py-4">
                  <button class="text-blue-600 hover:text-blue-800 font-medium text-sm">
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    `
})

export class AdminPrescriptionDispenseComponent {
    // #region Inputs, Outputs, Properties
    searchPrescriptionId = '';
    searchPatientId = '';
    pharmacistNotes = '';
    currentPrescription: Prescription | null = null;

    recentDispenses = [
        { prescriptionId: 'RX-2024-001', patientName: 'John Smith', dispensedBy: 'Sarah Johnson', dateTime: '2024-12-21 14:30', status: 'completed' },
        { prescriptionId: 'RX-2024-002', patientName: 'Emily Davis', dispensedBy: 'Sarah Johnson', dateTime: '2024-12-21 13:15', status: 'partial' },
        { prescriptionId: 'RX-2024-003', patientName: 'Michael Brown', dispensedBy: 'Sarah Johnson', dateTime: '2024-12-21 12:00', status: 'completed' }
    ];
    // #endregion

    // #region Methods
    searchPrescription() {
        // Mock data for demonstration
    }

    dispensePartial() {
        if (this.currentPrescription) {

            alert('Partial dispense recorded successfully!');
        }
    }

    dispenseAll() {
        if (this.currentPrescription) {

            alert('All medications dispensed successfully!');
        }
    }

    printLabel() {
        alert('Printing medication labels...');
    }

    cancelDispense() {
        this.currentPrescription = null;
        this.pharmacistNotes = '';
        this.searchPrescriptionId = '';
        this.searchPatientId = '';
    }
    // #endregion
}