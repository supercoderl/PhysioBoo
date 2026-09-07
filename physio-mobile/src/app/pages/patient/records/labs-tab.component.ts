import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, inject, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IonBadge, IonCard, IonCardContent, IonItem, IonLabel, IonList, IonSkeletonText } from '@ionic/angular/standalone';
import { MedicalRecordService } from '../../../services/domain/medical-record.service';
import { ImagingStudyRow, LabReportRow, LabResultRow } from '../../../shared/types/medical-record.types';
import { StateMessageComponent } from '../components/state-message/state-message.component';

@Component({
    selector: 'app-labs-tab',
    standalone: true,
    imports: [CommonModule, IonCard, IonCardContent, IonList, IonItem, IonLabel, IonBadge, IonSkeletonText, StateMessageComponent],
    templateUrl: './labs-tab.component.html',
    styleUrls: ['./records-tabs.scss']
})
export class LabsTabComponent implements OnChanges {
    @Input({ required: true }) patientId!: string;

    private readonly medicalRecordSrv = inject(MedicalRecordService);

    loading = signal(true);
    loadFailed = signal(false);
    labResults = signal<LabResultRow[]>([]);
    labReports = signal<LabReportRow[]>([]);
    imagingStudies = signal<ImagingStudyRow[]>([]);

    get hasAny(): boolean {
        return this.labResults().length > 0 || this.labReports().length > 0 || this.imagingStudies().length > 0;
    }

    ngOnChanges(): void {
        if (!this.patientId) return;
        this.loading.set(true);
        this.loadFailed.set(false);

        forkJoin({
            lab: this.medicalRecordSrv.getLab(this.patientId).pipe(catchError(() => of(null))),
            imaging: this.medicalRecordSrv.getImaging(this.patientId).pipe(catchError(() => of(null)))
        }).subscribe(({ lab, imaging }) => {
            this.loading.set(false);

            const labOk = !!lab && lab.success && !!lab.data;
            const imagingOk = !!imaging && imaging.success && !!imaging.data;

            if (!labOk && !imagingOk) {
                this.loadFailed.set(true);
                return;
            }

            this.labResults.set(labOk ? lab!.data.results ?? [] : []);
            this.labReports.set(labOk ? lab!.data.reports ?? [] : []);
            this.imagingStudies.set(imagingOk ? imaging!.data ?? [] : []);
        });
    }
}
