import { isPlatformBrowser } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { mapTo, of, startWith, timer } from 'rxjs';
import { PreloaderComponent } from "./components/loading/preloader/preloader.component";
import { authGuardGuard } from './services/auth/auth-guard.guard';
import { ThemeService } from './services/common/theme.service';
import { InterceptorService } from './services/interceptor/interceptor.service';
import { SharedModule } from './shared/shared-imports';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SharedModule, PreloaderComponent],
  templateUrl: './app.component.html',
  providers: [
    { provide: NZ_I18N, useValue: en_US },
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
    authGuardGuard
  ]
})
export class AppComponent implements OnInit {
  title = 'physio-app';
  spinner$ = of(true);

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private themeSrv: ThemeService
  ) {
    if (isPlatformBrowser(platformId)) {
      this.spinner$ = timer(1000).pipe(
        mapTo(false),
        startWith(true)
      )
    }
  }
  ngOnInit(): void {
    this.themeSrv.initTheme();
  }
}