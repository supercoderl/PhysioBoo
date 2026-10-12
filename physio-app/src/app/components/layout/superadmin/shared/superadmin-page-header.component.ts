import { Component, Input } from '@angular/core';
import { SharedModule } from '../../../../shared/shared-imports';

/** Title block shared by every Super Admin page; page actions are projected on the right. */
@Component({
    selector: 'superadmin-page-header',
    standalone: true,
    imports: [SharedModule],
    template: `
        <div class="flex items-start justify-between flex-wrap gap-3">
            <div class="min-w-0">
                <h2 class="text-[30px] font-semibold tracking-[-0.025em] text-regular leading-tight m-0">{{ title }}</h2>
                <p *ngIf="description" class="text-[13px] text-secondary mt-1 mb-0">{{ description }}</p>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
                <ng-content></ng-content>
            </div>
        </div>
    `
})
export class SuperadminPageHeaderComponent {
    @Input({ required: true }) title!: string;
    @Input() description?: string | null;
}
