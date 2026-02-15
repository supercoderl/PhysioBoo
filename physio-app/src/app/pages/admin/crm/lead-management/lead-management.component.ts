import { Component, OnInit } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { Lead } from "../../../../shared/types/lead";

@Component({
    selector: 'admin-lead-management',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
    <div class="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
  <div class="max-w-7xl mx-auto">
    
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Lead Management</h1>
      <p class="mt-1 text-sm text-gray-600">Manage and track all hospital leads</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-surface rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-blue-500 rounded-md p-3">
            <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Leads</p>
            <p class="text-2xl font-semibold text-gray-900">{{leads.length}}</p>
          </div>
        </div>
      </div>

      <div class="bg-surface rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-yellow-500 rounded-md p-3">
            <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">New Leads</p>
            <p class="text-2xl font-semibold text-gray-900">{{(leads | filter:'status':'new').length}}</p>
          </div>
        </div>
      </div>

      <div class="bg-surface rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-green-500 rounded-md p-3">
            <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Converted</p>
            <p class="text-2xl font-semibold text-gray-900">{{(leads | filter:'status':'converted').length}}</p>
          </div>
        </div>
      </div>

      <div class="bg-surface rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-purple-500 rounded-md p-3">
            <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Qualified</p>
            <p class="text-2xl font-semibold text-gray-900">{{(leads | filter:'status':'qualified').length}}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Actions -->
    <div class="bg-surface rounded-lg shadow mb-6 p-4">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex-1 flex flex-col sm:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1">
            <input 
              type="text" 
              [(ngModel)]="searchTerm"
              (ngModelChange)="applyFilters()"
              placeholder="Search by name, email, or phone..." 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Status Filter -->
          <select 
            [(ngModel)]="filterStatus"
            (ngModelChange)="applyFilters()"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>

          <!-- Priority Filter -->
          <select 
            [(ngModel)]="filterPriority"
            (ngModelChange)="applyFilters()"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <!-- Add Button -->
        <button 
          (click)="openAddModal()"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add New Lead
        </button>
      </div>
    </div>

    <!-- Leads Table -->
    <div class="bg-surface rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-surface divide-y divide-gray-200">
            <tr *ngFor="let lead of filteredLeads" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{lead.name}}</div>
                <div class="text-sm text-gray-500">ID: {{lead.id}}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{lead.phone}}</div>
                <div class="text-sm text-gray-500">{{lead.email}}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{lead.service}}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full {{getStatusClass(lead.status)}}">
                  {{lead.status | titlecase}}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full {{getPriorityClass(lead.priority)}}">
                  {{lead.priority | titlecase}}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{lead.assignedTo}}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{lead.source}}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button 
                  (click)="openEditModal(lead)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Edit
                </button>
                <button 
                  (click)="deleteLead(lead.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>

            <tr *ngIf="filteredLeads.length === 0">
              <td colspan="8" class="px-6 py-8 text-center text-gray-500">
                No leads found. Try adjusting your filters or add a new lead.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</div>

<!-- Add Lead Modal -->
<div *ngIf="showAddModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
  <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-lg bg-surface">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold text-gray-900">Add New Lead</h3>
      <button (click)="closeAddModal()" class="text-gray-400 hover:text-gray-600">
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input type="text" [(ngModel)]="newLead.name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
        <input type="tel" [(ngModel)]="newLead.phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input type="email" [(ngModel)]="newLead.email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Service *</label>
        <select [(ngModel)]="newLead.service" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
          <option value="">Select Service</option>
          <option *ngFor="let service of services" [value]="service">{{service}}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select [(ngModel)]="newLead.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
        <select [(ngModel)]="newLead.priority" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Source *</label>
        <select [(ngModel)]="newLead.source" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
          <option value="">Select Source</option>
          <option *ngFor="let source of sources" [value]="source">{{source}}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
        <select [(ngModel)]="newLead.assignedTo" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="">Select Staff</option>
          <option *ngFor="let staff of staff" [value]="staff">{{staff}}</option>
        </select>
      </div>

      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea [(ngModel)]="newLead.notes" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
      </div>
    </div>

    <div class="flex justify-end gap-3 mt-6">
      <button (click)="closeAddModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
        Cancel
      </button>
      <button (click)="saveLead()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Save Lead
      </button>
    </div>
  </div>
</div>

<!-- Edit Lead Modal -->
<div *ngIf="showEditModal && selectedLead" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
  <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-lg bg-surface">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold text-gray-900">Edit Lead</h3>
      <button (click)="closeEditModal()" class="text-gray-400 hover:text-gray-600">
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input type="text" [(ngModel)]="selectedLead.name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
        <input type="tel" [(ngModel)]="selectedLead.phone" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input type="email" [(ngModel)]="selectedLead.email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Service *</label>
        <select [(ngModel)]="selectedLead.service" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option *ngFor="let service of services" [value]="service">{{service}}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select [(ngModel)]="selectedLead.status" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
        <select [(ngModel)]="selectedLead.priority" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Source *</label>
        <select [(ngModel)]="selectedLead.source" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option *ngFor="let source of sources" [value]="source">{{source}}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
        <select [(ngModel)]="selectedLead.assignedTo" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option *ngFor="let staff of staff" [value]="staff">{{staff}}</option>
        </select>
      </div>

      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea [(ngModel)]="selectedLead.notes" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
      </div>
    </div>

    <div class="flex justify-end gap-3 mt-6">
      <button (click)="closeEditModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
        Cancel
      </button>
      <button (click)="updateLead()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Update Lead
      </button>
    </div>
  </div>
