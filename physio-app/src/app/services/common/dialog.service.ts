import { Injectable, signal } from '@angular/core';
import { ConfirmDialogData, DialogType } from '../../shared/types/dialog';

@Injectable({
    providedIn: 'root'
})
export class DialogService {
    dialogState = signal<ConfirmDialogData | null>(null);

    confirm(
        message: string,
        onConfirm: () => void,
        title: string = 'Confirm Action',
        type: DialogType = 'warning',
        confirmText: string = 'Confirm',
        cancelText: string = 'Cancel',
        onCancel?: () => void
    ) {
        this.dialogState.set({
            message,
            title,
            type,
            confirmText,
            cancelText,
            onConfirm: () => {
                onConfirm();
                this.close();
            },
            onCancel: () => {
                if (onCancel) onCancel();
                this.close();
            }
        });
    }

    confirmUnsavedChanges(onConfirm: () => void) {
        this.confirm(
            'You have unsaved changes. Are you sure you want to leave?',
            onConfirm,
            'Unsaved Changes',
            'warning',
            'Discard Changes',
            'Keep Editing'
        );
    }

    confirmDelete(onConfirm: () => void, itemName: string = 'this item') {
        this.confirm(
            `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
            onConfirm,
            'Delete Confirmation',
            'danger',
            'Delete',
            'Cancel'
        );
    }

    close() {
        this.dialogState.set(null);
    }
}