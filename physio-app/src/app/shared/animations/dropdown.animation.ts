import { animate, animation, style, transition, trigger, useAnimation } from '@angular/animations';

const expandAnimation = animation([
    style({ opacity: 0, transform: 'scale(0.95) translateY(-5px)' }),
    animate('150ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
]);

export const dropdownAnimations = [
    trigger('dropdownState', [
        transition(':enter', [
            useAnimation(expandAnimation)
        ]),
    ])
];