import { Component, OnInit } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { Diagnosis } from "../../../../shared/types/diagnosis";
import { Medication } from "../../../../shared/types/medication";
import { Patient } from "../../../../shared/types/patient";
import { PatientType, RiskLevel } from "../../../../shared/enums/patient";

@Component({
  selector: 'admin-prescription',
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
              <h1 class="text-3xl font-bold text-gray-800">Prescription</h1>
              <p class="text-gray-600 mt-1">Dr. {{ doctorName }} - {{ department }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600">Date</p>
              <p class="text-lg font-semibold text-gray-800">{{ currentDate }}</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Side - Patient Info & Diagnosis -->
          <div class="space-y-6">
            <!-- Patient Information -->
            <div class="bg-surface rounded-lg shadow-md p-6">
              <h2 class="text-xl font-bold text-gray-800 mb-4">Patient Information</h2>
              <div class="space-y-3">
                <div>
                  <p class="text-sm text-gray-600">Queue Number</p>
                  <p class="text-2xl font-bold text-blue-600">asd</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Name</p>
                  <p class="text-lg font-semibold text-gray-800">asd</p>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <p class="text-sm text-gray-600">Age</p>
                    <p class="font-semibold text-gray-800">asd years</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">Gender</p>
                    <p class="font-semibold text-gray-800">asd</p>
                  </div>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Phone</p>
                  <p class="font-semibold text-gray-800">asd</p>
                </div>
              </div>
            </div>

            <!-- Diagnosis -->
            <div class="bg-surface rounded-lg shadow-md p-6">
              <h2 class="text-xl font-bold text-gray-800 mb-4">Diagnosis</h2>
              <div class="space-y-3">
                <div *ngFor="let diag of diagnoses; let i = index" 
                     class="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex-1">
                    <p class="font-semibold text-gray-800">{{ diag.description }}</p>
                    <p class="text-sm text-gray-600">Code: {{ diag.code }}</p>
                  </div>
                  <button (click)="removeDiagnosis(i)" 
                          class="text-red-600 hover:text-red-800 ml-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div class="pt-2">
                  <input [(ngModel)]="newDiagnosis.code" 
                         type="text" 
                         placeholder="ICD Code (e.g., J06.9)"
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <input [(ngModel)]="newDiagnosis.description" 
                         type="text" 
                         placeholder="Diagnosis description"
                         class="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <button (click)="addDiagnosis()" 
                          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors">
                    Add Diagnosis
                  </button>
                </div>
              </div>
            </div>

            <!-- Chief Complaint & Notes -->
            <div class="bg-surface rounded-lg shadow-md p-6">
              <h2 class="text-xl font-bold text-gray-800 mb-4">Clinical Notes</h2>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Chief Complaint</label>
                  <textarea [(ngModel)]="chiefComplaint" 
                            rows="3" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Patient's main complaint..."></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <textarea [(ngModel)]="additionalNotes" 
                            rows="4" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Additional observations, instructions..."></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Side - Medications -->
          <div class="lg:col-span-2">
            <div class="bg-surface rounded-lg shadow-md p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-gray-800">Medications</h2>
                <button (click)="showMedicationForm = !showMedicationForm" 
                        class="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Medication
                </button>
              </div>

              <!-- Add Medication Form -->
              <div *ngIf="showMedicationForm" class="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                <h3 class="font-bold text-gray-800 mb-4">New Medication</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Medicine Name *</label>
                    <input [(ngModel)]="newMedication.name" 
                           type="text" 
                           placeholder="e.g., Amoxicillin"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Dosage *</label>
                    <input [(ngModel)]="newMedication.dosage" 
                           type="text" 
                           placeholder="e.g., 500mg"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Frequency *</label>
                    <select [(ngModel)]="newMedication.frequency" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select frequency</option>
                      <option value="Once daily">Once daily</option>
                      <option value="Twice daily">Twice daily</option>
                      <option value="Three times daily">Three times daily</option>
                      <option value="Four times daily">Four times daily</option>
                      <option value="Every 4 hours">Every 4 hours</option>
                      <option value="Every 6 hours">Every 6 hours</option>
                      <option value="Every 8 hours">Every 8 hours</option>
                      <option value="As needed">As needed</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
                    <input [(ngModel)]="newMedication.duration" 
                           type="text" 
                           placeholder="e.g., 7 days"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <input [(ngModel)]="newMedication.quantity" 
                           type="number" 
                           placeholder="e.g., 21"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                    <input [(ngModel)]="newMedication.instructions" 
                           type="text" 
                           placeholder="e.g., Take with food, After meals"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </div>
                </div>
                <div class="flex gap-3 mt-4">
                  <button (click)="addMedication()" 
                          class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors">
                    Add to Prescription
                  </button>
                  <button (click)="cancelMedication()" 
                          class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-6 py-2 rounded-lg transition-colors">
                    Cancel
                  </button>
                </div>
              </div>

              <!-- Medications List -->
              <div class="space-y-4">
                <div *ngFor="let med of medications; let i = index" 
                     class="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                      <h3 class="text-lg font-bold text-gray-800">{{ med.name }}</h3>
                      <p class="text-gray-600">{{ med.dosage }}</p>
                    </div>
                    <button (click)="removeMedication(i)" 
                            class="text-red-600 hover:text-red-800">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div class="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span class="text-gray-600">Frequency:</span>
                      <span class="font-semibold text-gray-800 ml-2">{{ med.frequency }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600">Duration:</span>
                      <span class="font-semibold text-gray-800 ml-2">{{ med.duration }}</span>
                    </div>
                    <div>
                      <span class="text-gray-600">Quantity:</span>
                      <span class="font-semibold text-gray-800 ml-2">{{ med.quantity }} {{ med.quantity === 1 ? 'unit' : 'units' }}</span>
                    </div>
                    <div *ngIf="med.instructions">
                      <span class="text-gray-600">Instructions:</span>
                      <span class="font-semibold text-gray-800 ml-2">{{ med.instructions }}</span>
                    </div>
                  </div>
                </div>

                <div *ngIf="medications.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
                  <svg class="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p class="text-gray-600 text-lg mb-3">No medications added yet</p>
                  <button (click)="showMedicationForm = true" 
                          class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors">
                    Add First Medication
                  </button>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-4 mt-6 pt-6 border-t-2 border-gray-200">
                <button (click)="saveDraft()" 
                        class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-colors">
                  Save as Draft
                </button>
                <button (click)="previewPrescription()" 
                        class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
                  Preview
                </button>
                <button (click)="submitPrescription()" 
                        [disabled]="medications.length === 0"
                        [class.opacity-50]="medications.length === 0"
                        [class.cursor-not-allowed]="medications.length === 0"
                        class="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors">
                  Issue Prescription
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>    
    `
})

export class AdminPrescriptionComponent implements OnInit {
  // #region Inputs, Outputs, Properties
  doctorName: string = 'Dr. Sarah Johnson';
  department: string = 'General Practice';
  currentDate: string = '';

  patient: Patient = {
    id: "",
    patientNumber: "",
    patientType: PatientType.Outpatient,
    primaryDoctorId: "",
    totalVisits: 0,
    totalAmountSpent: 0,
    loyaltyPoints: 0,
    riskLevel: RiskLevel.Low
  };

  chiefComplaint: string = 'Chest pain and shortness of breath';
  additionalNotes: string = '';

  diagnoses: Diagnosis[] = [
    { code: 'I20.9', description: 'Angina pectoris, unspecified' }
  ];

  newDiagnosis: Diagnosis = { code: '', description: '' };

  medications: Medication[] = [];

  newMedication: Medication = {
    id: '',
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    quantity: 0
  };

  showMedicationForm: boolean = false;
  // #endregion

  // #region Init (Lifecycle + Setup)
  ngOnInit() {
    this.updateDate();
  }
  // #endregion

  // #region Methods
  updateDate() {
    const now = new Date();
    this.currentDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  addDiagnosis() {
    if (this.newDiagnosis.code && this.newDiagnosis.description) {
      this.diagnoses.push({ ...this.newDiagnosis });
      this.newDiagnosis = { code: '', description: '' };
    }
  }

  removeDiagnosis(index: number) {
    this.diagnoses.splice(index, 1);
  }

  addMedication() {
    if (this.newMedication.name && this.newMedication.dosage &&
      this.newMedication.frequency && this.newMedication.duration) {
      this.medications.push({
        ...this.newMedication,
        id: Date.now().toString()
      });
      this.cancelMedication();
    } else {
      alert('Please fill in all required fields');
    }
  }

  removeMedication(index: number) {
    if (confirm('Remove this medication from prescription?')) {
      this.medications.splice(index, 1);
    }
  }

  cancelMedication() {
    this.showMedicationForm = false;
    this.newMedication = {
      id: '',
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      quantity: 0
    };
  }

  saveDraft() {
    console.log('Saving draft...', {
      patient: this.patient,
      diagnoses: this.diagnoses,
      medications: this.medications,
      chiefComplaint: this.chiefComplaint,
      additionalNotes: this.additionalNotes
    });
    alert('Prescription saved as draft');
    // In production: save to API
  }

  previewPrescription() {
    console.log('Preview prescription');
    alert('Preview feature - will open prescription in print format');
    // In production: open print preview modal or new window
  }

  submitPrescription() {
    if (this.medications.length === 0) {
      alert('Please add at least one medication');
      return;
    }

    if (confirm('Issue this prescription? This action cannot be undone.')) {
      console.log('Submitting prescription...', {
        patient: this.patient,
        diagnoses: this.diagnoses,
        medications: this.medications,
        chiefComplaint: this.chiefComplaint,
        additionalNotes: this.additionalNotes,
        doctor: this.doctorName,
        date: this.currentDate
      });
      alert('Prescription issued successfully!');
      // In production: submit to API and generate PDF
      // this.router.navigate(['/doctor-desk']);
    }
  }
  // #endregion   
}