import { Component, OnInit } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { LabResult } from "../../../../shared/types/lab-result";
import { Visit } from "../../../../shared/types/visit";
import { Patient } from "../../../../shared/types/patient";
import { Document } from "../../../../shared/types/document";

@Component({
    selector: 'admin-medical-record',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header with Patient Search -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-3xl font-bold text-gray-800">Medical Records</h1>
            <div class="flex items-center gap-3">
              <div class="relative">
                <input [(ngModel)]="searchQuery" 
                       type="text" 
                       placeholder="Search patient by name, ID..."
                       class="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <svg class="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>

        <!-- Patient Profile Card -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="flex items-start justify-between mb-6">
            <div class="flex items-start gap-6">
              <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-3xl font-bold text-blue-600">{{ getInitials(patient.name) }}</span>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ patient.name }}</h2>
                <div class="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <div>
                    <span class="text-gray-600">Patient ID:</span>
                    <span class="font-semibold text-gray-800 ml-2">{{ patient.id }}</span>
                  </div>
                  <div>
                    <span class="text-gray-600">Blood Type:</span>
                    <span class="font-semibold text-gray-800 ml-2">{{ patient.bloodType }}</span>
                  </div>
                  <div>
                    <span class="text-gray-600">Date of Birth:</span>
                    <span class="font-semibold text-gray-800 ml-2">{{ patient.dateOfBirth }} ({{ patient.age }}y)</span>
                  </div>
                  <div>
                    <span class="text-gray-600">Gender:</span>
                    <span class="font-semibold text-gray-800 ml-2">{{ patient.gender }}</span>
                  </div>
                  <div>
                    <span class="text-gray-600">Phone:</span>
                    <span class="font-semibold text-gray-800 ml-2">{{ patient.phone }}</span>
                  </div>
                  <div>
                    <span class="text-gray-600">Email:</span>
                    <span class="font-semibold text-gray-800 ml-2">{{ patient.email }}</span>
                  </div>
                </div>
              </div>
            </div>
            <button class="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
              Edit Profile
            </button>
          </div>

          <!-- Allergies & Chronic Conditions -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div *ngIf="patient.allergies.length > 0" 
                 class="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <h3 class="font-bold text-red-800 mb-2 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Allergies
              </h3>
              <div class="flex flex-wrap gap-2">
                <span *ngFor="let allergy of patient.allergies" 
                      class="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                  {{ allergy }}
                </span>
              </div>
            </div>
            <div *ngIf="patient.chronicConditions.length > 0" 
                 class="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
              <h3 class="font-bold text-orange-800 mb-2 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Chronic Conditions
              </h3>
              <div class="flex flex-wrap gap-2">
                <span *ngFor="let condition of patient.chronicConditions" 
                      class="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  {{ condition }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs Navigation -->
        <div class="bg-white rounded-lg shadow-md mb-6">
          <div class="border-b border-gray-200">
            <nav class="flex -mb-px">
              <button *ngFor="let tab of tabs"
                      (click)="activeTab = tab.value"
                      [class]="activeTab === tab.value 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                      class="py-4 px-6 border-b-2 font-medium text-sm transition-colors">
                {{ tab.label }}
              </button>
            </nav>
          </div>
        </div>

        <!-- Tab Content -->
        <div [ngSwitch]="activeTab">
          <!-- Visit History Tab -->
          <div *ngSwitchCase="'visits'" class="space-y-4">
            <div *ngFor="let visit of visits" class="bg-white rounded-lg shadow-md p-6">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-xl font-bold text-gray-800">{{ visit.date }}</h3>
                  <p class="text-gray-600">{{ visit.doctor }} - {{ visit.department }}</p>
                </div>
                <button class="text-blue-600 hover:text-blue-800 font-semibold">View Details</button>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 class="font-semibold text-gray-700 mb-2">Chief Complaint</h4>
                  <p class="text-gray-600">{{ visit.chiefComplaint }}</p>
                  
                  <h4 class="font-semibold text-gray-700 mt-4 mb-2">Diagnosis</h4>
                  <ul class="list-disc list-inside text-gray-600">
                    <li *ngFor="let diag of visit.diagnosis">{{ diag }}</li>
                  </ul>
                </div>
                
                <div>
                  <h4 class="font-semibold text-gray-700 mb-2">Vital Signs</h4>
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <div class="bg-gray-50 p-2 rounded">
                      <span class="text-gray-600">BP:</span>
                      <span class="font-semibold ml-1">{{ visit.vitals.bloodPressure }}</span>
                    </div>
                    <div class="bg-gray-50 p-2 rounded">
                      <span class="text-gray-600">HR:</span>
                      <span class="font-semibold ml-1">{{ visit.vitals.heartRate }} bpm</span>
                    </div>
                    <div class="bg-gray-50 p-2 rounded">
                      <span class="text-gray-600">Temp:</span>
                      <span class="font-semibold ml-1">{{ visit.vitals.temperature }}°C</span>
                    </div>
                    <div class="bg-gray-50 p-2 rounded">
                      <span class="text-gray-600">Weight:</span>
                      <span class="font-semibold ml-1">{{ visit.vitals.weight }} kg</span>
                    </div>
                  </div>
                  
                  <h4 class="font-semibold text-gray-700 mt-4 mb-2">Prescriptions</h4>
                  <div class="space-y-2">
                    <div *ngFor="let rx of visit.prescriptions" class="text-sm bg-blue-50 p-2 rounded">
                      <p class="font-semibold text-gray-800">{{ rx.medication }} {{ rx.dosage }}</p>
                      <p class="text-gray-600">{{ rx.frequency }} - {{ rx.duration }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div *ngIf="visit.notes" class="mt-4 pt-4 border-t border-gray-200">
                <h4 class="font-semibold text-gray-700 mb-2">Clinical Notes</h4>
                <p class="text-gray-600">{{ visit.notes }}</p>
              </div>
            </div>

            <div *ngIf="visits.length === 0" class="bg-white rounded-lg shadow-md p-12 text-center">
              <svg class="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="text-gray-600">No visit history available</p>
            </div>
          </div>

          <!-- Lab Results Tab -->
          <div *ngSwitchCase="'labs'" class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-gray-800">Laboratory Results</h2>
              <button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
                Request New Test
              </button>
            </div>
            
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Normal Range</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ordered By</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let lab of labResults" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ lab.date }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{{ lab.testName }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{{ lab.result }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ lab.normalRange }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span [class]="getLabStatusClass(lab.status)" 
                            class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
                        {{ lab.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ lab.orderedBy }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      <button class="text-blue-600 hover:text-blue-800 font-semibold">View Report</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Documents Tab -->
          <div *ngSwitchCase="'documents'" class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-gray-800">Medical Documents</h2>
              <button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Document
              </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div *ngFor="let doc of documents" 
                   class="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer">
                <div class="flex items-start justify-between mb-3">
                  <div class="bg-blue-100 rounded-lg p-3">
                    <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <button class="text-gray-400 hover:text-gray-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
                <h3 class="font-semibold text-gray-800 mb-1">{{ doc.name }}</h3>
                <p class="text-sm text-gray-600 mb-2">{{ doc.type }}</p>
                <div class="flex items-center justify-between text-xs text-gray-500">
                  <span>{{ doc.date }}</span>
                  <span>{{ doc.size }}</span>
                </div>
                <p class="text-xs text-gray-500 mt-2">By: {{ doc.uploadedBy }}</p>
              </div>
            </div>
          </div>

          <!-- Medications Tab -->
          <div *ngSwitchCase="'medications'" class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-bold text-gray-800 mb-6">Current Medications</h2>
            <div class="space-y-4">
              <div class="border-2 border-gray-200 rounded-lg p-4">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h3 class="text-lg font-bold text-gray-800">Lisinopril 10mg</h3>
                    <p class="text-gray-600 mb-2">Once daily - Ongoing</p>
                    <p class="text-sm text-gray-600">For: Hypertension</p>
                    <p class="text-sm text-gray-500 mt-2">Prescribed by Dr. Sarah Johnson on Jan 15, 2024</p>
                  </div>
                  <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">Active</span>
                </div>
              </div>
              <div class="border-2 border-gray-200 rounded-lg p-4">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h3 class="text-lg font-bold text-gray-800">Metformin 500mg</h3>
                    <p class="text-gray-600 mb-2">Twice daily with meals - Ongoing</p>
                    <p class="text-sm text-gray-600">For: Type 2 Diabetes</p>
                    <p class="text-sm text-gray-500 mt-2">Prescribed by Dr. Sarah Johnson on Dec 10, 2023</p>
                  </div>
                  <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `
})

export class AdminMedicalRecordComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    searchQuery: string = '';
    activeTab: string = 'visits';

    tabs = [
        { label: 'Visit History', value: 'visits' },
        { label: 'Lab Results', value: 'labs' },
        { label: 'Documents', value: 'documents' },
        { label: 'Medications', value: 'medications' }
    ];

    patient: Patient = {
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
    };

    visits: Visit[] = [
        {
            id: 1,
            date: 'December 15, 2024',
            doctor: 'Dr. Sarah Johnson',
            department: 'Cardiology',
            chiefComplaint: 'Chest pain and shortness of breath',
            diagnosis: ['Angina pectoris, unspecified', 'Hypertension'],
            prescriptions: [
                { medication: 'Nitroglycerin', dosage: '0.4mg', frequency: 'As needed', duration: '30 days' },
                { medication: 'Aspirin', dosage: '81mg', frequency: 'Once daily', duration: 'Ongoing' }
            ],
            vitals: {
                bloodPressure: '145/92',
                heartRate: 88,
                temperature: 36.8,
                weight: 82,
                height: 175,
                bmi: 26.8
            },
            notes: 'Patient reports chest discomfort during physical activity. ECG shows minor irregularities. Recommended stress test and follow-up in 2 weeks.'
        },
        {
            id: 2,
            date: 'November 10, 2024',
            doctor: 'Dr. Michael Chen',
            department: 'General Practice',
            chiefComplaint: 'Regular checkup and diabetes monitoring',
            diagnosis: ['Type 2 Diabetes, controlled'],
            prescriptions: [
                { medication: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: 'Ongoing' }
            ],
            vitals: {
                bloodPressure: '138/85',
                heartRate: 76,
                temperature: 36.6,
                weight: 83,
                height: 175,
                bmi: 27.1
            },
            notes: 'Blood glucose levels well controlled. HbA1c at 6.5%. Continue current medication regimen.'
        }
    ];

    labResults: LabResult[] = [
        { id: 1, date: '2024-12-15', testName: 'Complete Blood Count', result: 'Normal', normalRange: 'Various', status: 'normal', orderedBy: 'Dr. Sarah Johnson' },
        { id: 2, date: '2024-12-15', testName: 'Lipid Panel - Cholesterol', result: '245 mg/dL', normalRange: '<200 mg/dL', status: 'abnormal', orderedBy: 'Dr. Sarah Johnson' },
        { id: 3, date: '2024-11-10', testName: 'HbA1c', result: '6.5%', normalRange: '<5.7%', status: 'abnormal', orderedBy: 'Dr. Michael Chen' },
        { id: 4, date: '2024-11-10', testName: 'Fasting Blood Glucose', result: '110 mg/dL', normalRange: '70-100 mg/dL', status: 'abnormal', orderedBy: 'Dr. Michael Chen' },
        { id: 5, date: '2024-10-05', testName: 'Kidney Function Test', result: 'Normal', normalRange: 'Various', status: 'normal', orderedBy: 'Dr. Michael Chen' }
    ];

    documents: Document[] = [
        { id: 1, name: 'ECG Report', type: 'PDF Document', date: 'Dec 15, 2024', uploadedBy: 'Dr. Sarah Johnson', size: '2.4 MB' },
        { id: 2, name: 'Chest X-Ray', type: 'DICOM Image', date: 'Dec 15, 2024', uploadedBy: 'Radiology Dept', size: '8.1 MB' },
        { id: 3, name: 'Lab Results - Blood Work', type: 'PDF Document', date: 'Nov 10, 2024', uploadedBy: 'Laboratory', size: '1.2 MB' },
        { id: 4, name: 'Insurance Card', type: 'Image', date: 'Jan 5, 2024', uploadedBy: 'Patient', size: '0.8 MB' },
        { id: 5, name: 'Prescription History', type: 'PDF Document', date: 'Oct 20, 2024', uploadedBy: 'Pharmacy', size: '1.5 MB' }
    ];
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit() {
        // Load patient data
    }
    // #endregion

    // #region Methods
    getInitials(name: string): string {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();
    }

    getLabStatusClass(status: string): string {
        const classes = {
            'normal': 'bg-green-100 text-green-800',
            'abnormal': 'bg-yellow-100 text-yellow-800',
            'critical': 'bg-red-100 text-red-800'
        };
        return classes[status as keyof typeof classes] || '';
    }
    // #endregion
}