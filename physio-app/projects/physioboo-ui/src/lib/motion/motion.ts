import { animate, AnimationTriggerMetadata, group, query, style, transition, trigger } from '@angular/animations';

/**
 * Enter/leave triggers of the public motion system (docs/public-motion-redesign.md).
 * Bind with `[@name]="motion"` where `motion` comes from booMotionState(): 'reduced' keeps a short opacity-only fade.
 */
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_IN = 'cubic-bezier(0.4, 0, 1, 1)';

function fadeTrigger(name: string, from: string, enterMs: number, to: string, leaveMs: number): AnimationTriggerMetadata {
    return trigger(name, [
        transition('void => full', [
            style({ opacity: 0, transform: from }),
            animate(`${enterMs}ms ${EASE_OUT}`, style({ opacity: 1, transform: 'none' })),
        ]),
        transition('full => void', [animate(`${leaveMs}ms ${EASE_IN}`, style({ opacity: 0, transform: to }))]),
        transition('void => reduced', [style({ opacity: 0 }), animate('100ms linear', style({ opacity: 1 }))]),
        transition('reduced => void', [animate('80ms linear', style({ opacity: 0 }))]),
    ]);
}

/** Dropdown menu opening from its top edge (language menu). */
export const booMenuPop = fadeTrigger('menuPop', 'translateY(-6px) scale(0.98)', 180, 'translateY(-4px) scale(0.98)', 120);

/** Full-screen mobile menu panel. */
export const booMenuPanel = fadeTrigger('menuPanel', 'translateY(12px)', 220, 'translateY(8px)', 150);

/** Filter chip appearing / being removed. */
export const booChipPop = fadeTrigger('chipPop', 'scale(0.96)', 180, 'scale(0.96)', 120);

/**
 * Bottom sheet with a backdrop. Put the trigger on the backdrop element and give the sheet the class `drawer-sheet`.
 */
export const booDrawerSheet = trigger('drawerSheet', [
    transition('void => full', [
        style({ opacity: 0 }),
        query('.drawer-sheet', style({ transform: 'translateY(100%)' })),
        group([
            animate(`280ms ${EASE_OUT}`, style({ opacity: 1 })),
            query('.drawer-sheet', animate(`280ms ${EASE_OUT}`, style({ transform: 'translateY(0)' }))),
        ]),
    ]),
    transition('full => void', [
        group([
            animate(`200ms ${EASE_IN}`, style({ opacity: 0 })),
            query('.drawer-sheet', animate(`200ms ${EASE_IN}`, style({ transform: 'translateY(100%)' }))),
        ]),
    ]),
    transition('void => reduced', [style({ opacity: 0 }), animate('100ms linear', style({ opacity: 1 }))]),
    transition('reduced => void', [animate('80ms linear', style({ opacity: 0 }))]),
]);

/** 'full' normally; 'reduced' when the visitor asked for less motion. Always 'full' during SSR (nothing animates there). */
export type BooMotionState = 'full' | 'reduced';

export function booPrefersReducedMotion(): boolean {
    return typeof window !== 'undefined'
        && typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function booMotionState(): BooMotionState {
    return booPrefersReducedMotion() ? 'reduced' : 'full';
}
