import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from "@angular/core";
import { finalize } from "rxjs";
import { BedMapService } from "../../../../../services/admin/bed-map.service";
import { DepartmentService } from "../../../../../services/admin/department.service";
import { DialogService } from "../../../../../services/common/dialog.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { Bed, BedType, CreateBedRequest } from "../../../../../shared/types/bed.types";
import { CreateWardRequest, Ward } from "../../../../../shared/types/ward.types";
import { DrawerComponent } from "../../../../drawer/drawer.component";
import { BooSelectComponent } from "../../../../select/boo-select/boo-select.component";
import { BooButtonAdminComponent } from "../../../../button/boo-button-admin/boo-button-admin.component";
import { BooInputComponent } from "../../../../input/boo-input/boo-input.component";
import { BooCheckboxComponent } from "../../../../checkbox/boo-checkbox/boo-checkbox.component";

/**
 * Ward and bed set-up for the bed map: add, rename and delete wards; add and delete beds.
 * Patients are assigned to beds from the map itself (bed-map-assign-drawer).
 */
@Component({
    selector: 'bed-map-manage-drawer',
    standalone: true,
    imports: [SharedModule, DrawerComponent,BooSelectComponent, BooButtonAdminComponent, BooInputComponent, BooCheckboxComponent],
    template: `
        <drawer [isOpen]="isOpen" [isShowDialog]="true" (close)="close.emit()">
            <div class="flex flex-col h-full bg-surface">
                <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 class="text-xl font-bold text-primary leading-none mb-1">Wards & Beds</h2>
                        <p class="text-sm text-secondary m-0">Set up the wards and beds shown on the map.</p>
                    </div>
                    <button (click)="close.emit()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100" aria-label="Close">
                        <physio-icon name="x" [size]="20"></physio-icon>
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto p-6 space-y-6" custom-scrollbar>
                    <!-- New ward -->
                    <section class="rounded-lg border border-gray-200 p-4">
                        <h3 class="text-sm font-semibold text-gray-800 mb-3">Add ward</h3>
                        <div class="grid grid-cols-2 gap-3">
                            <div class="flex flex-col gap-1 text-xs text-gray-600 col-span-2">Name
                                <boo-input [(ngModel)]="wardForm.name" [maxlength]="120" label="e.g. General Ward A" size="small"></boo-input>
                            </div>
                            <div class="flex flex-col gap-1 text-xs text-gray-600">Code
                                <boo-input [(ngModel)]="wardForm.code" [maxlength]="20" label="e.g. GWA" size="small"></boo-input>
                            </div>
                            <div class="flex flex-col gap-1 text-xs text-gray-600">Floor
                                <boo-input type="number" [(ngModel)]="wardForm.floor" size="small"></boo-input>
                            </div>
                            <div class="col-span-2">
                                <boo-select label="Department (optional)" [(ngModel)]="wardForm.departmentId" [options]="departmentOptions()" bindLabel="label" bindValue="value"></boo-select>
                            </div>
                        </div>
                        <div class="flex justify-end mt-3">
                            <boo-button-admin (click)="addWard()" [disabled]="!wardForm.name.trim() || saving()" textColor="white" padding="8px 16px" [fontSize]="14" [radius]="8">Add ward</boo-button-admin>
                        </div>
                    </section>

                    <!-- Existing wards -->
                    <div *ngIf="!wards().length" class="text-sm text-gray-500 text-center py-6">No wards yet.</div>
                    <section *ngFor="let w of wards()" class="rounded-lg border border-gray-200">
                        <div class="flex items-center justify-between px-4 py-3">
                            <button (click)="toggleWard(w)" class="flex items-center gap-2 text-left">
                                <physio-icon [name]="expandedWardId() === w.id ? 'chevron-down' : 'chevron-right'" [size]="16"></physio-icon>
                                <span class="font-semibold text-gray-800">{{ w.name }}</span>
                                <span class="text-xs text-gray-500">{{ w.code ? w.code + ' · ' : '' }}Floor {{ w.floor }} · {{ w.totalBeds }} bed{{ w.totalBeds === 1 ? '' : 's' }}</span>
                            </button>
                            <button (click)="deleteWard(w)" [disabled]="w.totalBeds > 0" [title]="w.totalBeds > 0 ? 'Remove its beds first' : 'Delete ward'"
                                class="text-xs text-red-600 hover:underline disabled:text-gray-300 disabled:no-underline">Delete</button>
                        </div>

                        <div *ngIf="expandedWardId() === w.id" class="border-t border-gray-100 px-4 py-3 space-y-3">
                            <div *ngIf="!beds().length" class="text-xs text-gray-500">No beds in this ward.</div>
                            <div *ngFor="let b of beds()" class="flex items-center justify-between text-sm">
                                <span>Bed {{ b.number }}<span class="text-gray-500"> · {{ b.bedType }}{{ b.roomNumber ? ' · Room ' + b.roomNumber : '' }} · {{ b.status }}</span></span>
                                <button (click)="deleteBed(w, b)" [disabled]="b.status === 'Occupied'" [title]="b.status === 'Occupied' ? 'Discharge the patient first' : 'Delete bed'"
                                    class="text-xs text-red-600 hover:underline disabled:text-gray-300 disabled:no-underline">Delete</button>
                            </div>

                            <div class="grid grid-cols-4 gap-2 items-end pt-2 border-t border-dashed border-gray-200">
                                <div class="flex flex-col gap-1 text-xs text-gray-600">Bed no.
                                    <boo-input [(ngModel)]="bedForm.number" [maxlength]="20" size="small"></boo-input>
                                </div>
                                <div class="flex flex-col gap-1 text-xs text-gray-600">Room
                                    <boo-input [(ngModel)]="bedForm.roomNumber" [maxlength]="20" size="small"></boo-input>
                                </div>
                                <div class="flex flex-col gap-1 text-xs text-gray-600">Type
                                    <boo-select [(ngModel)]="bedForm.bedType" [options]="bedTypeOptions" size="small"></boo-select>
                                </div>
                                <boo-button-admin (click)="addBed(w)" [disabled]="!bedForm.number.trim() || saving()" textColor="white" [fontSize]="14" [radius]="8">Add bed</boo-button-admin>
                                <boo-checkbox class="col-span-4" size="small" [(ngModel)]="bedForm.isolationRequired"><span class="text-gray-600">Isolation required</span></boo-checkbox>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </drawer>
    `
})
export class BedMapManageDrawerComponent implements OnChanges {
    @Input() isOpen = false;
    @Output() close = new EventEmitter<void>();
    /** Emitted after any ward or bed change so the map can reload. */
    @Output() changed = new EventEmitter<void>();

