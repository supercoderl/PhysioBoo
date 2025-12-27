import { Component } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { Category } from "../../../../shared/types/category";

@Component({
    selector: 'admin-common-category',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
        <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Page Header -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900">Category Management</h1>
          <p class="text-gray-600 mt-2">Manage all hospital system categories and classifications</p>
        </div>

        <!-- Category Type Selection -->
        <div class="bg-white rounded-lg shadow-sm mb-6 p-4">
          <div class="flex flex-wrap gap-2">
            <button
              *ngFor="let type of categoryTypes"
              (click)="selectedType = type.value"
              [class.bg-blue-600]="selectedType === type.value"
              [class.text-white]="selectedType === type.value"
              [class.bg-gray-100]="selectedType !== type.value"
              [class.text-gray-700]="selectedType !== type.value"
              class="px-4 py-2 rounded-lg font-medium transition-colors hover:shadow-md">
              {{ type.label }}
              <span class="ml-2 px-2 py-0.5 rounded-full text-xs"
                    [class.bg-blue-500]="selectedType === type.value"
                    [class.bg-gray-200]="selectedType !== type.value">
                {{ getCategoryCountByType(type.value) }}
              </span>
            </button>
          </div>
        </div>

        <!-- Search and Actions Bar -->
        <div class="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1">
              <div class="relative">
                <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  [(ngModel)]="searchTerm"
                  placeholder="Search categories by name or code..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
            </div>
            <select [(ngModel)]="filterStatus" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              (click)="openAddModal()"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Category
            </button>
            <button
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium whitespace-nowrap flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">Total Categories</p>
                <p class="text-2xl font-bold text-gray-900">{{ getTotalCategories() }}</p>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">Active</p>
                <p class="text-2xl font-bold text-green-600">{{ getActiveCategories() }}</p>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">Inactive</p>
                <p class="text-2xl font-bold text-red-600">{{ getInactiveCategories() }}</p>
              </div>
              <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">Current Type</p>
                <p class="text-2xl font-bold text-purple-600">{{ getCategoryCountByType(selectedType) }}</p>
              </div>
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- View Toggle -->
        <div class="bg-white rounded-lg shadow-sm mb-6 p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <span class="text-sm font-medium text-gray-700">View:</span>
              <div class="flex bg-gray-100 rounded-lg p-1">
                <button
                  (click)="viewMode = 'grid'"
                  [class.bg-white]="viewMode === 'grid'"
                  [class.shadow-sm]="viewMode === 'grid'"
                  class="px-3 py-1.5 rounded-md transition-all flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Grid
                </button>
                <button
                  (click)="viewMode = 'table'"
                  [class.bg-white]="viewMode === 'table'"
                  [class.shadow-sm]="viewMode === 'table'"
                  class="px-3 py-1.5 rounded-md transition-all flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  Table
                </button>
              </div>
            </div>
            <div class="text-sm text-gray-600">
              Showing {{ filteredCategories().length }} of {{ categories.length }} categories
            </div>
          </div>
        </div>

        <!-- Grid View -->
        <div *ngIf="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let category of filteredCategories()" 
               class="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 border-l-4"
               [style.border-color]="category.color">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                     [style.background-color]="category.color + '20'">
                  {{ category.icon }}
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">{{ category.name }}</h3>
                  <p class="text-sm text-gray-500">{{ category.code }}</p>
                </div>
              </div>
              <div class="relative">
                <button (click)="toggleMenu(category.id)" class="text-gray-400 hover:text-gray-600 p-1">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                <div *ngIf="openMenuId === category.id" 
                     class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
                  <button (click)="editCategory(category)" class="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button (click)="duplicateCategory(category)" class="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Duplicate
                  </button>
                  <button (click)="deleteCategory(category)" class="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
            <p class="text-sm text-gray-600 mb-4 line-clamp-2">{{ category.description }}</p>
            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
              <span
                [class.bg-green-100]="category.status === 'active'"
                [class.text-green-800]="category.status === 'active'"
                [class.bg-red-100]="category.status === 'inactive'"
                [class.text-red-800]="category.status === 'inactive'"
                class="px-2 py-1 text-xs font-semibold rounded-full">
                {{ category.status | titlecase }}
              </span>
              <span class="text-sm text-gray-500">{{ category.itemCount }} items</span>
            </div>
          </div>
        </div>

        <!-- Table View -->
        <div *ngIf="viewMode === 'table'" class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let category of filteredCategories()" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl mr-3"
                           [style.background-color]="category.color + '20'">
                        {{ category.icon }}
                      </div>
                      <div class="font-medium text-gray-900">{{ category.name }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm text-gray-600 font-mono">{{ category.code }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm text-gray-900">{{ category.type }}</span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-sm text-gray-600 line-clamp-1">{{ category.description }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="text-sm text-gray-900">{{ category.itemCount }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      [class.bg-green-100]="category.status === 'active'"
                      [class.text-green-800]="category.status === 'active'"
                      [class.bg-red-100]="category.status === 'inactive'"
                      [class.text-red-800]="category.status === 'inactive'"
                      class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
                      {{ category.status | titlecase }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ category.createdDate }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button (click)="editCategory(category)" class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button (click)="deleteCategory(category)" class="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Add/Edit Category Modal -->
        <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-2xl font-bold text-gray-900">{{ isEditMode ? 'Edit Category' : 'Add New Category' }}</h2>
            </div>
            <div class="p-6">
              <form class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
                    <input 
                      type="text" 
                      [(ngModel)]="formData.name"
                      name="name"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Code *</label>
                    <input 
                      type="text" 
                      [(ngModel)]="formData.code"
                      name="code"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select 
                    [(ngModel)]="formData.type"
                    name="type"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select Type</option>
                    <option *ngFor="let type of categoryTypes" [value]="type.value">{{ type.label }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea 
                    [(ngModel)]="formData.description"
                    name="description"
                    rows="3"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                    <input 
                      type="text" 
                      [(ngModel)]="formData.icon"
                      name="icon"
                      placeholder="🏥"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <input 
                      type="color" 
                      [(ngModel)]="formData.color"
                      name="color"
                      class="w-full h-10 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select 
                    [(ngModel)]="formData.status"
                    name="status"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </form>
            </div>
            <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                (click)="closeModal()"
                class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Cancel
              </button>
              <button
                (click)="saveCategory()"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                {{ isEditMode ? 'Update' : 'Create' }} Category
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
    `
})

export class AdminCommonCategoryComponent {
    // #region Inputs, Outputs, Properties
    viewMode: 'grid' | 'table' = 'grid';
    selectedType = 'all';
    searchTerm = '';
    filterStatus = '';
    showModal = false;
    isEditMode = false;
    openMenuId: number | null = null;

    categoryTypes = [
        { label: 'All Categories', value: 'all' },
        { label: 'Departments', value: 'department' },
        { label: 'Medical Specialties', value: 'specialty' },
        { label: 'Services', value: 'service' },
        { label: 'Equipment Types', value: 'equipment' },
        { label: 'Medicine Categories', value: 'medicine' },
        { label: 'Insurance Plans', value: 'insurance' },
    ];

    categories: Category[] = [
        { id: 1, name: 'Cardiology', code: 'CARD-001', description: 'Heart and cardiovascular system care', type: 'department', parentId: null, status: 'active', itemCount: 45, color: '#EF4444', icon: '❤️', createdDate: '2024-01-15' },
        { id: 2, name: 'Pediatrics', code: 'PEDI-001', description: 'Child healthcare services', type: 'department', parentId: null, status: 'active', itemCount: 78, color: '#F59E0B', icon: '👶', createdDate: '2024-01-16' },
        { id: 3, name: 'Emergency', code: 'EMER-001', description: 'Emergency medical services', type: 'department', parentId: null, status: 'active', itemCount: 120, color: '#DC2626', icon: '🚨', createdDate: '2024-01-17' },
        { id: 4, name: 'Orthopedics', code: 'ORTH-001', description: 'Bone and joint care', type: 'specialty', parentId: null, status: 'active', itemCount: 34, color: '#10B981', icon: '🦴', createdDate: '2024-01-18' },
        { id: 5, name: 'Neurology', code: 'NEUR-001', description: 'Brain and nervous system', type: 'specialty', parentId: null, status: 'active', itemCount: 56, color: '#8B5CF6', icon: '🧠', createdDate: '2024-01-19' },
        { id: 6, name: 'Laboratory Services', code: 'LAB-001', description: 'Diagnostic testing services', type: 'service', parentId: null, status: 'active', itemCount: 89, color: '#06B6D4', icon: '🔬', createdDate: '2024-01-20' },
        { id: 7, name: 'Radiology', code: 'RAD-001', description: 'Medical imaging services', type: 'service', parentId: null, status: 'active', itemCount: 67, color: '#3B82F6', icon: '📷', createdDate: '2024-01-21' },
        { id: 8, name: 'Surgery', code: 'SURG-001', description: 'Surgical procedures and operations', type: 'department', parentId: null, status: 'active', itemCount: 92, color: '#6366F1', icon: '🔪', createdDate: '2024-01-22' },
        { id: 9, name: 'MRI Scanner', code: 'EQP-001', description: 'Magnetic Resonance Imaging equipment', type: 'equipment', parentId: null, status: 'active', itemCount: 12, color: '#EC4899', icon: '🏥', createdDate: '2024-01-23' },
        { id: 10, name: 'Antibiotics', code: 'MED-001', description: 'Antibiotic medications', type: 'medicine', parentId: null, status: 'active', itemCount: 156, color: '#14B8A6', icon: '💊', createdDate: '2024-01-24' },
        { id: 11, name: 'Basic Health Plan', code: 'INS-001', description: 'Standard health insurance coverage', type: 'insurance', parentId: null, status: 'active', itemCount: 234, color: '#0EA5E9', icon: '🛡️', createdDate: '2024-01-25' },
        { id: 12, name: 'Dermatology', code: 'DERM-001', description: 'Skin care and treatment', type: 'specialty', parentId: null, status: 'inactive', itemCount: 28, color: '#F97316', icon: '✨', createdDate: '2024-01-26' },
    ];

    formData: any = {
        name: '',
        code: '',
        description: '',
        type: '',
        status: 'active',
        icon: '📋',
        color: '#3B82F6',
    };
    // #endregion

    // #region Methods
    filteredCategories(): Category[] {
        return this.categories.filter(cat => {
            const matchesSearch = cat.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                cat.code.toLowerCase().includes(this.searchTerm.toLowerCase());
            const matchesType = this.selectedType === 'all' || cat.type === this.selectedType;
            const matchesStatus = !this.filterStatus || cat.status === this.filterStatus;
            return matchesSearch && matchesType && matchesStatus;
        });
    }

    getCategoryCountByType(type: string): number {
        if (type === 'all') return this.categories.length;
        return this.categories.filter(cat => cat.type === type).length;
    }

    getTotalCategories(): number {
        return this.categories.length;
    }

    getActiveCategories(): number {
        return this.categories.filter(cat => cat.status === 'active').length;
    }

    getInactiveCategories(): number {
        return this.categories.filter(cat => cat.status === 'inactive').length;
    }

    toggleMenu(id: number): void {
        this.openMenuId = this.openMenuId === id ? null : id;
    }

    openAddModal(): void {
        this.isEditMode = false;
        this.formData = {
            name: '',
            code: '',
            description: '',
            type: this.selectedType !== 'all' ? this.selectedType : '',
            status: 'active',
            icon: '📋',
            color: '#3B82F6',
        };
        this.showModal = true;
    }

    editCategory(category: Category): void {
        this.isEditMode = true;
        this.formData = { ...category };
        this.showModal = true;
        this.openMenuId = null;
    }

    duplicateCategory(category: Category): void {
        const newCategory: Category = {
            ...category,
            id: Math.max(...this.categories.map(c => c.id)) + 1,
            name: category.name + ' (Copy)',
            code: category.code + '-COPY',
            createdDate: new Date().toISOString().split('T')[0],
        };
        this.categories.push(newCategory);
        this.openMenuId = null;
    }

    deleteCategory(category: Category): void {
        if (confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
            this.categories = this.categories.filter(c => c.id !== category.id);
        }
        this.openMenuId = null;
    }

    saveCategory(): void {
        if (this.isEditMode) {
            const index = this.categories.findIndex(c => c.id === this.formData.id);
            if (index !== -1) {
                this.categories[index] = { ...this.formData };
            }
        } else {
            const newCategory: Category = {
                ...this.formData,
                id: Math.max(...this.categories.map(c => c.id)) + 1,
                itemCount: 0,
                parentId: null,
                createdDate: new Date().toISOString().split('T')[0],
            };
            this.categories.push(newCategory);
        }
        this.closeModal();
    }

    closeModal(): void {
        this.showModal = false;
        this.isEditMode = false;
        this.openMenuId = null;
    }
    // #endregion
}