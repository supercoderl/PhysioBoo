import { Injectable } from '@angular/core';
import dayjs, { Dayjs, OpUnitType, QUnitType } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import isBetween from 'dayjs/plugin/isBetween';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/en';

@Injectable({
    providedIn: 'root',
})
export class DateService {
    constructor() {
        dayjs.extend(customParseFormat);
        dayjs.extend(relativeTime);
        dayjs.extend(isBetween);
        dayjs.extend(utc);
        dayjs.locale('en');
    }

    toDayjs(date: string | Date | Dayjs | null | undefined): Dayjs | null {
        if (!date) return null;
        const d = dayjs(date);
        return d.isValid() ? d : null;
    }

    /**
     * Convert String to Date Object (JS Native)
     * @param dateStr Date string
     * @param format Input string format (VD: 'DD/MM/YYYY')
     */
    parseToDate(dateStr: string, format: string = 'DD/MM/YYYY'): Date | null {
        if (!dateStr) return null;
        const d = dayjs(dateStr, format, true);
        return d.isValid() ? d.toDate() : null;
    }

    format(date: string | Date | Dayjs | null | undefined, formatStr: string = 'DD/MM/YYYY'): string {
        const d = this.toDayjs(date);
        return d ? d.format(formatStr) : '';
    }

    toISOString(date: string | Date | Dayjs): string {
        const d = this.toDayjs(date);
        return d ? d.toISOString() : '';
    }

    add(date: Date | Dayjs, amount: number, unit: dayjs.ManipulateType): Date {
        return dayjs(date).add(amount, unit).toDate();
    }

    subtract(date: Date | Dayjs, amount: number, unit: dayjs.ManipulateType): Date {
        return dayjs(date).subtract(amount, unit).toDate();
    }

    startOf(date: Date | Dayjs, unit: OpUnitType): Date {
        return dayjs(date).startOf(unit).toDate();
    }

    endOf(date: Date | Dayjs, unit: OpUnitType): Date {
        return dayjs(date).endOf(unit).toDate();
    }

    isValid(date: any): boolean {
        return dayjs(date).isValid();
    }

    isSame(date1: any, date2: any, unit: OpUnitType = 'day'): boolean {
        return dayjs(date1).isSame(date2, unit);
    }

    isBefore(date1: any, date2: any): boolean {
        return dayjs(date1).isBefore(date2);
    }

    isAfter(date1: any, date2: any): boolean {
        return dayjs(date1).isAfter(date2);
    }

    fromNow(date: any): string {
        return dayjs(date).fromNow();
    }

    diff(date1: any, date2: any, unit: QUnitType | OpUnitType = 'day', float: boolean = false): number {
        return dayjs(date1).diff(dayjs(date2), unit, float);
    }
}