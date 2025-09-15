import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AfterViewInit, Component, Inject, NgZone, OnInit, PLATFORM_ID } from '@angular/core';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { InterceptorService } from './services/interceptor/interceptor.service';
import { authGuardGuard } from './services/auth/auth-guard.guard';
import { SharedModule } from './shared/shared-imports';
import AOS from 'aos';
import { NavigationEnd, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './app.component.html',
  providers: [
    { provide: NZ_I18N, useValue: en_US },
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
    authGuardGuard
  ]
})
export class AppComponent implements AfterViewInit {
  title = 'physio-app';

  constructor(
    private router: Router,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.ngZone.runOutsideAngular(() => {
      // 1) Init trễ sau khi view mounted
      AOS.init({
        once: true,          // animate 1 lần là đủ (tuỳ bạn)
        duration: 600,
        easing: 'ease-in-out',
        offset: 80
      });

      const refresh = () => AOS.refreshHard();

      // 2) Đảm bảo refresh ngay frame kế tiếp
      setTimeout(refresh, 0);

      // 3) Khi route đổi (SPA), refresh lại
      this.router.events
        .pipe(filter(e => e instanceof NavigationEnd))
        .subscribe(() => setTimeout(refresh, 0));

      // 4) Khi ảnh/xuất hiện nội dung async → refresh
      const imgs = Array.from(document.querySelectorAll('img'));
      imgs.forEach((img: HTMLImageElement) => {
        if (!img.complete) img.addEventListener('load', refresh, { once: true });
      });

      // 5) Khi DOM thêm/bớt node (component con render muộn)
      const mo = new MutationObserver(() => refresh());
      mo.observe(document.body, { childList: true, subtree: true });
    });
  }
}