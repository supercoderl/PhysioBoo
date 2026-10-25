import { RevenueReportFilter } from "../../../../../shared/types/filter.types";

export type RevenuePreset = 'today' | '7d' | '30d' | 'month' | 'quarter';

/** A Daily range longer than this would draw hundreds of bars; the toolbar asks for Weekly or Monthly instead. */
export const MAX_DAILY_RANGE_DAYS = 366;

/** Local calendar date as yyyy-MM-dd. `toISOString()` is avoided: it converts to UTC and can send yesterday's date. */
export function toLocalIsoDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
}

export function presetRange(preset: RevenuePreset, today = new Date()): { start: string; end: string } {
    const start = new Date(today);
    switch (preset) {
        case '7d': start.setDate(today.getDate() - 6); break;
        case '30d': start.setDate(today.getDate() - 29); break;
        case 'month': start.setDate(1); break;
        case 'quarter': start.setMonth(Math.floor(today.getMonth() / 3) * 3, 1); break;
    }
    return { start: toLocalIsoDate(start), end: toLocalIsoDate(today) };
}

export function defaultRevenueFilter(): RevenueReportFilter {
    return { ...presetRange('30d'), granularity: 'day' };
}

/** The preset whose range equals the filter's dates, or null for a custom range. */
export function activePreset(filter: RevenueReportFilter): RevenuePreset | null {
    const presets: RevenuePreset[] = ['today', '7d', '30d', 'month', 'quarter'];
    return presets.find(p => {
        const range = presetRange(p);
        return range.start === filter.start && range.end === filter.end;
    }) ?? null;
}

/** Message for a filter the report cannot be requested with, or null when it is valid. */
export function revenueFilterError(filter: RevenueReportFilter): string | null {
    if (!filter.start || !filter.end) return 'Choose both a start and an end date.';
    if (filter.start > filter.end) return 'The start date must be on or before the end date.';

    if (filter.granularity === 'day') {
        const days = (Date.parse(filter.end) - Date.parse(filter.start)) / 86_400_000 + 1;
        if (days > MAX_DAILY_RANGE_DAYS) {
            return `Daily view supports up to ${MAX_DAILY_RANGE_DAYS} days. Choose Weekly or Monthly, or shorten the range.`;
        }
    }
    return null;
}

/** Stable identity of a filter, used to skip identical requests and to tell which filter a section's data belongs to. */
export function revenueFilterKey(filter: RevenueReportFilter): string {
    const list = (values?: string[]) => [...(values ?? [])].sort();
    return JSON.stringify([
        filter.start, filter.end, filter.granularity,
        list(filter.departmentIds), list(filter.doctorIds), list(filter.paymentMethods), list(filter.insuranceProviderIds),
        (filter.search ?? '').trim(),
    ]);
}
