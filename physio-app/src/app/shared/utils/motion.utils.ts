/** 'full' normally; 'reduced' when the visitor asked for less motion. Always 'full' during SSR (nothing animates there). */
export type MotionState = 'full' | 'reduced';

export function prefersReducedMotion(): boolean {
    return typeof window !== 'undefined'
        && typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function motionState(): MotionState {
    return prefersReducedMotion() ? 'reduced' : 'full';
}

/** App shells and auth pages keep their existing behaviour; they are not part of the public motion system. */
const NON_PUBLIC = /^\/(admin|superadmin|patient|auth|dev)(\/|\?|#|$)/;

export function isPublicUrl(url: string): boolean {
    return !NON_PUBLIC.test(url);
}
