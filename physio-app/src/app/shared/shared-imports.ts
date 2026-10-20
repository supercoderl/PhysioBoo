import { DragDropModule } from "@angular/cdk/drag-drop";
import { OverlayModule } from "@angular/cdk/overlay";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { GoogleMapsModule } from "@angular/google-maps";
import { RouterModule, RouterOutlet } from "@angular/router";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzLayoutModule } from "ng-zorro-antd/layout";
import { NzMenuModule } from "ng-zorro-antd/menu";
import { LottieComponent } from "ngx-lottie";
import { BooIconComponent } from '@physioboo/ui';
import { PhysioAnimationComponent } from "../components/animations/physio-animation.component";
import { AutoAnimateDirective } from "./directives/auto-animate.directive";
import { DropdownDirective } from "./directives/dropdown.directive";
import { BooErrorDirective } from "./directives/error.directive";
import { ImageFallbackDirective } from "./directives/image-fallback.directive";
import { ImgFadeDirective } from "./directives/img-fade.directive";
import { ParticlesDirective } from "./directives/particles.directive";
import { RevealDirective } from "./directives/reveal.directive";
import { CustomScrollbarDirective } from "./directives/scrollbar.directive";
import { SHARED_PIPES, SHARED_ZORRO_MODULES } from "./shared-providers";

export const SharedModule = [
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    RouterOutlet,
    HttpClientModule,
    CommonModule,
    NzIconModule,
    NzLayoutModule,
    NzMenuModule,
    GoogleMapsModule,
    RouterModule,
    NgxChartsModule,
    OverlayModule,
    ...SHARED_ZORRO_MODULES,
    ...SHARED_PIPES,
    LottieComponent,
    BooIconComponent,
    PhysioAnimationComponent,

    // #region Directives
    ParticlesDirective,
    CustomScrollbarDirective,
    BooErrorDirective,
    DropdownDirective,
    ImageFallbackDirective,
    AutoAnimateDirective,
    RevealDirective,
    ImgFadeDirective
    // #endregion
];
