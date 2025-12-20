import { Component, OnInit } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { InsuranceClaim, InsuranceProvider } from "../../../../shared/types/insurance";
import { PolicyVerification } from "../../../../shared/types/policy";

@Component({
    selector: 'admin-insurance',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
     <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Tab Navigation -->
        <div class="bg-white rounded-lg shadow-md mb-6">
          <div class="flex border-b border-gray-200">
            <button
              *ngFor="let tab of tabs"
              (click)="activeTab = tab.id"
              [class.border-b-2]="activeTab === tab.id"
              [class.border-blue-600]="activeTab === tab.id"
              [class.text-blue-600]="activeTab === tab.id"
              class="px-6 py-4 font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <!-- Policy Verification Tab -->
        <div *ngIf="activeTab === 'verification'" class="space-y-6">
          <!-- Verification Form -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Verify Insurance Policy</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Policy Number</label>
                <input
                  type="text"
                  [(ngModel)]="verificationForm.policyNumber"
                  placeholder="Enter policy number"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
                <input
                  type="text"
                  [(ngModel)]="verificationForm.patientName"
                  placeholder="Patient name"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div class="flex items-end">
                <button
                  (click)="verifyPolicy()"
                  class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Verify Policy
                </button>
              </div>
            </div>
          </div>

          <!-- Verification Result -->
          <div *ngIf="verifiedPolicy" class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-gray-800">Policy Details</h2>
              <span
                [class]="verifiedPolicy.status === 'active' ? 'bg-green-100 text-green-800' : verifiedPolicy.status === 'expired' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'"
                class="px-3 py-1 rounded-full text-sm font-medium"
              >
                {{ verifiedPolicy.status | uppercase }}
              </span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p class="text-sm text-gray-600 mb-1">Policy Number</p>
                <p class="text-lg font-semibold text-gray-800">{{ verifiedPolicy.policyNumber }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">Patient Name</p>
                <p class="text-lg font-semibold text-gray-800">{{ verifiedPolicy.patientName }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">Insurance Provider</p>
                <p class="text-lg font-semibold text-gray-800">{{ verifiedPolicy.provider }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">Total Coverage</p>
                <p class="text-lg font-semibold text-gray-800">₹{{ verifiedPolicy.coverageAmount.toLocaleString() }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">Used Amount</p>
                <p class="text-lg font-semibold text-red-600">₹{{ verifiedPolicy.usedAmount.toLocaleString() }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">Available Amount</p>
                <p class="text-lg font-semibold text-green-600">₹{{ verifiedPolicy.availableAmount.toLocaleString() }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">Valid Until</p>
                <p class="text-lg font-semibold text-gray-800">{{ verifiedPolicy.validUntil | date:'dd/MM/yyyy' }}</p>
              </div>
            </div>

            <!-- Coverage Progress -->
            <div class="mt-6">
              <div class="flex justify-between text-sm text-gray-600 mb-2">
                <span>Coverage Used</span>
                <span>{{ ((verifiedPolicy.usedAmount / verifiedPolicy.coverageAmount) * 100).toFixed(1) }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div
                  [style.width.%]="(verifiedPolicy.usedAmount / verifiedPolicy.coverageAmount) * 100"
                  class="bg-blue-600 h-3 rounded-full transition-all"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- New Claim Tab -->
        <div *ngIf="activeTab === 'newClaim'" class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-6">Submit New Insurance Claim</h2>
          
          <form class="space-y-6">
            <!-- Patient Information -->
            <div>
              <h3 class="text-lg font-medium text-gray-800 mb-4">Patient Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Patient ID</label>
                  <input
                    type="text"
                    [(ngModel)]="newClaim.patientId"
                    name="patientId"
                    placeholder="Enter patient ID"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
                  <input
                    type="text"
                    [(ngModel)]="newClaim.patientName"
                    name="patientName"
                    placeholder="Enter patient name"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <!-- Insurance Details -->
            <div>
              <h3 class="text-lg font-medium text-gray-800 mb-4">Insurance Details</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Policy Number</label>
                  <input
                    type="text"
                    [(ngModel)]="newClaim.policyNumber"
                    name="policyNumber"
                    placeholder="Policy number"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Insurance Provider</label>
                  <select
                    [(ngModel)]="newClaim.provider"
                    name="provider"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select provider</option>
                    <option *ngFor="let provider of insuranceProviders" [value]="provider.name">
                      {{ provider.name }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Claim Details -->
            <div>
              <h3 class="text-lg font-medium text-gray-800 mb-4">Claim Details</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Treatment Date</label>
                  <input
                    type="date"
                    [(ngModel)]="newClaim.treatmentDate"
                    name="treatmentDate"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Claim Amount (₹)</label>
                  <input
                    type="number"
                    [(ngModel)]="newClaim.claimAmount"
                    name="claimAmount"
                    placeholder="0.00"
                    min="0"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Treatment Description</label>
                <textarea
                  [(ngModel)]="newClaim.description"
                  name="description"
                  rows="4"
                  placeholder="Describe the treatment and services provided..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>
            </div>

            <!-- Documents Upload -->
            <div>
              <h3 class="text-lg font-medium text-gray-800 mb-4">Supporting Documents</h3>
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  (change)="handleFileUpload($event)"
                  class="hidden"
                  #fileInput
                />
                <button
                  type="button"
                  (click)="fileInput.click()"
                  class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Upload Documents
                </button>
                <p class="text-sm text-gray-500 mt-2">Upload medical bills, prescriptions, and reports</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-4 pt-4">
              <button
                type="button"
                (click)="submitClaim()"
                class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Submit Claim
              </button>
              <button
                type="button"
                (click)="clearClaimForm()"
                class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Clear Form
              </button>
            </div>
          </form>
        </div>

        <!-- Claims List Tab -->
        <div *ngIf="activeTab === 'claimsList'" class="bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-gray-800">Insurance Claims</h2>
            <div class="flex gap-3">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Search claims..."
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                [(ngModel)]="filterStatus"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <!-- Claims Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-100">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Claim #</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Patient</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Provider</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Policy #</th>
                  <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">Claim Amount</th>
                  <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700">Approved Amount</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr *ngFor="let claim of getFilteredClaims()" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm font-medium text-blue-600">{{ claim.claimNumber }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800">{{ claim.patientName }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ claim.provider }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ claim.policyNumber }}</td>
                  <td class="px-4 py-3 text-sm text-gray-800 text-right">₹{{ claim.claimAmount.toLocaleString() }}</td>
                  <td class="px-4 py-3 text-sm font-medium text-gray-800 text-right">
                    {{ claim.approvedAmount > 0 ? '₹' + claim.approvedAmount.toLocaleString() : '-' }}
                  </td>
                  <td class="px-4 py-3">
                    <span
                      [class]="getStatusClass(claim.status)"
                      class="px-2 py-1 rounded-full text-xs font-medium"
                    >
                      {{ claim.status | uppercase }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ claim.submissionDate | date:'dd/MM/yyyy' }}</td>
                  <td class="px-4 py-3 text-center">
                    <button
                      (click)="viewClaimDetails(claim)"
                      class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Providers Tab -->
        <div *ngIf="activeTab === 'providers'" class="bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-gray-800">Insurance Providers</h2>
            <button
              (click)="addProvider()"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Provider
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div *ngFor="let provider of insuranceProviders" class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ provider.name }}</h3>
              <div class="space-y-2 text-sm text-gray-600">
                <p><span class="font-medium">ID:</span> {{ provider.id }}</p>
                <p><span class="font-medium">Contact:</span> {{ provider.contactNumber }}</p>
                <p><span class="font-medium">Email:</span> {{ provider.email }}</p>
              </div>
              <div class="mt-4 flex gap-2">
                <button class="flex-1 px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm">
                  Edit
                </button>
                <button class="flex-1 px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm">
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `
})

export class AdminInsuranceComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    activeTab = 'verification';
    tabs = [
        { id: 'verification', label: 'Policy Verification' },
        { id: 'newClaim', label: 'New Claim' },
        { id: 'claimsList', label: 'Claims List' },
        { id: 'providers', label: 'Insurance Providers' }
    ];

    verificationForm = {
        policyNumber: '',
        patientName: ''
    };

    verifiedPolicy: PolicyVerification | null = null;

    newClaim = {
        patientId: '',
        patientName: '',
        policyNumber: '',
        provider: '',
        treatmentDate: '',
        claimAmount: 0,
        description: ''
    };

    claims: InsuranceClaim[] = [];
    searchQuery = '';
    filterStatus = '';

    insuranceProviders: InsuranceProvider[] = [
        { id: 'INS001', name: 'Star Health Insurance', contactNumber: '+91-9876543210', email: 'support@starhealth.in' },
        { id: 'INS002', name: 'HDFC ERGO', contactNumber: '+91-9876543211', email: 'claims@hdfcergo.com' },
        { id: 'INS003', name: 'ICICI Lombard', contactNumber: '+91-9876543212', email: 'service@icicilombard.com' },
        { id: 'INS004', name: 'Max Bupa', contactNumber: '+91-9876543213', email: 'info@maxbupa.com' },
        { id: 'INS005', name: 'Care Health', contactNumber: '+91-9876543214', email: 'support@careinsurance.com' },
        { id: 'INS006', name: 'New India Assurance', contactNumber: '+91-9876543215', email: 'contact@newindia.co.in' }
    ];
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit() {
        this.loadSampleClaims();
    }
    // #endregion

    // #region Methods
    loadSampleClaims() {
        this.claims = [
            {
                id: '1',
                claimNumber: 'CLM2024120001',
                patientName: 'Rajesh Kumar',
                patientId: 'PAT001',
                policyNumber: 'POL123456',
                provider: 'Star Health Insurance',
                claimAmount: 50000,
                approvedAmount: 45000,
                status: 'approved',
                submissionDate: new Date('2024-12-15'),
                treatmentDate: new Date('2024-12-10'),
                description: 'Cardiac surgery and post-operative care'
            },
            {
                id: '2',
                claimNumber: 'CLM2024120002',
                patientName: 'Priya Sharma',
                patientId: 'PAT002',
                policyNumber: 'POL789012',
                provider: 'HDFC ERGO',
                claimAmount: 25000,
                approvedAmount: 0,
                status: 'pending',
                submissionDate: new Date('2024-12-18'),
                treatmentDate: new Date('2024-12-15'),
                description: 'Orthopedic consultation and treatment'
            },
            {
                id: '3',
                claimNumber: 'CLM2024120003',
                patientName: 'Amit Patel',
                patientId: 'PAT003',
                policyNumber: 'POL345678',
                provider: 'ICICI Lombard',
                claimAmount: 35000,
                approvedAmount: 0,
                status: 'processing',
                submissionDate: new Date('2024-12-17'),
                treatmentDate: new Date('2024-12-12'),
                description: 'Emergency treatment for accident injuries'
            }
        ];
    }

    verifyPolicy() {
        if (!this.verificationForm.policyNumber) {
            alert('Please enter a policy number');
            return;
        }

        // Simulated verification
        this.verifiedPolicy = {
            policyNumber: this.verificationForm.policyNumber,
            patientName: this.verificationForm.patientName || 'John Doe',
            provider: 'Star Health Insurance',
            coverageAmount: 500000,
            usedAmount: 125000,
            availableAmount: 375000,
            validUntil: new Date('2025-12-31'),
            status: 'active'
        };
    }

    submitClaim() {
        if (!this.newClaim.patientId || !this.newClaim.policyNumber || !this.newClaim.claimAmount) {
            alert('Please fill all required fields');
            return;
        }

        const claim: InsuranceClaim = {
            id: (this.claims.length + 1).toString(),
            claimNumber: `CLM${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${(this.claims.length + 1).toString().padStart(4, '0')}`,
            patientName: this.newClaim.patientName,
            patientId: this.newClaim.patientId,
            policyNumber: this.newClaim.policyNumber,
            provider: this.newClaim.provider,
            claimAmount: this.newClaim.claimAmount,
            approvedAmount: 0,
            status: 'pending',
            submissionDate: new Date(),
            treatmentDate: new Date(this.newClaim.treatmentDate),
            description: this.newClaim.description
        };

        this.claims.unshift(claim);
        alert(`Claim submitted successfully!\nClaim Number: ${claim.claimNumber}`);
        this.clearClaimForm();
        this.activeTab = 'claimsList';
    }

    clearClaimForm() {
        this.newClaim = {
            patientId: '',
            patientName: '',
            policyNumber: '',
            provider: '',
            treatmentDate: '',
            claimAmount: 0,
            description: ''
        };
    }

    getFilteredClaims(): InsuranceClaim[] {
        return this.claims.filter(claim => {
            const matchesSearch = !this.searchQuery ||
                claim.claimNumber.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                claim.patientName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                claim.policyNumber.toLowerCase().includes(this.searchQuery.toLowerCase());

            const matchesStatus = !this.filterStatus || claim.status === this.filterStatus;

            return matchesSearch && matchesStatus;
        });
    }

    getStatusClass(status: string): string {
        const statusClasses: { [key: string]: string } = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800'
        };
        return statusClasses[status] || 'bg-gray-100 text-gray-800';
    }

    viewClaimDetails(claim: InsuranceClaim) {
        alert(`Claim Details:\n\nClaim Number: ${claim.claimNumber}\nPatient: ${claim.patientName}\nAmount: ₹${claim.claimAmount.toLocaleString()}\nStatus: ${claim.status.toUpperCase()}`);
    }

    handleFileUpload(event: any) {
        const files = event.target.files;
        console.log('Files uploaded:', files);
        // Implement file upload logic here
    }

    addProvider() {
        alert('Add provider functionality - Create a modal or new form');
    }
    // #endregion
}