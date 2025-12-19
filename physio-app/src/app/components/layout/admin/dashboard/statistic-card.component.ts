import { Component } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { BooButtonAdminComponent } from "../../../button/boo-button-admin/boo-button-admin.component";

@Component({
    selector: 'admin-statistic-card',
    standalone: true,
    imports: [
        SharedModule,
        BooButtonAdminComponent,
    ],
    template: `
    <div class="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
        <div class="flex items-center justify-between py-3 px-5 border-b border-gray-200">
            <h5 class="font-bold text-lg mb-0">Patients Statistics</h5> 
            <boo-button-admin
                background="transparent"
                [border]="{ width: 1, color: '#e3e3e3' }"
                textColor="#000000"
                padding="4px 8px"
            >
                View All
            </boo-button-admin>
        </div>
        <div class="p-5 flex-1">
            <div>
                <ngx-charts-bar-vertical-stacked
                    [results]="multi"
                    [gradient]="false"
                    [xAxis]="true"
                    [yAxis]="true"
                    [legend]="false"
                    [showXAxisLabel]="false"
                    [showYAxisLabel]="false"
                    [showGridLines]="true"
                    [barPadding]="35"
                > 
                </ngx-charts-bar-vertical-stacked>
            </div>
        </div>
    </div>
  `
})
export class AdminStatisticCardComponent {
    // #region Inputs, Outputs, Properties
    multi = [
        {
            "name": "25 May",
            "series": [
                { "name": "Active", "value": 25 },
                { "name": "Pending", "value": 20 }
            ]
        },
        {
            "name": "26 May",
            "series": [
                { "name": "Active", "value": 30 },
                { "name": "Pending", "value": 25 }
            ]
        },
        {
            "name": "27 May",
            "series": [
                { "name": "Active", "value": 70 },
                { "name": "Pending", "value": 15 }
            ]
        },
        {
            "name": "28 May",
            "series": [
                { "name": "Active", "value": 70 },
                { "name": "Pending", "value": 15 }
            ]
        },
        {
            "name": "29 May",
            "series": [
                { "name": "Active", "value": 70 },
                { "name": "Pending", "value": 15 }
            ]
        },
        {
            "name": "30 May",
            "series": [
                { "name": "Active", "value": 70 },
                { "name": "Pending", "value": 15 }
            ]
        },
        {
            "name": "31 May",
            "series": [
                { "name": "Active", "value": 70 },
                { "name": "Pending", "value": 15 }
            ]
        },
    ];
    // #endregion
}