import { Component, OnInit } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";

interface Patient {
    id: number;
    queueNumber: string;
    name: string;
    age: number;
    gender: string;
    reason: string;
    arrivalTime: string;
    status: 'waiting' | 'in-consultation' | 'completed';
    priority: 'normal' | 'urgent';
}

@Component({
    selector: 'admin-doctor-desk',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
 <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header Section -->
        <div class="bg-surface rounded-lg shadow-md p-6 mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-800">Dr. {{ doctorName }}</h1>
              <p class="text-gray-600 mt-1">{{ department }} - {{ counterLocation }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600">{{ currentDate }}</p>
              <p class="text-2xl font-bold text-blue-600">{{ currentTime }}</p>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-blue-500 rounded-lg shadow p-4 text-white">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm opacity-90">Total Today</p>
                <p class="text-3xl font-bold">{{ getTotalPatients() }}</p>
              </div>
              <svg class="w-10 h-10 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>

          <div class="bg-yellow-500 rounded-lg shadow p-4 text-white">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm opacity-90">Waiting</p>
                <p class="text-3xl font-bold">{{ getWaitingCount() }}</p>
              </div>
              <svg class="w-10 h-10 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div class="bg-green-500 rounded-lg shadow p-4 text-white">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm opacity-90">Completed</p>
                <p class="text-3xl font-bold">{{ getCompletedCount() }}</p>
              </div>
              <svg class="w-10 h-10 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div class="bg-red-500 rounded-lg shadow p-4 text-white">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm opacity-90">Urgent</p>
                <p class="text-3xl font-bold">{{ getUrgentCount() }}</p>
              </div>
              <svg class="w-10 h-10 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Current Patient Panel -->
          <div class="lg:col-span-2">
            <div class="bg-surface rounded-lg shadow-md p-6 mb-6">
              <h2 class="text-xl font-bold text-gray-800 mb-4">Current Patient</h2>
              <div *ngIf="currentPatient" class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border-2 border-blue-300">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <div class="flex items-center gap-3 mb-2">
                      <span class="text-4xl font-bold text-blue-600">{{ currentPatient.queueNumber }}</span>
                      <span *ngIf="currentPatient.priority === 'urgent'" 
                            class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        URGENT
                      </span>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-800">{{ currentPatient.name }}</h3>
                    <p class="text-gray-600">{{ currentPatient.age }} years old • {{ currentPatient.gender }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm text-gray-600">Arrival Time</p>
                    <p class="text-lg font-semibold text-gray-800">{{ currentPatient.arrivalTime }}</p>
                  </div>
                </div>
                <div class="bg-surface rounded p-4 mb-4">
                  <p class="text-sm text-gray-600 mb-1">Chief Complaint</p>
                  <p class="text-gray-800 font-medium">{{ currentPatient.reason }}</p>
                </div>
                <div class="flex gap-3">
                  <button (click)="completeConsultation()" 
                          class="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                    Complete Consultation
                  </button>
                  <button (click)="skipPatient()" 
                          class="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                    Skip
                  </button>
                </div>
              </div>
              <div *ngIf="!currentPatient" class="text-center py-12 bg-gray-50 rounded-lg">
                <svg class="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p class="text-gray-600 text-lg">No patient in consultation</p>
                <button (click)="callNextPatient()" 
                        class="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
                  Call Next Patient
                </button>
              </div>
            </div>

            <!-- Patient History (Optional) -->
            <div class="bg-surface rounded-lg shadow-md p-6">
              <h2 class="text-xl font-bold text-gray-800 mb-4">Today's Completed</h2>
              <div class="space-y-2 max-h-64 overflow-y-auto">
                <div *ngFor="let patient of getCompletedPatients()" 
                     class="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                  <div class="flex items-center gap-3">
                    <span class="font-bold text-gray-700">{{ patient.queueNumber }}</span>
                    <span class="text-gray-800">{{ patient.name }}</span>
                  </div>
                  <span class="text-sm text-gray-600">{{ patient.arrivalTime }}</span>
                </div>
                <div *ngIf="getCompletedPatients().length === 0" class="text-center py-6 text-gray-500">
                  No completed consultations yet
                </div>
              </div>
            </div>
          </div>

          <!-- Queue List Panel -->
          <div class="lg:col-span-1">
            <div class="bg-surface rounded-lg shadow-md p-6 sticky top-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-gray-800">Waiting Queue</h2>
                <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {{ getWaitingCount() }}
                </span>
              </div>
              
              <div class="space-y-3 max-h-[600px] overflow-y-auto">
                <div *ngFor="let patient of getWaitingPatients(); let i = index" 
                     class="p-4 rounded-lg border-2 transition-all cursor-pointer"
                     [class.border-blue-300]="i === 0"
                     [class.bg-blue-50]="i === 0"
                     [class.border-gray-200]="i !== 0"
                     [class.hover:border-blue-200]="i !== 0"
                     (click)="selectPatient(patient)">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <span class="text-2xl font-bold" 
                            [class.text-blue-600]="i === 0"
                            [class.text-gray-700]="i !== 0">
                        {{ patient.queueNumber }}
                      </span>
                      <span *ngIf="patient.priority === 'urgent'" 
                            class="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-semibold">
                        URGENT
                      </span>
                    </div>
                    <span class="text-xs text-gray-500">{{ patient.arrivalTime }}</span>
                  </div>
                  <p class="font-semibold text-gray-800 mb-1">{{ patient.name }}</p>
                  <p class="text-sm text-gray-600">{{ patient.age }}y • {{ patient.gender }}</p>
                  <p class="text-sm text-gray-700 mt-2 line-clamp-2">{{ patient.reason }}</p>
                  <button *ngIf="i === 0" 
                          (click)="callThisPatient(patient); $event.stopPropagation()"
                          class="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors">
                    Call Patient
                  </button>
                </div>
                
                <div *ngIf="getWaitingPatients().length === 0" class="text-center py-8">
                  <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-gray-500">No patients waiting</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,
    styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})

export class AdminDoctorDeskComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    doctorName: string = 'Sarah Johnson';
    department: string = 'General Practice';
    counterLocation: string = 'Counter 3';
    currentTime: string = '';
    currentDate: string = '';

    currentPatient: Patient | null = null;

    patients: Patient[] = [
        { id: 1, queueNumber: 'A025', name: 'John Smith', age: 45, gender: 'Male', reason: 'Chest pain and shortness of breath', arrivalTime: '09:15', status: 'waiting', priority: 'urgent' },
        { id: 2, queueNumber: 'A026', name: 'Maria Garcia', age: 32, gender: 'Female', reason: 'Regular checkup and blood pressure monitoring', arrivalTime: '09:30', status: 'waiting', priority: 'normal' },
        { id: 3, queueNumber: 'A027', name: 'David Lee', age: 28, gender: 'Male', reason: 'Persistent cough for 2 weeks', arrivalTime: '09:45', status: 'waiting', priority: 'normal' },
        { id: 4, queueNumber: 'A028', name: 'Emily Brown', age: 55, gender: 'Female', reason: 'Diabetes follow-up consultation', arrivalTime: '10:00', status: 'waiting', priority: 'normal' },
        { id: 5, queueNumber: 'A029', name: 'James Wilson', age: 38, gender: 'Male', reason: 'Severe migraine headache', arrivalTime: '10:15', status: 'waiting', priority: 'urgent' },
        { id: 6, queueNumber: 'A023', name: 'Lisa Anderson', age: 42, gender: 'Female', reason: 'Annual physical examination', arrivalTime: '08:45', status: 'completed', priority: 'normal' },
        { id: 7, queueNumber: 'A024', name: 'Robert Taylor', age: 50, gender: 'Male', reason: 'Back pain treatment', arrivalTime: '09:00', status: 'completed', priority: 'normal' }
    ];

    private timeInterval: any;
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit() {
        this.updateTime();
        this.timeInterval = setInterval(() => {
            this.updateTime();
        }, 1000);
    }

    ngOnDestroy() {
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
    }
    // #endregion

    // #region Methods
    updateTime() {
        const now = new Date();
        this.currentTime = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        this.currentDate = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    getTotalPatients(): number {
        return this.patients.length;
    }

    getWaitingCount(): number {
        return this.patients.filter(p => p.status === 'waiting').length;
    }

    getCompletedCount(): number {
        return this.patients.filter(p => p.status === 'completed').length;
    }

    getUrgentCount(): number {
        return this.patients.filter(p => p.priority === 'urgent' && p.status === 'waiting').length;
    }

    getWaitingPatients(): Patient[] {
        return this.patients.filter(p => p.status === 'waiting')
            .sort((a, b) => {
                // Urgent patients first
                if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
                if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
                return 0;
            });
    }

    getCompletedPatients(): Patient[] {
        return this.patients.filter(p => p.status === 'completed');
    }

    callNextPatient() {
        const waiting = this.getWaitingPatients();
        if (waiting.length > 0) {
            this.currentPatient = waiting[0];
            this.currentPatient.status = 'in-consultation';
            // In production: call API to update queue display
            // this.updateQueueDisplay(this.currentPatient);
        }
    }

    callThisPatient(patient: Patient) {
        this.currentPatient = patient;
        patient.status = 'in-consultation';
        // In production: call API to update queue display
    }

    selectPatient(patient: Patient) {
        // Show patient details or preview
        console.log('Selected patient:', patient);
    }

    completeConsultation() {
        if (this.currentPatient) {
            this.currentPatient.status = 'completed';
            this.currentPatient = null;
            // In production: save consultation data to API
        }
    }

    skipPatient() {
        if (this.currentPatient) {
            this.currentPatient.status = 'waiting';
            this.currentPatient = null;
            // In production: update queue order in API
        }
    }
    // #endregion
}