export type DialogType = 'info' | 'warning' | 'danger' | 'success';

export interface ConfirmDialogData {
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    type: DialogType;
    onConfirm: () => void;
    onCancel?: () => void;
}