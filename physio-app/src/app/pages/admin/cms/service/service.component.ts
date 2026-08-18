import { Component, OnInit, signal } from "@angular/core";
import { AdminContentHeaderComponent } from "../../../../components/layout/admin/content-header/content-header.component";
import { CmsServiceDetailDrawerComponent } from "../../../../components/layout/admin/cms/service/service-detail-drawer.component";
import { CmsServiceDrawerComponent } from "../../../../components/layout/admin/cms/service/service-drawer.component";
import { CmsServiceTableCardComponent } from "../../../../components/layout/admin/cms/service/service-table-card.component";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { MedicalServiceService } from "../../../../services/admin/medical-service.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { LocalLoadingService } from "../../../../services/common/local-loading.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { PaginationData } from "../../../../shared/types/common";
import { FilterConfig, ServiceFilter } from "../../../../shared/types/filter.types";
import { MedicalService, ServiceStats } from "../../../../shared/types/service.types";
import { SortOption } from "../../../../shared/types/sort";
import { BulkAction } from "../../../../shared/types/table.types";

@Component({
    selector: 'admin-service',
    standalone: true,
    imports: [
        SharedModule,
        AdminContentHeaderComponent,
        BooIconComponent,
        CmsServiceTableCardComponent,
        CmsServiceDrawerComponent,
        CmsServiceDetailDrawerComponent,
    ],
    templateUrl: './service.component.html',
    host: { class: 'block h-full min-h-0' },
})
export class AdminServiceComponent implements OnInit {
    // ────────────────────────────────────────────────────────────
    // Data / state
    // ────────────────────────────────────────────────────────────
    data  = signal<PaginationData<MedicalService> | null>(null);
    stats = signal<ServiceStats | null>(null);
    loadError = signal(false);

    isFormOpen   = signal(false);
    isDetailOpen = signal(false);
    editingId    = signal<string | null>(null);
    detailId     = signal<string | null>(null);

    /** Lookup options — populated from a lookup endpoint once available. */
    departmentOptions = signal<{ label: string; value: string }[]>([]);
    doctorOptions     = signal<{ label: string; value: string }[]>([]);

    params: { pageNumber: number; pageSize: number; search: string; sort: string; filter: ServiceFilter } = {
        pageNumber: 1,
        pageSize: 25,
        search: '',
        sort: '-updatedAt',
        filter: {
            departmentIds: [],
            doctorIds: [],
            status: [],
            availability: [],
            priceMin: null,
            priceMax: null,
            durationMin: null,
            durationMax: null,
        },
    };

    readonly sortOptions: SortOption[] = [
        { label: 'Recently updated', value: '-updatedAt' },
        { label: 'Oldest update',    value: '+updatedAt' },
        { label: 'Name A→Z',         value: '+name' },
        { label: 'Name Z→A',         value: '-name' },
        { label: 'Price (low→high)', value: '+basePrice' },
        { label: 'Price (high→low)', value: '-basePrice' },
        { label: 'Most popular',     value: '-popularity.totalAppointments' },
    ];

    readonly filterConfigs: FilterConfig[] = [
        {
            key: 'status', label: 'Status', type: 'select',
            options: [
                { label: 'Active',   value: 'Active' },
                { label: 'Draft',    value: 'Draft' },
                { label: 'Inactive', value: 'Inactive' },
                { label: 'Archived', value: 'Archived' },
            ],
        },
        {
            key: 'availability', label: 'Availability', type: 'select',
            options: [
                { label: 'Available',   value: 'Available' },
                { label: 'Limited',     value: 'Limited' },
                { label: 'Unavailable', value: 'Unavailable' },
            ],
        },
    ];

    currentFilter: Record<string, any> = { status: null, availability: null };

    // ────────────────────────────────────────────────────────────
    // Lifecycle
    // ────────────────────────────────────────────────────────────
    constructor(
        private srv: MedicalServiceService,
        private toastSrv: ToastService,
        private dialogSrv: DialogService,
        protected loadingSrv: LocalLoadingService,
    ) { }

    ngOnInit(): void {
        this.loadStats();
        this.load();
    }

    // ────────────────────────────────────────────────────────────
    // Data loaders
    // ────────────────────────────────────────────────────────────
    load(): void {
        this.loadingSrv.setLoading('services', true);
        this.loadError.set(false);
        this.srv.search({ ...this.params, filter: { ...this.params.filter } })
            .subscribe({
                next: (res) => {
                    this.loadingSrv.setLoading('services', false);
                    if (res.success) this.data.set(res.data);
                },
                // Keep whatever data is already on screen — don't wipe it, and never
                // fake a success response. The banner + retry button make the failure visible.
                error: () => {
                    this.loadingSrv.setLoading('services', false);
                    this.loadError.set(true);
                },
            });
    }

    loadStats(): void {
        this.srv.stats()
            .subscribe({
                next: (res) => { if (res.success) this.stats.set(res.data); },
                error: () => { /* KPI strip already falls back to '—'; global toast covers the failure */ },
            });
    }

    // ────────────────────────────────────────────────────────────
    // Table events
    // ────────────────────────────────────────────────────────────
    onPageChange(page: number): void {
        this.params = { ...this.params, pageNumber: page };
        this.load();
    }

