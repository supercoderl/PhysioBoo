import { Component, OnInit } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { LabTest } from "../../../../shared/types/lab-test";

@Component({
    selector: 'admin-laboratory',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
    <div class="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Page Header -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900">Laboratory Management</h1>
          <p class="mt-1 text-sm text-gray-600">Manage lab tests, samples, and results</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-surface rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Tests</p>
                <p class="text-2xl font-semibold text-gray-900">{{getTotalTests()}}</p>
              </div>
            </div>
          </div>

          <div class="bg-surface rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Pending</p>
                <p class="text-2xl font-semibold text-gray-900">{{getTestsByStatus('pending')}}</p>
              </div>
            </div>
          </div>

          <div class="bg-surface rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">In Progress</p>
                <p class="text-2xl font-semibold text-gray-900">{{getTestsByStatus('in-progress')}}</p>
              </div>
            </div>
          </div>

          <div class="bg-surface rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-green-100 rounded-md p-3">
                <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Completed</p>
                <p class="text-2xl font-semibold text-gray-900">{{getTestsByStatus('completed')}}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Filter and Action Bar -->
        <div class="bg-surface rounded-lg shadow mb-6 p-4">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex flex-col sm:flex-row gap-3 flex-1">
              <input
                type="text"
                [(ngModel)]="searchTerm"
                (input)="filterTests()"
                placeholder="Search by patient name or ID..."
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                [(ngModel)]="filterStatus"
                (change)="filterTests()"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                [(ngModel)]="filterPriority"
                (change)="filterTests()"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Priority</option>
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="stat">STAT</option>
              </select>
            </div>
            <button
              (click)="openAddTestModal()"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              New Lab Test
            </button>
          </div>
        </div>

        <!-- Tests Table -->
        <div class="bg-surface rounded-lg shadow overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Info</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordered By</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-surface divide-y divide-gray-200">
                <tr *ngFor="let test of filteredTests" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{test.patientName}}</div>
                    <div class="text-sm text-gray-500">ID: {{test.patientId}}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{test.testType}}</div>
                    <div class="text-sm text-gray-500">{{test.department}}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{test.testDate | date:'MM/dd/yyyy'}}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [ngClass]="{
                      'bg-gray-100 text-gray-800': test.priority === 'routine',
                      'bg-orange-100 text-orange-800': test.priority === 'urgent',
                      'bg-red-100 text-red-800': test.priority === 'stat'
                    }" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{test.priority.toUpperCase()}}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [ngClass]="{
                      'bg-yellow-100 text-yellow-800': test.status === 'pending',
                      'bg-blue-100 text-blue-800': test.status === 'in-progress',
                      'bg-green-100 text-green-800': test.status === 'completed',
                      'bg-gray-100 text-gray-800': test.status === 'cancelled'
                    }" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{test.status.replace('-', ' ').toUpperCase()}}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{test.orderedBy}}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex gap-2">
                      <button
                        (click)="viewTest(test)"
                        class="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </button>
                      <button
                        (click)="editTest(test)"
                        class="text-green-600 hover:text-green-900"
                        title="Edit"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button
                        (click)="deleteTest(test)"
                        class="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredTests.length === 0">
                  <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                    No lab tests found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <div class="bg-surface rounded-lg shadow mt-6 px-4 py-3 flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-surface hover:bg-gray-50">
              Previous
            </button>
            <button class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-surface hover:bg-gray-50">
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing <span class="font-medium">1</span> to <span class="font-medium">{{filteredTests.length}}</span> of&#123; '&#32;' &#125;
                <span class="font-medium">{{filteredTests.length}}</span> results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-surface text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Previous
                </button>
                <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600">
                  1
                </button>
                <button class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-surface text-sm font-medium text-gray-500 hover:bg-gray-50">
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

export class AdminLaboratoryComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    labTests: LabTest[] = [];
    filteredTests: LabTest[] = [];
    searchTerm: string = '';
    filterStatus: string = '';
    filterPriority: string = '';
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit() {
        this.initializeSampleData();
        this.filteredTests = this.labTests;
    }
    // #endregion

    // #region Methods
    initializeSampleData() {
        this.labTests = [
            {
                id: 'LAB001',
                patientName: 'John Doe',
                patientId: 'PT12345',
                testType: 'Complete Blood Count',
                testDate: new Date('2024-12-20'),
                status: 'pending',
                priority: 'routine',
                orderedBy: 'Dr. Smith',
                department: 'Hematology'
            },
            {
                id: 'LAB002',
                patientName: 'Jane Smith',
                patientId: 'PT12346',
                testType: 'Lipid Panel',
                testDate: new Date('2024-12-20'),
                status: 'in-progress',
                priority: 'urgent',
                orderedBy: 'Dr. Johnson',
                department: 'Biochemistry'
            },
            {
                id: 'LAB003',
                patientName: 'Robert Brown',
                patientId: 'PT12347',
                testType: 'Liver Function Test',
                testDate: new Date('2024-12-19'),
                status: 'completed',
                priority: 'routine',
                orderedBy: 'Dr. Williams',
                department: 'Biochemistry',
                results: 'Normal'
            },
            {
                id: 'LAB004',
                patientName: 'Emily Davis',
                patientId: 'PT12348',
                testType: 'Urinalysis',
                testDate: new Date('2024-12-20'),
                status: 'pending',
                priority: 'stat',
                orderedBy: 'Dr. Martinez',
                department: 'Pathology'
            },
            {
                id: 'LAB005',
                patientName: 'Michael Wilson',
                patientId: 'PT12349',
                testType: 'Blood Culture',
                testDate: new Date('2024-12-19'),
                status: 'in-progress',
                priority: 'urgent',
                orderedBy: 'Dr. Anderson',
                department: 'Microbiology'
            }
        ];
    }

    filterTests() {
        this.filteredTests = this.labTests.filter(test => {
            const matchesSearch = !this.searchTerm ||
                test.patientName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                test.patientId.toLowerCase().includes(this.searchTerm.toLowerCase());

            const matchesStatus = !this.filterStatus || test.status === this.filterStatus;
            const matchesPriority = !this.filterPriority || test.priority === this.filterPriority;

            return matchesSearch && matchesStatus && matchesPriority;
        });
    }

    getTotalTests(): number {
        return this.labTests.length;
    }

    getTestsByStatus(status: string): number {
        return this.labTests.filter(test => test.status === status).length;
    }

    openAddTestModal() {
        console.log('Open add test modal');
        alert('Add new lab test functionality');
    }

    viewTest(test: LabTest) {
        console.log('View test:', test);
        alert(`Viewing test: ${test.testType} for ${test.patientName}`);
    }

    editTest(test: LabTest) {
        console.log('Edit test:', test);
        alert(`Edit test: ${test.testType}`);
    }

    deleteTest(test: LabTest) {
        if (confirm(`Are you sure you want to delete ${test.testType} for ${test.patientName}?`)) {
            this.labTests = this.labTests.filter(t => t.id !== test.id);
            this.filterTests();
        }
    }
    // #endregion
}