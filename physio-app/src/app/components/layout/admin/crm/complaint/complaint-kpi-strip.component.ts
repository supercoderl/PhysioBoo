import { Component, Input } from "@angular/core";
import { SharedModule } from "../../../../../shared/shared-imports";
import { ComplaintStats } from "../../../../../shared/types/complaint.types";
import { StatCardComponent } from "../../../../ui/stat-card.component";

@Component({
    selector: 'crm-complaint-kpi-strip',
    standalone: true,
    imports: [SharedModule, StatCardComponent],
    template: `
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <boo-stat-card label="Total Tickets" [value]="stats?.total ?? '—'" icon="inbox" tone="primary"></boo-stat-card>
            <boo-stat-card label="Pending" [value]="stats?.pending ?? '—'" icon="clock" tone="warning"></boo-stat-card>
            <boo-stat-card label="In Progress" [value]="stats?.inProgress ?? '—'" icon="loader" tone="neutral"></boo-stat-card>
            <boo-stat-card label="Resolved" [value]="stats?.resolved ?? '—'" icon="check-circle" tone="success"></boo-stat-card>
        </div>
    `
})
export class CrmComplaintKpiStripComponent {
    @Input() stats: ComplaintStats | null = null;
}