    onSearchChange(val: string): void {
        this.params = { ...this.params, pageNumber: 1, search: val };
        this.load();
    }

    onSortApply(sort: SortOption): void {
        this.params = { ...this.params, pageNumber: 1, sort: sort.value };
        this.load();
    }

    onFilterApply(event: { key: string; value: any }): void {
        this.currentFilter = { ...this.currentFilter, [event.key]: event.value };
        this.params = {
            ...this.params,
            pageNumber: 1,
            filter: {
                ...this.params.filter,
                status: event.key === 'status' ? (event.value ? [event.value] : []) : this.params.filter.status,
                availability: event.key === 'availability' ? (event.value ? [event.value] : []) : this.params.filter.availability,
            },
        };
        this.load();
    }

    onResetView(): void {
        this.currentFilter = { status: null, availability: null };
        this.params = {
            ...this.params,
            pageNumber: 1,
            search: '',
            sort: '-updatedAt',
            filter: {
                departmentIds: [], doctorIds: [], status: [], availability: [],
                priceMin: null, priceMax: null, durationMin: null, durationMax: null,
            },
        };
        this.load();
    }

    onBulkAction(event: { action: BulkAction; ids: (number | string)[]; selectAllPages: boolean }): void {
        const ids = event.ids.map(String);
        if (!ids.length) return;

        if (event.action.key === 'archive') {
            this.srv.bulkArchive(ids).subscribe({
                next: () => { this.toastSrv.success(`${ids.length} service(s) archived`); this.load(); this.loadStats(); },
                error: () => this.toastSrv.error('Bulk archive failed'),
            });
            return;
        }

        if (event.action.key === 'delete') {
            this.dialogSrv.confirmDelete(() => {
                this.srv.bulkDelete(ids).subscribe({
                    next: () => { this.toastSrv.success(`${ids.length} service(s) deleted`); this.load(); this.loadStats(); },
                    error: () => this.toastSrv.error('Bulk delete failed'),
                });
            });
            return;
        }

        if (event.action.key === 'export') {
            this.bulkExport();
        }
    }

    bulkExport(): void {
        this.srv.export(this.params).subscribe({
            next: (blob) => this.downloadBlob(blob, `services-${Date.now()}.csv`),
            error: () => this.toastSrv.error('Export failed'),
        });
    }

    private downloadBlob(blob: Blob, filename: string): void {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
    }

    // ────────────────────────────────────────────────────────────
    // Detail drawer
    // ────────────────────────────────────────────────────────────
    openDetail(s: MedicalService): void {
        this.detailId.set(s.id);
        this.isDetailOpen.set(true);
    }

    closeDetail(): void {
        this.isDetailOpen.set(false);
        this.detailId.set(null);
    }

    // ────────────────────────────────────────────────────────────
    // Create / edit drawer
    // ────────────────────────────────────────────────────────────
    openNewForm(): void {
        this.editingId.set(null);
        this.isFormOpen.set(true);
    }

    openEditForm(s: MedicalService): void {
        this.editingId.set(s.id);
        this.isFormOpen.set(true);
    }

    closeForm(): void {
        this.isFormOpen.set(false);
        this.editingId.set(null);
    }

    onSaveSuccess(): void {
        this.closeForm();
        this.load();
        this.loadStats();
    }

    // ────────────────────────────────────────────────────────────
    // Per-row actions
    // ────────────────────────────────────────────────────────────
    duplicate(s: MedicalService): void {
        this.srv.duplicate(s.id).subscribe({
            next: () => { this.toastSrv.success(`Duplicated ${s.name}`); this.load(); },
            error: () => this.toastSrv.error('Duplication failed'),
        });
    }

    archive(s: MedicalService): void {
        this.srv.archive(s.id).subscribe({
            next: () => {
                this.toastSrv.success(`Archived ${s.name}`);
                this.isDetailOpen() && this.closeDetail();
                this.load(); this.loadStats();
            },
            error: () => this.toastSrv.error('Archive failed'),
        });
    }

    publish(s: MedicalService): void {
        this.srv.publish(s.id).subscribe({
            next: () => { this.toastSrv.success(`${s.name} is now Active`); this.load(); this.loadStats(); },
            error: () => this.toastSrv.error('Publish failed'),
        });
    }

    deleteOne(s: MedicalService): void {
        this.dialogSrv.confirmDelete(() => {
            this.srv.delete(s.id).subscribe({
                next: () => {
                    this.toastSrv.success(`Deleted ${s.name}`);
                    this.isDetailOpen() && this.closeDetail();
                    this.load(); this.loadStats();
                },
                error: () => this.toastSrv.error('Delete failed'),
            });
        });
    }

    // ────────────────────────────────────────────────────────────
    // UI helpers
    // ────────────────────────────────────────────────────────────
    formatMoney(amount: number, currency: string): string {
        try {
            return new Intl.NumberFormat(undefined, {
                style: 'currency', currency, maximumFractionDigits: 0,
            }).format(amount);
        } catch {
            return `${amount.toLocaleString()} ${currency}`;
        }
    }
}
