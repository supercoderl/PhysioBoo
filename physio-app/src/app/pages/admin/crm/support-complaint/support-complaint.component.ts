import { Component } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { Complaint } from "../../../../shared/types/complaint";

@Component({
    selector: 'admin-support-complaint',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Support & Complaints</h1>
          <p class="mt-2 text-gray-600">Submit and track your complaints and support requests</p>
        </div>

        <!-- Tab Navigation -->
        <div class="mb-6 border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              (click)="activeTab = 'submit'"
              [class.border-blue-500]="activeTab === 'submit'"
              [class.text-blue-600]="activeTab === 'submit'"
              [class.border-transparent]="activeTab !== 'submit'"
              [class.text-gray-500]="activeTab !== 'submit'"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm hover:text-blue-600 hover:border-blue-300 transition-colors">
              Submit Complaint
            </button>
            <button
              (click)="activeTab = 'track'"
              [class.border-blue-500]="activeTab === 'track'"
              [class.text-blue-600]="activeTab === 'track'"
              [class.border-transparent]="activeTab !== 'track'"
              [class.text-gray-500]="activeTab !== 'track'"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm hover:text-blue-600 hover:border-blue-300 transition-colors">
              Track Complaints
            </button>
            <button
              (click)="activeTab = 'faq'"
              [class.border-blue-500]="activeTab === 'faq'"
              [class.text-blue-600]="activeTab === 'faq'"
              [class.border-transparent]="activeTab !== 'faq'"
              [class.text-gray-500]="activeTab !== 'faq'"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm hover:text-blue-600 hover:border-blue-300 transition-colors">
              FAQ
            </button>
          </nav>
        </div>

        <!-- Submit Complaint Form -->
        <div *ngIf="activeTab === 'submit'" class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Submit a New Complaint</h2>
          
          <form (ngSubmit)="submitComplaint()" #complaintForm="ngForm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Patient Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Patient Name <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  [(ngModel)]="newComplaint.patientName"
                  name="patientName"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter patient name">
              </div>

              <!-- Patient ID -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Patient ID
                </label>
                <input
                  type="text"
                  [(ngModel)]="newComplaint.patientId"
                  name="patientId"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter patient ID">
              </div>

              <!-- Contact Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email <span class="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  [(ngModel)]="newComplaint.email"
                  name="email"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="your.email@example.com">
              </div>

              <!-- Contact Phone -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone <span class="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  [(ngModel)]="newComplaint.phone"
                  name="phone"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="+84 xxx xxx xxx">
              </div>

              <!-- Category -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Category <span class="text-red-500">*</span>
                </label>
                <select
                  [(ngModel)]="newComplaint.category"
                  name="category"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                  <option value="">Select a category</option>
                  <option value="medical">Medical Services</option>
                  <option value="billing">Billing & Insurance</option>
                  <option value="facility">Facility & Equipment</option>
                  <option value="staff">Staff Behavior</option>
                  <option value="appointment">Appointment Issues</option>
                  <option value="pharmacy">Pharmacy Services</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <!-- Priority -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Priority <span class="text-red-500">*</span>
                </label>
                <select
                  [(ngModel)]="newComplaint.priority"
                  name="priority"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                  <option value="">Select priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <!-- Subject -->
            <div class="mt-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Subject <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                [(ngModel)]="newComplaint.subject"
                name="subject"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Brief description of your complaint">
            </div>

            <!-- Description -->
            <div class="mt-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Detailed Description <span class="text-red-500">*</span>
              </label>
              <textarea
                [(ngModel)]="newComplaint.description"
                name="description"
                required
                rows="5"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Please provide detailed information about your complaint..."></textarea>
            </div>

            <!-- File Upload -->
            <div class="mt-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Attach Files (Optional)
              </label>
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input type="file" class="hidden" #fileInput multiple (change)="onFileSelect($event)">
                <button
                  type="button"
                  (click)="fileInput.click()"
                  class="text-blue-600 hover:text-blue-700 font-medium">
                  Click to upload
                </button>
                <p class="text-sm text-gray-500 mt-1">or drag and drop</p>
                <p class="text-xs text-gray-400 mt-1">PNG, JPG, PDF up to 10MB</p>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                (click)="resetForm(complaintForm)"
                class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                Reset
              </button>
              <button
                type="submit"
                [disabled]="!complaintForm.valid"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                Submit Complaint
              </button>
            </div>
          </form>
        </div>

        <!-- Track Complaints -->
        <div *ngIf="activeTab === 'track'">
          <!-- Search Bar -->
          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <div class="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Search by complaint ID or subject..."
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
              <select
                [(ngModel)]="filterStatus"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <!-- Complaints List -->
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let complaint of filteredComplaints" class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{complaint.id}}</td>
                    <td class="px-6 py-4 text-sm text-gray-900">{{complaint.subject}}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{complaint.category}}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span [ngClass]="{
                        'bg-red-100 text-red-800': complaint.priority === 'urgent',
                        'bg-orange-100 text-orange-800': complaint.priority === 'high',
                        'bg-yellow-100 text-yellow-800': complaint.priority === 'medium',
                        'bg-green-100 text-green-800': complaint.priority === 'low'
                      }" class="px-2 py-1 text-xs font-semibold rounded-full">
                        {{complaint.priority}}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span [ngClass]="{
                        'bg-gray-100 text-gray-800': complaint.status === 'pending',
                        'bg-blue-100 text-blue-800': complaint.status === 'in-progress',
                        'bg-green-100 text-green-800': complaint.status === 'resolved',
                        'bg-purple-100 text-purple-800': complaint.status === 'closed'
                      }" class="px-2 py-1 text-xs font-semibold rounded-full">
                        {{complaint.status}}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{complaint.date}}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      <button (click)="viewDetails(complaint)" class="text-blue-600 hover:text-blue-800 font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- FAQ Section -->
        <div *ngIf="activeTab === 'faq'" class="space-y-4">
          <div *ngFor="let faq of faqs; let i = index" class="bg-white rounded-lg shadow-md overflow-hidden">
            <button
              (click)="toggleFaq(i)"
              class="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors">
              <span class="font-medium text-gray-900">{{faq.question}}</span>
              <svg
                [class.rotate-180]="faq.open"
                class="w-5 h-5 text-gray-500 transform transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            <div *ngIf="faq.open" class="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p class="text-gray-700">{{faq.answer}}</p>
            </div>
          </div>
        </div>

        <!-- Success Message -->
        <div *ngIf="showSuccess" class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-fade-in">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>Complaint submitted successfully!</span>
        </div>
      </div>
    </div>
    `,
    styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(1rem); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.3s ease-out;
    }
  `]
})

