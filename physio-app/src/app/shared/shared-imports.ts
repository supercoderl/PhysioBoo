import { DragDropModule } from "@angular/cdk/drag-drop";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { GoogleMapsModule } from "@angular/google-maps";
import { RouterModule, RouterOutlet } from "@angular/router";
import { LucideAngularModule } from 'lucide-angular';
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzLayoutModule } from "ng-zorro-antd/layout";
import { NzMenuModule } from "ng-zorro-antd/menu";
import { LottieComponent } from "ngx-lottie";
import { ParticlesDirective } from "./directives/particles.directive";
import { CustomScrollbarDirective } from "./directives/scrollbar.directive";
import { CompletionTextPipe } from "./pipes/completion.pipe";
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
    LucideAngularModule, 
    GoogleMapsModule,
    ParticlesDirective,
    CustomScrollbarDirective,
    RouterModule,
    LucideAngularModule,
    ...SHARED_ZORRO_MODULES,
    CompletionTextPipe,
    ...SHARED_PIPES,
    LottieComponent
];
