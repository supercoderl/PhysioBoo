import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, inject, signal } from '@angular/core';
import { IonCard, IonCardContent, IonItem, IonLabel, IonList, IonSkeletonText } from '@ionic/angular/standalone';
import { MedicalRecordService } from '../../../services/domain/medical-record.service';
import { HistoricalSummary } from '../../../shared/types/medical-record.types';
import { StateMessageComponent } from '../components/state-message/state-message.component';

@Component({
    selector: 'app-history-tab',
    standalone: true,
    imports: [CommonModule, IonCard, IonCardContent, IonList, IonItem, IonLabel, IonSkeletonText, StateMessageComponent],
    templateUrl: './history-tab.component.html'
})
export class HistoryTabComponent implements OnChanges {
    @Input({ required: true }) patientId!: string;

    private readonly medicalRecordSrv = inject(MedicalRecordService);

    loading = signal(true);
    loadFailed = signal(false);
    history = signal<HistoricalSummary | null>(null);

    ngOnChanges(): void {
        if (!this.patientId) return;
        this.loading.set(true);
        this.loadFailed.set(false);
        this.medicalRecordSrv.getHistory(this.patientId).subscribe({
            next: (res) => {
                this.loading.set(false);
                if (res.success && res.data) {
                    this.history.set(res.data);
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

    get hasAnyField(): boolean {
        const h = this.history();
        if (!h) return false;
        return !!(h.pastMedicalHistory || h.familyHistory || h.socialHistory || h.reviewOfSystems);
    }
}
