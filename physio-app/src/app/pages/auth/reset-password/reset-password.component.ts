import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BooButtonComponent } from "../../../components/button/boo-button/boo-button.component";
import { FormWrapperComponent } from "../../../components/form/boo-form/boo-form.component";
import { BooInputComponent } from "../../../components/input/boo-input/boo-input.component";
import { AuthService } from '../../../services/auth/auth.service';
import { LocalLoadingService } from '../../../services/common/local-loading.service';
import { SharedModule } from '../../../shared/shared-imports';
import { LoadingKeys } from '../../../shared/types/loading';

/** Same rule as the backend `Password()` validator: 8–50 chars, upper, lower, digit and symbol. */
function strongPassword(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  if (!value) return null;
  const ok = value.length >= 8 && value.length <= 50
    && /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value) && /[^a-zA-Z0-9]/.test(value);
  return ok ? null : { weakPassword: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    BooButtonComponent,
    BooInputComponent,
    SharedModule,
    FormWrapperComponent
  ],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  // #region Inputs, Outputs, Properties
  form!: FormGroup;
  passwordType: 'text' | 'password' = 'password';
  confirmPasswordType: 'text' | 'password' = 'password';
  token: string = '';
  state: 'form' | 'success' | 'invalid-link' = 'form';
  errorMessage: string = '';
  LoadingKeys = LoadingKeys;
  readonly passwordMessages = {
    weakPassword: 'Use 8–50 characters with upper and lower case letters, a number and a symbol.'
  };
  readonly confirmMessages = {
    passwordMismatch: 'Passwords do not match.'
  };
  // #endregion

  // #region Init (Lifecycle + Setup)
  constructor(
    public fb: FormBuilder,
    protected loadingSrv: LocalLoadingService,
    private authSrv: AuthService,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, strongPassword]],
      confirmPassword: ['', [Validators.required, this.matchesNewPassword]]
    });

    // Re-check the confirmation when the password above it changes.
    this.form.get('newPassword')!.valueChanges.subscribe(() => {
      this.form.get('confirmPassword')!.updateValueAndValidity({ emitEvent: false });
    });
  }

  ngOnInit(): void {
    // The emailed link goes through /api/users/verify-email, which redirects here with ?token=…
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) this.state = 'invalid-link';
  }
  // #endregion

  // #region Methods
  resetPassword = () => {
    if (this.loadingSrv.isLoading(LoadingKeys.USER.RESET_PASSWORD) || !this.token) return;
    this.errorMessage = '';

    this.authSrv.resetPassword(this.token, this.form.value.newPassword).subscribe({
      next: () => this.state = 'success',
      error: (err: HttpErrorResponse) => {
        this.errorMessage = this.describeError(err);
      }
    });
  }

  onChangePasswordType = () => {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  onChangeConfirmPasswordType = () => {
    this.confirmPasswordType = this.confirmPasswordType === 'password' ? 'text' : 'password';
  }

  private matchesNewPassword = (control: AbstractControl): ValidationErrors | null => {
    const password = control.parent?.get('newPassword')?.value;
    return control.value && password !== control.value ? { passwordMismatch: true } : null;
  }

  /** Backend validation messages are safe to show; anything else gets a generic message. */
  private describeError(err: HttpErrorResponse): string {
    if (err.status === 404) {
      return 'This reset link is invalid or has already been used. Request a new one.';
    }
    if (err.status === 400) {
      const first = err.error?.errors?.[0] ?? err.error?.message;
      if (typeof first === 'string' && first) return first;
      return 'Your new password does not meet the requirements.';
    }
    return 'We could not reset your password. Please try again later.';
  }
  // #endregion
}