export class AdminSupportComplaintComponent {
    // #region Inputs, Outputs, Properties
    activeTab: 'submit' | 'track' | 'faq' = 'submit';
    searchQuery = '';
    filterStatus = '';
    showSuccess = false;

    newComplaint = {
        patientName: '',
        patientId: '',
        email: '',
        phone: '',
        category: '',
        priority: '',
        subject: '',
        description: ''
    };

    complaints: Complaint[] = [
        {
            id: 'CMP-001',
            subject: 'Long waiting time in emergency',
            category: 'Medical Services',
            priority: 'high',
            status: 'in-progress',
            date: '2024-12-20',
            description: 'Waited over 3 hours in emergency'
        },
        {
            id: 'CMP-002',
            subject: 'Incorrect billing amount',
            category: 'Billing & Insurance',
            priority: 'medium',
            status: 'pending',
            date: '2024-12-19',
            description: 'Bill shows incorrect charges'
        },
        {
            id: 'CMP-003',
            subject: 'Rude staff behavior',
            category: 'Staff Behavior',
            priority: 'urgent',
            status: 'resolved',
            date: '2024-12-18',
            description: 'Reception staff was unhelpful'
        }
    ];

    faqs = [
        {
            question: 'How long does it take to resolve a complaint?',
            answer: 'Most complaints are resolved within 5-7 business days. Urgent complaints are prioritized and typically addressed within 24-48 hours.',
            open: false
        },
        {
            question: 'Can I track my complaint status?',
            answer: 'Yes, you can track your complaint using the complaint ID provided when you submit. Go to the "Track Complaints" tab to view the current status.',
            open: false
        },
        {
            question: 'What information do I need to submit a complaint?',
            answer: 'You need to provide your name, contact information, complaint category, priority level, and a detailed description of the issue.',
            open: false
        },
        {
            question: 'Can I attach files to my complaint?',
            answer: 'Yes, you can attach relevant documents, images, or files (up to 10MB each) to support your complaint.',
            open: false
        },
        {
            question: 'Who will handle my complaint?',
            answer: 'Your complaint will be assigned to the appropriate department based on the category you select. You will receive updates via email.',
            open: false
        }
    ];

    get filteredComplaints(): Complaint[] {
        return this.complaints.filter(c => {
            const matchesSearch = !this.searchQuery ||
                c.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                c.subject.toLowerCase().includes(this.searchQuery.toLowerCase());
            const matchesStatus = !this.filterStatus || c.status === this.filterStatus;
            return matchesSearch && matchesStatus;
        });
    }
    // #endregion

    // #region Methods
    submitComplaint() {
        console.log('Submitting complaint:', this.newComplaint);
        this.showSuccess = true;
        setTimeout(() => {
            this.showSuccess = false;
            this.activeTab = 'track';
        }, 2000);
    }

    resetForm(form: any) {
        form.reset();
        this.newComplaint = {
            patientName: '',
            patientId: '',
            email: '',
            phone: '',
            category: '',
            priority: '',
            subject: '',
            description: ''
        };
    }

    onFileSelect(event: any) {
        const files = event.target.files;
        console.log('Files selected:', files);
    }

    viewDetails(complaint: Complaint) {
        console.log('Viewing details for:', complaint);
        alert(`Complaint Details:\n\nID: ${complaint.id}\nSubject: ${complaint.subject}\nDescription: ${complaint.description}`);
    }

    toggleFaq(index: number) {
        this.faqs[index].open = !this.faqs[index].open;
    }
    // #endregion
}