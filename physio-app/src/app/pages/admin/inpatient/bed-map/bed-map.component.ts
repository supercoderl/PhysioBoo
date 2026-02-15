import { Component } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { Bed } from "../../../../shared/types/bed";
import { Ward } from "../../../../shared/types/ward";

@Component({
    selector: 'admin-bed-map',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
        <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header Section -->
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">Bed Management System</h2>
          <p class="text-gray-600">Real-time bed occupancy and availability</p>
        </div>

        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-surface rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">Total Beds</p>
                <p class="text-3xl font-bold text-gray-800">{{ getTotalBeds() }}</p>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-surface rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">Available</p>
                <p class="text-3xl font-bold text-green-600">{{ getAvailableBeds() }}</p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-surface rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">Occupied</p>
                <p class="text-3xl font-bold text-red-600">{{ getOccupiedBeds() }}</p>
              </div>
              <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-surface rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">Occupancy Rate</p>
                <p class="text-3xl font-bold text-purple-600">{{ getOccupancyRate() }}%</p>
              </div>
              <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-surface rounded-lg shadow-md p-4 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Ward</label>
              <select [(ngModel)]="selectedWard" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">All Wards</option>
                <option *ngFor="let ward of wards" [value]="ward.id">{{ ward.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select [(ngModel)]="selectedStatus" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">All Status</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Reserved">Reserved</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Floor</label>
              <select [(ngModel)]="selectedFloor" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">All Floors</option>
                <option value="1">1st Floor</option>
                <option value="2">2nd Floor</option>
                <option value="3">3rd Floor</option>
              </select>
            </div>
            <div class="flex items-end">
              <button class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div class="bg-surface rounded-lg shadow-md p-4 mb-6">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Bed Status Legend</h3>
          <div class="flex flex-wrap gap-4">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-green-500 rounded mr-2"></div>
              <span class="text-sm text-gray-700">Available</span>
            </div>
            <div class="flex items-center">
              <div class="w-8 h-8 bg-red-500 rounded mr-2"></div>
              <span class="text-sm text-gray-700">Occupied</span>
            </div>
            <div class="flex items-center">
              <div class="w-8 h-8 bg-yellow-500 rounded mr-2"></div>
              <span class="text-sm text-gray-700">Maintenance</span>
            </div>
            <div class="flex items-center">
              <div class="w-8 h-8 bg-blue-500 rounded mr-2"></div>
              <span class="text-sm text-gray-700">Reserved</span>
            </div>
          </div>
        </div>

        <!-- Ward Cards with Bed Maps -->
        <div class="space-y-6">
          <div *ngFor="let ward of getFilteredWards()" class="bg-surface rounded-lg shadow-md overflow-hidden">
            <div class="bg-gray-100 px-6 py-4 border-b border-gray-200">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="text-lg font-semibold text-gray-800">{{ ward.name }}</h3>
                  <p class="text-sm text-gray-600">Floor {{ ward.floor }} • {{ ward.availableBeds }} of {{ ward.totalBeds }} beds available</p>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="text-right mr-4">
                    <div class="text-sm text-gray-600">Occupancy</div>
                    <div class="text-lg font-bold text-gray-800">{{ getWardOccupancyRate(ward) }}%</div>
                  </div>
                  <div class="w-16 h-16">
                    <svg class="transform -rotate-90 w-16 h-16">
                      <circle cx="32" cy="32" r="28" stroke="#e5e7eb" stroke-width="8" fill="none" />
                      <circle cx="32" cy="32" r="28" [attr.stroke]="getWardOccupancyRate(ward) > 80 ? '#ef4444' : getWardOccupancyRate(ward) > 50 ? '#f59e0b' : '#10b981'" stroke-width="8" fill="none" [attr.stroke-dasharray]="175.93" [attr.stroke-dashoffset]="175.93 - (175.93 * getWardOccupancyRate(ward) / 100)" stroke-linecap="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div class="p-6">
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <div *ngFor="let bed of getFilteredBeds(ward)" 
                     (click)="selectBed(bed)"
                     [ngClass]="{
                       'bg-green-500 hover:bg-green-600': bed.status === 'Available',
                       'bg-red-500 hover:bg-red-600': bed.status === 'Occupied',
                       'bg-yellow-500 hover:bg-yellow-600': bed.status === 'Maintenance',
                       'bg-blue-500 hover:bg-blue-600': bed.status === 'Reserved'
                     }"
                     class="cursor-pointer transition-all transform hover:scale-105 rounded-lg p-4 text-white shadow-md">
                  <div class="text-center">
                    <div class="font-bold text-lg mb-1">{{ bed.number }}</div>
                    <div class="text-xs opacity-90">{{ bed.status }}</div>
                    <div *ngIf="bed.patientName" class="text-xs mt-2 opacity-90 truncate">{{ bed.patientName }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected Bed Details Modal (appears when bed is clicked) -->
        <div *ngIf="selectedBedDetails" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-surface rounded-lg shadow-xl max-w-md w-full p-6">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-xl font-bold text-gray-800">Bed Details</h3>
              <button (click)="closeBedDetails()" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div class="space-y-3">
              <div class="flex justify-between py-2 border-b border-gray-200">
                <span class="text-gray-600">Bed Number:</span>
                <span class="font-semibold text-gray-800">{{ selectedBedDetails.number }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-gray-200">
                <span class="text-gray-600">Status:</span>
                <span 
                  [ngClass]="{
                    'bg-green-100 text-green-800': selectedBedDetails.status === 'Available',
                    'bg-red-100 text-red-800': selectedBedDetails.status === 'Occupied',
                    'bg-yellow-100 text-yellow-800': selectedBedDetails.status === 'Maintenance',
                    'bg-blue-100 text-blue-800': selectedBedDetails.status === 'Reserved'
                  }"
                  class="px-3 py-1 rounded-full text-sm font-semibold">
                  {{ selectedBedDetails.status }}
                </span>
              </div>
              <div *ngIf="selectedBedDetails.patientName" class="flex justify-between py-2 border-b border-gray-200">
                <span class="text-gray-600">Patient Name:</span>
                <span class="font-semibold text-gray-800">{{ selectedBedDetails.patientName }}</span>
              </div>
              <div *ngIf="selectedBedDetails.patientId" class="flex justify-between py-2 border-b border-gray-200">
                <span class="text-gray-600">Patient ID:</span>
                <span class="font-semibold text-gray-800">{{ selectedBedDetails.patientId }}</span>
              </div>
              <div *ngIf="selectedBedDetails.admissionDate" class="flex justify-between py-2 border-b border-gray-200">
                <span class="text-gray-600">Admission Date:</span>
                <span class="font-semibold text-gray-800">{{ selectedBedDetails.admissionDate }}</span>
              </div>
            </div>

            <div class="mt-6 flex space-x-3">
              <button *ngIf="selectedBedDetails.status === 'Available'" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Assign Patient
              </button>
              <button *ngIf="selectedBedDetails.status === 'Occupied'" class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Discharge Patient
              </button>
              <button class="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                View History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    `
})

export class AdminBedMapComponent {
    // #region Inputs, Outputs, Properties
    selectedWard: string = '';
    selectedStatus: string = '';
    selectedFloor: string = '';
    selectedBedDetails: Bed | null = null;

    wards: Ward[] = [
        {
            id: 'W001',
            name: 'General Ward A',
            floor: 1,
            totalBeds: 20,
            availableBeds: 8,
            beds: this.generateBeds(20, 'General Ward A', 1)
        },
        {
            id: 'W002',
            name: 'ICU',
            floor: 2,
            totalBeds: 12,
            availableBeds: 2,
            beds: this.generateBeds(12, 'ICU', 2)
        },
        {
            id: 'W003',
            name: 'Pediatric Ward',
            floor: 1,
            totalBeds: 18,
            availableBeds: 10,
            beds: this.generateBeds(18, 'Pediatric Ward', 3)
        },
        {
            id: 'W004',
            name: 'Surgical Ward',
            floor: 3,
            totalBeds: 16,
            availableBeds: 5,
            beds: this.generateBeds(16, 'Surgical Ward', 4)
        }
    ];
    // #endregion

    // #region Methods
    generateBeds(count: number, wardType: string, seed: number): Bed[] {
        const beds: Bed[] = [];
        const statuses: ('Available' | 'Occupied' | 'Maintenance' | 'Reserved')[] = ['Available', 'Occupied', 'Maintenance', 'Reserved'];
        const patients = ['John Doe', 'Jane Smith', 'Robert Brown', 'Emily Davis', 'Michael Wilson'];

        for (let i = 1; i <= count; i++) {
            const statusIndex = (i + seed) % 4;
            const status = statuses[statusIndex];
            const bed: Bed = {
                id: `B${seed}${i.toString().padStart(2, '0')}`,
                number: `${i.toString().padStart(2, '0')}`,
                status: status,
                wardType: wardType
            };

            if (status === 'Occupied') {
                bed.patientName = patients[(i + seed) % patients.length];
                bed.patientId = `P${(1000 + i + seed)}`;
                bed.admissionDate = `2024-12-${(10 + (i % 10)).toString().padStart(2, '0')}`;
            }

            beds.push(bed);
        }
        return beds;
    }

    getTotalBeds(): number {
        return this.wards.reduce((sum, ward) => sum + ward.totalBeds, 0);
    }

    getAvailableBeds(): number {
        return this.wards.reduce((sum, ward) => {
            return sum + ward.beds.filter(bed => bed.status === 'Available').length;
        }, 0);
    }

    getOccupiedBeds(): number {
        return this.wards.reduce((sum, ward) => {
            return sum + ward.beds.filter(bed => bed.status === 'Occupied').length;
        }, 0);
    }

    getOccupancyRate(): number {
        const total = this.getTotalBeds();
        const occupied = this.getOccupiedBeds();
        return total > 0 ? Math.round((occupied / total) * 100) : 0;
    }

    getWardOccupancyRate(ward: Ward): number {
        const occupied = ward.beds.filter(bed => bed.status === 'Occupied').length;
        return ward.totalBeds > 0 ? Math.round((occupied / ward.totalBeds) * 100) : 0;
    }

    getFilteredWards(): Ward[] {
        let filtered = this.wards;
        if (this.selectedWard) {
            filtered = filtered.filter(w => w.id === this.selectedWard);
        }
        if (this.selectedFloor) {
            filtered = filtered.filter(w => w.floor === parseInt(this.selectedFloor));
        }
        return filtered;
    }

    getFilteredBeds(ward: Ward): Bed[] {
        let beds = ward.beds;
        if (this.selectedStatus) {
            beds = beds.filter(bed => bed.status === this.selectedStatus);
        }
        return beds;
    }

    selectBed(bed: Bed): void {
        this.selectedBedDetails = bed;
    }

    closeBedDetails(): void {
        this.selectedBedDetails = null;
    }
    // #endregion
}