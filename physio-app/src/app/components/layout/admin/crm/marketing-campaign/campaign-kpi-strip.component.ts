import { Component, Input } from "@angular/core";
import { SharedModule } from "../../../../../shared/shared-imports";
import { CampaignStats } from "../../../../../shared/types/campaign.types";
import { StatCardComponent } from "../../../../ui/stat-card.component";

@Component({
    selector: 'crm-campaign-kpi-strip',
    standalone: true,
    imports: [SharedModule, StatCardComponent],
    template: `
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <boo-stat-card label="Total Campaigns" [value]="stats?.totalCampaigns ?? '—'" icon="megaphone" tone="primary"></boo-stat-card>
            <boo-stat-card label="Active" [value]="stats?.activeCampaigns ?? '—'" icon="zap" tone="success"></boo-stat-card>
            <boo-stat-card label="Total Reach" [value]="format(stats?.totalReach)" icon="users" tone="neutral"></boo-stat-card>
            <boo-stat-card label="Conversions" [value]="format(stats?.totalConversions)" icon="target" tone="warning"></boo-stat-card>
        </div>
    `
})
export class CrmCampaignKpiStripComponent {
    @Input() stats: CampaignStats | null = null;

    format(value?: number | null): string {
        if (value === undefined || value === null) return '—';
        return value.toLocaleString();
    }
}
