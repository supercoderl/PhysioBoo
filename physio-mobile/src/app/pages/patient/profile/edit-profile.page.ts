import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonList,
    IonSkeletonText,
    IonTextarea,
    IonTitle,
    IonToolbar
} from '@ionic/angular/standalone';
import { AuthService } from '../../../services/auth/auth.service';
import { ToastService } from '../../../services/common/toast.service';
import { PatientService } from '../../../services/domain/patient.service';
import { StateMessageComponent } from '../components/state-message/state-message.component';

@Component({
    selector: 'app-edit-profile',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButtons,
        IonBackButton,
        IonContent,
        IonList,
        IonItem,
        IonInput,
        IonTextarea,
        IonButton,
        IonSkeletonText,
        StateMessageComponent
    ],
    templateUrl: './edit-profile.page.html',
    styleUrls: ['./edit-profile.page.scss']
})
export class EditProfilePage implements OnInit {
    private readonly authSrv = inject(AuthService);
    private readonly patientSrv = inject(PatientService);
    private readonly toastSrv = inject(ToastService);
    private readonly router = inject(Router);
    private readonly fb = inject(FormBuilder);

    readonly patientId = this.authSrv.getPatientId();

    loading = signal(true);
    loadFailed = signal(false);
    saving = signal(false);

    form = this.fb.group({
        inssuranceProvider: [''],
        inssurancePolicyNumber: [''],
        allergyInformation: [''],
        currentMedications: ['']
    });

    ngOnInit(): void {
        if (!this.patientId) {
            this.loading.set(false);
            return;
        }
        this.patientSrv.getById(this.patientId).subscribe({
            next: (res) => {
                this.loading.set(false);
                if (res.success && res.data) {
                    const p = res.data;
                    this.form.patchValue({
                        inssuranceProvider: p.inssuranceProvider ?? '',
                        inssurancePolicyNumber: p.inssurancePolicyNumber ?? '',
                        allergyInformation: p.allergyInformation ?? '',
                        currentMedications: p.currentMedications ?? ''
                    });
                } else {
                    this.loadFailed.set(true);
                }
            },
            error: () => {
                this.loading.set(false);
                this.loadFailed.set(true);
            }
        });
    }

    submit(): void {
        if (!this.patientId) return;

        this.saving.set(true);
        this.patientSrv.update(this.patientId, this.form.value).subscribe({
            next: (res) => {
                this.saving.set(false);
                if (res.success) {
                    this.toastSrv.success('Profile updated.');
                    this.router.navigateByUrl('/patient/profile');
                } else {
                    this.toastSrv.error('Could not save your changes right now. Please contact reception if this continues.');
                }
            },
            error: (err) => {
                this.saving.set(false);
                if (err?.status === 403) {
                    this.toastSrv.error('Updating your profile isn\'t available yet for patient accounts. Please contact reception.');
                }
            }
        });
    }
}
