import { Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { FontSize, ThemeConfigService } from '../../../../services/common/theme-config.service';
import { ToastService } from '../../../../services/common/toast.service';
import { SharedModule } from '../../../../shared/shared-imports';

interface FontSizeOption { value: FontSize; label: string; size: string; }

@Component({
  selector: 'admin-size',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './size.component.html'
})
export class AdminSizeComponent {
  // #region Inputs, Outputs, Properties
  private themeCfgSrv = inject(ThemeConfigService);
  private toastSrv = inject(ToastService);

  config = this.themeCfgSrv.config;
  saving = signal(false);

  /** Same scale as Settings → Appearance, so both stay in sync. */
  readonly options: FontSizeOption[] = [
    { value: 'small', label: 'Small', size: '14px' },
    { value: 'medium', label: 'Medium', size: '16px' },
    { value: 'large', label: 'Large', size: '18px' },
  ];
  // #endregion

  // #region Events
  pick(fontSize: FontSize) {
    const previous = this.config().fontSize;
    if (this.saving() || fontSize === previous) return;

    this.saving.set(true);
    this.themeCfgSrv.update({ fontSize })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        error: () => {
          this.themeCfgSrv.preview({ fontSize: previous });
          this.toastSrv.error('Could not save your font size');
        }
      });
  }
  // #endregion
}
