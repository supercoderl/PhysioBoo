import { Component } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { Member } from "../../../../shared/types/member";
import { Reward } from "../../../../shared/types/reward";
import { Transaction } from "../../../../shared/types/transaction";

@Component({
    selector: 'admin-member-point',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Members & Loyalty Points</h1>
          <p class="mt-2 text-gray-600">Manage memberships and track loyalty rewards</p>
        </div>

        <!-- Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Members</p>
                <p class="mt-2 text-3xl font-bold text-gray-900">2,847</p>
              </div>
              <div class="bg-blue-100 p-3 rounded-full">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
            </div>
            <p class="mt-2 text-sm text-green-600">↑ 12% from last month</p>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Active Members</p>
                <p class="mt-2 text-3xl font-bold text-gray-900">2,541</p>
              </div>
              <div class="bg-green-100 p-3 rounded-full">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <p class="mt-2 text-sm text-green-600">89.2% active rate</p>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Points Distributed</p>
                <p class="mt-2 text-3xl font-bold text-gray-900">184,320</p>
              </div>
              <div class="bg-purple-100 p-3 rounded-full">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <p class="mt-2 text-sm text-green-600">This month</p>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Rewards Redeemed</p>
                <p class="mt-2 text-3xl font-bold text-gray-900">1,243</p>
              </div>
              <div class="bg-yellow-100 p-3 rounded-full">
                <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
                </svg>
              </div>
            </div>
            <p class="mt-2 text-sm text-blue-600">This month</p>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="mb-6 border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              (click)="activeTab = 'members'"
              [class.border-blue-500]="activeTab === 'members'"
              [class.text-blue-600]="activeTab === 'members'"
              [class.border-transparent]="activeTab !== 'members'"
              [class.text-gray-500]="activeTab !== 'members'"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm hover:text-blue-600 hover:border-blue-300 transition-colors">
              Members Directory
            </button>
            <button
              (click)="activeTab = 'points'"
              [class.border-blue-500]="activeTab === 'points'"
              [class.text-blue-600]="activeTab === 'points'"
              [class.border-transparent]="activeTab !== 'points'"
              [class.text-gray-500]="activeTab !== 'points'"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm hover:text-blue-600 hover:border-blue-300 transition-colors">
              Points & Transactions
            </button>
            <button
              (click)="activeTab = 'rewards'"
              [class.border-blue-500]="activeTab === 'rewards'"
              [class.text-blue-600]="activeTab === 'rewards'"
              [class.border-transparent]="activeTab !== 'rewards'"
              [class.text-gray-500]="activeTab !== 'rewards'"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm hover:text-blue-600 hover:border-blue-300 transition-colors">
              Rewards Catalog
            </button>
            <button
              (click)="activeTab = 'register'"
              [class.border-blue-500]="activeTab === 'register'"
              [class.text-blue-600]="activeTab === 'register'"
              [class.border-transparent]="activeTab !== 'register'"
              [class.text-gray-500]="activeTab !== 'register'"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm hover:text-blue-600 hover:border-blue-300 transition-colors">
              Register Member
            </button>
          </nav>
        </div>

        <!-- Members Directory Tab -->
        <div *ngIf="activeTab === 'members'">
          <!-- Search and Filter -->
          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Search members..."
                class="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
              <select
                [(ngModel)]="filterMembership"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                <option value="">All Memberships</option>
                <option value="Basic">Basic</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>
              <select
                [(ngModel)]="filterStatus"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <!-- Members Table -->
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membership</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let member of filteredMembers" class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{member.id}}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{member.name}}</div>
                      <div class="text-sm text-gray-500">Joined: {{member.joinDate}}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{member.email}}</div>
                      <div class="text-sm text-gray-500">{{member.phone}}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span [ngClass]="{
                        'bg-gray-100 text-gray-800': member.membershipType === 'Basic',
                        'bg-blue-100 text-blue-800': member.membershipType === 'Silver',
                        'bg-yellow-100 text-yellow-800': member.membershipType === 'Gold',
                        'bg-purple-100 text-purple-800': member.membershipType === 'Platinum'
                      }" class="px-3 py-1 text-xs font-semibold rounded-full">
                        {{member.membershipType}}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-bold text-blue-600">{{member.points}} pts</div>
                      <div class="text-xs text-gray-500">Last: {{member.lastVisit}}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span [ngClass]="{
                        'bg-green-100 text-green-800': member.status === 'active',
                        'bg-gray-100 text-gray-800': member.status === 'inactive',
                        'bg-red-100 text-red-800': member.status === 'suspended'
                      }" class="px-2 py-1 text-xs font-semibold rounded-full">
                        {{member.status}}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      <button (click)="viewMemberDetails(member)" class="text-blue-600 hover:text-blue-800 font-medium mr-3">
                        View
                      </button>
                      <button (click)="editMember(member)" class="text-green-600 hover:text-green-800 font-medium">
                        Edit
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Points & Transactions Tab -->
        <div *ngIf="activeTab === 'points'">
          <!-- Point Summary Card -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div class="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Member Points Overview</h3>
              <div class="mb-4">
                <input
                  type="text"
                  [(ngModel)]="selectedMemberId"
                  placeholder="Enter Member ID..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
              </div>
              <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="text-sm opacity-90">Available Points</p>
                    <p class="text-4xl font-bold mt-2">3,450</p>
                    <p class="text-sm mt-2 opacity-90">Member: John Doe (MEM-001)</p>
                  </div>
                  <div class="bg-white bg-opacity-20 rounded-full p-3">
                    <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div class="space-y-3">
                <button (click)="showAddPointsModal = true" class="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition-colors">
                  + Add Points
                </button>
                <button (click)="showRedeemModal = true" class="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors">
                  - Redeem Points
                </button>
                <button class="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors">
                  View History
                </button>
              </div>
            </div>
          </div>

          <!-- Transactions History -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
            <div class="space-y-3">
              <div *ngFor="let transaction of transactions" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div class="flex items-center space-x-4">
                  <div [ngClass]="{
                    'bg-green-100': transaction.type === 'earned',
                    'bg-red-100': transaction.type === 'redeemed'
                  }" class="p-3 rounded-full">
                    <svg *ngIf="transaction.type === 'earned'" class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    <svg *ngIf="transaction.type === 'redeemed'" class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{transaction.description}}</p>
                    <p class="text-sm text-gray-500">{{transaction.date}} • {{transaction.id}}</p>
                  </div>
                </div>
                <div [ngClass]="{
                  'text-green-600': transaction.type === 'earned',
                  'text-red-600': transaction.type === 'redeemed'
                }" class="text-lg font-bold">
                  {{transaction.type === 'earned' ? '+' : '-'}}{{transaction.points}} pts
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Rewards Catalog Tab -->
        <div *ngIf="activeTab === 'rewards'">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let reward of rewards" class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div [ngClass]="{
                'bg-blue-500': reward.category === 'discount',
                'bg-green-500': reward.category === 'service',
                'bg-purple-500': reward.category === 'product',
                'bg-orange-500': reward.category === 'voucher'
              }" class="h-32 flex items-center justify-center">
                <svg class="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
              <div class="p-6">
                <div class="flex justify-between items-start mb-3">
                  <h3 class="text-lg font-semibold text-gray-900">{{reward.title}}</h3>
                  <span [ngClass]="{
                    'bg-green-100 text-green-800': reward.available,
                    'bg-red-100 text-red-800': !reward.available
                  }" class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{reward.available ? 'Available' : 'Unavailable'}}
                  </span>
                </div>
                <p class="text-sm text-gray-600 mb-4">{{reward.description}}</p>
                <div class="flex justify-between items-center">
                  <span class="text-2xl font-bold text-blue-600">{{reward.pointsRequired}} pts</span>
                  <button 
                    [disabled]="!reward.available"
                    class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                    Redeem
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Register Member Tab -->
        <div *ngIf="activeTab === 'register'" class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Register New Member</h2>
          
          <form (ngSubmit)="registerMember()" #memberForm="ngForm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span class="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  [(ngModel)]="newMember.name"
                  name="name"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Email <span class="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  [(ngModel)]="newMember.email"
                  name="email"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span class="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  [(ngModel)]="newMember.phone"
                  name="phone"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth <span class="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  [(ngModel)]="newMember.dob"
                  name="dob"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Membership Type <span class="text-red-500">*</span>
                </label>
                <select
                  [(ngModel)]="newMember.membershipType"
                  name="membershipType"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option value="">Select membership</option>
                  <option value="Basic">Basic (Free)</option>
                  <option value="Silver">Silver ($50/year)</option>
                  <option value="Gold">Gold ($100/year)</option>
                  <option value="Platinum">Platinum ($200/year)</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Gender <span class="text-red-500">*</span>
                </label>
                <select
                  [(ngModel)]="newMember.gender"
                  name="gender"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div class="mt-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                [(ngModel)]="newMember.address"
                name="address"
                rows="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"></textarea>
            </div>

            <div class="mt-6">
              <label class="flex items-center">
                <input type="checkbox" [(ngModel)]="newMember.agreeTerms" name="agreeTerms" required class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                <span class="ml-2 text-sm text-gray-700">I agree to the terms and conditions <span class="text-red-500">*</span></span>
              </label>
            </div>

            <div class="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                (click)="resetMemberForm(memberForm)"
                class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                Reset
              </button>
              <button
                type="submit"
                [disabled]="!memberForm.valid"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                Register Member
              </button>
            </div>
          </form>
        </div>

        <!-- Add Points Modal -->
        <div *ngIf="showAddPointsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Add Points</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Member ID</label>
                <input type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="MEM-001">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Points Amount</label>
                <input type="number" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="100">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <textarea rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Consultation visit"></textarea>
              </div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
              <button (click)="showAddPointsModal = false" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button (click)="addPoints()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Add Points</button>
            </div>
          </div>
        </div>

        <!-- Redeem Points Modal -->
        <div *ngIf="showRedeemModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Redeem Points</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Member ID</label>
                <input type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="MEM-001">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Points to Redeem</label>
                <input type="number" class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Reward</label>
                <select class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>Select reward...</option>
                  <option>10% Discount on Next Visit</option>
                  <option>Free Health Checkup</option>
                  <option>$20 Pharmacy Voucher</option>
                </select>
              </div>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
              <button (click)="showRedeemModal = false" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button (click)="redeemPoints()" class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">Redeem</button>
            </div>
          </div>
        </div>

        <!-- Success Message -->
        <div *ngIf="showSuccess" class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-fade-in z-50">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>{{successMessage}}</span>
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

