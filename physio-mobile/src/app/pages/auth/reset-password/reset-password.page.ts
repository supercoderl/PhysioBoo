import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
import { eyeOutline, eyeOffOutline, keyOutline } from 'ionicons/icons';
import { AuthService } from '../../../services/auth/auth.service';
import { ToastService } from '../../../services/common/toast.service';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (!password || !confirmPassword) return null;
    return password === confirmPassword ? null : { passwordsMismatch: true };
}

@Component({
    selector: 'app-reset-password',
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
    templateUrl: './reset-password.page.html',
    styleUrl: './reset-password.page.scss',
})
export class ResetPasswordPage implements OnInit {
    private fb = inject(FormBuilder);
    private authSrv = inject(AuthService);
    private toastSrv = inject(ToastService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    passwordVisible = false;
    confirmPasswordVisible = false;
    isSubmitting = false;

    form = this.fb.group(
        {
            token: ['', [Validators.required]],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]],
        },
        { validators: passwordsMatchValidator }
    );

    constructor() {
        addIcons({ eyeOutline, eyeOffOutline, keyOutline });
    }

    ngOnInit(): void {
        const tokenFromUrl = this.route.snapshot.queryParamMap.get('token');
        if (tokenFromUrl) {
            this.form.patchValue({ token: tokenFromUrl });
        }
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

        const { token, newPassword } = this.form.getRawValue();
        this.isSubmitting = true;
        this.authSrv.resetPassword({ token: token!, newPassword: newPassword! }).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.toastSrv.success('Your password has been reset. Please log in.');
                this.router.navigate(['/auth/login']);
            },
            error: () => {
                this.isSubmitting = false;
            },
        });
    }
}
