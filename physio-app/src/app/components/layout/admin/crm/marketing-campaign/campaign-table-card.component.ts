import { Component, EventEmitter, Input, Output } from "@angular/core";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ColumnDefDirective } from "../../../../../shared/directives/column-def.directive";
import { CampaignStatus, CampaignType } from "../../../../../shared/enums/campaign";
import { SharedModule } from "../../../../../shared/shared-imports";
import { Campaign } from "../../../../../shared/types/campaign.types";
import { ActionItem, PaginationData } from "../../../../../shared/types/common";
import { BooActionAdminComponent } from "../../../../table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent } from "../../../../table/boo-table-admin/boo-table-admin.component";

const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
    [CampaignType.Email]: 'Email',
    [CampaignType.Sms]: 'SMS',
    [CampaignType.Social]: 'Social Media',
    [CampaignType.MultiChannel]: 'Multi-Channel',
    [CampaignType.Push]: 'Push',
};

@Component({
    selector: 'crm-campaign-table-card',
    standalone: true,
    imports: [
        SharedModule,
        BooTableAdminComponent,
        ColumnDefDirective,
        BooActionAdminComponent
    ],
    template: `
        <div class="bg-surface rounded-[6px] border border-gray-200 h-full overflow-hidden">
            <boo-table-admin
                [data]="data?.items ?? []"
                tdClass="px-4 py-3"
                [showFooter]="true"
                [currentPage]="data?.pageNumber ?? filter.pageNumber"
                [pageSize]="data?.pageSize ?? filter.pageSize"
                [totalItems]="data?.totalCount ?? 0"
                (pageChange)="onPageClick($event)"
                [loading]="loadingSrv.isLoading('search')"
            >
                <ng-template appColumnDef="name" headerLabel="Campaign" headerClass="text-left" let-item>
                    <div class="cursor-pointer" (click)="onEditClick(item.id)">
                        <div class="text-sm font-semibold text-primary truncate" [title]="item.name">{{ item.name }}</div>
                        <div class="text-xs text-secondary">{{ item.code }}</div>
                    </div>
                </ng-template>

                <ng-template appColumnDef="type" headerLabel="Type" headerClass="text-left" let-item>
                    <!-- <span class="text-sm text-regular">{{ typeLabels[item.type] }}</span> -->
                </ng-template>

                <ng-template appColumnDef="status" headerLabel="Status" headerClass="text-left" let-item>
                    <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="{
                            'bg-gray-100 text-gray-700': item.status === CampaignStatus.Draft,
                            'bg-blue-100 text-blue-700': item.status === CampaignStatus.Scheduled,
                            'bg-green-100 text-green-700': item.status === CampaignStatus.Active,
                            'bg-amber-100 text-amber-700': item.status === CampaignStatus.Paused,
                            'bg-purple-100 text-purple-700': item.status === CampaignStatus.Completed,
                            'bg-red-100 text-red-700': item.status === CampaignStatus.Cancelled
                        }">
                        {{ CampaignStatus[item.status] }}
                    </span>
                </ng-template>

                <ng-template appColumnDef="audience" headerLabel="Audience" headerClass="text-left" let-item>
                    <span class="text-sm text-regular">{{ item.audienceSegmentName ?? '—' }}</span>
                </ng-template>

                <ng-template appColumnDef="duration" headerLabel="Duration" headerClass="text-left" let-item>
                    <div class="text-sm">{{ item.startDate ? (item.startDate | date:'mediumDate') : '—' }}</div>
                    <div class="text-xs text-secondary">{{ item.endDate ? ('to ' + (item.endDate | date:'mediumDate')) : '' }}</div>
                </ng-template>

                <ng-template appColumnDef="budget" headerLabel="Budget" headerClass="text-left" let-item>
                    <div class="text-sm font-medium">{{ item.spent | number }} / {{ item.budget | number }}</div>
                    <div class="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                        <div class="bg-primary h-1.5 rounded-full" [style.width.%]="budgetPercentage(item)"></div>
                    </div>
                </ng-template>

                <ng-template appColumnDef="reach" headerLabel="Reach" headerClass="text-center" cellClass="text-center" let-item>
                    <span class="text-sm font-medium">{{ item.reach | number }}</span>
                </ng-template>

                <ng-template appColumnDef="conversions" headerLabel="Conversions" headerClass="text-center" cellClass="text-center" let-item>
                    <span class="text-sm font-medium">{{ item.conversions | number }}</span>
                </ng-template>

                <ng-template appColumnDef="actions" headerLabel="Actions" let-item headerClass="text-center" cellClass="text-center">
                    <boo-action-admin [items]="tableActions" [data]="item" />
                </ng-template>
            </boo-table-admin>
        </div>
    `
})
export class CrmCampaignTableCardComponent {
    // #region Inputs, Outputs, Properties
    @Input() data: PaginationData<Campaign> | null = null;
    @Input() filter!: { pageNumber: number, pageSize: number };
    @Output() pageChange = new EventEmitter<number>();
    @Output() editClick = new EventEmitter<string>();
    @Output() deleteClick = new EventEmitter<string>();

    CampaignStatus = CampaignStatus;
    typeLabels = CAMPAIGN_TYPE_LABELS;

    readonly tableActions: ActionItem[] = [
        {
            label: 'Delete',
            isDanger: true,
            onClick: (item: any) => this.onDeleteClick(item.id)
        }
    ];
    // #endregion

    constructor(protected loadingSrv: LocalLoadingService) { }

    budgetPercentage(item: Campaign): number {
        if (!item.budget) return 0;
        return Math.min(100, Math.round((item.spent / item.budget) * 100));
    }

    onPageClick(page: number) { this.pageChange.emit(page); }
    onEditClick(id: string) { this.editClick.emit(id); }
    onDeleteClick(id: string) { this.deleteClick.emit(id); }
}
