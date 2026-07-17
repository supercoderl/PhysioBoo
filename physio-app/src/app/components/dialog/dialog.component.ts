import { animate, style, transition, trigger } from '@angular/animations';
import { Component, HostListener, inject } from '@angular/core';
import { DialogService } from '../../services/common/dialog.service';
import { SharedModule } from '../../shared/shared-imports'; // Nơi chứa CommonModule, Icons...
import { DialogType } from '../../shared/types/dialog.types';

@Component({
    selector: 'global-dialog',
    standalone: true,
    imports: [SharedModule],
    animations: [
        trigger('backdrop', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('200ms ease-out', style({ opacity: 1 }))
            ]),
            transition(':leave', [
                animate('150ms ease-in', style({ opacity: 0 }))
            ])
        ]),
        trigger('modal', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.95) translateY(10px)' }),
                animate('200ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
            ]),
            transition(':leave', [
                animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
            ])
        ])
    ],
    template: `
    @if (dialogService.dialogState(); as data) {
      <div class="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        
        <div 
          @backdrop
          class="absolute inset-0 bg-black/40 backdrop-blur-sm"
          (click)="dialogService.close()"
        ></div>

        <div 
          @modal
          class="relative bg-surface rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
        >
          <div class="px-6 py-5 border-b border-gray-100 flex items-start gap-4">
            <div [class]="getIconBg(data.type)" class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
               <lucide-icon [name]="getIconName(data.type)" [class]="getIconColor(data.type)" [size]="20"></lucide-icon>
            </div>
            
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900">{{ data.title }}</h3>
              <p class="text-sm text-gray-500 mt-1 leading-relaxed">
                {{ data.message }}
              </p>
            </div>
          </div>

          <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
            <button 
              (click)="data.onCancel ? data.onCancel() : dialogService.close()"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-surface border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-200"
            >
              {{ data.cancelText }}
            </button>
            
            <button 
              (click)="data.onConfirm()"
              [class]="getConfirmButtonClass(data.type)"
              class="px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm focus:ring-2 focus:ring-offset-1 transition-all"
            >
              {{ data.confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class DialogComponent {
    // #region Inputs, Outputs, Properties
    dialogService = inject(DialogService);
    // #endregion

    // #region Methods
    @HostListener('window:keydown.esc')
    onEsc() {
        this.dialogService.close();
    }

    getIconName(type: DialogType): string {
        switch (type) {
            case 'danger': return 'message-circle-warning';
            case 'warning': return 'message-circle-question-mark';
            case 'success': return 'circle-check-big';
            default: return 'info';
        }
    }

    getIconBg(type: DialogType): string {
        switch (type) {
            case 'danger': return 'bg-red-50';
            case 'warning': return 'bg-amber-50';
            case 'success': return 'bg-green-50';
            default: return 'bg-blue-50';
        }
    }

    getIconColor(type: DialogType): string {
        switch (type) {
            case 'danger': return 'text-red-600';
            case 'warning': return 'text-amber-600';
            case 'success': return 'text-green-600';
            default: return 'text-blue-600';
        }
    }

    getConfirmButtonClass(type: DialogType): string {
        switch (type) {
            case 'danger': return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
            case 'warning': return 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'; 
            case 'success': return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
            default: return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
        }
    }
    // #endregion
}