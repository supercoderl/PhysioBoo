import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { mailOutline } from 'ionicons/icons';
import { AuthService } from '../../../services/auth/auth.service';
import { ToastService } from '../../../services/common/toast.service';

@Component({
    selector: 'app-forgot-password',
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
    templateUrl: './forgot-password.page.html',
    styleUrl: './forgot-password.page.scss',
})
export class ForgotPasswordPage {
    private fb = inject(FormBuilder);
    private authSrv = inject(AuthService);
    private toastSrv = inject(ToastService);
    private router = inject(Router);

    submitted = false;
    isSubmitting = false;

    form = this.fb.group({
        identifier: ['', [Validators.required]],
    });

    constructor() {
        addIcons({ mailOutline });
    }

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const { identifier } = this.form.getRawValue();
        this.isSubmitting = true;
        this.authSrv.forgotPassword({ identifier: identifier! }).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.submitted = true;
                this.toastSrv.success('If an account exists, a reset link has been sent.');
            },
            error: () => {
                this.isSubmitting = false;
            },
        });
    }

    goToReset(): void {
        this.router.navigate(['/auth/reset-password']);
    }
}
