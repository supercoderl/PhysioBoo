import { Component } from '@angular/core';
import { Language } from '../../../../shared/types/sys-language';
import { LocalStorage } from '../../../../shared/utils/storage';
import { CONFIG_CACHE_KEY } from '../../../../shared/data/cache';
import { AppConfig } from '../../../../shared/types/common';
import { SharedModule } from '../../../../shared/shared-imports';

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
  languages: Language[] = [];
  // #endregion

  // #region Init (Lifecycle + Setup)
  constructor() {
    const config_data = LocalStorage.load<AppConfig>(CONFIG_CACHE_KEY);
    if (config_data && config_data.languages) {
      this.languages = config_data.languages;
    }
  }
  // #endregion
}
