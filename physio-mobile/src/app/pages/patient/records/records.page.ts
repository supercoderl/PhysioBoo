import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { IonContent, IonHeader, IonLabel, IonSegment, IonSegmentButton, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { AuthService } from '../../../services/auth/auth.service';
import { StateMessageComponent } from '../components/state-message/state-message.component';
import { BillingTabComponent } from './billing-tab.component';
import { HistoryTabComponent } from './history-tab.component';
import { LabsTabComponent } from './labs-tab.component';
import { PrescriptionsTabComponent } from './prescriptions-tab.component';

type RecordsSegment = 'history' | 'prescriptions' | 'labs' | 'billing';

@Component({
    selector: 'app-records',
    standalone: true,
    imports: [
        CommonModule,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonSegment,
        IonSegmentButton,
        IonLabel,
        StateMessageComponent,
        HistoryTabComponent,
        PrescriptionsTabComponent,
        LabsTabComponent,
        BillingTabComponent
    ],
    templateUrl: './records.page.html',
    styleUrls: ['./records.page.scss']
})
export class RecordsPage {
    private readonly authSrv = inject(AuthService);

    readonly patientId = this.authSrv.getPatientId();

    segment = signal<RecordsSegment>('history');

    onSegmentChange(value: string): void {
        this.segment.set(value as RecordsSegment);
    }
}
