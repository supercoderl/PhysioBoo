import { Component } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { User } from "../../../../shared/types/uset";
import { Permission } from "../../../../shared/types/permission";

@Component({
    selector: 'admin-user-permission',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-7xl mx-auto">
        <!-- Page Header -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900">User & Permission Management</h1>
          <p class="text-gray-600 mt-2">Manage hospital staff users and their access permissions</p>
        </div>

        <!-- Tabs -->
        <div class="bg-white rounded-lg shadow-sm mb-6">
          <div class="border-b border-gray-200">
            <nav class="flex -mb-px">
              <button
                (click)="activeTab = 'users'"
                [class.border-blue-500]="activeTab === 'users'"
                [class.text-blue-600]="activeTab === 'users'"
                [class.text-gray-500]="activeTab !== 'users'"
                class="px-6 py-4 text-sm font-medium border-b-2 hover:text-blue-600 hover:border-blue-300 transition-colors">
                Users
              </button>
              <button
                (click)="activeTab = 'permissions'"
                [class.border-blue-500]="activeTab === 'permissions'"
                [class.text-blue-600]="activeTab === 'permissions'"
                [class.text-gray-500]="activeTab !== 'permissions'"
                class="px-6 py-4 text-sm font-medium border-b-2 hover:text-blue-600 hover:border-blue-300 transition-colors">
                Permissions
              </button>
              <button
                (click)="activeTab = 'roles'"
                [class.border-blue-500]="activeTab === 'roles'"
                [class.text-blue-600]="activeTab === 'roles'"
                [class.text-gray-500]="activeTab !== 'roles'"
                class="px-6 py-4 text-sm font-medium border-b-2 hover:text-blue-600 hover:border-blue-300 transition-colors">
                Roles
              </button>
            </nav>
          </div>
        </div>

        <!-- Users Tab -->
        <div *ngIf="activeTab === 'users'" class="space-y-6">
          <!-- Search and Filter Bar -->
          <div class="bg-white p-4 rounded-lg shadow-sm">
            <div class="flex flex-col md:flex-row gap-4">
              <div class="flex-1">
                <input
                  type="text"
                  [(ngModel)]="searchTerm"
                  placeholder="Search users by name or email..."
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              </div>
              <select [(ngModel)]="filterRole" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">All Roles</option>
                <option value="Doctor">Doctor</option>
                <option value="Nurse">Nurse</option>
                <option value="Administrator">Administrator</option>
                <option value="Receptionist">Receptionist</option>
              </select>
              <select [(ngModel)]="filterStatus" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button
                (click)="showAddUserModal = true"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap">
                + Add User
              </button>
            </div>
          </div>

          <!-- Users Table -->
          <div class="bg-white rounded-lg shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let user of filteredUsers()" class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span class="text-blue-600 font-medium">{{ getInitials(user.name) }}</span>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                          <div class="text-sm text-gray-500">{{ user.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="text-sm text-gray-900">{{ user.role }}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="text-sm text-gray-900">{{ user.department }}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span
                        [class.bg-green-100]="user.status === 'active'"
                        [class.text-green-800]="user.status === 'active'"
                        [class.bg-red-100]="user.status === 'inactive'"
                        [class.text-red-800]="user.status === 'inactive'"
                        class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
                        {{ user.status | titlecase }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <button
                        (click)="editUserPermissions(user)"
                        class="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        {{ user.permissions.length }} assigned
                      </button>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button (click)="editUser(user)" class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                      <button (click)="deleteUser(user)" class="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Permissions Tab -->
        <div *ngIf="activeTab === 'permissions'" class="space-y-6">
          <div class="bg-white p-4 rounded-lg shadow-sm">
            <div class="flex justify-between items-center">
              <input
                type="text"
                [(ngModel)]="permissionSearch"
                placeholder="Search permissions..."
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <button
                (click)="showAddPermissionModal = true"
                class="ml-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                + Add Permission
              </button>
            </div>
          </div>

          <!-- Permission Categories -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div *ngFor="let category of getPermissionCategories()" class="bg-white rounded-lg shadow-sm p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ category }}</h3>
              <div class="space-y-3">
                <div *ngFor="let permission of getPermissionsByCategory(category)" class="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex-1">
                    <div class="font-medium text-gray-900">{{ permission.name }}</div>
                    <div class="text-sm text-gray-500 mt-1">{{ permission.description }}</div>
                  </div>
                  <button class="ml-4 text-gray-400 hover:text-red-600 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Roles Tab -->
        <div *ngIf="activeTab === 'roles'" class="space-y-6">
          <div class="bg-white p-4 rounded-lg shadow-sm">
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-semibold text-gray-900">Role Templates</h2>
              <button class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                + Create Role
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let role of roles" class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">{{ role.name }}</h3>
                <span class="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {{ role.userCount }} users
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-4">{{ role.description }}</p>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">{{ role.permissionCount }} permissions</span>
                <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">Configure</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Add/Edit User Modal -->
        <div *ngIf="showAddUserModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-2xl font-bold text-gray-900">Add New User</h2>
            </div>
            <div class="p-6">
              <form class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>Doctor</option>
                      <option>Nurse</option>
                      <option>Administrator</option>
                      <option>Receptionist</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <select class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>Cardiology</option>
                      <option>Emergency</option>
                      <option>Pediatrics</option>
                      <option>Surgery</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </form>
            </div>
            <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                (click)="showAddUserModal = false"
                class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Cancel
              </button>
              <button
                (click)="showAddUserModal = false"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Add User
              </button>
            </div>
          </div>
        </div>

        <!-- Permission Assignment Modal -->
        <div *ngIf="showPermissionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-gray-200">
              <h2 class="text-2xl font-bold text-gray-900">Edit Permissions for {{ selectedUser?.name }}</h2>
            </div>
            <div class="p-6">
              <div class="space-y-6">
                <div *ngFor="let category of getPermissionCategories()">
                  <h3 class="text-lg font-semibold text-gray-900 mb-3">{{ category }}</h3>
                  <div class="space-y-2">
                    <label *ngFor="let permission of getPermissionsByCategory(category)" class="flex items-start p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        [checked]="isPermissionAssigned(permission.id)"
                        (change)="togglePermission(permission.id)"
                        class="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                      <div class="ml-3 flex-1">
                        <div class="font-medium text-gray-900">{{ permission.name }}</div>
                        <div class="text-sm text-gray-500">{{ permission.description }}</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                (click)="showPermissionModal = false"
                class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Cancel
              </button>
              <button
                (click)="savePermissions()"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Save Changes
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
    `
})

export class AdminUserPermissionComponent {
    // #region Inputs, Outputs, Properties
    activeTab: 'users' | 'permissions' | 'roles' = 'users';
    searchTerm = '';
    permissionSearch = '';
    filterRole = '';
    filterStatus = '';
    showAddUserModal = false;
    showAddPermissionModal = false;
    showPermissionModal = false;
    selectedUser: User | null = null;
    tempPermissions: string[] = [];

    users: User[] = [
        { id: 1, name: 'Dr. Sarah Johnson', email: 'sarah.j@hospital.com', role: 'Doctor', department: 'Cardiology', status: 'active', permissions: ['view_patients', 'edit_patients', 'view_medical_records'] },
        { id: 2, name: 'Michael Chen', email: 'michael.c@hospital.com', role: 'Nurse', department: 'Emergency', status: 'active', permissions: ['view_patients', 'update_vitals'] },
        { id: 3, name: 'Emily Rodriguez', email: 'emily.r@hospital.com', role: 'Administrator', department: 'Administration', status: 'active', permissions: ['view_patients', 'manage_users', 'view_reports', 'manage_billing'] },
        { id: 4, name: 'James Wilson', email: 'james.w@hospital.com', role: 'Receptionist', department: 'Front Desk', status: 'active', permissions: ['view_appointments', 'create_appointments'] },
        { id: 5, name: 'Dr. Lisa Anderson', email: 'lisa.a@hospital.com', role: 'Doctor', department: 'Pediatrics', status: 'inactive', permissions: ['view_patients', 'edit_patients'] },
    ];

    permissions: Permission[] = [
        { id: 'view_patients', name: 'View Patients', description: 'View patient information and records', category: 'Patient Management' },
        { id: 'edit_patients', name: 'Edit Patients', description: 'Modify patient information', category: 'Patient Management' },
        { id: 'view_medical_records', name: 'View Medical Records', description: 'Access patient medical history', category: 'Patient Management' },
        { id: 'update_vitals', name: 'Update Vitals', description: 'Record patient vital signs', category: 'Patient Management' },
        { id: 'view_appointments', name: 'View Appointments', description: 'See scheduled appointments', category: 'Appointments' },
        { id: 'create_appointments', name: 'Create Appointments', description: 'Schedule new appointments', category: 'Appointments' },
        { id: 'cancel_appointments', name: 'Cancel Appointments', description: 'Cancel or reschedule appointments', category: 'Appointments' },
        { id: 'manage_users', name: 'Manage Users', description: 'Create, edit, and delete users', category: 'System Administration' },
        { id: 'view_reports', name: 'View Reports', description: 'Access system reports', category: 'System Administration' },
        { id: 'manage_billing', name: 'Manage Billing', description: 'Handle patient billing', category: 'Billing & Finance' },
        { id: 'view_invoices', name: 'View Invoices', description: 'View patient invoices', category: 'Billing & Finance' },
    ];

    roles = [
        { name: 'Doctor', description: 'Full access to patient care and medical records', userCount: 45, permissionCount: 12 },
        { name: 'Nurse', description: 'Patient care and vital monitoring', userCount: 120, permissionCount: 8 },
        { name: 'Administrator', description: 'System and user management', userCount: 15, permissionCount: 15 },
        { name: 'Receptionist', description: 'Appointment and front desk management', userCount: 30, permissionCount: 5 },
    ];
    // #endregion

    // #region Methods
    filteredUsers(): User[] {
        return this.users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
            const matchesRole = !this.filterRole || user.role === this.filterRole;
            const matchesStatus = !this.filterStatus || user.status === this.filterStatus;
            return matchesSearch && matchesRole && matchesStatus;
        });
    }

    getInitials(name: string): string {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    getPermissionCategories(): string[] {
        return [...new Set(this.permissions.map(p => p.category))];
    }

    getPermissionsByCategory(category: string): Permission[] {
        return this.permissions.filter(p => p.category === category &&
            (!this.permissionSearch || p.name.toLowerCase().includes(this.permissionSearch.toLowerCase())));
    }

    editUser(user: User): void {
        console.log('Edit user:', user);
    }

    deleteUser(user: User): void {
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
            this.users = this.users.filter(u => u.id !== user.id);
        }
    }

    editUserPermissions(user: User): void {
        this.selectedUser = user;
        this.tempPermissions = [...user.permissions];
        this.showPermissionModal = true;
    }

    isPermissionAssigned(permissionId: string): boolean {
        return this.tempPermissions.includes(permissionId);
    }

    togglePermission(permissionId: string): void {
        const index = this.tempPermissions.indexOf(permissionId);
        if (index > -1) {
            this.tempPermissions.splice(index, 1);
        } else {
            this.tempPermissions.push(permissionId);
        }
    }

    savePermissions(): void {
        if (this.selectedUser) {
            this.selectedUser.permissions = [...this.tempPermissions];
        }
        this.showPermissionModal = false;
        this.selectedUser = null;
    }
    // #endregion
}