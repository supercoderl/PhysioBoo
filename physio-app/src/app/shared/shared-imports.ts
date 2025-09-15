import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SHARED_ZORRO_MODULES } from "./shared-providers";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { HttpClientModule } from "@angular/common/http";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzLayoutModule } from "ng-zorro-antd/layout";
import { NzMenuModule } from "ng-zorro-antd/menu";
import { RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common";
import { LucideAngularModule } from 'lucide-angular';

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
    ...SHARED_ZORRO_MODULES
];
