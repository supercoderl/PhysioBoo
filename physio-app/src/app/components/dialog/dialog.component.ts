import { animate, style, transition, trigger } from '@angular/animations';
import { Component, HostListener, inject } from '@angular/core';
import { DialogService } from '../../services/common/dialog.service';
import { SharedModule } from '../../shared/shared-imports'; // Nơi chứa CommonModule, Icons...
import { DialogType } from '../../shared/types/dialog.types';
import { BooButtonAdminComponent } from '../button/boo-button-admin/boo-button-admin.component';

@Component({
  selector: 'global-dialog',
  standalone: true,
  imports: [SharedModule, BooButtonAdminComponent],
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
               <physio-icon [name]="getIconName(data.type)" [class]="getIconColor(data.type)" [size]="20"/>
            </div>
            
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900">{{ data.title }}</h3>
              <p class="text-sm text-gray-500 mt-1 leading-relaxed">
                {{ data.message }}
              </p>
            </div>
          </div>

          <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
            <boo-button-admin
              (click)="data.onCancel ? data.onCancel() : dialogService.close()"
              background="transparent" textColor="#55434B" [border]="{ width: 1, color: '#E3D5DA' }"
              padding="8px 16px" [fontSize]="14" [radius]="8" fontWeight="500"
            >
              {{ data.cancelText }}
            </boo-button-admin>

            <boo-button-admin
              (click)="data.onConfirm()"
              [background]="getConfirmBackground(data.type)" textColor="white"
              padding="8px 16px" [fontSize]="14" [radius]="8" fontWeight="500"
            >
              {{ data.confirmText }}
            </boo-button-admin>
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
      case 'danger': return 'warning-circle';
      case 'warning': return 'question-circle';
      case 'success': return 'check-circle';
      default: return 'info';
    }
  }

  getIconBg(type: DialogType): string {
    switch (type) {
      case 'danger': return 'bg-red-50';
      case 'warning': return 'bg-amber-50';
      case 'success': return 'bg-green-50';
      default: return 'bg-primarySoft';
    }
  }

  getIconColor(type: DialogType): string {
    switch (type) {
      case 'danger': return 'text-red-600';
      case 'warning': return 'text-amber-600';
      case 'success': return 'text-green-600';
      default: return 'text-primary';
    }
  }

  getConfirmBackground(type: DialogType): string {
    switch (type) {
      case 'danger': return '#DC2626';
      case 'warning': return '#D97706';
      case 'success': return '#16A34A';
      default: return 'rgb(var(--twc-primary))';
    }
  }
  // #endregion
}