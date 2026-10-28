import { NgIf } from "@angular/common";
import { Component, Input } from "@angular/core";

/**
 * A card on a settings page: heading and description, optional actions on the right, then the body. `flush` drops
 * the body padding for row lists that draw their own dividers; `tone="danger"` marks destructive sections.
 */
@Component({
    selector: 'setting-section',
    standalone: true,
    imports: [NgIf],
    host: { class: 'block' },
    template: `
        <section
            class="bg-surface rounded-xl border"
            [class.border-borderGray]="tone === 'default'"
            [class.border-red-200]="tone === 'danger'"
            [attr.aria-labelledby]="headingId"
        >
            <div class="px-5 py-4 flex flex-wrap items-start justify-between gap-3" [class.border-b]="!headerOnly" [class.border-rowDivider]="!headerOnly">
                <div class="min-w-0">
                    <h2 [id]="headingId" class="m-0 text-[15px] leading-6 font-semibold" [class.text-regular]="tone === 'default'" [class.text-red-700]="tone === 'danger'">{{ heading }}</h2>
                    <p *ngIf="description" class="m-0 mt-0.5 text-xs leading-5 text-secondary">{{ description }}</p>
                </div>
                <div class="flex flex-wrap items-center gap-2 empty:hidden"><ng-content select="[sectionActions]"></ng-content></div>
            </div>
            <div *ngIf="!headerOnly" [class.p-5]="!flush"><ng-content></ng-content></div>
        </section>
    `
})
export class SettingSectionComponent {
    private static nextId = 0;

    @Input({ required: true }) heading!: string;
    @Input() description = '';
    @Input() flush = false;
    /** The card is only its header (e.g. a notice with an action). */
    @Input() headerOnly = false;
    @Input() tone: 'default' | 'danger' = 'default';

    readonly headingId = `setting-section-${SettingSectionComponent.nextId++}`;
}
