import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BooButtonComponent } from "../../../components/button/boo-button/boo-button.component";
import { FormWrapperComponent } from "../../../components/form/boo-form/boo-form.component";
import { BooIconComponent } from "../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../components/input/boo-input/boo-input.component";
import { LocalLoadingService } from '../../../services/common/local-loading.service';
import { SharedModule } from '../../../shared/shared-imports';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    BooIconComponent,
    BooButtonComponent,
    BooInputComponent,
    SharedModule,
    FormWrapperComponent
],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent {
  // #region Inputs, Outputs, Properties
  form!: FormGroup;
  passwordType: 'text' | 'password' = 'password';
  confirmPasswordType: 'text' | 'password' = 'password';
  token: string = '';
  errorMessage: string = '';
  // #endregion

  // #region Init (Lifecycle + Setup)
  constructor(
    public fb: FormBuilder,
    private http: HttpClient,
    protected loadingSrv: LocalLoadingService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    });

    // Get token from route params or query params
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
    });
  }
  // #endregion

  // #region Methods
  resetPassword = (data: unknown) => {
    console.log(data);
    // const payload = {
    //   token: this.token,
    //   newPassword: this.form.value.newPassword
    // };

    // this.http.post<PagedResponse<string>>("/api/users/reset-password", payload).subscribe({
    //   next: (res) => {
    //     if (res.success) {
    //       this.router.navigate(['/auth/login']);
    //     }
    //   },
    //   error: (err) => {
    //     this.errorMessage = err.error?.message || 'Failed to reset password';
    //     console.log(err);
    //   }
    // });
  }

  onChangePasswordType = () => {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  onChangeConfirmPasswordType = () => {
    this.confirmPasswordType = this.confirmPasswordType === 'password' ? 'text' : 'password';
  }
  // #endregion
}
