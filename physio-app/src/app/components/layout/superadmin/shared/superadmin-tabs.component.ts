import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../../../../shared/shared-imports';

export interface SuperadminTab {
    id: string;
    label: string;
    /** Optional count shown next to the label. */
    count?: number | null;
}

/**
 * Accessible tab strip (ARIA tabs pattern with arrow / Home / End keys).
 * The parent renders the panels itself: `id="panel-<tab.id>"`, `role="tabpanel"`, `aria-labelledby="tab-<tab.id>"`.
 */
@Component({
    selector: 'superadmin-tabs',
    standalone: true,
    imports: [SharedModule],
    template: `
        <div
            role="tablist"
            [attr.aria-label]="label"
            class="flex gap-1 border-b border-borderGray/60 overflow-x-auto"
        >
            <button
                *ngFor="let tab of tabs; let i = index"
                type="button"
                role="tab"
                class="relative inline-flex items-center gap-1.5 px-3 py-2.5 text-[13px] font-medium whitespace-nowrap rounded-t-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer transition-colors"
                [ngClass]="active === tab.id
                    ? 'text-primary after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-primary'
                    : 'text-secondary hover:text-regular'"
                [id]="'tab-' + tab.id"
                [attr.aria-selected]="active === tab.id"
                [attr.aria-controls]="'panel-' + tab.id"
                [attr.tabindex]="active === tab.id ? 0 : -1"
                (click)="select(tab.id)"
                (keydown)="onKeydown($event, i)"
            >
                {{ tab.label }}
                <span
                    *ngIf="tab.count !== undefined && tab.count !== null"
                    class="px-1.5 py-0.5 rounded-full bg-black/5 text-[11px] font-semibold tabular-nums leading-none"
                >{{ tab.count }}</span>
            </button>
        </div>
    `
})
export class SuperadminTabsComponent {
    @Input({ required: true }) tabs!: SuperadminTab[];
    @Input({ required: true }) active!: string;
    @Input() label = 'Sections';
    @Output() activeChange = new EventEmitter<string>();

    select(id: string) {
        if (id !== this.active) this.activeChange.emit(id);
    }

    onKeydown(event: KeyboardEvent, index: number) {
        const last = this.tabs.length - 1;
        let next: number;
        switch (event.key) {
            case 'ArrowRight': next = index === last ? 0 : index + 1; break;
            case 'ArrowLeft': next = index === 0 ? last : index - 1; break;
            case 'Home': next = 0; break;
            case 'End': next = last; break;
            default: return;
        }
        event.preventDefault();
        this.select(this.tabs[next].id);
        const buttons = (event.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLElement>('[role="tab"]');
        buttons?.[next]?.focus();
    }
}
