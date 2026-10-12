import { Component, inject, OnInit, signal } from "@angular/core";
import { catchError, map, of } from "rxjs";
import { SuperadminPageHeaderComponent } from "../../../components/layout/superadmin/shared/superadmin-page-header.component";
import { MasterDataRegistry } from "../../../services/admin/master-data.registry";
import { SharedModule } from "../../../shared/shared-imports";
import { MasterDataConfig } from "../../../shared/types/master-data.types";

/** Entry page of Master Data: one card per platform-wide catalog, with its record count. */
@Component({
    selector: 'superadmin-master-data-hub',
    standalone: true,
    imports: [SharedModule, SuperadminPageHeaderComponent],
    template: `
        <div class="space-y-5">
            <superadmin-page-header
                title="Master data"
                description="Catalogs shared by every tenant."
            />

            <div
                role="note"
                class="flex items-start gap-3 rounded-2 border border-primary/20 bg-primary/5 px-4 py-3 text-[13px] text-regular"
            >
                <lucide-icon name="info" class="w-4 h-4 text-primary shrink-0 mt-0.5"></lucide-icon>
                <p class="m-0">
                    These catalogs are <strong>platform-wide</strong>: a change here applies to all tenants immediately.
                </p>
            </div>

            <ul class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 list-none p-0 m-0">
                <li *ngFor="let cfg of catalogs">
                    <a
                        [routerLink]="['/superadmin/master-data', cfg.slug]"
                        class="group flex items-start gap-3.5 h-full rounded-2 border border-borderGray/60 bg-surface p-4 transition-shadow duration-200 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                        <span class="w-11 h-11 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                            <lucide-icon [name]="cfg.icon" class="w-5 h-5"></lucide-icon>
                        </span>
                        <span class="min-w-0 flex-1">
                            <span class="flex items-center justify-between gap-2">
                                <span class="text-sm font-semibold text-regular truncate">{{ cfg.title }}</span>
                                <span class="shrink-0">
                                    <span
                                        *ngIf="counts()[cfg.slug] === undefined"
                                        class="inline-block h-4 w-8 rounded bg-gray-200 animate-pulse motion-reduce:animate-none align-middle"
                                        aria-hidden="true"
                                    ></span>
                                    <span
                                        *ngIf="counts()[cfg.slug] !== undefined"
                                        class="px-1.5 py-0.5 rounded-full bg-black/5 text-[11px] font-semibold tabular-nums text-regular"
                                    >{{ counts()[cfg.slug] ?? '—' }}</span>
                                </span>
                            </span>
                            <span class="block text-[13px] text-secondary mt-0.5">{{ cfg.description }}</span>
                        </span>
                    </a>
                </li>
            </ul>
        </div>
    `
})
export class SuperadminMasterDataHubComponent implements OnInit {
    private readonly registry = inject(MasterDataRegistry);

    readonly catalogs: MasterDataConfig[] = this.registry.catalogs();
    /** `undefined` = loading, `null` = failed. */
    counts = signal<Record<string, number | null | undefined>>({});

    ngOnInit(): void {
        for (const cfg of this.catalogs) {
            cfg.search({ pageNumber: 1, pageSize: 1, search: '', sort: '-createdAt', filter: { start: '', end: '' } }).pipe(
                map(res => res.success ? res.data?.totalCount ?? 0 : null),
                catchError(() => of(null))
            ).subscribe(count => this.counts.update(current => ({ ...current, [cfg.slug]: count })));
        }
    }
}
