import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { BooButtonComponent } from "../../../components/button/boo-button/boo-button.component";
import { BooIconComponent } from "../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../components/input/boo-input/boo-input.component";
import { LocalLoadingService } from '../../../services/common/local-loading.service';
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
    BooButtonComponent
],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  // #region Inputs, Outputs, Properties
  state: string = "email";
  form = {
    email: '',
    password: ''
  }
  type: 'text' | 'password' = 'password';
  // #endregion

  // #region Init (Lifecycle + Setup)
  constructor(
    private http: HttpClient,
    protected loadingSrv: LocalLoadingService,
    private router: Router
  ) {}
  // #endregion

  // #region Events
  login = () => {
    this.http.post<PagedResponse<string>>("/api/users/login", this.form).subscribe({
      next: (res) => {
        if(res.success) {
          this.router.navigate(['/admin'])
        }
      },
      error: (err) => {
        console.log(err);
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
