// src/app/shared/icons.config.ts
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { NZ_ICONS } from 'ng-zorro-antd/icon';

import {
  MenuFoldOutline,
  MenuUnfoldOutline,
  FormOutline,
  DashboardOutline
} from '@ant-design/icons-angular/icons';

const icons = [MenuFoldOutline, MenuUnfoldOutline, DashboardOutline, FormOutline];

export function provideIcons(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: NZ_ICONS, useValue: icons }
  ]);
}
