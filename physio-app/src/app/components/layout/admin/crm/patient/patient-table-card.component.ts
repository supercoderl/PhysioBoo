import { Component, EventEmitter, Input, Output } from "@angular/core";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ColumnDefDirective } from "../../../../../shared/directives/column-def.directive";
import { PatientType, RiskLevel } from "../../../../../shared/enums/patient";
import { SharedModule } from "../../../../../shared/shared-imports";
import { ActionItem, PaginationData } from "../../../../../shared/types/common";
import { Patient } from "../../../../../shared/types/patient";
import { BooActionAdminComponent } from "../../../../table/boo-table-admin/boo-action-admin.component";
import { BooTableAdminComponent } from "../../../../table/boo-table-admin/boo-table-admin.component";

@Component({
    selector: 'crm-patient-table-card',
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
                <ng-template appColumnDef="patientNumber" headerLabel="Patient" headerClass="text-left" let-item>
                    <div class="flex items-center gap-3 cursor-pointer" (click)="onEditClick(item.id)">
                        <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span class="text-xs font-bold text-primary">{{ item.patientNumber?.charAt(0) }}</span>
                        </div>
                        <div class="min-w-0">
                            <div class="text-sm font-semibold text-danger truncate" [title]="item.patientNumber">{{ item.patientNumber }}</div>
                            <div class="text-xs text-secondary">{{ item.occupation ?? '—' }}</div>
                        </div>
                    </div>
                </ng-template>

                <ng-template appColumnDef="patientType" headerLabel="Type" headerClass="text-left" let-item>
                    <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="{
                            'bg-blue-100 text-blue-700': item.patientType === PatientType.Outpatient,
                            'bg-purple-100 text-purple-700': item.patientType === PatientType.Inpatient,
                            'bg-red-100 text-red-700': item.patientType === PatientType.Emergency,
                            'bg-orange-100 text-orange-700': item.patientType === PatientType.Referral
                        }">
                        {{ PatientType[item.patientType] }}
                    </span>
                </ng-template>

                <ng-template appColumnDef="riskLevel" headerLabel="Risk" headerClass="text-center" cellClass="text-center" let-item>
                    <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="{
                            'bg-green-100 text-green-700': item.riskLevel === RiskLevel.Low,
                            'bg-yellow-100 text-yellow-700': item.riskLevel === RiskLevel.Medium,
                            'bg-orange-100 text-orange-700': item.riskLevel === RiskLevel.High,
                            'bg-red-100 text-red-700': item.riskLevel === RiskLevel.Critical
                        }">
                        {{ RiskLevel[item.riskLevel] }}
                    </span>
                </ng-template>

                <ng-template appColumnDef="lastVisit" headerLabel="Last Visit" headerClass="text-left" let-item>
                    <div class="text-sm">{{ item.lastVisitDate ? (item.lastVisitDate | date:'mediumDate') : '—' }}</div>
                    <div class="text-xs text-secondary">{{ item.nextFollowUpDate ? ('Next: ' + (item.nextFollowUpDate | date:'mediumDate')) : '' }}</div>
                </ng-template>

                <ng-template appColumnDef="totalVisits" headerLabel="Visits" headerClass="text-center" cellClass="text-center" let-item>
                    <span class="text-sm font-medium">{{ item.totalVisits }}</span>
                </ng-template>

                <ng-template appColumnDef="flags" headerLabel="Flags" headerClass="text-center" cellClass="text-center" let-item>
                    <div class="flex justify-center gap-1">
                        <span *ngIf="item.isVip" class="inline-flex px-1.5 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700">VIP</span>
                        <span *ngIf="item.isSeniorCitizen" class="inline-flex px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700">Senior</span>
                        <span *ngIf="item.isChronicPatient" class="inline-flex px-1.5 py-0.5 rounded text-xs bg-red-100 text-red-700">Chronic</span>
                    </div>
                </ng-template>

                <ng-template appColumnDef="actions" headerLabel="Actions" let-item headerClass="text-center" cellClass="text-center">
                    <boo-action-admin [items]="tableActions" [data]="item" />
                </ng-template>
            </boo-table-admin>
        </div>
    `
})
export class CrmPatientTableCardComponent {
    // #region Inputs, Outputs, Properties
    @Input() data: PaginationData<Patient> | null = null;
    @Input() filter!: { pageNumber: number, pageSize: number };
    @Output() pageChange = new EventEmitter<number>();
    @Output() editClick = new EventEmitter<string>();
    @Output() deleteClick = new EventEmitter<string>();

    PatientType = PatientType;
    RiskLevel = RiskLevel;

    readonly tableActions: ActionItem[] = [
        {
            label: 'Delete',
            isDanger: true,
            onClick: (item: any) => this.onDeleteClick(item.id)
        }
    ];
    // #endregion

    constructor(protected loadingSrv: LocalLoadingService) { }

    onPageClick(page: number) { this.pageChange.emit(page); }
    onEditClick(id: string) { this.editClick.emit(id); }
    onDeleteClick(id: string) { this.deleteClick.emit(id); }
}
