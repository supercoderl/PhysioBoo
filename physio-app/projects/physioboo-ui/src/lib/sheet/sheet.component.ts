import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { BooButtonComponent } from '../button/button.component';
import { BooIconComponent } from '../icon/icon.component';
import { booDrawerSheet, booMotionState } from '../motion/motion';

let nextId = 0;

/**
 * Modal bottom sheet (the public listings' mobile filter panel). Render it with `*ngIf` while open: on open it locks
 * page scroll and focuses its close button; on close it restores scroll and returns focus to `returnFocus`, or to
 * whatever had focus when it opened. Escape, the backdrop and the close button all emit `dismiss`.
 * The backdrop fades and the panel slides (a short fade only, when the visitor prefers reduced motion).
 * Everything inside the element is projected below the header, so the body and footer keep their own padding.
 * Responsive visibility (e.g. `md:hidden`) goes on the host.
 */
@Component({
  selector: 'boo-sheet',
  standalone: true,
  imports: [BooButtonComponent, BooIconComponent],
  template: `
    <div
      [attr.id]="panelId"
      role="dialog"
      aria-modal="true"
      [attr.aria-labelledby]="headingId"
      class="drawer-sheet absolute inset-x-0 bottom-0 max-h-[85vh] bg-surface rounded-t-[20px] flex flex-col"
    >
      <div class="flex justify-between items-center pl-5 pr-4 pt-4 pb-3 border-b border-gray-200">
        <h2 [id]="headingId" class="text-lg font-semibold m-0">{{ heading }}</h2>
        <button #closeButton boo-button variant="subtle" [iconOnly]="true" (click)="dismiss.emit()" [attr.aria-label]="closeLabel">
          <physio-icon name="x" [size]="20" />
        </button>
      </div>
      <ng-content></ng-content>
    </div>
  `,
  host: {
    class: 'fixed inset-0 z-[1100] bg-gray-900/45',
    '(click)': 'onBackdropClick($event)',
    '[@drawerSheet]': 'motion',
  },
  animations: [booDrawerSheet],
})
export class BooSheetComponent implements OnInit, OnDestroy {
  @Input({ required: true }) heading = '';
  /** Id of the dialog element, for the opening button's `aria-controls`. */
  @Input() panelId: string | null = null;
  @Input() closeLabel = 'Close';
  /** Element to focus once the sheet closes. Defaults to the element that had focus when it opened. */
  @Input() returnFocus?: HTMLElement | null;
  @Output() dismiss = new EventEmitter<void>();

  @ViewChild('closeButton', { read: ElementRef, static: true }) private closeButton!: ElementRef<HTMLButtonElement>;

  readonly headingId = `boo-sheet-${++nextId}-title`;
  readonly motion = booMotionState();

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private openedFrom: HTMLElement | null = null;

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.openedFrom = this.document.activeElement instanceof HTMLElement ? this.document.activeElement : null;
    this.document.body.style.overflow = 'hidden';
    setTimeout(() => this.closeButton.nativeElement.focus());
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    this.document.body.style.overflow = '';
    const target = this.returnFocus ?? this.openedFrom;
    setTimeout(() => target?.focus());
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.dismiss.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === this.host) this.dismiss.emit();
  }
}
