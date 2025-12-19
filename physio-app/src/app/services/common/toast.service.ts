import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: number;
    type: ToastType;
    title?: string;
    message: string;
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    toasts = signal<Toast[]>([]);

    private counter = 0;

    show(type: ToastType, message: string, title?: string, duration: number = 3000) {
        const id = this.counter++;
        const newToast: Toast = { id, type, message, title, duration };

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
        console.log('Đang xóa ID:', id); // <--- Thêm dòng này
        this.toasts.update(current => current.filter(t => t.id !== id));
        console.log('Danh sách còn lại:', this.toasts());
    }
}