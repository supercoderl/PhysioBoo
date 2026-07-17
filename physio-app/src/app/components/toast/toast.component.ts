import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/common/toast.service';
import { SharedModule } from '../../shared/shared-imports';
import { Toast, ToastType } from '../../shared/types/toast.types';

@Component({
    selector: 'toast',
    standalone: true,
    imports: [
        SharedModule
    ],
    animations: [
        trigger('toastAnimation', [
            transition(':enter', [
                style({ transform: 'translateX(100%)', opacity: 0 }),
                animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ transform: 'translateX(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
            ])
        ]),
        trigger('shakeAnimation', [
            transition(':increment', [
                animate('400ms ease-in-out', keyframes([
                    style({ transform: 'translate3d(0, 0, 0)', offset: 0 }),
                    style({ transform: 'translate3d(-10px, 0, 0)', offset: 0.1 }),
                    style({ transform: 'translate3d(10px, 0, 0)', offset: 0.2 }),
                    style({ transform: 'translate3d(-10px, 0, 0)', offset: 0.3 }),
                    style({ transform: 'translate3d(10px, 0, 0)', offset: 0.4 }),
                    style({ transform: 'translate3d(-5px, 0, 0)', offset: 0.5 }),
                    style({ transform: 'translate3d(5px, 0, 0)', offset: 0.6 }),
                    style({ transform: 'translate3d(0, 0, 0)', offset: 1 })
                ]))
            ])
        ])
    ],
    template: `
        <div class="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
            <div 
                *ngFor="let toast of toastService.toasts(); trackBy: trackById" 
                [@toastAnimation]
                [@shakeAnimation]="toast.shakeTrigger"
                class="
                    relative pointer-events-auto w-80 shadow-lg rounded-lg border-l-4 p-4 bg-surface 
                    flex items-start gap-3 transition-all hover:scale-[1.02]
                "
                [ngClass]="getClasses(toast.type)"
            >
                <div class="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                    <lucide-icon 
                        [name]="getIconName(toast.type)" 
                        [class]="getIconColor(toast.type)"
                        [size]="24"
                    ></lucide-icon>
                </div>

                <div class="flex-1 pr-7">
                    <h4 class="font-bold text-sm text-gray-800">{{ toast.title }}</h4>
                    <p class="text-sm text-gray-600 mt-1 break-words mb-0">{{ toast.message }}</p>
                    <div *ngIf="toast.actions?.length" class="mt-3 flex gap-2 justify-end">
                        <button 
                            *ngFor="let action of toast.actions"
                            (click)="action.action()"
                            class="px-3 py-1.5 text-xs font-medium rounded transition-colors border"
                            [ngClass]="getActionClass(action.class)"
                        >
                            {{ action.label }}
                        </button>
                    </div>
                </div>

                <button 
                (click)="toastService.remove(toast.id)" 
                class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <lucide-icon name="x" [size]="16"></lucide-icon>
                </button>
            </div>
        </div>
  `
})
export class ToastComponent {
    // #region Inputs, Outputs, Properties
    toastService = inject(ToastService);
    // #endregion

    // #region Methods
    trackById(index: number, item: Toast): number {
        return item.id;
    }

    getClasses(type: ToastType): string {
        switch (type) {
            case 'success': return 'border-green-500';
            case 'error': return 'border-red-500';
            case 'warning': return 'border-yellow-500';
            case 'confirm': return 'border-orange-500';
            case 'info': return 'border-blue-500';
            default: return 'border-gray-500';
        }
    }

    getIconColor(type: ToastType): string {
        switch (type) {
            case 'success': return 'text-green-500';
            case 'error': return 'text-red-500';
            case 'warning': return 'text-yellow-500';
            case 'confirm': return 'text-orange-500';
            case 'info': return 'text-blue-500';
            default: return 'text-gray-500';
        }
    }

    getIconName(type: ToastType): string {
        const icons: Record<string, string> = {
            success: 'smile',
            error: 'frown',
            warning: 'annoyed',
            confirm: 'message-circle-question-mark',
            info: 'meh'
        };
        return icons[type] || 'smile';
    }

    getActionClass(customClass?: string): string {
        if (customClass === 'btn-confirm') {
            return 'bg-blue-600 text-white border-transparent hover:bg-blue-700';
        }
        if (customClass === 'btn-cancel') {
            return 'bg-surface text-gray-700 border-gray-300 hover:bg-gray-50';
        }
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-transparent';
    }
    // #endregion
}