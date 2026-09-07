import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, inject, signal } from '@angular/core';
import { IonBadge, IonCard, IonCardContent, IonItem, IonLabel, IonList, IonSkeletonText } from '@ionic/angular/standalone';
import { MedicalRecordService } from '../../../services/domain/medical-record.service';
import { BillingSummary } from '../../../shared/types/medical-record.types';
import { StateMessageComponent } from '../components/state-message/state-message.component';

@Component({
    selector: 'app-billing-tab',
    standalone: true,
    imports: [CommonModule, IonCard, IonCardContent, IonList, IonItem, IonLabel, IonBadge, IonSkeletonText, StateMessageComponent],
    templateUrl: './billing-tab.component.html',
    styleUrls: ['./records-tabs.scss']
})
export class BillingTabComponent implements OnChanges {
    @Input({ required: true }) patientId!: string;

    private readonly medicalRecordSrv = inject(MedicalRecordService);

    loading = signal(true);
    loadFailed = signal(false);
    summary = signal<BillingSummary | null>(null);

    ngOnChanges(): void {
        if (!this.patientId) return;
        this.loading.set(true);
        this.loadFailed.set(false);
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
