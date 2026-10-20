import { NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BooIconComponent } from '../icon/icon.component';
import { booChipPop, booMotionState } from '../motion/motion';

export interface BooFilterChip {
  label: string;
}

/**
 * Removable chips for the filters currently applied to a listing. Each chip emits itself from `remove`; the parent
 * clears that filter. Renders nothing while there are no chips, so spacing on the host collapses with it.
 */
@Component({
  selector: 'boo-filter-chips',
  standalone: true,
  imports: [NgFor, BooIconComponent],
  template: `
    <ul aria-label="Active filters" class="list-none m-0 p-0 flex gap-2 flex-wrap">
      <li *ngFor="let chip of chips; trackBy: trackByLabel" [@chipPop]="motion" class="max-w-full">
        <button
          type="button"
          (click)="remove.emit(chip)"
          [attr.aria-label]="'Remove filter ' + chip.label"
          class="max-w-full h-[34px] pl-3 pr-2 rounded-full border border-primary bg-primarySoft text-primaryDeep text-[13px] font-medium flex gap-1.5 items-center cursor-pointer motion-chip whitespace-nowrap"
        >
          <span class="truncate">{{ chip.label }}</span><physio-icon name="x" [size]="14" class="flex-none" />
        </button>
      </li>
    </ul>
  `,
  host: {
    class: 'block',
    '[style.display]': 'chips.length ? null : "none"',
  },
  animations: [booChipPop],
})
export class BooFilterChipsComponent<T extends BooFilterChip = BooFilterChip> {
  @Input({ required: true }) chips: readonly T[] = [];
  @Output() remove = new EventEmitter<T>();

  /** 'reduced' limits the chip pop to a short opacity fade. */
  readonly motion = booMotionState();

  /** Parents usually rebuild chips in a getter on every check; tracking by label keeps the same DOM nodes. */
  trackByLabel(_: number, chip: T): string {
    return chip.label;
  }
}
