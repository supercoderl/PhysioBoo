import { Component, Input } from "@angular/core";
import { SharedModule } from "../../shared/shared-imports";
import { BooIconComponent } from "../icon/boo-icon/boo-icon.component";

@Component({
    selector: 'boo-empty-state',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
        <div class="flex flex-col items-center justify-center text-center py-10 px-6">
            <div class="flex items-center justify-center w-14 h-14 rounded-2 bg-primary/5 mb-4">
                <boo-icon [name]="icon" [size]="26" iconClass="text-primary"></boo-icon>
            </div>
            <p class="text-sm font-semibold text-regular mb-1">{{ title }}</p>
            <p class="text-xs15 text-secondary max-w-[280px] mb-5" *ngIf="description">{{ description }}</p>
            <ng-content></ng-content>
        </div>
    `,
})
export class EmptyStateComponent {
    @Input({ required: true }) icon!: string;
    @Input({ required: true }) title!: string;
    @Input() description?: string | null;
}
