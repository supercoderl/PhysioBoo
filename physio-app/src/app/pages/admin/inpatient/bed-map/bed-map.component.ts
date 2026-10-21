import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
    BooButtonComponent,
    BooEmptyStateComponent,
    BooErrorStateComponent,
    BooFilterChip,
    BooFilterChipsComponent,
    BooIconComponent,
    BooInlineErrorComponent,
    BooInlineErrorState,
    BooSearchFieldComponent,
    BooStatusBadgeComponent,
} from '@physioboo/ui';
import { catchError, finalize, forkJoin, map, of } from 'rxjs';
import { AdminBreadcrumbComponent } from '../../../../components/breadcrumb/admin-breadcrumb.component';
import { BedMapAssignDrawerComponent } from '../../../../components/layout/admin/inpatient/bed-map/bed-assign-drawer.component';
import { BedMapManageDrawerComponent } from '../../../../components/layout/admin/inpatient/bed-map/bed-manage-drawer.component';
import { BooSelectComponent } from '../../../../components/select/boo-select/boo-select.component';
import { BedMapService } from '../../../../services/admin/bed-map.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { ToastService } from '../../../../services/common/toast.service';
import { Permissions } from '../../../../shared/constants/permission.constant';
import { SKIP_ERROR_TOAST } from '../../../../shared/contexts/option.context';
import { Bed, BedStatus } from '../../../../shared/types/bed.types';
import { BedMapSnapshot, BedMapStats, Ward } from '../../../../shared/types/ward.types';
import { BedDetailDrawerComponent } from './bed-detail-drawer.component';
import { WardGroup, bedStatus, groupByRoom, wardOccupancy } from './bed-map.utils';

type LoadError = 'forbidden' | 'failed';
type SnapshotResult = { snapshot: BedMapSnapshot } | { status: number };
type FilterKey = 'search' | 'ward' | 'floor' | 'bedType' | 'status';

interface FilterChip extends BooFilterChip {
    key: FilterKey;
}

interface StatusTile {
    key: BedStatus | null;
    label: string;
    count: number | null;
}

/** "All" entry of a select; the select binds a null value to it. */
const ALL = null;

