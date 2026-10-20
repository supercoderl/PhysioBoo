import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Params, RouterLink } from '@angular/router';
import { BooIconComponent } from '../icon/icon.component';

export interface BooBreadcrumbItem {
  label: string;
  /** Router link of an ancestor page. An item without one is the current page (normally the last). */
  link?: string | any[];
  queryParams?: Params | null;
}

export type BooBreadcrumbSeparator = 'chevron' | 'slash';
export type BooBreadcrumbLinkStyle = 'plain' | 'underline';

const LINK_CLASSES: Record<BooBreadcrumbLinkStyle, string> = {
  plain: 'text-gray-700 hover:text-primaryDeep',
  underline: 'text-primaryDeep font-medium underline decoration-[#F3C1CD] underline-offset-[3px] hover:text-primaryHover',
};

/**
 * Public-site breadcrumb trail. Items with a `link` are links; the item without one is the current page
 * (`aria-current="page"`). A trail may end on a link when the current page has no title to show.
 * Spacing and container width go on the host element.
 */
@Component({
  selector: 'boo-breadcrumb',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, RouterLink, BooIconComponent],
  template: `
    <nav aria-label="Breadcrumb">
      <ol
        class="list-none m-0 p-0 flex gap-2 items-center text-sm text-gray-600"
        [ngClass]="{ 'flex-wrap': wrap, 'min-w-0': truncate }"
      >
        <ng-container *ngFor="let item of items; let last = last">
          <li *ngIf="item.link !== undefined" [class.flex-none]="truncate">
            <a [routerLink]="item.link" [queryParams]="item.queryParams" [class]="linkClass">{{ item.label }}</a>
          </li>
          <li
            *ngIf="item.link === undefined"
            aria-current="page"
            class="text-gray-900 font-medium"
            [ngClass]="{ 'min-w-0 flex-1 truncate': truncate }"
            [attr.title]="truncate ? item.label : null"
          >{{ item.label }}</li>
          <li *ngIf="!last && separator === 'chevron'" aria-hidden="true" class="flex" [class.flex-none]="truncate">
            <physio-icon name="chevron-right" [size]="13" />
          </li>
          <li *ngIf="!last && separator === 'slash'" aria-hidden="true" [class.flex-none]="truncate">/</li>
        </ng-container>
      </ol>
    </nav>
  `,
  host: { class: 'block' },
})
export class BooBreadcrumbComponent {
  @Input({ required: true }) items: readonly BooBreadcrumbItem[] = [];
  @Input() separator: BooBreadcrumbSeparator = 'chevron';
  @Input() linkStyle: BooBreadcrumbLinkStyle = 'plain';
  /** Lets a long trail wrap onto a second line (detail pages). */
  @Input() wrap = false;
  /** Keeps the trail on one line and truncates the current page's label, with the full label as a tooltip. */
  @Input() truncate = false;

  get linkClass(): string {
    return LINK_CLASSES[this.linkStyle];
  }
}
