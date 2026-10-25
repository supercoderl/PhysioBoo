import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";

let nextDialogId = 0;

/**
 * Modal shell shared by the cashier dialogs: overlay, heading, scrolling body, footer slot,
 * Escape / backdrop close (blocked while `busy`), initial focus and focus return to the opener.
 * Project the body as content and the buttons with the `dialogFooter` attribute.
 */
@Component({
    selector: 'cashier-dialog',
    standalone: true,
    imports: [SharedModule],
    template: `
    <div *ngIf="open" class="fixed inset-0 z-[10001] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40" aria-hidden="true" (click)="requestClose()"></div>

      <form
        ngNoForm
        #panel
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        [attr.aria-labelledby]="titleId"
        [attr.aria-busy]="busy ? 'true' : null"
        (submit)="$event.preventDefault(); submitForm.emit()"
        (keydown.escape)="requestClose()"
        novalidate
        class="relative bg-surface rounded-xl shadow-2xl w-full max-w-lg max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden border border-gray-100 outline-none"
      >
        <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-start gap-4">
          <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" [ngClass]="tone === 'danger' ? 'bg-rose-50' : 'bg-primary/10'">
            <physio-icon [name]="icon" [size]="20" [class]="tone === 'danger' ? 'text-rose-600' : 'text-primary'"></physio-icon>
          </div>
          <div class="min-w-0">
            <h3 [id]="titleId" class="text-lg font-semibold text-gray-900 m-0">{{ heading }}</h3>
            <p *ngIf="description" class="text-sm text-secondary mt-1 mb-0 leading-relaxed">{{ description }}</p>
          </div>
        </div>

        <div class="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4" custom-scrollbar>
          <ng-content></ng-content>
        </div>

        <div class="flex-none px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
          <ng-content select="[dialogFooter]"></ng-content>
        </div>
      </form>
    </div>
  `,
})
export class CashierDialogComponent implements OnChanges {
    @Input() open = false;
    @Input({ required: true }) heading = '';
    @Input() description = '';
    @Input() icon = 'wallet';
    @Input() tone: 'primary' | 'danger' = 'primary';
    /** A request is in flight: the dialog cannot be dismissed. */
    @Input() busy = false;

    @Output() dismiss = new EventEmitter<void>();
    @Output() submitForm = new EventEmitter<void>();

    readonly titleId = `cashier-dialog-title-${nextDialogId++}`;

    private opener: HTMLElement | null = null;

    @ViewChild('panel') set panel(el: ElementRef<HTMLElement> | undefined) {
        el?.nativeElement.focus();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes['open']) return;
        if (this.open) {
            this.opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        } else {
            this.opener?.focus();
            this.opener = null;
        }
    }

    requestClose(): void {
        if (!this.busy) this.dismiss.emit();
    }
}
