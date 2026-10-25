/** One colour per payment method, shared by the trend (stacked by method) and the payment-method split. */
export const PAYMENT_METHOD_COLORS: Record<string, string> = {
    Cash: '#E11D48',
    Card: '#10B981',
    Insurance: '#8B5CF6',
    UPI: '#F59E0B',
    Other: '#85757D',
};

/** Methods the trend breaks out on its own; every other method is reported by the backend as "Other". */
export function methodColor(label: string): string {
    return PAYMENT_METHOD_COLORS[label] ?? PAYMENT_METHOD_COLORS['Other'];
}
