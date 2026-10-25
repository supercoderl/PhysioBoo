import { CanDeactivateFn } from "@angular/router";

/** A routed page that must not be left while it holds input that has not been saved. */
export interface HasUnsavedChanges {
    hasUnsavedChanges(): boolean;
    confirmLeave(): Promise<boolean>;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = component =>
    component.hasUnsavedChanges() ? component.confirmLeave() : true;
