import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AnimationOptions } from 'ngx-lottie';
import { BooButtonComponent } from "../../../components/button/boo-button/boo-button.component";
import { BooIconComponent } from "../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../components/input/boo-input/boo-input.component";
import { LocalLoadingService } from '../../../services/common/local-loading.service';
import { SharedModule } from '../../../shared/shared-imports';
import { PagedResponse } from '../../../shared/types/common';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [
    SharedModule,
    BooInputComponent,
    BooButtonComponent,
    BooIconComponent
  ],
  templateUrl: './forgot.component.html'
})
export class ForgotComponent {
  // #region Inputs, Outputs, Properties
  form!: FormGroup;
  state: number = 1; // 1 = form, 2 = success message
  errorMessage: string = '';
  options: AnimationOptions = {
    path: '/assets/animations/happy.json'
  };
  // #endregion

  // #region Init (Lifecycle + Setup)
  constructor(
    public fb: FormBuilder,
    private http: HttpClient,
    protected loadingSrv: LocalLoadingService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }
  // #endregion

  // #region Methods
  handleForgot(): void {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.http.post<PagedResponse<string>>("/api/users/forgot-password", { ...this.form.value }).subscribe({
      next: (res) => {
        if (res.success) {
          this.state = 2;
        } else {
          this.errorMessage = 'Failed to send reset email. Please try again.';
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'An error occurred. Please try again later.';
        console.error('Forgot password error:', err);
      }
    })
  }
  // #endregion
}
