import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core";
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { curveCatmullRom } from 'd3-shape';

import { SharedModule } from "../../../../shared/shared-imports";
import { AnalyticItem } from "../../../../shared/types/dashboard.types";
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
        <div class="flex border border-borderGray rounded-lg bg-surface transition-shadow hover:shadow-card">
            <div class="pb-2 flex-1 w-full">
                <div class="flex items-center justify-between gap-1 p-4 pb-0 mb-1">
                    <div class="flex items-center overflow-hidden">
                        <span
                            class="rounded-lg shrink-0 p-3 leading-none inlineFlex-center-center"
                            [style.background-color]="iconTint"
                        >
                            <boo-icon [name]="analyticItem.icon" [color]="analyticItem.color"></boo-icon>
                        </span>
                        <div class="ms-3 overflow-hidden">
                            <p class="mb-0 text-truncate capitalize text-neutral">{{title}}</p>
                            <h5 class="mb-0 font-semibold text-lg text-regular">{{ formattedCurrent }}</h5>
                        </div>
                    </div>
                    <div class="text-end">
                        <span
                            class="inline-flex items-center gap-1 align-middle text-[12px] font-medium py-1 px-2 rounded-[5px]"
                            [ngClass]="isPositiveTrend
                                ? 'text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-500/10'
                                : 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-500/10'"
                        >
                            <boo-icon [name]="isPositiveTrend ? 'trending-up' : 'trending-down'" [size]="12"></boo-icon>
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

    get isPositiveTrend(): boolean {
        return !this.analyticItem.percent?.trim().startsWith('-');
    }

    get iconTint(): string {
        const match = this.analyticItem.color?.match(/\d+/g);
        if (!match || match.length < 3) return 'rgba(0, 0, 0, 0.08)';
        const [r, g, b] = match;
        return `rgba(${r}, ${g}, ${b}, 0.12)`;
    }

    get formattedCurrent(): string {
        const value = this.analyticItem.current;
        if (this.title === 'transactions') {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
        }
        return new Intl.NumberFormat('en-US').format(value);
    }
}