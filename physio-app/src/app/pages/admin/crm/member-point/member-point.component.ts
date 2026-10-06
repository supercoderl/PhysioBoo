import { A11yModule } from "@angular/cdk/a11y";
import { Component, HostListener, OnDestroy, OnInit, computed, signal } from "@angular/core";
import { Subject, catchError, debounceTime, distinctUntilChanged, finalize, of, switchMap, takeUntil } from "rxjs";
import { MemberService } from "../../../../services/admin/member.service";
import { PatientService } from "../../../../services/admin/patient.service";
import { RewardService } from "../../../../services/admin/reward.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { LocalLoadingService } from "../../../../services/common/local-loading.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { PaginationData } from "../../../../shared/types/common";
import { Member, MemberStats, MemberStatus, MembershipTier } from "../../../../shared/types/member.types";
import { Patient } from "../../../../shared/types/patient.types";
import { Reward } from "../../../../shared/types/reward.types";
import { PointTransaction } from "../../../../shared/types/transaction.types";

type ActiveTab = 'members' | 'points' | 'rewards' | 'register';

@Component({
    selector: 'admin-member-point',
    standalone: true,
    imports: [
        SharedModule,
        A11yModule
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
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" aria-live="polite">
          <div class="bg-surface rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Members</p>
                <p class="mt-2 text-3xl font-bold text-gray-900">{{ stats() ? (stats()!.totalMembers | number) : '—' }}</p>
              </div>
              <div class="bg-blue-100 p-3 rounded-full">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
            </div>
            <p class="mt-2 text-sm text-green-600">{{ stats() ? '+' + stats()!.newMembersThisMonth + ' this month' : ' ' }}</p>
          </div>

          <div class="bg-surface rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Active Members</p>
                <p class="mt-2 text-3xl font-bold text-gray-900">{{ stats() ? (stats()!.activeMembers | number) : '—' }}</p>
              </div>
              <div class="bg-green-100 p-3 rounded-full">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <p class="mt-2 text-sm text-green-600">{{ stats() ? activeRate + '% active rate' : ' ' }}</p>
          </div>

          <div class="bg-surface rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Points Distributed</p>
                <p class="mt-2 text-3xl font-bold text-gray-900">{{ stats() ? (stats()!.pointsDistributedThisMonth | number) : '—' }}</p>
              </div>
              <div class="bg-purple-100 p-3 rounded-full">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <p class="mt-2 text-sm text-green-600">This month</p>
          </div>

          <div class="bg-surface rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Rewards Redeemed</p>
                <p class="mt-2 text-3xl font-bold text-gray-900">{{ stats() ? (stats()!.rewardsRedeemedThisMonth | number) : '—' }}</p>
              </div>
              <div class="bg-yellow-100 p-3 rounded-full">
                <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
                </svg>
              </div>
            </div>
            <p class="mt-2 text-sm text-blue-600">This month</p>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="mb-6 border-b border-gray-200">
          <nav class="-mb-px flex space-x-8 overflow-x-auto" role="tablist" aria-label="Member sections">
            <button
              *ngFor="let tab of tabs"
              type="button"
              role="tab"
              [attr.aria-selected]="activeTab === tab.id"
              (click)="activeTab = tab.id"
              [class.border-blue-500]="activeTab === tab.id"
              [class.text-blue-600]="activeTab === tab.id"
              [class.border-transparent]="activeTab !== tab.id"
              [class.text-gray-500]="activeTab !== tab.id"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm hover:text-blue-600 hover:border-blue-300 transition-colors">
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <!-- Members Directory Tab -->
        <div *ngIf="activeTab === 'members'" role="tabpanel">
          <!-- Search and Filter -->
          <div class="bg-surface rounded-lg shadow-md p-6 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="search"
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearchChanged()"
                aria-label="Search members"
                placeholder="Search by name, phone, email or member number..."
                class="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
              <select
                [(ngModel)]="filterMembership"
                (ngModelChange)="onFilterChanged()"
                aria-label="Filter by membership"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                <option value="">All Memberships</option>
                <option *ngFor="let tier of tiers" [value]="tier">{{ tier }}</option>
              </select>
              <select
                [(ngModel)]="filterStatus"
                (ngModelChange)="onFilterChanged()"
                aria-label="Filter by status"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                <option value="">All Status</option>
                <option *ngFor="let status of statuses" [value]="status">{{ status | titlecase }}</option>
              </select>
            </div>
          </div>

          <!-- Error state -->
          <div *ngIf="membersError()" class="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6 flex items-center justify-between" role="alert">
            <span>Couldn't load members.</span>
            <button type="button" (click)="loadMembers()" class="px-3 py-1 border border-red-300 rounded hover:bg-red-100">Retry</button>
          </div>

          <!-- Members Table -->
          <div class="bg-surface rounded-lg shadow-md overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member ID</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membership</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-surface divide-y divide-gray-200">
                  <!-- Loading skeleton -->
                  <ng-container *ngIf="loadingSrv.isLoading('members') && !members()">
                    <tr *ngFor="let _ of skeletonRows" class="animate-pulse" aria-hidden="true">
                      <td colspan="7" class="px-6 py-4"><div class="h-5 bg-gray-200 rounded"></div></td>
                    </tr>
                  </ng-container>

                  <tr *ngFor="let member of members()?.items" class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ member.memberNumber }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{ member.name }}</div>
                      <div class="text-sm text-gray-500">Joined: {{ member.joinDate | date:'yyyy-MM-dd' }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ member.email || '—' }}</div>
                      <div class="text-sm text-gray-500">{{ member.phone || '—' }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span [ngClass]="{
                        'bg-gray-100 text-gray-800': member.membershipType === 'Basic',
                        'bg-blue-100 text-blue-800': member.membershipType === 'Silver',
                        'bg-yellow-100 text-yellow-800': member.membershipType === 'Gold',
                        'bg-purple-100 text-purple-800': member.membershipType === 'Platinum'
                      }" class="px-3 py-1 text-xs font-semibold rounded-full">
                        {{ member.membershipType }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-bold text-blue-600">{{ member.points | number }} pts</div>
                      <div class="text-xs text-gray-500">Last: {{ member.lastVisit ? (member.lastVisit | date:'yyyy-MM-dd') : '—' }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span [ngClass]="{
                        'bg-green-100 text-green-800': member.status === 'active',
                        'bg-gray-100 text-gray-800': member.status === 'inactive',
                        'bg-red-100 text-red-800': member.status === 'suspended'
                      }" class="px-2 py-1 text-xs font-semibold rounded-full">
                        {{ member.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      <button type="button" (click)="viewMemberDetails(member)" class="text-blue-600 hover:text-blue-800 font-medium mr-3">
                        View
                      </button>
                      <button type="button" (click)="editMember(member)" class="text-green-600 hover:text-green-800 font-medium">
                        Edit
                      </button>
                    </td>
                  </tr>

                  <!-- Empty state -->
                  <tr *ngIf="members() && members()!.items.length === 0">
                    <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                      No members found. Try a different search, or enroll a patient in the "Register Member" tab.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div *ngIf="members() && members()!.totalPages > 1" class="flex items-center justify-between px-6 py-3 border-t border-gray-200">
              <span class="text-sm text-gray-600">Page {{ members()!.pageNumber }} of {{ members()!.totalPages }} · {{ members()!.totalCount | number }} members</span>
              <div class="space-x-2">
                <button type="button" [disabled]="!members()!.hasPrevious" (click)="goToMemberPage(members()!.pageNumber - 1)" class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                <button type="button" [disabled]="!members()!.hasNext" (click)="goToMemberPage(members()!.pageNumber + 1)" class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Points & Transactions Tab -->
        <div *ngIf="activeTab === 'points'" role="tabpanel">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div class="lg:col-span-2 bg-surface rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Member Points Overview</h3>
              <div class="mb-4 relative">
                <input
                  type="search"
                  [(ngModel)]="memberLookupQuery"
                  (ngModelChange)="memberLookup$.next($event)"
                  aria-label="Find a member"
                  placeholder="Find a member by name, phone or member number..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                <ul *ngIf="memberLookupResults().length" role="listbox" aria-label="Matching members"
                    class="absolute z-10 mt-1 w-full bg-surface border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
                  <li *ngFor="let m of memberLookupResults()" role="option">
                    <button type="button" (click)="selectMember(m)" class="w-full text-left px-4 py-2 hover:bg-gray-50">
                      <span class="font-medium text-gray-900">{{ m.name }}</span>
                      <span class="text-sm text-gray-500"> · {{ m.memberNumber }} · {{ m.points | number }} pts</span>
                    </button>
                  </li>
                </ul>
              </div>

              <div *ngIf="selectedMember() as member; else noMemberSelected" class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="text-sm opacity-90">Available Points</p>
                    <p class="text-4xl font-bold mt-2">{{ member.points | number }}</p>
                    <p class="text-sm mt-2 opacity-90">Member: {{ member.name }} ({{ member.memberNumber }}) · {{ member.membershipType }}</p>
                    <p *ngIf="member.status !== 'active'" class="text-sm mt-1 font-semibold">Status: {{ member.status }} — points can't be changed</p>
                  </div>
                  <div class="bg-surface bg-opacity-20 rounded-full p-3">
                    <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <ng-template #noMemberSelected>
                <div class="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center text-gray-500">
                  Search for a member above, or press "View" in the Members Directory.
                </div>
              </ng-template>
            </div>

            <div class="bg-surface rounded-lg shadow-md p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div class="space-y-3">
                <button type="button" [disabled]="!canChangePoints" (click)="openAddPoints()" class="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
                  + Add Points
                </button>
                <button type="button" [disabled]="!canChangePoints" (click)="openRedeem(null)" class="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
                  - Redeem Points
                </button>
                <button type="button" [disabled]="!selectedMember()" (click)="loadTransactions()" class="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
                  Refresh History
                </button>
              </div>
            </div>
          </div>

          <!-- Transactions History -->
          <div class="bg-surface rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>

            <div *ngIf="transactionsError()" class="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-4 flex items-center justify-between" role="alert">
              <span>Couldn't load transactions.</span>
              <button type="button" (click)="loadTransactions()" class="px-3 py-1 border border-red-300 rounded hover:bg-red-100">Retry</button>
            </div>

            <div class="space-y-3">
              <ng-container *ngIf="loadingSrv.isLoading('transactions') && !transactions()">
                <div *ngFor="let _ of skeletonRows" class="h-16 bg-gray-100 rounded-lg animate-pulse" aria-hidden="true"></div>
              </ng-container>

              <div *ngFor="let transaction of transactions()?.items" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div class="flex items-center space-x-4">
                  <div [ngClass]="{
                    'bg-green-100': transaction.type === 'earned',
                    'bg-red-100': transaction.type === 'redeemed'
                  }" class="p-3 rounded-full">
                    <svg *ngIf="transaction.type === 'earned'" class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    <svg *ngIf="transaction.type === 'redeemed'" class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                    </svg>
                  </div>
                  <div>
                    <p class="font-medium text-gray-900">{{ transaction.description }}</p>
                    <p class="text-sm text-gray-500">{{ transaction.date | date:'yyyy-MM-dd HH:mm' }} • {{ transaction.code }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <div [ngClass]="{
                    'text-green-600': transaction.type === 'earned',
                    'text-red-600': transaction.type === 'redeemed'
                  }" class="text-lg font-bold">
                    {{ transaction.type === 'earned' ? '+' : '-' }}{{ transaction.points | number }} pts
                  </div>
                  <div class="text-xs text-gray-500">Balance: {{ transaction.balanceAfter | number }}</div>
                </div>
              </div>

              <div *ngIf="!selectedMember()" class="py-8 text-center text-gray-500">Select a member to see their point history.</div>
              <div *ngIf="selectedMember() && transactions() && transactions()!.items.length === 0" class="py-8 text-center text-gray-500">No point transactions yet.</div>
            </div>

            <div *ngIf="transactions() && transactions()!.totalPages > 1" class="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
              <span class="text-sm text-gray-600">Page {{ transactions()!.pageNumber }} of {{ transactions()!.totalPages }}</span>
              <div class="space-x-2">
                <button type="button" [disabled]="!transactions()!.hasPrevious" (click)="goToTransactionPage(transactions()!.pageNumber - 1)" class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                <button type="button" [disabled]="!transactions()!.hasNext" (click)="goToTransactionPage(transactions()!.pageNumber + 1)" class="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Rewards Catalog Tab -->
        <div *ngIf="activeTab === 'rewards'" role="tabpanel">
          <div *ngIf="rewardsError()" class="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6 flex items-center justify-between" role="alert">
            <span>Couldn't load the rewards catalog.</span>
            <button type="button" (click)="loadRewards()" class="px-3 py-1 border border-red-300 rounded hover:bg-red-100">Retry</button>
          </div>

          <p *ngIf="!selectedMember() && rewards().length" class="mb-4 text-sm text-gray-600">
            Select a member in "Points & Transactions" to redeem rewards for them.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ng-container *ngIf="loadingSrv.isLoading('rewards') && !rewardsLoaded()">
              <div *ngFor="let _ of skeletonCards" class="h-64 bg-gray-100 rounded-lg animate-pulse" aria-hidden="true"></div>
            </ng-container>

            <div *ngFor="let reward of rewards()" class="bg-surface rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div [ngClass]="{
                'bg-blue-500': reward.category === 'discount',
                'bg-green-500': reward.category === 'service',
                'bg-purple-500': reward.category === 'product',
                'bg-orange-500': reward.category === 'voucher'
              }" class="h-32 flex items-center justify-center">
                <svg class="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
              <div class="p-6">
                <div class="flex justify-between items-start mb-3">
                  <h3 class="text-lg font-semibold text-gray-900">{{ reward.title }}</h3>
                  <span [ngClass]="{
                    'bg-green-100 text-green-800': reward.available,
                    'bg-red-100 text-red-800': !reward.available
                  }" class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{ reward.available ? 'Available' : 'Unavailable' }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 mb-4">{{ reward.description }}</p>
                <div class="flex justify-between items-center">
                  <span class="text-2xl font-bold text-blue-600">{{ reward.pointsRequired | number }} pts</span>
                  <button
                    type="button"
                    [disabled]="redeemBlockReason(reward) !== null"
                    [attr.title]="redeemBlockReason(reward)"
                    (click)="openRedeem(reward)"
                    class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                    Redeem
                  </button>
                </div>
                <p *ngIf="redeemBlockReason(reward) as reason" class="mt-2 text-xs text-gray-500">{{ reason }}</p>
              </div>
            </div>
          </div>

          <div *ngIf="rewardsLoaded() && rewards().length === 0 && !rewardsError()" class="bg-surface rounded-lg shadow-md py-12 text-center text-gray-500">
            The rewards catalog is empty.
          </div>
        </div>

        <!-- Register Member Tab -->
        <div *ngIf="activeTab === 'register'" role="tabpanel" class="bg-surface rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-2">Enroll a Patient as Member</h2>
          <p class="text-sm text-gray-600 mb-6">Members are existing patients. Register new people as patients first.</p>

          <form (ngSubmit)="registerMember()" #memberForm="ngForm">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="relative">
                <label for="patient-lookup" class="block text-sm font-medium text-gray-700 mb-2">
                  Patient <span class="text-red-500">*</span>
                </label>
                <div *ngIf="selectedPatient() as patient; else patientSearch" class="flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  <span class="text-sm text-gray-900">{{ patient.fullName }} · {{ patient.patientNumber }}</span>
                  <button type="button" (click)="clearPatient()" class="text-sm text-blue-600 hover:text-blue-800">Change</button>
                </div>
                <ng-template #patientSearch>
                  <input
                    id="patient-lookup"
                    type="search"
                    name="patientLookup"
                    [(ngModel)]="patientQuery"
                    (ngModelChange)="patientLookup$.next($event)"
                    placeholder="Search by name, phone or patient number..."
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <ul *ngIf="patientResults().length" role="listbox" aria-label="Matching patients"
                      class="absolute z-10 mt-1 w-full bg-surface border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-auto">
                    <li *ngFor="let p of patientResults()" role="option">
                      <button type="button" (click)="selectPatient(p)" class="w-full text-left px-4 py-2 hover:bg-gray-50">
                        <span class="font-medium text-gray-900">{{ p.fullName }}</span>
                        <span class="text-sm text-gray-500"> · {{ p.patientNumber }} · {{ p.phone || p.email }}</span>
                      </button>
                    </li>
                  </ul>
                </ng-template>
              </div>

              <div>
                <label for="enroll-tier" class="block text-sm font-medium text-gray-700 mb-2">
                  Membership Type <span class="text-red-500">*</span>
                </label>
                <select
                  id="enroll-tier"
                  [(ngModel)]="enrollTier"
                  name="membershipType"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option value="">Select membership</option>
                  <option *ngFor="let tier of tiers" [value]="tier">{{ tier }}</option>
                </select>
              </div>
            </div>

            <div class="mt-6">
              <label class="flex items-center">
                <input type="checkbox" [(ngModel)]="enrollAgreeTerms" name="agreeTerms" required class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                <span class="ml-2 text-sm text-gray-700">The patient agrees to the loyalty programme terms and conditions <span class="text-red-500">*</span></span>
              </label>
            </div>

            <div class="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                (click)="resetEnrollForm()"
                class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                Reset
              </button>
              <button
                type="submit"
                [disabled]="!canEnroll || isSubmitting"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                {{ isSubmitting ? 'Enrolling...' : 'Enroll Member' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Add Points Modal -->
        <div *ngIf="showAddPointsModal && selectedMember() as member" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="closeModals()">
          <div class="bg-surface rounded-lg p-6 max-w-md w-full mx-4" role="dialog" aria-modal="true" aria-labelledby="add-points-title" cdkTrapFocus [cdkTrapFocusAutoCapture]="true" (click)="$event.stopPropagation()">
            <h3 id="add-points-title" class="text-lg font-semibold text-gray-900 mb-4">Add Points</h3>
            <form (ngSubmit)="submitAddPoints()" class="space-y-4">
              <p class="text-sm text-gray-600">{{ member.name }} ({{ member.memberNumber }}) · {{ member.points | number }} pts</p>
              <div>
                <label for="add-points-amount" class="block text-sm font-medium text-gray-700 mb-2">Points Amount</label>
                <input id="add-points-amount" name="points" type="number" min="1" max="1000000" step="1" [(ngModel)]="addPointsForm.points"
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="100">
              </div>
              <div>
                <label for="add-points-reason" class="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <textarea id="add-points-reason" name="description" rows="3" maxlength="255" [(ngModel)]="addPointsForm.description"
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Consultation visit"></textarea>
              </div>
              <div class="pt-2 flex justify-end space-x-3">
                <button type="button" (click)="closeModals()" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" [disabled]="!canSubmitAddPoints || isSubmitting" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                  {{ isSubmitting ? 'Adding...' : 'Add Points' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Redeem Points Modal -->
        <div *ngIf="showRedeemModal && selectedMember() as member" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="closeModals()">
          <div class="bg-surface rounded-lg p-6 max-w-md w-full mx-4" role="dialog" aria-modal="true" aria-labelledby="redeem-title" cdkTrapFocus [cdkTrapFocusAutoCapture]="true" (click)="$event.stopPropagation()">
            <h3 id="redeem-title" class="text-lg font-semibold text-gray-900 mb-4">Redeem Points</h3>
            <form (ngSubmit)="submitRedeem()" class="space-y-4">
              <p class="text-sm text-gray-600">{{ member.name }} ({{ member.memberNumber }}) · {{ member.points | number }} pts</p>
              <div>
                <label for="redeem-reward" class="block text-sm font-medium text-gray-700 mb-2">Reward</label>
                <select id="redeem-reward" name="rewardId" [(ngModel)]="redeemForm.rewardId" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option value="">Select reward...</option>
                  <option *ngFor="let r of availableRewards()" [value]="r.id" [disabled]="r.pointsRequired > member.points">
                    {{ r.title }} — {{ r.pointsRequired | number }} pts
                  </option>
                </select>
                <p *ngIf="redeemBalanceAfter() !== null" class="mt-2 text-sm text-gray-600">Balance after redeeming: {{ redeemBalanceAfter() | number }} pts</p>
              </div>
              <div>
                <label for="redeem-note" class="block text-sm font-medium text-gray-700 mb-2">Note (optional)</label>
                <textarea id="redeem-note" name="description" rows="2" maxlength="255" [(ngModel)]="redeemForm.description"
                          class="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
              </div>
              <div class="pt-2 flex justify-end space-x-3">
                <button type="button" (click)="closeModals()" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" [disabled]="!redeemForm.rewardId || isSubmitting" class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                  {{ isSubmitting ? 'Redeeming...' : 'Redeem' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Edit Member Modal -->
        <div *ngIf="editingMember as member" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="closeModals()">
          <div class="bg-surface rounded-lg p-6 max-w-md w-full mx-4" role="dialog" aria-modal="true" aria-labelledby="edit-member-title" cdkTrapFocus [cdkTrapFocusAutoCapture]="true" (click)="$event.stopPropagation()">
            <h3 id="edit-member-title" class="text-lg font-semibold text-gray-900 mb-4">Edit Member</h3>
            <form (ngSubmit)="saveMember()" class="space-y-4">
              <p class="text-sm text-gray-600">{{ member.name }} ({{ member.memberNumber }})</p>
              <div>
                <label for="edit-tier" class="block text-sm font-medium text-gray-700 mb-2">Membership</label>
                <select id="edit-tier" name="tier" [(ngModel)]="editForm.tier" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option *ngFor="let tier of tiers" [value]="tier">{{ tier }}</option>
                </select>
              </div>
              <div>
                <label for="edit-status" class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select id="edit-status" name="status" [(ngModel)]="editForm.status" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option *ngFor="let status of statuses" [value]="status">{{ status | titlecase }}</option>
                </select>
              </div>
              <div class="pt-2 flex items-center justify-between">
                <button type="button" (click)="removeMember(member)" [disabled]="isSubmitting" class="text-sm text-red-600 hover:text-red-800 disabled:opacity-50">Remove member</button>
                <div class="space-x-3">
                  <button type="button" (click)="closeModals()" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                  <button type="submit" [disabled]="isSubmitting" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                    {{ isSubmitting ? 'Saving...' : 'Save' }}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    `
})

export class AdminMemberPointComponent implements OnInit, OnDestroy {
    // #region Inputs, Outputs, Properties
    readonly pageSize = 10;
    readonly tiers: MembershipTier[] = ['Basic', 'Silver', 'Gold', 'Platinum'];
    readonly statuses: MemberStatus[] = ['active', 'inactive', 'suspended'];
    readonly tabs: { id: ActiveTab; label: string }[] = [
        { id: 'members', label: 'Members Directory' },
        { id: 'points', label: 'Points & Transactions' },
        { id: 'rewards', label: 'Rewards Catalog' },
        { id: 'register', label: 'Register Member' },
    ];
    readonly skeletonRows = [1, 2, 3, 4, 5];
    readonly skeletonCards = [1, 2, 3];

    activeTab: ActiveTab = 'members';
    isSubmitting = false;

    // Members directory
    members = signal<PaginationData<Member> | null>(null);
    stats = signal<MemberStats | null>(null);
    membersError = signal(false);
    searchQuery = '';
    filterMembership = '';
    filterStatus = '';
    private memberPage = 1;

    // Points & transactions
    selectedMember = signal<Member | null>(null);
    transactions = signal<PaginationData<PointTransaction> | null>(null);
    transactionsError = signal(false);
    memberLookupQuery = '';
    memberLookupResults = signal<Member[]>([]);
    readonly memberLookup$ = new Subject<string>();
    private transactionPage = 1;

    // Rewards
    rewards = signal<Reward[]>([]);
    rewardsLoaded = signal(false);
    rewardsError = signal(false);
    availableRewards = computed(() => this.rewards().filter(r => r.available));

    // Register
    patientQuery = '';
    patientResults = signal<Patient[]>([]);
    selectedPatient = signal<Patient | null>(null);
    enrollTier: MembershipTier | '' = '';
    enrollAgreeTerms = false;
    readonly patientLookup$ = new Subject<string>();

    // Modals
    showAddPointsModal = false;
    showRedeemModal = false;
    editingMember: Member | null = null;
    addPointsForm: { points: number | null; description: string } = { points: null, description: '' };
    redeemForm = { rewardId: '', description: '' };
    editForm: { tier: MembershipTier; status: MemberStatus } = { tier: 'Basic', status: 'active' };

    private readonly search$ = new Subject<string>();
    private readonly destroy$ = new Subject<void>();
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private memberSrv: MemberService,
        private rewardSrv: RewardService,
        private patientSrv: PatientService,
        private dialogSrv: DialogService,
        private toastSrv: ToastService,
        protected loadingSrv: LocalLoadingService,
    ) { }

    ngOnInit(): void {
        this.search$.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe(() => {
            this.memberPage = 1;
            this.loadMembers();
        });

        this.memberLookup$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(q => q.trim().length < 2
                ? of(null)
                : this.memberSrv.search({ pageNumber: 1, pageSize: 6, search: q.trim() }).pipe(catchError(() => of(null)))),
            takeUntil(this.destroy$)
        ).subscribe(res => this.memberLookupResults.set(res?.success ? res.data.items : []));

        this.patientLookup$.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(q => q.trim().length < 2
                ? of(null)
                : this.patientSrv.search({ pageNumber: 1, pageSize: 6, search: q.trim() }).pipe(catchError(() => of(null)))),
            takeUntil(this.destroy$)
        ).subscribe(res => this.patientResults.set(res?.success ? res.data.items : []));

        this.loadMembers();
        this.loadStats();
        this.loadRewards();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    @HostListener('document:keydown.escape')
    onEscape() {
        this.closeModals();
    }
    // #endregion

    // #region Getters
    get activeRate(): number {
        const s = this.stats();
        return s && s.totalMembers > 0 ? Math.round((s.activeMembers / s.totalMembers) * 1000) / 10 : 0;
    }

    get canChangePoints(): boolean {
        return this.selectedMember()?.status === 'active';
    }

    get canSubmitAddPoints(): boolean {
        const points = this.addPointsForm.points;
        return points !== null && Number.isInteger(points) && points >= 1 && points <= 1_000_000
            && this.addPointsForm.description.trim().length > 0;
    }

    get canEnroll(): boolean {
        return !!this.selectedPatient() && this.enrollTier !== '' && this.enrollAgreeTerms;
    }
    // #endregion

    // #region Members directory
    loadMembers() {
        this.membersError.set(false);
        this.loadingSrv.setLoading('members', true);
        this.memberSrv.search({
            pageNumber: this.memberPage,
            pageSize: this.pageSize,
            search: this.searchQuery.trim(),
            sort: '-createdDate',
            filter: {
                tier: this.filterMembership || null,
                status: this.filterStatus || null,
            }
        }).pipe(finalize(() => this.loadingSrv.setLoading('members', false)))
            .subscribe({
                next: res => { if (res.success) this.members.set(res.data); },
                error: () => this.membersError.set(true)
            });
    }

    loadStats() {
        this.memberSrv.stats().subscribe(res => {
            if (res.success) this.stats.set(res.data);
        });
    }

    onSearchChanged() {
        this.search$.next(this.searchQuery);
    }

    onFilterChanged() {
        this.memberPage = 1;
        this.loadMembers();
    }

    goToMemberPage(page: number) {
        this.memberPage = page;
        this.loadMembers();
    }

    viewMemberDetails(member: Member) {
        this.selectMember(member);
        this.activeTab = 'points';
    }

    editMember(member: Member) {
        this.editingMember = member;
        this.editForm = { tier: member.membershipType, status: member.status };
    }

    saveMember() {
        const member = this.editingMember;
        if (!member || this.isSubmitting) return;

        this.isSubmitting = true;
        this.memberSrv.update(member.id, { tier: this.editForm.tier, status: this.editForm.status })
            .pipe(finalize(() => this.isSubmitting = false))
            .subscribe(res => {
                if (!res.success) return;
                this.toastSrv.success('Member updated.');
                this.closeModals();
                this.reloadAfterMemberChange(member.id);
            });
    }

    removeMember(member: Member) {
        this.dialogSrv.confirm(
            `Remove ${member.name} from the loyalty programme? Their point history is kept.`,
            () => {
                this.isSubmitting = true;
                this.memberSrv.delete(member.id)
                    .pipe(finalize(() => this.isSubmitting = false))
                    .subscribe(res => {
                        if (!res.success) return;
                        this.toastSrv.success('Member removed.');
                        this.closeModals();
                        if (this.selectedMember()?.id === member.id) this.clearSelectedMember();
                        this.loadMembers();
                        this.loadStats();
                    });
            },
            'Remove member'
        );
    }
    // #endregion

    // #region Points & transactions
    selectMember(member: Member) {
        this.selectedMember.set(member);
        this.memberLookupQuery = '';
        this.memberLookupResults.set([]);
        this.transactionPage = 1;
        this.transactions.set(null);
        this.loadTransactions();
    }

    loadTransactions() {
        const member = this.selectedMember();
        if (!member) return;

        this.transactionsError.set(false);
        this.loadingSrv.setLoading('transactions', true);
        this.memberSrv.transactions(member.id, {
            pageNumber: this.transactionPage,
            pageSize: this.pageSize,
            filter: { type: null }
        }).pipe(finalize(() => this.loadingSrv.setLoading('transactions', false)))
            .subscribe({
                next: res => { if (res.success) this.transactions.set(res.data); },
                error: () => this.transactionsError.set(true)
            });
    }

    goToTransactionPage(page: number) {
        this.transactionPage = page;
        this.loadTransactions();
    }

    openAddPoints() {
        if (!this.canChangePoints) return;
        this.addPointsForm = { points: null, description: '' };
        this.showAddPointsModal = true;
    }

    submitAddPoints() {
        const member = this.selectedMember();
        if (!member || !this.canSubmitAddPoints || this.isSubmitting) return;

        this.isSubmitting = true;
        this.memberSrv.addPoints(member.id, {
            points: this.addPointsForm.points!,
            description: this.addPointsForm.description.trim()
        }).pipe(finalize(() => this.isSubmitting = false))
            .subscribe(res => {
                if (!res.success) return;
                this.toastSrv.success('Points added.');
                this.closeModals();
                this.reloadAfterMemberChange(member.id);
            });
    }

    openRedeem(reward: Reward | null) {
        if (!this.canChangePoints) return;
        this.redeemForm = { rewardId: reward?.id ?? '', description: '' };
        this.showRedeemModal = true;
    }

    submitRedeem() {
        const member = this.selectedMember();
        if (!member || !this.redeemForm.rewardId || this.isSubmitting) return;

        this.isSubmitting = true;
        this.memberSrv.redeemPoints(member.id, {
            rewardId: this.redeemForm.rewardId,
            description: this.redeemForm.description.trim() || null
        }).pipe(finalize(() => this.isSubmitting = false))
            .subscribe(res => {
                if (!res.success) return;
                this.toastSrv.success('Points redeemed.');
                this.closeModals();
                this.reloadAfterMemberChange(member.id);
            });
    }

    redeemBalanceAfter(): number | null {
        const member = this.selectedMember();
        const reward = this.rewards().find(r => r.id === this.redeemForm.rewardId);
        return member && reward ? member.points - reward.pointsRequired : null;
    }

    private clearSelectedMember() {
        this.selectedMember.set(null);
        this.transactions.set(null);
    }

    /** Refresh everything a points or member change can affect. */
    private reloadAfterMemberChange(memberId: string) {
        if (this.selectedMember()?.id === memberId) {
            this.memberSrv.search_by_id(memberId).subscribe(res => {
                if (res.success && res.data) this.selectedMember.set(res.data);
            });
            this.transactionPage = 1;
            this.loadTransactions();
        }
        this.loadMembers();
        this.loadStats();
    }
    // #endregion

    // #region Rewards
    loadRewards() {
        this.rewardsError.set(false);
        this.loadingSrv.setLoading('rewards', true);
        this.rewardSrv.search({
            pageNumber: 1,
            pageSize: 50,
            sort: 'pointsRequired',
            filter: { category: null, available: null }
        }).pipe(finalize(() => this.loadingSrv.setLoading('rewards', false)))
            .subscribe({
                next: res => {
                    if (res.success) {
                        this.rewards.set(res.data.items);
                        this.rewardsLoaded.set(true);
                    }
                },
                error: () => this.rewardsError.set(true)
            });
    }

    /** Why the Redeem button is disabled, or null when redeeming is possible. */
    redeemBlockReason(reward: Reward): string | null {
        const member = this.selectedMember();
        if (!reward.available) return 'This reward is unavailable.';
        if (!member) return 'Select a member first.';
        if (member.status !== 'active') return 'The member is not active.';
        if (member.points < reward.pointsRequired) {
            return `Needs ${(reward.pointsRequired - member.points).toLocaleString()} more points.`;
        }
        return null;
    }
    // #endregion

    // #region Enrollment
    selectPatient(patient: Patient) {
        this.selectedPatient.set(patient);
        this.patientQuery = '';
        this.patientResults.set([]);
    }

    clearPatient() {
        this.selectedPatient.set(null);
    }

    registerMember() {
        const patient = this.selectedPatient();
        if (!patient || this.enrollTier === '' || !this.canEnroll || this.isSubmitting) return;

        this.isSubmitting = true;
        this.memberSrv.enroll({ patientId: patient.id, tier: this.enrollTier })
            .pipe(finalize(() => this.isSubmitting = false))
            .subscribe(res => {
                if (!res.success) return;
                this.toastSrv.success('Member enrolled.');
                this.resetEnrollForm();
                this.activeTab = 'members';
                this.memberPage = 1;
                this.loadMembers();
                this.loadStats();
            });
    }

    resetEnrollForm() {
        this.selectedPatient.set(null);
        this.patientQuery = '';
        this.patientResults.set([]);
        this.enrollTier = '';
        this.enrollAgreeTerms = false;
    }
    // #endregion

    // #region Modals
    closeModals() {
        this.showAddPointsModal = false;
        this.showRedeemModal = false;
        this.editingMember = null;
    }
    // #endregion
}
