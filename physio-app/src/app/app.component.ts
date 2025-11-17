import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { PreloaderComponent } from "./components/loading/preloader/preloader.component";
import { authGuardGuard } from './services/auth/auth-guard.guard';
import { GlobalLoadingService } from './services/common/global-loading.service';
import { ThemeService } from './services/common/theme.service';
import { SharedModule } from './shared/shared-imports';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SharedModule, PreloaderComponent],
  templateUrl: './app.component.html',
  providers: [
    { provide: NZ_I18N, useValue: en_US },
    authGuardGuard
  ]
})
export class AppComponent implements OnInit {
  title = 'physio-app';

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private themeSrv: ThemeService,
    public gloLoadingSrv: GlobalLoadingService
  ) {}
  
  ngOnInit(): void {
    this.themeSrv.initTheme();
  }
}