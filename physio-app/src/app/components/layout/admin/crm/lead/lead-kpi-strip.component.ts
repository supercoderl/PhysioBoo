import { Component, Input } from "@angular/core";
import { SharedModule } from "../../../../../shared/shared-imports";
import { LeadStats } from "../../../../../shared/types/lead.types";
import { StatCardComponent } from "../../../../ui/stat-card.component";

@Component({
    selector: 'crm-lead-kpi-strip',
    standalone: true,
    imports: [SharedModule, StatCardComponent],
    template: `
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <boo-stat-card label="Total Leads" [value]="stats?.totalLeads ?? '—'" icon="users" tone="primary"></boo-stat-card>
            <boo-stat-card label="New" [value]="stats?.newLeads ?? '—'" icon="clock" tone="warning"></boo-stat-card>
            <boo-stat-card label="Qualified" [value]="stats?.qualifiedLeads ?? '—'" icon="trending-up" tone="neutral"></boo-stat-card>
            <boo-stat-card label="Converted" [value]="stats?.convertedLeads ?? '—'" icon="check-circle" tone="success"></boo-stat-card>
        </div>
    `
})
export class CrmLeadKpiStripComponent {
    @Input() stats: LeadStats | null = null;
}
