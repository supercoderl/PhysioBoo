import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, computed, signal } from "@angular/core";
import { finalize } from "rxjs";
import { AuditLogService } from "../../../../services/admin/audit-log.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { AuditLog } from "../../../../shared/types/audit-log.types";
import { auditActionTone, auditChanges } from "../../../../shared/utils/audit-log.utils";
import { DrawerComponent } from "../../../drawer/drawer.component";
import { BooErrorStateComponent, BooStatusBadgeComponent } from '@physioboo/ui';

/** Full detail of one audit entry: who, when, from where, and the column-by-column change. */
@Component({
    selector: 'superadmin-audit-log-drawer',
    standalone: true,
    imports: [SharedModule, DrawerComponent, BooStatusBadgeComponent, BooErrorStateComponent],
    template: `
        <drawer [isOpen]="isOpen" (close)="close.emit()">
            <div
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="audit-drawer-title"
            >
                <div class="flex-none px-6 py-4 border-b border-borderGray/60 flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <h2 id="audit-drawer-title" class="text-lg font-bold text-regular leading-tight m-0">Audit entry</h2>
                        <p class="text-[13px] text-secondary m-0 truncate">{{ log()?.tableName ?? 'Loading…' }}</p>
                    </div>
                    <button
                        type="button"
                        class="w-9 h-9 shrink-0 flex items-center justify-center rounded-1.5 text-secondary hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
                        aria-label="Close"
                        (click)="close.emit()"
                    >
                        <physio-icon name="x" />
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto" custom-scrollbar>
                    <div *ngIf="loading()" class="p-6 space-y-4" aria-busy="true">
                        <div class="h-28 rounded-2 bg-gray-100 animate-pulse motion-reduce:animate-none"></div>
                        <div class="h-40 rounded-2 bg-gray-100 animate-pulse motion-reduce:animate-none"></div>
                    </div>

                    <div *ngIf="!loading() && failed()" role="alert">
                        <boo-error-state
                            icon="info"
                            title="Couldn't load this entry"
                            description="Check your connection and try again."
                            (retry)="load()"
                        />
                    </div>

                    <div *ngIf="!loading() && !failed() && log() as entry" class="p-6 space-y-6">
                        <dl class="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px] m-0">
                            <div>
                                <dt class="text-secondary">Action</dt>
                                <dd class="m-0 mt-1"><boo-status-badge [label]="entry.action" [tone]="tone(entry.action)" dotted /></dd>
                            </div>
                            <div>
                                <dt class="text-secondary">When</dt>
                                <dd class="m-0 mt-1 font-medium tabular-nums">{{ entry.dateOccurred | date: 'medium' }}</dd>
                            </div>
                            <div>
                                <dt class="text-secondary">User</dt>
                                <dd class="m-0 mt-1 font-medium break-words">{{ entry.userEmail || entry.userId || 'System' }}</dd>
                            </div>
                            <div>
                                <dt class="text-secondary">IP address</dt>
                                <dd class="m-0 mt-1 font-medium tabular-nums">{{ entry.ipAddress || '—' }}</dd>
                            </div>
                            <div class="col-span-2">
                                <dt class="text-secondary">Record</dt>
                                <dd class="m-0 mt-1 font-mono text-[12px] break-all">{{ entry.tableName }} · {{ entry.primaryKey }}</dd>
                            </div>
                            <div class="col-span-2" *ngIf="entry.requestId">
                                <dt class="text-secondary">Request id</dt>
                                <dd class="m-0 mt-1 font-mono text-[12px] break-all">{{ entry.requestId }}</dd>
                            </div>
                            <div class="col-span-2" *ngIf="entry.userAgent">
                                <dt class="text-secondary">User agent</dt>
                                <dd class="m-0 mt-1 text-[12px] break-words">{{ entry.userAgent }}</dd>
                            </div>
                        </dl>

                        <section aria-labelledby="audit-changes-title">
                            <h3 id="audit-changes-title" class="text-xs font-bold text-secondary uppercase tracking-wider m-0 mb-3">Changes</h3>
                            <p *ngIf="!changes().length" class="text-[13px] text-secondary m-0">No column values were recorded for this entry.</p>
                            <div *ngIf="changes().length" class="rounded-2 border border-borderGray/60 overflow-x-auto max-h-[50svh]" custom-scrollbar>
                                <table class="w-full text-[12px] text-left">
                                    <caption class="sr-only">Column changes</caption>
                                    <thead class="sticky top-0 z-[1] bg-surface">
                                        <tr class="border-b border-borderGray/60 text-secondary bg-black/[0.02]">
                                            <th scope="col" class="px-3 py-2 font-medium">Column</th>
                                            <th scope="col" class="px-3 py-2 font-medium">Before</th>
                                            <th scope="col" class="px-3 py-2 font-medium">After</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr *ngFor="let change of changes()" class="border-b border-borderGray/60 last:border-b-0 align-top">
                                            <td class="px-3 py-2 font-mono text-regular">{{ change.column }}</td>
                                            <td class="px-3 py-2 font-mono break-all text-secondary">{{ change.before ?? '—' }}</td>
                                            <td class="px-3 py-2 font-mono break-all text-regular">{{ change.after ?? '—' }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </drawer>
    `
})
export class SuperadminAuditLogDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Input() logId: string | null = null;
    @Output() close = new EventEmitter<void>();

    readonly tone = auditActionTone;

    log = signal<AuditLog | null>(null);
    loading = signal(false);
    failed = signal(false);
    changes = computed(() => {
        const entry = this.log();
        return entry ? auditChanges(entry) : [];
    });
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(private auditSrv: AuditLogService) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.isOpen && this.logId && (changes['isOpen'] || changes['logId'])) {
            this.log.set(null);
            this.load();
        }
    }
    // #endregion

    // #region Methods
    load(): void {
        const id = this.logId;
        if (!id) return;

        this.loading.set(true);
        this.failed.set(false);
        this.auditSrv.getById(id).pipe(
            finalize(() => this.loading.set(false))
        ).subscribe({
            next: res => {
                if (res.success && res.data) this.log.set(res.data);
                else this.failed.set(true);
            },
            error: () => this.failed.set(true)
        });
    }
    // #endregion
}
