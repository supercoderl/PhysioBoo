import { HttpClient } from '@angular/common/http';
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
import { PagedResponse } from '../../../shared/types/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    LucideAngularModule,
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
    private fb: FormBuilder,
    private http: HttpClient,
    protected loadingSrv: LocalLoadingService,
    private router: Router,
    private toastSrv: ToastService
  ) {
    this.form = fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    })
  }
  // #endregion

  // #region Methods
  login = (data: { email: string, password: string }) => {
    this.http.post<PagedResponse<string>>("/api/users/login", data).subscribe({
      next: (res) => {
        if (res.success) {
          this.router.navigate(['/admin'])
        }
      },
      error: (err) => {
        this.toastSrv.error(err?.message ?? "An error occurred");
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
