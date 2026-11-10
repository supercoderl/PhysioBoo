import { NgIf } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooDialogComponent } from '@physioboo/ui';

/**
 * The cashier dialogs' modal: an adapter from their `open` / `tone` inputs to the shared `boo-dialog`, which owns the
 * overlay, focus handling, Escape / backdrop close (blocked while `busy`) and the form wrapper.
 * Project the body as content and the buttons with the `dialogFooter` attribute.
 */
@Component({
    selector: 'cashier-dialog',
    standalone: true,
    imports: [NgIf, BooDialogComponent],
    template: `
    <boo-dialog
      *ngIf="open"
      size="lg"
      [heading]="heading"
      [description]="description"
      [icon]="icon"
      [tone]="tone === 'danger' ? 'danger' : 'default'"
      [busy]="busy"
      [form]="true"
      (formSubmit)="submitForm.emit()"
      (dismiss)="dismiss.emit()"
    >
      <div class="space-y-4"><ng-content></ng-content></div>
      <div boo-dialog-footer class="contents"><ng-content select="[dialogFooter]"></ng-content></div>
    </boo-dialog>
  `,
})
export class CashierDialogComponent {
    @Input() open = false;
    @Input({ required: true }) heading = '';
    @Input() description = '';
    @Input() icon = 'wallet';
    @Input() tone: 'primary' | 'danger' = 'primary';
    /** A request is in flight: the dialog cannot be dismissed. */
    @Input() busy = false;

    @Output() dismiss = new EventEmitter<void>();
    @Output() submitForm = new EventEmitter<void>();
}
