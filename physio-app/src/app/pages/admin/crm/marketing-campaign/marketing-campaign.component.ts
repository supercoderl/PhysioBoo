import { Component } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { Campaign } from "../../../../shared/types/campaign";
import { AudienceSegment } from "../../../../shared/types/audience-segment";

@Component({
    selector: 'admin-marketing-campaign',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <!-- Header Section -->
      <div class="bg-surface rounded-lg shadow-sm p-6 mb-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-semibold text-gray-800">Marketing Campaigns</h2>
            <p class="text-gray-600 mt-1">Create and manage your hospital marketing campaigns</p>
          </div>
          <button 
            (click)="showCreateModal = true"
            class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <span>+ Create Campaign</span>
          </button>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-surface rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Total Campaigns</p>
              <p class="text-3xl font-bold text-gray-900">{{ campaigns.length }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-surface rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Active Campaigns</p>
              <p class="text-3xl font-bold text-green-600">{{ getActiveCampaigns() }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-surface rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Total Reach</p>
              <p class="text-3xl font-bold text-purple-600">{{ getTotalReach() | number }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-surface rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Conversions</p>
              <p class="text-3xl font-bold text-orange-600">{{ getTotalConversions() | number }}</p>
            </div>
            <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-surface rounded-lg shadow-sm p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input 
              type="text" 
              [(ngModel)]="searchTerm"
              placeholder="Search campaigns..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Campaign Type</label>
            <select 
              [(ngModel)]="filterType"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="social">Social Media</option>
              <option value="multi-channel">Multi-Channel</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select 
              [(ngModel)]="filterStatus"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          <div class="flex items-end gap-2">
            <button 
              (click)="applyFilters()"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Apply
            </button>
            <button 
              (click)="clearFilters()"
              class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Campaigns Grid/List -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Campaigns</h3>
          <div class="flex gap-2">
            <button 
              (click)="viewMode = 'grid'"
              [class.bg-blue-100]="viewMode === 'grid'"
              [class.text-blue-600]="viewMode === 'grid'"
              class="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Grid View
            </button>
            <button 
              (click)="viewMode = 'list'"
              [class.bg-blue-100]="viewMode === 'list'"
              [class.text-blue-600]="viewMode === 'list'"
              class="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              List View
            </button>
          </div>
        </div>

        <!-- Grid View -->
        <div *ngIf="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let campaign of filteredCampaigns" 
               class="bg-surface rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
            <div class="p-6">
              <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                  <h4 class="text-lg font-semibold text-gray-900 mb-1">{{ campaign.name }}</h4>
                  <p class="text-sm text-gray-600">{{ campaign.targetAudience }}</p>
                </div>
                <span [ngClass]="{
                  'bg-gray-100 text-gray-800': campaign.status === 'draft',
                  'bg-blue-100 text-blue-800': campaign.status === 'scheduled',
                  'bg-green-100 text-green-800': campaign.status === 'active',
                  'bg-purple-100 text-purple-800': campaign.status === 'completed',
                  'bg-yellow-100 text-yellow-800': campaign.status === 'paused'
                }" class="px-3 py-1 rounded-full text-xs font-medium">
                  {{ campaign.status | titlecase }}
                </span>
              </div>

              <div class="space-y-3 mb-4">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Type:</span>
                  <span class="font-medium text-gray-900">{{ getCampaignTypeLabel(campaign.type) }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Duration:</span>
                  <span class="font-medium text-gray-900">{{ campaign.startDate }} - {{ campaign.endDate }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Budget:</span>
                  <span class="font-medium text-gray-900">\${{ campaign.budget | number }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Spent:</span>
                  <span class="font-medium text-gray-900">\${{ campaign.spent | number }}</span>
                </div>
              </div>

              <div class="mb-4">
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-gray-600">Budget Usage</span>
                  <span class="font-medium text-gray-900">{{ getBudgetPercentage(campaign) }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-blue-600 h-2 rounded-full transition-all"
                    [style.width.%]="getBudgetPercentage(campaign)"
                  ></div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p class="text-xs text-gray-600">Reach</p>
                  <p class="text-lg font-semibold text-gray-900">{{ campaign.reach | number }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-600">Conversions</p>
                  <p class="text-lg font-semibold text-gray-900">{{ campaign.conversions | number }}</p>
                </div>
              </div>

              <div class="flex gap-2">
                <button 
                  (click)="viewCampaign(campaign)"
                  class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  View Details
                </button>
                <button 
                  (click)="editCampaign(campaign)"
                  class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- List View -->
        <div *ngIf="viewMode === 'list'" class="bg-surface rounded-lg shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50 border-b border-gray-200">
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Campaign Name</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Target Audience</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Budget</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Reach</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Conversions</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let campaign of filteredCampaigns" 
                    class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4">
                    <p class="font-medium text-gray-900">{{ campaign.name }}</p>
                    <p class="text-sm text-gray-500">{{ campaign.id }}</p>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-gray-700">{{ getCampaignTypeLabel(campaign.type) }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span [ngClass]="{
                      'bg-gray-100 text-gray-800': campaign.status === 'draft',
                      'bg-blue-100 text-blue-800': campaign.status === 'scheduled',
                      'bg-green-100 text-green-800': campaign.status === 'active',
                      'bg-purple-100 text-purple-800': campaign.status === 'completed',
                      'bg-yellow-100 text-yellow-800': campaign.status === 'paused'
                    }" class="px-3 py-1 rounded-full text-xs font-medium">
                      {{ campaign.status | titlecase }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-gray-700">{{ campaign.targetAudience }}</td>
                  <td class="px-6 py-4">
                    <p class="text-sm text-gray-700">{{ campaign.startDate }}</p>
                    <p class="text-sm text-gray-500">to {{ campaign.endDate }}</p>
                  </td>
                  <td class="px-6 py-4">
                    <p class="font-medium text-gray-900">\${{ campaign.budget | number }}</p>
                    <p class="text-sm text-gray-500">Spent: \${{ campaign.spent | number }}</p>
                  </td>
                  <td class="px-6 py-4 font-medium text-gray-900">{{ campaign.reach | number }}</td>
                  <td class="px-6 py-4 font-medium text-gray-900">{{ campaign.conversions | number }}</td>
                  <td class="px-6 py-4">
                    <div class="flex gap-2">
                      <button 
                        (click)="viewCampaign(campaign)"
                        class="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        View
                      </button>
                      <button 
                        (click)="editCampaign(campaign)"
                        class="text-gray-600 hover:text-gray-800 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button 
                        *ngIf="campaign.status === 'active'"
                        (click)="pauseCampaign(campaign)"
                        class="text-yellow-600 hover:text-yellow-800 font-medium text-sm"
                      >
                        Pause
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Create Campaign Modal -->
      <div *ngIf="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-surface rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-xl font-semibold text-gray-900">Create New Campaign</h3>
          </div>
          
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
              <input 
                type="text" 
                [(ngModel)]="newCampaign.name"
                placeholder="Enter campaign name"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Campaign Type</label>
              <select 
                [(ngModel)]="newCampaign.type"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="social">Social Media</option>
                <option value="multi-channel">Multi-Channel</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
              <select 
                [(ngModel)]="newCampaign.targetAudience"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select audience segment</option>
                <option *ngFor="let segment of audienceSegments" [value]="segment.name">
                  {{ segment.name }} ({{ segment.count }} people)
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input 
                  type="date" 
                  [(ngModel)]="newCampaign.startDate"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input 
                  type="date" 
                  [(ngModel)]="newCampaign.endDate"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Budget ($)</label>
              <input 
                type="number" 
                [(ngModel)]="newCampaign.budget"
                placeholder="0.00"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea 
                [(ngModel)]="newCampaign.description"
                rows="4"
                placeholder="Enter campaign description..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>
          </div>

          <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button 
              (click)="showCreateModal = false"
              class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button 
              (click)="saveDraft()"
              class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Save as Draft
            </button>
            <button 
              (click)="createCampaign()"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create & Launch
            </button>
          </div>
        </div>
      </div>
    </div>
    `
})

export class AdminMarketingCampaignComponent {
    // #region Inputs, Outputs, Properties
    searchTerm = '';
    filterType = '';
    filterStatus = '';
    viewMode: 'grid' | 'list' = 'grid';
    showCreateModal = false;

    newCampaign: any = {
        name: '',
        type: 'email',
        targetAudience: '',
        startDate: '',
        endDate: '',
        budget: 0,
        description: ''
    };

    audienceSegments: AudienceSegment[] = [
        { id: '1', name: 'New Patients', count: 1250, criteria: 'Registered in last 3 months' },
        { id: '2', name: 'Senior Citizens', count: 3420, criteria: 'Age 65+' },
        { id: '3', name: 'Chronic Patients', count: 2180, criteria: 'Multiple visits' },
        { id: '4', name: 'Preventive Care', count: 5670, criteria: 'Annual checkup due' },
        { id: '5', name: 'Maternity', count: 890, criteria: 'Pregnant or recent mothers' }
    ];

    campaigns: Campaign[] = [
        {
            id: 'CMP-001',
            name: 'Annual Health Checkup Drive',
            type: 'multi-channel',
            status: 'active',
            targetAudience: 'Preventive Care',
            startDate: '2024-12-01',
            endDate: '2024-12-31',
            budget: 15000,
            spent: 8500,
            reach: 12500,
            conversions: 450,
            description: 'Promote annual health checkups with special discounts',
            createdBy: 'Marketing Team',
            createdDate: '2024-11-25'
        },
        {
            id: 'CMP-002',
            name: 'Senior Wellness Program',
            type: 'email',
            status: 'active',
            targetAudience: 'Senior Citizens',
            startDate: '2024-12-15',
            endDate: '2025-01-15',
            budget: 8000,
            spent: 2400,
            reach: 3200,
            conversions: 180,
            description: 'Special wellness packages for senior citizens',
            createdBy: 'Marketing Team',
            createdDate: '2024-12-10'
        },
        {
            id: 'CMP-003',
            name: 'New Year Health Goals',
            type: 'social',
            status: 'scheduled',
            targetAudience: 'New Patients',
            startDate: '2025-01-01',
            endDate: '2025-01-31',
            budget: 12000,
            spent: 0,
            reach: 0,
            conversions: 0,
            description: 'New year campaign for fitness and health goals',
            createdBy: 'Marketing Team',
            createdDate: '2024-12-18'
        },
        {
            id: 'CMP-004',
            name: 'Diabetes Awareness Campaign',
            type: 'sms',
            status: 'completed',
            targetAudience: 'Chronic Patients',
            startDate: '2024-11-01',
            endDate: '2024-11-30',
            budget: 5000,
            spent: 4800,
            reach: 8900,
            conversions: 320,
            description: 'Diabetes screening and awareness program',
            createdBy: 'Marketing Team',
            createdDate: '2024-10-20'
        },
        {
            id: 'CMP-005',
            name: 'Maternity Care Package',
            type: 'email',
            status: 'paused',
            targetAudience: 'Maternity',
            startDate: '2024-12-01',
            endDate: '2025-02-28',
            budget: 10000,
            spent: 3500,
            reach: 650,
            conversions: 45,
            description: 'Comprehensive maternity care packages',
            createdBy: 'Marketing Team',
            createdDate: '2024-11-28'
        },
        {
            id: 'CMP-006',
            name: 'Heart Health Initiative',
            type: 'multi-channel',
            status: 'draft',
            targetAudience: 'Senior Citizens',
            startDate: '2025-02-01',
            endDate: '2025-02-28',
            budget: 18000,
            spent: 0,
            reach: 0,
            conversions: 0,
            description: 'Cardiovascular health screening and education',
            createdBy: 'Marketing Team',
            createdDate: '2024-12-20'
        }
    ];

    filteredCampaigns: Campaign[] = [...this.campaigns];
    // #endregion

    // #region Methods
    getActiveCampaigns(): number {
        return this.campaigns.filter(c => c.status === 'active').length;
    }

    getTotalReach(): number {
        return this.campaigns.reduce((sum, c) => sum + c.reach, 0);
    }

    getTotalConversions(): number {
        return this.campaigns.reduce((sum, c) => sum + c.conversions, 0);
    }

    getBudgetPercentage(campaign: Campaign): number {
        return Math.round((campaign.spent / campaign.budget) * 100);
    }

    getCampaignTypeLabel(type: string): string {
        const labels: { [key: string]: string } = {
            'email': 'Email',
            'sms': 'SMS',
            'social': 'Social Media',
            'multi-channel': 'Multi-Channel'
        };
        return labels[type] || type;
    }

    applyFilters() {
        this.filteredCampaigns = this.campaigns.filter(campaign => {
            const matchesSearch = !this.searchTerm ||
                campaign.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                campaign.id.toLowerCase().includes(this.searchTerm.toLowerCase());

            const matchesType = !this.filterType || campaign.type === this.filterType;
            const matchesStatus = !this.filterStatus || campaign.status === this.filterStatus;

            return matchesSearch && matchesType && matchesStatus;
        });
    }

    clearFilters() {
        this.searchTerm = '';
        this.filterType = '';
        this.filterStatus = '';
        this.filteredCampaigns = [...this.campaigns];
    }

    viewCampaign(campaign: Campaign) {
        alert(`Viewing details for: ${campaign.name}`);
    }

    editCampaign(campaign: Campaign) {
        alert(`Editing campaign: ${campaign.name}`);
    }

    pauseCampaign(campaign: Campaign) {
        const confirmed = confirm(`Pause campaign: ${campaign.name}?`);
        if (confirmed) {
            campaign.status = 'paused';
            alert('Campaign paused successfully');
        }
    }

    createCampaign() {
        if (!this.newCampaign.name || !this.newCampaign.targetAudience) {
            alert('Please fill in all required fields');
            return;
        }

        const campaign: Campaign = {
            id: 'CMP-' + String(this.campaigns.length + 1).padStart(3, '0'),
            name: this.newCampaign.name,
            type: this.newCampaign.type,
            status: 'scheduled',
            targetAudience: this.newCampaign.targetAudience,
            startDate: this.newCampaign.startDate,
            endDate: this.newCampaign.endDate,
            budget: this.newCampaign.budget,
            spent: 0,
            reach: 0,
            conversions: 0,
            description: this.newCampaign.description,
            createdBy: 'Current User',
            createdDate: new Date().toISOString().split('T')[0]
        };

        this.campaigns.unshift(campaign);
        this.filteredCampaigns = [...this.campaigns];
        this.showCreateModal = false;
        this.resetNewCampaign();
        alert('Campaign created and scheduled successfully!');
    }

    saveDraft() {
        if (!this.newCampaign.name) {
            alert('Please enter campaign name');
            return;
        }

        const campaign: Campaign = {
            id: 'CMP-' + String(this.campaigns.length + 1).padStart(3, '0'),
            name: this.newCampaign.name,
            type: this.newCampaign.type,
            status: 'draft',
            targetAudience: this.newCampaign.targetAudience || 'Not set',
            startDate: this.newCampaign.startDate || 'TBD',
            endDate: this.newCampaign.endDate || 'TBD',
            budget: this.newCampaign.budget || 0,
            spent: 0,
            reach: 0,
            conversions: 0,
            description: this.newCampaign.description,
            createdBy: 'Current User',
            createdDate: new Date().toISOString().split('T')[0]
        };

        this.campaigns.unshift(campaign);
        this.filteredCampaigns = [...this.campaigns];
        this.showCreateModal = false;
        this.resetNewCampaign();
        alert('Campaign saved as draft!');
    }

    resetNewCampaign() {
        this.newCampaign = {
            name: '',
            type: 'email',
            targetAudience: '',
            startDate: '',
            endDate: '',
            budget: 0,
            description: ''
        };
    }
    // #endregion
}