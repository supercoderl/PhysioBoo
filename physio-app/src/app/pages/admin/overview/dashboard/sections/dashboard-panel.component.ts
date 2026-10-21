import { NgIf } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { BooIconComponent } from "@physioboo/ui";

/**
 * Card frame shared by the dashboard sections: title, caption, an optional link to the module behind the figures,
 * and a slot for header controls (`[panelActions]`).
 */
@Component({
    selector: 'dashboard-panel',
    standalone: true,
    imports: [NgIf, RouterLink, BooIconComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: 'block h-full min-w-0' },
    template: `
        <section class="h-full flex flex-col min-w-0 bg-surface border border-borderGray rounded-xl" [attr.aria-labelledby]="headingId">
            <header class="flex items-start justify-between gap-3 px-4 pt-3.5 pb-3 border-b border-rowDivider">
                <div class="flex items-start gap-2.5 min-w-0">
                    <span class="flex-none mt-0.5 w-7 h-7 rounded-lg bg-primarySoft text-primaryDeep flex items-center justify-center" aria-hidden="true">
                        <physio-icon [name]="icon" [size]="15" />
                    </span>
                    <div class="min-w-0">
                        <h2 [id]="headingId" class="m-0 text-sm font-semibold leading-5 text-regular">{{ title }}</h2>
                        <p *ngIf="caption" class="m-0 text-xs leading-4 text-secondary break-words">{{ caption }}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2 flex-none">
                    <ng-content select="[panelActions]"></ng-content>
                    <a
                        *ngIf="link"
                        [routerLink]="link"
                        class="inline-flex items-center gap-0.5 h-8 px-2 -mr-2 rounded-lg text-xs font-semibold text-primaryDeep no-underline whitespace-nowrap hover:bg-primarySoft hover:text-primaryDeep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        {{ linkLabel }}<physio-icon name="chevron-right" [size]="14" />
                    </a>
                </div>
            </header>
            <div class="flex-1 min-w-0 flex flex-col">
                <ng-content></ng-content>
            </div>
        </section>
    `,
})
export class DashboardPanelComponent {
    private static nextId = 0;

    @Input({ required: true }) title!: string;
    @Input({ required: true }) icon!: string;
    @Input() caption?: string | null;
    /** Route to the module behind the figures; null hides the link (e.g. when the user can't open it). */
    @Input() link: string | null = null;
    @Input() linkLabel = 'Open';

    readonly headingId = `dashboard-panel-${DashboardPanelComponent.nextId++}`;
}
