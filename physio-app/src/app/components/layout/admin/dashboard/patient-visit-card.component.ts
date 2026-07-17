import { Component } from "@angular/core";
import { ColumnDefDirective } from "../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../shared/shared-imports";
import { BooButtonAdminComponent } from "../../../button/boo-button-admin/boo-button-admin.component";
import { BooIconComponent } from "../../../icon/boo-icon/boo-icon.component";
import { BooTableAdminComponent } from "../../../table/boo-table-admin/boo-table-admin.component";
import { BooTagComponent } from "../../../tag/boo-tag/boo-tag/boo-tag.component";

interface PatientVisit {
    id: number;
    name: string;
    avatar: string;
    reason: string;
    time: string;
    status: string;
    statusColor: string;
    statusBackground: string;
}

@Component({
    selector: 'admin-patient-visit-card',
    standalone: true,
    imports: [
        SharedModule,
        BooButtonAdminComponent,
        BooTableAdminComponent,
        ColumnDefDirective,
        BooIconComponent,
        BooTagComponent
    ],
    template: `
    <div class="bg-surface rounded-lg border border-borderGray h-full">
        <div class="flex items-center justify-between py-3 px-5 border-b border-borderGray">
            <h5 class="font-bold text-lg mb-0 text-regular">Patient Visits</h5>
            <boo-button-admin
                background="transparent"
                [border]="{ width: 1, color: '#e3e3e3' }"
                textColor="#000000"
                padding="4px 8px"
                buttonClass="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
                View All
            </boo-button-admin>
        </div>

        <boo-table-admin
            [data]="visits"
            [showHeader]="false"
            [showBorder]="false"
            [showFooter]="false"
            [availableTools]="[]"
            tdClass="px-4 py-3"
        >
            <ng-template appColumnDef="patient" let-item>
                <div class="flex items-center gap-3">
                    <img [src]="item.avatar" [alt]="item.name" class="w-12 h-12 rounded-[6px] object-cover">
                    <div>
                        <div class="font-semibold text-gray-900">{{ item.name }}</div>
                        <div class="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span class="flex items-center gap-1">
                                <boo-icon name="clock" [size]="12"></boo-icon>
                                {{ item.time }}
                            </span>
                            <span>{{ item.reason }}</span>
                        </div>
                    </div>
                </div>
            </ng-template>

            <ng-template appColumnDef="status" let-item cellClass="text-right">
                <boo-tag [color]="item.statusColor" [backgroundColor]="item.statusBackground">
                    {{ item.status }}
                </boo-tag>
            </ng-template>
        </boo-table-admin>
    </div>
  `
})
export class AdminPatientVisitTableCardComponent {
    // #region Inputs, Outputs, Properties
    visits: PatientVisit[] = [
        {
            id: 1,
            name: 'Olivia Bennett',
            avatar: 'https://i.pravatar.cc/150?img=25',
            reason: 'General Checkup',
            time: '09:15 AM',
            status: 'Completed',
            statusColor: '#09800F',
            statusBackground: '#EEF9F1'
        },
        {
            id: 2,
            name: 'Marcus Fields',
            avatar: 'https://i.pravatar.cc/150?img=15',
            reason: 'Follow-up',
            time: '10:40 AM',
            status: 'In Progress',
            statusColor: '#1F6DB2',
            statusBackground: '#EBF2F9'
        },
        {
            id: 3,
            name: 'Sophia Turner',
            avatar: 'https://i.pravatar.cc/150?img=28',
            reason: 'Vaccination',
            time: '11:20 AM',
            status: 'Completed',
            statusColor: '#09800F',
            statusBackground: '#EEF9F1'
        },
        {
            id: 4,
            name: 'Ethan Cole',
            avatar: 'https://i.pravatar.cc/150?img=33',
            reason: 'Consultation',
            time: '01:05 PM',
            status: 'Waiting',
            statusColor: '#B45309',
            statusBackground: '#FEF6E7'
        },
        {
            id: 5,
            name: 'Ava Mitchell',
            avatar: 'https://i.pravatar.cc/150?img=47',
            reason: 'Lab Review',
            time: '02:30 PM',
            status: 'Waiting',
            statusColor: '#B45309',
            statusBackground: '#FEF6E7'
        }
    ];
    // #endregion
}