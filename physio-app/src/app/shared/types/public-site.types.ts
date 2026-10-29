/** Hero photo a tenant publishes for its home page. Dimensions reserve the space so the page does not shift. */
export interface PublicSiteHero {
    imageUrl: string;
    /** Describes the photo; null marks it decorative. */
    alt: string | null;
    width: number;
    height: number;
    /** Focal point as a 0..1 fraction of the image, so cropping keeps the subject. */
    focalX: number;
    focalY: number;
}

/** The part of the tenant's public profile the home page uses (docs/home-redesign.md, section 17). */
export interface PublicSiteProfile {
    phone: string | null;
    email: string | null;
    hero: PublicSiteHero | null;
}
