export interface DateItem {
    dayName: string;
    date: string;
    fullDate: Date;
    isActive: boolean;
}

export interface DateRange {
    start: Date | null;
    end: Date | null;
    label?: string;
}

export type RangeType = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom';

export const DATE_FORMATS = {
    DISPLAY_DATE: 'DD/MM/YYYY',
    DISPLAY_DATETIME: 'DD/MM/YYYY HH:mm',
    DISPLAY_TIME: 'HH:mm',
    API_DATE: 'YYYY-MM-DD',
    API_DATETIME: 'YYYY-MM-DDTHH:mm:ss',
    FULL_DATE: 'D MMMM YYYY'
};