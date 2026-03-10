import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { DialogComponent } from './components/dialog/dialog.component';
import { PreloaderComponent } from "./components/loading/preloader/preloader.component";
import { ToastComponent } from "./components/toast/toast.component";
import { AuthService } from './services/auth/auth.service';
import { GlobalLoadingService } from './services/common/global-loading.service';
import { ThemeService } from './services/common/theme.service';
import { SharedModule } from './shared/shared-imports';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SharedModule, PreloaderComponent, ToastComponent, DialogComponent],
  templateUrl: './app.component.html',
  providers: [
    { provide: NZ_I18N, useValue: en_US },
  ]
})
export class AppComponent implements OnInit {
  title = 'physio-app';

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private themeSrv: ThemeService,
    private authSrv: AuthService,
    public gloLoadingSrv: GlobalLoadingService
  ) { }

  ngOnInit(): void {
    this.themeSrv.initTheme();
    if (this.authSrv.isAuthenticated()) {
      this.authSrv.getProfile().subscribe();
      // this.authSrv.loadPermissions();
    }
  }
}