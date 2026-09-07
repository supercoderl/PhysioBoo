/**
 * Reuses the same public contract as physio-app's ToastService (success/error/info/confirm) so the
 * ported HTTP interceptor doesn't need to change, but the presentation layer is rebuilt on Ionic's
 * ToastController/AlertController instead of the web app's desktop toast-stack component.
 */
import { Injectable, inject } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular/standalone';
import { ToastType } from '../../shared/types/toast.types';

@Injectable({ providedIn: 'root' })
export class ToastService {
    private toastCtrl = inject(ToastController);
    private alertCtrl = inject(AlertController);

    private colorFor(type: ToastType): string {
        switch (type) {
            case 'success': return 'success';
            case 'error': return 'danger';
            case 'warning': return 'warning';
            default: return 'dark';
        }
    }

    async show(type: ToastType, message: string, duration = 3000) {
        const toast = await this.toastCtrl.create({
            message,
            duration,
            color: this.colorFor(type),
            position: 'top',
            swipeGesture: 'vertical',
        });
        await toast.present();
    }

    success(message: string) {
        this.show('success', message);
    }

    error(message: string) {
        this.show('error', message, 5000);
    }

    info(message: string) {
        this.show('info', message);
    }

    async confirm(message: string, onConfirm: () => void, onCancel?: () => void, confirmLabel = 'OK', cancelLabel = 'Cancel') {
        const alert = await this.alertCtrl.create({
            message,
            buttons: [
                { text: cancelLabel, role: 'cancel', handler: () => onCancel?.() },
                { text: confirmLabel, role: 'confirm', handler: () => onConfirm() },
            ],
        });
        await alert.present();
    }
}