export class AdminMemberPointComponent {
    // #region Inputs, Outputs, Properties
    activeTab: 'members' | 'points' | 'rewards' | 'register' = 'members';
    searchQuery = '';
    filterMembership = '';
    filterStatus = '';
    selectedMemberId = '';
    showAddPointsModal = false;
    showRedeemModal = false;
    showSuccess = false;
    successMessage = '';

    newMember = {
        name: '',
        email: '',
        phone: '',
        dob: '',
        membershipType: '',
        gender: '',
        address: '',
        agreeTerms: false
    };

    members: Member[] = [
        {
            id: 'MEM-001',
            name: 'John Doe',
            email: 'john.doe@email.com',
            phone: '+84 901 234 567',
            membershipType: 'Gold',
            points: 3450,
            joinDate: '2024-01-15',
            status: 'active',
            lastVisit: '2024-12-18'
        },
        {
            id: 'MEM-002',
            name: 'Jane Smith',
            email: 'jane.smith@email.com',
            phone: '+84 902 345 678',
            membershipType: 'Platinum',
            points: 8920,
            joinDate: '2023-11-20',
            status: 'active',
            lastVisit: '2024-12-20'
        },
        {
            id: 'MEM-003',
            name: 'Mike Johnson',
            email: 'mike.j@email.com',
            phone: '+84 903 456 789',
            membershipType: 'Silver',
            points: 1250,
            joinDate: '2024-06-10',
            status: 'active',
            lastVisit: '2024-12-10'
        },
        {
            id: 'MEM-004',
            name: 'Sarah Williams',
            email: 'sarah.w@email.com',
            phone: '+84 904 567 890',
            membershipType: 'Basic',
            points: 450,
            joinDate: '2024-09-05',
            status: 'inactive',
            lastVisit: '2024-11-15'
        }
    ];

