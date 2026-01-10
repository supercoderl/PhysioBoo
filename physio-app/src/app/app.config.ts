import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { LucideAngularModule } from 'lucide-angular';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { provideLottieOptions } from 'ngx-lottie';
import { routes } from './app.routes';
import { provideIcons } from './icon.config';
import { InitService } from './services/common/init.service';
import { InterceptorService } from './services/interceptor/interceptor.service';
import { HttpLoadingInterceptor } from './services/interceptor/loading-interceptor.service';
import { SHARED_LUCIDE_ICONS } from './shared/shared-providers';

registerLocaleData(en);

function initializeApp(initService: InitService): () => Promise<void> {
  return () => initService.load();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideNzI18n(en_US),
    importProvidersFrom([FormsModule, LucideAngularModule.pick(SHARED_LUCIDE_ICONS)]),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    provideIcons(),
    { provide: HTTP_INTERCEPTORS, useClass: HttpLoadingInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [InitService],
      multi: true
    },
    provideLottieOptions({
      player: () => import('lottie-web'),
    }),
  ]
};
