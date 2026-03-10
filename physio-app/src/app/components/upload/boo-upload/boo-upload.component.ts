import { Component, ElementRef, EventEmitter, forwardRef, Input, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { finalize } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { CloudinaryService } from '../../../services/common/cloudinary.service';
import { LocalLoadingService } from '../../../services/common/local-loading.service';
import { ToastService } from '../../../services/common/toast.service';
import { SharedModule } from '../../../shared/shared-imports'; // Chứa CommonModule, Icon...
import { BooIconComponent } from '../../icon/boo-icon/boo-icon.component';

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
          <img *ngIf="!isSvgString" [src]="previewUrl" class="w-full h-full object-cover">
          <div *ngIf="isSvgString" [innerHtml]="previewUrl | safeHtml" class="w-full h-full object-cover"></div>
          
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
    </div>
  `
})
export class BooUploadComponent implements ControlValueAccessor {
  // #region Inputs, Outputs, Properties
  @Input() label = '';
  @Input() required = false;
  @Input() width = '80px';
  @Input() height = '80px';
  @Input() svgSize: number = 24;
  @Input() radius = 12;
  @Input() accept = 'image/*';
  @Input() folder = `${environment.CLOUDINARY.BASE_FOLDER}/others`;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @Output() uploadSuccess = new EventEmitter<{ url: string; publicId: string }>();

  previewUrl: string | null = null;
  isSvgString: boolean = false;
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
    private toastSrv: ToastService,
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

    const allowedTypes = this.accept.split(',').map(t => t.trim().toLowerCase());

    const isExtensionAllowed = allowedTypes.some(type => file.name.toLowerCase().endsWith(type));
    const isMimeTypeAllowed = allowedTypes.some(type => {
      if (type.includes('/*')) {
        return file.type.startsWith(type.replace('/*', ''));
      }
      return file.type === type;
    });

    if (!isExtensionAllowed && !isMimeTypeAllowed) {
      this.toastSrv.error(`Invalid file format. Only the following formats are accepted: ${this.accept}`)
      input.value = '';
      return;
    }

    if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
      this.handleSvgFile(file);
    } else {
      this.uploadToCloudinary(file, input);
    }
  }

  private handleSvgFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const svgString = e.target.result as string;
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgString, 'image/svg+xml');
      const svgElement = doc.documentElement;

      if (svgElement.tagName.toLowerCase() !== 'svg') {
        this.toastSrv.error('Invalid svg type');
        return;
      }

      if (!svgElement.hasAttribute('viewBox')) {
        const width = svgElement.getAttribute('width')?.replace(/[^0-9.]/g, '') || this.svgSize;
        const height = svgElement.getAttribute('height')?.replace(/[^0-9.]/g, '') || this.svgSize;
        svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
      }

      svgElement.setAttribute('width', '100%');
      svgElement.setAttribute('height', '100%');
      svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');

      const elements = svgElement.querySelectorAll('*');
      elements.forEach(el => {
        const fill = el.getAttribute('fill');
        if (fill && fill !== 'none' && fill !== 'currentColor') {
          el.setAttribute('fill', 'currentColor');
        }
        const stroke = el.getAttribute('stroke');
        if (stroke && stroke !== 'none' && stroke !== 'currentColor') {
          el.setAttribute('stroke', 'currentColor');
        }
        el.removeAttribute('style');
      });

      const serializer = new XMLSerializer();
      const cleanSvg = serializer.serializeToString(svgElement);

      this.isSvgString = true;
      this.previewUrl = cleanSvg;

      this.onChange(cleanSvg);
      this.uploadSuccess.emit({ url: cleanSvg, publicId: `svg-raw-${file.name}` });
    };
    reader.readAsText(file);
  }

  private uploadToCloudinary(file: File, input: HTMLInputElement) {
    this.cloudinarySrv.uploadImage(file, this.folder)
      .pipe(finalize(() => input.value = ''))
      .subscribe({
        next: (res) => {
          this.previewUrl = res.secure_url;
          this.onChange(res.secure_url);
          this.uploadSuccess.emit({ url: res.secure_url, publicId: res.public_id });
        },
        error: (err) => {
          this.toastSrv.error('Upload failed, please try again.')
          console.error(err);
        }
      });
  }

  writeValue(value: any): void {
    this.previewUrl = value || null;
    if (typeof value === 'string' && value.trim().toLowerCase().startsWith('<svg')) {
      this.isSvgString = true;
    } else {
      this.isSvgString = false;
    }
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }
  // #endregion
}