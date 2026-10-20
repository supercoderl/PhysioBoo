import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { finalize, forkJoin } from "rxjs";
import { SuperadminDevDataModuleCardComponent } from "../../../../components/layout/superadmin/platform/dev-data-module-card.component";
import { SuperadminPageHeaderComponent } from "../../../../components/layout/superadmin/shared/superadmin-page-header.component";
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { DevDataService } from "../../../../services/admin/dev-data.service";
import { HospitalGroupService } from "../../../../services/admin/hospital-group.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { DevDataModule, DevDataModuleList, DevDataModuleStatus } from "../../../../shared/types/dev-data.types";
import { BooButtonAdminComponent } from "../../../../components/button/boo-button-admin/boo-button-admin.component";

const DEFAULT_ROWS = 50;
const TENANT_PAGE_SIZE = 100;
const DEV_TENANT_NAME = 'PhysioBoo Rehabilitation Hospital';
/** Key of the one-click module on the server (DemoFacilityModule): it runs every other module in dependency order. */
const DEMO_FACILITY_KEY = 'demo-facility';

/** Plain names for created tables whose key is not a module key or reads badly as a camelCase word. */
const TABLE_LABELS: Record<string, string> = {
    doctorSpecialties: 'doctor specialties',
    appointmentTypes: 'appointment types',
};

const FIELD = 'w-full h-[42px] px-3 rounded-[10px] border border-borderGray bg-surface text-[14px] text-regular placeholder:text-placeholder focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30';
const CARD = 'bg-surface rounded-[14px] border border-borderGray';

