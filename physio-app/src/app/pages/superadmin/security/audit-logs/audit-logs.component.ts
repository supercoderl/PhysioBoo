import { Component, inject, OnInit, signal } from "@angular/core";
import { finalize } from "rxjs";
import { BooDatepickerComponent } from "../../../../components/date-picker/boo-date-picker.component";
import { SuperadminAuditLogDrawerComponent } from "../../../../components/layout/superadmin/security/audit-log-drawer.component";
import { SuperadminPageHeaderComponent } from "../../../../components/layout/superadmin/shared/superadmin-page-header.component";
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { BooTableAdminComponent } from "../../../../components/table/boo-table-admin/boo-table-admin.component";
import { ErrorStateComponent } from "../../../../components/ui/error-state.component";
import { StatusBadgeComponent } from "../../../../components/ui/status-badge.component";
import { AuditLogService } from "../../../../services/admin/audit-log.service";
import { ColumnDefDirective } from "../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../shared/shared-imports";
import { AuditLog } from "../../../../shared/types/audit-log.types";
import { PaginationData } from "../../../../shared/types/common";
import { auditActionTone } from "../../../../shared/utils/audit-log.utils";
import { BooButtonAdminComponent } from "../../../../components/button/boo-button-admin/boo-button-admin.component";
import { BooInputComponent } from "../../../../components/input/boo-input/boo-input.component";

const ACTIONS = ['Create', 'Update', 'Delete', 'SoftDelete'];

@Component({
    selector: 'superadmin-audit-logs',
    standalone: true,
    imports: [
        SharedModule,
        SuperadminPageHeaderComponent,
        SuperadminAuditLogDrawerComponent,
        BooSelectComponent,
        BooDatepickerComponent,
        BooTableAdminComponent,
        ColumnDefDirective,
        StatusBadgeComponent,
        ErrorStateComponent,
        BooButtonAdminComponent,
        BooInputComponent
    ],
    host: { class: 'block h-full min-h-0' },
    template: `
        <div class="h-full flex flex-col gap-5">
            <superadmin-page-header
                title="Audit logs"
                description="Who changed what, when and from where. Entries can't be edited."
            />

            <form
                class="flex flex-wrap items-end gap-3 bg-surface rounded-2 border border-borderGray/60 p-4"
                role="search"
                aria-label="Filter audit logs"
                (submit)="$event.preventDefault(); apply()"
            >
                <div class="space-y-1">
                    <label for="audit-table" class="block text-[12px] font-medium text-secondary">Table</label>
                    <boo-input [id]="'audit-table'" name="tableName" class="w-48" label="e.g. Users" size="small" [(ngModel)]="tableName"></boo-input>
                </div>
                <div class="space-y-1">
                    <span class="block text-[12px] font-medium text-secondary">Action</span>
                    <div class="w-44">
                        <boo-select
                            name="action"
                            label="All actions"
                            [height]="36"
                            [options]="actionOptions"
                            [(ngModel)]="action"
                        ></boo-select>
                    </div>
                </div>
                <div class="space-y-1">
                    <label for="audit-from" class="block text-[12px] font-medium text-secondary">From</label>
                    <div class="w-44">
                        <boo-datepicker
                            id="audit-from"
                            name="dateFrom"
                            label="Any date"
                            [height]="36"
                            [max]="dateTo"
                            disableFuture
                            [(ngModel)]="dateFrom"
                        ></boo-datepicker>
                    </div>
                </div>
                <div class="space-y-1">
                    <label for="audit-to" class="block text-[12px] font-medium text-secondary">To</label>
                    <div class="w-44">
                        <boo-datepicker
                            id="audit-to"
                            name="dateTo"
                            label="Any date"
                            [height]="36"
                            [min]="dateFrom"
                            disableFuture
                            [(ngModel)]="dateTo"
                        ></boo-datepicker>
                    </div>
                </div>
                <button
                    type="submit"
                    class="h-9 px-4 rounded-1.5 bg-primary text-white text-[13px] font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
                >
                    Apply
                </button>
                <boo-button-admin *ngIf="hasFilters" (click)="clear()" background="transparent" textColor="rgb(var(--twc-secondary))" padding="8px 12px" fontWeight="500">
                    Clear filters
                </boo-button-admin>
            </form>

            <div *ngIf="loadFailed(); else logTable" class="bg-surface rounded-2 border border-borderGray/60" role="alert">
                <boo-error-state
                    icon="info"
                    title="Couldn't load the audit logs"
                    description="Check your connection and try again."
                    (retry)="load()"
                />
            </div>
            <ng-template #logTable>
                <div class="flex-1 min-h-[320px] bg-surface rounded-2 border border-borderGray/60 overflow-hidden">
                    <boo-table-admin
                        [data]="tableData()?.items ?? []"
                        tdClass="px-4 py-3"
                        [showFooter]="true"
                        [currentPage]="tableData()?.pageNumber ?? params.pageNumber"
                        [pageSize]="tableData()?.pageSize ?? params.pageSize"
                        [totalItems]="tableData()?.totalCount ?? 0"
                        [loading]="loading()"
                        (pageChange)="onPageClick($event)"
                        (searchChange)="onSearch($event)"
                        (reload)="load()"
                    >
                        <ng-template appColumnDef="dateOccurred" headerLabel="When" headerClass="text-left" let-item>
                            <button
                                type="button"
                                class="text-left rounded-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
                                [attr.aria-label]="'Open audit entry from ' + (item.dateOccurred | date: 'medium')"
                                (click)="open(item.id)"
                            >
                                <span class="block text-sm font-medium text-primary tabular-nums">{{ item.dateOccurred | date: 'mediumDate' }}</span>
                                <span class="block text-xs text-secondary tabular-nums">{{ item.dateOccurred | date: 'mediumTime' }}</span>
                            </button>
                        </ng-template>

                        <ng-template appColumnDef="action" headerLabel="Action" headerClass="text-left" let-item>
                            <boo-status-badge [label]="item.action" [tone]="tone(item.action)" dotted />
                        </ng-template>

                        <ng-template appColumnDef="tableName" headerLabel="Table" headerClass="text-left" let-item>
                            <div class="text-sm">{{ item.tableName }}</div>
                            <div class="text-xs text-secondary font-mono truncate max-w-[220px]" [title]="item.primaryKey">{{ item.primaryKey }}</div>
                        </ng-template>

                        <ng-template appColumnDef="user" headerLabel="User" headerClass="text-left" let-item>
                            <span class="text-sm">{{ item.userEmail || (item.userId ? 'Unknown user' : 'System') }}</span>
                        </ng-template>

                        <ng-template appColumnDef="ipAddress" headerLabel="IP address" headerClass="text-left" let-item>
                            <span class="text-sm tabular-nums">{{ item.ipAddress || '—' }}</span>
                        </ng-template>
                    </boo-table-admin>
                </div>
            </ng-template>
        </div>

        <superadmin-audit-log-drawer
            [isOpen]="isDrawerOpen()"
            [logId]="selectedId()"
            (close)="closeDrawer()"
        />
    `
})
export class SuperadminAuditLogsComponent implements OnInit {
    // #region Inject Services
    private readonly auditSrv = inject(AuditLogService);
    // #endregion

