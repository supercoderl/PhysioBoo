/** Formatting and display helpers for the executive dashboard. */

/** Same occupancy threshold the server uses to flag a department as critical. */
export const HIGH_OCCUPANCY_PCT = 90;

const compactCurrency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
});

export function formatCompactCurrency(value: number | null | undefined): string {
    return compactCurrency.format(value ?? 0);
}

/** Percentage (0–100) of `part` in `total`, or null when there is no total to divide by. */
export function percentOf(part: number, total: number): number | null {
    return total > 0 ? Math.round((part / total) * 1000) / 10 : null;
}

/** Clamps a percentage into 0–100 so bars never overflow their track. */
export function clampPct(value: number | null | undefined): number {
    return Math.max(0, Math.min(100, value ?? 0));
}

/** Server averages are 0 when there was nothing to average; show a dash instead of a fake zero. */
export function averageOrDash(value: number | null | undefined, suffix: string): string {
    return value && value > 0 ? `${value}${suffix}` : '—';
}

/** Rounds the largest value of a chart up to a readable axis maximum (at least 1). */
export function niceAxisMax(max: number): number {
    if (max <= 4) return Math.max(1, Math.ceil(max));
    const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
    const step = [1, 2, 2.5, 5, 10].find(s => s * magnitude >= max / 4) ?? 10;
    return Math.ceil(max / (step * magnitude)) * step * magnitude;
}

export interface DashboardTrend {
    pct: number;
    label: string;
}