/** Development-only tool: write fake module data into a tenant's real tables. See docs/dev-data-generator-redesign.md. */
@Component({
    selector: 'superadmin-dev-data',
    standalone: true,
    imports: [SharedModule, SuperadminPageHeaderComponent, SuperadminDevDataModuleCardComponent, BooSelectComponent, BooButtonAdminComponent],
    template: `
        <!-- relative: contains the sr-only elements so they cannot extend the document past the shell's overflow-hidden -->
        <div class="relative space-y-5">
            <superadmin-page-header
                title="Dev data generator"
                description="Fill a tenant with realistic fake data, one module at a time."
            />

            <ng-container *ngIf="!loading(); else loadingState">
                <ng-container *ngIf="loadFailed()">
                    <div [class]="card + ' p-6 text-center space-y-3'">
                        <p class="text-[13px] text-regular m-0">The generator could not be loaded.</p>
                        <boo-button-admin (click)="load()" textColor="white" padding="8px 16px" fontWeight="600">Try again</boo-button-admin>
                    </div>
                </ng-container>

                <div *ngIf="!loadFailed() && !enabled()" [class]="card + ' p-6 text-center'">
                    <p class="text-[13px] text-regular m-0">The generator is switched off on this server.</p>
                </div>

                <div *ngIf="!loadFailed() && enabled() && tenantOptions().length === 0" [class]="card + ' p-6 text-center space-y-3'">
                    <p class="text-[13px] text-regular m-0">There are no tenants to generate data for yet.</p>
                    <a routerLink="/superadmin/tenants/hospital-group" class="text-[13px] font-semibold text-primary">Go to tenants</a>
                </div>

                <ng-container *ngIf="!loadFailed() && enabled() && tenantOptions().length > 0">
                    <div
                        role="note"
                        class="flex items-start gap-3 rounded-[14px] bg-primarySoft px-4 py-3 text-[13px] text-primaryDeep"
                    >
                        <span class="shrink-0 mt-0.5 px-1.5 py-0.5 rounded-md bg-primary text-white font-mono text-[11px] font-medium leading-none">DEV ONLY</span>
                        <p class="m-0">
                            Development only. Each click writes <strong>real rows</strong> into the selected tenant's own tables
                            (departments, patients, …) and they cannot be undone from here. Missing parent data is created automatically.
                            To see the rows in <strong>/admin</strong>, sign in as an admin of that tenant: the owner account belongs to no tenant.
                        </p>
                    </div>

                    <section [class]="card + ' p-4'" aria-labelledby="dev-data-controls">
                        <h3 id="dev-data-controls" class="sr-only">Generation settings</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                            <div class="space-y-1">
                                <span class="block text-[13px] font-medium text-regular">Target tenant</span>
                                <boo-select
                                    label="Choose a tenant"
                                    required
                                    [height]="36"
                                    [options]="tenantOptions()"
                                    [ngModel]="tenantId()"
                                    (ngModelChange)="onTenantChange($event)"
                                ></boo-select>
                            </div>
                            <div class="space-y-1">
                                <label for="dev-data-count" class="text-[13px] font-medium text-regular">Rows per module</label>
                                <input
                                    id="dev-data-count"
                                    type="number"
                                    inputmode="numeric"
                                    min="1"
                                    step="1"
                                    [attr.max]="maxRows()"
                                    [class]="field + ' font-mono'"
                                    [ngModel]="rows()"
                                    (ngModelChange)="rows.set($event)"
                                    (keydown.enter)="$event.preventDefault()"
                                    aria-describedby="dev-data-count-help"
                                />
                                <p id="dev-data-count-help" class="text-[12px] m-0" [class.text-danger]="!rowsValid()" [class.text-secondary]="rowsValid()">
                                    {{ rowsValid() ? 'Applies to every module you generate.' : 'Enter a whole number from 1 to ' + maxRows() + '.' }}
                                </p>
                            </div>
                        </div>
                    </section>

                    <p *ngIf="disabledReason()" class="text-[12px] text-secondary m-0">{{ disabledReason() }}</p>

                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        <superadmin-dev-data-module-card
                            *ngFor="let module of modules(); trackBy: trackByKey"
                            [module]="module"
                            [labels]="labels()"
                            [status]="statuses()[module.key] || 'idle'"
                            [lastResult]="results()[module.key] || ''"
                            [readyKeys]="readyKeys()"
                            [disabled]="!canGenerate()"
                            (generate)="requestGenerate($event)"
                        ></superadmin-dev-data-module-card>
                    </div>

                    <section *ngIf="hasGenerated()" [class]="card + ' p-4 space-y-2'" aria-labelledby="dev-data-inspect">
                        <h3 id="dev-data-inspect" class="text-[14px] font-medium text-regular m-0">Inspect the generated data</h3>
                        <p class="text-[12px] text-secondary m-0">
                            Open these screens signed in as an admin of the selected tenant: the owner account belongs to no tenant, so it sees none of these rows.
                        </p>
                        <div class="flex flex-wrap gap-x-4 gap-y-1">
                            <a routerLink="/admin/overview/dashboard" class="text-[13px] font-semibold text-primary">Dashboard</a>
                            <a routerLink="/admin/reception/booking/list" class="text-[13px] font-semibold text-primary">Appointments</a>
                            <a routerLink="/superadmin/tenants/hospital-group" class="text-[13px] font-semibold text-primary">Tenants</a>
                        </div>
                    </section>
                </ng-container>
            </ng-container>

            <ng-template #loadingState>
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" aria-busy="true" aria-label="Loading generator">
                    <div *ngFor="let _ of skeletons" [class]="card + ' p-4 space-y-3 animate-pulse'">
                        <div class="h-4 w-1/2 rounded bg-borderGray/40"></div>
                        <div class="h-3 w-5/6 rounded bg-borderGray/30"></div>
                        <div class="h-9 w-28 rounded bg-borderGray/30"></div>
                    </div>
                </div>
            </ng-template>

            <div class="sr-only" role="status" aria-live="polite">{{ announcement() }}</div>
        </div>
    `
})
export class SuperadminDevDataComponent implements OnInit {
    // #region Inject Services
    private readonly devDataSrv = inject(DevDataService);
    private readonly hospitalGroupSrv = inject(HospitalGroupService);
    private readonly toastSrv = inject(ToastService);
    private readonly dialogSrv = inject(DialogService);
    // #endregion

    // #region Inputs, Outputs, Properties
    readonly card = CARD;
    readonly field = FIELD;
    readonly skeletons = [1, 2, 3, 4, 5, 6];

    loading = signal(true);
    loadFailed = signal(false);
    enabled = signal(false);
    maxRows = signal(1000);
    modules = signal<DevDataModule[]>([]);
    tenantOptions = signal<{ label: string; value: string }[]>([]);
    tenantId = signal<string | null>(null);
    rows = signal<number | null>(DEFAULT_ROWS);
    statuses = signal<Record<string, DevDataModuleStatus>>({});
    results = signal<Record<string, string>>({});
    busy = signal(false);
    announcement = signal('');

    labels = computed(() => Object.fromEntries(this.modules().map(m => [m.key, m.label])));
    /** Modules generated in this session; a module's dependency chip is "ready" once its parent is in here. */
    hasGenerated = computed(() => Object.values(this.statuses()).includes('done'));
    readyKeys = computed(() => Object.entries(this.statuses()).filter(([, status]) => status === 'done').map(([key]) => key));
    rowsValid = computed(() => {
        const n = this.rows();
        return typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= this.maxRows();
    });
    canGenerate = computed(() => !this.busy() && !!this.tenantId() && this.rowsValid());
    disabledReason = computed(() => {
        if (this.busy()) return 'A request is running…';
        if (!this.tenantId()) return 'Choose a tenant to enable Generate.';
        if (!this.rowsValid()) return 'Fix the row count to enable Generate.';
        return '';
    });
    // #endregion

