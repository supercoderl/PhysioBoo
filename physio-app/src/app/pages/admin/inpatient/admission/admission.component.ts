import { Component } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { AdmissionForm } from "../../../../shared/types/admission";

@Component({
    selector: 'admin-admission',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-5xl mx-auto">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-800">Patient Admission</h2>
              <p class="text-gray-600 mt-1">Register new patient admission</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600">Admission No.</p>
              <p class="text-lg font-bold text-blue-600">{{ generateAdmissionNo() }}</p>
            </div>
          </div>
        </div>

        <!-- Progress Steps -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="flex items-center justify-between">
            <div *ngFor="let step of steps; let i = index" class="flex items-center flex-1">
              <div class="flex flex-col items-center flex-1">
                <div 
                  [ngClass]="{
                    'bg-blue-600 text-white': currentStep >= i + 1,
                    'bg-gray-300 text-gray-600': currentStep < i + 1
                  }"
                  class="w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2 transition-colors">
                  {{ i + 1 }}
                </div>
                <p class="text-xs text-center font-medium text-gray-700">{{ step }}</p>
              </div>
              <div *ngIf="i < steps.length - 1" 
                   [ngClass]="{
                     'bg-blue-600': currentStep > i + 1,
                     'bg-gray-300': currentStep <= i + 1
                   }"
                   class="h-1 flex-1 mx-2 transition-colors">
              </div>
            </div>
          </div>
        </div>

        <form (ngSubmit)="submitAdmission()">
          <!-- Step 1: Patient Information -->
          <div *ngIf="currentStep === 1" class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200">
              Patient Information
            </h3>

            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Patient Type</label>
              <div class="flex space-x-4">
                <label class="flex items-center cursor-pointer">
                  <input type="radio" [(ngModel)]="admission.patientType" name="patientType" value="new" class="mr-2">
                  <span class="text-gray-700">New Patient</span>
                </label>
                <label class="flex items-center cursor-pointer">
                  <input type="radio" [(ngModel)]="admission.patientType" name="patientType" value="existing" class="mr-2">
                  <span class="text-gray-700">Existing Patient</span>
                </label>
              </div>
            </div>

            <div *ngIf="admission.patientType === 'existing'" class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Patient ID</label>
              <div class="flex space-x-2">
                <input 
                  type="text" 
                  [(ngModel)]="admission.patientId" 
                  name="patientId"
                  placeholder="Enter Patient ID"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <button type="button" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Search
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input 
                  type="text" 
                  [(ngModel)]="admission.firstName" 
                  name="firstName"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input 
                  type="text" 
                  [(ngModel)]="admission.lastName" 
                  name="lastName"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                <input 
                  type="date" 
                  [(ngModel)]="admission.dateOfBirth" 
                  name="dateOfBirth"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                <select 
                  [(ngModel)]="admission.gender" 
                  name="gender"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                <select 
                  [(ngModel)]="admission.bloodGroup" 
                  name="bloodGroup"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input 
                  type="tel" 
                  [(ngModel)]="admission.phone" 
                  name="phone"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  [(ngModel)]="admission.email" 
                  name="email"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Address *</label>
              <textarea 
                [(ngModel)]="admission.address" 
                name="address"
                required
                rows="2"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name *</label>
                <input 
                  type="text" 
                  [(ngModel)]="admission.emergencyContact" 
                  name="emergencyContact"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Emergency Phone *</label>
                <input 
                  type="tel" 
                  [(ngModel)]="admission.emergencyPhone" 
                  name="emergencyPhone"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
            </div>
          </div>

          <!-- Step 2: Admission Details -->
          <div *ngIf="currentStep === 2" class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200">
              Admission Details
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Admission Date *</label>
                <input 
                  type="date" 
                  [(ngModel)]="admission.admissionDate" 
                  name="admissionDate"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Admission Time *</label>
                <input 
                  type="time" 
                  [(ngModel)]="admission.admissionTime" 
                  name="admissionTime"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Admission Type *</label>
                <select 
                  [(ngModel)]="admission.admissionType" 
                  name="admissionType"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select Type</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Outpatient">Outpatient</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Referred By</label>
                <input 
                  type="text" 
                  [(ngModel)]="admission.referredBy" 
                  name="referredBy"
                  placeholder="Doctor/Hospital Name"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                <select 
                  [(ngModel)]="admission.department" 
                  name="department"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select Department</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Gynecology">Gynecology</option>
                  <option value="ICU">ICU</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Assigned Doctor *</label>
                <select 
                  [(ngModel)]="admission.assignedDoctor" 
                  name="assignedDoctor"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select Doctor</option>
                  <option value="Dr. John Smith">Dr. John Smith</option>
                  <option value="Dr. Sarah Johnson">Dr. Sarah Johnson</option>
                  <option value="Dr. Michael Brown">Dr. Michael Brown</option>
                  <option value="Dr. Emily Davis">Dr. Emily Davis</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Ward Type *</label>
                <select 
                  [(ngModel)]="admission.wardType" 
                  name="wardType"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select Ward Type</option>
                  <option value="General Ward">General Ward</option>
                  <option value="Private Room">Private Room</option>
                  <option value="Semi-Private">Semi-Private</option>
                  <option value="ICU">ICU</option>
                  <option value="NICU">NICU</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Bed Number *</label>
                <div class="flex space-x-2">
                  <select 
                    [(ngModel)]="admission.bedNumber" 
                    name="bedNumber"
                    required
                    class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select Bed</option>
                    <option value="B101">B101 - Available</option>
                    <option value="B102">B102 - Available</option>
                    <option value="B103">B103 - Available</option>
                    <option value="B201">B201 - Available</option>
                  </select>
                  <button type="button" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                    View Map
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Medical Information -->
          <div *ngIf="currentStep === 3" class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200">
              Medical Information
            </h3>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Chief Complaint *</label>
              <textarea 
                [(ngModel)]="admission.chiefComplaint" 
                name="chiefComplaint"
                required
                rows="3"
                placeholder="Describe the main reason for admission"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Provisional Diagnosis *</label>
              <textarea 
                [(ngModel)]="admission.provisionalDiagnosis" 
                name="provisionalDiagnosis"
                required
                rows="2"
                placeholder="Initial diagnosis"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Known Allergies</label>
              <textarea 
                [(ngModel)]="admission.allergies" 
                name="allergies"
                rows="2"
                placeholder="List any known allergies (medications, food, etc.)"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Current Medications</label>
              <textarea 
                [(ngModel)]="admission.currentMedications" 
                name="currentMedications"
                rows="2"
                placeholder="List current medications being taken"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Medical History</label>
              <textarea 
                [(ngModel)]="admission.medicalHistory" 
                name="medicalHistory"
                rows="3"
                placeholder="Previous medical conditions, surgeries, etc."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
            </div>
          </div>

          <!-- Step 4: Insurance Information -->
          <div *ngIf="currentStep === 4" class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200">
              Insurance Information
            </h3>

            <div class="mb-6">
              <label class="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  [(ngModel)]="admission.hasInsurance" 
                  name="hasInsurance"
                  class="mr-3 w-5 h-5 text-blue-600">
                <span class="text-gray-700 font-medium">Patient has health insurance</span>
              </label>
            </div>

            <div *ngIf="admission.hasInsurance">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Insurance Provider *</label>
                  <input 
                    type="text" 
                    [(ngModel)]="admission.insuranceProvider" 
                    name="insuranceProvider"
                    placeholder="Insurance company name"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Policy Number *</label>
                  <input 
                    type="text" 
                    [(ngModel)]="admission.policyNumber" 
                    name="policyNumber"
                    placeholder="Insurance policy number"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
              </div>

              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex items-start">
                  <svg class="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                  </svg>
                  <div>
                    <p class="text-sm font-medium text-blue-800 mb-1">Insurance Verification</p>
                    <p class="text-sm text-blue-700">Insurance details will be verified with the provider. This process may take 24-48 hours.</p>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="!admission.hasInsurance" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div class="flex items-start">
                <svg class="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <div>
                  <p class="text-sm font-medium text-yellow-800 mb-1">Self-Pay Patient</p>
                  <p class="text-sm text-yellow-700">Patient will be responsible for all medical expenses. Payment arrangements should be discussed with the billing department.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="bg-white rounded-lg shadow-md p-6 flex justify-between">
            <button 
              *ngIf="currentStep > 1"
              type="button"
              (click)="previousStep()"
              class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
              Previous
            </button>
            <div *ngIf="currentStep === 1"></div>
            
            <div class="flex space-x-3">
              <button 
                type="button"
                class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Save Draft
              </button>
              <button 
                *ngIf="currentStep < 4"
                type="button"
                (click)="nextStep()"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Next
              </button>
              <button 
                *ngIf="currentStep === 4"
                type="submit"
                class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Submit Admission
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
    `
})

export class AdminAdmissionComponent {
    // #region Inputs, Outputs, Properties
    currentStep = 1;
    steps = ['Patient Info', 'Admission Details', 'Medical Info', 'Insurance'];

    admission: AdmissionForm = {
        patientId: '',
        patientType: 'new',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        bloodGroup: '',
        phone: '',
        email: '',
        address: '',
        emergencyContact: '',
        emergencyPhone: '',
        admissionDate: new Date().toISOString().split('T')[0],
        admissionTime: new Date().toTimeString().slice(0, 5),
        admissionType: '',
        referredBy: '',
        department: '',
        assignedDoctor: '',
        wardType: '',
        bedNumber: '',
        chiefComplaint: '',
        provisionalDiagnosis: '',
        allergies: '',
        currentMedications: '',
        medicalHistory: '',
        hasInsurance: false,
        insuranceProvider: '',
        policyNumber: ''
    };
    // #endregion

    // #region Methods
    generateAdmissionNo(): string {
        const date = new Date();
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `ADM${year}${month}${day}${random}`;
    }

    nextStep(): void {
        if (this.currentStep < 4) {
            this.currentStep++;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    previousStep(): void {
        if (this.currentStep > 1) {
            this.currentStep--;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    submitAdmission(): void {
        console.log('Admission submitted:', this.admission);
        alert('Admission successfully submitted!\nAdmission No: ' + this.generateAdmissionNo());
        // Here you would typically send the data to your backend API
    }
    // #endregion
}