import { Component, Input } from '@angular/core';
import { FormGroup, FormsModule } from '@angular/forms';
import { ToastService } from '../../../../services/common/toast.service';
import { SharedModule } from '../../../../shared/shared-imports';

@Component({
    selector: 'boo-json-editor',
    standalone: true,
    imports: [
        SharedModule,
        FormsModule,
    ],
    template: `
        <div class="m-6 mb-0 p-4 border border-dashed border-primary/70 bg-primarySoft/50 rounded-xl transition-all">
            <div 
                class="flex justify-between items-center cursor-pointer select-none" 
                (click)="isExpanded = !isExpanded"
            >
                <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded bg-primarySoft flex items-center justify-center">
                        <physio-icon name="code" [size]="14" class="text-primary"></physio-icon>
                    </div>
                    <span class="text-sm font-bold text-primaryHover">DevTool: Auto-fill JSON</span>
                </div>
                <physio-icon 
                    [name]="isExpanded ? 'chevron-up' : 'chevron-down'" 
                    [size]="18"
                [class]="'text-primary transition-transform'"
                ></physio-icon>
            </div>

            <div *ngIf="isExpanded" class="mt-4 animate-fade-in-down">
                <textarea 
                    [(ngModel)]="jsonText" 
                    rows="6" 
                    class="w-full text-[13px] font-mono p-3 border border-primary/25 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/70 bg-white text-slate-700 custom-scrollbar" 
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
                        class="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primaryHover transition-colors shadow-sm flex items-center gap-1.5"
                    >
                        <physio-icon name="zap" [size]="14" class="text-white"></physio-icon>
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
    @Input({ required: true }) set targetForms(value: FormGroup | FormGroup[]) {
        this.forms = Array.isArray(value) ? value : [value];
    }

    forms: FormGroup[] = [];
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

            this.forms.forEach(form => {
                form.patchValue(parsedData);
                form.markAsDirty();

                Object.keys(form.controls).forEach(key => {
                    form.get(key)?.markAsTouched();
                });
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