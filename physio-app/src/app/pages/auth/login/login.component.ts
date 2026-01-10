import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { BooButtonComponent } from "../../../components/button/boo-button/boo-button.component";
import { FormWrapperComponent } from '../../../components/form/boo-form/boo-form.component';
import { BooIconComponent } from "../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../components/input/boo-input/boo-input.component";
import { LocalLoadingService } from '../../../services/common/local-loading.service';
import { ToastService } from '../../../services/common/toast.service';
import { SharedModule } from '../../../shared/shared-imports';
import { AuthService } from '../../../services/auth/auth.service';
import { USER_ERROR_CODES } from '../../../shared/errors/code.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    SharedModule,
    BooInputComponent,
    BooIconComponent,
    BooButtonComponent,
    FormWrapperComponent
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  // #region Inputs, Outputs, Properties
  state: string = "email";
  form!: FormGroup;
  type: 'text' | 'password' = 'password';
  // #endregion

  // #region Init (Lifecycle + Setup)
  constructor(
    protected loadingSrv: LocalLoadingService,
    private fb: FormBuilder,
    private router: Router,
    private toastSrv: ToastService,
    private authSrv: AuthService
  ) {
    this.form = this.fb.group({
      email: ['lixopo2881@idwager.com', [Validators.required, Validators.email]],
      password: ['Password123!', [Validators.required]]
    })
  }
  // #endregion

  // #region Methods
  login = (data: { email: string, password: string }) => {
    this.authSrv.login(data).subscribe({
      next: _ => {
        this.router.navigate(['/admin']);
        this.loadingSrv.clear('login');
        // this.form.reset();
      },
      error: err => {
        const apiError = err?.error;

        if (apiError?.detailedErrors?.length) {
          const isUnactiveUser = apiError.detailedErrors.some(
            (x: { code: string }) => USER_ERROR_CODES.includes(x.code)
          );

          if (isUnactiveUser) {
            this.router.navigate(['auth', 'verify-required']);
            return;
          }

          this.toastSrv.error(apiError.message ?? 'Có lỗi xảy ra');
          return;
        }
        this.toastSrv.error(err.message);
      }
    })
  }

  onChangeState = (newState: string) => {
    this.state = newState;
  }

  onChangeType = () => {
    this.type = this.type === 'password' ? 'text' : 'password';
  }
  // #endregion
}
