import { Component } from '@angular/core';
import { ButtonIconComponent } from "../../../../button/button-icon/button-icon.component";
import { PostCommentComponent } from "../post-comment/post-comment.component";

@Component({
  selector: 'admin-post-card',
  standalone: true,
  imports: [
    ButtonIconComponent, 
    PostCommentComponent
  ],
  templateUrl: './post-card.component.html'
})
export class AdminPostCardComponent {

}