    // #region Lifecycle
    ngOnInit(): void {
        this.load();
    }
    // #endregion

    // #region Methods
    trackByKey = (_: number, module: DevDataModule) => module.key;

    load(): void {
        this.loading.set(true);
        this.loadFailed.set(false);

        forkJoin({
            modules: this.devDataSrv.getModules(),
            tenants: this.hospitalGroupSrv.search({
                pageNumber: 1,
                pageSize: TENANT_PAGE_SIZE,
                search: '',
                sort: 'name:asc',
                filter: { start: '', end: '', isActive: null }
            })
        }).pipe(
            finalize(() => this.loading.set(false))
        ).subscribe({
            next: ({ modules, tenants }) => {
                if (!modules.success || !tenants.success) {
                    this.loadFailed.set(true);
                    return;
                }
                this.applyModules(modules.data);
                const items = tenants.data?.items ?? [];
                this.tenantOptions.set(items.map(t => ({ label: t.name, value: t.id })));
                const preferred = items.find(t => t.name === DEV_TENANT_NAME) ?? items[0];
                if (preferred) this.onTenantChange(preferred.id);
            },
            error: () => this.loadFailed.set(true)
        });
    }

    onTenantChange(tenantId: string | null): void {
        this.tenantId.set(tenantId);
        this.statuses.set({});
        this.results.set({});
    }

    /** The one-click facility writes to many tables at once, so it explains itself and asks first; single modules run directly. */
    requestGenerate(moduleKey: string): void {
        if (!this.canGenerate()) return;
        if (moduleKey !== DEMO_FACILITY_KEY) {
            this.generate(moduleKey);
            return;
        }

        const tenant = this.tenantOptions().find(t => t.value === this.tenantId())?.label ?? 'the selected tenant';
        this.dialogSrv.confirm(
            `This builds a complete demo facility in "${tenant}": branches, departments, rooms, doctors with schedules, staff, services, ` +
            `${this.rows()} patients and about ${Math.min((this.rows() ?? 0) * 3, this.maxRows())} appointments (past and upcoming). ` +
            'Parts the tenant already has are reused, nothing existing is changed or deleted, and no message is sent. ' +
            'Generated accounts have no usable password. Everything is written in one transaction: if anything fails, nothing is kept.',
            () => this.generate(moduleKey),
            'Generate demo facility',
            'warning',
            'Generate'
        );
    }

    private generate(moduleKey: string): void {
        const tenantId = this.tenantId();
        const count = this.rows();
        if (!this.canGenerate() || !tenantId || count === null) return;

        const label = this.labels()[moduleKey] ?? moduleKey;
        this.setStatus(moduleKey, 'generating');
        this.busy.set(true);

        this.devDataSrv.generate(moduleKey, { tenantId, count }).pipe(
            finalize(() => this.busy.set(false))
        ).subscribe({
            next: res => {
                if (!res.success) {
                    this.setStatus(moduleKey, 'failed');
                    return;
                }
                const message = this.describe(res.data.created, res.data.reused ?? []);
                this.setStatus(moduleKey, 'done');
                this.results.update(current => ({ ...current, [moduleKey]: message }));
                this.toastSrv.success(message);
                (res.data.warnings ?? []).forEach(warning => this.toastSrv.info(warning));
                this.announcement.set(`${label}: ${message}`);
            },
            error: () => this.setStatus(moduleKey, 'failed')
        });
    }

    private applyModules(list: DevDataModuleList): void {
        this.enabled.set(list.enabled);
        this.maxRows.set(list.maxRows);
        this.modules.set(list.modules ?? []);
    }

    private setStatus(moduleKey: string, status: DevDataModuleStatus): void {
        this.statuses.update(current => ({ ...current, [moduleKey]: status }));
    }

    /** "Created 20 departments, 40 rooms. Reused: patients": one entry per table that received rows, plus what already existed. */
    private describe(created: Record<string, number>, reused: string[]): string {
        const parts = Object.entries(created).map(([key, n]) => `${n} ${this.tableLabel(key)}`);
        const reusedParts = reused.map(key => this.tableLabel(key));

        if (!parts.length && !reusedParts.length) return 'Nothing was created';
        if (!parts.length) return `Nothing new: ${reusedParts.join(', ')} already existed`;
        return `Created ${parts.join(', ')}${reusedParts.length ? `. Reused: ${reusedParts.join(', ')}` : ''}`;
    }

    private tableLabel(key: string): string {
        return TABLE_LABELS[key] ?? (this.labels()[key] ?? key).toLowerCase();
    }
    // #endregion
}
