import { AbstractControl, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { NzSafeAny } from "ng-zorro-antd/core/types";

export type ErrorsOptions = { 'zh-cn': string; 'en-us': string } & Record<string, NzSafeAny>;
export type ValidationErrors = Record<string, ErrorsOptions>;

export class AppValidators extends Validators {
    static override minLength(minLength: number): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (Validators.minLength(minLength)(control) === null) {
                return null;
            }
            return { minlength: { 'zh-cn': `最小长度为 ${minLength}`, 'en-us': `Minimum length is ${minLength}` } };
        };
    }

    static override maxLength(maxLength: number): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (Validators.maxLength(maxLength)(control) === null) {
                return null;
            }
            return { maxlength: { 'zh-cn': `最大长度为 ${maxLength}`, 'en-us': `Maximum length is ${maxLength}` } };
        };
    }

    static mobile(control: AbstractControl): ValidationErrors | null {
        const value = control.value;

        if (isEmptyInputValue(value)) {
            return null;
        }

        return isMobile(value)
            ? null
            : { mobile: { 'zh-cn': `手机号码格式不正确`, 'en-us': `Mobile phone number is not valid` } };
    }

    static confirm(fb: UntypedFormGroup, control: UntypedFormControl): { [s: string]: boolean } {
        return confirmValidator(fb, control);
    }
}

function isEmptyInputValue(value: NzSafeAny): boolean {
    return value == null || value.length === 0;
}

function isMobile(value: string): boolean {
    return typeof value === 'string' && /(^1\d{10}$)/.test(value);
}

function confirmValidator(fb: UntypedFormGroup, control: UntypedFormControl): { [s: string]: boolean } {
    if (!control.value) {
        return { error: true, required: true };
    } else if (control.value !== fb.controls["password"].value) {
        return { confirm: true, error: true };
    }
    return {};
};
