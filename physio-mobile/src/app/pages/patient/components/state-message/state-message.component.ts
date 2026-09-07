/**
 * Small reusable presentational block for the empty / permission-gap / error states every
 * Patient data screen needs (see docs/mobile-app-redesign.md §1/§8/§9 — patient-data endpoints
 * are staff-permission gated today, so a 403 is expected and must render as a clear
 * "not available yet" message, never a generic error or a blank screen).
 *
 * Lives under pages/patient/ (not shared/) because shared/ is frozen for this batch of work;
 * this is scoped to the Patient tab only.
 */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonButton, IonIcon, IonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircleOutline, cloudOfflineOutline, informationCircleOutline } from 'ionicons/icons';

export type StateMessageVariant = 'empty' | 'permission' | 'error';

@Component({
    selector: 'app-state-message',
    standalone: true,
    imports: [CommonModule, IonIcon, IonText, IonButton],
    templateUrl: './state-message.component.html',
    styleUrls: ['./state-message.component.scss']
})
export class StateMessageComponent {
    /** 'empty' = genuinely no data yet; 'permission' = request failed/403 (the documented backend gap); 'error' = unexpected/network error. */
    @Input() variant: StateMessageVariant = 'empty';
    @Input() icon = 'information-circle-outline';
    @Input() title = '';
    @Input() message = '';
    @Input() actionLabel?: string;
    @Output() action = new EventEmitter<void>();

    constructor() {
        addIcons({ alertCircleOutline, cloudOfflineOutline, informationCircleOutline });
    }

    get resolvedIcon(): string {
        if (this.icon !== 'information-circle-outline') return this.icon;
        switch (this.variant) {
            case 'permission': return 'information-circle-outline';
            case 'error': return 'cloud-offline-outline';
            default: return 'alert-circle-outline';
        }
    }
}
