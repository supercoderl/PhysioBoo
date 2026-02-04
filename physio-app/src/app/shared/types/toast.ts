export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'confirm';

export interface ToastAction {
    label: string;
    action: () => void;
    class?: string;   
}

export interface Toast {
    id: number;
    type: ToastType;
    title?: string;
    message: string;
    duration?: number;
    actions?: ToastAction[];
    shakeTrigger?: number;
}