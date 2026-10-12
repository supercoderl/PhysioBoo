export enum SubscriptionPlan {
    Free = 0,
    Basic = 1,
    Professional = 2,
    Enterprise = 3
}

export const SUBSCRIPTION_PLAN_LABELS: Record<SubscriptionPlan, string> = {
    [SubscriptionPlan.Free]: 'Free',
    [SubscriptionPlan.Basic]: 'Basic',
    [SubscriptionPlan.Professional]: 'Professional',
    [SubscriptionPlan.Enterprise]: 'Enterprise',
};

/** Falls back to the raw value so an enum member added on the server never renders blank. */
export function subscriptionPlanLabel(plan: SubscriptionPlan | number | string | null | undefined): string {
    if (plan === null || plan === undefined) return '—';
    return SUBSCRIPTION_PLAN_LABELS[plan as SubscriptionPlan] ?? String(plan);
}
