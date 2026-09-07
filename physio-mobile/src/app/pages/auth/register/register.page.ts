import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
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
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, personAddOutline } from 'ionicons/icons';
import { AuthService } from '../../../services/auth/auth.service';
import { ToastService } from '../../../services/common/toast.service';
import { LocalLoadingService } from '../../../services/common/local-loading.service';
import { LoadingKeys } from '../../../shared/types/loading';
import { Role } from '../../../shared/enums/role';

/**
 * Registration posts the same DTO shape the web app sends to /api/users/register
 * (role, email, phone, password — see CreateUserViewModel on the backend and
 * physio-app/src/app/pages/auth/register/register.component.ts). The mobile app registers
 * as PATIENT (the backend's one publicly self-registerable role) rather than web's DOCTOR,
 * since this is the patient self-service journey (see mobile-app-redesign.md §4).
 * confirmPassword is a client-side-only field, never sent to the API.
 */
function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (!password || !confirmPassword) return null;
    return password === confirmPassword ? null : { passwordsMismatch: true };
}

@Component({
    selector: 'app-register',
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
    templateUrl: './register.page.html',
    styleUrl: './register.page.scss',
})
export class RegisterPage {
    private fb = inject(FormBuilder);
    private authSrv = inject(AuthService);
    private toastSrv = inject(ToastService);
    private router = inject(Router);
    protected loadingSrv = inject(LocalLoadingService);

    passwordVisible = false;
    confirmPasswordVisible = false;
    isLoading = this.loadingSrv.getLoadingSignal(LoadingKeys.USER.REGISTER);

    form = this.fb.group(
        {
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]],
        },
        { validators: passwordsMatchValidator }
    );

    constructor() {
        addIcons({ eyeOutline, eyeOffOutline, personAddOutline });
    }

    togglePassword(): void {
        this.passwordVisible = !this.passwordVisible;
    }

    toggleConfirmPassword(): void {
        this.confirmPasswordVisible = !this.confirmPasswordVisible;
    }

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const { email, phone, password } = this.form.getRawValue();
        const body = {
            role: Role.PATIENT,
            email,
            phone,
            password,
        };

        // The global HTTP interceptor already shows an error toast for any failed request
        // (except a login-specific 401 case, which doesn't apply here), so no extra error
        // handling is needed on this subscription beyond the happy path.
        this.authSrv.register(body).subscribe({
            next: (res) => {
                if (res.success) {
                    this.toastSrv.success('Account created. Please log in.');
                    this.router.navigate(['/auth/login']);
                }
            },
        });
    }
}
