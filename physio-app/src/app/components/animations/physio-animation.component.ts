import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { AnimationItem } from "lottie-web";
import { AnimationOptions, LottieComponent } from "ngx-lottie";

export type PhysioAnimationName = 'happy' | 'sad' | 'registration';

const ANIMATION_PATHS: Record<PhysioAnimationName, string> = {
    happy: '/assets/animations/happy.json',
    sad: '/assets/animations/sad.json',
    registration: '/assets/animations/registration.json',
};

@Component({
    selector: 'physio-animation',
    standalone: true,
    imports: [LottieComponent],
    template: `
        <ng-lottie
            [options]="options"
            [width]="size"
            [height]="size"
            (animationCreated)="animationCreated($event)"
        />
    `
})
export class PhysioAnimationComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() name!: PhysioAnimationName;
    @Input() loop: boolean = true;
    @Input() autoplay: boolean = true;
    @Input() size: string = '200px';

    options!: AnimationOptions;
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['name'] || changes['loop'] || changes['autoplay']) {
            this.options = {
                path: ANIMATION_PATHS[this.name],
                loop: this.loop,
                autoplay: this.autoplay
            };
        }
    }
    // #endregion

    // #region Methods
    animationCreated(animationItem: AnimationItem): void { }
    // #endregion
}
