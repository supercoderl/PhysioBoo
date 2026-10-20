import { Component } from '@angular/core';
import { BooBreadcrumbComponent, BooButtonComponent } from '@physioboo/ui';
import { SharedModule } from '../../../shared/shared-imports';
import {
  ABOUT_CAPABILITIES,
  ABOUT_COPY_IS_DRAFT,
  ABOUT_EXPLORE,
  ABOUT_HERO_IMAGE,
  ABOUT_MISSION_VISION,
  ABOUT_STEPS,
  ABOUT_TRUST,
  ABOUT_VALUES,
} from './about-content';
import { ExploreCardComponent } from './explore-card.component';
import { ValueCardComponent } from './value-card.component';

/**
 * Public About Us page (design: About Us Page / About Us).
 * All copy is static (see about-content.ts); the page makes no API calls.
 */
@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [BooButtonComponent, SharedModule, ValueCardComponent, ExploreCardComponent, BooBreadcrumbComponent],
  templateUrl: './about-us.component.html',
})
export class AboutUsComponent {
  readonly isDraft = ABOUT_COPY_IS_DRAFT;
  readonly heroImage = ABOUT_HERO_IMAGE;
  readonly capabilities = ABOUT_CAPABILITIES;
  readonly missionVision = ABOUT_MISSION_VISION;
  readonly values = ABOUT_VALUES;
  readonly steps = ABOUT_STEPS;
  readonly explore = ABOUT_EXPLORE;
  readonly trust = ABOUT_TRUST;
}