    transactions: Transaction[] = [
        {
            id: 'TXN-001',
            type: 'earned',
            points: 150,
            description: 'General Consultation Visit',
            date: '2024-12-20'
        },
        {
            id: 'TXN-002',
            type: 'earned',
            points: 300,
            description: 'Annual Health Checkup',
            date: '2024-12-18'
        },
        {
            id: 'TXN-003',
            type: 'redeemed',
            points: 500,
            description: 'Redeemed: 10% Discount Voucher',
            date: '2024-12-15'
        },
        {
            id: 'TXN-004',
            type: 'earned',
            points: 200,
            description: 'Dental Cleaning Service',
            date: '2024-12-12'
        }
    ];

    rewards: Reward[] = [
        {
            id: 'RWD-001',
            title: '10% Discount',
            description: 'Get 10% off on your next consultation visit',
            pointsRequired: 500,
            category: 'discount',
            available: true
        },
        {
            id: 'RWD-002',
            title: 'Free Health Checkup',
            description: 'Complimentary basic health screening package',
            pointsRequired: 1000,
            category: 'service',
            available: true
        },
        {
            id: 'RWD-003',
            title: '$20 Pharmacy Voucher',
            description: 'Voucher for pharmacy purchases',
            pointsRequired: 800,
            category: 'voucher',
            available: true
        },
        {
            id: 'RWD-004',
            title: 'Free Dental Cleaning',
            description: 'One complimentary dental cleaning session',
            pointsRequired: 1500,
            category: 'service',
            available: true
        },
        {
            id: 'RWD-005',
            title: 'Premium Consultation',
            description: 'Free consultation with specialist doctor',
            pointsRequired: 2000,
            category: 'service',
            available: false
        },
        {
            id: 'RWD-006',
            title: '$50 Treatment Discount',
            description: 'Get $50 off on any treatment service',
            pointsRequired: 2500,
            category: 'discount',
            available: true
        }
    ];

