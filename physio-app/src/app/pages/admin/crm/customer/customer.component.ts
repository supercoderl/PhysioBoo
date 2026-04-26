import { Component } from "@angular/core";
import { PatientType } from "../../../../shared/enums/patient";
import { SharedModule } from "../../../../shared/shared-imports";
import { Allergy } from "../../../../shared/types/allergy";
import { Appointment } from "../../../../shared/types/appointment";
import { Document } from "../../../../shared/types/document";
import { LabResult } from "../../../../shared/types/lab-result";
import { Medication } from "../../../../shared/types/medication";
import { PatientProfile } from "../../../../shared/types/patient";
import { Visit } from "../../../../shared/types/visit";

@Component({
  selector: 'admin-customer-360',
  standalone: true,
  imports: [
    SharedModule
  ],
  template: `
<div class="patient-360-container bg-gray-50 min-h-screen p-6">
  <div class="max-w-7xl mx-auto">
    
    <!-- Header Section -->
    <div class="bg-surface rounded-lg shadow-md p-6 mb-6">
      <div class="flex items-start justify-between">
        <div class="flex items-start space-x-6">
          <!-- Patient Photo -->

          
          <!-- Patient Basic Info -->

        </div>
        
        <!-- Quick Actions -->
        <div class="flex flex-col space-y-2">
          <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Edit Profile
          </button>
          <button (click)="scheduleAppointment()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            New Appointment
          </button>
          <button class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Print Summary
          </button>
        </div>
      </div>
    </div>

    <!-- Alert Section - Allergies -->
    <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg" *ngIf="allergies.length > 0">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-bold text-red-800">Known Allergies:</h3>
          <div class="mt-1 text-sm text-red-700">
            <span *ngFor="let allergy of allergies; let last = last">
              <span class="font-semibold">{{ allergy.allergen }}</span> ({{ allergy.severity }}){{ last ? '' : ', ' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="bg-surface rounded-lg shadow-md mb-6">
      <div class="border-b border-gray-200">
        <nav class="flex -mb-px">
          <button 
            (click)="setActiveTab('overview')"
            [class]="activeTab === 'overview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="py-4 px-6 border-b-2 font-medium text-sm transition-colors">
            Overview
          </button>
          <button 
            (click)="setActiveTab('visits')"
            [class]="activeTab === 'visits' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="py-4 px-6 border-b-2 font-medium text-sm transition-colors">
            Visit History
          </button>
          <button 
            (click)="setActiveTab('medications')"
            [class]="activeTab === 'medications' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="py-4 px-6 border-b-2 font-medium text-sm transition-colors">
            Medications
          </button>
          <button 
            (click)="setActiveTab('labs')"
            [class]="activeTab === 'labs' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="py-4 px-6 border-b-2 font-medium text-sm transition-colors">
            Lab Results
          </button>
          <button 
            (click)="setActiveTab('appointments')"
            [class]="activeTab === 'appointments' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="py-4 px-6 border-b-2 font-medium text-sm transition-colors">
            Appointments
          </button>
          <button 
            (click)="setActiveTab('documents')"
            [class]="activeTab === 'documents' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
            class="py-4 px-6 border-b-2 font-medium text-sm transition-colors">
            Documents
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="p-6">
        
        <!-- Overview Tab -->
        <div *ngIf="activeTab === 'overview'">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Vital Signs -->
            <div class="lg:col-span-2">
              <h3 class="text-lg font-bold text-gray-900 mb-4">Current Vital Signs</h3>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div class="bg-blue-50 p-4 rounded-lg">
                  <p class="text-sm text-gray-600 mb-1">Blood Pressure</p>
                  <p class="text-2xl font-bold text-blue-700">{{ vitalSigns.bloodPressure }}</p>
                  <p class="text-xs text-gray-500">mmHg</p>
                </div>
                <div class="bg-red-50 p-4 rounded-lg">
                  <p class="text-sm text-gray-600 mb-1">Heart Rate</p>
                  <p class="text-2xl font-bold text-red-700">{{ vitalSigns.heartRate }}</p>
                  <p class="text-xs text-gray-500">bpm</p>
                </div>
                <div class="bg-yellow-50 p-4 rounded-lg">
                  <p class="text-sm text-gray-600 mb-1">Temperature</p>
                  <p class="text-2xl font-bold text-yellow-700">{{ vitalSigns.temperature }}</p>
                  <p class="text-xs text-gray-500">°F</p>
                </div>
                <div class="bg-green-50 p-4 rounded-lg">
                  <p class="text-sm text-gray-600 mb-1">Weight</p>
                  <p class="text-2xl font-bold text-green-700">{{ vitalSigns.weight }}</p>
                  <p class="text-xs text-gray-500">lbs</p>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg">
                  <p class="text-sm text-gray-600 mb-1">Height</p>
                  <p class="text-2xl font-bold text-purple-700">{{ vitalSigns.height }}</p>
                  <p class="text-xs text-gray-500">ft</p>
                </div>
                <div class="bg-indigo-50 p-4 rounded-lg">
                  <p class="text-sm text-gray-600 mb-1">BMI</p>
                  <p class="text-2xl font-bold text-indigo-700">{{ vitalSigns.bmi }}</p>
                  <p class="text-xs text-gray-500">kg/m²</p>
                </div>
              </div>

              <!-- Recent Activity -->
              <div class="mt-6">
                <h3 class="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                <div class="space-y-3">
                  <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div class="flex-shrink-0 w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
                    <div class="flex-1">
                      <p class="text-sm font-medium text-gray-900">Visit Completed</p>
                      <p class="text-xs text-gray-600">General Medicine - Dr. Sarah Johnson</p>
                      <p class="text-xs text-gray-500">Dec 15, 2024</p>
                    </div>
                  </div>
                  <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div class="flex-shrink-0 w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                    <div class="flex-1">
                      <p class="text-sm font-medium text-gray-900">Lab Results Available</p>
                      <p class="text-xs text-gray-600">Blood Test - 4 results</p>
                      <p class="text-xs text-gray-500">Dec 10, 2024</p>
                    </div>
                  </div>
                  <div class="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div class="flex-shrink-0 w-2 h-2 mt-2 bg-purple-500 rounded-full"></div>
                    <div class="flex-1">
                      <p class="text-sm font-medium text-gray-900">Appointment Scheduled</p>
                      <p class="text-xs text-gray-600">Cardiology - Dr. Michael Chen</p>
                      <p class="text-xs text-gray-500">Dec 28, 2024 at 10:00 AM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Info Sidebar -->
            <div class="space-y-6">
              
              <!-- Contact Information -->
              

              <!-- Active Medications -->
              <div class="bg-yellow-50 p-4 rounded-lg">
                <h3 class="text-sm font-bold text-gray-900 mb-3">Active Medications</h3>
                <div class="space-y-2">
                  <div *ngFor="let med of medications.slice(0, 3)" class="text-sm">
                    <p class="font-medium text-gray-800">{{ med.name }}</p>
                    <p class="text-gray-600 text-xs">{{ med.dosage }} - {{ med.frequency }}</p>
                  </div>
                </div>
                <button (click)="setActiveTab('medications')" class="mt-3 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                  View All →
                </button>
              </div>

              <!-- Upcoming Appointments -->
              <div class="bg-blue-50 p-4 rounded-lg">
                <h3 class="text-sm font-bold text-gray-900 mb-3">Upcoming Appointments</h3>
                <div class="space-y-2">
                  <div *ngFor="let apt of appointments.slice(0, 2)" class="text-sm">
                    <p class="font-medium text-gray-800">{{ apt.doctor }}</p>
                    <p class="text-gray-600 text-xs">{{ apt.date }} at {{ apt.time }}</p>
                  </div>
                </div>
                <button (click)="setActiveTab('appointments')" class="mt-3 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                  View All →
                </button>
              </div>

            </div>
          </div>
        </div>

        <!-- Visit History Tab -->
        <div *ngIf="activeTab === 'visits'">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Visit History</h3>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Visit ID</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Doctor</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Department</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Diagnosis</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr *ngFor="let visit of visits" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-900">{{ visit.id }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ visit.date }}</td>
                  <td class="px-4 py-3 text-sm text-gray-900">{{ visit.doctor }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ visit.department }}</td>
                  <td class="px-4 py-3 text-sm text-gray-900">{{ visit.diagnosis }}</td>
                  <td class="px-4 py-3">
                    <span class="px-2 py-1 text-xs font-medium rounded-full">
                      asd
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm">
                    <button class="text-indigo-600 hover:text-indigo-700 font-medium">View Details</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Medications Tab -->
        <div *ngIf="activeTab === 'medications'">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-gray-900">Current Medications</h3>
            <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Add Medication
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Medication</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Dosage</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Frequency</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Start Date</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">End Date</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Prescribed By</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr *ngFor="let med of medications" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ med.name }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ med.dosage }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ med.frequency }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">asd</td>
                  <td class="px-4 py-3 text-sm text-gray-600">asd</td>
                  <td class="px-4 py-3 text-sm text-gray-600">asd</td>
                  <td class="px-4 py-3">
                    <span  class="px-2 py-1 text-xs font-medium rounded-full">
                      asd
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Lab Results Tab -->
        <div *ngIf="activeTab === 'labs'">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Laboratory Test Results</h3>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Test Name</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Result</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Normal Range</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr *ngFor="let lab of labResults" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ lab.testName }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ lab.date }}</td>
                  <td class="px-4 py-3 text-sm font-semibold text-gray-900">{{ lab.result }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ lab.normalRange }}</td>
                  <td class="px-4 py-3">
                    <span [class]="getStatusClass(lab.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{ lab.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Appointments Tab -->
        <div *ngIf="activeTab === 'appointments'">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-gray-900">Appointments</h3>
            <button (click)="scheduleAppointment()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Schedule New
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Appointment ID</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Time</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Doctor</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Department</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Purpose</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr *ngFor="let apt of appointments" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-900">{{ apt.id }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ apt.date }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ apt.time }}</td>
                  <td class="px-4 py-3 text-sm text-gray-900">{{ apt.doctor }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ apt.department }}</td>
                  <td class="px-4 py-3 text-sm text-gray-900">asd</td>
                  <td class="px-4 py-3">
                    <span [class]="getStatusClass(apt.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                      {{ apt.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm">
                    <button class="text-indigo-600 hover:text-indigo-700 font-medium mr-2">Edit</button>
                    <button class="text-red-600 hover:text-red-700 font-medium">Cancel</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Documents Tab -->
        <div *ngIf="activeTab === 'documents'">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-gray-900">Medical Documents</h3>
            <button (click)="addDocument()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Upload Document
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div *ngFor="let doc of documents" class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <div class="flex-shrink-0">
                    <svg class="h-10 w-10 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ doc.name }}</p>
                    <p class="text-xs text-gray-500">{{ doc.type }}</p>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>asdasd</span>
                <span>{{ doc.size }}</span>
              </div>
              <div class="flex space-x-2">
                <button (click)="downloadDocument(doc)" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-medium transition-colors">
                  Download
                </button>
                <button class="flex-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded text-xs font-medium transition-colors">
                  View
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
    `,
  styles: [`
      .patient-360-container {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }

      /* Custom scrollbar for tables */
      .overflow-x-auto::-webkit-scrollbar {
        height: 8px;
      }

      .overflow-x-auto::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
      }

      .overflow-x-auto::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 10px;
      }

      .overflow-x-auto::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
  `]
})

