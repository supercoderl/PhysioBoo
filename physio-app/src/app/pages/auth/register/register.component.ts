import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormWrapperComponent } from "../../../components/form/boo-form/boo-form.component";
import { SharedModule } from '../../../shared/shared-imports';
import { PagedResponse } from '../../../shared/types/common';
import { generateUUID } from '../../../shared/utils/common';
import { ToastService } from '../../../services/common/toast.service';
import { Role } from '../../../shared/enums/role';
import { BASE_API } from '../../../shared/api/base';
import { BooButtonComponent } from '../../../components/button/boo-button/boo-button.component';
import { LocalLoadingService } from '../../../services/common/local-loading.service';
import { BooInputComponent } from '../../../components/input/boo-input/boo-input.component';
import { BooIconComponent } from "../../../components/icon/boo-icon/boo-icon.component";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    SharedModule,
    FormWrapperComponent,
    BooButtonComponent,
    BooInputComponent,
    BooIconComponent
  ],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  // #region Inputs, Outputs, Properties
  form!: FormGroup;
  type: 'text' | 'password' = 'password';
  // #endregion

  // #region Init (Lifecycle + Setup)
  constructor(
    public fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private toastSrv: ToastService,
    protected loadingSrv: LocalLoadingService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  // #endregion

  // #region Methods
  register(): void {
    const body = {
      id: generateUUID(),
      ...this.form.value,
      role: Role.Patient
    }

    this.http.post<PagedResponse<string>>(BASE_API.REGISTER, body).subscribe({
      next: (res) => {
        if (res.success) {
          this.router.navigate(['/auth/verify-required']);
        }
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  onChangeType = () => {
    this.type = this.type === 'password' ? 'text' : 'password';
  }
  // #endregion
}
