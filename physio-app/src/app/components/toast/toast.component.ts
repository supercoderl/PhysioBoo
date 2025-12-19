import { animate, style, transition, trigger } from '@angular/animations';
import { Component, inject } from '@angular/core';
import { ToastService, ToastType } from '../../services/common/toast.service';
import { SharedModule } from '../../shared/shared-imports';

@Component({
    selector: 'app-toast',
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
                animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
            ])
        ])
    ],
    template: `
        <div class="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
            <div 
                *ngFor="let toast of toastService.toasts()" 
                [@toastAnimation]
                class="
                relative pointer-events-auto w-80 shadow-lg rounded-lg border-l-4 p-4 bg-white 
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
                </div>

                <button 
                (click)="toastService.remove(toast.id)" 
                class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <lucide-icon name="x" [size]="18"></lucide-icon>
                </button>
            </div>
        </div>
  `
})
export class ToastComponent {
    // #region Inputs, Outputs, Properties
    toastService = inject(ToastService);

    getClasses(type: ToastType): string {
        switch (type) {
            case 'success': return 'border-green-500';
            case 'error': return 'border-red-500';
            case 'warning': return 'border-yellow-500';
            case 'info': return 'border-blue-500';
            default: return 'border-gray-500';
        }
    }

    getIconColor(type: ToastType): string {
        switch (type) {
            case 'success': return 'text-green-500';
            case 'error': return 'text-red-500';
            case 'warning': return 'text-yellow-500';
            case 'info': return 'text-blue-500';
            default: return 'text-gray-500';
        }
    }

    getIconName(type: ToastType): string {
        const icons: Record<string, string> = {
            success: 'smile',
            error: 'smile',
            warning: 'smile',
            info: 'smile'
        }; 
        return icons[type] || 'smile';
    }
    // #endregion
}