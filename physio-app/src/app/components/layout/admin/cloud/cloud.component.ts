import { Component } from '@angular/core';
import { delay, finalize, tap } from 'rxjs';
import { LocalLoadingService } from '../../../../services/common/local-loading.service';
import { hardReload$ } from "../../../../shared/utils/common";
import { ButtonIconComponent } from "../../../button/button-icon/button-icon.component";
import { ClockComponent } from "../../../clock/clock.component";
import { DividerComponent } from "../../../divider/divider.component";
import { BooIconComponent } from "../../../icon/boo-icon/boo-icon.component";
import { SwitchComponent } from "../../../switch/switch.component";

@Component({
  selector: 'admin-cloud',
  standalone: true,
  imports: [DividerComponent, SwitchComponent, ClockComponent, ButtonIconComponent, BooIconComponent],
  templateUrl: './cloud.component.html'
})
export class AdminCloudComponent {

  // #region Init (Lifecycle + Setup)
  constructor(protected locLoadingSrv: LocalLoadingService) {

  }
  // #endregion

  // #region Methods
  async onReload() {
    this.locLoadingSrv.setLoading('hard-reload', true);

    hardReload$()
      .pipe(
        delay(1000),
        tap(() => {
          const url = window.location.origin + '/?_hardReload=' + Date.now();
          window.location.replace(url);
        }),
        finalize(() => this.locLoadingSrv.setLoading('hard-reload', false))
      )
      .subscribe();
  }
  // #endregion
}