@Component({
    selector: 'admin-bed-map',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        DatePipe,
        FormsModule,
        BooButtonComponent,
        BooEmptyStateComponent,
        BooErrorStateComponent,
        BooFilterChipsComponent,
        BooIconComponent,
        BooInlineErrorComponent,
        BooSearchFieldComponent,
        BooStatusBadgeComponent,
        BooSelectComponent,
        AdminBreadcrumbComponent,
        BedDetailDrawerComponent,
        BedMapAssignDrawerComponent,
        BedMapManageDrawerComponent,
    ],
    templateUrl: './bed-map.component.html',
})
export class AdminBedMapComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    private readonly destroyRef = inject(DestroyRef);
    private readonly silent = new HttpContext().set(SKIP_ERROR_TOAST, true);

    wards: Ward[] = [];
    beds: Bed[] = [];
    stats: BedMapStats | null = null;

    loading = false;
    /** At least one snapshot has been received; from then on a failed refresh keeps the previous map on screen. */
    loaded = false;
    loadError: LoadError | null = null;
    refreshErrorState: BooInlineErrorState = 'default';
    lastUpdated: Date | null = null;

    query = '';
    wardId: string | null = ALL;
    floor: number | null = ALL;
    bedType: string | null = ALL;
    status: BedStatus | null = ALL;

    groups: WardGroup[] = [];
    chips: FilterChip[] = [];
    statusTiles: StatusTile[] = [];
    wardOptions: { label: string; value: string | null }[] = [];
    floorOptions: { label: string; value: number | null }[] = [];
    typeOptions: { label: string; value: string | null }[] = [];

    selectedBed: Bed | null = null;
    assignOpen = false;
    manageOpen = false;
    busy = false;
    private returnFocus: HTMLElement | null = null;

    canAssign = false;
    canManage = false;
    nursingLink: string | null = null;

    readonly statusOf = bedStatus;
    readonly wardOccupancy = wardOccupancy;
    readonly skeletonTiles = Array.from({ length: 6 });
    readonly skeletonBeds = Array.from({ length: 8 });
    // #endregion

    constructor(
        private bedMapSrv: BedMapService,
        private authSrv: AuthService,
        private dialogSrv: DialogService,
        private toastSrv: ToastService,
    ) { }

    // #region Init (Lifecycle + Setup)
    ngOnInit(): void {
        this.authSrv.permissions$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(perms => this.applyPermissions(perms ?? []));

        this.statusTiles = this.buildTiles();
        this.load();
    }
    // #endregion

    // #region Methods
    load(): void {
        if (this.loading) return;
        this.refreshErrorState = this.loadError ? 'retrying' : 'default';
        this.loading = true;
        this.loadError = null;

        forkJoin({
            // Stats are secondary: when only they fail the map still shows, with the counts left blank.
            result: this.bedMapSrv.snapshot(this.silent).pipe(
                map((res): SnapshotResult => res.success && res.data ? { snapshot: res.data } : { status: 0 }),
                catchError((err: HttpErrorResponse) => of<SnapshotResult>({ status: err?.status ?? 0 })),
            ),
            stats: this.bedMapSrv.stats(this.silent).pipe(
                map(res => res.success && res.data ? res.data : null),
                catchError(() => of(null)),
            ),
        })
            .pipe(finalize(() => this.loading = false))
            .subscribe(({ result, stats }) => {
                if (!('snapshot' in result)) {
                    this.loadError = result.status === 403 ? 'forbidden' : 'failed';
                    this.refreshErrorState = 'failed';
                    // A forbidden response means the map is no longer allowed on screen, even a previous one.
                    if (this.loadError === 'forbidden') this.reset();
                    return;
                }
                this.wards = result.snapshot.wards;
                this.beds = result.snapshot.beds;
                this.stats = stats;
                this.loaded = true;
                this.lastUpdated = new Date();
                // Keep the open drawer in step with the refreshed bed; close it if the bed is gone.
                this.selectedBed = this.selectedBed ? this.beds.find(b => b.id === this.selectedBed!.id) ?? null : null;
                if (!this.selectedBed) this.assignOpen = false;
                this.buildOptions();
                this.statusTiles = this.buildTiles();
                this.applyFilters();
            });
    }

    applyFilters(): void {
        const q = this.query.trim().toLowerCase();
        const match = (b: Bed): boolean =>
            (!this.status || b.status === this.status)
            && (!this.bedType || b.bedType === this.bedType)
            && (!q || [b.number, b.roomNumber, b.patientName, b.patientNumber].some(v => !!v && v.toLowerCase().includes(q)));
        const filtering = !!(q || this.status || this.bedType);

        const bedsByWard = new Map<string, Bed[]>();
        for (const bed of this.beds) {
            if (!match(bed)) continue;
            const list = bedsByWard.get(bed.wardId);
            if (list) list.push(bed);
            else bedsByWard.set(bed.wardId, [bed]);
        }

        this.groups = this.wards
            .filter(w => (!this.wardId || w.id === this.wardId) && (this.floor === null || w.floor === this.floor))
            // A ward with no match is hidden while a bed-level filter is on, but an empty ward still shows otherwise.
            .filter(w => !filtering || bedsByWard.has(w.id))
            .map(ward => {
                const list = bedsByWard.get(ward.id) ?? [];
                return { ward, rooms: groupByRoom(list), bedCount: list.length };
            });
        this.chips = this.buildChips();
    }

    toggleStatus(key: BedStatus | null): void {
        this.status = key === null || this.status === key ? ALL : key;
        this.applyFilters();
    }

    removeChip(chip: FilterChip): void {
        switch (chip.key) {
            case 'search': this.query = ''; break;
            case 'ward': this.wardId = ALL; break;
            case 'floor': this.floor = ALL; break;
            case 'bedType': this.bedType = ALL; break;
            case 'status': this.status = ALL; break;
        }
        this.applyFilters();
    }

    clearFilters(): void {
        this.query = '';
        this.wardId = ALL;
        this.floor = ALL;
        this.bedType = ALL;
        this.status = ALL;
        this.applyFilters();
    }

    openBed(bed: Bed, event: Event): void {
        this.returnFocus = event.currentTarget as HTMLElement;
        this.selectedBed = bed;
    }

    closeBed(): void {
        this.selectedBed = null;
        this.assignOpen = false;
        this.returnFocus?.focus();
        this.returnFocus = null;
    }

    onAssigned(): void {
        this.assignOpen = false;
        this.load();
    }

    confirmDischarge(bed: Bed): void {
        if (this.busy) return;
        this.dialogSrv.confirm(
            `Discharge ${bed.patientName || 'this patient'} from bed ${bed.number}? The bed becomes available.`,
            () => this.discharge(bed),
            'Discharge patient',
            'warning',
            'Discharge',
            'Keep patient',
        );
    }

    bedLabel(bed: Bed): string {
        const parts = [`Bed ${bed.number}`, bedStatus(bed.status).label, bed.bedType];
        if (bed.patientName) parts.push(bed.patientName);
        if (bed.isolationRequired) parts.push('isolation required');
        return parts.join(', ');
    }

    trackById(_: number, bed: Bed): string {
        return bed.id;
    }

    trackByWard(_: number, group: WardGroup): string {
        return group.ward.id;
    }

    trackByKey(_: number, tile: StatusTile): string {
        return tile.key ?? 'all';
    }

    private discharge(bed: Bed): void {
        this.busy = true;
        this.bedMapSrv.discharge(bed.id, {})
            .pipe(finalize(() => this.busy = false))
            .subscribe(res => {
                if (res.success) {
                    this.toastSrv.success('Patient discharged');
                    this.load();
                } else {
                    this.toastSrv.error('Unable to discharge patient');
                }
            });
    }

    private reset(): void {
        this.wards = [];
        this.beds = [];
        this.stats = null;
        this.loaded = false;
        this.selectedBed = null;
        this.assignOpen = false;
        this.applyFilters();
    }

    private buildTiles(): StatusTile[] {
        const s = this.stats;
        return [
            { key: ALL, label: 'All beds', count: s?.totalBeds ?? null },
            { key: 'Available', label: 'Available', count: s?.availableBeds ?? null },
            { key: 'Occupied', label: 'Occupied', count: s?.occupiedBeds ?? null },
            { key: 'Maintenance', label: 'Maintenance', count: s?.maintenanceBeds ?? null },
            { key: 'Reserved', label: 'Reserved', count: s?.reservedBeds ?? null },
        ];
    }

    private buildOptions(): void {
        const floors = Array.from(new Set(this.wards.map(w => w.floor))).sort((a, b) => a - b);
        const types = Array.from(new Set(this.beds.map(b => b.bedType))).sort((a, b) => a.localeCompare(b));
        this.wardOptions = [{ label: 'All wards', value: ALL }, ...this.wards.map(w => ({ label: w.name, value: w.id }))];
        this.floorOptions = [{ label: 'All floors', value: ALL }, ...floors.map(f => ({ label: `Floor ${f}`, value: f }))];
        this.typeOptions = [{ label: 'All types', value: ALL }, ...types.map(t => ({ label: t, value: t }))];
    }

    private buildChips(): FilterChip[] {
        const chips: FilterChip[] = [];
        if (this.query.trim()) chips.push({ key: 'search', label: `Search: ${this.query.trim()}` });
        if (this.wardId) chips.push({ key: 'ward', label: this.wardOptions.find(o => o.value === this.wardId)?.label ?? 'Ward' });
        if (this.floor !== null) chips.push({ key: 'floor', label: `Floor ${this.floor}` });
        if (this.bedType) chips.push({ key: 'bedType', label: this.bedType });
        if (this.status) chips.push({ key: 'status', label: bedStatus(this.status).label });
        return chips;
    }

    private applyPermissions(perms: string[]): void {
        // Assign and discharge share Inpatient.BedAssign; ward and bed set-up is Inpatient.BedManage.
        this.canAssign = perms.includes(Permissions.Inpatient.BedAssign);
        this.canManage = perms.includes(Permissions.Inpatient.BedManage);
        this.nursingLink = perms.includes(Permissions.Inpatient.NursingRead) ? '/admin/nursing/patient' : null;
    }
    // #endregion
}
