import { Component, OnDestroy, OnInit } from "@angular/core";
import { PatientType, RiskLevel } from "../../../../shared/enums/patient";
import { SharedModule } from "../../../../shared/shared-imports";
import { FluidBalance } from "../../../../shared/types/fluid-balance";
import { Medication } from "../../../../shared/types/medication";
import { Note } from "../../../../shared/types/note";
import { Patient } from "../../../../shared/types/patient";
import { Procedure } from "../../../../shared/types/procedure";
import { Vitals } from "../../../../shared/types/vital";

@Component({
  selector: 'admin-treatment-sheet',
  standalone: true,
  imports: [
    SharedModule
  ],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="bg-surface rounded-lg shadow-md p-6 mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-800">Treatment Sheet</h1>
              <p class="text-gray-600 mt-1">Ward: {{ ward }} - Bed: 101</p>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-600">{{ currentDate }}</span>
              <button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
                Print Sheet
              </button>
            </div>
          </div>
        </div>

        <!-- Patient Info Card -->
        <div class="bg-surface rounded-lg shadow-md p-6 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p class="text-sm text-gray-600">Patient Name</p>
              <p class="text-lg font-bold text-gray-800">asd</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Age / Gender</p>
              <p class="text-lg font-semibold text-gray-800">asdy / asd</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Admission Date</p>
              <p class="text-lg font-semibold text-gray-800">15-12-2025</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Diagnosis</p>
              <p class="text-lg font-semibold text-gray-800"></p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button (click)="activeTab = 'vitals'" 
                  class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Record Vitals
          </button>
          <button (click)="activeTab = 'medications'" 
                  class="bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Give Medication
          </button>
          <button (click)="activeTab = 'procedures'" 
                  class="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Procedure
          </button>
          <button (click)="activeTab = 'notes'" 
                  class="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-lg transition-colors flex items-center justify-center gap-2">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Add Note
          </button>
        </div>

        <!-- Tab Content -->
        <div [ngSwitch]="activeTab">
          <!-- Vital Signs Tab -->
          <div *ngSwitchCase="'vitals'">
            <div class="bg-surface rounded-lg shadow-md p-6 mb-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-gray-800">Record Vital Signs</h2>
                <span class="text-sm text-gray-600">{{ currentTime }}</span>
              </div>
              
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Temperature (°C)</label>
                  <input [(ngModel)]="newVital.temperature" 
                         type="number" 
                         step="0.1"
                         placeholder="36.5"
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Blood Pressure</label>
                  <input [(ngModel)]="newVital.bloodPressure" 
                         type="text" 
                         placeholder="120/80"
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Heart Rate (bpm)</label>
                  <input [(ngModel)]="newVital.heartRate" 
                         type="number" 
                         placeholder="72"
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Respiratory Rate</label>
                  <input [(ngModel)]="newVital.respiratoryRate" 
                         type="number" 
                         placeholder="16"
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">O2 Saturation (%)</label>
                  <input [(ngModel)]="newVital.oxygenSaturation" 
                         type="number" 
                         placeholder="98"
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Pain Score (0-10)</label>
                  <input [(ngModel)]="newVital.painScore" 
                         type="number" 
                         min="0"
                         max="10"
                         placeholder="0"
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Recorded By</label>
                  <input [(ngModel)]="newVital.recordedBy" 
                         type="text" 
                         placeholder="Nurse Name"
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div class="flex items-end">
                  <button (click)="addVitalSigns()" 
                          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors">
                    Record
                  </button>
                </div>
              </div>
            </div>

            <!-- Vital Signs History -->
            <div class="bg-surface rounded-lg shadow-md p-6">
              <h2 class="text-xl font-bold text-gray-800 mb-4">Vital Signs History (Today)</h2>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Temp (°C)</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">BP</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">HR</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">RR</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SpO2</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pain</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">By</th>
                    </tr>
                  </thead>
                  <tbody class="bg-surface divide-y divide-gray-200">
                    <tr *ngFor="let vital of vitalSigns" class="hover:bg-gray-50">
                      <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">12:00</td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ vital.temperature }}</td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ vital.bloodPressure }}</td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ vital.heartRate }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Medications Tab -->
          <div *ngSwitchCase="'medications'" class="space-y-6">
            <div *ngFor="let med of medications" class="bg-surface rounded-lg shadow-md p-6">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-xl font-bold text-gray-800">{{ med.name }}</h3>
                  <p class="text-gray-600">{{ med.dosage }} - {{ med.frequency }}</p>
                  <p class="text-sm text-gray-500 mt-1">09:00 to 12:00</p>
                </div>
                <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">Active</span>
              </div>

              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Scheduled Time</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Given Time</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Given By</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody class="bg-surface divide-y divide-gray-200">
                    
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Procedures Tab -->
          <div *ngSwitchCase="'procedures'">
            <div class="bg-surface rounded-lg shadow-md p-6 mb-6">
              <h2 class="text-xl font-bold text-gray-800 mb-4">Add New Procedure</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Procedure Name</label>
                  <input [(ngModel)]="newProcedure.name" 
                         type="text" 
                         placeholder="e.g., Wound dressing"
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Performed By</label>
                  <input [(ngModel)]="newProcedure.performedBy" 
                         type="text" 
                         placeholder="Staff name"
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea [(ngModel)]="newProcedure.notes" 
                            rows="3" 
                            placeholder="Procedure details and observations"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
                <div class="md:col-span-2">
                  <button (click)="addProcedure()" 
                          class="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-colors">
                    Add Procedure
                  </button>
                </div>
              </div>
            </div>

            <div class="bg-surface rounded-lg shadow-md p-6">
              <h2 class="text-xl font-bold text-gray-800 mb-4">Procedures Today</h2>
              <div class="space-y-3">
                <div *ngFor="let proc of procedures" 
                     class="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex-1">
                      <h3 class="text-lg font-bold text-gray-800">{{ proc.name }}</h3>
                      <p class="text-sm text-gray-600">{{ proc.time }} - Performed by {{ proc.performedBy }}</p>
                    </div>
                    <span [class]="getProcedureStatusClass(proc.status)" 
                          class="px-3 py-1 text-xs font-semibold rounded-full">
                      {{ proc.status }}
                    </span>
                  </div>
                  <p class="text-gray-700">{{ proc.notes }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes Tab -->
          <div *ngSwitchCase="'notes'">
            <div class="bg-surface rounded-lg shadow-md p-6 mb-6">
              <h2 class="text-xl font-bold text-gray-800 mb-4">Add New Note</h2>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Note Type</label>
                  <select [(ngModel)]="newNote.type" 
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="nursing">Nursing Note</option>
                    <option value="doctor">Doctor's Note</option>
                    <option value="general">General Note</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Note Content</label>
                  <textarea [(ngModel)]="newNote.content" 
                            rows="4" 
                            placeholder="Enter your note here..."
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Written By</label>
                  <input [(ngModel)]="newNote.writtenBy" 
                         type="text" 
                         placeholder="Your name"
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <button (click)="addNote()" 
                        class="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg transition-colors">
                  Add Note
                </button>
              </div>
            </div>

            <div class="bg-surface rounded-lg shadow-md p-6">
              <h2 class="text-xl font-bold text-gray-800 mb-4">Progress Notes</h2>
              <div class="space-y-4">
                <div *ngFor="let note of notes" 
                     class="border-l-4 pl-4 py-3"
                     [class.border-blue-500]="note.type === 'nursing'"
                     [class.border-green-500]="note.type === 'doctor'"
                     [class.border-gray-500]="note.type === 'general'">
                  <div class="flex items-start justify-between mb-2">
                    <div>
                      <span [class]="getNoteTypeClass(note.type)" 
                            class="px-2 py-1 text-xs font-semibold rounded">
                        {{ note.type === 'nursing' ? 'Nursing' : note.type === 'doctor' ? 'Doctor' : 'General' }}
                      </span>
                      <span class="text-sm text-gray-600 ml-3">{{ note.time }}</span>
                    </div>
                    <span class="text-sm text-gray-600">{{ note.writtenBy }}</span>
                  </div>
                  <p class="text-gray-800">{{ note.content }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Fluid Balance Tab -->
          <div *ngSwitchCase="'fluid'">
            <div class="bg-surface rounded-lg shadow-md p-6">
              <h2 class="text-xl font-bold text-gray-800 mb-6">Fluid Balance Chart</h2>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Oral (ml)</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IV (ml)</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total In</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urine (ml)</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Drain (ml)</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Out</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                    </tr>
                  </thead>
                  <tbody class="bg-surface divide-y divide-gray-200">
                    <tr *ngFor="let fluid of fluidBalance" class="hover:bg-gray-50">
                      <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">{{ fluid.time }}</td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ fluid.intake.oral }}</td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ fluid.intake.iv }}</td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-blue-600">{{ fluid.intake.total }}</td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ fluid.output.urine }}</td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{{ fluid.output.drain }}</td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-red-600">{{ fluid.output.total }}</td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm font-bold" 
                          [class.text-green-600]="fluid.balance > 0"
                          [class.text-red-600]="fluid.balance < 0">
                        {{ fluid.balance > 0 ? '+' : '' }}{{ fluid.balance }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `
})

export class AdminTreatmentSheetComponent implements OnInit, OnDestroy {
  // #region Inputs, Outputs, Properties
  ward: string = 'Ward A - General Medicine';
  currentDate: string = '';
  currentTime: string = '';
  activeTab: string = 'vitals';

  patient: Patient = {
    id: "",
    patientNumber: "",
    patientType: PatientType.Outpatient,
    riskLevel: RiskLevel.Low,
    primaryDoctorId: "",
    preferredDoctorId: null,
    preferredHospitalId: null,
    preferredAppointmentTime: null,
    referredBy: null,
    referralHospitalId: null,
    inssuranceProvider: null,
    inssurancePolicyNumber: null,
    inssuranceExpiryDate: null,
    inssuranceCoverageAmount: null,
    isVip: false,
    isSeniorCitizen: false,
    isChronicPatient: false,
    medicalHistory: null,
    familyHistory: null,
    surgicalHistory: null,
    allergyInformation: null,
    currentMedications: null,
    lifestyleNotes: null,
    occupation: null,
    annualIncomeRange: null,
    communicationPreferences: null,
    consentForResearch: false,
    consentForMarketing: false,
    dataSharingConsent: true,
    registrationDate: null,
    lastVisitDate: null,
    nextFollowUpDate: null,
    totalVisits: 0,
    totalAmountSpent: 0,
    outstandingBalance: 0,
    loyaltyPoints: 0,
  };

  vitalSigns: Vitals[] = [
    {
      temperature: 37.2, bloodPressure: '120/80', heartRate: 78,
      weight: 0,
      height: 0,
      bmi: 0
    },
    {
      temperature: 37.5, bloodPressure: '125/82', heartRate: 82,
      weight: 0,
      height: 0,
      bmi: 0
    },
    {
      temperature: 37.8, bloodPressure: '130/85', heartRate: 85,
      weight: 0,
      height: 0,
      bmi: 0
    }
  ];

  newVital: any = {
    temperature: null,
    bloodPressure: '',
    heartRate: null,
    respiratoryRate: null,
    oxygenSaturation: null,
    painScore: null,
    recordedBy: ''
  };

  medications: Medication[] = [
    {
      id: '1',
      name: 'Amoxicillin',
      dosage: '500mg',
      frequency: '3 times daily',
      duration: "",
      instructions: "",
      quantity: 0
    },
    {
      id: '2',
      name: 'Paracetamol',
      dosage: '500mg',
      frequency: "",
      duration: "",
      instructions: "",
      quantity: 0
    }
  ];

  procedures: Procedure[] = [
    { id: '1', time: '09:00', name: 'Wound Dressing Change', performedBy: 'Nurse Sarah', notes: 'Wound healing well, no signs of infection', status: 'completed' },
    { id: '2', time: '15:30', name: 'Blood Sample Collection', performedBy: 'Lab Tech Mike', notes: 'Sample sent to laboratory for analysis', status: 'completed' }
  ];

  newProcedure: any = {
    name: '',
    performedBy: '',
    notes: ''
  };

  notes: Note[] = [
    { id: '1', time: '08:30', type: 'nursing', content: 'Patient alert and oriented. Complaining of mild chest discomfort. Vital signs stable.', writtenBy: 'Nurse Mary Johnson' },
    { id: '2', time: '10:00', type: 'doctor', content: 'Chest X-ray shows improvement. Continue current antibiotic regimen. Patient responding well to treatment.', writtenBy: 'Dr. Sarah Wilson' },
    { id: '3', time: '14:00', type: 'nursing', content: 'Patient had lunch, appetite improving. Ambulated to bathroom without assistance.', writtenBy: 'Nurse John Davis' }
  ];

  newNote: any = {
    type: 'nursing',
    content: '',
    writtenBy: ''
  };

  fluidBalance: FluidBalance[] = [
    { time: '08:00', intake: { oral: 200, iv: 500, total: 700 }, output: { urine: 300, drain: 0, total: 300 }, balance: 400 },
    { time: '12:00', intake: { oral: 300, iv: 500, total: 800 }, output: { urine: 400, drain: 0, total: 400 }, balance: 400 },
    { time: '16:00', intake: { oral: 250, iv: 500, total: 750 }, output: { urine: 350, drain: 0, total: 350 }, balance: 400 }
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

  addVitalSigns() {
    if (!this.newVital.temperature || !this.newVital.bloodPressure || !this.newVital.heartRate) {
      alert('Please fill in all required fields');
      return;
    }

    const now = new Date();
    const vital: Vitals = {
      temperature: this.newVital.temperature,
      bloodPressure: this.newVital.bloodPressure,
      heartRate: this.newVital.heartRate,
      weight: 0,
      height: 0,
      bmi: 0
    };

    this.vitalSigns.push(vital);
    this.newVital = {
      temperature: null,
      bloodPressure: '',
      heartRate: null,
      respiratoryRate: null,
      oxygenSaturation: null,
      painScore: null,
      recordedBy: ''
    };
    alert('Vital signs recorded successfully!');
  }

  giveMedication(medId: string, scheduledTime: string) {
    const med = this.medications.find(m => m.id === medId);
    if (med) {

    }
  }

  missedMedication(medId: string, scheduledTime: string) {
    const med = this.medications.find(m => m.id === medId);
    if (med) {

    }
  }

  addProcedure() {
    if (!this.newProcedure.name || !this.newProcedure.performedBy) {
      alert('Please fill in required fields');
      return;
    }

    const now = new Date();
    const procedure: Procedure = {
      id: Date.now().toString(),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      name: this.newProcedure.name,
      performedBy: this.newProcedure.performedBy,
      notes: this.newProcedure.notes,
      status: 'completed'
    };

    this.procedures.push(procedure);
    this.newProcedure = { name: '', performedBy: '', notes: '' };
    alert('Procedure recorded successfully!');
  }

  addNote() {
    if (!this.newNote.content || !this.newNote.writtenBy) {
      alert('Please fill in all fields');
      return;
    }

    const now = new Date();
    const note: Note = {
      id: Date.now().toString(),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      type: this.newNote.type,
      content: this.newNote.content,
      writtenBy: this.newNote.writtenBy
    };

    this.notes.unshift(note);
    this.newNote = { type: 'nursing', content: '', writtenBy: '' };
    alert('Note added successfully!');
  }

  getMedicationStatusClass(status: string): string {
    const classes = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'given': 'bg-green-100 text-green-800',
      'missed': 'bg-red-100 text-red-800',
      'refused': 'bg-orange-100 text-orange-800'
    };
    return classes[status as keyof typeof classes] || '';
  }

  getProcedureStatusClass(status: string): string {
    const classes = {
      'completed': 'bg-green-100 text-green-800',
      'scheduled': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return classes[status as keyof typeof classes] || '';
  }

  getNoteTypeClass(type: string): string {
    const classes = {
      'nursing': 'bg-blue-100 text-blue-800',
      'doctor': 'bg-green-100 text-green-800',
      'general': 'bg-gray-100 text-gray-800'
    };
    return classes[type as keyof typeof classes] || '';
  }
  // #endregion
}