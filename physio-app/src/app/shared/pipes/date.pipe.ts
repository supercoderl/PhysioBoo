// src/app/shared/pipes/format-date.pipe.ts

import { Pipe, PipeTransform } from '@angular/core';
import { DATE_FORMATS } from '../types/date';
import { DateService } from '../../services/common/date.service';

@Pipe({
    name: 'formatDate',
    standalone: true
})
export class FormatDatePipe implements PipeTransform {

    constructor(private dateSrv: DateService) { }

    transform(value: any, format: string = DATE_FORMATS.DISPLAY_DATE): string {
        if (!value) return '';

        if (format === 'relative') {
            return this.dateSrv.fromNow(value);
        }

        return this.dateSrv.format(value, format);
    }
}