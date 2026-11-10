import { InjectionToken } from '@angular/core';

/**
 * Provided by `boo-form-field`. A boo-* control that finds it knows the surrounding field owns the validation message
 * and skips its own error paragraph; outside a field the control renders the message itself, as before.
 */
export const BOO_FORM_FIELD = new InjectionToken<unknown>('BOO_FORM_FIELD');
