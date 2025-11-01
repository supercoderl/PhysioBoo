import { Component } from '@angular/core';
import { BooButtonAdminComponent } from "../../../../components/button/boo-button-admin/boo-button-admin.component";
import { AdminContentHeaderComponent } from "../../../../components/layout/admin/content-header/content-header.component";
import { FileItemComponent } from "../../../../components/layout/admin/file-manager/file-item.component";
import { FILES, FOLDERS } from '../../../../shared/data/dummy';
import { SharedModule } from '../../../../shared/shared-imports';

@Component({
  selector: 'app-file-manager',
  standalone: true,
  imports: [
    AdminContentHeaderComponent, 
    BooButtonAdminComponent, 
    FileItemComponent,
    SharedModule
  ],
  templateUrl: './file-manager.component.html',
  styleUrl: './file-manager.component.scss'
})
export class FileManagerComponent {
  // #region Inputs, Outputs, Properties
  folders = FOLDERS;
  files = FILES;
  // #endregion
}
