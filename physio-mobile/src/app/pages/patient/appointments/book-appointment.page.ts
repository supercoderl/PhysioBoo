import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonDatetime,
    IonDatetimeButton,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonModal,
    IonSelect,
    IonSelectOption,
    IonSkeletonText,
    IonTextarea,
    IonTitle,
    IonToolbar
} from '@ionic/angular/standalone';
import { AuthService } from '../../../services/auth/auth.service';
import { ToastService } from '../../../services/common/toast.service';
import { AppointmentService } from '../../../services/domain/appointment.service';
import { DoctorService } from '../../../services/domain/doctor.service';
import { Doctor } from '../../../shared/types/doctor.types';
import { StateMessageComponent } from '../components/state-message/state-message.component';

@Component({
    selector: 'app-book-appointment',
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
        IonLabel,
        IonSelect,
        IonSelectOption,
        IonDatetime,
        IonDatetimeButton,
        IonModal,
        IonTextarea,
        IonButton,
        IonSkeletonText,
        StateMessageComponent
    ],
    templateUrl: './book-appointment.page.html',
    styleUrls: ['./book-appointment.page.scss']
})
export class BookAppointmentPage implements OnInit {
    private readonly authSrv = inject(AuthService);
    private readonly doctorSrv = inject(DoctorService);
    private readonly appointmentSrv = inject(AppointmentService);
    private readonly toastSrv = inject(ToastService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly fb = inject(FormBuilder);

    readonly patientId = this.authSrv.getPatientId();
    readonly minDate = new Date().toISOString();

    doctorsLoading = signal(true);
    doctorsLoadFailed = signal(false);
    doctors = signal<Doctor[]>([]);

    submitting = signal(false);

    form = this.fb.group({
        doctorId: ['', Validators.required],
        scheduledDateTime: ['', Validators.required],
        chiefComplaint: ['']
    });

    ngOnInit(): void {
        if (this.patientId) {
            this.loadDoctors();
        }

        // Deep-linked from a doctor's detail page (Guest/Patient "Book an appointment" button) — pre-fill the pick.
        const doctorId = this.route.snapshot.queryParamMap.get('doctorId');
        if (doctorId) {
            this.form.patchValue({ doctorId });
        }
    }

    loadDoctors(): void {
        this.doctorsLoading.set(true);
        this.doctorsLoadFailed.set(false);
        this.doctorSrv.search({ pageNumber: 1, pageSize: 100, filter: {} }).subscribe({
            next: (res) => {
                this.doctorsLoading.set(false);
                if (res.success && res.data) {
                    this.doctors.set(res.data.items ?? []);
                } else {
                    this.doctorsLoadFailed.set(true);
                }
            },
            error: () => {
                this.doctorsLoading.set(false);
                this.doctorsLoadFailed.set(true);
            }
        });
    }

    submit(): void {
        if (!this.patientId || this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const { doctorId, scheduledDateTime, chiefComplaint } = this.form.value;
        const dt = new Date(scheduledDateTime as string);
        const scheduledDate = dt.toISOString().slice(0, 10);
        const scheduledTime = dt.toTimeString().slice(0, 5);

        this.submitting.set(true);
        this.appointmentSrv
            .create({
                patientId: this.patientId,
                doctorId: doctorId as string,
                scheduledDate,
                scheduledTime,
                chiefComplaint: chiefComplaint || null
            })
            .subscribe({
                next: (res) => {
                    this.submitting.set(false);
                    if (res.success) {
                        this.toastSrv.success('Appointment request submitted.');
                        this.router.navigateByUrl('/patient/appointments');
                    } else {
                        this.toastSrv.error('Could not book the appointment. Please try again or contact reception.');
                    }
                },
                error: (err) => {
                    this.submitting.set(false);
                    // The auth interceptor already shows a toast for most HTTP errors (see
                    // auth.interceptor.ts) except 403 — surface the documented permission-gap
                    // message ourselves in that case so the user isn't left with silence.
                    if (err?.status === 403) {
                        this.toastSrv.error('Booking isn\'t available yet for patient accounts. Please contact reception to schedule your appointment.');
                    }
                }
            });
    }
}