</div>
    `
})

export class AdminLeadManagementComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    leads: Lead[] = [];
    filteredLeads: Lead[] = [];
    showAddModal = false;
    showEditModal = false;
    selectedLead: Lead | null = null;
    searchTerm = '';
    filterStatus = 'all';
    filterPriority = 'all';

    newLead: Partial<Lead> = {
        name: '',
        phone: '',
        email: '',
        service: '',
        status: 'new',
        priority: 'medium',
        source: '',
        assignedTo: '',
        notes: ''
    };

    services = ['Consultation', 'Surgery', 'Diagnostics', 'Emergency', 'Pharmacy', 'Physiotherapy'];
    sources = ['Website', 'Phone Call', 'Walk-in', 'Referral', 'Social Media', 'Advertisement'];
    staff = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Nurse Brown', 'Admin Davis'];
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit() {
        this.loadSampleData();
        this.applyFilters();
    }
    // #endregion

    // #region Methods 
    loadSampleData() {
        this.leads = [
            {
                id: 1,
                name: 'John Doe',
                phone: '+1 234-567-8900',
                email: 'john.doe@email.com',
                service: 'Consultation',
                status: 'new',
                priority: 'high',
                source: 'Website',
                assignedTo: 'Dr. Smith',
                notes: 'Patient interested in cardiology consultation',
                createdAt: new Date('2024-01-15')
            },
            {
                id: 2,
                name: 'Jane Smith',
                phone: '+1 234-567-8901',
                email: 'jane.smith@email.com',
                service: 'Surgery',
                status: 'contacted',
                priority: 'high',
                source: 'Referral',
                assignedTo: 'Dr. Johnson',
                notes: 'Knee replacement surgery scheduled',
                createdAt: new Date('2024-01-14')
            },
            {
                id: 3,
                name: 'Robert Brown',
                phone: '+1 234-567-8902',
                email: 'robert.brown@email.com',
                service: 'Diagnostics',
                status: 'qualified',
                priority: 'medium',
                source: 'Phone Call',
                assignedTo: 'Dr. Williams',
                notes: 'MRI scan required',
                createdAt: new Date('2024-01-13')
            }
        ];
    }

    applyFilters() {
        this.filteredLeads = this.leads.filter(lead => {
            const matchesSearch = lead.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                lead.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                lead.phone.includes(this.searchTerm);
            const matchesStatus = this.filterStatus === 'all' || lead.status === this.filterStatus;
            const matchesPriority = this.filterPriority === 'all' || lead.priority === this.filterPriority;
            return matchesSearch && matchesStatus && matchesPriority;
        });
    }

    openAddModal() {
        this.newLead = {
            name: '',
            phone: '',
            email: '',
            service: '',
            status: 'new',
            priority: 'medium',
            source: '',
            assignedTo: '',
            notes: ''
        };
        this.showAddModal = true;
    }

    closeAddModal() {
        this.showAddModal = false;
    }

    saveLead() {
        const lead: Lead = {
            id: this.leads.length + 1,
            name: this.newLead.name || '',
            phone: this.newLead.phone || '',
            email: this.newLead.email || '',
            service: this.newLead.service || '',
            status: this.newLead.status as any || 'new',
            priority: this.newLead.priority as any || 'medium',
            source: this.newLead.source || '',
            assignedTo: this.newLead.assignedTo || '',
            notes: this.newLead.notes || '',
            createdAt: new Date()
        };
        this.leads.unshift(lead);
        this.applyFilters();
        this.closeAddModal();
    }

    openEditModal(lead: Lead) {
        this.selectedLead = { ...lead };
        this.showEditModal = true;
    }

    closeEditModal() {
        this.showEditModal = false;
        this.selectedLead = null;
    }

    updateLead() {
        if (this.selectedLead) {
            const index = this.leads.findIndex(l => l.id === this.selectedLead!.id);
            if (index !== -1) {
                this.leads[index] = { ...this.selectedLead };
                this.applyFilters();
                this.closeEditModal();
            }
        }
    }

    deleteLead(id: number) {
        if (confirm('Are you sure you want to delete this lead?')) {
            this.leads = this.leads.filter(l => l.id !== id);
            this.applyFilters();
        }
    }

    getStatusClass(status: string): string {
        const classes: { [key: string]: string } = {
            'new': 'bg-blue-100 text-blue-800',
            'contacted': 'bg-yellow-100 text-yellow-800',
            'qualified': 'bg-purple-100 text-purple-800',
            'converted': 'bg-green-100 text-green-800',
            'lost': 'bg-red-100 text-red-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }

    getPriorityClass(priority: string): string {
        const classes: { [key: string]: string } = {
            'high': 'bg-red-100 text-red-800',
            'medium': 'bg-yellow-100 text-yellow-800',
            'low': 'bg-green-100 text-green-800'
        };
        return classes[priority] || 'bg-gray-100 text-gray-800';
    }
    // #endregion
}