export class AdminCustomer360Component {
  // #region Inputs, Outputs, Properties
  activeTab: string = 'overview';

  patient: PatientProfile = {
    userId: 'P-2024-001',
    patientNumber: "",
    patientType: PatientType.Outpatient,
    occupation: null,
    isVip: false,
    isSeniorCitizen: false,
    primaryDoctorId: "",
    lastVisitDate: null,
    nextFollowUpDate: null,
    totalVisits: 0
  };

  visits: Visit[] = [

  ];

  medications: Medication[] = [

  ];

  labResults: LabResult[] = [
    {
      testName: 'Hemoglobin', date: '2024-12-10', result: '14.5 g/dL', normalRange: '13.5-17.5 g/dL',
      id: 0,
      status: "normal",
      orderedBy: ""
    },
    {
      testName: 'Blood Sugar (Fasting)', date: '2024-12-10', result: '110 mg/dL', normalRange: '70-100 mg/dL',
      id: 0,
      status: "normal",
      orderedBy: ""
    },
    {
      testName: 'Cholesterol', date: '2024-11-15', result: '195 mg/dL', normalRange: '<200 mg/dL',
      id: 0,
      status: "normal",
      orderedBy: ""
    },
    {
      testName: 'Blood Pressure', date: '2024-12-15', result: '130/85 mmHg', normalRange: '120/80 mmHg',
      id: 0,
      status: "normal",
      orderedBy: ""
    }
  ];

