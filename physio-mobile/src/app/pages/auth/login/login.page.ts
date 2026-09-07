import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonText,
    IonTitle,
    IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline, logInOutline } from 'ionicons/icons';
import { AuthService } from '../../../services/auth/auth.service';
import { LocalLoadingService } from '../../../services/common/local-loading.service';
import { ToastService } from '../../../services/common/toast.service';
import { Role } from '../../../shared/enums/role';
import { LoadingKeys } from '../../../shared/types/loading';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        IonContent,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButtons,
        IonBackButton,
        IonItem,
        IonLabel,
        IonInput,
        IonButton,
        IonIcon,
        IonText,
    ],
    templateUrl: './login.page.html',
    styleUrl: './login.page.scss',
})
export class LoginPage {
    private fb = inject(FormBuilder);
    private authSrv = inject(AuthService);
    private toastSrv = inject(ToastService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    protected loadingSrv = inject(LocalLoadingService);

    passwordVisible = false;
    isLoading = this.loadingSrv.getLoadingSignal(LoadingKeys.USER.LOGIN.CREDENTIAL);

    form = this.fb.group({
        identifier: ['', [Validators.required]],
        password: ['', [Validators.required]],
        otp: [''],
    });

    constructor() {
        addIcons({ eyeOutline, eyeOffOutline, logInOutline });
    }

    togglePassword(): void {
        this.passwordVisible = !this.passwordVisible;
    }

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const { identifier, password, otp } = this.form.getRawValue();
        this.authSrv
            .login({ identifier: identifier!, password: password!, otp: otp || undefined })
            .subscribe({
                next: (res) => {
                    const roles = res.data?.roles ?? [];
                    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
                    if (roles.includes(Role.PATIENT)) {
                        this.router.navigateByUrl(returnUrl || '/patient/home');
                    } else {
                        this.router.navigateByUrl('/unsupported-role');
                    }
                },
                error: (err) => {
                    console.error('Login error:', err);
                    if (err?.status === 401) {
                        const message = err?.error?.message || 'Invalid credentials. Please try again.';
                        this.toastSrv.error(message);
                    }
                },
            });
    }
}
