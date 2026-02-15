import { Component } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { Service } from "../../../../shared/types/service";

@Component({
    selector: 'admin-service',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Medical Services</h1>
          <p class="text-gray-600">Browse and manage available hospital services</p>
        </div>

        <!-- Filters and Search Bar -->
        <div class="bg-surface rounded-lg shadow-sm p-6 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Search Services</label>
              <input
                type="text"
                [(ngModel)]="searchTerm"
                (ngModelChange)="filterServices()"
                placeholder="Search by service name..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                [(ngModel)]="selectedDepartment"
                (ngModelChange)="filterServices()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Departments</option>
                <option *ngFor="let dept of departments" [value]="dept">{{ dept }}</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              <select
                [(ngModel)]="availabilityFilter"
                (ngModelChange)="filterServices()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Services</option>
                <option value="available">Available Only</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Add New Service Button -->
        <div class="mb-6 flex justify-between items-center">
          <div class="text-sm text-gray-600">
            Showing {{ filteredServices.length }} of {{ services.length }} services
          </div>
          <button
            (click)="showAddServiceModal = true"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Add New Service
          </button>
        </div>

        <!-- Services Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            *ngFor="let service of filteredServices"
            class="bg-surface rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200"
          >
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-xl font-semibold text-gray-900">{{ service.name }}</h3>
              <span
                [ngClass]="{
                  'bg-green-100 text-green-800': service.available,
                  'bg-red-100 text-red-800': !service.available
                }"
                class="px-3 py-1 rounded-full text-xs font-medium"
              >
                {{ service.available ? 'Available' : 'Unavailable' }}
              </span>
            </div>

            <p class="text-gray-600 text-sm mb-4">{{ service.description }}</p>

            <div class="space-y-2 mb-4">
              <div class="flex items-center text-sm text-gray-700">
                <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                <span class="font-medium">Department:</span>
                <span class="ml-1">{{ service.department }}</span>
              </div>

              <div class="flex items-center text-sm text-gray-700" *ngIf="service.doctor">
                <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span class="font-medium">Doctor:</span>
                <span class="ml-1">{{ service.doctor }}</span>
              </div>

              <div class="flex items-center text-sm text-gray-700">
                <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="font-medium">Duration:</span>
                <span class="ml-1">{{ service.duration }}</span>
              </div>

              <div class="flex items-center text-sm text-gray-700">
                <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="font-medium">Price:</span>
                <span class="ml-1 text-blue-600 font-semibold">\${{ service.price }}</span>
              </div>
            </div>

            <div class="flex gap-2 pt-4 border-t border-gray-200">
              <button
                (click)="editService(service)"
                class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                Edit
              </button>
              <button
                (click)="viewDetails(service)"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                View Details
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          *ngIf="filteredServices.length === 0"
          class="bg-surface rounded-lg shadow-sm p-12 text-center"
        >
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No services found</h3>
          <p class="text-gray-600">Try adjusting your filters or search terms</p>
        </div>
      </div>

      <!-- Add Service Modal -->
      <div
        *ngIf="showAddServiceModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        (click)="showAddServiceModal = false"
      >
        <div
          class="bg-surface rounded-lg max-w-2xl w-full p-6"
          (click)="$event.stopPropagation()"
        >
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Add New Service</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
              <input
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter service name"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter service description"
              ></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select Department</option>
                  <option *ngFor="let dept of departments" [value]="dept">{{ dept }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <input
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 30 minutes"
                />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                <input
                  type="number"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter price"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <select class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              </div>
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button
              (click)="showAddServiceModal = false"
              class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Add Service
            </button>
          </div>
        </div>
      </div>
    </div>
    `
})

export class AdminServiceComponent {
    // #region Inputs, Outputs, Properties
    searchTerm = '';
    selectedDepartment = '';
    availabilityFilter = 'all';
    showAddServiceModal = false;

    departments = [
        'Cardiology',
        'Neurology',
        'Orthopedics',
        'Pediatrics',
        'Radiology',
        'Emergency',
        'General Medicine',
        'Surgery'
    ];

    services: Service[] = [
        {
            id: 1,
            name: 'General Consultation',
            description: 'Comprehensive health checkup and consultation with experienced physicians',
            department: 'General Medicine',
            price: 50,
            duration: '30 minutes',
            available: true,
            doctor: 'Dr. Sarah Johnson'
        },
        {
            id: 2,
            name: 'Cardiac Screening',
            description: 'Complete heart health evaluation including ECG and stress tests',
            department: 'Cardiology',
            price: 150,
            duration: '1 hour',
            available: true,
            doctor: 'Dr. Michael Chen'
        },
        {
            id: 3,
            name: 'X-Ray Imaging',
            description: 'Digital X-ray services for accurate diagnostic imaging',
            department: 'Radiology',
            price: 80,
            duration: '20 minutes',
            available: true
        },
        {
            id: 4,
            name: 'Pediatric Care',
            description: 'Specialized care for children including vaccinations and health monitoring',
            department: 'Pediatrics',
            price: 60,
            duration: '45 minutes',
            available: true,
            doctor: 'Dr. Emily Rodriguez'
        },
        {
            id: 5,
            name: 'Orthopedic Consultation',
            description: 'Expert evaluation and treatment for bone and joint conditions',
            department: 'Orthopedics',
            price: 100,
            duration: '40 minutes',
            available: false,
            doctor: 'Dr. James Wilson'
        },
        {
            id: 6,
            name: 'MRI Scan',
            description: 'Advanced magnetic resonance imaging for detailed internal body scans',
            department: 'Radiology',
            price: 500,
            duration: '45 minutes',
            available: true
        },
        {
            id: 7,
            name: 'Emergency Care',
            description: '24/7 emergency medical services for critical conditions',
            department: 'Emergency',
            price: 200,
            duration: 'Variable',
            available: true
        },
        {
            id: 8,
            name: 'Neurological Assessment',
            description: 'Comprehensive neurological examination and cognitive testing',
            department: 'Neurology',
            price: 120,
            duration: '1 hour',
            available: true,
            doctor: 'Dr. Robert Lee'
        },
        {
            id: 9,
            name: 'Minor Surgery',
            description: 'Outpatient surgical procedures in a controlled environment',
            department: 'Surgery',
            price: 800,
            duration: '2-3 hours',
            available: false
        }
    ];

    filteredServices: Service[] = [...this.services];
    // #endregion

    // #region Methods
    filterServices() {
        this.filteredServices = this.services.filter(service => {
            const matchesSearch = service.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                service.description.toLowerCase().includes(this.searchTerm.toLowerCase());

            const matchesDepartment = !this.selectedDepartment || service.department === this.selectedDepartment;

            const matchesAvailability = this.availabilityFilter === 'all' ||
                (this.availabilityFilter === 'available' && service.available) ||
                (this.availabilityFilter === 'unavailable' && !service.available);

            return matchesSearch && matchesDepartment && matchesAvailability;
        });
    }

    editService(service: Service) {
        console.log('Edit service:', service);
        // Implement edit logic
    }

    viewDetails(service: Service) {
        console.log('View details:', service);
        // Implement view details logic
    }
    // #endregion
}