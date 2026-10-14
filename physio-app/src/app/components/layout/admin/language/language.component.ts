import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { LanguageService } from '../../../../services/common/language.service';
import { ToastService } from '../../../../services/common/toast.service';
import { SharedModule } from '../../../../shared/shared-imports';
import { Language } from '../../../../shared/types/sys-language.types';

@Component({
  selector: 'admin-language',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './language.component.html'
})
export class AdminLanguageComponent {
  // #region Inputs, Outputs, Properties
  @Output() selected: EventEmitter<Language> = new EventEmitter<Language>();

  protected languageSrv = inject(LanguageService);
  private toastSrv = inject(ToastService);

  saving = signal(false);
  // #endregion

  // #region Events
  pick(language: Language) {
    if (this.saving()) return;
    if (language.code === this.languageSrv.current()?.code) {
      this.selected.emit(language);
      return;
    }

    this.saving.set(true);
    this.languageSrv.select(language.code)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.selected.emit(language),
        error: () => this.toastSrv.error('Could not save your language')
      });
  }
  // #endregion
}
