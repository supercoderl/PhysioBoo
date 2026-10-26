import { Component } from '@angular/core';
import { BooEmptyStateComponent } from '@physioboo/ui';
import { BooButtonAdminComponent } from "../../../../components/button/boo-button-admin/boo-button-admin.component";
import { AdminContentHeaderComponent } from "../../../../components/layout/admin/content-header/content-header.component";

/** The server exposes no file library API yet, so this page states that instead of showing sample files. */
@Component({
  selector: 'app-file-manager',
  standalone: true,
  imports: [
    AdminContentHeaderComponent,
    BooButtonAdminComponent,
    BooEmptyStateComponent
  ],
  host: { class: 'block h-full min-h-0' },
  templateUrl: './file-manager.component.html',
  styleUrl: './file-manager.component.scss'
})
export class FileManagerComponent { }
