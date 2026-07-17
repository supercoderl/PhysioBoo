import { booleanAttribute, Component, Input } from "@angular/core";
import { SharedModule } from "../../shared/shared-imports";

export type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral';

const TONE_CLASSES: Record<BadgeTone, string> = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-rose-50 text-rose-700',
    neutral: 'bg-gray-100 text-gray-600',
};

@Component({
    selector: 'boo-status-badge',
    standalone: true,
    imports: [SharedModule],
    template: `
        <span
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold leading-none whitespace-nowrap"
            [ngClass]="[TONE_CLASSES[tone], dotted ? 'pl-1.5' : '']"
        >
            <span *ngIf="dotted" class="w-1.5 h-1.5 rounded-full" [ngClass]="dotClass"></span>
            {{ label }}
        </span>
    `,
})
export class StatusBadgeComponent {
    @Input({ required: true }) label!: string;
    @Input() tone: BadgeTone = 'neutral';
    @Input({ transform: booleanAttribute }) dotted: boolean = false;

    readonly TONE_CLASSES = TONE_CLASSES;

    get dotClass(): string {
        switch (this.tone) {
            case 'primary': return 'bg-primary';
            case 'success': return 'bg-emerald-500';
            case 'warning': return 'bg-amber-500';
            case 'danger': return 'bg-rose-500';
            default: return 'bg-gray-400';
        }
    }
}
