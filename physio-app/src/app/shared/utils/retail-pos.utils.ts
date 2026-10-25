import { RetailCart } from "../types/retail-pos.types";

export interface RetailCartTotals {
    subtotal: number;
    discountTotal: number;
    insuranceCoverage: number;
    grandTotal: number;
    itemCount: number;
}

/**
 * Mirrors the arithmetic the API applies at checkout (CheckoutCartCommandHandler): no VAT is charged, and insurance
 * coverage is whatever the cart lines carry. The server stays authoritative; this only previews it before checkout.
 */
export function retailCartTotals(cart: RetailCart | null): RetailCartTotals {
    const items = cart?.items ?? [];
    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const discountTotal = items.reduce((sum, i) => sum + (i.unitPrice * i.quantity * i.discountPercent) / 100, 0);
    const insuranceCoverage = items.reduce((sum, i) => sum + i.insuranceCoveredAmount, 0);
    return {
        subtotal,
        discountTotal,
        insuranceCoverage,
        grandTotal: subtotal - discountTotal - insuranceCoverage,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    };
}

export function formatRetailMoney(amount: number | null | undefined): string {
    return `$${(amount ?? 0).toFixed(2)}`;
}

export function roundMoney(amount: number): number {
    return Math.round(amount * 100) / 100;
}
