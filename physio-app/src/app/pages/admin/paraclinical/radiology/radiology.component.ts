import { Component, OnInit } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { RadiologyExam } from "../../../../shared/types/radiology";

@Component({
    selector: 'admin-radiology',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
    <div class="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Page Header -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900">Radiology Department</h1>
          <p class="mt-1 text-sm text-gray-600">Manage imaging exams, schedules, and reports</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-xs font-medium text-gray-600">Total Exams</p>
                <p class="text-2xl font-semibold text-gray-900">{{getTotalExams()}}</p>
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
                <p class="text-2xl font-semibold text-gray-900">{{getExamsByStatus('scheduled')}}</p>
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
                <p class="text-2xl font-semibold text-gray-900">{{getExamsByStatus('in-progress')}}</p>
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
                <p class="text-2xl font-semibold text-gray-900">{{getExamsByStatus('completed')}}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                <svg class="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-xs font-medium text-gray-600">Reported</p>
                <p class="text-2xl font-semibold text-gray-900">{{getExamsByStatus('reported')}}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Modality Quick Access -->
        <div class="bg-white rounded-lg shadow mb-6 p-4">
          <h2 class="text-sm font-semibold text-gray-700 mb-3">Quick Access by Modality</h2>
          <div class="flex flex-wrap gap-2">
            <button
              *ngFor="let mod of modalities"
              (click)="filterByModality(mod)"
              [class.bg-blue-600]="filterModality === mod"
              [class.text-white]="filterModality === mod"
              [class.bg-gray-100]="filterModality !== mod"
              [class.text-gray-700]="filterModality !== mod"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-blue-500 hover:text-white"
            >
              {{mod}} ({{getExamsByModality(mod)}})
            </button>
            <button
              (click)="clearModalityFilter()"
              *ngIf="filterModality"
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
                (input)="filterExams()"
                placeholder="Search by patient name or ID..."
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                [(ngModel)]="filterStatus"
                (change)="filterExams()"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="reported">Reported</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                [(ngModel)]="filterPriority"
                (change)="filterExams()"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Priority</option>
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="stat">STAT</option>
              </select>
              <input
                type="date"
                [(ngModel)]="filterDate"
                (change)="filterExams()"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              (click)="openScheduleExamModal()"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Schedule Exam
            </button>
          </div>
        </div>

        <!-- Exams Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Info</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Details</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modality</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let exam of filteredExams" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{exam.patientName}}</div>
                    <div class="text-sm text-gray-500">ID: {{exam.patientId}}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">{{exam.examType}}</div>
                    <div class="text-sm text-gray-500">{{exam.bodyPart}}</div>
                    <div class="text-xs text-gray-400 mt-1">Ref: {{exam.referringPhysician}}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [ngClass]="{
                      'bg-blue-100 text-blue-800': exam.modality === 'X-Ray',
                      'bg-purple-100 text-purple-800': exam.modality === 'CT',
                      'bg-pink-100 text-pink-800': exam.modality === 'MRI',
                      'bg-cyan-100 text-cyan-800': exam.modality === 'Ultrasound',
                      'bg-rose-100 text-rose-800': exam.modality === 'Mammography',
                      'bg-indigo-100 text-indigo-800': exam.modality === 'PET'
                    }" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{exam.modality}}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{exam.examDate | date:'MM/dd/yyyy'}}</div>
                    <div class="text-xs text-gray-500">{{exam.examDate | date:'HH:mm'}}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [ngClass]="{
                      'bg-gray-100 text-gray-800': exam.priority === 'routine',
                      'bg-orange-100 text-orange-800': exam.priority === 'urgent',
                      'bg-red-100 text-red-800': exam.priority === 'stat'
                    }" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{exam.priority.toUpperCase()}}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [ngClass]="{
                      'bg-purple-100 text-purple-800': exam.status === 'scheduled',
                      'bg-yellow-100 text-yellow-800': exam.status === 'in-progress',
                      'bg-green-100 text-green-800': exam.status === 'completed',
                      'bg-indigo-100 text-indigo-800': exam.status === 'reported',
                      'bg-gray-100 text-gray-800': exam.status === 'cancelled'
                    }" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{exam.status.replace('-', ' ').toUpperCase()}}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-xs text-gray-900" *ngIf="exam.technician">
                      Tech: {{exam.technician}}
                    </div>
                    <div class="text-xs text-gray-500" *ngIf="exam.radiologist">
                      Rad: {{exam.radiologist}}
                    </div>
                    <div class="text-xs text-gray-400" *ngIf="!exam.technician && !exam.radiologist">
                      Not assigned
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex gap-2">
                      <button
                        (click)="viewImages(exam)"
                        class="text-blue-600 hover:text-blue-900"
                        title="View Images"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                      </button>
                      <button
                        (click)="viewReport(exam)"
                        class="text-green-600 hover:text-green-900"
                        [class.opacity-50]="exam.status !== 'reported'"
                        [disabled]="exam.status !== 'reported'"
                        title="View Report"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                      </button>
                      <button
                        (click)="editExam(exam)"
                        class="text-purple-600 hover:text-purple-900"
                        title="Edit"
                      >
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button
                        (click)="deleteExam(exam)"
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
                <tr *ngIf="filteredExams.length === 0">
                  <td colspan="8" class="px-6 py-8 text-center text-gray-500">
                    No radiology exams found
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
                Showing <span class="font-medium">1</span> to <span class="font-medium">{{filteredExams.length}}</span> of&#123; '&#32;' &#125;
                <span class="font-medium">{{filteredExams.length}}</span> results
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

