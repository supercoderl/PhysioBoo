// src/app/shared/icons.config.ts
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import {
  DashboardOutline,
  FormOutline,
  MenuFoldOutline,
  MenuUnfoldOutline
} from '@ant-design/icons-angular/icons';
import { NZ_ICONS } from 'ng-zorro-antd/icon';

const icons = [MenuFoldOutline, MenuUnfoldOutline, DashboardOutline, FormOutline];

export function provideIcons(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: NZ_ICONS, useValue: icons },
  ]);
}
