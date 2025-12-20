import { Component, OnInit } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { Surgery } from "../../../../shared/types/surgery";

@Component({
    selector: 'admin-surgery',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
    <div class="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Page Header -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900">Surgery Department</h1>
          <p class="mt-1 text-sm text-gray-600">Manage surgical procedures, schedules, and operating rooms</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-xs font-medium text-gray-600">Total</p>
                <p class="text-2xl font-semibold text-gray-900">{{getTotalSurgeries()}}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-xs font-medium text-gray-600">Scheduled</p>
                <p class="text-2xl font-semibold text-gray-900">{{getSurgeriesByStatus('scheduled')}}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-cyan-100 rounded-md p-3">
                <svg class="h-6 w-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-xs font-medium text-gray-600">Pre-Op</p>
                <p class="text-2xl font-semibold text-gray-900">{{getSurgeriesByStatus('pre-op')}}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-xs font-medium text-gray-600">In Progress</p>
                <p class="text-2xl font-semibold text-gray-900">{{getSurgeriesByStatus('in-progress')}}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-orange-100 rounded-md p-3">
                <svg class="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-xs font-medium text-gray-600">Post-Op</p>
                <p class="text-2xl font-semibold text-gray-900">{{getSurgeriesByStatus('post-op')}}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-green-100 rounded-md p-3">
                <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-xs font-medium text-gray-600">Completed</p>
                <p class="text-2xl font-semibold text-gray-900">{{getSurgeriesByStatus('completed')}}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Operating Room Status -->
        <div class="bg-white rounded-lg shadow mb-6 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Operating Room Status</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div *ngFor="let room of operatingRooms" 
                 [class.bg-green-50]="room.status === 'available'"
                 [class.bg-yellow-50]="room.status === 'occupied'"
                 [class.bg-red-50]="room.status === 'maintenance'"
                 class="border-2 rounded-lg p-4"
                 [class.border-green-300]="room.status === 'available'"
                 [class.border-yellow-300]="room.status === 'occupied'"
                 [class.border-red-300]="room.status === 'maintenance'">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-semibold text-gray-900">{{room.name}}</h3>
                  <p class="text-sm text-gray-600">{{room.type}}</p>
                </div>
                <div class="flex-shrink-0">
                  <span [class.bg-green-100]="room.status === 'available'"
                        [class.text-green-800]="room.status === 'available'"
                        [class.bg-yellow-100]="room.status === 'occupied'"
                        [class.text-yellow-800]="room.status === 'occupied'"
                        [class.bg-red-100]="room.status === 'maintenance'"
                        [class.text-red-800]="room.status === 'maintenance'"
                        class="px-3 py-1 text-xs font-medium rounded-full">
                    {{room.status | uppercase}}
                  </span>
                </div>
              </div>
              <p class="text-xs text-gray-500 mt-2" *ngIf="room.currentSurgery">
                Current: {{room.currentSurgery}}
              </p>
            </div>
          </div>
        </div>

        <!-- Category Quick Access -->
        <div class="bg-white rounded-lg shadow mb-6 p-4">
          <h2 class="text-sm font-semibold text-gray-700 mb-3">Quick Access by Category</h2>
          <div class="flex flex-wrap gap-2">
            <button
              *ngFor="let cat of categories"
              (click)="filterByCategory(cat)"
              [class.bg-blue-600]="filterCategory === cat"
              [class.text-white]="filterCategory === cat"
              [class.bg-gray-100]="filterCategory !== cat"
              [class.text-gray-700]="filterCategory !== cat"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-blue-500 hover:text-white"
            >
              {{cat}} ({{getSurgeriesByCategory(cat)}})
            </button>
            <button
              (click)="clearCategoryFilter()"
              *ngIf="filterCategory"
              class="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
            >
              Clear Filter
            </button>
          </div>
        </div>

        <!-- Filter and Action Bar -->
        <div class="bg-white rounded-lg shadow mb-6 p-4">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex flex-col sm:flex-row gap-3 flex-1">
              <input
                type="text"
                [(ngModel)]="searchTerm"
                (input)="filterSurgeries()"
                placeholder="Search by patient name or ID..."
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                [(ngModel)]="filterStatus"
                (change)="filterSurgeries()"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="pre-op">Pre-Op</option>
                <option value="in-progress">In Progress</option>
                <option value="post-op">Post-Op</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                [(ngModel)]="filterPriority"
                (change)="filterSurgeries()"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Priority</option>
                <option value="elective">Elective</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </select>
              <input
                type="date"
                [(ngModel)]="filterDate"
                (change)="filterSurgeries()"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              (click)="openScheduleSurgeryModal()"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Schedule Surgery
            </button>
          </div>
        </div>

        <!-- Surgeries Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Info</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Surgery Details</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medical Team</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OR</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let surgery of filteredSurgeries" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{surgery.patientName}}</div>
                    <div class="text-sm text-gray-500">ID: {{surgery.patientId}}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">{{surgery.surgeryType}}</div>
                    <div class="text-xs text-gray-500 mt-1" *ngIf="surgery.notes">{{surgery.notes}}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [ngClass]="{
                      'bg-blue-100 text-blue-800': surgery.category === 'General',
                      'bg-purple-100 text-purple-800': surgery.category === 'Orthopedic',
                      'bg-red-100 text-red-800': surgery.category === 'Cardiac',
                      'bg-pink-100 text-pink-800': surgery.category === 'Neurosurgery',
                      'bg-cyan-100 text-cyan-800': surgery.category === 'Plastic',
                      'bg-green-100 text-green-800': surgery.category === 'ENT',
                      'bg-indigo-100 text-indigo-800': surgery.category === 'Ophthalmic',
                      'bg-orange-100 text-orange-800': surgery.category === 'Vascular'
                    }" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{surgery.category}}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{surgery.scheduledDate | date:'MM/dd/yyyy'}}</div>
                    <div class="text-xs text-gray-500">{{surgery.scheduledDate | date:'HH:mm'}}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{surgery.duration}} min
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [ngClass]="{
                      'bg-gray-100 text-gray-800': surgery.priority === 'elective',
                      'bg-orange-100 text-orange-800': surgery.priority === 'urgent',
                      'bg-red-100 text-red-800': surgery.priority === 'emergency'
                    }" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{surgery.priority.toUpperCase()}}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [ngClass]="{
                      'bg-purple-100 text-purple-800': surgery.status === 'scheduled',
                      'bg-cyan-100 text-cyan-800': surgery.status === 'pre-op',
                      'bg-yellow-100 text-yellow-800': surgery.status === 'in-progress',
                      'bg-orange-100 text-orange-800': surgery.status === 'post-op',
                      'bg-green-100 text-green-800': surgery.status === 'completed',
                      'bg-gray-100 text-gray-800': surgery.status === 'cancelled'
                    }" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{surgery.status.replace('-', ' ').toUpperCase()}}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-xs text-gray-900 font-medium">{{surgery.surgeon}}</div>
                    <div class="text-xs text-gray-500" *ngIf="surgery.anesthesiologist">
                      Anes: {{surgery.anesthesiologist}}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                      {{surgery.operatingRoom}}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex gap-2">
                      <button
                        (click)="viewDetails(surgery)"
                        class="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </button>
                      <button
                        (click)="editSurgery(surgery)"
                        class="text-green-600 hover:text-green-900"
                        title="Edit"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button
                        (click)="printSchedule(surgery)"
                        class="text-purple-600 hover:text-purple-900"
                        title="Print Schedule"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                        </svg>
                      </button>
                      <button
                        (click)="cancelSurgery(surgery)"
                        class="text-red-600 hover:text-red-900"
                        title="Cancel"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredSurgeries.length === 0">
                  <td colspan="10" class="px-6 py-8 text-center text-gray-500">
                    No surgeries found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <div class="bg-white rounded-lg shadow mt-6 px-4 py-3 flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing <span class="font-medium">1</span> to <span class="font-medium">{{filteredSurgeries.length}}</span> of&#123; '&#32;' &#125;
                <span class="font-medium">{{filteredSurgeries.length}}</span> results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Previous
                </button>
                <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600">
                  1
                </button>
                <button class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
    `
})

export class AdminSurgeryComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    surgeries: Surgery[] = [];
    filteredSurgeries: Surgery[] = [];
    searchTerm: string = '';
    filterStatus: string = '';
    filterPriority: string = '';
    filterCategory: string = '';
    filterDate: string = '';
    categories: string[] = ['General', 'Orthopedic', 'Cardiac', 'Neurosurgery', 'Plastic', 'ENT', 'Ophthalmic', 'Vascular'];

    operatingRooms = [
        { name: 'OR-1', type: 'General Surgery', status: 'occupied', currentSurgery: 'Appendectomy' },
        { name: 'OR-2', type: 'Cardiac Surgery', status: 'available', currentSurgery: null },
        { name: 'OR-3', type: 'Orthopedic', status: 'occupied', currentSurgery: 'Knee Replacement' },
        { name: 'OR-4', type: 'Neurosurgery', status: 'maintenance', currentSurgery: null }
    ];
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit() {
        this.initializeSampleData();
        this.filteredSurgeries = this.surgeries;
    }
    // #endregion

    // #region Methods
    initializeSampleData() {
        this.surgeries = [
            {
                id: 'SUR001',
                patientName: 'John Doe',
                patientId: 'PT12345',
                surgeryType: 'Appendectomy',
                category: 'General',
                scheduledDate: new Date('2024-12-20T08:00:00'),
                duration: 60,
                status: 'in-progress',
                priority: 'emergency',
                surgeon: 'Dr. Smith',
                anesthesiologist: 'Dr. Brown',
                operatingRoom: 'OR-1',
                notes: 'Acute appendicitis'
            },
            {
                id: 'SUR002',
                patientName: 'Jane Smith',
                patientId: 'PT12346',
                surgeryType: 'Total Knee Replacement',
                category: 'Orthopedic',
                scheduledDate: new Date('2024-12-20T10:00:00'),
                duration: 180,
                status: 'in-progress',
                priority: 'elective',
                surgeon: 'Dr. Johnson',
                anesthesiologist: 'Dr. Davis',
                operatingRoom: 'OR-3',
                estimatedCost: 25000
            },
            {
                id: 'SUR003',
                patientName: 'Robert Brown',
                patientId: 'PT12347',
                surgeryType: 'Coronary Artery Bypass',
                category: 'Cardiac',
                scheduledDate: new Date('2024-12-20T14:00:00'),
                duration: 240,
                status: 'scheduled',
                priority: 'urgent',
                surgeon: 'Dr. Williams',
                anesthesiologist: 'Dr. Martinez',
                operatingRoom: 'OR-2',
                notes: 'Triple vessel disease',
                estimatedCost: 75000
            },
            {
                id: 'SUR004',
                patientName: 'Emily Davis',
                patientId: 'PT12348',
                surgeryType: 'Craniotomy',
                category: 'Neurosurgery',
                scheduledDate: new Date('2024-12-21T09:00:00'),
                duration: 300,
                status: 'scheduled',
                priority: 'urgent',
                surgeon: 'Dr. Taylor',
                anesthesiologist: 'Dr. Anderson',
                operatingRoom: 'OR-4',
                notes: 'Brain tumor resection',
                estimatedCost: 85000
            },
            {
                id: 'SUR005',
                patientName: 'Michael Wilson',
                patientId: 'PT12349',
                surgeryType: 'Rhinoplasty',
                category: 'Plastic',
                scheduledDate: new Date('2024-12-21T11:00:00'),
                duration: 120,
                status: 'scheduled',
                priority: 'elective',
                surgeon: 'Dr. Lee',
                anesthesiologist: 'Dr. Garcia',
                operatingRoom: 'OR-1',
                estimatedCost: 8000
            },
            {
                id: 'SUR006',
                patientName: 'Sarah Johnson',
                patientId: 'PT12350',
                surgeryType: 'Cholecystectomy',
                category: 'General',
                scheduledDate: new Date('2024-12-19T13:00:00'),
                duration: 90,
                status: 'completed',
                priority: 'elective',
                surgeon: 'Dr. Smith',
                anesthesiologist: 'Dr. Brown',
                operatingRoom: 'OR-1'
            },
            {
                id: 'SUR007',
                patientName: 'David Martinez',
                patientId: 'PT12351',
                surgeryType: 'Tonsillectomy',
                category: 'ENT',
                scheduledDate: new Date('2024-12-20T15:00:00'),
                duration: 45,
                status: 'pre-op',
                priority: 'elective',
                surgeon: 'Dr. Chen',
                anesthesiologist: 'Dr. Wilson',
                operatingRoom: 'OR-2'
            },
            {
                id: 'SUR008',
                patientName: 'Lisa Anderson',
                patientId: 'PT12352',
                surgeryType: 'Cataract Surgery',
                category: 'Ophthalmic',
                scheduledDate: new Date('2024-12-19T10:00:00'),
                duration: 30,
                status: 'completed',
                priority: 'elective',
                surgeon: 'Dr. Patel',
                operatingRoom: 'OR-3'
            },
            {
                id: 'SUR009',
                patientName: 'James Thompson',
                patientId: 'PT12353',
                surgeryType: 'Carotid Endarterectomy',
                category: 'Vascular',
                scheduledDate: new Date('2024-12-20T12:00:00'),
                duration: 150,
                status: 'post-op',
                priority: 'urgent',
                surgeon: 'Dr. Rodriguez',
                anesthesiologist: 'Dr. Martinez',
                operatingRoom: 'OR-2',
                notes: 'High-grade stenosis'
            }
        ];
    }

    filterSurgeries() {
        this.filteredSurgeries = this.surgeries.filter(surgery => {
            const matchesSearch = !this.searchTerm ||
                surgery.patientName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                surgery.patientId.toLowerCase().includes(this.searchTerm.toLowerCase());

            const matchesStatus = !this.filterStatus || surgery.status === this.filterStatus;
            const matchesPriority = !this.filterPriority || surgery.priority === this.filterPriority;
            const matchesCategory = !this.filterCategory || surgery.category === this.filterCategory;

            let matchesDate = true;
            if (this.filterDate) {
                const surgeryDateStr = new Date(surgery.scheduledDate).toISOString().split('T')[0];
                matchesDate = surgeryDateStr === this.filterDate;
            }

            return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesDate;
        });
    }

    getTotalSurgeries(): number {
        return this.surgeries.length;
    }

    getSurgeriesByStatus(status: string): number {
        return this.surgeries.filter(surgery => surgery.status === status).length;
    }

    getSurgeriesByCategory(category: string): number {
        return this.surgeries.filter(surgery => surgery.category === category).length;
    }

    filterByCategory(category: string) {
        this.filterCategory = category;
        this.filterSurgeries();
    }

    clearCategoryFilter() {
        this.filterCategory = '';
        this.filterSurgeries();
    }

    openScheduleSurgeryModal() {
        console.log('Open schedule surgery modal');
        alert('Schedule new surgery functionality');
    }

    viewDetails(surgery: Surgery) {
        console.log('View details:', surgery);
        const details = `
            Surgery Details
            ================
            Patient: ${surgery.patientName} (${surgery.patientId})
            Surgery: ${surgery.surgeryType}
            Category: ${surgery.category}
            Date: ${surgery.scheduledDate.toLocaleString()}
            Duration: ${surgery.duration} minutes
            Surgeon: ${surgery.surgeon}
            Anesthesiologist: ${surgery.anesthesiologist || 'Not assigned'}
            Operating Room: ${surgery.operatingRoom}
            Status: ${surgery.status}
            Priority: ${surgery.priority}
            ${surgery.notes ? 'Notes: ' + surgery.notes : ''}
            ${surgery.estimatedCost ? 'Estimated Cost:' + surgery.estimatedCost.toLocaleString() : ''}
    `;
        alert(details.trim());
    }

    editSurgery(surgery: Surgery) {
        console.log('Edit surgery:', surgery);
        alert(`Edit surgery: ${surgery.surgeryType} `);
    }

    printSchedule(surgery: Surgery) {
        console.log('Print schedule:', surgery);
        alert(`Printing surgery schedule for ${surgery.patientName}`);
    }

    cancelSurgery(surgery: Surgery) {
        if (confirm(`Are you sure you want to cancel ${surgery.surgeryType} for ${surgery.patientName} ? `)) {
            surgery.status = 'cancelled';
            this.filterSurgeries();
            alert('Surgery has been cancelled');
        }
    }
    // #endregion
}