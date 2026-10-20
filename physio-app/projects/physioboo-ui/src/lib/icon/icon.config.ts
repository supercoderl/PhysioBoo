import { InjectionToken } from '@angular/core';

/**
 * URL of the folder that serves the icon SVGs, without a trailing slash. `physio-icon` fetches `<path>/<name>.svg`.
 * Defaults to the PhysioBoo app's `assets/icons`; provide it to serve the icons from somewhere else.
 */
export const BOO_ICON_PATH = new InjectionToken<string>('BOO_ICON_PATH', {
  providedIn: 'root',
  factory: () => 'assets/icons',
});
