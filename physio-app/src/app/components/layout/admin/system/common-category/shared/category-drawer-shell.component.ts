import { NgIf } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { BooButtonComponent, BooErrorStateComponent, BooIconComponent, BooSpinnerComponent } from "@physioboo/ui";
import { environment } from "../../../../../../../environments/environment";
import { CustomScrollbarDirective } from "../../../../../../shared/directives/scrollbar.directive";
import { DrawerComponent } from "../../../../../drawer/drawer.component";
import { BooDevJsonFillerComponent } from "../../../../dev/json-input/boo-json-input.component";

let nextId = 0;

/**
 * Create/edit drawer frame for the Common Category catalogs: sticky header and footer, a scrolling form body,
 * the record's loading and load-error states, and Delete / Cancel / Save actions. The form fields are projected.
 * Leaving with unsaved changes asks first, from the backdrop, the close button, Cancel and Escape alike.
 */
@Component({
    selector: 'common-category-drawer-shell',
    standalone: true,
    imports: [NgIf, ReactiveFormsModule, DrawerComponent, BooButtonComponent, BooIconComponent, BooSpinnerComponent, BooErrorStateComponent, BooDevJsonFillerComponent, CustomScrollbarDirective],
    template: `
        <drawer [isOpen]="isOpen" [isShowDialog]="form.dirty && !saving" (close)="discard.emit()">
            <form
                *ngIf="isOpen"
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                [attr.aria-labelledby]="titleId"
                [attr.aria-busy]="loading || saving"
                [formGroup]="form"
                (ngSubmit)="save.emit()"
                novalidate
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <h2 [id]="titleId" class="m-0 text-lg font-semibold leading-tight text-regular break-words">{{ title }}</h2>
                        <p class="m-0 mt-0.5 text-xs text-secondary">{{ subtitle }} Fields marked <span class="text-danger">*</span> are required.</p>
                    </div>
                    <button type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" [attr.aria-label]="'Close ' + title" (click)="cancel.emit()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <div class="relative flex-1 min-h-0 overflow-y-auto" custom-scrollbar>
                    <div *ngIf="loading" class="absolute inset-0 z-10 flex items-center justify-center bg-surface/80" role="status">
                        <boo-spinner [size]="28" position="relative" mainColor="rgb(var(--twc-primary))" strokeColor="rgb(var(--twc-primary) / 0.2)" />
                        <span class="sr-only">Loading…</span>
                    </div>

                    <boo-error-state
                        *ngIf="loadFailed; else body"
                        [title]="'This record couldn’t be loaded'"
                        description="It may have been deleted, or the connection dropped."
                        (retry)="retry.emit()"
                    />

                    <ng-template #body>
                        <boo-json-editor *ngIf="showDevTools" [targetForms]="form" />
                        <ng-content></ng-content>
                    </ng-template>
                </div>

                <footer class="flex-none px-6 py-4 border-t border-rowDivider flex items-center justify-between gap-2">
                    <div>
                        <button
                            *ngIf="isEdit && canDelete && !loadFailed"
                            type="button"
                            boo-button
                            variant="ghost"
                            size="sm"
                            class="!text-danger"
                            [disabled]="saving || loading"
                            (click)="delete.emit()"
                        ><physio-icon name="trash" [size]="15" aria-hidden="true" />Delete</button>
                    </div>
                    <div class="flex items-center gap-2">
                        <button type="button" boo-button variant="secondary" size="sm" [disabled]="saving" (click)="cancel.emit()">Cancel</button>
                        <button
                            type="submit"
                            boo-button
                            variant="primary"
                            size="sm"
                            [loading]="saving"
                            [disabled]="loading || loadFailed || (isEdit && !form.dirty)"
                        >{{ submitLabel || (isEdit ? 'Save changes' : 'Create') }}</button>
                    </div>
                </footer>
            </form>
        </drawer>
    `
})
export class CommonCategoryDrawerShellComponent {
    @Input({ required: true }) form!: FormGroup;
    @Input() isOpen = false;
    @Input({ required: true }) title!: string;
    @Input() subtitle = '';
    @Input() isEdit = false;
    @Input() canDelete = false;
    @Input() loading = false;
    @Input() loadFailed = false;
    @Input() saving = false;
    /** Overrides the default "Create" / "Save changes" label of the submit button. */
    @Input() submitLabel = '';
    @Output() save = new EventEmitter<void>();
    /** Close requested from the header, Cancel or Escape; the owner confirms when there are unsaved changes. */
    @Output() cancel = new EventEmitter<void>();
    /** Close confirmed by the backdrop (it asks itself when the form is dirty). */
    @Output() discard = new EventEmitter<void>();
    @Output() delete = new EventEmitter<void>();
    @Output() retry = new EventEmitter<void>();

    readonly titleId = `category-drawer-title-${nextId++}`;
    /** The JSON auto-fill helper is for development builds only. */
    readonly showDevTools = !environment.PRODUCTION;
}
