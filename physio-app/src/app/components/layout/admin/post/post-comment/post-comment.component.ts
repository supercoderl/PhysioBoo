import { Component } from '@angular/core';
import { SharedModule } from '../../../../../shared/shared-imports';
import { ButtonIconComponent } from "../../../../button/button-icon/button-icon.component";
import { BooIconComponent } from "../../../../icon/boo-icon/boo-icon.component";

@Component({
  selector: 'admin-post-comment',
  standalone: true,
  imports: [
    BooIconComponent, 
    ButtonIconComponent, 
    SharedModule
  ],
  templateUrl: './post-comment.component.html'
})
export class PostCommentComponent {

}
