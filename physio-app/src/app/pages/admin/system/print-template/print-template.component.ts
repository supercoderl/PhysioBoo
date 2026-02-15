import { Component, Input } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { PatientInfo } from "../../../../shared/types/patient";
import { Doctor } from "../../../../shared/types/doctor";
import { Medication } from "../../../../shared/types/medication";
import { LabTest } from "../../../../shared/types/lab-test";

@Component({
  selector: 'admin-print-template',
  standalone: true,
  imports: [
    SharedModule
  ],
  template: `
    <div class="print-container bg-surface p-8 max-w-4xl mx-auto">
  <!-- Print Button - Hidden during print -->
  <div class="no-print mb-6 flex justify-end">
    <button 
      (click)="print()" 
      class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition-colors">
      Print Document
    </button>
  </div>

  <!-- Document Body -->
  <div class="document-body">
    <!-- Patient Information Section -->
    <div class="mb-6 pb-4 border-b-2 border-gray-300">
      <h2 class="text-lg font-bold text-gray-800 mb-3">Patient Information</h2>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="font-semibold text-gray-700">Patient ID:</span>
          <span class="ml-2 text-gray-600">{{ patient.id }}</span>
        </div>
        <div>
          <span class="font-semibold text-gray-700">Date:</span>
          <span class="ml-2 text-gray-600">{{ date }}</span>
        </div>
        <div>
          <span class="font-semibold text-gray-700">Name:</span>
          <span class="ml-2 text-gray-600">{{ patient.name }}</span>
        </div>
        <div>
          <span class="font-semibold text-gray-700">Age/Gender:</span>
          <span class="ml-2 text-gray-600">{{ patient.age }} / {{ patient.gender }}</span>
        </div>
        <div>
          <span class="font-semibold text-gray-700">Blood Type:</span>
          <span class="ml-2 text-gray-600">{{ patient.bloodType }}</span>
        </div>
        <div>
          <span class="font-semibold text-gray-700">Phone:</span>
          <span class="ml-2 text-gray-600">{{ patient.phone }}</span>
        </div>
        <div class="col-span-2">
          <span class="font-semibold text-gray-700">Address:</span>
          <span class="ml-2 text-gray-600">{{ patient.address }}</span>
        </div>
      </div>
    </div>

    <!-- Prescription Template -->
    <div *ngIf="templateType === 'prescription'" class="template-content">
      <div class="mb-6">
        <h2 class="text-lg font-bold text-gray-800 mb-3">Diagnosis</h2>
        <p class="text-gray-700">{{ diagnosis }}</p>
      </div>

      <div class="mb-6" *ngIf="symptoms.length > 0">
        <h2 class="text-lg font-bold text-gray-800 mb-3">Symptoms</h2>
        <ul class="list-disc list-inside text-gray-700">
          <li *ngFor="let symptom of symptoms">{{ symptom }}</li>
        </ul>
      </div>

      <div class="mb-6">
        <h2 class="text-lg font-bold text-gray-800 mb-3">Prescription</h2>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse border border-gray-300">
            <thead class="bg-gray-100">
              <tr>
                <th class="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">#</th>
                <th class="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Medication</th>
                <th class="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Dosage</th>
                <th class="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Frequency</th>
                <th class="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let med of medications; let i = index">
                <td class="border border-gray-300 px-4 py-2 text-sm">{{ i + 1 }}</td>
                <td class="border border-gray-300 px-4 py-2 text-sm">{{ med.name }}</td>
                <td class="border border-gray-300 px-4 py-2 text-sm">{{ med.dosage }}</td>
                <td class="border border-gray-300 px-4 py-2 text-sm">{{ med.frequency }}</td>
                <td class="border border-gray-300 px-4 py-2 text-sm">{{ med.duration }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="mb-6" *ngIf="notes">
        <h2 class="text-lg font-bold text-gray-800 mb-3">Doctor's Notes</h2>
        <p class="text-gray-700 leading-relaxed">{{ notes }}</p>
      </div>
    </div>

    <!-- Lab Report Template -->
    <div *ngIf="templateType === 'lab-report'" class="template-content">
      <div class="mb-6">
        <h2 class="text-lg font-bold text-gray-800 mb-3">Laboratory Test Results</h2>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse border border-gray-300">
            <thead class="bg-gray-100">
              <tr>
                <th class="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Test Name</th>
                <th class="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Result</th>
                <th class="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Normal Range</th>
                <th class="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let test of labTests">
                <td class="border border-gray-300 px-4 py-2 text-sm">aaaa</td>
                <td class="border border-gray-300 px-4 py-2 text-sm font-semibold">aaaa</td>
                <td class="border border-gray-300 px-4 py-2 text-sm text-gray-600">aaaaa</td>
                <td class="border border-gray-300 px-4 py-2 text-sm">
                  <span 
                    [class]="'text-green-600 font-semibold'">
                    {{ test.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="mb-6" *ngIf="notes">
        <h2 class="text-lg font-bold text-gray-800 mb-3">Comments</h2>
        <p class="text-gray-700 leading-relaxed">{{ notes }}</p>
      </div>
    </div>

    <!-- Discharge Summary Template -->
    <div *ngIf="templateType === 'discharge-summary'" class="template-content">
      <div class="mb-6">
        <h2 class="text-lg font-bold text-gray-800 mb-3">Admission Details</h2>
        <p class="text-sm text-gray-700"><span class="font-semibold">Diagnosis:</span> {{ diagnosis }}</p>
      </div>

      <div class="mb-6">
        <h2 class="text-lg font-bold text-gray-800 mb-3">Treatment Summary</h2>
        <p class="text-gray-700 leading-relaxed">{{ notes }}</p>
      </div>

      <div class="mb-6">
        <h2 class="text-lg font-bold text-gray-800 mb-3">Medications on Discharge</h2>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse border border-gray-300">
            <thead class="bg-gray-100">
              <tr>
                <th class="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Medication</th>
                <th class="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Dosage</th>
                <th class="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Frequency</th>
                <th class="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let med of medications">
                <td class="border border-gray-300 px-4 py-2 text-sm">{{ med.name }}</td>
                <td class="border border-gray-300 px-4 py-2 text-sm">{{ med.dosage }}</td>
                <td class="border border-gray-300 px-4 py-2 text-sm">{{ med.frequency }}</td>
                <td class="border border-gray-300 px-4 py-2 text-sm">{{ med.duration }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="mb-6">
        <h2 class="text-lg font-bold text-gray-800 mb-3">Follow-up Instructions</h2>
        <p class="text-gray-700 leading-relaxed">
          Patient should follow up with asd in 7-10 days. 
          Maintain prescribed medications and contact hospital immediately if symptoms worsen.
        </p>
      </div>
    </div>

    <!-- Appointment Template -->
    <div *ngIf="templateType === 'appointment'" class="template-content">
      <div class="mb-6 text-center bg-blue-50 p-6 rounded-lg">
        <h2 class="text-2xl font-bold text-blue-800 mb-4">Appointment Confirmation</h2>
        <div class="text-lg">
          <p class="mb-2">
            <span class="font-semibold text-gray-700">Date:</span>
            <span class="ml-2 text-blue-600 font-bold">{{ appointmentDate }}</span>
          </p>
          <p>
            <span class="font-semibold text-gray-700">Time:</span>
            <span class="ml-2 text-blue-600 font-bold">{{ appointmentTime }}</span>
          </p>
        </div>
      </div>

      <div class="mb-6">
        <h2 class="text-lg font-bold text-gray-800 mb-3">Doctor Information</h2>
        <p class="text-sm text-gray-700 mb-1">
          <span class="font-semibold">Name:</span> asd
        </p>
        <p class="text-sm text-gray-700">
          <span class="font-semibold">Specialization:</span> asd
        </p>
      </div>

      <div class="mb-6" *ngIf="notes">
        <h2 class="text-lg font-bold text-gray-800 mb-3">Instructions</h2>
        <p class="text-gray-700 leading-relaxed">{{ notes }}</p>
      </div>

      <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <p class="text-sm text-gray-700">
          <span class="font-semibold">Note:</span> Please arrive 15 minutes before your scheduled appointment time. 
          Bring all necessary medical records and identification documents.
        </p>
      </div>
    </div>

    <!-- Doctor Signature Section -->
    <div class="mt-8 pt-6 border-t-2 border-gray-300">
      <div class="flex justify-between items-end">
        <div>
          <p class="text-sm text-gray-600 mb-1">Prepared by:</p>
          <p class="font-bold text-gray-800">asd</p>
          <p class="text-sm text-gray-600">asd</p>
          <p class="text-xs text-gray-500">License: asd</p>
        </div>
        <div class="text-right">
          <div class="border-t-2 border-gray-400 w-48 mb-2"></div>
          <p class="text-sm text-gray-600">Doctor's Signature</p>
        </div>
      </div>
    </div>
  </div>
</div>
    `,
  styles: [`
        @media print {
            .no-print {
                display: none !important;
            }

            .print-container {
                margin: 0;
                padding: 20px;
                max-width: 100%;
            }

            body {
                margin: 0;
                padding: 0;
            }

            @page {
                margin: 1cm;
                size: A4;
            }
        }    
    `]
})

