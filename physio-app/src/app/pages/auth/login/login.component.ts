import { GoogleSigninButtonDirective, SocialAuthService } from '@abacritt/angularx-social-login';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { BooCheckboxComponent } from 'src/app/components/checkbox/boo-checkbox/boo-checkbox.component';
import { BooButtonComponent } from "../../../components/button/boo-button/boo-button.component";
import { FormWrapperComponent } from '../../../components/form/boo-form/boo-form.component';
import { BooIconComponent } from "../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../components/input/boo-input/boo-input.component";
import { AuthService } from '../../../services/auth/auth.service';
import { LocalLoadingService } from '../../../services/common/local-loading.service';
import { ToastService } from '../../../services/common/toast.service';
import { Role } from '../../../shared/enums/role';
import { SharedModule } from '../../../shared/shared-imports';
import { LoadingKeys } from '../../../shared/types/loading';
import { AppValidators } from '../../../shared/validator/validator-config.validator';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    SharedModule,
    BooInputComponent,
    BooIconComponent,
    BooButtonComponent,
    BooCheckboxComponent,
    FormWrapperComponent,
    GoogleSigninButtonDirective
  ],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit, OnDestroy {
  // #region Inputs, Outputs, Properties
  state: string = "email";
  form!: FormGroup;
  type: 'text' | 'password' = 'password';
  isFirstTime: boolean = true;
  countdown: number = 0;
  private timer: any;
  LoadingKeys = LoadingKeys;
  // #endregion

  // #region Init (Lifecycle + Setup)
  constructor(
    protected loadingSrv: LocalLoadingService,
    private fb: FormBuilder,
    private router: Router,
    private authSrv: AuthService,
    private oauthSrc: SocialAuthService,
    private toastSrv: ToastService
  ) {
    this.form = this.fb.group({
      identifier: ['lixopo2881@idwager.com', [Validators.required, AppValidators.emailOrMobile]],
      password: ['Password123!', [Validators.required]],
      otp: ['']
    })
  }

  ngOnInit(): void {
    this.oauthSrc.authState.subscribe((user) => {
      if (user && user.idToken && user.provider) {
        this.authSrv.oauthLogin(
          user.idToken,
          user.provider.toLocaleLowerCase()
        ).subscribe({
          next: _ => {
            this.loadingSrv.clear(LoadingKeys.USER.LOGIN.OAUTH.GOOGLE);
            this.redirectByRole();
          }
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
  // #endregion

  // #region Methods
  login = (data: { identifier: string, password: string, otp: string }) => {
    if (this.state == 'phone' && data.otp != '123456') {
      this.toastSrv.error("OTP does not correct.");
      return;
    }

    this.authSrv.login(data).subscribe({
      next: _ => {
        this.loadingSrv.clear(LoadingKeys.USER.LOGIN.CREDENTIAL);
        this.redirectByRole();
      },
    })
  }

  private redirectByRole() {
    this.authSrv.userInfo$.pipe(take(1)).subscribe(user => {
      const roles = user?.roles ?? [];
      if (roles.includes(Role[Role.SUPER_ADMIN])) {
        this.router.navigate(['/superadmin']);
      } else if (roles.some(r => r !== Role[Role.PATIENT])) {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  onChangeState = (newState: string) => {
    this.form.setValue({
      ...this.form.value,
      identifier: newState === "phone"
        ? '+14897221980'
        : 'lixopo2881@idwager.com'
    });
    this.state = newState;
  }

  onChangeType = () => {
    this.type = this.type === 'password' ? 'text' : 'password';
  }

  onSendOtp() {
    if (this.countdown > 0) return;

    const phone = this.form.get('identifier')?.value;
    if (!phone) {
      this.toastSrv.error("Please input your phone number first.");
      return;
    }

    this.toastSrv.success('An OTP has been sent.');
    this.startCountdown();
    this.isFirstTime = false;
  }

  startCountdown() {
    this.countdown = 60;
    this.timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.timer);
      }
    }, 1000);
  }
  // #endregion
}