    readonly bedTypes: BedType[] = ['Standard', 'ICU', 'Isolation', 'Pediatric', 'Surgical Recovery'];
    readonly bedTypeOptions = this.bedTypes.map(t => ({ label: t, value: t }));

    wards = signal<Ward[]>([]);
    beds = signal<Bed[]>([]);
    departmentOptions = signal<{ label: string; value: string | null }[]>([]);
    expandedWardId = signal<string | null>(null);
    saving = signal(false);

    wardForm: { name: string; code: string; floor: number; departmentId: string | null } = this.emptyWard();
    bedForm: { number: string; roomNumber: string; bedType: BedType; isolationRequired: boolean } = this.emptyBed();

    constructor(
        private bedMapSrv: BedMapService,
        private departmentSrv: DepartmentService,
        private dialogSrv: DialogService,
        private toastSrv: ToastService,
    ) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isOpen'] && this.isOpen) {
            this.loadWards();
            if (!this.departmentOptions().length) this.loadDepartments();
        }
    }

    private emptyWard() { return { name: '', code: '', floor: 1, departmentId: null as string | null }; }
    private emptyBed() { return { number: '', roomNumber: '', bedType: 'Standard' as BedType, isolationRequired: false }; }

    private loadWards(): void {
        this.bedMapSrv.wards().subscribe({
            next: res => { if (res.success) this.wards.set(res.data); },
            error: () => this.toastSrv.error('Failed to load wards')
        });
    }

    private loadDepartments(): void {
        this.departmentSrv.search({ pageNumber: 1, pageSize: 200, search: '', sort: '', filter: { start: '', end: '' } }).subscribe({
            next: res => {
                if (res.success) this.departmentOptions.set([{ label: 'None', value: null }, ...res.data.items.map(d => ({ label: d.name, value: d.id }))]);
            }
        });
    }

    private loadBeds(wardId: string): void {
        this.beds.set([]);
        this.bedMapSrv.search({ pageNumber: 1, pageSize: 500, search: '', sort: '', filter: { wardId } }).subscribe({
            next: res => { if (res.success) this.beds.set(res.data.items); },
            error: () => this.toastSrv.error('Failed to load beds')
        });
    }

    toggleWard(ward: Ward): void {
        if (this.expandedWardId() === ward.id) { this.expandedWardId.set(null); return; }
        this.expandedWardId.set(ward.id);
        this.bedForm = this.emptyBed();
        this.loadBeds(ward.id);
    }

    addWard(): void {
        const request: CreateWardRequest = {
            name: this.wardForm.name.trim(),
            code: this.wardForm.code.trim() || null,
            floor: Number(this.wardForm.floor) || 0,
            departmentId: this.wardForm.departmentId,
        };
        this.saving.set(true);
        this.bedMapSrv.createWard(request).pipe(finalize(() => this.saving.set(false))).subscribe({
            next: res => {
                if (!res.success) { this.toastSrv.error('Unable to add the ward'); return; }
                this.wardForm = this.emptyWard();
                this.toastSrv.success(`Ward ${request.name} added`);
                this.loadWards();
                this.changed.emit();
            },
            error: () => this.toastSrv.error('Unable to add the ward')
        });
    }

    deleteWard(ward: Ward): void {
        this.dialogSrv.confirmDelete(() => {
            this.bedMapSrv.deleteWard(ward.id).subscribe({
                next: res => {
                    if (!res.success) { this.toastSrv.error('Unable to delete the ward'); return; }
                    if (this.expandedWardId() === ward.id) this.expandedWardId.set(null);
                    this.loadWards();
                    this.changed.emit();
                },
                error: () => this.toastSrv.error('Unable to delete the ward')
            });
        });
    }

    addBed(ward: Ward): void {
        const request: CreateBedRequest = {
            wardId: ward.id,
            number: this.bedForm.number.trim(),
            roomNumber: this.bedForm.roomNumber.trim() || null,
            floor: ward.floor,
            bedType: this.bedForm.bedType,
            isolationRequired: this.bedForm.isolationRequired,
            notes: null,
        };
        this.saving.set(true);
        this.bedMapSrv.createBed(request).pipe(finalize(() => this.saving.set(false))).subscribe({
            next: res => {
                if (!res.success) { this.toastSrv.error('Unable to add the bed'); return; }
                this.bedForm = this.emptyBed();
                this.loadBeds(ward.id);
                this.loadWards();
                this.changed.emit();
            },
            error: () => this.toastSrv.error('Unable to add the bed')
        });
    }

    deleteBed(ward: Ward, bed: Bed): void {
        this.dialogSrv.confirmDelete(() => {
            this.bedMapSrv.deleteBed(bed.id).subscribe({
                next: res => {
                    if (!res.success) { this.toastSrv.error('Unable to delete the bed'); return; }
                    this.loadBeds(ward.id);
                    this.loadWards();
                    this.changed.emit();
                },
                error: () => this.toastSrv.error('Unable to delete the bed')
            });
        });
    }
}
