import { Component } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { Patient } from "../../../../shared/types/patient";

@Component({
    selector: 'admin-patient-lookup',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Search Section -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Patient Lookup</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Patient ID / Name
              </label>
              <input
                type="text"
                [(ngModel)]="searchTerm"
                (input)="filterPatients()"
                placeholder="Search by ID or name..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                [(ngModel)]="statusFilter"
                (change)="filterPatients()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Admitted">Admitted</option>
                <option value="Discharged">Discharged</option>
              </select>
            </div>
            
            <div class="flex items-end">
              <button
                (click)="resetFilters()"
                class="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        <!-- Results Section -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="text-lg font-semibold text-gray-800">
              Search Results ({{ filteredPatients.length }})
            </h3>
            <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              + Add New Patient
            </button>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient ID
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let patient of filteredPatients" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ patient.id }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ patient.name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ patient.age }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ patient.gender }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ patient.phone }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ "14-11-2025" }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      [ngClass]="{
                        'bg-green-100 text-green-800': true
                      }"
                      class="px-2 py-1 text-xs font-semibold rounded-full"
                    >
                      {{ "Active" }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900 mr-3">View</button>
                    <button class="text-green-600 hover:text-green-900 mr-3">Edit</button>
                    <button class="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
                <tr *ngIf="filteredPatients.length === 0">
                  <td colspan="8" class="px-6 py-8 text-center text-gray-500">
                    No patients found. Try adjusting your search criteria.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Showing <span class="font-medium">1</span> to <span class="font-medium">{{ filteredPatients.length }}</span> of <span class="font-medium">{{ filteredPatients.length }}</span> results
            </div>
            <div class="flex space-x-2">
              <button class="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled>
                Previous
              </button>
              <button class="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">
                1
              </button>
              <button class="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                2
              </button>
              <button class="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    `
})

export class AdminPatientLookupComponent {
    // #region Inputs, Outputs, Properties
    searchTerm: string = '';
    statusFilter: string = '';

    patients: Patient[] = [
        {
            id: 12345,
            name: 'John Smith',
            dateOfBirth: 'March 15, 1978',
            age: 45,
            gender: 'Male',
            bloodType: 'O+',
            phone: '+1 (555) 123-4567',
            email: 'john.smith@email.com',
            address: '123 Main Street, New York, NY 10001',
            emergencyContact: 'Jane Smith (Wife)',
            emergencyPhone: '+1 (555) 987-6543',
            allergies: ['Penicillin', 'Aspirin', 'Shellfish'],
            chronicConditions: ['Hypertension', 'Type 2 Diabetes']
        },
    ];

    filteredPatients: Patient[] = [...this.patients];
    // #endregion

    // #region Init (Lifecycle + Setup)

    // #endregion

    // #region Methods
    filterPatients() {

    }

    resetFilters() {
        this.searchTerm = '';
        this.statusFilter = '';
        this.filteredPatients = [...this.patients];
    }
    // #endregion
}