import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core";
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { curveCatmullRom } from 'd3-shape';

import { SharedModule } from "../../../../shared/shared-imports";
import { AnalyticItem } from "../../../../shared/types/dashboard";
import { BooIconComponent } from "../../../icon/boo-icon/boo-icon.component";

@Component({
    selector: 'admin-analytic-card',
    standalone: true,
    imports: [
        BooIconComponent,
        SharedModule
    ],
    encapsulation: ViewEncapsulation.None,
    template: `
        <div class="flex border border-borderGray rounded-md bg-white">
            <div class="pb-2 flex-1 w-full">
                <div class="flex items-center justify-between gap-1 p-5 pb-0 mb-1">
                    <div class="flex items-center overflow-hidden">
                        <span 
                            class="rounded-full shrink-0 p-3 leading-none"
                            [style.background]="analyticItem.color"
                        >
                            <boo-icon [name]="analyticItem.icon" color="white"></boo-icon>
                        </span>
                        <div class="ms-2 overflow-hidden">
                            <p class="mb-0 text-truncate capitalize">{{title}}</p>
                            <h5 class="mb-0 font-semibold text-lg">{{analyticItem.current}}</h5>
                        </div>
                    </div>
                    <div class="text-end">
                        <span class="align-middle text-[12px] font-medium py-1 px-2 rounded-[5px] text-[#B71C1C] bg-[rgb(251,_236,_234)]">
                            {{analyticItem.percent}}
                        </span>
                    </div>
                </div>

                <div class="h-[80px] max-w-full w-full mt-2 overflow-hidden" #containerRef>
                    <ngx-charts-line-chart
                        [results]="chartData"
                        [scheme]="colorScheme"
                        [curve]="curve"
                        [xAxis]="false"
                        [yAxis]="false"
                        [legend]="false"
                        [showGridLines]="false"
                        [autoScale]="true" 
                        [tooltipDisabled]="false"
                        [animations]="true">
                    </ngx-charts-line-chart>
                </div>
            </div>
        </div>
    `,
})
export class AdminAnalyticCardComponent implements OnInit {
    @Input() title!: string;
    @Input() analyticItem!: AnalyticItem;

    chartData: any[] = [];
    colorScheme: Color = {
        name: 'custom',
        selectable: true,
        group: ScaleType.Ordinal,
        domain: [] 
    };
    curve = curveCatmullRom;

    ngOnInit() {
        this.colorScheme = {
            ...this.colorScheme,
            domain: [this.analyticItem.color || '#000000']
        };

        if (this.analyticItem.trend) {
            const seriesData = this.analyticItem.trend.map((val, index) => ({
                name: `Day ${index + 1}`,
                value: val
            }));

            this.chartData = [
                {
                    name: this.title || 'Data',
                    series: seriesData
                }
            ];
        }
    }
}