export class AdminPrintTemplateComponent {
  // #region Inputs, Outputs, Properties
  @Input() templateType: 'prescription' | 'lab-report' | 'discharge-summary' | 'appointment' = 'prescription';
  @Input() patient: PatientInfo = {
    id: 'P-2024-001',
    name: 'John Doe',
    age: 45,
    gender: 'Male',
    bloodType: 'O+',
    phone: '+1 234 567 8900',
    address: '123 Main Street, City, State 12345'
  };
  @Input() doctor: Doctor = {
    id: "",
    medicalLicenseNumber: "",
    medicalLicenseExpiry: new Date(2025, 10, 10),
    yearsOfExperience: 0,
    averageRating: 0,
    totalReviews: 0,
    bio: null,
    about: null
  };
  @Input() date: string = new Date().toLocaleDateString();
  @Input() medications: Medication[] = [

  ];
  @Input() labTests: LabTest[] = [

  ];
  @Input() diagnosis: string = 'Upper Respiratory Tract Infection';
  @Input() symptoms: string[] = ['Fever', 'Cough', 'Sore throat'];
  @Input() notes: string = 'Patient advised to take complete rest and maintain hydration. Follow-up visit recommended after 7 days.';
  @Input() appointmentDate: string = '';
  @Input() appointmentTime: string = '';
  // #endregion

  // #region Methods
  print(): void {
    window.print();
  }
  // #endregion
}