export class AdminRadiologyComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    radiologyExams: RadiologyExam[] = [];
    filteredExams: RadiologyExam[] = [];
    searchTerm: string = '';
    filterStatus: string = '';
    filterPriority: string = '';
    filterModality: string = '';
    filterDate: string = '';
    modalities: string[] = ['X-Ray', 'CT', 'MRI', 'Ultrasound', 'Mammography', 'PET'];
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit() {
        this.initializeSampleData();
        this.filteredExams = this.radiologyExams;
    }
    // #endregion

    // #region Methods
    initializeSampleData() {
        this.radiologyExams = [
            {
                id: 'RAD001',
                patientName: 'John Doe',
                patientId: 'PT12345',
                examType: 'Chest X-Ray',
                modality: 'X-Ray',
                examDate: new Date('2024-12-20T09:00:00'),
                status: 'scheduled',
                priority: 'routine',
                referringPhysician: 'Dr. Smith',
                bodyPart: 'Chest',
                technician: 'Tech. Anderson'
            },
            {
                id: 'RAD002',
                patientName: 'Jane Smith',
                patientId: 'PT12346',
                examType: 'Brain MRI',
                modality: 'MRI',
                examDate: new Date('2024-12-20T10:30:00'),
                status: 'in-progress',
                priority: 'urgent',
                referringPhysician: 'Dr. Johnson',
                bodyPart: 'Brain',
                technician: 'Tech. Brown',
                radiologist: 'Dr. Wilson'
            },
            {
                id: 'RAD003',
                patientName: 'Robert Brown',
                patientId: 'PT12347',
                examType: 'Abdominal CT',
                modality: 'CT',
                examDate: new Date('2024-12-19T14:00:00'),
                status: 'reported',
                priority: 'routine',
                referringPhysician: 'Dr. Williams',
                bodyPart: 'Abdomen',
                technician: 'Tech. Davis',
                radiologist: 'Dr. Martinez',
                report: 'Normal findings'
            },
            {
                id: 'RAD004',
                patientName: 'Emily Davis',
                patientId: 'PT12348',
                examType: 'Pelvic Ultrasound',
                modality: 'Ultrasound',
                examDate: new Date('2024-12-20T11:00:00'),
                status: 'completed',
                priority: 'routine',
                referringPhysician: 'Dr. Taylor',
                bodyPart: 'Pelvis',
                technician: 'Tech. Garcia'
            },
            {
                id: 'RAD005',
                patientName: 'Michael Wilson',
                patientId: 'PT12349',
                examType: 'Screening Mammography',
                modality: 'Mammography',
                examDate: new Date('2024-12-20T08:30:00'),
                status: 'scheduled',
                priority: 'routine',
                referringPhysician: 'Dr. Anderson',
                bodyPart: 'Breast'
            },
            {
                id: 'RAD006',
                patientName: 'Sarah Johnson',
                patientId: 'PT12350',
                examType: 'Spine CT',
                modality: 'CT',
                examDate: new Date('2024-12-20T13:00:00'),
                status: 'in-progress',
                priority: 'stat',
                referringPhysician: 'Dr. Lee',
                bodyPart: 'Spine',
                technician: 'Tech. Miller',
                radiologist: 'Dr. Wilson'
            },
            {
                id: 'RAD007',
                patientName: 'David Martinez',
                patientId: 'PT12351',
                examType: 'PET-CT Scan',
                modality: 'PET',
                examDate: new Date('2024-12-21T09:00:00'),
                status: 'scheduled',
                priority: 'urgent',
                referringPhysician: 'Dr. Chen',
                bodyPart: 'Whole Body'
            }
        ];
    }

    filterExams() {
        this.filteredExams = this.radiologyExams.filter(exam => {
            const matchesSearch = !this.searchTerm ||
                exam.patientName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                exam.patientId.toLowerCase().includes(this.searchTerm.toLowerCase());

            const matchesStatus = !this.filterStatus || exam.status === this.filterStatus;
            const matchesPriority = !this.filterPriority || exam.priority === this.filterPriority;
            const matchesModality = !this.filterModality || exam.modality === this.filterModality;

            let matchesDate = true;
            if (this.filterDate) {
                const examDateStr = new Date(exam.examDate).toISOString().split('T')[0];
                matchesDate = examDateStr === this.filterDate;
            }

            return matchesSearch && matchesStatus && matchesPriority && matchesModality && matchesDate;
        });
    }

    getTotalExams(): number {
        return this.radiologyExams.length;
    }

    getExamsByStatus(status: string): number {
        return this.radiologyExams.filter(exam => exam.status === status).length;
    }

    getExamsByModality(modality: string): number {
        return this.radiologyExams.filter(exam => exam.modality === modality).length;
    }

    filterByModality(modality: string) {
        this.filterModality = modality;
        this.filterExams();
    }

    clearModalityFilter() {
        this.filterModality = '';
        this.filterExams();
    }

    openScheduleExamModal() {
        console.log('Open schedule exam modal');
        alert('Schedule new radiology exam functionality');
    }

    viewImages(exam: RadiologyExam) {
        console.log('View images:', exam);
        alert(`Viewing images for ${exam.examType} - ${exam.patientName}`);
    }

    viewReport(exam: RadiologyExam) {
        if (exam.status === 'reported') {
            console.log('View report:', exam);
            alert(`Radiology Report\n\nPatient: ${exam.patientName}\nExam: ${exam.examType}\n\n${exam.report || 'Report content here'}`);
        }
    }

    editExam(exam: RadiologyExam) {
        console.log('Edit exam:', exam);
        alert(`Edit exam: ${exam.examType}`);
    }

    deleteExam(exam: RadiologyExam) {
        if (confirm(`Are you sure you want to cancel ${exam.examType} for ${exam.patientName}?`)) {
            this.radiologyExams = this.radiologyExams.filter(e => e.id !== exam.id);
            this.filterExams();
        }
    }
    // #endregion
}