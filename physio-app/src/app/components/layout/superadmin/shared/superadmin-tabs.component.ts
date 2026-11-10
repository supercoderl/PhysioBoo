import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { BooTab, BooTabsComponent } from '@physioboo/ui';

export interface SuperadminTab {
    id: string;
    label: string;
    count?: number | null;
}

/** Super Admin section tabs: a thin adapter from `{ id, label, count }` to the shared `boo-tabs`. */
@Component({
    selector: 'superadmin-tabs',
    standalone: true,
    imports: [BooTabsComponent],
    template: `<boo-tabs [tabs]="items" [value]="active" [label]="label" (valueChange)="select($event)" />`
})
export class SuperadminTabsComponent implements OnChanges {
    @Input({ required: true }) tabs!: SuperadminTab[];
    @Input({ required: true }) active!: string;
    @Input() label = 'Sections';
    @Output() activeChange = new EventEmitter<string>();

    items: BooTab[] = [];

    ngOnChanges(): void {
        this.items = (this.tabs ?? []).map(t => ({ value: t.id, label: t.label, count: t.count }));
    }

    select(id: string) {
        if (id !== this.active) this.activeChange.emit(id);
    }
}
