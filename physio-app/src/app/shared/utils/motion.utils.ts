/** App shells and auth pages keep their existing behaviour; they are not part of the public motion system. */
const NON_PUBLIC = /^\/(admin|superadmin|patient|auth|dev)(\/|\?|#|$)/;

export function isPublicUrl(url: string): boolean {
    return !NON_PUBLIC.test(url);
}
