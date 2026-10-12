import { Component, inject, OnInit, signal } from "@angular/core";
import { finalize } from "rxjs";
import { SuperadminAuditLogDrawerComponent } from "../../../../components/layout/superadmin/security/audit-log-drawer.component";
import { SuperadminPageHeaderComponent } from "../../../../components/layout/superadmin/shared/superadmin-page-header.component";
import { ColumnDefDirective } from "../../../../shared/directives/column-def.directive";
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { BooTableAdminComponent } from "../../../../components/table/boo-table-admin/boo-table-admin.component";
import { ErrorStateComponent } from "../../../../components/ui/error-state.component";
import { StatusBadgeComponent } from "../../../../components/ui/status-badge.component";
import { AuditLogService } from "../../../../services/admin/audit-log.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { AuditLog } from "../../../../shared/types/audit-log.types";
import { PaginationData } from "../../../../shared/types/common";
import { auditActionTone } from "../../../../shared/utils/audit-log.utils";

const ACTIONS = ['Create', 'Update', 'Delete', 'SoftDelete'];
const FIELD = 'h-9 px-3 rounded-1.5 border border-borderGray bg-surface text-[13px] text-regular placeholder:text-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';

/** Read-only audit trail of every tracked change on the platform. */
@Component({
    selector: 'superadmin-audit-logs',
    standalone: true,
    imports: [
        SharedModule,
        SuperadminPageHeaderComponent,
        SuperadminAuditLogDrawerComponent,
        BooSelectComponent,
        BooTableAdminComponent,
        ColumnDefDirective,
        StatusBadgeComponent,
        ErrorStateComponent
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
                    <input id="audit-table" name="tableName" type="text" [class]="field + ' w-48'" placeholder="e.g. Users" autocomplete="off" [(ngModel)]="tableName" />
                </div>
                <div class="space-y-1">
                    <span class="block text-[12px] font-medium text-secondary">Action</span>
                    <div class="w-44">
                        <boo-select
                            name="action"
                            label="All actions"
                            required
                            [height]="36"
                            [options]="actionOptions"
                            [(ngModel)]="action"
                            (ngModelChange)="apply()"
                        ></boo-select>
                    </div>
                </div>
                <div class="space-y-1">
                    <label for="audit-from" class="block text-[12px] font-medium text-secondary">From</label>
                    <input id="audit-from" name="dateFrom" type="date" [class]="field" [(ngModel)]="dateFrom" (ngModelChange)="apply()" />
                </div>
                <div class="space-y-1">
                    <label for="audit-to" class="block text-[12px] font-medium text-secondary">To</label>
                    <input id="audit-to" name="dateTo" type="date" [class]="field" [(ngModel)]="dateTo" (ngModelChange)="apply()" />
                </div>
                <button
                    type="submit"
                    class="h-9 px-4 rounded-1.5 bg-primary text-white text-[13px] font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
                >
                    Apply
                </button>
                <button
                    *ngIf="hasFilters"
                    type="button"
                    class="h-9 px-3 rounded-1.5 text-[13px] font-medium text-secondary hover:text-primary hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
                    (click)="clear()"
                >
                    Clear filters
                </button>
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
    readonly field = FIELD;
    readonly actionOptions = [{ label: 'All actions', value: '' }, ...ACTIONS.map(a => ({ label: a, value: a }))];
    readonly tone = auditActionTone;

    tableData = signal<PaginationData<AuditLog> | null>(null);
    loading = signal(false);
    loadFailed = signal(false);
    isDrawerOpen = signal(false);
    selectedId = signal<string | null>(null);

    params = { pageNumber: 1, pageSize: 25, search: '' };
    tableName = '';
    action = '';
    dateFrom = '';
    dateTo = '';
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
            action: this.action,
            // Date inputs are local calendar days: cover the whole of both ends.
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
        this.action = '';
        this.dateFrom = '';
        this.dateTo = '';
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
