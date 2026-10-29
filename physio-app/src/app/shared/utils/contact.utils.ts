/** `tel:` link for a phone number as people write it ("+84 28 1234 5678", "(028) 1234 5678 ext. 2"). Keeps digits and a leading plus. */
export function telHref(phone: string): string {
    const dialable = phone.split(/ext\.?|x/i)[0].replace(/[^\d+]/g, '');
    return `tel:${dialable.replace(/(?!^)\+/g, '')}`;
}
