import { Component, Input } from "@angular/core";
import { SharedModule } from "../../shared/shared-imports";
import { StatTone } from "../../shared/types/doctor-desk.types";
import { BooIconComponent } from "../icon/boo-icon/boo-icon.component";

const TONE_CLASSES: Record<StatTone, { bg: string; icon: string; ring: string }> = {
    primary: { bg: 'bg-primary/8', icon: 'text-primary', ring: 'ring-primary/10' },
    success: { bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-100' },
    warning: { bg: 'bg-amber-50', icon: 'text-amber-600', ring: 'ring-amber-100' },
    danger: { bg: 'bg-rose-50', icon: 'text-rose-600', ring: 'ring-rose-100' },
    neutral: { bg: 'bg-gray-100', icon: 'text-gray-500', ring: 'ring-gray-200' },
};

@Component({
    selector: 'boo-stat-card',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
        <div
            class="flex items-center gap-3.5 bg-surface rounded-2 border border-borderGray/60 px-4 py-3.5 transition-all duration-200 hover:shadow-card hover:-translate-y-0.5"
        >
            <div class="flex items-center justify-center w-10 h-10 rounded-1.5 shrink-0 ring-1" [ngClass]="[tones.bg, tones.ring]">
                <boo-icon [name]="icon" [size]="18" [iconClass]="tones.icon"></boo-icon>
            </div>
            <div class="flex flex-col min-w-0">
                <span class="text-[12px] font-medium text-secondary leading-none mb-1 truncate">{{ label }}</span>
                <span class="text-xl font-bold text-regular leading-none">{{ value }}</span>
            </div>
        </div>
    `,
})
export class StatCardComponent {
    @Input({ required: true }) label!: string;
    @Input({ required: true }) value!: number | string;
    @Input({ required: true }) icon!: string;
    @Input() tone: StatTone = 'primary';

    get tones() {
        return TONE_CLASSES[this.tone];
    }
}
