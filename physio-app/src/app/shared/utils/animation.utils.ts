// animations.ts
import { AutoAnimationPlugin } from '@formkit/auto-animate';

export const PHYSIO_BOO_ANIMATION: AutoAnimationPlugin = (
    el,
    action,
    oldCoords,
    newCoords
) => {
    let keyframes: Keyframe[] = [];

    if (action === 'add') {
        keyframes = [
            { transform: 'scale(0.95)', opacity: 0 },
            { transform: 'scale(1)', opacity: 1 }
        ];
        return new KeyframeEffect(el, keyframes, {
            duration: 250,
            easing: 'ease-out'
        });
    }

    if (action === 'remove') {
        if (el instanceof HTMLElement) {
            el.style.zIndex = '-10';
            el.style.pointerEvents = 'none';
        }

        keyframes = [
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(0.9)', opacity: 0 }
        ];

        return new KeyframeEffect(el, keyframes, {
            duration: 250,
            easing: 'ease-in'
        });
    }

    if (action === 'remain') {
        const deltaX = (oldCoords?.left ?? 0) - (newCoords?.left ?? 0);
        const deltaY = (oldCoords?.top ?? 0) - (newCoords?.top ?? 0);

        const start = { transform: `translate(${deltaX}px, ${deltaY}px)` };
        const end = { transform: 'translate(0, 0)' };

        return new KeyframeEffect(el, [start, end], {
            duration: 250,
            easing: 'ease-out'
        });
    }

    return new KeyframeEffect(el, keyframes, { duration: 250, easing: 'ease-out' });
};
