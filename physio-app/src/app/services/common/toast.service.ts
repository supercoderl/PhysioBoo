import { Injectable, signal } from '@angular/core';
import { Toast, ToastAction, ToastType } from '../../shared/types/toast';

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    toasts = signal<Toast[]>([]);
    private counter = 0;

    show(type: ToastType, message: string, title?: string, duration: number = 3000, actions?: ToastAction[], preventDuplicates: boolean = false) {
        if (preventDuplicates) {
            const existingToast = this.toasts().find(t =>
                t.type === type && t.message === message
            );

            if (existingToast) {
                this.toasts.update(current => current.map(t => {
                    if (t.id === existingToast.id) {
                        return { ...t, shakeTrigger: Date.now() };
                    }
                    return t;
                }));
                return;
            }
        }

        const id = this.counter++;
        const newToast: Toast = { id, type, message, title, duration, actions, shakeTrigger: 0 };

        this.toasts.update(current => [...current, newToast]);

        if (duration > 0) {
            setTimeout(() => this.remove(id), duration);
        }
    }

    success(message: string, title: string = 'Success') {
        this.show('success', message, title);
    }

    error(message: string, title: string = 'Error') {
        this.show('error', message, title, 5000);
    }

    info(message: string, title: string = 'Info') {
        this.show('info', message, title);
    }

    remove(id: number) {
        this.toasts.update(current => current.filter(t => t.id !== id));
    }

    clearAll() {
        this.toasts.set([]);
    }

    confirm(
        message: string,
        onConfirm: () => void,
        onCancel?: () => void,
        confirmLabel: string = 'Save',
        cancelLabel: string = 'Cancel'
    ) {
        const cleanMessage = message.trim();
        const existingToast = this.toasts().find(t =>
            t.type === 'confirm' && t.message.trim() === cleanMessage
        );

        if (existingToast) {
            this.toasts.update(current => current.map(t =>
                t.id === existingToast.id
                    ? { ...t, shakeTrigger: (t.shakeTrigger || 0) + 1 }
                    : t
            ));
            return;
        }
        const id = this.counter++;
        const actions: ToastAction[] = [
            {
                label: cancelLabel,
                class: 'btn-cancel',
                action: () => {
                    if (onCancel) onCancel();
                    this.remove(id);
                }
            },
            {
                label: confirmLabel,
                class: 'btn-confirm',
                action: () => {
                    onConfirm();
                    this.remove(id);
                }
            }
        ];

        const newToast: Toast = {
            id,
            type: 'confirm',
            message: cleanMessage,
            title: 'Confirm action',
            duration: 0,
            actions,
            shakeTrigger: 1
        };

        this.toasts.update(current => [...current, newToast]);
    }
}