    // #region Inputs, Outputs, Properties
    readonly actionOptions = ACTIONS.map(a => ({ label: a, value: a }));
    readonly tone = auditActionTone;

    tableData = signal<PaginationData<AuditLog> | null>(null);
    loading = signal(false);
    loadFailed = signal(false);
    isDrawerOpen = signal(false);
    selectedId = signal<string | null>(null);

    params = { pageNumber: 1, pageSize: 25, search: '' };
    tableName = '';
    action: string | null = null;
    dateFrom: string | null = null;
    dateTo: string | null = null;
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit(): void {
        this.load();
    }
    // #endregion

    // #region Methods
    get hasFilters(): boolean {
        return !!(this.tableName || this.action || this.dateFrom || this.dateTo || this.params.search);
    }

    load(): void {
        this.loading.set(true);
        this.loadFailed.set(false);
        this.auditSrv.search({
            pageNumber: this.params.pageNumber,
            pageSize: this.params.pageSize,
            search: this.params.search.trim(),
            tableName: this.tableName.trim(),
            action: this.action ?? '',
            dateFrom: this.dateFrom ? new Date(`${this.dateFrom}T00:00:00`).toISOString() : undefined,
            dateTo: this.dateTo ? new Date(`${this.dateTo}T23:59:59.999`).toISOString() : undefined,
        }).pipe(
            finalize(() => this.loading.set(false))
        ).subscribe({
            next: res => {
                if (res.success) this.tableData.set(res.data);
                else this.loadFailed.set(true);
            },
            error: () => this.loadFailed.set(true)
        });
    }

    apply(): void {
        this.params.pageNumber = 1;
        this.load();
    }

    clear(): void {
        this.tableName = '';
        this.action = null;
        this.dateFrom = null;
        this.dateTo = null;
        this.params = { ...this.params, pageNumber: 1, search: '' };
        this.load();
    }

    onSearch(value: string): void {
        this.params = { ...this.params, pageNumber: 1, search: value };
        this.load();
    }

    onPageClick(page: number): void {
        this.params.pageNumber = page;
        this.load();
    }

    open(id: string): void {
        this.selectedId.set(id);
        this.isDrawerOpen.set(true);
    }

    closeDrawer(): void {
        this.isDrawerOpen.set(false);
        this.selectedId.set(null);
    }
    // #endregion
}
