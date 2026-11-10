import { DOCUMENT, isPlatformBrowser, NgIf, NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, PLATFORM_ID, inject } from '@angular/core';
import { BooButtonComponent } from '../button/button.component';
import { BooIconComponent } from '../icon/icon.component';

let nextId = 0;

export type BooDialogSize = 'sm' | 'md' | 'lg';
export type BooDialogTone = 'default' | 'info' | 'warning' | 'danger' | 'success';

const SIZE: Record<BooDialogSize, string> = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' };
const TONE: Record<Exclude<BooDialogTone, 'default'>, { icon: string; ring: string }> = {
  info: { icon: 'info', ring: 'bg-primarySoft text-primary' },
  warning: { icon: 'triangle-alert', ring: 'bg-amber-50 text-amber-600' },
  danger: { icon: 'triangle-alert', ring: 'bg-dangerSoft text-danger' },
  success: { icon: 'circle-check', ring: 'bg-green-50 text-green-600' },
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal dialog: the single dialog primitive of the application. Render it with `*ngIf` while open.
 *
 * - Header: `heading` (names the dialog), optional `description`, optional status icon via `tone`, and a close button.
 * - Body: projected content. Scrolls when it is taller than the viewport.
 * - Footer: project actions with the `boo-dialog-footer` attribute. They sit on the right, stacked on phones.
 *
 * On open it locks page scroll, moves focus into the dialog and keeps Tab inside it; on close it returns focus to the
 * element that opened it. Escape, the backdrop and the close button emit `dismiss` unless `busy` is set, so a running
 * save cannot be abandoned by accident. The parent owns the open state and decides what `dismiss` does (including
 * asking to confirm unsaved changes).
 */
@Component({
  selector: 'boo-dialog',
  standalone: true,
  imports: [NgIf, NgTemplateOutlet, BooButtonComponent, BooIconComponent],
  template: `
    <div
      aria-modal="true"
      [attr.role]="alert ? 'alertdialog' : 'dialog'"
      [attr.aria-labelledby]="headingId"
      [attr.aria-describedby]="description ? descriptionId : null"
      [attr.aria-busy]="busy ? true : null"
      class="relative w-full max-h-[calc(100dvh-2rem)] flex flex-col bg-surface rounded-xl shadow-2xl border border-borderGray overflow-hidden"
      [class]="sizeClass"
    >
      <div class="flex items-start gap-4 px-6 py-5 border-b border-borderGray">
        <span *ngIf="tone !== 'default' || icon" class="flex-none w-10 h-10 rounded-full flex items-center justify-center" [class]="toneClass">
          <physio-icon [name]="toneIcon" [size]="20" aria-hidden="true" />
        </span>
        <div class="min-w-0 flex-1">
          <h2 [id]="headingId" class="m-0 text-lg font-semibold leading-7 text-regular">{{ heading }}</h2>
          <p *ngIf="description" [id]="descriptionId" class="m-0 mt-1 text-sm leading-relaxed text-secondary">{{ description }}</p>
        </div>
        <button *ngIf="closable" boo-button variant="ghost" size="sm" [iconOnly]="true" classname="-mr-2 -mt-1" type="button" [disabled]="busy" [attr.aria-label]="closeLabel" (click)="requestDismiss()">
          <physio-icon name="x" [size]="18" />
        </button>
      </div>

      <form *ngIf="form; else plain" novalidate class="flex min-h-0 flex-1 flex-col" (submit)="$event.preventDefault(); formSubmit.emit()">
        <ng-container *ngTemplateOutlet="content"></ng-container>
      </form>
      <ng-template #plain><div class="flex min-h-0 flex-1 flex-col"><ng-container *ngTemplateOutlet="content"></ng-container></div></ng-template>
      <ng-template #content>
        <div class="boo-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-4 empty:hidden"><ng-content></ng-content></div>
        <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-6 py-4 bg-gray-50 border-t border-borderGray empty:hidden">
          <ng-content select="[boo-dialog-footer]"></ng-content>
        </div>
      </ng-template>
    </div>
  `,
  host: {
    class: 'fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-gray-900/45',
    '(mousedown)': 'onBackdrop($event)',
  },
})
export class BooDialogComponent implements OnInit, OnDestroy {
  @Input({ required: true }) heading = '';
  @Input() description = '';
  @Input() size: BooDialogSize = 'md';
  /** Status icon in the header (confirmations): `danger` for destructive actions, `warning` for irreversible ones. */
  @Input() tone: BooDialogTone = 'default';
  /** Header icon name; overrides the tone's default icon. */
  @Input() icon = '';
  /** Wraps body and footer in a `<form>`: Enter submits, and a `type="submit"` footer button fires `formSubmit`. */
  @Input() form = false;
  /** True while an action runs: the dialog cannot be dismissed. */
  @Input() busy = false;
  /** Shows the close button in the header. */
  @Input() closable = true;
  @Input() closeOnBackdrop = true;
  /** Use `alertdialog` semantics for a confirmation that interrupts the user's work. */
  @Input() alert = false;
  @Input() closeLabel = 'Close';
  /** Element to focus once the dialog closes. Defaults to the element that had focus when it opened. */
  @Input() returnFocus?: HTMLElement | null;
  @Output() dismiss = new EventEmitter<void>();
  @Output() formSubmit = new EventEmitter<void>();

  readonly headingId = `boo-dialog-${++nextId}-title`;
  readonly descriptionId = `boo-dialog-${nextId}-desc`;

  private readonly host: HTMLElement = inject(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private openedFrom: HTMLElement | null = null;
  private previousOverflow = '';

  get sizeClass(): string { return SIZE[this.size]; }
  get toneIcon(): string { return this.icon || (this.tone === 'default' ? '' : TONE[this.tone].icon); }
  get toneClass(): string { return this.tone === 'default' ? 'bg-primarySoft text-primary' : TONE[this.tone].ring; }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.openedFrom = this.document.activeElement instanceof HTMLElement ? this.document.activeElement : null;
    this.previousOverflow = this.document.body.style.overflow;
    this.document.body.style.overflow = 'hidden';
    setTimeout(() => this.focusInitial());
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    this.document.body.style.overflow = this.previousOverflow;
    const target = this.returnFocus ?? this.openedFrom;
    setTimeout(() => target?.focus());
  }

  requestDismiss(): void {
    if (!this.busy) this.dismiss.emit();
  }

  onBackdrop(event: MouseEvent): void {
    if (this.closeOnBackdrop && event.target === this.host) this.requestDismiss();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: Event): void {
    // Marks the key as handled so a panel behind the dialog (a drawer that also listens for Escape) stays open.
    event.preventDefault();
    this.requestDismiss();
  }

  /** Keeps Tab and Shift+Tab inside the dialog. */
  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;
    const items = Array.from(this.host.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(el => el.offsetParent !== null);
    if (!items.length) { event.preventDefault(); return; }
    const first = items[0], last = items[items.length - 1];
    const active = this.document.activeElement;
    if (event.shiftKey && (active === first || !this.host.contains(active))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && active === last) { event.preventDefault(); first.focus(); }
  }

  /** Focus the first field in the body; otherwise the first action; otherwise the dialog's own close button. */
  private focusInitial(): void {
    const body = this.host.querySelector<HTMLElement>('.overflow-y-auto');
    const target = body?.querySelector<HTMLElement>(FOCUSABLE) ?? this.host.querySelector<HTMLElement>('button[boo-dialog-footer], [boo-dialog-footer] button, [boo-dialog-footer]') ?? this.host.querySelector<HTMLElement>('button');
    target?.focus();
  }
}