    get filteredMembers(): Member[] {
        return this.members.filter(m => {
            const matchesSearch = !this.searchQuery ||
                m.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                m.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                m.email.toLowerCase().includes(this.searchQuery.toLowerCase());
            const matchesMembership = !this.filterMembership || m.membershipType === this.filterMembership;
            const matchesStatus = !this.filterStatus || m.status === this.filterStatus;
            return matchesSearch && matchesMembership && matchesStatus;
        });
    }
    // #endregion

    // #region Methods
    registerMember() {
        console.log('Registering member:', this.newMember);
        this.successMessage = 'Member registered successfully!';
        this.showSuccess = true;
        setTimeout(() => {
            this.showSuccess = false;
            this.activeTab = 'members';
        }, 2000);
    }

    resetMemberForm(form: any) {
        form.reset();
        this.newMember = {
            name: '',
            email: '',
            phone: '',
            dob: '',
            membershipType: '',
            gender: '',
            address: '',
            agreeTerms: false
        };
    }

    viewMemberDetails(member: Member) {
        console.log('Viewing member:', member);
        alert(`Member Details:\n\nID: ${member.id}\nName: ${member.name}\nPoints: ${member.points}\nMembership: ${member.membershipType}`);
    }

    editMember(member: Member) {
        console.log('Editing member:', member);
    }

    addPoints() {
        this.showAddPointsModal = false;
        this.successMessage = 'Points added successfully!';
        this.showSuccess = true;
        setTimeout(() => this.showSuccess = false, 2000);
    }

    redeemPoints() {
        this.showRedeemModal = false;
        this.successMessage = 'Points redeemed successfully!';
        this.showSuccess = true;
        setTimeout(() => this.showSuccess = false, 2000);
    }
    // #endregion
}