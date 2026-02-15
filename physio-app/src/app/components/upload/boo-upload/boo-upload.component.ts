import { Component, ElementRef, EventEmitter, forwardRef, Input, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SharedModule } from '../../../shared/shared-imports'; // Chứa CommonModule, Icon...
import { BooIconComponent } from '../../icon/boo-icon/boo-icon.component';
import { CloudinaryService } from '../../../services/common/cloudinary.service';
import { environment } from '../../../../environments/environment.development';
import { LocalLoadingService } from '../../../services/common/local-loading.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'boo-upload',
  standalone: true,
  imports: [SharedModule, BooIconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BooUploadComponent),
      multi: true
    }
  ],
  template: `
    <div class="flex flex-col gap-2">
      <label *ngIf="label" class="block text-xs font-semibold text-gray-700 uppercase">
        {{ label }} <span *ngIf="required" class="text-red-500">*</span>
      </label>

      <div 
        (click)="triggerUpload()"
        [class.border-red-500]="error"
        class="
          relative overflow-hidden group cursor-pointer transition-all duration-200
          border-2 border-dashed border-gray-300 bg-gray-50
          hover:border-primary hover:bg-blue-50
          flex items-center justify-center
        "
        [class]="containerClass"
        [style.width]="width"
        [style.height]="height"
        [style.border-radius.px]="radius"
      >
        <div *ngIf="loadingSrv.isLoading('upload')" class="absolute inset-0 bg-surface/80 z-20 flex flex-col items-center justify-center backdrop-blur-[1px]">
          <boo-icon name="loader" class="animate-spin text-primary" [size]="24"></boo-icon>
        </div>
        <ng-container *ngIf="previewUrl; else emptyState">
          <img [src]="previewUrl" class="w-full h-full object-cover">
          
          <div *ngIf="!loadingSrv.isLoading('upload')" class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
            <div class="flex flex-col items-center text-white">
              <boo-icon name="pencil" [size]="20" color="white"></boo-icon>
              <span class="text-[10px] font-medium mt-1">Change</span>
            </div>
          </div>
        </ng-container>

        <ng-template #emptyState>
          <div class="flex flex-col items-center gap-1 text-gray-400 group-hover:text-primary transition-colors">
            <boo-icon name="upload" [size]="20" color="#9ca3af"></boo-icon>
            <span class="text-[10px] font-medium uppercase tracking-wide">Upload</span>
          </div>
        </ng-template>

        <input 
          #fileInput
          type="file" 
          class="hidden" 
          [accept]="accept"
          (change)="onFileSelected($event)"
        >
      </div>

      <span *ngIf="error" class="text-xs text-red-500">{{ error }}</span>
    </div>
  `
})
export class BooUploadComponent implements ControlValueAccessor {
  // #region Inputs, Outputs, Properties
  @Input() label = '';
  @Input() required = false;
  @Input() width = '80px';
  @Input() height = '80px';
  @Input() radius = 12;
  @Input() accept = 'image/*';
  @Input() error = '';
  @Input() folder = `${environment.CLOUDINARY.BASE_FOLDER}/others`;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @Output() uploadSuccess = new EventEmitter<{ url: string; publicId: string }>();

  previewUrl: string | null = null;
  disabled = false;

  get containerClass() {
    return { 
      'opacity-50 cursor-not-allowed pointer-events-none': this.disabled || this.loadingSrv.isLoading('upload') 
    };
  }
  // #endregion

  // #region Init (Lifecycle + Setup)
  constructor(
    private cloudinarySrv: CloudinaryService,
    protected loadingSrv: LocalLoadingService
  ) { }
  // #endregion

  // #region Methods
  onChange: (value: any) => void = () => { };
  onTouched: () => void = () => { };

  triggerUpload() {
    if (!this.disabled && !this.loadingSrv.isLoading('upload')) this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.cloudinarySrv.uploadImage(file, this.folder)
      .pipe(
        finalize(() => {
          input.value = '';
        })
      )
      .subscribe({
        next: (res) => {
          this.previewUrl = res.secure_url;
          this.onChange(res.secure_url);
          this.uploadSuccess.emit({ url: res.secure_url, publicId: res.public_id });
        },
        error: (err) => console.error('Upload failed', err)
      });
  }

  writeValue(value: any): void {
    this.previewUrl = value || null;
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }
  // #endregion
}