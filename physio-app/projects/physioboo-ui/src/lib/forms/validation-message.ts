import { AbstractControl } from '@angular/forms';

/**
 * Returns the message to show under a form control, or `null` while it is valid or still untouched.
 * `label` names the field in the message because the boo-* controls use the label as their placeholder.
 */
export function booValidationMessage(control: AbstractControl | null | undefined, label: string): string | null {
    if (!control || !control.invalid || !(control.touched || control.dirty)) return null;

    const errors = control.errors ?? {};
    const name = label || 'This field';

    if (errors['required']) return `${name} is required`;
    if (errors['email']) return 'Enter a valid email address';
    if (errors['minlength']) return `${name} must be at least ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `${name} must be at most ${errors['maxlength'].requiredLength} characters`;
    return `${name} is invalid`;
}
