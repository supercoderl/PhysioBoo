import { Component, OnInit } from "@angular/core";
import { finalize, firstValueFrom, forkJoin } from "rxjs";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { BedMapAssignDrawerComponent } from "../../../../components/layout/admin/inpatient/bed-map/bed-assign-drawer.component";
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { BedMapService } from "../../../../services/admin/bed-map.service";
import { LocalLoadingService } from "../../../../services/common/local-loading.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { Bed, BedHistoryEntry, BedStatus } from "../../../../shared/types/bed.types";
import { BedFilter } from "../../../../shared/types/filter.types";
import { BedMapStats, Ward } from "../../../../shared/types/ward.types";

@Component({
    selector: 'admin-bed-map',
    standalone: true,
    imports: [
        SharedModule,
        BooIconComponent,
        BooSelectComponent,
        BedMapAssignDrawerComponent
    ],
    template: `
        <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <!-- Header Section -->
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">Bed Management System</h2>
            <p class="text-gray-600">Real-time bed occupancy and availability</p>
          </div>
          <button (click)="refresh()" [disabled]="loadingSrv.isLoading('bed-map-snapshot')"
            class="px-4 py-2 bg-surface border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50">
            <boo-icon name="refresh-cw" [size]="16" [class.animate-spin]="loadingSrv.isLoading('bed-map-snapshot')"></boo-icon>
            Refresh
          </button>
        </div>

        <!-- Error State -->
        <div *ngIf="hasError && !loadingSrv.isLoading('bed-map-snapshot')" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <boo-icon name="alert-circle" [size]="20" class="text-red-500"></boo-icon>
            <span class="text-red-700 text-sm">Unable to load the bed map. Please try again.</span>
          </div>
          <button (click)="refresh()" class="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">Retry</button>
        </div>

        <!-- Loading State (initial) -->
        <div *ngIf="loadingSrv.isLoading('bed-map-snapshot') && !hasLoadedOnce" class="flex flex-col items-center justify-center py-24 gap-3">
          <boo-icon name="loader" [size]="32" class="animate-spin text-primary"></boo-icon>
          <span class="text-gray-500 text-sm">Loading bed map...</span>
        </div>

        <ng-container *ngIf="!hasError && hasLoadedOnce">
          <!-- Statistics Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-surface rounded-lg shadow-md p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600 mb-1">Total Beds</p>
                  <p class="text-3xl font-bold text-gray-800">{{ stats?.totalBeds ?? 0 }}</p>
                </div>
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <boo-icon name="bed" [size]="24" class="text-blue-600"></boo-icon>
                </div>
              </div>
            </div>

            <div class="bg-surface rounded-lg shadow-md p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600 mb-1">Available</p>
                  <p class="text-3xl font-bold text-green-600">{{ stats?.availableBeds ?? 0 }}</p>
                </div>
                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <boo-icon name="check-circle" [size]="24" class="text-green-600"></boo-icon>
                </div>
              </div>
            </div>

            <div class="bg-surface rounded-lg shadow-md p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600 mb-1">Occupied</p>
                  <p class="text-3xl font-bold text-red-600">{{ stats?.occupiedBeds ?? 0 }}</p>
                </div>
                <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <boo-icon name="user" [size]="24" class="text-red-600"></boo-icon>
                </div>
              </div>
            </div>

            <div class="bg-surface rounded-lg shadow-md p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600 mb-1">Occupancy Rate</p>
                  <p class="text-3xl font-bold text-purple-600">{{ stats?.occupancyRate ?? 0 }}%</p>
                </div>
                <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <boo-icon name="activity" [size]="24" class="text-purple-600"></boo-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- Filters -->
          <div class="bg-surface rounded-lg shadow-md p-4 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <boo-select label="Ward" [(ngModel)]="filter.wardId" [options]="wardOptions" bindLabel="label" bindValue="value"></boo-select>
              <boo-select label="Status" [(ngModel)]="filter.status" [options]="statusOptions" bindLabel="label" bindValue="value"></boo-select>
              <boo-select label="Floor" [(ngModel)]="filter.floor" [options]="floorOptions" bindLabel="label" bindValue="value"></boo-select>
              <div class="flex items-end">
                <button (click)="applyFilters()" class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          <!-- Legend -->
          <div class="bg-surface rounded-lg shadow-md p-4 mb-6">
            <h3 class="text-sm font-semibold text-gray-700 mb-3">Bed Status Legend</h3>
            <div class="flex flex-wrap gap-4">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-green-500 rounded mr-2"></div>
                <span class="text-sm text-gray-700">Available</span>
              </div>
              <div class="flex items-center">
                <div class="w-8 h-8 bg-red-500 rounded mr-2"></div>
                <span class="text-sm text-gray-700">Occupied</span>
              </div>
              <div class="flex items-center">
                <div class="w-8 h-8 bg-yellow-500 rounded mr-2"></div>
                <span class="text-sm text-gray-700">Maintenance</span>
              </div>
              <div class="flex items-center">
                <div class="w-8 h-8 bg-blue-500 rounded mr-2"></div>
                <span class="text-sm text-gray-700">Reserved</span>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="filteredWards.length === 0" class="bg-surface rounded-lg shadow-md p-12 flex flex-col items-center justify-center text-center">
            <boo-icon name="inbox" [size]="36" class="text-gray-300 mb-3"></boo-icon>
            <p class="text-gray-500 text-sm">No beds match the selected filters.</p>
          </div>

          <!-- Ward Cards with Bed Maps -->
          <div class="space-y-6">
            <div *ngFor="let ward of filteredWards" class="bg-surface rounded-lg shadow-md overflow-hidden">
              <div class="bg-gray-100 px-6 py-4 border-b border-gray-200">
                <div class="flex justify-between items-center">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-800">{{ ward.name }}</h3>
                    <p class="text-sm text-gray-600">Floor {{ ward.floor }} &bull; {{ ward.availableBeds }} of {{ ward.totalBeds }} beds available</p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div class="text-right mr-4">
                      <div class="text-sm text-gray-600">Occupancy</div>
                      <div class="text-lg font-bold text-gray-800">{{ getWardOccupancyRate(ward) }}%</div>
                    </div>
                    <div class="w-16 h-16">
                      <svg class="transform -rotate-90 w-16 h-16">
                        <circle cx="32" cy="32" r="28" stroke="#e5e7eb" stroke-width="8" fill="none" />
                        <circle cx="32" cy="32" r="28" [attr.stroke]="getWardOccupancyRate(ward) > 80 ? '#ef4444' : getWardOccupancyRate(ward) > 50 ? '#f59e0b' : '#10b981'" stroke-width="8" fill="none" [attr.stroke-dasharray]="175.93" [attr.stroke-dashoffset]="175.93 - (175.93 * getWardOccupancyRate(ward) / 100)" stroke-linecap="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-6">
                <div *ngIf="getWardBeds(ward).length === 0" class="text-sm text-gray-400 text-center py-6">No beds match the selected filters in this ward.</div>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  <div *ngFor="let bed of getWardBeds(ward)"
                       (click)="selectBed(bed)"
                       [ngClass]="{
                         'bg-green-500 hover:bg-green-600': bed.status === 'Available',
                         'bg-red-500 hover:bg-red-600': bed.status === 'Occupied',
                         'bg-yellow-500 hover:bg-yellow-600': bed.status === 'Maintenance',
                         'bg-blue-500 hover:bg-blue-600': bed.status === 'Reserved'
                       }"
                       class="cursor-pointer transition-all transform hover:scale-105 rounded-lg p-4 text-white shadow-md">
                    <div class="text-center">
                      <div class="font-bold text-lg mb-1">{{ bed.number }}</div>
                      <div class="text-xs opacity-90">{{ bed.status }}</div>
                      <div *ngIf="bed.patientName" class="text-xs mt-2 opacity-90 truncate">{{ bed.patientName }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- Selected Bed Details Modal -->
        <div *ngIf="selectedBed" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-surface rounded-lg shadow-xl max-w-md w-full p-6">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-xl font-bold text-gray-800">Bed Details</h3>
              <button (click)="closeBedDetails()" class="text-gray-400 hover:text-gray-600">
                <boo-icon name="x" [size]="20"></boo-icon>
              </button>
            </div>

            <div class="space-y-3">
              <div class="flex justify-between py-2 border-b border-gray-200">
                <span class="text-gray-600">Bed Number:</span>
                <span class="font-semibold text-gray-800">{{ selectedBed.number }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-gray-200">
                <span class="text-gray-600">Status:</span>
                <span
                  [ngClass]="{
                    'bg-green-100 text-green-800': selectedBed.status === 'Available',
                    'bg-red-100 text-red-800': selectedBed.status === 'Occupied',
                    'bg-yellow-100 text-yellow-800': selectedBed.status === 'Maintenance',
                    'bg-blue-100 text-blue-800': selectedBed.status === 'Reserved'
                  }"
                  class="px-3 py-1 rounded-full text-sm font-semibold">
                  {{ selectedBed.status }}
                </span>
              </div>
              <div *ngIf="selectedBed.patientName" class="flex justify-between py-2 border-b border-gray-200">
                <span class="text-gray-600">Patient Name:</span>
                <span class="font-semibold text-gray-800">{{ selectedBed.patientName }}</span>
              </div>
              <div *ngIf="selectedBed.patientNumber" class="flex justify-between py-2 border-b border-gray-200">
                <span class="text-gray-600">Patient ID:</span>
                <span class="font-semibold text-gray-800">{{ selectedBed.patientNumber }}</span>
              </div>
              <div *ngIf="selectedBed.admissionDate" class="flex justify-between py-2 border-b border-gray-200">
                <span class="text-gray-600">Admission Date:</span>
                <span class="font-semibold text-gray-800">{{ selectedBed.admissionDate }}</span>
              </div>
            </div>

            <!-- History -->
            <div *ngIf="showHistory" class="mt-4 border-t border-gray-200 pt-4">
              <div *ngIf="loadingSrv.isLoading('bed-history')" class="text-sm text-gray-400 text-center py-3">Loading history...</div>
              <div *ngIf="!loadingSrv.isLoading('bed-history') && history.length === 0" class="text-sm text-gray-400 text-center py-3">No history for this bed.</div>
              <div *ngFor="let entry of history" class="flex justify-between py-1.5 text-sm">
                <span class="text-gray-600">{{ entry.patientName }}</span>
                <span class="text-gray-500">{{ entry.admissionDate }} &rarr; {{ entry.dischargeDate ?? 'present' }}</span>
              </div>
            </div>

            <div class="mt-6 flex space-x-3">
              <button *ngIf="selectedBed.status === 'Available'" (click)="openAssignDrawer()" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Assign Patient
              </button>
              <button *ngIf="selectedBed.status === 'Occupied'" (click)="confirmDischarge()" [disabled]="loadingSrv.isLoading('bed-discharge')" class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                Discharge Patient
              </button>
              <button (click)="toggleHistory()" class="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                View History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <bed-map-assign-drawer
      [isOpen]="isAssignDrawerOpen"
      [bed]="selectedBed"
      (close)="isAssignDrawerOpen = false"
      (assignSuccess)="onAssignSuccess($event)">
    </bed-map-assign-drawer>
    `
})
export class AdminBedMapComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    wards: Ward[] = [];
    beds: Bed[] = [];
    stats: BedMapStats | null = null;
    selectedBed: Bed | null = null;
    history: BedHistoryEntry[] = [];
    showHistory = false;
    isAssignDrawerOpen = false;
    hasError = false;
    hasLoadedOnce = false;

    filter: BedFilter = { wardId: null, status: null, floor: null };

    statusOptions: { label: string; value: BedStatus | null }[] = [
        { label: 'All Status', value: null },
        { label: 'Available', value: 'Available' },
        { label: 'Occupied', value: 'Occupied' },
        { label: 'Maintenance', value: 'Maintenance' },
        { label: 'Reserved', value: 'Reserved' }
    ];
    // #endregion

    constructor(
        private bedMapSrv: BedMapService,
        private toastSrv: ToastService,
        protected loadingSrv: LocalLoadingService
    ) { }

    // #region Init (Lifecycle + Setup)
    ngOnInit(): void {
        this.loadSnapshot();
    }
    // #endregion

    // #region Methods
    get wardOptions(): { label: string; value: string | null }[] {
        return [{ label: 'All Wards', value: null }, ...this.wards.map(w => ({ label: w.name, value: w.id }))];
    }

    get floorOptions(): { label: string; value: number | null }[] {
        const floors = Array.from(new Set(this.wards.map(w => w.floor))).sort((a, b) => a - b);
        return [{ label: 'All Floors', value: null }, ...floors.map(f => ({ label: `Floor ${f}`, value: f }))];
    }

    get filteredWards(): Ward[] {
        let filtered = this.wards;
        if (this.filter.wardId) filtered = filtered.filter(w => w.id === this.filter.wardId);
        if (this.filter.floor != null) filtered = filtered.filter(w => w.floor === this.filter.floor);
        return filtered.filter(w => this.getWardBeds(w).length > 0 || (!this.filter.status && !this.filter.wardId && !this.filter.floor));
    }

    getWardBeds(ward: Ward): Bed[] {
        let beds = this.beds.filter(b => b.wardId === ward.id);
        if (this.filter.status) beds = beds.filter(b => b.status === this.filter.status);
        return beds;
    }

    getWardOccupancyRate(ward: Ward): number {
        return ward.totalBeds > 0 ? Math.round((ward.occupiedBeds / ward.totalBeds) * 100) : 0;
    }

    loadSnapshot(): void {
        this.hasError = false;
        this.loadingSrv.setLoading('bed-map-snapshot', true);

        forkJoin({
            snapshot: this.bedMapSrv.snapshot(),
            stats: this.bedMapSrv.stats()
        })
            .pipe(finalize(() => this.loadingSrv.setLoading('bed-map-snapshot', false)))
            .subscribe({
                next: ({ snapshot, stats }) => {
                    if (snapshot.success && snapshot.data) {
                        this.wards = snapshot.data.wards;
                        this.beds = snapshot.data.beds;
                    }
                    if (stats.success && stats.data) {
                        this.stats = stats.data;
                    }
                    this.hasLoadedOnce = true;
                },
                error: () => {
                    this.hasError = true;
                    this.hasLoadedOnce = true;
                }
            });
    }

    refresh(): void {
        this.loadSnapshot();
    }

    applyFilters(): void {
        // Filters are applied client-side against the loaded snapshot.
    }

    selectBed(bed: Bed): void {
        this.selectedBed = bed;
        this.showHistory = false;
        this.history = [];
    }

    closeBedDetails(): void {
        this.selectedBed = null;
        this.showHistory = false;
    }

    toggleHistory(): void {
        if (!this.selectedBed) return;
        this.showHistory = !this.showHistory;
        if (this.showHistory) this.loadHistory(this.selectedBed.id);
    }

    loadHistory(bedId: string): void {
        this.loadingSrv.setLoading('bed-history', true);
        this.bedMapSrv.history(bedId)
            .pipe(finalize(() => this.loadingSrv.setLoading('bed-history', false)))
            .subscribe(_res => {
                this.history = _res.success && _res.data ? _res.data : [];
            });
    }

    openAssignDrawer(): void {
        this.isAssignDrawerOpen = true;
    }

    onAssignSuccess(updatedBed: Bed): void {
        this.isAssignDrawerOpen = false;
        this.applyBedUpdate(updatedBed);
        this.selectedBed = updatedBed;
    }

    async confirmDischarge(): Promise<void> {
        if (!this.selectedBed) return;
        const bed = this.selectedBed;

        this.toastSrv.confirm(
            `Discharge ${bed.patientName ?? 'this patient'} from bed ${bed.number}?`,
            async () => {
                this.loadingSrv.setLoading('bed-discharge', true);
                try {
                    const response = await firstValueFrom(this.bedMapSrv.discharge(bed.id, {}));
                    if (response.success) {
                        this.toastSrv.success('Patient discharged');
                        const updatedBed: Bed = { ...bed, status: 'Available', patientId: null, patientName: null, patientNumber: null, admissionDate: null, expectedDischargeDate: null };
                        this.applyBedUpdate(updatedBed);
                        this.selectedBed = updatedBed;
                    } else {
                        this.toastSrv.error('Unable to discharge patient');
                    }
                } catch {
                    this.toastSrv.error('Unable to discharge patient');
                } finally {
                    this.loadingSrv.setLoading('bed-discharge', false);
                }
            },
            undefined,
            'Discharge'
        );
    }

    private applyBedUpdate(updatedBed: Bed): void {
        const ward = this.wards.find(w => w.id === updatedBed.wardId);
        const previousBed = this.beds.find(b => b.id === updatedBed.id);

        this.beds = this.beds.map(b => b.id === updatedBed.id ? updatedBed : b);

        if (ward && previousBed && previousBed.status !== updatedBed.status) {
            if (previousBed.status === 'Occupied') ward.occupiedBeds--;
            if (previousBed.status === 'Available') ward.availableBeds--;
            if (updatedBed.status === 'Occupied') ward.occupiedBeds++;
            if (updatedBed.status === 'Available') ward.availableBeds++;
        }
    }
    // #endregion
}