  appointments: Appointment[] = [

  ];

  documents: Document[] = [

  ];

  allergies: Allergy[] = [
    { allergen: 'Penicillin', severity: 'Severe', reaction: 'Anaphylaxis' },
    { allergen: 'Peanuts', severity: 'Moderate', reaction: 'Hives, Swelling' },
    { allergen: 'Latex', severity: 'Mild', reaction: 'Skin Rash' }
  ];

  vitalSigns = {
    bloodPressure: '130/85',
    heartRate: '72',
    temperature: '98.6',
    weight: '180',
    height: '5\'10"',
    bmi: '25.8'
  };
  // #endregion

  // #region Methods
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Completed': 'bg-green-100 text-green-800',
      'Scheduled': 'bg-blue-100 text-blue-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Active': 'bg-green-100 text-green-800',
      'Discontinued': 'bg-gray-100 text-gray-800',
      'Normal': 'bg-green-100 text-green-800',
      'Abnormal': 'bg-yellow-100 text-yellow-800',
      'Critical': 'bg-red-100 text-red-800',
      'Mild': 'bg-yellow-100 text-yellow-800',
      'Moderate': 'bg-orange-100 text-orange-800',
      'Severe': 'bg-red-100 text-red-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  }

  downloadDocument(doc: Document): void {
    console.log('Downloading:', doc.name);
    // Implement download logic
  }

  scheduleAppointment(): void {
    console.log('Schedule new appointment');
    // Implement scheduling logic
  }

  addDocument(): void {
    console.log('Add new document');
    // Implement file upload logic
  }
  // #endregion
}