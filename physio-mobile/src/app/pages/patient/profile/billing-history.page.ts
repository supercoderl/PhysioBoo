import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
    IonBackButton,
    IonBadge,
    IonButtons,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonSkeletonText,
    IonTitle,
    IonToolbar
} from '@ionic/angular/standalone';
import { AuthService } from '../../../services/auth/auth.service';
import { MedicalRecordService } from '../../../services/domain/medical-record.service';
import { BillingSummary } from '../../../shared/types/medical-record.types';
import { StateMessageComponent } from '../components/state-message/state-message.component';

@Component({
    selector: 'app-billing-history',
    standalone: true,
    imports: [
        CommonModule,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButtons,
        IonBackButton,
        IonContent,
        IonCard,
        IonCardContent,
        IonList,
        IonItem,
        IonLabel,
        IonBadge,
        IonSkeletonText,
        StateMessageComponent
    ],
    templateUrl: './billing-history.page.html',
    styleUrls: ['./billing-history.page.scss']
})
export class BillingHistoryPage implements OnInit {
    private readonly authSrv = inject(AuthService);
    private readonly medicalRecordSrv = inject(MedicalRecordService);

    readonly patientId = this.authSrv.getPatientId();

    loading = signal(true);
    loadFailed = signal(false);
    summary = signal<BillingSummary | null>(null);

    ngOnInit(): void {
        if (!this.patientId) {
            this.loading.set(false);
            return;
        }
        this.medicalRecordSrv.getBilling(this.patientId).subscribe({
            next: (res) => {
                this.loading.set(false);
                if (res.success && res.data) {
                    this.summary.set(res.data);
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
}
