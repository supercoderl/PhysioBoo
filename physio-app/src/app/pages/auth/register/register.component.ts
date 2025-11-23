import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormWrapperComponent } from "../../../components/form/boo-form/boo-form.component";
import { SharedModule } from '../../../shared/shared-imports';
import { PagedResponse } from '../../../shared/types/common';
import { generateUUID } from '../../../shared/utils/common';
import { RegisterProgressBarComponent } from "./progress-bar.component";
import { RegisterStepOneComponent } from "./step1.component";
import { RegisterStepTwoComponent } from "./step2.component";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    SharedModule,
    RegisterProgressBarComponent,
    RegisterStepTwoComponent,
    RegisterStepOneComponent,
    FormWrapperComponent
],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  // #region Inputs, Outputs, Properties
  stepCount: number = 2;
  currentStep: number = 1;
  selectedRoleId: string = '';
  form!: FormGroup;
  // #endregion

  // #region Init (Lifecycle + Setup)
  constructor(
    public fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  // #endregion

  // #region Events
  nextStep() {
    if (this.currentStep < this.stepCount) {
      this.currentStep++;
    }
  }
  
  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onRoleSelected(id: string) {
    this.selectedRoleId = id;
  }

  handleRegistration(): void {
    const body = {
      id: generateUUID(),
      ...this.form.value, 
      roleId: this.selectedRoleId
    }

    this.http.post<PagedResponse<string>>("/api/users/register", body).subscribe({
      next: (res) => {
        if(res.success) {
          this.router.navigate(['/admin/verify-required']);
        }
      },
      error: (err) => {
        console.log(err);
      }
    })
  }
  // #endregion
}
