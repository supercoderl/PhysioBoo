import { Component, Input } from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';
import { ToastService } from '../../../../services/common/toast.service';
import { SharedModule } from '../../../../shared/shared-imports';
import { BooIconComponent } from "../../../icon/boo-icon/boo-icon.component";

@Component({
    selector: 'boo-json-input',
    standalone: true,
    imports: [
        SharedModule,
        FormsModule,
        BooIconComponent
    ],
    template: `
        <div class="m-6 mb-0 p-4 border border-dashed border-blue-400 bg-blue-50/50 rounded-xl transition-all">
            <div 
                class="flex justify-between items-center cursor-pointer select-none" 
                (click)="isExpanded = !isExpanded"
            >
                <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
                        <boo-icon name="code" [size]="14" class="text-blue-600"></boo-icon>
                    </div>
                    <span class="text-sm font-bold text-blue-700">DevTool: Auto-fill JSON</span>
                </div>
                <boo-icon 
                    [name]="isExpanded ? 'chevron-up' : 'chevron-down'" 
                    [size]="18" 
                    class="text-blue-500 transition-transform"
                ></boo-icon>
            </div>

            <div *ngIf="isExpanded" class="mt-4 animate-fade-in-down">
                <textarea 
                    [(ngModel)]="jsonText" 
                    rows="6" 
                    class="w-full text-[13px] font-mono p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-slate-700 custom-scrollbar" 
                    placeholder='Paste your raw JSON here... &#10;{&#10;  "name": "example",&#10;  "code": "EX-01"&#10;}'
                ></textarea>
                
                <div class="mt-3 flex justify-end gap-2">
                    <button 
                        (click)="clearText()" 
                        class="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                    >
                        Clear
                    </button>
                    <button 
                        (click)="applyJson()" 
                        class="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-1.5"
                    >
                        <boo-icon name="zap" [size]="14"></boo-icon>
                        Apply to Form
                    </button>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .animate-fade-in-down {
            animation: fadeInDown 0.2s ease-out forwards;
        }
        @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `]
})
export class BooDevJsonFillerComponent {
    // #region Inputs, Ouputs, Properties
    @Input({ required: true }) targetForm!: FormGroup;

    isExpanded = false;
    jsonText = '';
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(private toastSrv: ToastService) { }
    // #endregion

    // #region Methods
    applyJson() {
        if (!this.jsonText.trim()) {
            this.toastSrv.error('Please paste some JSON first!');
            return;
        }

        try {
            const parsedData = JSON.parse(this.jsonText);
            this.targetForm.patchValue(parsedData);
            this.targetForm.markAsDirty();
            Object.keys(this.targetForm.controls).forEach(key => {
                this.targetForm.get(key)?.markAsTouched();
            });

            this.toastSrv.success('Mock data applied successfully!');
            this.isExpanded = false;

        } catch (e) {
            this.toastSrv.error('Invalid JSON format! Check for missing quotes or commas.');
            console.error('JSON Parse Error:', e);
        }
    }

    clearText() {
        this.jsonText = '';
    }
    // #endregion
}